'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

type Tab = 'overview' | 'scanner' | 'crops' | 'orders' | 'learning';

interface Product { id:number; name:string; price:number; quantity:string; category:string; type:string; owner_name:string; }
interface Order   { id:number; product_name:string; buyer_name:string; quantity:string; status:string; notes:string; }
interface User    { id:number; full_name:string; role:string; quality_score:number; }

const COURSES = [
  {
    id:1, category:'Crop Diseases', tag:'Practical', icon:'🦠', duration:'8 min read',
    img:'https://images.unsplash.com/photo-1595508064774-5ff825520bb0?w=600&q=80',
    title:'Identifying & Treating Tomato Blight',
    desc:'Learn to spot early and late blight in tomatoes, prevent spread, and apply the right fungicides.',
    content:`## What is Tomato Blight?\nTomato blight is one of the most destructive diseases in East Africa. There are two types: **Early Blight** (*Alternaria solani*) and **Late Blight** (*Phytophthora infestans*).\n\n## Early Blight — Signs\n- Dark brown spots with concentric rings (like a target) on older lower leaves\n- Yellow halo around the spots\n- Leaves turn yellow and drop\n- Stems may show dark, sunken lesions\n\n## Late Blight — Signs\n- Water-soaked, pale green lesions that quickly turn brown\n- White fuzzy mold on leaf undersides in humid conditions\n- Fruit develops firm, brown, greasy patches\n- Can destroy an entire field within 7–10 days in wet weather\n\n## Prevention\n1. Use certified, blight-resistant varieties (Kilele F1, Cal-J)\n2. Space plants at 60cm × 60cm for airflow\n3. Avoid overhead irrigation — water at the base in the morning\n4. Rotate crops — avoid tomatoes in the same plot more than once every 3 years\n5. Remove and burn infected plant material — never compost it\n\n## Treatment\n- **Early Blight:** Mancozeb (2g/L) or Chlorothalonil every 7–10 days\n- **Late Blight:** Metalaxyl + Mancozeb (Ridomil Gold) at 2.5g/L immediately\n- Spray early morning or evening — avoid midday heat\n- Alternate fungicides every 2–3 sprays to prevent resistance\n\n## Key Tip\nIf more than 30% of plants show symptoms, prioritize saving healthy plants. Remove heavily infected ones immediately.`,
  },
  {
    id:2, category:'Soil Health', tag:'Foundational', icon:'🌱', duration:'10 min read',
    img:'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80',
    title:'Building Fertile Soil: NPK & Organic Matter',
    desc:'Understand what NPK means, how to test your soil, and how to improve yields through proper fertilization.',
    content:`## Why Soil Health Matters\nMost soils in Kenya are deficient in one or more key nutrients, which directly limits yields even when other conditions are ideal.\n\n## Understanding NPK\nEvery fertilizer bag shows three numbers — these are the **NPK ratio**:\n- **N (Nitrogen):** Drives leafy, green growth. Deficiency causes yellowing of older leaves.\n- **P (Phosphorus):** Essential for root development and flowering. Deficiency causes purple/red discolouration.\n- **K (Potassium):** Strengthens cell walls, improves drought resistance. Deficiency causes leaf edge browning.\n\n## Common Fertilizers\n- **DAP (18-46-0):** Planting time — stimulates roots\n- **CAN (26-0-0):** Top dressing leafy crops\n- **NPK 17-17-17:** General purpose vegetables\n- **Urea (46-0-0):** Fast nitrogen boost for maize\n\n## How to Test Your Soil\n1. Collect soil from 5–10 spots at 15cm depth\n2. Mix together and take a 500g sample\n3. Send to KARI or a certified lab\n4. Results will recommend exact fertilizer rates\n\n## Organic Matter — The Cheapest Fertilizer\n- Add compost or well-rotted manure at 2–5 tonnes per acre before planting\n- Plant green manures like Mucuna between seasons\n- Organic matter improves water retention and beneficial microbial activity\n\n## Key Tip\nOver-fertilizing is as harmful as under-fertilizing. Excess nitrogen produces lush plants that attract pests and disease. Always follow recommended rates.`,
  },
  {
    id:3, category:'Pest Management', tag:'Practical', icon:'🐛', duration:'7 min read',
    img:'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80',
    title:'Fall Armyworm: Detection & Control',
    desc:'The Fall Armyworm has devastated maize across Africa. Learn how to detect it early and stop it fast.',
    content:`## What is Fall Armyworm?\n*Spodoptera frugiperda* arrived in Africa in 2016 and primarily attacks maize. A single larva can destroy an entire maize plant in days.\n\n## How to Identify It\n**Larvae (the destructive stage):**\n- Young larvae: small, green, create a "window pane" effect on leaves\n- Older larvae: brown/grey with a distinctive **inverted Y shape on the head**\n- Four dark spots in a square on the second-to-last body segment\n- Found in the whorl (heart) of maize plants\n\n**Damage signs:**\n- "Shothole" feeding on leaves\n- Ragged, irregular holes in the whorl\n- Wet sawdust-like frass (droppings) in the whorl — the clearest indicator\n\n## Scouting\nWalk your field in a W-pattern, inspect 20 plants per acre. **Treat if more than 20% of plants are infested.**\n\n## Control\n**Biological (Preferred):**\n- Bacillus thuringiensis (Bt): Spray into whorl — very effective on young larvae\n- Neem extract: 50ml neem oil per litre of water, spray into whorl\n\n**Chemical (Severe infestations):**\n- Emamectin benzoate (Escort 19EC): Most effective, 0.4L/ha\n- Chlorpyrifos + Cypermethrin: Broad-spectrum option\n- Apply early morning or evening — direct into the whorl\n\n## Key Tip\nLarvae older than 3rd instar are significantly harder to kill. Scout weekly from germination and act early.`,
  },
  {
    id:4, category:'Post-Harvest', tag:'Practical', icon:'📦', duration:'9 min read',
    img:'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80',
    title:'Reducing Post-Harvest Losses in Vegetables',
    desc:'Up to 40% of harvested vegetables are lost before reaching market. Learn proven storage and handling techniques.',
    content:`## The Problem\nKenyan farmers lose 30–40% of vegetable production after harvest due to poor handling, lack of cooling, and inadequate packaging.\n\n## Harvesting Best Practices\n- Harvest during cool morning hours (6am–9am)\n- Use clean, sharp tools — blunt tools cause bruising\n- Handle produce gently — a single bruise creates an entry point for rot\n- Harvest at the right maturity stage\n\n## Field Cooling — The First Critical Step\n- Place harvested vegetables in shade immediately\n- Use evaporative cooling: wet burlap sacks over crates reduce temperature by 8–12°C\n- **Zero Energy Cool Chamber (ZECC):** Double-wall brick structure with wet sand — maintains 15°C. Costs under KES 5,000 to build.\n\n## Storage Tips by Crop\n- **Tomatoes:** 12–15°C, 2–3 weeks. Never refrigerate unripe tomatoes.\n- **Kale/Sukuma:** 0–2°C, 2–3 weeks. Keep moist, not wet.\n- **Onions:** 25–30°C, 6–8 months. Dry and cure properly before storage.\n- **Potatoes:** 7–10°C, 2–4 months. Keep in dark to prevent greening.\n- **Carrots:** 0–2°C, 4–6 weeks. Remove tops before storage.\n\n## Transport\n- Use padded, ventilated vehicles\n- Transport during cool parts of the day\n- Load heavier produce at the bottom\n\n## Key Tip\nJoining a farmer group gives access to shared cold storage and collective transport, reducing per-unit post-harvest loss dramatically.`,
  },
  {
    id:5, category:'Soil Health', tag:'Intermediate', icon:'💧', duration:'8 min read',
    img:'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&q=80',
    title:'Water-Smart Irrigation for Small Farms',
    desc:'Discover drip irrigation, scheduling techniques, and how to cut water use by 50% while improving yields.',
    content:`## Why Irrigation Efficiency Matters\nOver-irrigation wastes water and leaches nutrients. Under-irrigation stresses crops. The goal is the **right amount of water at the right time**.\n\n## Critical Crop Water Stages\n- Germination and establishment (first 2–3 weeks)\n- **Flowering and fruit set** — stress here directly reduces yield and cannot be recovered\n- Fruit fill / grain filling\n\n## Drip Irrigation — The Gold Standard\nDrip delivers water directly to the root zone, reducing evaporation by up to 70%.\n\n**Benefits:**\n- 30–50% water savings vs. overhead irrigation\n- Less weed growth between rows\n- Lower disease pressure from dry leaves\n- Can be combined with fertigation (fertilizer through drip lines)\n\n**Basic 1-acre setup cost:** KES 30,000–80,000 depending on quality.\n\n## Simple Irrigation Scheduling: The Finger Test\n- Push finger 5–8cm into soil near root zone\n- Comes out dry and dusty → irrigate immediately\n- Comes out with some soil sticking → irrigate tomorrow\n- Comes out moist → no irrigation needed\n\n## Irrigation Frequency by Crop\n- **Tomatoes:** Every 2–3 days (more at flowering)\n- **Leafy vegetables:** Daily in dry season\n- **Maize:** Every 5–7 days vegetative, every 3 days at tasselling\n- **Onions:** Every 4–5 days, stop 2 weeks before harvest\n\n## Key Tip\nMulching with dry grass or black polythene reduces soil evaporation by 60%, allowing you to irrigate half as often.`,
  },
  {
    id:6, category:'Pest Management', tag:'Advanced', icon:'🔬', duration:'6 min read',
    img:'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&q=80',
    title:'Integrated Pest Management (IPM) Basics',
    desc:'Reduce pesticide costs and protect your soil by combining biological, cultural, and chemical controls.',
    content:`## What is IPM?\nIntegrated Pest Management combines multiple pest control tactics to minimize economic damage while reducing risks to health and environment. Use pesticides as a last resort.\n\n## The IPM Pyramid (Use in This Order)\n\n### 1. Prevention (Always)\n- Plant certified, disease-resistant varieties\n- Maintain field hygiene — remove crop residues after harvest\n- Practice crop rotation to break pest cycles\n- Use correct plant spacing for airflow\n\n### 2. Monitoring\n- Walk your field weekly and record observations\n- Set an economic threshold — only treat when pest levels will cause meaningful yield loss\n- Use sticky traps for whiteflies and thrips\n\n### 3. Biological Control\n- Conserve natural enemies: ladybirds eat aphids, parasitic wasps attack caterpillars\n- Use biopesticides: Bt for caterpillars, neem for a wide range of pests\n- Avoid broad-spectrum pesticides that kill beneficial insects\n\n### 4. Cultural Control\n- Intercropping: Maize + beans confuses pest navigation\n- Push-Pull: Desmodium repels stemborer, Napier grass traps them\n- Burn or bury crop debris — never leave it in the field\n\n### 5. Chemical Control (Last Resort)\n- Only spray when monitoring confirms pest levels exceed threshold\n- Select the most selective pesticide\n- Rotate chemical classes to prevent resistance\n- Observe pre-harvest intervals (PHI) strictly\n\n## Key Tip\nKeep a farm diary recording pests seen, when, and what you did. After one season you will have a predictive calendar for your location and crops.`,
  },
];

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
  const [selectedCourse, setSelectedCourse] = useState<typeof COURSES[0]|null>(null);

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

  async function scanCrop() {
    if (!scanInput) { setScanResult('Please describe your crop issue first.'); return; }
    setScanLoading(true); setScanResult('');
    try {
      const res = await fetch(`${API}/api/scans/diagnose`,{
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({description:scanInput, farmer_id:user?.id}),
      });
      if (res.ok) { const d=await res.json(); setScanResult(d.diagnosis||'Scan complete.'); loadRecs(); }
      else setScanResult('⚠️ Could not complete diagnosis. Make sure your backend scans endpoint is active.');
    } catch { setScanResult('⚠️ Scanner unavailable. Ensure your backend is running.'); }
    setScanLoading(false);
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
        .learn-card{transition:box-shadow .2s,transform .2s;cursor:pointer;}
        .learn-card:hover{box-shadow:0 12px 32px rgba(26,58,42,.13)!important;transform:translateY(-4px);}
        .learn-card:hover .learn-img{transform:scale(1.06);}
        .learn-img{transition:transform .4s ease;width:100%;height:100%;object-fit:cover;}
        .rec-card{transition:box-shadow .18s,transform .18s;}
        .rec-card:hover{box-shadow:0 8px 24px rgba(26,58,42,.1)!important;transform:translateY(-2px);}
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

        {/* ══ AI SCANNER ══ */}
        {tab==='scanner' && (
          <div style={{maxWidth:860,margin:'0 auto'}}>
            {/* Banner */}
            <div style={{borderRadius:20,overflow:'hidden',marginBottom:28,position:'relative',height:160}}>
              <img src="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=1200&q=80" alt="" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center 30%'}}/>
              <div style={{position:'absolute',inset:0,background:'rgba(26,58,42,.72)'}}/>
              <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',justifyContent:'center',padding:'0 36px'}}>
                <h2 style={{fontFamily:"'Playfair Display',serif",color:'#fff',fontSize:'1.7rem',fontWeight:900,marginBottom:6}}>🔬 AI Crop Scanner</h2>
                <p style={{fontFamily:"'DM Sans',sans-serif",color:'rgba(255,255,255,.65)',fontSize:'.88rem'}}>Describe your crop issue or paste an image URL — our AI will diagnose and recommend treatment.</p>
              </div>
            </div>

            <div style={{background:'#fff',borderRadius:18,padding:32,border:'1.5px solid #f0ece4',marginBottom:28}}>
              <label style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:'#1a3a2a',fontSize:'.85rem',display:'block',marginBottom:10}}>Describe the problem or paste image URL</label>
              <textarea value={scanInput} onChange={e=>setScanInput(e.target.value)}
                placeholder="e.g. 'Yellow spots on my tomato leaves spreading from the bottom up' or paste a photo URL..."
                style={{width:'100%',height:110,padding:'12px 16px',border:'1.5px solid #e5e7eb',borderRadius:12,fontFamily:"'DM Sans',sans-serif",fontSize:'.88rem',resize:'vertical',outline:'none',color:'#1a3a2a',lineHeight:1.6,marginBottom:16}}/>
              <button className="orange-btn" onClick={scanCrop} disabled={scanLoading}>
                {scanLoading ? '🔄 Scanning...' : '🔍 Scan Now'}
              </button>
              {scanResult && (
                <div style={{marginTop:20,padding:20,background:'#f0fdf4',borderRadius:12,borderLeft:'4px solid #4a8c5c'}}>
                  <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:'#1a3a2a',marginBottom:6,fontSize:'.88rem'}}>📋 Diagnosis Result</div>
                  <p style={{fontFamily:"'DM Sans',sans-serif",color:'#374151',fontSize:'.87rem',lineHeight:1.7}}>{scanResult}</p>
                </div>
              )}
            </div>

            {/* Recommendations */}
            {recs.length>0 && (
              <div>
                <h3 style={{fontFamily:"'Playfair Display',serif",color:'#1a3a2a',fontSize:'1.2rem',marginBottom:18}}>💊 Recommended Inputs from Agrovets</h3>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
                  {recs.map(r=>(
                    <div key={r.id} className="rec-card" style={{background:'#fff',borderRadius:14,overflow:'hidden',border:'1.5px solid #f0ece4'}}>
                      <div style={{height:110,overflow:'hidden'}}>
                        <img src={CROP_IMAGES[r.category]||CROP_IMAGES.default} alt={r.name} style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform .35s'}}/>
                      </div>
                      <div style={{padding:'14px 16px'}}>
                        <div style={{fontFamily:"'DM Sans',sans-serif",color:'#e07b2a',fontSize:'.68rem',fontWeight:700,textTransform:'uppercase',letterSpacing:.5,marginBottom:4}}>{r.category||'Input'}</div>
                        <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,color:'#1a3a2a',fontSize:'.95rem',marginBottom:3}}>{r.name}</div>
                        <div style={{fontFamily:"'DM Sans',sans-serif",color:'#6b7280',fontSize:'.78rem',marginBottom:8}}>{r.quantity} · by {r.owner_name}</div>
                        <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:800,color:'#1a3a2a',fontSize:'.95rem'}}>KES {r.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
        {tab==='learning' && (
          <div>
            {/* Reading Modal */}
            {selectedCourse && (
              <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.55)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:24}} onClick={()=>setSelectedCourse(null)}>
                <div style={{background:'#fff',borderRadius:20,maxWidth:720,width:'100%',maxHeight:'88vh',overflow:'hidden',display:'flex',flexDirection:'column'}} onClick={e=>e.stopPropagation()}>
                  {/* Modal header image */}
                  <div style={{height:180,position:'relative',flexShrink:0}}>
                    <img src={selectedCourse.img} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                    <div style={{position:'absolute',inset:0,background:'rgba(26,58,42,.7)'}}/>
                    <button onClick={()=>setSelectedCourse(null)} style={{position:'absolute',top:14,right:14,background:'rgba(255,255,255,.15)',border:'none',color:'#fff',borderRadius:999,width:34,height:34,cursor:'pointer',fontSize:'1.1rem',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
                    <div style={{position:'absolute',bottom:18,left:22}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
                        <span style={{background:'#e07b2a',color:'#fff',borderRadius:999,padding:'2px 12px',fontFamily:"'DM Sans',sans-serif",fontSize:'.68rem',fontWeight:700}}>{selectedCourse.tag}</span>
                        <span style={{color:'rgba(255,255,255,.65)',fontFamily:"'DM Sans',sans-serif",fontSize:'.75rem'}}>⏱ {selectedCourse.duration}</span>
                      </div>
                      <h2 style={{fontFamily:"'Playfair Display',serif",color:'#fff',fontSize:'1.3rem',fontWeight:900}}>{selectedCourse.title}</h2>
                    </div>
                  </div>
                  {/* Modal body */}
                  <div style={{overflowY:'auto',padding:'28px 32px',flex:1}}>
                    {selectedCourse.content.split('\n').map((line,i)=>{
                      if(line.startsWith('## ')) return <h3 key={i} style={{fontFamily:"'Playfair Display',serif",color:'#1a3a2a',fontSize:'1.05rem',fontWeight:700,marginTop:22,marginBottom:8,borderBottom:'1.5px solid #f0ece4',paddingBottom:6}}>{line.replace('## ','')}</h3>;
                      if(line.startsWith('### ')) return <h4 key={i} style={{fontFamily:"'DM Sans',sans-serif",color:'#2d5c3e',fontSize:'.92rem',fontWeight:700,marginTop:14,marginBottom:6}}>{line.replace('### ','')}</h4>;
                      if(line.startsWith('- ')) return <div key={i} style={{display:'flex',gap:8,marginBottom:5}}><span style={{color:'#4a8c5c',fontWeight:700,flexShrink:0}}>•</span><span style={{fontFamily:"'DM Sans',sans-serif",color:'#374151',fontSize:'.88rem',lineHeight:1.65}}>{line.replace('- ','').replace(/\*\*(.*?)\*\*/g,'$1')}</span></div>;
                      if(line.match(/^\d+\./)) return <div key={i} style={{display:'flex',gap:8,marginBottom:5,paddingLeft:4}}><span style={{color:'#e07b2a',fontWeight:700,flexShrink:0,minWidth:18}}>{line.split('.')[0]}.</span><span style={{fontFamily:"'DM Sans',sans-serif",color:'#374151',fontSize:'.88rem',lineHeight:1.65}}>{line.replace(/^\d+\.\s*/,'').replace(/\*\*(.*?)\*\*/g,'$1')}</span></div>;
                      if(line.trim()==='') return <div key={i} style={{height:6}}/>;
                      return <p key={i} style={{fontFamily:"'DM Sans',sans-serif",color:'#374151',fontSize:'.88rem',lineHeight:1.75,marginBottom:4}}>{line.replace(/\*\*(.*?)\*\*/g,'$1')}</p>;
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Hero */}
            <div style={{borderRadius:20,overflow:'hidden',marginBottom:28,position:'relative',height:160}}>
              <img src="https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=1400&q=80" alt="" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center 40%'}}/>
              <div style={{position:'absolute',inset:0,background:'rgba(26,58,42,.72)'}}/>
              <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',justifyContent:'center',padding:'0 36px'}}>
                <h2 style={{fontFamily:"'Playfair Display',serif",color:'#fff',fontSize:'1.7rem',fontWeight:900,marginBottom:4}}>📚 Learning Hub</h2>
                <p style={{fontFamily:"'DM Sans',sans-serif",color:'rgba(255,255,255,.65)',fontSize:'.88rem'}}>Expert resources to help you farm smarter, reduce losses, and earn more.</p>
              </div>
            </div>

            {/* Category summary pills */}
            <div style={{display:'flex',gap:10,marginBottom:22,flexWrap:'wrap'}}>
              {['All','Crop Diseases','Soil Health','Pest Management','Post-Harvest'].map(cat=>(
                <div key={cat} style={{background:'#fff',border:'1.5px solid #f0ece4',borderRadius:999,padding:'6px 16px',fontFamily:"'DM Sans',sans-serif",fontSize:'.8rem',color:'#374151',cursor:'default'}}>
                  {cat==='All'?`📖 ${COURSES.length} Courses`:
                   cat==='Crop Diseases'?`🦠 ${COURSES.filter(c=>c.category===cat).length} courses`:
                   cat==='Soil Health'?`🌱 ${COURSES.filter(c=>c.category===cat).length} courses`:
                   cat==='Pest Management'?`🐛 ${COURSES.filter(c=>c.category===cat).length} courses`:
                   `📦 ${COURSES.filter(c=>c.category===cat).length} course`}
                </div>
              ))}
            </div>

            {/* Course grid */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:22}}>
              {COURSES.map(c=>(
                <div key={c.id} className="learn-card" style={{background:'#fff',borderRadius:16,overflow:'hidden',border:'1.5px solid #f0ece4',cursor:'pointer'}} onClick={()=>setSelectedCourse(c)}>
                  <div style={{height:175,overflow:'hidden',position:'relative'}}>
                    <img className="learn-img" src={c.img} alt={c.title}/>
                    <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(26,58,42,.72) 0%,transparent 55%)'}}/>
                    <div style={{position:'absolute',top:12,left:12,background:'#e07b2a',color:'#fff',borderRadius:999,padding:'3px 12px',fontFamily:"'DM Sans',sans-serif",fontSize:'.68rem',fontWeight:700}}>{c.tag}</div>
                    <div style={{position:'absolute',top:12,right:12,background:'rgba(255,255,255,.15)',color:'#fff',borderRadius:999,padding:'3px 10px',fontFamily:"'DM Sans',sans-serif",fontSize:'.68rem'}}>⏱ {c.duration}</div>
                    <div style={{position:'absolute',bottom:12,left:14,fontSize:'1.5rem'}}>{c.icon}</div>
                  </div>
                  <div style={{padding:'16px 18px 18px'}}>
                    <div style={{fontFamily:"'DM Sans',sans-serif",color:'#e07b2a',fontSize:'.68rem',fontWeight:700,textTransform:'uppercase',letterSpacing:.5,marginBottom:5}}>{c.category}</div>
                    <h4 style={{fontFamily:"'Playfair Display',serif",fontWeight:700,color:'#1a3a2a',fontSize:'.97rem',marginBottom:7,lineHeight:1.3}}>{c.title}</h4>
                    <p style={{fontFamily:"'DM Sans',sans-serif",color:'#6b7280',fontSize:'.82rem',lineHeight:1.6,marginBottom:12}}>{c.desc}</p>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <span style={{fontFamily:"'DM Sans',sans-serif",color:'#4a8c5c',fontWeight:700,fontSize:'.8rem'}}>Read article</span>
                      <span style={{color:'#4a8c5c',fontSize:'.8rem'}}>→</span>
                    </div>
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