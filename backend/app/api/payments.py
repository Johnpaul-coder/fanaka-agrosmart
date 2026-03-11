from fastapi import APIRouter, HTTPException, Request
import requests
import base64
import os
from datetime import datetime
from dotenv import load_dotenv

# Load the keys from your .env safe
load_dotenv()

router = APIRouter()

def get_mpesa_access_token():
    url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    consumer_key = os.getenv("MPESA_CONSUMER_KEY")
    consumer_secret = os.getenv("MPESA_CONSUMER_SECRET")
    
    response = requests.get(url, auth=(consumer_key, consumer_secret))
    
    try:
        data = response.json()
        return data.get("access_token")
    except Exception:
        raise HTTPException(status_code=500, detail="Daraja Auth Failed. Check your terminal.")

@router.post("/stk-push")
def stk_push(phone_number: str, amount: int):
    access_token = get_mpesa_access_token()
    
    if not access_token:
        raise HTTPException(status_code=500, detail="Failed to get M-Pesa access token.")

    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    shortcode = os.getenv("MPESA_SHORTCODE")
    passkey = os.getenv("MPESA_PASSKEY")
    callback_url = os.getenv("CALLBACK_BASE_URL")

    # Generate the base64 password Safaricom requires
    password_str = shortcode + passkey + timestamp
    password = base64.b64encode(password_str.encode()).decode()

    headers = {"Authorization": f"Bearer {access_token}"}
    
    payload = {
        "BusinessShortCode": shortcode,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": amount,
        "PartyA": phone_number,
        "PartyB": shortcode,
        "PhoneNumber": phone_number,
        "CallBackURL": callback_url,
        "AccountReference": "FanakaAgrosmart",
        "TransactionDesc": "Crop Scan Payment"
    }

    response = requests.post(
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        json=payload,
        headers=headers
    )
    
    # Terminal debugger so Daraja can't hide errors from you
    print("\n" + "="*40)
    print("📲 SAFARICOM STK PUSH REPLY 📲")
    print(f"Status: {response.status_code}")
    print(f"Message: {response.text}")
    print("="*40 + "\n")
    
    try:
        return response.json()
    except Exception:
        raise HTTPException(status_code=500, detail="STK Push failed. Check terminal for details.")

# ==========================================
# NEW: THE CALLBACK CATCHER (DIGITAL RECEIPT)
# ==========================================
@router.post("/callback")
async def mpesa_callback(request: Request):
    """
    Safaricom will automatically send the payment receipt to this endpoint
    after the user enters their PIN on their phone.
    """
    # Grab the receipt data from Safaricom
    receipt_data = await request.json()
    
    # Terminal debugger to show the receipt in your backend terminal
    print("\n" + "="*50)
    print("💰 SAFARICOM M-PESA RECEIPT RECEIVED 💰")
    print(receipt_data)
    print("="*50 + "\n")
    
    # You MUST return this exact message to Safaricom so they know you received it
    return {
        "ResultCode": 0, 
        "ResultDesc": "Accepted"
    }