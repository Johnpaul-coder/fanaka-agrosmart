"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // NEW: For secure redirects
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  
  // Security States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // NEW: Prevents screen flickering
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [farmers, setFarmers] = useState([]);

  // Check if we already have a key in our browser memory when the page loads
  useEffect(() => {
    setIsMounted(true);
    const savedToken = localStorage.getItem("fanaka_admin_token");
    if (savedToken === "fanaka-super-secret-token-8899") {
      setIsAuthenticated(true);
      fetchFarmers();
    }
    setIsLoading(false); // Stop loading once memory check is done
  }, []);

  const fetchFarmers = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/farmers");
      if (response.ok) {
        const data = await response.json();
        setFarmers(data);
      }
    } catch (error) {
      console.error("Failed to fetch farmers", error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("fanaka_admin_token", data.access_token);
        setIsAuthenticated(true);
        fetchFarmers();
      } else {
        setLoginError("Access Denied: Incorrect username or password.");
      }
    } catch (error) {
      setLoginError("Failed to connect to the backend engine.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("fanaka_admin_token");
    setIsAuthenticated(false);
    setFarmers([]);
    router.push("/"); // NEW: Teleport the user back to the homepage!
  };

  // NEW: Show a loading screen while checking memory
  if (!isMounted || isLoading) {
    return (
      <div style={{ padding: '100px', textAlign: 'center', fontFamily: 'sans-serif', color: '#666' }}>
        <h2>Checking Security Credentials...</h2>
      </div>
    );
  }

  // ==========================================
  // VIEW 1: THE LOCKED DOOR (LOGIN SCREEN)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div style={{ padding: '80px 20px', fontFamily: 'sans-serif', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '50px', marginBottom: '10px' }}>🔒</div>
        <h1 style={{ color: '#d32f2f', margin: '0 0 10px 0' }}>Restricted Area</h1>
        <p style={{ color: '#555', marginBottom: '30px' }}>Fanaka AGROSMART Management</p>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
          <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>Username</label>
          <input 
            type="text" 
            placeholder="Admin Username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '5px' }}
          />
          <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>Password</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '5px' }}
          />
          <button 
            type="submit" 
            style={{ padding: '14px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginTop: '5px' }}>
            Unlock Dashboard
          </button>
        </form>

        {loginError && <p style={{ color: '#d32f2f', marginTop: '15px', fontWeight: 'bold' }}>{loginError}</p>}
        
        <div style={{ marginTop: '30px' }}>
          <Link href="/" style={{ color: '#0066cc', textDecoration: 'none' }}>&larr; Back to Public Homepage</Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: THE UNLOCKED DASHBOARD (NEW TABLE LAYOUT)
  // ==========================================
  return (
    <div style={{ padding: '50px 20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '20px' }}>
        <div>
          <h1 style={{ color: '#2e7d32', margin: 0 }}>Admin Dashboard</h1>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Logged in securely.</p>
        </div>
        <div>
          <button onClick={handleLogout} style={{ padding: '10px 20px', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            Secure Logout
          </button>
        </div>
      </header>
      
      <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
        <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Registered Farmers List</h2>
        
        {farmers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <p>No farmers found in the database.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee', backgroundColor: '#fafafa' }}>
                  <th style={{ padding: '15px 12px', color: '#555' }}>Full Name</th>
                  <th style={{ padding: '15px 12px', color: '#555' }}>Phone Number</th>
                  <th style={{ padding: '15px 12px', color: '#555' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {farmers.map((farmer: any) => (
                  <tr key={farmer.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '15px 12px', fontWeight: '500', color: '#333' }}>{farmer.full_name}</td>
                    <td style={{ padding: '15px 12px', color: '#666', fontFamily: 'monospace', fontSize: '14px' }}>{farmer.phone_number}</td>
                    <td style={{ padding: '15px 12px' }}>
                       <span style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}