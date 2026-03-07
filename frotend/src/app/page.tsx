"use client";
import { useState } from 'react';

export default function Home() {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Sending to backend...");
    
    try {
      // This is where the magic happens: pointing your frontend to your Python engine!
      const response = await fetch("http://127.0.0.1:8000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          phone_number: phoneNumber,
          role: "farmer"
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`Success! Saved to database with ID: ${data.id}`);
        setFullName(""); // Clears the box
        setPhoneNumber(""); // Clears the box
      } else {
        setMessage("Error: That phone number might already be registered!");
      }
    } catch (error) {
      setMessage("Failed to connect to the backend engine.");
    }
  };

  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif', maxWidth: '400px', margin: '0 auto' }}>
      <h1 style={{ color: '#2e7d32', marginBottom: '20px' }}>Fanaka AGROSMART</h1>
      <h2>Register New Farmer</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        <input 
          type="text" 
          placeholder="Full Name" 
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '5px' }}
        />
        <input 
          type="text" 
          placeholder="Phone Number (e.g. 07...)" 
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
          style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '5px' }}
        />
        <button 
          type="submit" 
          style={{ padding: '12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          Register Farmer
        </button>
      </form>

      {message && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e8f5e9', borderLeft: '5px solid #4CAF50' }}>
          {message}
        </div>
      )}
    </div>
  );
}