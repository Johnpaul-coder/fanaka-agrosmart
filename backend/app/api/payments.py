from fastapi import APIRouter

router = APIRouter()

@router.post("/stk-push")
async def trigger_mpesa(phone: str, amount: int):
    # This is the placeholder logic for Safaricom M-Pesa Daraja API
    return {
        "status": "Request Sent",
        "phone": phone,
        "amount": amount,
        "instruction": "Please enter your M-Pesa PIN on your phone"
    }