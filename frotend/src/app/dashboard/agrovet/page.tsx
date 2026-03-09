'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

type Tab = 'overview' | 'listings' | 'orders' | 'referrals' | 'analytics';

interface Product { id:number; name:string; price:number; quantity:string; category:string; type:string; description?:string; }
interface Order   { id:number; product_name:string; buyer_name:string; quantity:string; status:string; notes:string; }
interface User    { id:number; full_name:string; role:string; quality_score:number; }

const PROD_IMG: Record<string,string> = {
  Fertilizer: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&q=80',
  Pesticide:  'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=500&q=80',
  Seeds:      'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=500&q=80',
  Fungicide:  'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=500&q=80',
  Herbicide:  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&q=80',
  default:    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&q=80',
};

const STATUS_STYLES: Record<string,{bg:string;color:string;bar:string}> = {
  pending:   { bg:'#fef3c7', color:'#92400e', bar:'#f59e0b' },
  confirmed: { bg:'#dbeafe', color:'#1e40af', bar:'#3b82f6' },
  delivered: { bg:'#dcfce7', color:'#166534', bar:'#10b981' },
};

const CATEGORIES = ['Fertilizer','Pesticide','Seeds','Fungicide','Herbicide','Feed & Supplements','Equipment','Other'];

const HOW_REFERRALS = [
  { icon:'🔬', step:'01', title:'Farmer Scans Crop',      desc:'Farmer uploads or describes a crop disease using the AI Scanner.' },
  { icon:'🤖', step:'02', title:'AI Diagnoses Issue',     desc:'Our model identifies the exact pest, disease, or deficiency.' },
  { icon:'🔍', step:'03', title:'System Searches Stock',  desc:'Fanaka matches the diagnosis to your listed products by category.' },
  { icon:'📱', step:'04', title:'Your Product Surfaces',  desc:'Farmers see your product as a recommended treatment instantly.' },
  { icon:'🛒', step:'05', title:'Farmer Orders Direct',   desc:'One tap and the order lands in your incoming orders dashboard.' },
];

