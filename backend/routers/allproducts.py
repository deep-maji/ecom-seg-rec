from fastapi import APIRouter
from db import supabase  # Initialized Supabase Client from backend/db.py

router = APIRouter(prefix="/api", tags=["Products"])

PRODUCT_FIELDS = (
    "product_id, display_name, description, image_url, "
    "category_en, price, avg_rating, purchase_count, popularity_score, created_at"
)


@router.get("/products")
def get_all_products():
    res = (
        supabase.table("products")
        .select(PRODUCT_FIELDS)
        .order("popularity_score", desc=True)
        .execute()
    )
    products = res.data or []

    return {
        "count": len(products),
        "products": products,
    }