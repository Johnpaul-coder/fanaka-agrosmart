from fastapi import APIRouter

router = APIRouter()

@router.get("/items")
async def get_marketplace_items():
    # Example data that will eventually come from product_model.py
    return [
        {"id": 1, "name": "Maize Seeds", "price": 800, "category": "Input"},
        {"id": 2, "name": "Tomato Fertilizer", "price": 1200, "category": "Input"}
    ]

@router.post("/sell")
async def list_produce(crop_name: str, quantity: int):
    return {"message": f"Listed {quantity}kg of {crop_name} for Fanaka Hub inspection"}