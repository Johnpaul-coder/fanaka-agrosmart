'use client';

import { useState, useEffect, useRef } from 'react';
import AuthModal from '../component/AuthModal';

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);

  // Scroll reveal
 useEffect(() => {}, []);

  return (
    <>
      {/* NAV */}
      <nav>
        <a href="#" className="logo">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <path d="M16 3C16 3 6 10 6 18a10 10 0 0020 0C26 10 16 3 16 3z" fill="#4a8c5c"/>
            <path d="M16 10v14M11 15l5-5 5 5" stroke="#f09448" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <span className="logo-text">Fanaka <em>AGROSMART</em></span>
        </a>
        <ul className="nav-links">
          <li><a href="#pillars">How It Works</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#audience">Who We Serve</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <button className="nav-btn" onClick={() => setModalOpen(true)}>Register</button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-pattern"></div>
        <div className="hero-right">
          <img src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=900&q=80" alt="Farmer in field"/>
          <div className="hero-right-fade"></div>
        </div>
        <div className="hero-content">
          <div className="badge">
            <div className="badge-dot"></div>
            <span>Trusted Agricultural Ecosystem</span>
          </div>
          <h1>Growing <em>Smarter,</em><br/>Farming <em>Better.</em></h1>
          <p className="hero-p">
            Fanaka AGROSMART bridges farmers, suppliers, and consumers through verified markets,
            AI crop diagnostics, and quality-assured physical hubs — building trust at every step.
          </p>
          <div className="hero-btns">
            <a href="#pillars" className="btn-p">Explore the Platform</a>
            <button className="btn-g" onClick={() => setModalOpen(true)}>Register Now</button>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="trust">
        <div className="ti">
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span>Certified Inputs Only</span>
        </div>
        <div className="ti">
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span>Escrow-Protected Payments</span>
        </div>
        <div className="ti">
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span>Physical Quality Hubs</span>
        </div>
        <div className="ti">
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          <span>Real-Time AI Support</span>
        </div>
        <div className="ti">
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          <span>Farmer-First Community</span>
        </div>
      </div>

      {/* PILLARS */}
      <section className="pb" id="pillars">
        <div className="tc reveal">
          <span className="sl">Our Approach</span>
          <h2>Four Pillars of a Smarter Agri-Ecosystem</h2>
          <p className="sub">We&apos;ve redesigned the agricultural value chain — combining digital tools with physical infrastructure for real impact.</p>
        </div>
        <div className="pg">
          <div className="pc reveal"><div className="pn">01</div><span className="pi">🛒</span><h3>Two-Way Marketplace</h3><p>Verified agro-shops supply certified seeds and fertilizers while farmers list harvests directly to buyers — with escrow protection on every deal.</p></div>
          <div className="pc reveal"><div className="pn">02</div><span className="pi">🔬</span><h3>AI Diagnostic Scanner</h3><p>Upload a photo of a sick crop and our AI instantly identifies diseases, deficiencies, or pests — then connects you to the right treatment.</p></div>
          <div className="pc reveal"><div className="pn">03</div><span className="pi">🏪</span><h3>Quality & Packaging Hubs</h3><p>Our physical stores inspect, sort, grade, and package your produce — awarding the &quot;Fanaka Certified&quot; stamp and QR code.</p></div>
          <div className="pc reveal"><div className="pn">04</div><span className="pi">🌦️</span><h3>Learning & Climate Hub</h3><p>Hyper-local weather alerts, climate-smart farming tips, and a knowledge base on crop cycles — all in your dashboard.</p></div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section className="wb">
        <div className="tc reveal">
          <span className="sl" style={{color:'var(--harvest-light)'}}>The Trust Loop</span>
          <h2>From Diagnosis to Sale —<br/>One Seamless Journey</h2>
          <p className="sub">Every transaction flows through a trusted, end-to-end process that protects both farmers and buyers.</p>
        </div>
        <div className="wsteps">
          {[
            { icon:'🔍', title:'Diagnose',  desc:'AI scans your crop photo and identifies the exact issue' },
            { icon:'💊', title:'Prescribe', desc:'System recommends the right treatment and supplier' },
            { icon:'🏪', title:'Pickup',    desc:'Collect verified inputs from your nearest Fanaka Store' },
            { icon:'🌾', title:'Harvest',   desc:'Bring produce in for professional grading & packaging' },
            { icon:'💰', title:'Sell',      desc:'"Fanaka Grade A" sells at premium market prices' },
          ].map(s => (
            <div key={s.title} className="step reveal">
              <div className="sc">{s.icon}</div>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="svb" id="services">
        <div className="svl">
          <div className="reveal" style={{position:'relative'}}>
            <div className="svc-img" style={{width:'616px' ,height:'500px'}}>
              <img src="https://i.pinimg.com/736x/d9/c0/92/d9c092b24ad80a0bc253f8e41ba6a82e.jpg" alt="Farmer" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
            </div>
            <div className="cb"><strong>✓</strong>Fanaka<br/>Certified</div>
          </div>
          <div className="reveal">
            <span className="sl">Platform Services</span>
            <h2>Everything You Need,<br/>One Platform</h2>
            <p className="sub" style={{marginBottom:'28px'}}>From sourcing certified inputs to selling branded produce, Fanaka handles the entire journey.</p>
            <div className="sl-list">
              <div className="si"><span className="ic">🌱</span><div><h4>Verified Input Marketplace</h4><p>Browse and order certified seeds, fertilizers, and machinery from vetted agro-shops — no counterfeits.</p></div></div>
              <div className="si"><span className="ic">📦</span><div><h4>Professional Produce Branding</h4><p>Get your harvest sorted, graded, and packaged in standardized Fanaka-branded crates for supermarket shelves.</p></div></div>
              <div className="si"><span className="ic">🤖</span><div><h4>AI Crop E-Pharmacy</h4><p>Instant disease identification and direct purchase of the prescribed treatment from verified suppliers.</p></div></div>
            </div>
          </div>
        </div>
      </section>

      {/* AUDIENCE */}
      <section className="aub" id="audience">
        <div className="tc reveal">
          <span className="sl">Who We Serve</span>
          <h2>Built for Every Link<br/>in the Chain</h2>
          <p className="sub">Whether you grow it, sell it, or buy it — Fanaka AGROSMART has a solution for you.</p>
        </div>
        <div className="aug">
          {[
            { img:'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=80', tag:'Farmers',    title:'Grow More, Earn More',   desc:'Access real-time diagnostics, certified inputs, and premium buyers.' },
            { img:'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80', tag:'Agro-shops', title:'Reach More Farmers',      desc:'List verified products, get featured in AI prescriptions, grow digitally.' },
            { img:'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&q=80', tag:'Consumers',  title:'Trust What You Eat',     desc:'Every product is traceable, graded, and QR-certified.' },
          ].map(a => (
            <div key={a.tag} className="ac reveal">
              <div className="av"><img src={a.img} alt={a.tag} style={{width:'100%',height:'100%',objectFit:'cover'}}/></div>
              <div className="ao"></div>
              <div className="act">
                <div className="atag">{a.tag}</div>
                <h3>{a.title}</h3>
                <p>{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact">
        <div className="fg">
          <div>
            <div className="fl">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                <path d="M16 3C16 3 6 10 6 18a10 10 0 0020 0C26 10 16 3 16 3z" fill="#4a8c5c"/>
                <path d="M16 10v14M11 15l5-5 5 5" stroke="#f09448" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              <span>Fanaka <em>AGROSMART</em></span>
            </div>
            <p className="fa">An integrated agri-ecosystem built on trust, technology, and quality — connecting farmers, suppliers, and consumers.</p>
          </div>
          <div className="fc"><h5>Mission</h5><ul><li><a href="#">Eliminate Fraud</a></li><li><a href="#">Quality Standards</a></li><li><a href="#">Farmer Empowerment</a></li><li><a href="#">Digital Inclusion</a></li></ul></div>
          <div className="fc"><h5>Platform</h5><ul><li><a href="#">Marketplace</a></li><li><a href="#">AI Scanner</a></li><li><a href="#">Fanaka Hubs</a></li><li><a href="#">Learning Center</a></li></ul></div>
          <div className="fc"><h5>Contact Us</h5><ul><li><a href="#">info@fanaka.ag</a></li><li><a href="#">+254 700 000 000</a></li><li><a href="#">Nairobi, Kenya</a></li></ul></div>
        </div>
        <div className="fb">
          <p>© 2025 Fanaka AGROSMART. All rights reserved.</p>
          <div className="soc">
            <a href="#" className="sb">𝕏</a>
            <a href="#" className="sb">in</a>
            <a href="#" className="sb">f</a>
            <a href="#" className="sb">▶</a>
          </div>
        </div>
      </footer>

      {/* AUTH MODAL */}
      <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}