'use client';

import { useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'register' | 'login';
type MsgType = 'success' | 'error' | '';

export default function AuthModal({ isOpen, onClose }: Props) {
  const [tab, setTab]               = useState<Tab>('register');

  // Register fields
  const [regName, setRegName]       = useState('');
  const [regPhone, setRegPhone]     = useState('');
  const [regRole, setRegRole]       = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regMsg, setRegMsg]         = useState('');
  const [regMsgType, setRegMsgType] = useState<MsgType>('');
  const [regLoading, setRegLoading] = useState(false);

  // Login fields
  const [loginId, setLoginId]           = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginMsg, setLoginMsg]         = useState('');
  const [loginMsgType, setLoginMsgType] = useState<MsgType>('');
  const [loginLoading, setLoginLoading] = useState(false);

  function handleClose() {
    onClose();
    // Reset messages
    setRegMsg(''); setRegMsgType('');
    setLoginMsg(''); setLoginMsgType('');
  }

  function handleOverlay(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) handleClose();
  }

  // ── REGISTER ────────────────────────────────────────────
  async function handleRegister() {
    if (!regName || !regPhone || !regRole || !regPassword) {
      setRegMsg('Please fill in all fields.'); setRegMsgType('error'); return;
    }
    if (regPassword.length < 6) {
      setRegMsg('Password must be at least 6 characters.'); setRegMsgType('error'); return;
    }

    setRegLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: regName,
          phone_number: regPhone,
          role: regRole,
          password: regPassword,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setRegMsg('✅ Account created! Welcome to Fanaka.');
        setRegMsgType('success');
        setRegName(''); setRegPhone(''); setRegRole(''); setRegPassword('');
        setTimeout(handleClose, 2000);
      } else {
        setRegMsg('❌ ' + (data.detail || 'Registration failed. Try again.'));
        setRegMsgType('error');
      }
    } catch {
      setRegMsg('❌ Could not reach the server. Is your backend running?');
      setRegMsgType('error');
    }
    setRegLoading(false);
  }

  // ── LOGIN ────────────────────────────────────────────────
  async function handleLogin() {
    if (!loginId || !loginPassword) {
      setLoginMsg('Please fill in all fields.'); setLoginMsgType('error'); return;
    }

    setLoginLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: loginId, password: loginPassword }),
      });
      const data = await res.json();

      if (res.ok) {
        setLoginMsg(`✅ Welcome back, ${data.user.full_name}!`);
        setLoginMsgType('success');
        localStorage.setItem('fanaka_token', data.access_token);
        localStorage.setItem('fanaka_user', JSON.stringify(data.user));
        setTimeout(() => { window.location.href = '/dashboard'; }, 1500);
      } else {
        setLoginMsg('❌ ' + (data.detail || 'Invalid credentials.'));
        setLoginMsgType('error');
      }
    } catch {
      setLoginMsg('❌ Could not reach the server. Is your backend running?');
      setLoginMsgType('error');
    }
    setLoginLoading(false);
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay open" onClick={handleOverlay}>
      <div className="modal">
        <button className="modal-close" onClick={handleClose}>✕</button>

        {/* Logo */}
        <div className="modal-logo">
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
            <path d="M16 3C16 3 6 10 6 18a10 10 0 0020 0C26 10 16 3 16 3z" fill="#4a8c5c"/>
            <path d="M16 10v14M11 15l5-5 5 5" stroke="#f09448" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <span>Fanaka <em>AGROSMART</em></span>
        </div>

        {/* Tabs */}
        <div className="modal-tabs">
          <button
            className={`modal-tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => { setTab('register'); setRegMsg(''); setLoginMsg(''); }}
          >Register</button>
          <button
            className={`modal-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setRegMsg(''); setLoginMsg(''); }}
          >Login</button>
        </div>

        {/* REGISTER PANEL */}
        {tab === 'register' && (
          <div>
            <h2>Create Account</h2>
            <p>Join the Fanaka ecosystem today.</p>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="e.g. John Kamau" value={regName} onChange={e => setRegName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" placeholder="e.g. 0712345678" value={regPhone} onChange={e => setRegPhone(e.target.value)} />
            </div>
            <div className="form-group">
              <label>I am a...</label>
              <select value={regRole} onChange={e => setRegRole(e.target.value)}>
                <option value="">Select your role</option>
                <option value="farmer">Farmer</option>
                <option value="agro_shop">Agro-shop / Supplier</option>
                <option value="consumer">Consumer</option>
              </select>
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Create a password (min 6 characters)" value={regPassword} onChange={e => setRegPassword(e.target.value)} />
            </div>
            <button className="form-submit" onClick={handleRegister} disabled={regLoading}>
              {regLoading ? 'Creating account...' : 'Create Account'}
            </button>
            {regMsg && <div className={`form-msg ${regMsgType}`}>{regMsg}</div>}
          </div>
        )}

        {/* LOGIN PANEL */}
        {tab === 'login' && (
          <div>
            <h2>Welcome Back</h2>
            <p>Login with your name or phone number.</p>
            <div className="form-group">
              <label>Name or Phone Number</label>
              <input type="text" placeholder="e.g. John Kamau or 0712345678" value={loginId} onChange={e => setLoginId(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Your password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
            </div>
            <button className="form-submit" onClick={handleLogin} disabled={loginLoading}>
              {loginLoading ? 'Logging in...' : 'Login'}
            </button>
            {loginMsg && <div className={`form-msg ${loginMsgType}`}>{loginMsg}</div>}
          </div>
        )}
      </div>
    </div>
  );
}