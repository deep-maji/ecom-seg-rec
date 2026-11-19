from fastapi import APIRouter, HTTPException
from db import supabase  # Initialized Supabase Client from backend/db.py

router = APIRouter(prefix="/api", tags=["User"])


@router.get("/user/{clerk_user_id}")
def get_user_profile(clerk_user_id: str):
    res = (
        supabase.table("app_users")
        .select(
            "clerk_user_id, email, full_name, role, "
            "cluster_id, segment_name, total_orders, total_spent, "
            "last_order_at, created_at, updated_at"
        )
        .eq("clerk_user_id", clerk_user_id)
        .limit(1)
        .execute()
    )

    if not res.data:
        raise HTTPException(status_code=404, detail="User profile not found.")

    return res.data[0]