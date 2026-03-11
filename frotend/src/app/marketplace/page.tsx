'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// ADDED: Import your MpesaCheckout component
import MpesaCheckout from '@/components/checkout/MpesaCheckout';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: string;
  category: string;
  type: string;
  owner_name: string;
  description: string;
}
interface User { id: number; full_name: string; role: string; }

const CATEGORIES = ['All','Vegetables','Fruits','Grains','Fertilizer','Pesticide','Seeds','Livestock'];

const CAT_IMG: Record<string,string> = {
  All:        'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&q=80',
  Vegetables: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&q=80',
  Fruits:     'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=300&q=80',
  Grains:     'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&q=80',
  Fertilizer: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&q=80',
  Pesticide:  'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=300&q=80',
  Seeds:      'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=300&q=80',
  Livestock:  'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=300&q=80',
};

const PROD_IMG: Record<string,string> = {
  Vegetables: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80',
  Fruits:     'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&q=80',
  Grains:     'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80',
  Fertilizer: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80',
  Pesticide:  'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&q=80',
  Seeds:      'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&q=80',
  Livestock:  'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400&q=80',
  crop:       'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&q=80',
  input:      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80',
};

const PAGE_SIZE = 10;

export default function Marketplace() {
  const router = useRouter();
  const [user, setUser]           = useState<User | null>(null);
  const [products, setProducts]   = useState<Product[]>([]);
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('All');
  const [sort, setSort]           = useState('default');
  const [page, setPage]           = useState(1);
  const [orderMsg, setOrderMsg]   = useState<Record<number,string>>({});
  const [loading, setLoading]     = useState(true);
  const [cartCount, setCartCount] = useState(0);

  // ADDED: States to track actual cart items and control the checkout modal
  const [cartItems, setCartItems] = useState<(Product & { qty: number })[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('fanaka_user');
    if (!raw) { router.push('/'); return; }
    setUser(JSON.parse(raw));
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/market/products`);
      if (res.ok) setProducts(await res.json());
    } catch {}
    setLoading(false);
  }

  async function placeOrder(productId: number) {
    if (!user) return;
    const res = await fetch(`${API}/api/market/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, buyer_id: user.id, quantity: '1 unit', notes: '' }),
    });
    if (res.ok) {
      setOrderMsg(prev => ({ ...prev, [productId]: '✅ Ordered!' }));
      setCartCount(c => c + 1);

      // ADDED: Push the selected item into the cart state so we can calculate the total
      const prod = products.find(p => p.id === productId);
      if (prod) {
        setCartItems(prev => {
          const existing = prev.find(item => item.id === productId);
          if (existing) return prev.map(item => item.id === productId ? { ...item, qty: item.qty + 1 } : item);
          return [...prev, { ...prod, qty: 1 }];
        });
      }

      setTimeout(() => setOrderMsg(prev => ({ ...prev, [productId]: '' })), 3000);
    } else {
      setOrderMsg(prev => ({ ...prev, [productId]: '❌ Failed' }));
    }
  }

  function goBack() {
    if (!user) return;
    if (user.role === 'farmer') router.push('/dashboard/farmer');
    else if (user.role === 'consumer') router.push('/dashboard/consumer');
    else router.push('/dashboard/agrovet');
  }

  let filtered = products.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(q) || (p.category||'').toLowerCase().includes(q);
    const matchCat = category === 'All' || (p.category||'').toLowerCase().includes(category.toLowerCase());
    return matchSearch && matchCat;
  });

  if (sort === 'price-asc')  filtered = [...filtered].sort((a,b) => a.price - b.price);
  if (sort === 'price-desc') filtered = [...filtered].sort((a,b) => b.price - a.price);
  if (sort === 'name')       filtered = [...filtered].sort((a,b) => a.name.localeCompare(b.name));

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  function getProdImg(p: Product) {
    return PROD_IMG[p.category] || PROD_IMG[p.type] || PROD_IMG.crop;
  }

  // ADDED: Calculate the accumulated total dynamically
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <div style={{ minHeight:'100vh', background:'#fff', fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'DM Sans',sans-serif;}
        .cat-pill{cursor:pointer;transition:all .22s ease;}
        .cat-pill:hover{transform:translateY(-5px);}
        .pcard{transition:box-shadow .2s ease, transform .2s ease;}
        .pcard:hover{box-shadow:0 12px 36px rgba(26,58,42,.12)!important;transform:translateY(-4px);}
        .pcard:hover .pcard-img{transform:scale(1.07);}
        .pcard-img{transition:transform .4s ease;width:100%;height:100%;object-fit:cover;}
        .add-btn{transition:all .18s ease;}
        .add-btn:hover{background:#e07b2a!important;border-color:#e07b2a!important;}
        .nav-a{transition:color .15s;}
        .nav-a:hover{color:#e07b2a!important;}
        .soc-btn{transition:background .15s;}
        .soc-btn:hover{background:#e07b2a!important;color:#fff!important;}
      `}</style>

      {/* ── TOP INFO BAR ── */}
      <div style={{background:'#1a3a2a',padding:'7px 56px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{display:'flex',gap:24,alignItems:'center'}}>
          <span style={{color:'rgba(255,255,255,.6)',fontSize:'.74rem'}}>📞 (+254) 700-000-000</span>
          <span style={{color:'rgba(255,255,255,.6)',fontSize:'.74rem'}}>✉ info@fanaka.ag</span>
        </div>
        <div style={{display:'flex',gap:16,alignItems:'center'}}>
          <span style={{color:'rgba(255,255,255,.5)',fontSize:'.74rem'}}>KES ▾</span>
          <span style={{color:'rgba(255,255,255,.5)',fontSize:'.74rem'}}>English ▾</span>
          {/* UPDATED: Added onClick to open the checkout modal when the cart is clicked */}
          <div 
            onClick={() => cartCount > 0 && setShowCheckout(true)}
            style={{background:'#e07b2a',borderRadius:999,padding:'3px 10px',display:'flex',alignItems:'center',gap:6, cursor: cartCount > 0 ? 'pointer' : 'default'}}
          >
            <span style={{fontSize:'.7rem'}}>🛒</span>
            <span style={{color:'#fff',fontWeight:700,fontSize:'.74rem'}}>{cartCount}</span>
          </div>
        </div>
      </div>

      {/* ── NAVBAR ── */}
      <nav style={{background:'#fff',borderBottom:'1.5px solid #f0ece4',padding:'0 56px',display:'flex',alignItems:'center',gap:36,height:74,position:'sticky',top:0,zIndex:100,boxShadow:'0 2px 14px rgba(0,0,0,.05)'}}>
        <div onClick={goBack} style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer',flexShrink:0}}>
          <svg width="38" height="38" viewBox="0 0 32 32" fill="none">
            <path d="M16 3C16 3 6 10 6 18a10 10 0 0020 0C26 10 16 3 16 3z" fill="#4a8c5c"/>
            <path d="M16 10v14M11 15l5-5 5 5" stroke="#f09448" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontWeight:900,color:'#1a3a2a',fontSize:'1.05rem',lineHeight:1.1,letterSpacing:.5}}>FANAKA</div>
            <div style={{fontSize:'.58rem',color:'#e07b2a',fontWeight:700,letterSpacing:2.5,textTransform:'uppercase'}}>AGROSMART</div>
          </div>
        </div>

        <div style={{display:'flex',gap:26,flex:1,justifyContent:'center'}}>
          {['Home','Shop','About','Pages','Blog','Contact'].map(l=>(
            <a key={l} href="#" className="nav-a" style={{color:l==='Shop'?'#e07b2a':'#374151',textDecoration:'none',fontWeight:l==='Shop'?600:400,fontSize:'.88rem',paddingBottom:4,borderBottom:l==='Shop'?'2px solid #e07b2a':'2px solid transparent'}}>
              {l}
            </a>
          ))}
        </div>

        {/* Search */}
        <div style={{display:'flex',border:'1.5px solid #e5e7eb',borderRadius:8,overflow:'hidden',width:260}}>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}
            placeholder="Type here..."
            style={{flex:1,padding:'10px 14px',border:'none',outline:'none',fontFamily:"'DM Sans',sans-serif",fontSize:'.84rem',color:'#374151'}}/>
          <button style={{background:'#e07b2a',color:'#fff',border:'none',padding:'0 18px',cursor:'pointer',fontWeight:700,fontSize:'.83rem',fontFamily:"'DM Sans',sans-serif"}}>Search</button>
        </div>

        <div style={{display:'flex',alignItems:'center',gap:14}}>
          <button onClick={goBack} style={{background:'none',border:'1.5px solid #e5e7eb',borderRadius:8,cursor:'pointer',color:'#6b7280',fontSize:'.8rem',padding:'7px 14px',fontFamily:"'DM Sans',sans-serif",fontWeight:500}}>← Dashboard</button>
          <div style={{display:'flex',alignItems:'center',gap:6,background:'#f5f0e8',padding:'7px 14px',borderRadius:999}}>
            <span style={{fontSize:'.85rem'}}>👤</span>
            <span style={{fontSize:'.8rem',fontWeight:600,color:'#1a3a2a'}}>{user?.full_name}</span>
          </div>
        </div>
      </nav>

      {/* ── HERO BANNER ── */}
      <div style={{position:'relative',height:280,overflow:'hidden'}}>
        <img src="https://images.unsplash.com/photo-1595508064774-5ff825520bb0?w=1600&q=80" alt=""
          style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center 30%'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(10,28,18,.55),rgba(10,28,18,.72))'}}/>
        <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center'}}>
          <h1 style={{fontFamily:"'Playfair Display',serif",color:'#fff',fontSize:'2.8rem',fontWeight:900,marginBottom:8,letterSpacing:.5}}>Shop</h1>
          <p style={{fontFamily:"'DM Sans',sans-serif",color:'rgba(255,255,255,.6)',fontSize:'.88rem'}}>Home / Shop</p>
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <div style={{padding:'52px 56px 36px',textAlign:'center',background:'#fff'}}>
        <p style={{fontFamily:"'Playfair Display',serif",fontStyle:'italic',color:'#e07b2a',fontSize:'1.1rem',marginBottom:6}}>When produce is certified</p>
        <h2 style={{fontFamily:"'Playfair Display',serif",color:'#1a3a2a',fontSize:'1.75rem',fontWeight:700,marginBottom:40}}>Shop Our Organic Products</h2>
        <div style={{display:'flex',gap:24,justifyContent:'center',flexWrap:'wrap'}}>
          {CATEGORIES.map(cat=>{
            const active = category===cat;
            return (
              <div key={cat} className="cat-pill" onClick={()=>{setCategory(cat);setPage(1);}} style={{textAlign:'center',width:104}}>
                <div style={{
                  width:96,height:96,borderRadius:'50%',margin:'0 auto 11px',
                  border:active?'3px solid #e07b2a':'3px solid #e9e4da',
                  overflow:'hidden',position:'relative',
                  boxShadow:active?'0 6px 20px rgba(224,123,42,.3)':'0 2px 8px rgba(0,0,0,.06)',
                  transition:'all .22s',
                }}>
                  <img src={CAT_IMG[cat]} alt={cat} style={{width:'100%',height:'100%',objectFit:'cover',filter:active?'none':'grayscale(15%)',transition:'filter .22s'}}/>
                  {active && <div style={{position:'absolute',inset:0,background:'rgba(224,123,42,.12)'}}/>}
                </div>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:'.85rem',fontWeight:active?700:400,color:active?'#e07b2a':'#374151'}}>
                  {cat}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SORT/COUNT BAR ── */}
      <div style={{padding:'12px 56px',background:'#fafaf8',borderTop:'1px solid #ede9e1',borderBottom:'1px solid #ede9e1',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <span style={{fontFamily:"'DM Sans',sans-serif",color:'#6b7280',fontSize:'.82rem'}}>
          Showing {filtered.length===0?0:(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE,filtered.length)} of {filtered.length} items
        </span>
        <select value={sort} onChange={e=>setSort(e.target.value)}
          style={{padding:'8px 14px',border:'1.5px solid #e5e7eb',borderRadius:8,fontFamily:"'DM Sans',sans-serif",fontSize:'.83rem',outline:'none',cursor:'pointer',color:'#374151',background:'#fff'}}>
          <option value="default">Default Sorting</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      {/* ── PRODUCT GRID ── */}
      <div style={{padding:'36px 56px 56px',background:'#fff'}}>
        {loading ? (
          <div style={{textAlign:'center',padding:80,color:'#9ca3af',fontFamily:"'DM Sans',sans-serif"}}>
            <div style={{fontSize:'3rem',marginBottom:14}}>🌾</div>
            Loading products...
          </div>
        ) : paginated.length===0 ? (
          <div style={{textAlign:'center',padding:80}}>
            <div style={{fontSize:'3.5rem',marginBottom:14}}>🌱</div>
            <p style={{fontFamily:"'Playfair Display',serif",color:'#1a3a2a',fontSize:'1.2rem',marginBottom:8}}>No products found</p>
            <p style={{fontFamily:"'DM Sans',sans-serif",color:'#9ca3af',fontSize:'.88rem'}}>Try a different search or category</p>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:20}}>
            {paginated.map(p=>(
              <div key={p.id} className="pcard" style={{background:'#fff',borderRadius:12,border:'1.5px solid #f0ece4',overflow:'hidden'}}>
                {/* Image */}
                <div style={{height:190,overflow:'hidden',position:'relative',background:'#f8f5f0'}}>
                  <img src={getProdImg(p)} alt={p.name} className="pcard-img"/>
                  {/* unit badge */}
                  <div style={{position:'absolute',top:9,left:9,background:'rgba(255,255,255,.92)',borderRadius:5,padding:'2px 8px',fontFamily:"'DM Sans',sans-serif",fontSize:'.68rem',color:'#374151',fontWeight:600,letterSpacing:.3}}>
                    {p.quantity}
                  </div>
                  {/* live dot */}
                  <div style={{position:'absolute',top:11,right:11,width:9,height:9,background:'#10b981',borderRadius:'50%',boxShadow:'0 0 0 2px rgba(16,185,129,.25)'}}/>
                </div>

                {/* Card body */}
                <div style={{padding:'13px 14px 16px'}}>
                  <div style={{fontFamily:"'DM Sans',sans-serif",color:'#e07b2a',fontSize:'.69rem',fontWeight:600,textTransform:'uppercase',letterSpacing:.5,marginBottom:5}}>
                    {p.category || (p.type==='crop'?'Crop':'Input')}
                  </div>
                  <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,color:'#1a3a2a',fontSize:'.95rem',marginBottom:3,lineHeight:1.3}}>
                    {p.name}
                  </div>
                  <div style={{fontFamily:"'DM Sans',sans-serif",color:'#9ca3af',fontSize:'.72rem',marginBottom:9}}>
                    by {p.owner_name}
                  </div>
                  <div style={{display:'flex',alignItems:'baseline',gap:7,marginBottom:13}}>
                    <span style={{fontFamily:"'DM Sans',sans-serif",color:'#1a3a2a',fontWeight:800,fontSize:'1rem'}}>KES {p.price}</span>
                    <span style={{fontFamily:"'DM Sans',sans-serif",color:'#d1d5db',textDecoration:'line-through',fontSize:'.78rem'}}>KES {Math.round(p.price*1.2)}</span>
                  </div>
                  <button className="add-btn" onClick={()=>placeOrder(p.id)}
                    style={{width:'100%',background:orderMsg[p.id]?'#10b981':'#fff',color:orderMsg[p.id]?'#fff':'#1a3a2a',border:'1.5px solid #1a3a2a',padding:'9px',borderRadius:8,fontFamily:"'DM Sans',sans-serif",fontWeight:600,cursor:'pointer',fontSize:'.81rem',transition:'all .18s'}}>
                    {orderMsg[p.id] || 'Add to Order'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── PAGINATION ── */}
        {totalPages>1 && (
          <div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:6,marginTop:48}}>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
              style={{padding:'8px 16px',border:'1.5px solid #e5e7eb',borderRadius:8,background:'#fff',cursor:page===1?'not-allowed':'pointer',color:page===1?'#d1d5db':'#374151',fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:'.85rem'}}>←</button>
            {Array.from({length:Math.min(totalPages,5)},(_,i)=>i+1).map(n=>(
              <button key={n} onClick={()=>setPage(n)}
                style={{width:38,height:38,border:`1.5px solid ${page===n?'#e07b2a':'#e5e7eb'}`,borderRadius:8,background:page===n?'#e07b2a':'#fff',color:page===n?'#fff':'#374151',fontFamily:"'DM Sans',sans-serif",fontWeight:700,cursor:'pointer',fontSize:'.88rem'}}>
                {n}
              </button>
            ))}
            {totalPages>5 && <span style={{color:'#9ca3af',fontFamily:"'DM Sans',sans-serif",letterSpacing:2}}>· · · {totalPages}</span>}
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
              style={{padding:'8px 16px',border:'1.5px solid #e5e7eb',borderRadius:8,background:'#fff',cursor:page===totalPages?'not-allowed':'pointer',color:page===totalPages?'#d1d5db':'#374151',fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:'.85rem'}}>→</button>
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <footer style={{background:'#1a3a2a',padding:'52px 56px 24px'}}>
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr',gap:40,marginBottom:40}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:16}}>
              <svg width="30" height="30" viewBox="0 0 32 32" fill="none"><path d="M16 3C16 3 6 10 6 18a10 10 0 0020 0C26 10 16 3 16 3z" fill="#4a8c5c"/><path d="M16 10v14M11 15l5-5 5 5" stroke="#f09448" strokeWidth="1.8" strokeLinecap="round"/></svg>
              <div style={{fontFamily:"'Playfair Display',serif",color:'#fff',fontWeight:700,fontSize:'.98rem'}}>FANAKA <span style={{color:'#f09448'}}>AGROSMART</span></div>
            </div>
            <p style={{fontFamily:"'DM Sans',sans-serif",color:'rgba(255,255,255,.42)',fontSize:'.8rem',lineHeight:1.8,maxWidth:220}}>
              Connecting farmers, agrovets, and consumers through a trusted agricultural ecosystem.
            </p>
          </div>
          {[
            {title:'Useful Pages', links:['About Us','Contact','Help Center','Career','Policy','Flash Sale']},
            {title:'Help Center',  links:['Payments','Shipping','Product Returns','FAQ','Checkout','Other Issues']},
            {title:'Contacts',     links:['📍 Nairobi, Kenya','📞 +254 700 000 000','📞 +254 711 000 000','✉ info@fanaka.ag']},
            {title:'Store Information', links:['Store Info','About Store','Bestsellers','Latest Products','New Discounts','Sale Products']},
          ].map(col=>(
            <div key={col.title}>
              <h5 style={{fontFamily:"'DM Sans',sans-serif",color:'#fff',fontWeight:600,marginBottom:16,fontSize:'.86rem'}}>{col.title}</h5>
              <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:9}}>
                {col.links.map(l=>(
                  <li key={l}><a href="#" className="nav-a" style={{fontFamily:"'DM Sans',sans-serif",color:'rgba(255,255,255,.42)',textDecoration:'none',fontSize:'.79rem'}}>{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Download App badges */}
        <div style={{borderTop:'1px solid rgba(255,255,255,.08)',paddingTop:24,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:14}}>
          <div style={{display:'flex',gap:20}}>
            {['Home','About Us','Blogs','Shop','Contact us'].map(l=>(
              <a key={l} href="#" className="nav-a" style={{fontFamily:"'DM Sans',sans-serif",color:'rgba(255,255,255,.35)',textDecoration:'none',fontSize:'.74rem'}}>{l}</a>
            ))}
          </div>
          <p style={{fontFamily:"'DM Sans',sans-serif",color:'rgba(255,255,255,.28)',fontSize:'.74rem'}}>© 2025 Fanaka AGROSMART. All Rights Reserved.</p>
          <div style={{display:'flex',gap:9}}>
            {['𝕏','in','f','▶'].map(s=>(
              <a key={s} href="#" className="soc-btn" style={{width:32,height:32,borderRadius:'50%',background:'rgba(255,255,255,.08)',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,.5)',fontSize:'.74rem',textDecoration:'none'}}>{s}</a>
            ))}
          </div>
        </div>
      </footer>

      {/* ADDED: The M-Pesa Checkout Modal Overlay */}
      {showCheckout && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:999, display:'flex', justifyContent:'center', alignItems:'center'}}>
          <div style={{background:'#fff', padding:24, borderRadius:12, width:'100%', maxWidth:500, maxHeight:'90vh', overflowY:'auto'}}>
            <h2 style={{fontFamily:"'Playfair Display',serif", fontSize:'1.5rem', marginBottom:16, color: '#1a3a2a'}}>Your Cart Summary</h2>
            
            <div style={{marginBottom: 20}}>
              {cartItems.map(item => (
                <div key={item.id} style={{display:'flex', justifyContent:'space-between', marginBottom:8, fontSize: '0.9rem', color: '#374151'}}>
                  <span>{item.qty}x {item.name}</span>
                  <span style={{fontWeight: 600}}>KES {item.price * item.qty}</span>
                </div>
              ))}
              <div style={{display:'flex', justifyContent:'space-between', fontWeight:'bold', marginTop:16, borderTop:'1px solid #e5e7eb', paddingTop:16, color: '#1a3a2a', fontSize: '1.1rem'}}>
                <span>Total Amount:</span>
                <span>KES {totalAmount}</span>
              </div>
            </div>

            {/* Calling the component you created! */}
            <MpesaCheckout totalAmount={totalAmount} onCancel={() => setShowCheckout(false)} />
          </div>
        </div>
      )}

    </div>
  );
}