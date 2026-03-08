"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Sending to backend...");
    
    try {
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
        setFullName(""); 
        setPhoneNumber(""); 
      } else {
        setMessage("Error: That phone number might already be registered!");
      }
    } catch (error) {
      setMessage("Failed to connect to the backend engine.");
    }
  };

  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif', maxWidth: '400px', margin: '0 auto' }}>
      <h1 style={{ color: '#2e7d32', marginBottom: '10px', textAlign: 'center' }}>Fanaka AGROSMART</h1>
      <h2 style={{ textAlign: 'center', color: '#555', marginBottom: '30px' }}>Farmer Registration</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="text" 
          placeholder="Full Name" 
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '16px' }}
        />
        <input 
          type="text" 
          placeholder="Phone Number (e.g. 07...)" 
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
          style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '16px' }}
        />
        <button 
          type="submit" 
          style={{ padding: '14px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
          Join Agrosmart
        </button>
      </form>

      {message && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e8f5e9', borderLeft: '5px solid #4CAF50' }}>
          {message}
        </div>
      )}

      {/* A tiny link at the bottom for you to access your dashboard */}
      <div style={{ marginTop: '40px', textAlign: 'center' }}>
         <Link href="/admin" style={{ color: '#aaa', textDecoration: 'none', fontSize: '12px' }}>Admin Dashboard &rarr;</Link>
      </div>
    </div>
  );
}