'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

type Tab = 'overview' | 'marketplace' | 'orders' | 'hubs';

interface Product { id:number; name:string; price:number; quantity:string; category:string; type:string; owner_name:string; }
interface Order   { id:number; product_name:string; quantity:string; status:string; notes:string; }
interface User    { id:number; full_name:string; role:string; }

const HUBS = [
  { name:'Fanaka Hub — Westlands',   location:'Westlands, Nairobi',      hours:'Mon–Sat 7am–6pm',  services:['Grading','Packaging','Pickup','QR Verify'], img:'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80' },
  { name:'Fanaka Hub — Githurai',    location:'Githurai 44, Nairobi',    hours:'Mon–Sat 7am–6pm',  services:['Grading','Packaging','Pickup'],             img:'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=80' },
  { name:'Fanaka Hub — Thika Road',  location:'Garden City, Nairobi',    hours:'Mon–Sun 8am–5pm',  services:['Grading','Pickup'],                         img:'https://images.unsplash.com/photo-1595508064774-5ff825520bb0?w=600&q=80' },
  { name:'Fanaka Hub — Kiambu',      location:'Kiambu Town',             hours:'Mon–Fri 8am–5pm',  services:['Full Services'],                            img:'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&q=80' },
  { name:'Fanaka Hub — Ngong Road',  location:'Ngong Road, Nairobi',     hours:'Mon–Sat 8am–6pm',  services:['Grading','Packaging','Pickup'],             img:'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80' },
  { name:'Fanaka Hub — Ruiru',       location:'Ruiru Town',              hours:'Mon–Fri 7am–5pm',  services:['Grading','Pickup'],                         img:'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&q=80' },
];

const PROD_IMG: Record<string,string> = {
  Vegetables: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80',
  Fruits:     'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&q=80',
  Grains:     'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80',
  Fertilizer: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80',
  Seeds:      'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&q=80',
  default:    'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&q=80',
};

const STATUS_STYLES: Record<string,{bg:string;color:string;bar:string}> = {
  pending:   { bg:'#fef3c7', color:'#92400e', bar:'#f59e0b' },
  confirmed: { bg:'#dbeafe', color:'#1e40af', bar:'#3b82f6' },
  delivered: { bg:'#dcfce7', color:'#166534', bar:'#10b981' },
};

const CATEGORIES = ['All','Vegetables','Fruits','Grains','Seeds','Fertilizer'];

