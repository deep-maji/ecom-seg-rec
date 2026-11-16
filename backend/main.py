from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI()

class Item(BaseModel):
    name: str
    description: str
    price: float
    tags: List[str] = []


@app.get("/")
async def read_root():
    return {"Hello": "World"}

@app.get("/items")
async def read_items():
    return {"items": []}

@app.post("/items/")
async def create_item(item: Item):
    return {"item": item}