import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="Customer Segmentation Inference API")

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