export default function ConsumerDashboard() {
  const router = useRouter();
  const [user, setUser]           = useState<User|null>(null);
  const [tab, setTab]             = useState<Tab>('overview');
  const [products, setProducts]   = useState<Product[]>([]);
  const [orders, setOrders]       = useState<Order[]>([]);
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('All');
  const [orderMsg, setOrderMsg]   = useState<Record<number,string>>({});
  const [loading, setLoading]     = useState(true);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const raw = localStorage.getItem('fanaka_user');
    if (!raw) { router.push('/'); return; }
    const u = JSON.parse(raw);
    if (u.role !== 'consumer') { router.push('/'); return; }
    setUser(u);
    loadProducts();
    loadOrders(u.id);
  }, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/market/products`);
      if (res.ok) setProducts(await res.json());
    } catch {}
    setLoading(false);
  }

  async function loadOrders(id:number) {
    const res = await fetch(`${API}/api/market/orders/buyer/${id}`);
    if (res.ok) setOrders(await res.json());
  }

  async function placeOrder(productId:number) {
    if (!user) return;
    const res = await fetch(`${API}/api/market/orders`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ product_id:productId, buyer_id:user.id, quantity:'1 unit', notes:'' }),
    });
    if (res.ok) {
      setOrderMsg(prev => ({...prev,[productId]:'✅ Ordered!'}));
      setCartCount(c => c+1);
      loadOrders(user.id);
      setTimeout(()=>setOrderMsg(prev=>({...prev,[productId]:''})),3000);
    } else {
      setOrderMsg(prev => ({...prev,[productId]:'❌ Failed'}));
    }
  }

  function logout() { localStorage.clear(); router.push('/'); }

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(q)||(p.category||'').toLowerCase().includes(q);
    const matchCat = category==='All'||(p.category||'').toLowerCase().includes(category.toLowerCase());
    return matchSearch && matchCat;
  });

  const pendingOrders   = orders.filter(o=>o.status==='pending').length;
  const deliveredOrders = orders.filter(o=>o.status==='delivered').length;

  const NAV: {key:Tab;icon:string;label:string}[] = [
    {key:'overview',     icon:'🏠', label:'Overview'},
    {key:'marketplace',  icon:'🛒', label:'Shop'},
    {key:'orders',       icon:'📦', label:'My Orders'},
    {key:'hubs',         icon:'🏪', label:'Fanaka Hubs'},
  ];

  return (
    <div style={{minHeight:'100vh',background:'#f8f5f0',fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .nav-item{transition:all .18s ease;cursor:pointer;}
        .nav-item:hover{background:rgba(224,123,42,.08)!important;color:#e07b2a!important;}
        .pcard{transition:box-shadow .2s,transform .2s;}
        .pcard:hover{box-shadow:0 12px 36px rgba(26,58,42,.12)!important;transform:translateY(-4px);}
        .pcard:hover .pcard-img{transform:scale(1.06);}
        .pcard-img{transition:transform .38s ease;width:100%;height:100%;object-fit:cover;}
        .hub-card{transition:box-shadow .2s,transform .2s;cursor:default;}
        .hub-card:hover{box-shadow:0 12px 32px rgba(26,58,42,.12)!important;transform:translateY(-3px);}
        .hub-card:hover .hub-img{transform:scale(1.05);}
        .hub-img{transition:transform .4s ease;width:100%;height:100%;object-fit:cover;}
        .stat-card{transition:box-shadow .18s,transform .18s;}
        .stat-card:hover{box-shadow:0 8px 28px rgba(26,58,42,.1)!important;transform:translateY(-2px);}
        .add-btn{transition:all .18s ease;font-family:'DM Sans',sans-serif;font-weight:600;cursor:pointer;}
        .add-btn:hover{background:#e07b2a!important;border-color:#e07b2a!important;color:#fff!important;}
        .cat-pill{cursor:pointer;transition:all .2s;}
        .cat-pill:hover{transform:translateY(-3px);}
        .inp{padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:.87rem;outline:none;color:#1a3a2a;transition:border-color .15s;}
        .inp:focus{border-color:#4a8c5c;}
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
              style={{background:tab===n.key?'rgba(224,123,42,.15)':'transparent',border:'none',color:tab===n.key?'#f09448':'rgba(255,255,255,.7)',padding:'8px 16px',borderRadius:8,fontFamily:"'DM Sans',sans-serif",fontWeight:tab===n.key?600:400,fontSize:'.84rem',display:'flex',alignItems:'center',gap:6,borderBottom:tab===n.key?'2px solid #e07b2a':'2px solid transparent',cursor:'pointer'}}>
              {n.icon} {n.label}
            </button>
          ))}
        </div>

        <div style={{display:'flex',alignItems:'center',gap:12}}>
          {/* Cart badge */}
          <div style={{background:'rgba(255,255,255,.1)',borderRadius:999,padding:'5px 14px',display:'flex',alignItems:'center',gap:7,cursor:'pointer'}} onClick={()=>setTab('orders')}>
            <span style={{fontSize:'1rem'}}>🛒</span>
            {cartCount>0 && <span style={{background:'#e07b2a',color:'#fff',borderRadius:999,padding:'1px 7px',fontSize:'.68rem',fontWeight:700}}>{cartCount}</span>}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:7,background:'rgba(255,255,255,.08)',padding:'6px 14px',borderRadius:999}}>
            <span style={{fontSize:'1rem'}}>👤</span>
            <span style={{color:'#fff',fontSize:'.82rem',fontWeight:500}}>{user?.full_name}</span>
          </div>
          <button onClick={logout} style={{background:'transparent',border:'1px solid rgba(255,255,255,.25)',color:'rgba(255,255,255,.7)',padding:'6px 14px',borderRadius:999,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontSize:'.78rem'}}>Logout</button>
        </div>
      </div>

      <div style={{padding:'32px 40px',maxWidth:1280,margin:'0 auto'}}>

        {/* ══ OVERVIEW ══ */}
        {tab==='overview' && (
          <div>
            {/* Hero banner */}
            <div style={{borderRadius:20,overflow:'hidden',marginBottom:28,position:'relative',height:210}}>
              <img src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1400&q=80" alt="" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center 50%'}}/>
              <div style={{position:'absolute',inset:0,background:'linear-gradient(to right,rgba(26,58,42,.9) 0%,rgba(26,58,42,.45) 55%,transparent 100%)'}}/>
              <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',justifyContent:'center',padding:'0 44px'}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",color:'rgba(255,255,255,.6)',fontSize:'.82rem',marginBottom:5}}>Welcome back 🌿</p>
                <h1 style={{fontFamily:"'Playfair Display',serif",color:'#fff',fontSize:'2.1rem',fontWeight:900,marginBottom:14}}>
                  Hello, {user?.full_name?.split(' ')[0]}!
                </h1>
                <div style={{display:'flex',gap:10}}>
                  <button onClick={()=>setTab('marketplace')} style={{background:'#e07b2a',color:'#fff',border:'none',padding:'9px 22px',borderRadius:999,fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'.85rem',cursor:'pointer'}}>
                    🛒 Browse Marketplace
                  </button>
                  <button onClick={()=>setTab('hubs')} style={{background:'rgba(255,255,255,.15)',color:'#fff',border:'1.5px solid rgba(255,255,255,.3)',padding:'9px 22px',borderRadius:999,fontFamily:"'DM Sans',sans-serif",fontWeight:500,fontSize:'.85rem',cursor:'pointer'}}>
                    🏪 Find a Hub
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:18,marginBottom:28}}>
              {[
                {label:'Total Orders',    value:orders.length,   icon:'📦', sub:'All time',          bg:'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80'},
                {label:'Pending',         value:pendingOrders,   icon:'⏳', sub:'Awaiting delivery', bg:'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80'},
                {label:'Delivered',       value:deliveredOrders, icon:'✅', sub:'Completed',         bg:'https://images.unsplash.com/photo-1595508064774-5ff825520bb0?w=400&q=80'},
                {label:'Products Available', value:products.length, icon:'🌾', sub:'On marketplace', bg:'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80'},
              ].map(s=>(
                <div key={s.label} className="stat-card" style={{borderRadius:16,overflow:'hidden',position:'relative',height:128,cursor:'default'}}>
                  <img src={s.bg} alt="" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}/>
                  <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,rgba(26,58,42,.87),rgba(26,58,42,.6))'}}/>
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

            {/* Recent orders + featured products */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
              <div style={{background:'#fff',borderRadius:16,padding:24,border:'1.5px solid #f0ece4'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                  <h3 style={{fontFamily:"'Playfair Display',serif",color:'#1a3a2a',fontSize:'1.1rem'}}>Recent Orders</h3>
                  <button onClick={()=>setTab('orders')} style={{background:'none',border:'none',color:'#e07b2a',fontFamily:"'DM Sans',sans-serif",fontSize:'.8rem',fontWeight:600,cursor:'pointer'}}>View all →</button>
                </div>
                {orders.length===0 ? (
                  <div style={{textAlign:'center',padding:'24px 0',color:'#9ca3af',fontFamily:"'DM Sans',sans-serif",fontSize:'.85rem'}}>No orders yet. Start shopping!</div>
                ) : orders.slice(0,5).map(o=>(
                  <div key={o.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #f3f4f6'}}>
                    <div style={{display:'flex',alignItems:'center',gap:12}}>
                      <div style={{width:40,height:40,borderRadius:8,overflow:'hidden',flexShrink:0}}>
                        <img src={PROD_IMG[o.product_name]||PROD_IMG.default} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                      </div>
                      <div>
                        <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:'#1a3a2a',fontSize:'.87rem'}}>{o.product_name}</div>
                        <div style={{fontFamily:"'DM Sans',sans-serif",color:'#9ca3af',fontSize:'.73rem'}}>{o.quantity}</div>
                      </div>
                    </div>
                    <span style={{fontFamily:"'DM Sans',sans-serif",background:STATUS_STYLES[o.status]?.bg||'#f3f4f6',color:STATUS_STYLES[o.status]?.color||'#374151',padding:'3px 12px',borderRadius:999,fontSize:'.71rem',fontWeight:700,textTransform:'uppercase'}}>
                      {o.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Featured products quick-buy */}
              <div style={{background:'#fff',borderRadius:16,padding:24,border:'1.5px solid #f0ece4'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                  <h3 style={{fontFamily:"'Playfair Display',serif",color:'#1a3a2a',fontSize:'1.1rem'}}>Featured Products</h3>
                  <button onClick={()=>setTab('marketplace')} style={{background:'none',border:'none',color:'#e07b2a',fontFamily:"'DM Sans',sans-serif",fontSize:'.8rem',fontWeight:600,cursor:'pointer'}}>Shop all →</button>
                </div>
                {products.slice(0,4).map(p=>(
                  <div key={p.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #f3f4f6'}}>
                    <div style={{display:'flex',alignItems:'center',gap:12}}>
                      <div style={{width:44,height:44,borderRadius:9,overflow:'hidden',flexShrink:0}}>
                        <img src={PROD_IMG[p.category]||PROD_IMG.default} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                      </div>
                      <div>
                        <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:'#1a3a2a',fontSize:'.87rem'}}>{p.name}</div>
                        <div style={{fontFamily:"'DM Sans',sans-serif",color:'#9ca3af',fontSize:'.73rem'}}>{p.quantity} · by {p.owner_name}</div>
                      </div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
                      <span style={{fontFamily:"'DM Sans',sans-serif",fontWeight:800,color:'#1a3a2a',fontSize:'.9rem'}}>KES {p.price}</span>
                      <button className="add-btn" onClick={()=>placeOrder(p.id)}
                        style={{background:'#fff',color:'#1a3a2a',border:'1.5px solid #1a3a2a',padding:'5px 14px',borderRadius:8,fontSize:'.76rem'}}>
                        {orderMsg[p.id]||'Order'}
                      </button>
                    </div>
                  </div>
                ))}
                {products.length===0 && <div style={{textAlign:'center',padding:'24px 0',color:'#9ca3af',fontFamily:"'DM Sans',sans-serif",fontSize:'.85rem'}}>No products yet.</div>}
              </div>
            </div>
          </div>
        )}

        {/* ══ MARKETPLACE SHOP ══ */}
        {tab==='marketplace' && (
          <div>
            {/* Banner */}
            <div style={{borderRadius:20,overflow:'hidden',marginBottom:28,position:'relative',height:160}}>
              <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1400&q=80" alt="" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center 40%'}}/>
              <div style={{position:'absolute',inset:0,background:'rgba(26,58,42,.72)'}}/>
              <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',justifyContent:'center',padding:'0 36px'}}>
                <h2 style={{fontFamily:"'Playfair Display',serif",color:'#fff',fontSize:'1.7rem',fontWeight:900,marginBottom:4}}>🛒 Shop Certified Products</h2>
                <p style={{fontFamily:"'DM Sans',sans-serif",color:'rgba(255,255,255,.65)',fontSize:'.88rem'}}>Browse fresh crops and certified inputs from verified farmers and agrovets.</p>
              </div>
            </div>

            {/* Category pills */}
            <div style={{display:'flex',gap:10,marginBottom:20,flexWrap:'wrap'}}>
              {CATEGORIES.map(cat=>(
                <div key={cat} className="cat-pill" onClick={()=>setCategory(cat)}
                  style={{padding:'7px 18px',borderRadius:999,border:`1.5px solid ${category===cat?'#e07b2a':'#e5e7eb'}`,background:category===cat?'#e07b2a':'#fff',color:category===cat?'#fff':'#374151',fontFamily:"'DM Sans',sans-serif",fontWeight:category===cat?600:400,fontSize:'.83rem'}}>
                  {cat}
                </div>
              ))}
              {/* Search */}
              <div style={{marginLeft:'auto',display:'flex',border:'1.5px solid #e5e7eb',borderRadius:999,overflow:'hidden'}}>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products..." className="inp"
                  style={{borderRadius:0,border:'none',width:220,padding:'7px 16px'}}/>
                <div style={{background:'#e07b2a',display:'flex',alignItems:'center',padding:'0 16px'}}>
                  <span style={{color:'#fff',fontSize:'.9rem'}}>🔍</span>
                </div>
              </div>
            </div>

            {/* Product grid */}
            {loading ? (
              <div style={{textAlign:'center',padding:60,color:'#9ca3af',fontFamily:"'DM Sans',sans-serif"}}>Loading products...</div>
            ) : filtered.length===0 ? (
              <div style={{textAlign:'center',padding:60}}>
                <div style={{fontSize:'3rem',marginBottom:12}}>🌱</div>
                <p style={{fontFamily:"'Playfair Display',serif",color:'#1a3a2a',fontSize:'1.1rem',marginBottom:6}}>No products found</p>
                <p style={{fontFamily:"'DM Sans',sans-serif",color:'#9ca3af',fontSize:'.85rem'}}>Try a different category or search term.</p>
              </div>
            ) : (
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))',gap:20}}>
                {filtered.map(p=>(
                  <div key={p.id} className="pcard" style={{background:'#fff',borderRadius:14,overflow:'hidden',border:'1.5px solid #f0ece4'}}>
                    <div style={{height:180,overflow:'hidden',position:'relative'}}>
                      <img className="pcard-img" src={PROD_IMG[p.category]||PROD_IMG.default} alt={p.name}/>
                      <div style={{position:'absolute',top:9,left:9,background:'rgba(255,255,255,.92)',borderRadius:5,padding:'2px 8px',fontFamily:"'DM Sans',sans-serif",fontSize:'.67rem',color:'#374151',fontWeight:600}}>{p.quantity}</div>
                      <div style={{position:'absolute',top:11,right:11,width:9,height:9,background:'#10b981',borderRadius:'50%',boxShadow:'0 0 0 2px rgba(16,185,129,.25)'}}/>
                      <div style={{position:'absolute',bottom:0,left:0,right:0,height:36,background:'linear-gradient(to top,rgba(26,58,42,.4),transparent)'}}/>
                    </div>
                    <div style={{padding:'13px 15px 16px'}}>
                      <div style={{fontFamily:"'DM Sans',sans-serif",color:'#e07b2a',fontSize:'.68rem',fontWeight:700,textTransform:'uppercase',letterSpacing:.5,marginBottom:4}}>{p.category||(p.type==='crop'?'Crop':'Input')}</div>
                      <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,color:'#1a3a2a',fontSize:'.95rem',marginBottom:3,lineHeight:1.25}}>{p.name}</div>
                      <div style={{fontFamily:"'DM Sans',sans-serif",color:'#9ca3af',fontSize:'.72rem',marginBottom:9}}>by {p.owner_name}</div>
                      <div style={{display:'flex',alignItems:'baseline',gap:6,marginBottom:12}}>
                        <span style={{fontFamily:"'DM Sans',sans-serif",fontWeight:800,color:'#1a3a2a',fontSize:'.98rem'}}>KES {p.price}</span>
                        <span style={{fontFamily:"'DM Sans',sans-serif",color:'#d1d5db',textDecoration:'line-through',fontSize:'.76rem'}}>KES {Math.round(p.price*1.2)}</span>
                      </div>
                      <button className="add-btn" onClick={()=>placeOrder(p.id)}
                        style={{width:'100%',background:orderMsg[p.id]?'#10b981':'#fff',color:orderMsg[p.id]?'#fff':'#1a3a2a',border:'1.5px solid #1a3a2a',padding:'9px',borderRadius:9,fontSize:'.82rem'}}>
                        {orderMsg[p.id]||'Add to Order'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ MY ORDERS ══ */}
        {tab==='orders' && (
          <div>
            <div style={{borderRadius:20,overflow:'hidden',marginBottom:28,position:'relative',height:150}}>
              <img src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1400&q=80" alt="" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center 40%'}}/>
              <div style={{position:'absolute',inset:0,background:'rgba(26,58,42,.72)'}}/>
              <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',justifyContent:'center',padding:'0 36px'}}>
                <h2 style={{fontFamily:"'Playfair Display',serif",color:'#fff',fontSize:'1.7rem',fontWeight:900,marginBottom:4}}>📦 My Orders</h2>
                <p style={{fontFamily:"'DM Sans',sans-serif",color:'rgba(255,255,255,.65)',fontSize:'.88rem'}}>Track everything you&apos;ve ordered from the marketplace.</p>
              </div>
            </div>

            {/* Summary pills */}
            <div style={{display:'flex',gap:12,marginBottom:24,flexWrap:'wrap'}}>
              {[
                {label:'All Orders',    value:orders.length,   color:'#1a3a2a'},
                {label:'Pending',       value:pendingOrders,   color:'#92400e'},
                {label:'Delivered',     value:deliveredOrders, color:'#166534'},
              ].map(s=>(
                <div key={s.label} style={{background:'#fff',border:'1.5px solid #f0ece4',borderRadius:12,padding:'12px 20px',display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontFamily:"'Playfair Display',serif",fontSize:'1.5rem',fontWeight:900,color:s.color}}>{s.value}</span>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:'.82rem',color:'#6b7280'}}>{s.label}</span>
                </div>
              ))}
            </div>

            {orders.length===0 ? (
              <div style={{background:'#fff',borderRadius:18,padding:56,textAlign:'center',border:'1.5px solid #f0ece4'}}>
                <img src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=300&q=80" alt="" style={{width:120,height:120,objectFit:'cover',borderRadius:'50%',marginBottom:16,opacity:.55}}/>
                <p style={{fontFamily:"'Playfair Display',serif",color:'#1a3a2a',fontSize:'1.1rem',marginBottom:6}}>No orders yet</p>
                <p style={{fontFamily:"'DM Sans',sans-serif",color:'#9ca3af',fontSize:'.85rem',marginBottom:16}}>Browse the marketplace to place your first order.</p>
                <button onClick={()=>setTab('marketplace')} style={{background:'#e07b2a',color:'#fff',border:'none',padding:'10px 24px',borderRadius:999,fontFamily:"'DM Sans',sans-serif",fontWeight:600,cursor:'pointer',fontSize:'.88rem'}}>Browse Marketplace</button>
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                {orders.map(o=>(
                  <div key={o.id} style={{background:'#fff',borderRadius:14,overflow:'hidden',border:'1.5px solid #f0ece4',display:'flex',alignItems:'stretch'}}>
                    <div style={{width:6,background:STATUS_STYLES[o.status]?.bar||'#e5e7eb',flexShrink:0}}/>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flex:1,padding:'16px 22px',flexWrap:'wrap',gap:12}}>
                      <div style={{display:'flex',alignItems:'center',gap:16}}>
                        <div style={{width:52,height:52,borderRadius:11,overflow:'hidden',flexShrink:0}}>
                          <img src={PROD_IMG[o.product_name]||PROD_IMG.default} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                        </div>
                        <div>
                          <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,color:'#1a3a2a',fontSize:'1rem',marginBottom:3}}>{o.product_name}</div>
                          <div style={{fontFamily:"'DM Sans',sans-serif",color:'#6b7280',fontSize:'.82rem'}}>Quantity: {o.quantity}</div>
                          {o.notes && <div style={{fontFamily:"'DM Sans',sans-serif",color:'#9ca3af',fontSize:'.75rem',marginTop:2}}>{o.notes}</div>}
                        </div>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:12}}>
                        <span style={{fontFamily:"'DM Sans',sans-serif",background:STATUS_STYLES[o.status]?.bg||'#f3f4f6',color:STATUS_STYLES[o.status]?.color||'#374151',padding:'5px 16px',borderRadius:999,fontSize:'.74rem',fontWeight:700,textTransform:'uppercase'}}>
                          {o.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ FANAKA HUBS ══ */}
        {tab==='hubs' && (
          <div>
            <div style={{borderRadius:20,overflow:'hidden',marginBottom:28,position:'relative',height:160}}>
              <img src="https://images.unsplash.com/photo-1595508064774-5ff825520bb0?w=1400&q=80" alt="" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center 35%'}}/>
              <div style={{position:'absolute',inset:0,background:'rgba(26,58,42,.72)'}}/>
              <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',justifyContent:'center',padding:'0 36px'}}>
                <h2 style={{fontFamily:"'Playfair Display',serif",color:'#fff',fontSize:'1.7rem',fontWeight:900,marginBottom:4}}>🏪 Nearby Fanaka Hubs</h2>
                <p style={{fontFamily:"'DM Sans',sans-serif",color:'rgba(255,255,255,.65)',fontSize:'.88rem'}}>Visit a hub to pick up orders, verify quality, or scan product QR codes.</p>
              </div>
            </div>

            {/* What to expect strip */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:28}}>
              {[
                {icon:'📦', label:'Order Pickup',   desc:'Collect your marketplace orders same-day'},
                {icon:'✅', label:'Quality Check',  desc:'Every product inspected & graded on-site'},
                {icon:'📱', label:'QR Verification',desc:'Scan any product to verify its origin & grade'},
                {icon:'🧊', label:'Cold Storage',   desc:'Keep produce fresh with hub cold chain'},
              ].map(f=>(
                <div key={f.label} style={{background:'#fff',borderRadius:14,padding:'18px 16px',border:'1.5px solid #f0ece4',textAlign:'center'}}>
                  <div style={{fontSize:'1.8rem',marginBottom:8}}>{f.icon}</div>
                  <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:700,color:'#1a3a2a',fontSize:'.88rem',marginBottom:5}}>{f.label}</div>
                  <div style={{fontFamily:"'DM Sans',sans-serif",color:'#9ca3af',fontSize:'.78rem',lineHeight:1.5}}>{f.desc}</div>
                </div>
              ))}
            </div>

            {/* Hub cards */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
              {HUBS.map(h=>(
                <div key={h.name} className="hub-card" style={{background:'#fff',borderRadius:16,overflow:'hidden',border:'1.5px solid #f0ece4'}}>
                  <div style={{height:170,overflow:'hidden',position:'relative'}}>
                    <img className="hub-img" src={h.img} alt={h.name}/>
                    <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(26,58,42,.75) 0%,transparent 55%)'}}/>
                    <div style={{position:'absolute',bottom:14,left:16}}>
                      <div style={{fontFamily:"'Playfair Display',serif",color:'#fff',fontWeight:700,fontSize:'1rem',marginBottom:2}}>{h.name}</div>
                      <div style={{fontFamily:"'DM Sans',sans-serif",color:'rgba(255,255,255,.7)',fontSize:'.75rem'}}>📍 {h.location}</div>
                    </div>
                  </div>
                  <div style={{padding:'16px 18px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:12}}>
                      <span style={{fontFamily:"'DM Sans',sans-serif",color:'#6b7280',fontSize:'.8rem'}}>🕐 {h.hours}</span>
                    </div>
                    <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                      {h.services.map(s=>(
                        <span key={s} style={{background:'#f5f0e8',color:'#1a3a2a',borderRadius:999,padding:'3px 10px',fontFamily:"'DM Sans',sans-serif",fontSize:'.72rem',fontWeight:600}}>{s}</span>
                      ))}
                    </div>
                    <button style={{marginTop:14,width:'100%',background:'#1a3a2a',color:'#fff',border:'none',padding:'9px',borderRadius:9,fontFamily:"'DM Sans',sans-serif",fontWeight:600,cursor:'pointer',fontSize:'.82rem',transition:'background .18s'}}
                      onMouseEnter={e=>(e.currentTarget.style.background='#e07b2a')}
                      onMouseLeave={e=>(e.currentTarget.style.background='#1a3a2a')}>
                      Get Directions →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}