export default function AgrovetDashboard() {
  const router = useRouter();
  const [user, setUser]         = useState<User|null>(null);
  const [tab, setTab]           = useState<Tab>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders]     = useState<Order[]>([]);

  // Add product form
  const [pName, setPName]   = useState('');
  const [pCat, setPCat]     = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pQty, setPQty]     = useState('');
  const [pDesc, setPDesc]   = useState('');
  const [pMsg, setPMsg]     = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('fanaka_user');
    if (!raw) { router.push('/'); return; }
    const u = JSON.parse(raw);
    if (u.role !== 'agro_shop') { router.push('/'); return; }
    setUser(u);
    loadProducts(u.id);
    loadOrders(u.id);
  }, []);

  async function loadProducts(id:number) {
    const res = await fetch(`${API}/api/market/products/owner/${id}`);
    if (res.ok) setProducts(await res.json());
  }

  async function loadOrders(id:number) {
    const res = await fetch(`${API}/api/market/orders/seller/${id}`);
    if (res.ok) setOrders(await res.json());
  }

  async function addProduct() {
    if (!pName||!pPrice||!pQty) { setPMsg('Fill in all required fields.'); return; }
    setAdding(true);
    const res = await fetch(`${API}/api/market/products`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ name:pName, description:pDesc, price:parseFloat(pPrice), quantity:pQty, category:pCat, type:'input', owner_id:user?.id }),
    });
    if (res.ok) {
      setPMsg('✅ Product listed on marketplace and farmer recommendations!');
      setPName(''); setPCat(''); setPPrice(''); setPQty(''); setPDesc('');
      loadProducts(user!.id);
      setTimeout(()=>setPMsg(''),4000);
    } else { setPMsg('❌ Failed to add product.'); }
    setAdding(false);
  }

  async function deleteProduct(id:number) {
    await fetch(`${API}/api/market/products/${id}`,{method:'DELETE'});
    loadProducts(user!.id);
  }

  async function updateStatus(orderId:number, status:string) {
    await fetch(`${API}/api/market/orders/${orderId}/status?status=${status}`,{method:'PATCH'});
    loadOrders(user!.id);
  }

  function logout() { localStorage.clear(); router.push('/'); }

  const pendingOrders   = orders.filter(o=>o.status==='pending').length;
  const confirmedOrders = orders.filter(o=>o.status==='confirmed').length;
  const deliveredOrders = orders.filter(o=>o.status==='delivered').length;
  const totalRevenue    = orders.filter(o=>o.status==='delivered').reduce((acc,o)=>{
    const p = products.find(p=>p.name===o.product_name);
    return acc + (p?p.price:0);
  },0);

  const NAV: {key:Tab;icon:string;label:string}[] = [
    {key:'overview',   icon:'🏠', label:'Overview'},
    {key:'listings',   icon:'🌱', label:'My Products'},
    {key:'orders',     icon:'📦', label:'Orders'},
    {key:'referrals',  icon:'🤖', label:'AI Referrals'},
    {key:'analytics',  icon:'📊', label:'Analytics'},
  ];

  return (
    <div style={{minHeight:'100vh',background:'#f8f5f0',fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .nav-item{transition:all .18s;cursor:pointer;}
        .nav-item:hover{background:rgba(224,123,42,.08)!important;color:#e07b2a!important;}
        .pcard{transition:box-shadow .2s,transform .2s;}
        .pcard:hover{box-shadow:0 10px 30px rgba(26,58,42,.11)!important;transform:translateY(-3px);}
        .pcard:hover .pcard-img{transform:scale(1.05);}
        .pcard-img{transition:transform .38s;width:100%;height:100%;object-fit:cover;}
        .stat-card{transition:box-shadow .18s,transform .18s;}
        .stat-card:hover{box-shadow:0 8px 28px rgba(26,58,42,.1)!important;transform:translateY(-2px);}
        .ref-step{transition:box-shadow .18s,transform .18s;}
        .ref-step:hover{box-shadow:0 8px 24px rgba(26,58,42,.09)!important;transform:translateY(-2px);}
        .inp{padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:.87rem;outline:none;width:100%;color:#1a3a2a;transition:border-color .15s;background:#fff;}
        .inp:focus{border-color:#4a8c5c;}
        .primary-btn{background:#1a3a2a;color:#fff;border:none;padding:11px 26px;border-radius:10px;font-family:'DM Sans',sans-serif;font-weight:600;cursor:pointer;font-size:.88rem;transition:background .18s;}
        .primary-btn:hover{background:#2d5c3e;}
        .primary-btn:disabled{background:#9ca3af;cursor:not-allowed;}
        .orange-btn{background:#e07b2a;color:#fff;border:none;padding:10px 20px;border-radius:10px;font-family:'DM Sans',sans-serif;font-weight:600;cursor:pointer;font-size:.82rem;transition:background .18s;}
        .orange-btn:hover{background:#f09448;}
        .blue-btn{background:#3b82f6;color:#fff;border:none;padding:5px 14px;border-radius:999px;font-family:'DM Sans',sans-serif;font-weight:600;cursor:pointer;font-size:.74rem;transition:background .15s;}
        .blue-btn:hover{background:#2563eb;}
        .green-btn{background:#10b981;color:#fff;border:none;padding:5px 14px;border-radius:999px;font-family:'DM Sans',sans-serif;font-weight:600;cursor:pointer;font-size:.74rem;transition:background .15s;}
        .green-btn:hover{background:#059669;}
        .del-btn{background:#fee2e2;color:#991b1b;border:none;border-radius:7px;padding:4px 11px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:.73rem;font-weight:600;transition:background .15s;}
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

        <div style={{display:'flex',alignItems:'center',gap:6}}>
          {NAV.map(n=>(
            <button key={n.key} className="nav-item" onClick={()=>setTab(n.key)}
              style={{background:tab===n.key?'rgba(224,123,42,.15)':'transparent',border:'none',color:tab===n.key?'#f09448':'rgba(255,255,255,.7)',padding:'8px 14px',borderRadius:8,fontFamily:"'DM Sans',sans-serif",fontWeight:tab===n.key?600:400,fontSize:'.83rem',display:'flex',alignItems:'center',gap:5,borderBottom:tab===n.key?'2px solid #e07b2a':'2px solid transparent',cursor:'pointer'}}>
              {n.icon} {n.label}
            </button>
          ))}
        </div>

        <div style={{display:'flex',alignItems:'center',gap:12}}>
          {pendingOrders>0 && (
            <div onClick={()=>setTab('orders')} style={{background:'#e07b2a',borderRadius:999,padding:'5px 14px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
              <span style={{fontSize:'.75rem'}}>📦</span>
              <span style={{color:'#fff',fontSize:'.75rem',fontWeight:700}}>{pendingOrders} new order{pendingOrders>1?'s':''}</span>
            </div>
          )}
          <div style={{display:'flex',alignItems:'center',gap:7,background:'rgba(255,255,255,.08)',padding:'6px 14px',borderRadius:999}}>
            <span style={{fontSize:'.95rem'}}>🏪</span>
            <span style={{color:'#fff',fontSize:'.82rem',fontWeight:500}}>{user?.full_name}</span>
          </div>
          <button onClick={logout} style={{background:'transparent',border:'1px solid rgba(255,255,255,.25)',color:'rgba(255,255,255,.7)',padding:'6px 14px',borderRadius:999,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontSize:'.78rem'}}>Logout</button>
        </div>
      </div>

      <div style={{padding:'32px 40px',maxWidth:1280,margin:'0 auto'}}>

        {/* ══ OVERVIEW ══ */}
        {tab==='overview' && (
          <div>
            {/* Hero */}
            <div style={{borderRadius:20,overflow:'hidden',marginBottom:28,position:'relative',height:210}}>
              <img src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1400&q=80" alt="" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center 40%'}}/>
              <div style={{position:'absolute',inset:0,background:'linear-gradient(to right,rgba(26,58,42,.92) 0%,rgba(26,58,42,.45) 55%,transparent 100%)'}}/>
              <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',justifyContent:'center',padding:'0 44px'}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",color:'rgba(255,255,255,.6)',fontSize:'.82rem',marginBottom:4}}>Agrovet Dashboard 🌿</p>
                <h1 style={{fontFamily:"'Playfair Display',serif",color:'#fff',fontSize:'2.1rem',fontWeight:900,marginBottom:12}}>
                  Welcome, {user?.full_name?.split(' ')[0]}!
                </h1>
                <div style={{display:'flex',gap:10}}>
                  <button onClick={()=>setTab('listings')} style={{background:'#e07b2a',color:'#fff',border:'none',padding:'9px 22px',borderRadius:999,fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'.85rem',cursor:'pointer'}}>
                    + Add Product
                  </button>
                  <button onClick={()=>setTab('orders')} style={{background:'rgba(255,255,255,.15)',color:'#fff',border:'1.5px solid rgba(255,255,255,.3)',padding:'9px 22px',borderRadius:999,fontFamily:"'DM Sans',sans-serif",fontWeight:500,fontSize:'.85rem',cursor:'pointer'}}>
                    📦 View Orders
                  </button>
                </div>
              </div>
            </div>

            {/* Stat cards */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:18,marginBottom:28}}>
              {[
                {label:'Products Listed', value:products.length,   icon:'🌱', sub:'On marketplace',    bg:'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&q=80'},
                {label:'Pending Orders',  value:pendingOrders,     icon:'⏳', sub:'Need confirmation', bg:'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80'},
                {label:'Delivered',       value:deliveredOrders,   icon:'✅', sub:'Completed orders',  bg:'https://images.unsplash.com/photo-1595508064774-5ff825520bb0?w=400&q=80'},
                {label:'Est. Revenue',    value:`${totalRevenue}`, icon:'💰', sub:'KES from delivered', bg:'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80'},
              ].map(s=>(
                <div key={s.label} className="stat-card" style={{borderRadius:16,overflow:'hidden',position:'relative',height:128,cursor:'default'}}>
                  <img src={s.bg} alt="" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}/>
                  <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,rgba(26,58,42,.88),rgba(26,58,42,.58))'}}/>
                  <div style={{position:'relative',padding:'18px 20px',height:'100%',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                      <span style={{fontFamily:"'DM Sans',sans-serif",color:'rgba(255,255,255,.65)',fontSize:'.77rem',fontWeight:500}}>{s.label}</span>
                      <span style={{fontSize:'1.35rem'}}>{s.icon}</span>
                    </div>
                    <div>
                      <div style={{fontFamily:"'Playfair Display',serif",color:'#fff',fontSize:'2rem',fontWeight:900,lineHeight:1}}>{s.value}</div>
                      <div style={{fontFamily:"'DM Sans',sans-serif",color:'rgba(255,255,255,.45)',fontSize:'.71rem',marginTop:3}}>{s.sub}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent orders + active listings */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
              <div style={{background:'#fff',borderRadius:16,padding:24,border:'1.5px solid #f0ece4'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                  <h3 style={{fontFamily:"'Playfair Display',serif",color:'#1a3a2a',fontSize:'1.1rem'}}>Recent Orders</h3>
                  <button onClick={()=>setTab('orders')} style={{background:'none',border:'none',color:'#e07b2a',fontFamily:"'DM Sans',sans-serif",fontSize:'.8rem',fontWeight:600,cursor:'pointer'}}>View all →</button>
                </div>
                {orders.length===0 ? (
                  <div style={{textAlign:'center',padding:'24px 0',color:'#9ca3af',fontFamily:"'DM Sans',sans-serif",fontSize:'.85rem'}}>No orders yet. List products to start receiving them.</div>
                ) : orders.slice(0,5).map(o=>(
                  <div key={o.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #f3f4f6'}}>
                    <div style={{display:'flex',alignItems:'center',gap:12}}>
                      <div style={{width:40,height:40,borderRadius:8,overflow:'hidden',flexShrink:0}}>
                        <img src={PROD_IMG[o.product_name]||PROD_IMG.default} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                      </div>
                      <div>
                        <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:'#1a3a2a',fontSize:'.87rem'}}>{o.product_name}</div>
                        <div style={{fontFamily:"'DM Sans',sans-serif",color:'#9ca3af',fontSize:'.73rem'}}>from {o.buyer_name}</div>
                      </div>
                    </div>
                    <span style={{fontFamily:"'DM Sans',sans-serif",background:STATUS_STYLES[o.status]?.bg||'#f3f4f6',color:STATUS_STYLES[o.status]?.color||'#374151',padding:'3px 12px',borderRadius:999,fontSize:'.71rem',fontWeight:700,textTransform:'uppercase'}}>
                      {o.status}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{background:'#fff',borderRadius:16,padding:24,border:'1.5px solid #f0ece4'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                  <h3 style={{fontFamily:"'Playfair Display',serif",color:'#1a3a2a',fontSize:'1.1rem'}}>Active Listings</h3>
                  <button onClick={()=>setTab('listings')} style={{background:'none',border:'none',color:'#e07b2a',fontFamily:"'DM Sans',sans-serif",fontSize:'.8rem',fontWeight:600,cursor:'pointer'}}>Manage →</button>
                </div>
                {products.length===0 ? (
                  <div style={{textAlign:'center',padding:'24px 0',color:'#9ca3af',fontFamily:"'DM Sans',sans-serif",fontSize:'.85rem'}}>No products listed yet.</div>
                ) : products.slice(0,4).map(p=>(
                  <div key={p.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #f3f4f6'}}>
                    <div style={{display:'flex',alignItems:'center',gap:12}}>
                      <div style={{width:44,height:44,borderRadius:9,overflow:'hidden',flexShrink:0}}>
                        <img src={PROD_IMG[p.category]||PROD_IMG.default} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                      </div>
                      <div>
                        <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:'#1a3a2a',fontSize:'.87rem'}}>{p.name}</div>
                        <div style={{fontFamily:"'DM Sans',sans-serif",color:'#9ca3af',fontSize:'.73rem'}}>{p.quantity} · {p.category}</div>
                      </div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span style={{fontFamily:"'DM Sans',sans-serif",fontWeight:800,color:'#1a3a2a',fontSize:'.9rem'}}>KES {p.price}</span>
                      <span style={{background:'#dcfce7',color:'#166534',padding:'2px 9px',borderRadius:999,fontFamily:"'DM Sans',sans-serif",fontSize:'.69rem',fontWeight:700}}>Live</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ LISTINGS ══ */}
        {tab==='listings' && (
          <div>
            <div style={{borderRadius:20,overflow:'hidden',marginBottom:28,position:'relative',height:155}}>
              <img src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=1400&q=80" alt="" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center 50%'}}/>
              <div style={{position:'absolute',inset:0,background:'rgba(26,58,42,.72)'}}/>
              <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',justifyContent:'center',padding:'0 36px'}}>
                <h2 style={{fontFamily:"'Playfair Display',serif",color:'#fff',fontSize:'1.7rem',fontWeight:900,marginBottom:4}}>🌱 My Product Listings</h2>
                <p style={{fontFamily:"'DM Sans',sans-serif",color:'rgba(255,255,255,.65)',fontSize:'.88rem'}}>Products you list appear on the marketplace AND in farmer AI diagnostic recommendations.</p>
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'380px 1fr',gap:24,alignItems:'start'}}>
              {/* Add product form */}
              <div style={{background:'#fff',borderRadius:18,padding:26,border:'1.5px solid #f0ece4',position:'sticky',top:80}}>
                <h3 style={{fontFamily:"'Playfair Display',serif",color:'#1a3a2a',fontSize:'1.05rem',marginBottom:18}}>+ Add New Product</h3>
                <div style={{display:'flex',flexDirection:'column',gap:11}}>
                  <input className="inp" value={pName} onChange={e=>setPName(e.target.value)} placeholder="Product name *"/>
                  <select className="inp" value={pCat} onChange={e=>setPCat(e.target.value)} style={{appearance:'none',backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",backgroundRepeat:'no-repeat',backgroundPosition:'right 14px center'}}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                    <input className="inp" value={pPrice} onChange={e=>setPPrice(e.target.value)} placeholder="Price (KES) *" type="number"/>
                    <input className="inp" value={pQty} onChange={e=>setPQty(e.target.value)} placeholder="Qty e.g. 25 kg *"/>
                  </div>
                  <textarea className="inp" value={pDesc} onChange={e=>setPDesc(e.target.value)} placeholder="Description — farmers see this in recommendations (optional)" style={{height:76,resize:'vertical',lineHeight:1.5}}/>
                  <button className="primary-btn" onClick={addProduct} disabled={adding}>
                    {adding?'Adding...':'Add to Marketplace & Recommendations'}
                  </button>
                  {pMsg && (
                    <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:'.82rem',color:pMsg.startsWith('✅')?'#166534':'#991b1b',background:pMsg.startsWith('✅')?'#dcfce7':'#fee2e2',padding:'8px 12px',borderRadius:8,textAlign:'center'}}>
                      {pMsg}
                    </div>
                  )}
                </div>
                <div style={{marginTop:18,padding:12,background:'#fef3c7',borderRadius:10}}>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:'.78rem',color:'#92400e',lineHeight:1.55}}>
                    💡 <strong>Tip:</strong> Use specific categories like "Fungicide" or "NPK Fertilizer" to match more farmer AI diagnoses.
                  </p>
                </div>
              </div>

              {/* Product cards */}
              <div>
                {products.length===0 ? (
                  <div style={{background:'#fff',borderRadius:18,padding:48,textAlign:'center',border:'1.5px solid #f0ece4'}}>
                    <img src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&q=80" alt="" style={{width:120,height:120,objectFit:'cover',borderRadius:'50%',marginBottom:16,opacity:.55}}/>
                    <p style={{fontFamily:"'Playfair Display',serif",color:'#1a3a2a',fontSize:'1.1rem',marginBottom:6}}>No products yet</p>
                    <p style={{fontFamily:"'DM Sans',sans-serif",color:'#9ca3af',fontSize:'.85rem'}}>Add your first product using the form to appear in the marketplace and AI recommendations.</p>
                  </div>
                ) : (
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))',gap:18}}>
                    {products.map(p=>(
                      <div key={p.id} className="pcard" style={{background:'#fff',borderRadius:14,overflow:'hidden',border:'1.5px solid #f0ece4'}}>
                        <div style={{height:155,overflow:'hidden',position:'relative'}}>
                          <img className="pcard-img" src={PROD_IMG[p.category]||PROD_IMG.default} alt={p.name}/>
                          <div style={{position:'absolute',top:10,right:10}}>
                            <button className="del-btn" onClick={()=>deleteProduct(p.id)}>Remove</button>
                          </div>
                          <div style={{position:'absolute',top:10,left:10,background:'#dcfce7',color:'#166534',borderRadius:999,padding:'2px 9px',fontFamily:"'DM Sans',sans-serif",fontSize:'.68rem',fontWeight:700}}>Live</div>
                          <div style={{position:'absolute',bottom:0,left:0,right:0,height:36,background:'linear-gradient(to top,rgba(26,58,42,.45),transparent)'}}/>
                        </div>
                        <div style={{padding:'13px 15px 16px'}}>
                          <div style={{fontFamily:"'DM Sans',sans-serif",color:'#e07b2a',fontSize:'.68rem',fontWeight:700,textTransform:'uppercase',letterSpacing:.5,marginBottom:4}}>{p.category||'Input'}</div>
                          <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,color:'#1a3a2a',fontSize:'.95rem',marginBottom:3}}>{p.name}</div>
                          <div style={{fontFamily:"'DM Sans',sans-serif",color:'#9ca3af',fontSize:'.78rem',marginBottom:6}}>{p.quantity}</div>
                          <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:800,color:'#1a3a2a',fontSize:'1rem'}}>KES {p.price}</div>
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
            <div style={{borderRadius:20,overflow:'hidden',marginBottom:28,position:'relative',height:155}}>
              <img src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1400&q=80" alt="" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center 35%'}}/>
              <div style={{position:'absolute',inset:0,background:'rgba(26,58,42,.72)'}}/>
              <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',justifyContent:'center',padding:'0 36px'}}>
                <h2 style={{fontFamily:"'Playfair Display',serif",color:'#fff',fontSize:'1.7rem',fontWeight:900,marginBottom:4}}>📦 Incoming Orders</h2>
                <p style={{fontFamily:"'DM Sans',sans-serif",color:'rgba(255,255,255,.65)',fontSize:'.88rem'}}>Orders from farmers and consumers for your products. Confirm and mark as delivered.</p>
              </div>
            </div>

            {/* Summary pills */}
            <div style={{display:'flex',gap:12,marginBottom:24,flexWrap:'wrap'}}>
              {[
                {label:'All Orders', value:orders.length,   color:'#1a3a2a'},
                {label:'Pending',    value:pendingOrders,   color:'#92400e'},
                {label:'Confirmed',  value:confirmedOrders, color:'#1e40af'},
                {label:'Delivered',  value:deliveredOrders, color:'#166534'},
              ].map(s=>(
                <div key={s.label} style={{background:'#fff',border:'1.5px solid #f0ece4',borderRadius:12,padding:'12px 20px',display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontFamily:"'Playfair Display',serif",fontSize:'1.5rem',fontWeight:900,color:s.color}}>{s.value}</span>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:'.82rem',color:'#6b7280'}}>{s.label}</span>
                </div>
              ))}
            </div>

            {orders.length===0 ? (
              <div style={{background:'#fff',borderRadius:18,padding:56,textAlign:'center',border:'1.5px solid #f0ece4'}}>
                <div style={{fontSize:'3rem',marginBottom:12}}>📭</div>
                <p style={{fontFamily:"'Playfair Display',serif",color:'#1a3a2a',fontSize:'1.1rem',marginBottom:6}}>No orders yet</p>
                <p style={{fontFamily:"'DM Sans',sans-serif",color:'#9ca3af',fontSize:'.85rem'}}>List products and get featured in AI recommendations to attract orders.</p>
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                {orders.map(o=>(
                  <div key={o.id} style={{background:'#fff',borderRadius:14,overflow:'hidden',border:'1.5px solid #f0ece4',display:'flex',alignItems:'stretch'}}>
                    <div style={{width:6,background:STATUS_STYLES[o.status]?.bar||'#e5e7eb',flexShrink:0}}/>
                    <div style={{flex:1,padding:'16px 22px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
                      <div style={{display:'flex',alignItems:'center',gap:16}}>
                        <div style={{width:52,height:52,borderRadius:11,overflow:'hidden',flexShrink:0}}>
                          <img src={PROD_IMG[o.product_name]||PROD_IMG.default} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                        </div>
                        <div>
                          <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,color:'#1a3a2a',fontSize:'1rem',marginBottom:3}}>{o.product_name}</div>
                          <div style={{fontFamily:"'DM Sans',sans-serif",color:'#6b7280',fontSize:'.82rem'}}>From <strong>{o.buyer_name}</strong> · {o.quantity}</div>
                          {o.notes && <div style={{fontFamily:"'DM Sans',sans-serif",color:'#9ca3af',fontSize:'.76rem',marginTop:2}}>{o.notes}</div>}
                        </div>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                        <span style={{fontFamily:"'DM Sans',sans-serif",background:STATUS_STYLES[o.status]?.bg||'#f3f4f6',color:STATUS_STYLES[o.status]?.color||'#374151',padding:'5px 14px',borderRadius:999,fontSize:'.74rem',fontWeight:700,textTransform:'uppercase'}}>
                          {o.status}
                        </span>
                        {o.status==='pending' && (
                          <button className="blue-btn" onClick={()=>updateStatus(o.id,'confirmed')}>Confirm</button>
                        )}
                        {o.status==='confirmed' && (
                          <button className="green-btn" onClick={()=>updateStatus(o.id,'delivered')}>Mark Delivered</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ AI REFERRALS ══ */}
        {tab==='referrals' && (
          <div>
            <div style={{borderRadius:20,overflow:'hidden',marginBottom:28,position:'relative',height:160}}>
              <img src="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=1400&q=80" alt="" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center 30%'}}/>
              <div style={{position:'absolute',inset:0,background:'rgba(26,58,42,.74)'}}/>
              <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',justifyContent:'center',padding:'0 36px'}}>
                <h2 style={{fontFamily:"'Playfair Display',serif",color:'#fff',fontSize:'1.7rem',fontWeight:900,marginBottom:4}}>🤖 AI Prescription Referrals</h2>
                <p style={{fontFamily:"'DM Sans',sans-serif",color:'rgba(255,255,255,.65)',fontSize:'.88rem'}}>Your products surface automatically when farmers scan crop issues matching your category.</p>
              </div>
            </div>

            {/* How it works steps */}
            <h3 style={{fontFamily:"'Playfair Display',serif",color:'#1a3a2a',fontSize:'1.2rem',marginBottom:16}}>How It Works</h3>
            <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:14,marginBottom:32}}>
              {HOW_REFERRALS.map((s,i)=>(
                <div key={s.step} className="ref-step" style={{background:'#fff',borderRadius:14,padding:'20px 16px',border:'1.5px solid #f0ece4',textAlign:'center',position:'relative',overflow:'hidden'}}>
                  <div style={{position:'absolute',top:10,right:12,fontFamily:"'Playfair Display',serif",fontSize:'2.5rem',fontWeight:900,color:'rgba(26,58,42,.04)',lineHeight:1}}>{s.step}</div>
                  <div style={{fontSize:'2rem',marginBottom:10}}>{s.icon}</div>
                  <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:700,color:'#1a3a2a',fontSize:'.88rem',marginBottom:6}}>{s.title}</div>
                  <div style={{fontFamily:"'DM Sans',sans-serif",color:'#6b7280',fontSize:'.78rem',lineHeight:1.55}}>{s.desc}</div>
                  {i<HOW_REFERRALS.length-1 && (
                    <div style={{position:'absolute',top:'50%',right:-8,transform:'translateY(-50%)',color:'#e07b2a',fontWeight:900,fontSize:'1.1rem',zIndex:10}}>›</div>
                  )}
                </div>
              ))}
            </div>

            {/* Tip box */}
            <div style={{background:'#fff',borderRadius:16,padding:24,border:'1.5px solid #f0ece4',marginBottom:28,display:'flex',gap:20,alignItems:'flex-start'}}>
              <div style={{fontSize:'2.5rem',flexShrink:0}}>💡</div>
              <div>
                <h4 style={{fontFamily:"'Playfair Display',serif",color:'#1a3a2a',fontSize:'1rem',marginBottom:8}}>Maximise Your Referral Visibility</h4>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  {[
                    'Use specific categories: "Fungicide", "NPK Fertilizer", "Aphicide"',
                    'Add detailed descriptions — the AI reads them when matching',
                    'Keep products in stock (is_available = true) to stay visible',
                    'List more SKUs across different categories for broader coverage',
                  ].map(tip=>(
                    <div key={tip} style={{display:'flex',gap:8,alignItems:'flex-start'}}>
                      <span style={{color:'#4a8c5c',fontWeight:700,flexShrink:0}}>✓</span>
                      <span style={{fontFamily:"'DM Sans',sans-serif",color:'#374151',fontSize:'.83rem',lineHeight:1.55}}>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Active products in referrals */}
            <h3 style={{fontFamily:"'Playfair Display',serif",color:'#1a3a2a',fontSize:'1.15rem',marginBottom:14}}>
              Your Active Products in Referrals ({products.length})
            </h3>
            {products.length===0 ? (
              <div style={{background:'#fff',borderRadius:14,padding:32,textAlign:'center',border:'1.5px solid #f0ece4',color:'#9ca3af',fontFamily:"'DM Sans',sans-serif",fontSize:'.85rem'}}>
                No products listed yet. Add products to start appearing in farmer recommendations.
              </div>
            ) : (
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:14}}>
                {products.map(p=>(
                  <div key={p.id} style={{background:'#fff',borderRadius:12,padding:'14px 16px',border:'1.5px solid #f0ece4',display:'flex',alignItems:'center',gap:14}}>
                    <div style={{width:46,height:46,borderRadius:9,overflow:'hidden',flexShrink:0}}>
                      <img src={PROD_IMG[p.category]||PROD_IMG.default} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:'#1a3a2a',fontSize:'.88rem',marginBottom:2}}>{p.name}</div>
                      <div style={{fontFamily:"'DM Sans',sans-serif",color:'#9ca3af',fontSize:'.74rem'}}>{p.category} · KES {p.price}</div>
                    </div>
                    <span style={{background:'#dcfce7',color:'#166534',padding:'3px 10px',borderRadius:999,fontFamily:"'DM Sans',sans-serif",fontSize:'.69rem',fontWeight:700,flexShrink:0}}>Active</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ ANALYTICS ══ */}
        {tab==='analytics' && (
          <div>
            <div style={{borderRadius:20,overflow:'hidden',marginBottom:28,position:'relative',height:155}}>
              <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1400&q=80" alt="" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center 40%'}}/>
              <div style={{position:'absolute',inset:0,background:'rgba(26,58,42,.72)'}}/>
              <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',justifyContent:'center',padding:'0 36px'}}>
                <h2 style={{fontFamily:"'Playfair Display',serif",color:'#fff',fontSize:'1.7rem',fontWeight:900,marginBottom:4}}>📊 Sales Analytics</h2>
                <p style={{fontFamily:"'DM Sans',sans-serif",color:'rgba(255,255,255,.65)',fontSize:'.88rem'}}>An overview of your sales, orders, and product performance.</p>
              </div>
            </div>

            {/* Big stat cards */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:18,marginBottom:28}}>
              {[
                {label:'Total Orders',    value:orders.length,    icon:'📦', color:'#3b82f6', sub:'All time'},
                {label:'Pending',         value:pendingOrders,    icon:'⏳', color:'#f59e0b', sub:'Need action'},
                {label:'Delivered',       value:deliveredOrders,  icon:'✅', color:'#10b981', sub:'Completed'},
                {label:'KES Revenue',     value:totalRevenue,     icon:'💰', color:'#e07b2a', sub:'From delivered'},
              ].map(s=>(
                <div key={s.label} style={{background:'#fff',borderRadius:16,padding:'22px 24px',border:'1.5px solid #f0ece4',display:'flex',flexDirection:'column',gap:10}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontFamily:"'DM Sans',sans-serif",color:'#6b7280',fontSize:'.8rem',fontWeight:500}}>{s.label}</span>
                    <span style={{fontSize:'1.5rem'}}>{s.icon}</span>
                  </div>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:'2.2rem',fontWeight:900,color:s.color,lineHeight:1}}>{s.value}</div>
                  <div style={{fontFamily:"'DM Sans',sans-serif",color:'#9ca3af',fontSize:'.74rem'}}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Order list + product breakdown */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
              <div style={{background:'#fff',borderRadius:16,padding:24,border:'1.5px solid #f0ece4'}}>
                <h3 style={{fontFamily:"'Playfair Display',serif",color:'#1a3a2a',fontSize:'1.1rem',marginBottom:16}}>Recent Orders</h3>
                {orders.slice(0,6).map(o=>(
                  <div key={o.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #f3f4f6'}}>
                    <div>
                      <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:'#1a3a2a',fontSize:'.87rem'}}>{o.product_name}</div>
                      <div style={{fontFamily:"'DM Sans',sans-serif",color:'#9ca3af',fontSize:'.73rem'}}>{o.buyer_name}</div>
                    </div>
                    <span style={{fontFamily:"'DM Sans',sans-serif",background:STATUS_STYLES[o.status]?.bg||'#f3f4f6',color:STATUS_STYLES[o.status]?.color||'#374151',padding:'3px 12px',borderRadius:999,fontSize:'.71rem',fontWeight:700,textTransform:'uppercase'}}>
                      {o.status}
                    </span>
                  </div>
                ))}
                {orders.length===0 && <p style={{color:'#9ca3af',fontFamily:"'DM Sans',sans-serif",fontSize:'.85rem',textAlign:'center',padding:'20px 0'}}>No orders yet.</p>}
              </div>

              <div style={{background:'#fff',borderRadius:16,padding:24,border:'1.5px solid #f0ece4'}}>
                <h3 style={{fontFamily:"'Playfair Display',serif",color:'#1a3a2a',fontSize:'1.1rem',marginBottom:16}}>Product Performance</h3>
                {products.length===0 ? (
                  <p style={{color:'#9ca3af',fontFamily:"'DM Sans',sans-serif",fontSize:'.85rem',textAlign:'center',padding:'20px 0'}}>No products listed yet.</p>
                ) : products.map(p=>{
                  const prodOrders = orders.filter(o=>o.product_name===p.name).length;
                  const pct = orders.length>0 ? Math.round((prodOrders/orders.length)*100) : 0;
                  return (
                    <div key={p.id} style={{marginBottom:16}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                        <span style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:'#1a3a2a',fontSize:'.86rem'}}>{p.name}</span>
                        <span style={{fontFamily:"'DM Sans',sans-serif",color:'#6b7280',fontSize:'.8rem'}}>{prodOrders} order{prodOrders!==1?'s':''}</span>
                      </div>
                      <div style={{height:7,background:'#f3f4f6',borderRadius:999,overflow:'hidden'}}>
                        <div style={{height:'100%',width:`${pct}%`,background:'linear-gradient(to right,#4a8c5c,#e07b2a)',borderRadius:999,transition:'width .4s ease'}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}