'use client';

import LearningHub from '@/components/LearningHub';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// --- NEW IMPORT ADDED BELOW ---
import AIScanner from '@/components/AIScanner'; 


const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

type Tab = 'overview' | 'scanner' | 'crops' | 'orders' | 'learning';

interface Product { id:number; name:string; price:number; quantity:string; category:string; type:string; owner_name:string; }
interface Order   { id:number; product_name:string; buyer_name:string; quantity:string; status:string; notes:string; }
interface User    { id:number; full_name:string; role:string; quality_score:number; }

const CROP_IMAGES: Record<string,string> = {
  Tomatoes:   'https://images.unsplash.com/photo-1546470427-f5a8ce56cb6b?w=400&q=80',
  Maize:      'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&q=80',
  Beans:      'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&q=80',
  Vegetables: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80',
  default:    'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&q=80',
};

const STATUS_STYLES: Record<string,{bg:string;color:string}> = {
  pending:   { bg:'#fef3c7', color:'#92400e' },
  confirmed: { bg:'#dbeafe', color:'#1e40af' },
  delivered: { bg:'#dcfce7', color:'#166534' },
};

export default function FarmerDashboard() {
  const router = useRouter();
  const [user, setUser]         = useState<User|null>(null);
  const [tab, setTab]           = useState<Tab>('overview');
  const [crops, setCrops]       = useState<Product[]>([]);
  const [orders, setOrders]     = useState<Order[]>([]);
  const [recs, setRecs]         = useState<Product[]>([]);
  const [scanInput, setScanInput] = useState('');
  const [scanResult, setScanResult] = useState('');
  const [scanLoading, setScanLoading] = useState(false);
  const [cropName, setCropName]   = useState('');
  const [cropPrice, setCropPrice] = useState('');
  const [cropQty, setCropQty]     = useState('');
  const [cropCat, setCropCat]     = useState('');
  const [cropMsg, setCropMsg]     = useState('');
  const [addingCrop, setAddingCrop] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('fanaka_user');
    if (!raw) { router.push('/'); return; }
    const u = JSON.parse(raw);
    if (u.role !== 'farmer') { router.push('/'); return; }
    setUser(u);
    loadCrops(u.id);
    loadOrders(u.id);
    loadRecs();
  }, []);

  async function loadCrops(id:number) {
    const res = await fetch(`${API}/api/market/products/owner/${id}`);
    if (res.ok) setCrops(await res.json());
  }
  async function loadOrders(id:number) {
    const res = await fetch(`${API}/api/market/orders/seller/${id}`);
    if (res.ok) setOrders(await res.json());
  }
  async function loadRecs() {
    const res = await fetch(`${API}/api/market/recommendations`);
    if (res.ok) setRecs(await res.json());
  }

  async function addCrop() {
    if (!cropName||!cropPrice||!cropQty) { setCropMsg('Fill in all required fields.'); return; }
    setAddingCrop(true);
    const res = await fetch(`${API}/api/market/products`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ name:cropName, price:parseFloat(cropPrice), quantity:cropQty, category:cropCat, type:'crop', owner_id:user?.id }),
    });
    if (res.ok) {
      setCropMsg('✅ Crop listed on marketplace!');
      setCropName(''); setCropPrice(''); setCropQty(''); setCropCat('');
      loadCrops(user!.id);
      setTimeout(()=>setCropMsg(''),3000);
    } else { setCropMsg('❌ Failed to list crop.'); }
    setAddingCrop(false);
  }

  async function deleteCrop(id:number) {
    await fetch(`${API}/api/market/products/${id}`,{method:'DELETE'});
    loadCrops(user!.id);
  }

  function logout() { localStorage.clear(); router.push('/'); }

  async function updateOrderStatus(orderId:number, status:string) {
    await fetch(`${API}/api/market/orders/${orderId}/status?status=${status}`,{method:'PATCH'});
    loadOrders(user!.id);
  }

  const pendingOrders = orders.filter(o=>o.status==='pending').length;

  const NAV: { key:Tab; icon:string; label:string }[] = [
    { key:'overview', icon:'🏠', label:'Overview'    },
    { key:'scanner',  icon:'🔬', label:'AI Scanner'  },
    { key:'crops',    icon:'🌾', label:'My Crops'    },
    { key:'orders',   icon:'📦', label:'Orders'      },
    { key:'learning', icon:'📚', label:'Learning Hub'},
  ];

  return (
    <div style={{minHeight:'100vh',background:'#f8f5f0',fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .nav-item{transition:all .18s ease;cursor:pointer;}
        .nav-item:hover{background:rgba(224,123,42,.08)!important;color:#e07b2a!important;}
        .crop-card{transition:box-shadow .2s,transform .2s;}
        .crop-card:hover{box-shadow:0 10px 30px rgba(26,58,42,.1)!important;transform:translateY(-3px);}
        .crop-card:hover .crop-img{transform:scale(1.05);}
        .crop-img{transition:transform .35s ease;width:100%;height:100%;object-fit:cover;}
        .stat-card{transition:box-shadow .18s,transform .18s;}
        .stat-card:hover{box-shadow:0 8px 28px rgba(26,58,42,.1)!important;transform:translateY(-2px);}
        .inp{padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:.87rem;outline:none;width:100%;color:#1a3a2a;transition:border-color .15s;}
        .inp:focus{border-color:#4a8c5c;}
        .primary-btn{background:#1a3a2a;color:#fff;border:none;padding:11px 26px;border-radius:10px;font-family:'DM Sans',sans-serif;font-weight:600;cursor:pointer;font-size:.88rem;transition:background .18s;}
        .primary-btn:hover{background:#2d5c3e;}
        .primary-btn:disabled{background:#9ca3af;cursor:not-allowed;}
        .orange-btn{background:#e07b2a;color:#fff;border:none;padding:11px 26px;border-radius:10px;font-family:'DM Sans',sans-serif;font-weight:600;cursor:pointer;font-size:.88rem;transition:background .18s;}
        .orange-btn:hover{background:#f09448;}
        .del-btn{background:#fee2e2;color:#991b1b;border:none;border-radius:7px;padding:4px 12px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:.74rem;font-weight:600;transition:background .15s;}
        .del-btn:hover{background:#fca5a5;}
      `}</style>

      {/* ── TOP NAV ── */}
      <div style={{background:'#1a3a2a',height:62,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 32px',position:'sticky',top:0,zIndex:100,boxShadow:'0 2px 12px rgba(0,0,0,.15)'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 3C16 3 6 10 6 18a10 10 0 0020 0C26 10 16 3 16 3z" fill="#4a8c5c"/>
            <path d="M16 10v14M11 15l5-5 5 5" stroke="#f09448" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontWeight:900,color:'#fff',fontSize:'1rem',letterSpacing:.5}}>FANAKA</div>
            <div style={{fontSize:'.55rem',color:'#f09448',fontWeight:700,letterSpacing:2.5,textTransform:'uppercase'}}>AGROSMART</div>
          </div>
        </div>

        <div style={{display:'flex',alignItems:'center',gap:8}}>
          {NAV.map(n=>(
            <button key={n.key} className="nav-item" onClick={()=>setTab(n.key)}
              style={{background:tab===n.key?'rgba(224,123,42,.15)':'transparent',border:'none',color:tab===n.key?'#f09448':'rgba(255,255,255,.7)',padding:'8px 16px',borderRadius:8,fontFamily:"'DM Sans',sans-serif",fontWeight:tab===n.key?600:400,fontSize:'.84rem',display:'flex',alignItems:'center',gap:6,borderBottom:tab===n.key?'2px solid #e07b2a':'2px solid transparent'}}>
              {n.icon} {n.label}
            </button>
          ))}
        </div>

        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <button onClick={()=>router.push('/marketplace')}
            style={{background:'#e07b2a',color:'#fff',border:'none',padding:'7px 16px',borderRadius:999,fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:'.8rem',cursor:'pointer'}}>
            🛒 Marketplace
          </button>
          {pendingOrders>0 && (
            <div style={{background:'#e07b2a',borderRadius:999,padding:'4px 10px',display:'flex',alignItems:'center',gap:5}}>
              <span style={{color:'#fff',fontSize:'.74rem',fontWeight:700}}>{pendingOrders} pending</span>
            </div>
          )}
          <div style={{display:'flex',alignItems:'center',gap:7,background:'rgba(255,255,255,.08)',padding:'6px 14px',borderRadius:999}}>
            <span style={{fontSize:'1rem'}}>🌾</span>
            <span style={{color:'#fff',fontSize:'.82rem',fontWeight:500}}>{user?.full_name}</span>
          </div>
          <button onClick={logout} style={{background:'transparent',border:'1px solid rgba(255,255,255,.25)',color:'rgba(255,255,255,.7)',padding:'6px 14px',borderRadius:999,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontSize:'.78rem'}}>Logout</button>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{padding:'32px 40px',maxWidth:1280,margin:'0 auto'}}>

        {/* ══ OVERVIEW ══ */}
        {tab==='overview' && (
          <div>
            {/* Hero welcome banner */}
            <div style={{borderRadius:20,overflow:'hidden',marginBottom:28,position:'relative',height:200}}>
              <img src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1400&q=80" alt="" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center 40%'}}/>
              <div style={{position:'absolute',inset:0,background:'linear-gradient(to right,rgba(26,58,42,.88) 0%,rgba(26,58,42,.4) 60%,transparent 100%)'}}/>
              <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',justifyContent:'center',padding:'0 40px'}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",color:'rgba(255,255,255,.65)',fontSize:'.82rem',marginBottom:4}}>Good morning 🌤️</p>
                <h1 style={{fontFamily:"'Playfair Display',serif",color:'#fff',fontSize:'2rem',fontWeight:900,marginBottom:8}}>Welcome back, {user?.full_name?.split(' ')[0]}!</h1>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{background:'#e07b2a',borderRadius:999,padding:'4px 14px',display:'inline-flex',alignItems:'center',gap:6}}>
                    <span style={{color:'#fff',fontSize:'.78rem',fontWeight:700}}>⭐ Quality Score: {user?.quality_score??50}/100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stat cards */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:18,marginBottom:28}}>
              {[
                { label:'My Listings', value:crops.length, icon:'🌾', sub:'Active on marketplace', bg:'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80', goto:'crops' as Tab },
                { label:'Pending Orders', value:orders.filter(o=>o.status==='pending').length, icon:'⏳', sub:'Awaiting fulfilment', bg:'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&q=80', goto:'orders' as Tab },
                { label:'Delivered', value:orders.filter(o=>o.status==='delivered').length, icon:'✅', sub:'Completed orders', bg:'https://images.unsplash.com/photo-1595508064774-5ff825520bb0?w=400&q=80', goto:'orders' as Tab },
              ].map(s=>(
                <div key={s.label} className="stat-card" onClick={()=>setTab(s.goto)} style={{borderRadius:16,overflow:'hidden',position:'relative',height:130,cursor:'pointer'}}>
                  <img src={s.bg} alt="" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}/>
                  <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,rgba(26,58,42,.85),rgba(26,58,42,.6))'}}/>
                  <div style={{position:'relative',padding:'18px 20px',height:'100%',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                      <span style={{fontFamily:"'DM Sans',sans-serif",color:'rgba(255,255,255,.7)',fontSize:'.78rem',fontWeight:500}}>{s.label}</span>
                      <span style={{fontSize:'1.4rem'}}>{s.icon}</span>
                    </div>
                    <div>
                      <div style={{fontFamily:"'Playfair Display',serif",color:'#fff',fontSize:'2rem',fontWeight:900,lineHeight:1}}>{s.value}</div>
                      <div style={{fontFamily:"'DM Sans',sans-serif",color:'rgba(255,255,255,.5)',fontSize:'.72rem',marginTop:3}}>{s.sub} · <span style={{color:'rgba(255,255,255,.4)'}}>tap to view →</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
              <div style={{background:'#fff',borderRadius:16,padding:24,border:'1.5px solid #f0ece4'}}>
                <h3 style={{fontFamily:"'Playfair Display',serif",color:'#1a3a2a',fontSize:'1.1rem',marginBottom:16}}>Recent Orders</h3>
                {orders.length===0 ? (
                  <div style={{textAlign:'center',padding:'20px 0',color:'#9ca3af',fontSize:'.85rem',fontFamily:"'DM Sans',sans-serif"}}>No orders yet. List your crops to start!</div>
                ) : orders.slice(0,4).map(o=>(
                  <div key={o.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #f3f4f6'}}>
                    <div>
                      <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:'#1a3a2a',fontSize:'.88rem'}}>{o.product_name}</div>
                      <div style={{fontFamily:"'DM Sans',sans-serif",color:'#9ca3af',fontSize:'.74rem'}}>from {o.buyer_name}</div>
                    </div>
                    <span style={{fontFamily:"'DM Sans',sans-serif",background:STATUS_STYLES[o.status]?.bg||'#f3f4f6',color:STATUS_STYLES[o.status]?.color||'#374151',padding:'3px 12px',borderRadius:999,fontSize:'.72rem',fontWeight:700,textTransform:'uppercase'}}>
                      {o.status}
                    </span>
                  </div>
                ))}
                <button onClick={()=>setTab('orders')} style={{marginTop:12,background:'none',border:'none',color:'#e07b2a',fontFamily:"'DM Sans',sans-serif",fontSize:'.8rem',fontWeight:600,cursor:'pointer',padding:0}}>View all orders →</button>
              </div>

              <div style={{background:'#fff',borderRadius:16,padding:24,border:'1.5px solid #f0ece4'}}>
                <h3 style={{fontFamily:"'Playfair Display',serif",color:'#1a3a2a',fontSize:'1.1rem',marginBottom:16}}>AI Recommendations</h3>
                {recs.length===0 ? (
                  <div style={{textAlign:'center',padding:'20px 0',color:'#9ca3af',fontSize:'.85rem',fontFamily:"'DM Sans',sans-serif"}}>Scan a crop issue to get recommendations.</div>
                ) : recs.slice(0,3).map(r=>(
                  <div key={r.id} style={{display:'flex',gap:12,padding:'10px 0',borderBottom:'1px solid #f3f4f6',alignItems:'center'}}>
                    <div style={{width:44,height:44,borderRadius:10,overflow:'hidden',flexShrink:0}}>
                      <img src={CROP_IMAGES[r.category]||CROP_IMAGES.default} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:'#1a3a2a',fontSize:'.87rem'}}>{r.name}</div>
                      <div style={{fontFamily:"'DM Sans',sans-serif",color:'#9ca3af',fontSize:'.74rem'}}>{r.quantity} · KES {r.price}</div>
                    </div>
                    <span style={{fontFamily:"'DM Sans',sans-serif",color:'#e07b2a',fontSize:'.72rem',fontWeight:700}}>💊 Rec</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ AI SCANNER ══ (UPDATED SECTION) */}
        {tab === 'scanner' && (
          <div style={{ padding: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
            <AIScanner farmerId={user?.id} />
          </div>
        )}

        {/* ══ MY CROPS ══ */}
        {tab==='crops' && (
          <div>
            {/* Banner */}
            <div style={{borderRadius:20,overflow:'hidden',marginBottom:28,position:'relative',height:150}}>
              <img src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1400&q=80" alt="" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center 50%'}}/>
              <div style={{position:'absolute',inset:0,background:'rgba(26,58,42,.7)'}}/>
              <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',justifyContent:'center',padding:'0 36px'}}>
                <h2 style={{fontFamily:"'Playfair Display',serif",color:'#fff',fontSize:'1.7rem',fontWeight:900,marginBottom:4}}>🌾 My Crop Listings</h2>
                <p style={{fontFamily:"'DM Sans',sans-serif",color:'rgba(255,255,255,.65)',fontSize:'.88rem'}}>Add your harvest to the marketplace for buyers to find and order directly.</p>
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'360px 1fr',gap:24,alignItems:'start'}}>
              {/* Add crop form */}
              <div style={{background:'#fff',borderRadius:18,padding:26,border:'1.5px solid #f0ece4',position:'sticky',top:80}}>
                <h3 style={{fontFamily:"'Playfair Display',serif",color:'#1a3a2a',fontSize:'1.05rem',marginBottom:20}}>+ List New Crop</h3>
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  <input className="inp" value={cropName} onChange={e=>setCropName(e.target.value)} placeholder="Crop name e.g. Tomatoes *"/>
                  <input className="inp" value={cropCat} onChange={e=>setCropCat(e.target.value)} placeholder="Category e.g. Vegetables"/>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                    <input className="inp" value={cropPrice} onChange={e=>setCropPrice(e.target.value)} placeholder="Price (KES) *" type="number"/>
                    <input className="inp" value={cropQty} onChange={e=>setCropQty(e.target.value)} placeholder="Qty e.g. 50 kg *"/>
                  </div>
                  <button className="primary-btn" onClick={addCrop} disabled={addingCrop} style={{marginTop:4}}>
                    {addingCrop ? 'Listing...' : 'List on Marketplace'}
                  </button>
                  {cropMsg && (
                    <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:'.82rem',color:cropMsg.startsWith('✅')?'#166534':'#991b1b',background:cropMsg.startsWith('✅')?'#dcfce7':'#fee2e2',padding:'8px 12px',borderRadius:8,textAlign:'center'}}>
                      {cropMsg}
                    </div>
                  )}
                </div>
              </div>

              {/* Crop listings */}
              <div>
                {crops.length===0 ? (
                  <div style={{background:'#fff',borderRadius:18,padding:48,textAlign:'center',border:'1.5px solid #f0ece4'}}>
                    <img src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=300&q=80" alt="" style={{width:120,height:120,objectFit:'cover',borderRadius:'50%',marginBottom:16,opacity:.6}}/>
                    <p style={{fontFamily:"'Playfair Display',serif",color:'#1a3a2a',fontSize:'1.1rem',marginBottom:6}}>No crops listed yet</p>
                    <p style={{fontFamily:"'DM Sans',sans-serif",color:'#9ca3af',fontSize:'.85rem'}}>Use the form to add your first crop listing.</p>
                  </div>
                ) : (
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:18}}>
                    {crops.map(c=>(
                      <div key={c.id} className="crop-card" style={{background:'#fff',borderRadius:14,overflow:'hidden',border:'1.5px solid #f0ece4'}}>
                        <div style={{height:160,overflow:'hidden',position:'relative'}}>
                          <img className="crop-img" src={CROP_IMAGES[c.name]||CROP_IMAGES[c.category]||CROP_IMAGES.default} alt={c.name}/>
                          <div style={{position:'absolute',top:10,right:10}}>
                            <button className="del-btn" onClick={()=>deleteCrop(c.id)}>Remove</button>
                          </div>
                          <div style={{position:'absolute',bottom:0,left:0,right:0,height:40,background:'linear-gradient(to top,rgba(26,58,42,.5),transparent)'}}/>
                        </div>
                        <div style={{padding:'14px 16px'}}>
                          <div style={{fontFamily:"'DM Sans',sans-serif",color:'#e07b2a',fontSize:'.69rem',fontWeight:700,textTransform:'uppercase',letterSpacing:.5,marginBottom:4}}>{c.category||'Crop'}</div>
                          <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,color:'#1a3a2a',fontSize:'1rem',marginBottom:3}}>{c.name}</div>
                          <div style={{fontFamily:"'DM Sans',sans-serif",color:'#6b7280',fontSize:'.8rem',marginBottom:6}}>{c.quantity}</div>
                          <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:800,color:'#1a3a2a',fontSize:'1rem'}}>KES {c.price}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══ ORDERS ══ */}
        {tab==='orders' && (
          <div>
            <div style={{borderRadius:20,overflow:'hidden',marginBottom:28,position:'relative',height:150}}>
              <img src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1400&q=80" alt="" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center 60%'}}/>
              <div style={{position:'absolute',inset:0,background:'rgba(26,58,42,.7)'}}/>
              <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',justifyContent:'center',padding:'0 36px'}}>
                <h2 style={{fontFamily:"'Playfair Display',serif",color:'#fff',fontSize:'1.7rem',fontWeight:900,marginBottom:4}}>📦 Incoming Orders</h2>
                <p style={{fontFamily:"'DM Sans',sans-serif",color:'rgba(255,255,255,.65)',fontSize:'.88rem'}}>Orders placed by consumers for your listed crops.</p>
              </div>
            </div>

            {orders.length===0 ? (
              <div style={{background:'#fff',borderRadius:18,padding:56,textAlign:'center',border:'1.5px solid #f0ece4'}}>
                <div style={{fontSize:'3rem',marginBottom:12}}>📭</div>
                <p style={{fontFamily:"'Playfair Display',serif",color:'#1a3a2a',fontSize:'1.1rem',marginBottom:6}}>No orders yet</p>
                <p style={{fontFamily:"'DM Sans',sans-serif",color:'#9ca3af',fontSize:'.85rem'}}>List your crops on the marketplace to start receiving orders.</p>
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                {orders.map(o=>(
                  <div key={o.id} style={{background:'#fff',borderRadius:14,overflow:'hidden',border:'1.5px solid #f0ece4',display:'flex',alignItems:'stretch'}}>
                    <div style={{width:6,background:o.status==='pending'?'#f59e0b':o.status==='confirmed'?'#3b82f6':'#10b981',flexShrink:0,borderRadius:'0 0 0 0'}}/>
                    <div style={{flex:1,padding:'18px 22px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
                      <div style={{display:'flex',alignItems:'center',gap:16}}>
                        <div style={{width:48,height:48,borderRadius:10,overflow:'hidden',flexShrink:0}}>
                          <img src={CROP_IMAGES[o.product_name]||CROP_IMAGES.default} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                        </div>
                        <div>
                          <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,color:'#1a3a2a',fontSize:'1rem',marginBottom:3}}>{o.product_name}</div>
                          <div style={{fontFamily:"'DM Sans',sans-serif",color:'#6b7280',fontSize:'.82rem'}}>Ordered by <strong>{o.buyer_name}</strong> · {o.quantity}</div>
                          {o.notes && <div style={{fontFamily:"'DM Sans',sans-serif",color:'#9ca3af',fontSize:'.76rem',marginTop:2}}>Note: {o.notes}</div>}
                        </div>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                        <span style={{fontFamily:"'DM Sans',sans-serif",background:STATUS_STYLES[o.status]?.bg||'#f3f4f6',color:STATUS_STYLES[o.status]?.color||'#374151',padding:'5px 16px',borderRadius:999,fontSize:'.75rem',fontWeight:700,textTransform:'uppercase'}}>
                          {o.status}
                        </span>
                        {o.status==='pending' && (
                          <button onClick={()=>updateOrderStatus(o.id,'confirmed')}
                            style={{background:'#3b82f6',color:'#fff',border:'none',padding:'5px 14px',borderRadius:999,fontFamily:"'DM Sans',sans-serif",fontWeight:600,cursor:'pointer',fontSize:'.74rem',transition:'background .15s'}}
                            onMouseEnter={e=>e.currentTarget.style.background='#2563eb'}
                            onMouseLeave={e=>e.currentTarget.style.background='#3b82f6'}>
                            Confirm
                          </button>
                        )}
                        {o.status==='confirmed' && (
                          <button onClick={()=>updateOrderStatus(o.id,'delivered')}
                            style={{background:'#10b981',color:'#fff',border:'none',padding:'5px 14px',borderRadius:999,fontFamily:"'DM Sans',sans-serif",fontWeight:600,cursor:'pointer',fontSize:'.74rem',transition:'background .15s'}}
                            onMouseEnter={e=>e.currentTarget.style.background='#059669'}
                            onMouseLeave={e=>e.currentTarget.style.background='#10b981'}>
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ LEARNING HUB ══ */}
        {tab === 'learning' && (
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <LearningHub farmerId={user?.id} />
          </div>
        )}

      </div>
    </div>
  );
}