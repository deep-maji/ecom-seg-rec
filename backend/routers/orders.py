from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from db import supabase  # Initialized Supabase Client from backend/db.py

router = APIRouter(prefix="/api", tags=["Orders"])


class OrderResponse(BaseModel):
    clerk_user_id: str
    order_count: int
    orders: List[Dict[str, Any]]


@router.get(
    "/orders/{clerk_user_id}",
    response_model=OrderResponse,
    summary="Get user orders",
)
def get_user_orders(clerk_user_id: str):
    if not clerk_user_id.strip():
        raise HTTPException(status_code=400, detail="clerk_user_id cannot be empty.")

    try:
        res = (
            supabase.table("app_orders")
            .select(
                "order_id, total_amount, order_status, created_at, "
                "app_order_items(item_id, product_id, quantity, unit_price, "
                "products(display_name, image_url, category_en))"
            )
            .eq("clerk_user_id", clerk_user_id)
            .order("created_at", desc=True)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail="Unable to retrieve order history from the database.",
        ) from exc

    orders = res.data or []
    return OrderResponse(
        clerk_user_id=clerk_user_id,
        order_count=len(orders),
        orders=orders,
    )