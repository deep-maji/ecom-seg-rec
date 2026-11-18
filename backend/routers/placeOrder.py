from datetime import datetime, timezone
from pathlib import Path
from typing import List

import joblib
import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from db import supabase  # Imports Supabase Client from backend/db.py

router = APIRouter(prefix="/api", tags=["Checkout"])

# Resolve path: backend/routers/placeOrder.py -> backend/customer_segmentation_bundle.pkl
BUNDLE_PATH = Path(__file__).resolve().parents[1] / "customer_segmentation_bundle.pkl"
bundle = joblib.load(BUNDLE_PATH)
scaler = bundle["scaler"]
kmeans_model = bundle["kmeans_model"]
segment_map = bundle["segment_map"]


class CheckoutItem(BaseModel):
    product_id: str
    quantity: int = Field(..., gt=0)
    unit_price: float = Field(..., ge=0)


class CheckoutRequest(BaseModel):
    clerk_user_id: str
    email: str
    full_name: str | None = None
    items: List[CheckoutItem] = Field(..., min_length=1)


@router.post("/checkout")
def simulated_checkout(payload: CheckoutRequest):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Cart items cannot be empty.")

    total_amount = round(
        sum(item.quantity * item.unit_price for item in payload.items), 2
    )
    now_iso = datetime.now(timezone.utc).isoformat()

    # 1. Fetch existing user or create a Cold-Start record in app_users
    user_res = (
        supabase.table("app_users")
        .select("clerk_user_id, total_orders, total_spent")
        .eq("clerk_user_id", payload.clerk_user_id)
        .limit(1)
        .execute()
    )

    if user_res.data:
        prev_orders = int(user_res.data[0].get("total_orders") or 0)
        prev_spent = float(user_res.data[0].get("total_spent") or 0.0)
    else:
        insert_user_res = (
            supabase.table("app_users")
            .insert(
                {
                    "clerk_user_id": payload.clerk_user_id,
                    "email": payload.email,
                    "full_name": payload.full_name,
                }
            )
            .execute()
        )
        if not insert_user_res.data:
            raise HTTPException(
                status_code=500, detail="Failed to initialize user record."
            )
        prev_orders = 0
        prev_spent = 0.0

    # 2. Insert simulated order into app_orders
    order_res = (
        supabase.table("app_orders")
        .insert(
            {
                "clerk_user_id": payload.clerk_user_id,
                "total_amount": total_amount,
                "order_status": "simulated_delivered",
            }
        )
        .execute()
    )
    if not order_res.data:
        raise HTTPException(status_code=500, detail="Failed to create simulated order.")

    order_id = order_res.data[0]["order_id"]

    # 3. Insert line items into app_order_items
    order_items_payload = [
        {
            "order_id": order_id,
            "product_id": item.product_id,
            "quantity": item.quantity,
            "unit_price": round(item.unit_price, 2),
        }
        for item in payload.items
    ]
    items_res = (
        supabase.table("app_order_items").insert(order_items_payload).execute()
    )
    if not items_res.data:
        raise HTTPException(status_code=500, detail="Failed to save order line items.")

    # 4. Compute updated RFM values & predict K-Means cluster (Recency = 0 days)
    new_total_orders = prev_orders + 1
    new_total_spent = round(prev_spent + total_amount, 2)

    features_df = pd.DataFrame(
        [
            {
                "recency": 0,
                "frequency_log": np.log1p(new_total_orders),
                "monetary_log": np.log1p(new_total_spent),
            }
        ]
    )
    scaled_features = scaler.transform(features_df)
    new_cluster_id = int(kmeans_model.predict(scaled_features)[0])
    new_segment_name = segment_map.get(new_cluster_id, "Recent Budget Shoppers")

    # 5. Update RFM metrics and ML segment in app_users
    supabase.table("app_users").update(
        {
            "cluster_id": new_cluster_id,
            "segment_name": new_segment_name,
            "total_orders": new_total_orders,
            "total_spent": new_total_spent,
            "last_order_at": now_iso,
            "updated_at": now_iso,
        }
    ).eq("clerk_user_id", payload.clerk_user_id).execute()

    return {
        "order_id": order_id,
        "clerk_user_id": payload.clerk_user_id,
        "total_amount": total_amount,
        "order_status": "simulated_delivered",
        "cluster_id": new_cluster_id,
        "segment_name": new_segment_name,
        "total_orders": new_total_orders,
        "total_spent": new_total_spent,
    }