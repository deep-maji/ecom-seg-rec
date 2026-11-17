import os
import json
import logging

from pathlib import Path
from dotenv import load_dotenv

from fastapi import APIRouter, HTTPException, Request
from svix.webhooks import Webhook, WebhookVerificationError

from db import supabase

# Load backend/.env
load_dotenv(Path(__file__).resolve().parents[1] / ".env")

router = APIRouter()
logger = logging.getLogger(__name__)

WEBHOOK_SECRET = os.getenv("CLERK_WEBHOOK_SIGNING_SECRET")


def get_primary_email(user_data: dict) -> str | None:
    emails = user_data.get("email_addresses", [])
    primary_id = user_data.get("primary_email_address_id")

    for item in emails:
        if item.get("id") == primary_id:
            return item.get("email_address")

    return None


@router.post("/clerk")
async def clerk_webhook(request: Request):

    # 1. Check configuration
    if not WEBHOOK_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Clerk webhook secret not configured"
        )

    # 2. Get original request body
    body = await request.body()

    # 3. Verify signature
    try:
        Webhook(WEBHOOK_SECRET).verify(
            body,
            dict(request.headers)
        )

    except WebhookVerificationError:
        raise HTTPException(
            status_code=400,
            detail="Invalid webhook signature"
        )

    # 4. Decode JSON separately
    try:
        event = json.loads(body)

    except json.JSONDecodeError:
        raise HTTPException(
            status_code=400,
            detail="Invalid JSON payload"
        )

    if not isinstance(event, dict):
        raise HTTPException(
            status_code=400,
            detail="Invalid webhook event"
        )

    event_type = event.get("type")
    user_data = event.get("data") or {}

    logger.info("Received Clerk event: %s", event_type)

    try:

        # USER CREATED / UPDATED
        if event_type in ["user.created", "user.updated"]:

            clerk_user_id = user_data.get("id")

            if not clerk_user_id:
                raise HTTPException(
                    status_code=400,
                    detail="Missing Clerk user ID"
                )

            email = get_primary_email(user_data)

            if not email:
                logger.warning(
                    "No primary email for user %s",
                    clerk_user_id
                )
                return {
                    "success": True,
                    "message": "User has no primary email"
                }

            first_name = user_data.get("first_name") or ""
            last_name = user_data.get("last_name") or ""

            full_name = f"{first_name} {last_name}".strip()

            user = {
                "clerk_user_id": clerk_user_id,
                "email": email,
                "full_name": full_name or None,
            }

            # Upsert without overwriting ML segmentation fields
            supabase.table("app_users").upsert(
                user,
                on_conflict="clerk_user_id"
            ).execute()

            logger.info(
                "Successfully synced user: %s",
                clerk_user_id
            )

        # USER DELETED
        elif event_type == "user.deleted":
            logger.info(
                "Clerk user deleted: %s",
                user_data.get("id")
            )

        else:
            logger.info("Ignoring unsupported event: %s", event_type)

        return {
            "success": True,
            "event": event_type
        }

    except HTTPException:
        raise

    except Exception:
        logger.exception("Clerk webhook processing failed")

        raise HTTPException(
            status_code=500,
            detail="Webhook processing failed"
        )
