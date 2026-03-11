"use client";

import { useState } from "react";

interface MpesaCheckoutProps {
  totalAmount: number;
  onCancel: () => void;
}

export default function MpesaCheckout({ totalAmount, onCancel }: MpesaCheckoutProps) {
  const [phone, setPhone] = useState("2547");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Triggering your FastAPI engine with the accumulated cart total!
      const response = await fetch(
        `http://127.0.0.1:8000/api/payments/stk-push?phone_number=${phone}&amount=${totalAmount}`,
        {
          method: "POST",
          headers: {
            "Accept": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Success! Check your phone to enter your M-Pesa PIN.");
      } else {
        setMessage(`❌ Error: ${data.detail || "Payment failed to initiate."}`);
      }
    } catch (error) {
      setMessage("❌ Error: Could not connect to the backend server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-green-200 mt-8 w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">M-Pesa Checkout</h3>
        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
          Total: KES {totalAmount}
        </span>
      </div>

      <form onSubmit={handlePayment} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Safaricom Phone Number
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="2547XXXXXXXX"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-black"
            required
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || totalAmount <= 0}
            className={`flex-1 py-3 rounded-lg text-white font-bold transition-colors ${
              loading || totalAmount <= 0 ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Sending Prompt..." : `Pay KES ${totalAmount}`}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded-lg text-sm text-center font-medium ${
          message.includes("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}