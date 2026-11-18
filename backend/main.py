from typing import Optional

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel, Field
from routers import placeOrder
from db import supabase
from routers.webhooks import router as webhook_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Customer Segmentation Inference API")

# List of allowed frontend origins
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows your Vite frontend
    allow_credentials=True,  # Required if sending cookies or Authorization headers
    allow_methods=["*"],  # Allows GET, POST, PUT, DELETE, OPTIONS, etc.
    allow_headers=["*"],  # Allows all headers
)

# Load the pickle bundle once at startup
bundle = joblib.load("customer_segmentation_bundle.pkl")
scaler = bundle["scaler"]
kmeans_model = bundle["kmeans_model"]
segment_map = bundle["segment_map"]

class CustomerRFMInput(BaseModel):
    recency_days: int = Field(..., ge=0, description="Days since customer's last purchase")
    frequency: int = Field(..., ge=1, description="Total number of completed orders")
    monetary: float = Field(..., gt=0, description="Total monetary spend across all orders")

class SegmentPredictionResponse(BaseModel):
    cluster_id: int
    segment_name: str
    recency_days: int
    frequency: int
    monetary: float

app.include_router(
    webhook_router,
    prefix="/api/webhooks",
    tags=["Webhooks"]
)

app.include_router(placeOrder.router)

@app.get("/")
def root():
    return {"message": "Welcome to the Customer Segmentation Inference API!"}



# Test customer segmentation prediction endpoint
@app.post("/api/predict-segment", response_model=SegmentPredictionResponse)
def predict_customer_segment(payload: CustomerRFMInput):
    # 1. Apply the exact same feature transformations used in training
    input_df = pd.DataFrame([{
        "recency": payload.recency_days,
        "frequency_log": np.log1p(payload.frequency),
        "monetary_log": np.log1p(payload.monetary)
    }])

    # 2. Scale features & predict cluster
    scaled_features = scaler.transform(input_df)
    cluster_id = int(kmeans_model.predict(scaled_features)[0])
    segment_name = segment_map.get(cluster_id, "Unclassified")

    return SegmentPredictionResponse(
        cluster_id=cluster_id,
        segment_name=segment_name,
        recency_days=payload.recency_days,
        frequency=payload.frequency,
        monetary=round(payload.monetary, 2)
    )


# Product recommendation endpoint test
PRODUCT_FIELDS = "product_id, display_name, description, image_url, category_en, price, avg_rating, popularity_score"


@app.get("/api/recommendations/{clerk_user_id}")
def get_personalized_recommendations(
    clerk_user_id: Optional[str] = None,
    limit: int = 6
):
    # 0. Guest / Logged-Out User -> Skip user lookup and serve Cold-Start Best-Sellers
    if not clerk_user_id or clerk_user_id == "guest":
        res = (
            supabase.table("products")
            .select(PRODUCT_FIELDS)
            .order("popularity_score", desc=True)
            .limit(limit)
            .execute()
        )
        products = res.data or []
        for item in products:
            item["reason"] = "Trending & Popular"

        return {
            "clerk_user_id": None,
            "segment_name": "Guest (Cold-Start)",
            "recommendations": products,
        }

    # 2. Logged-In User -> Fetch ML segment from Supabase app_users
    user_res = (
        supabase.table("app_users")
        .select("segment_name")
        .eq("clerk_user_id", clerk_user_id)
        .limit(1)
        .execute()
    )
    segment = (
        user_res.data[0]["segment_name"]
        if user_res.data
        else "New Customer (Cold-Start)"
    )

    # 1. Fetch the user's ML segment from Supabase app_users
    user_res = (
        supabase.table("app_users")
        .select("segment_name")
        .eq("clerk_user_id", clerk_user_id)
        .limit(1)
        .execute()
    )
    segment = (
        user_res.data[0]["segment_name"]
        if user_res.data
        else "New Customer (Cold-Start)"
    )

    # 2. Fetch categories from the user's past orders (used for Loyal & Dormant segments)
    past_categories = []
    if segment in ("Loyal Repeat Buyers", "Dormant / At-Risk Buyers"):
        orders_res = (
            supabase.table("app_orders")
            .select("order_id")
            .eq("clerk_user_id", clerk_user_id)
            .execute()
        )
        order_ids = [row["order_id"] for row in (orders_res.data or [])]

        if order_ids:
            items_res = (
                supabase.table("app_order_items")
                .select("product_id, products(category_en)")
                .in_("order_id", order_ids)
                .execute()
            )
            past_categories = list({
                row["products"]["category_en"]
                for row in (items_res.data or [])
                if row.get("products") and row["products"].get("category_en")
            })

    # 3. Query the products table based on the customer segment
    products = []
    reason = "Trending & Popular"

    if segment == "Recent Budget Shoppers":
        reason = "Budget-Friendly Picks"
        res = (
            supabase.table("products")
            .select(PRODUCT_FIELDS)
            .order("price", desc=False)
            .order("popularity_score", desc=True)
            .limit(limit)
            .execute()
        )
        products = res.data or []

    elif segment == "High-Value Recent Buyers":
        reason = "Premium & Top-Rated For You"
        res = (
            supabase.table("products")
            .select(PRODUCT_FIELDS)
            .order("price", desc=True)
            .order("avg_rating", desc=True)
            .limit(limit)
            .execute()
        )
        products = res.data or []

    elif segment == "Loyal Repeat Buyers" and past_categories:
        # Cross-sell: products in categories they haven't bought yet
        reason = "Explore New Categories"
        cat_filter = f"({','.join(past_categories)})"
        res = (
            supabase.table("products")
            .select(PRODUCT_FIELDS)
            .not_.in_("category_en", past_categories)
            .order("popularity_score", desc=True)
            .limit(limit)
            .execute()
        )
        products = res.data or []

    elif segment == "Dormant / At-Risk Buyers" and past_categories:
        # Win-back: top-rated items in categories they previously purchased
        reason = "Top Picks in Your Favorite Categories"
        res = (
            supabase.table("products")
            .select(PRODUCT_FIELDS)
            .in_("category_en", past_categories)
            .order("avg_rating", desc=True)
            .order("popularity_score", desc=True)
            .limit(limit)
            .execute()
        )
        products = res.data or []

    # 4. Fallback for "New Customer (Cold-Start)" or if a filtered query returned empty
    if not products:
        reason = "Trending & Popular"
        res = (
            supabase.table("products")
            .select(PRODUCT_FIELDS)
            .order("popularity_score", desc=True)
            .limit(limit)
            .execute()
        )
        products = res.data or []

    # Attach the recommendation badge/reason to each item
    for item in products:
        item["reason"] = reason

    return {
        "clerk_user_id": clerk_user_id,
        "segment_name": segment,
        "recommendations": products,
    }