'use client';
import { useState, useRef } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// ── Types ──────────────────────────────────────────────────────────────────
interface Agrochemical {
  name: string;
  type: string;
  active_ingredient: string;
  application: string;
  estimated_cost_kes: string;
}
interface AlternativeDiagnosis {
  name: string;
  confidence: number;
  distinguishing_factor: string;
}
interface DiagnosisResult {
  diagnosis: {
    primary: string;
    scientific_name: string | null;
    category: string;
    confidence: number;
    confidence_explanation: string;
  };
  symptoms_identified: string[];
  causes: string[];
  severity: {
    level: string;
    description: string;
  };
  treatment: {
    immediate_actions: string[];
    agrochemicals: Agrochemical[];
    organic_alternatives: string[];
    prevention: string[];
  };
  crop_impact: {
    yield_loss_risk: string;
    spread_risk: string;
    time_to_act: string;
  };
  alternative_diagnoses: AlternativeDiagnosis[];
  follow_up_questions: string[];
}

// ── Helpers ─────────────────────────────────────────────────────────────────
const severityColor: Record<string, string> = {
  Low:      '#10b981',
  Moderate: '#f59e0b',
  High:     '#ef4444',
  Critical: '#7c3aed',
};
const categoryIcon: Record<string, string> = {
  Disease:              '🦠',
  Pest:                 '🐛',
  'Nutrient Deficiency':'🌱',
  Environmental:        '🌤️',
  Unknown:              '❓',
};

function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 75 ? '#10b981' : value >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ marginTop: '.4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.25rem' }}>
        <span style={{ fontSize: '.72rem', color: '#6b7280' }}>Confidence</span>
        <span style={{ fontSize: '.82rem', fontWeight: 700, color }}>{value}%</span>
      </div>
      <div style={{ height: 8, background: '#e5e7eb', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 999, transition: 'width 1s ease' }} />
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function AIScanner({ farmerId }: { farmerId?: number }) {
  const [tab, setTab] = useState<'image' | 'text'>('image');
  const [cropType, setCropType] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const crops = ['Tomatoes', 'Maize', 'Kale (Sukuma Wiki)', 'Cabbage', 'Onions', 'Beans', 'Potatoes', 'Spinach', 'Carrots', 'Capsicum', 'Avocado', 'Mango', 'Banana', 'Cassava', 'Sorghum', 'Other'];

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setResult(null);
    setError('');
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function runScan() {
    setError('');
    setResult(null);
    setSaved(false);

    if (tab === 'image' && !imageFile && !description.trim()) {
      setError('Please upload an image or add a description.');
      return;
    }
    if (tab === 'text' && !description.trim()) {
      setError('Please describe the crop problem.');
      return;
    }

    setLoading(true);

    try {
      let res: Response;

      if (tab === 'image') {
        // Multipart form — image + optional text
        const form = new FormData();
        if (imageFile)    form.append('image', imageFile);
        if (description)  form.append('description', description);
        if (cropType)     form.append('crop_type', cropType);

        res = await fetch(`${API}/api/scans/diagnose`, {
          method: 'POST',
          body: form,
        });
      } else {
        // JSON — text only
        res = await fetch(`${API}/api/scans/diagnose/text`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description, crop_type: cropType }),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Scan failed');
      setResult(data.diagnosis as DiagnosisResult);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  async function saveScan() {
    if (!result || !farmerId) return;
    try {
      const form = new FormData();
      form.append('farmer_id', String(farmerId));
      form.append('crop_type', cropType);
      form.append('diagnosis_name', result.diagnosis.primary);
      form.append('confidence', String(result.diagnosis.confidence));
      form.append('severity', result.severity.level);
      form.append('full_result', JSON.stringify(result));

      await fetch(`${API}/api/scans/save`, { method: 'POST', body: form });
      setSaved(true);
    } catch {
      // silent — not critical
    }
  }

  // ── Styles ────────────────────────────────────────────────────────────────
  const s: Record<string, React.CSSProperties> = {
    wrap:       { fontFamily: "'DM Sans', sans-serif", color: '#1a3a2a', maxWidth: 900, margin: '0 auto' },
    card:       { background: 'white', borderRadius: 14, padding: '1.5rem', boxShadow: '0 4px 20px rgba(26,58,42,.08)', marginBottom: '1rem' },
    tabRow:     { display: 'flex', gap: '.6rem', marginBottom: '1.2rem' },
    tab:        { padding: '.45rem 1.2rem', borderRadius: 999, border: '2px solid #e5e7eb', background: 'white', fontFamily: "'DM Sans'", fontSize: '.82rem', fontWeight: 600, cursor: 'pointer', transition: 'all .2s' },
    activeTab:  { background: '#1a3a2a', color: 'white', borderColor: '#1a3a2a' },
    label:      { display: 'block', fontSize: '.78rem', fontWeight: 600, color: '#374151', marginBottom: '.35rem' },
    input:      { width: '100%', padding: '.55rem .8rem', borderRadius: 8, border: '1.5px solid #e5e7eb', fontFamily: "'DM Sans'", fontSize: '.82rem', outline: 'none', transition: 'border .2s' },
    select:     { width: '100%', padding: '.55rem .8rem', borderRadius: 8, border: '1.5px solid #e5e7eb', fontFamily: "'DM Sans'", fontSize: '.82rem', background: 'white', outline: 'none' },
    textarea:   { width: '100%', padding: '.55rem .8rem', borderRadius: 8, border: '1.5px solid #e5e7eb', fontFamily: "'DM Sans'", fontSize: '.82rem', resize: 'vertical' as const, minHeight: 90, outline: 'none' },
    dropZone:   { border: '2px dashed #d1d5db', borderRadius: 12, padding: '2rem', textAlign: 'center' as const, cursor: 'pointer', transition: 'all .2s', background: '#fafafa' },
    scanBtn:    { width: '100%', padding: '.75rem', background: '#1a3a2a', color: 'white', border: 'none', borderRadius: 10, fontFamily: "'DM Sans'", fontSize: '.95rem', fontWeight: 700, cursor: 'pointer', transition: 'all .2s', marginTop: '.8rem' },
    sectionHead:{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', fontWeight: 700, color: '#1a3a2a', marginBottom: '.7rem' },
    chip:       { display: 'inline-flex', alignItems: 'center', gap: '.3rem', background: '#f0fdf4', color: '#166534', padding: '.25rem .7rem', borderRadius: 999, fontSize: '.72rem', fontWeight: 600, margin: '.2rem' },
    chemical:   { background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '.9rem 1rem', marginBottom: '.6rem' },
    altCard:    { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '.7rem 1rem', marginBottom: '.5rem', display: 'flex', justifyContent: 'space-between' as const, alignItems: 'center' },
  };

  return (
    <div style={s.wrap}>

      {/* ── Input Card ── */}
      <div style={s.card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.7rem', marginBottom: '1.1rem' }}>
          <div style={{ width: 40, height: 40, background: '#1a3a2a', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🔬</div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700, color: '#1a3a2a' }}>AI Crop Scanner</div>
            <div style={{ fontSize: '.72rem', color: '#6b7280' }}>Upload a photo or describe the problem — get an instant diagnosis</div>
          </div>
        </div>

        {/* Tab switch */}
        <div style={s.tabRow}>
          <button style={{ ...s.tab, ...(tab === 'image' ? s.activeTab : {}) }} onClick={() => setTab('image')}>📷 Upload Photo</button>
          <button style={{ ...s.tab, ...(tab === 'text'  ? s.activeTab : {}) }} onClick={() => setTab('text')}>✍️ Describe Problem</button>
        </div>

        {/* Crop type */}
        <div style={{ marginBottom: '.9rem' }}>
          <label style={s.label}>Crop Type <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional but improves accuracy)</span></label>
          <select style={s.select} value={cropType} onChange={e => setCropType(e.target.value)}>
            <option value="">Select crop...</option>
            {crops.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Image tab */}
        {tab === 'image' && (
          <div style={{ marginBottom: '.9rem' }}>
            <label style={s.label}>Crop Photo</label>
            {!imagePreview ? (
              <div
                style={s.dropZone}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>📸</div>
                <div style={{ fontSize: '.85rem', fontWeight: 600, color: '#374151' }}>Click to upload or drag & drop</div>
                <div style={{ fontSize: '.72rem', color: '#9ca3af', marginTop: '.3rem' }}>JPG, PNG, WEBP — max 10MB</div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
              </div>
            ) : (
              <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                <img src={imagePreview} alt="Crop" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 10, border: '2px solid #e5e7eb' }} />
                <button onClick={removeImage} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,.6)', color: 'white', border: 'none', borderRadius: 999, width: 28, height: 28, cursor: 'pointer', fontSize: '1rem' }}>×</button>
              </div>
            )}
          </div>
        )}

        {/* Description — shown on both tabs */}
        <div style={{ marginBottom: '.6rem' }}>
          <label style={s.label}>
            {tab === 'image' ? 'Additional Description' : 'Describe the Problem'}
            {tab === 'text' && <span style={{ color: '#ef4444' }}> *</span>}
            <span style={{ color: '#9ca3af', fontWeight: 400 }}>
              {tab === 'image' ? ' (optional — helps AI)' : ''}
            </span>
          </label>
          <textarea
            style={s.textarea}
            placeholder={tab === 'image'
              ? "e.g. Yellow spots appeared 3 days ago, spreading to other leaves..."
              : "e.g. My tomatoes have yellow spots with brown centres, leaves are wilting from the bottom up. Noticed it 5 days ago, now spreading fast..."
            }
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '.6rem .9rem', borderRadius: 8, fontSize: '.8rem', marginBottom: '.6rem' }}>
            ❌ {error}
          </div>
        )}

        <button
          style={{ ...s.scanBtn, opacity: loading ? .7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          onClick={runScan}
          disabled={loading}
        >
          {loading ? '🔍 Analysing your crop...' : '🔬 Run AI Diagnosis'}
        </button>
      </div>

      {/* ── Loading state ── */}
      {loading && (
        <div style={{ ...s.card, textAlign: 'center', padding: '2.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🌿</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700, color: '#1a3a2a', marginBottom: '.5rem' }}>
            Analysing your crop...
          </div>
          <div style={{ fontSize: '.82rem', color: '#6b7280' }}>
            AI is checking for diseases, pests, and deficiencies
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '.4rem', justifyContent: 'center' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#1a3a2a', animation: `bounce .9s ease ${i * 0.2}s infinite` }} />
            ))}
          </div>
          <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)} }`}</style>
        </div>
      )}

      {/* ── Results ── */}
      {result && !loading && (
        <>
          {/* Primary diagnosis */}
          <div style={{ ...s.card, borderLeft: `5px solid ${severityColor[result.severity.level] || '#e07b2a'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' as const, gap: '.5rem' }}>
              <div>
                <div style={{ fontSize: '.68rem', fontWeight: 700, color: '#6b7280', letterSpacing: '.1em', marginBottom: '.3rem' }}>PRIMARY DIAGNOSIS</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 900, color: '#1a3a2a' }}>
                  {categoryIcon[result.diagnosis.category] || '🔬'} {result.diagnosis.primary}
                </div>
                {result.diagnosis.scientific_name && (
                  <div style={{ fontSize: '.75rem', color: '#6b7280', fontStyle: 'italic', marginTop: '.2rem' }}>
                    {result.diagnosis.scientific_name}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right' as const }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', background: `${severityColor[result.severity.level]}20`, color: severityColor[result.severity.level], padding: '.3rem .8rem', borderRadius: 999, fontSize: '.75rem', fontWeight: 700 }}>
                  ⚠️ {result.severity.level} Severity
                </div>
              </div>
            </div>

            <ConfidenceBar value={result.diagnosis.confidence} />
            <div style={{ fontSize: '.75rem', color: '#6b7280', marginTop: '.4rem', fontStyle: 'italic' }}>
              {result.diagnosis.confidence_explanation}
            </div>

            {/* Impact row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '.7rem', marginTop: '1rem' }}>
              {[
                { icon: '📉', label: 'Yield Risk', val: result.crop_impact.yield_loss_risk },
                { icon: '📡', label: 'Spread Risk', val: result.crop_impact.spread_risk },
                { icon: '⏰', label: 'Time to Act', val: result.crop_impact.time_to_act },
              ].map(item => (
                <div key={item.label} style={{ background: '#f9fafb', borderRadius: 8, padding: '.6rem .8rem', textAlign: 'center' as const }}>
                  <div style={{ fontSize: '1.1rem' }}>{item.icon}</div>
                  <div style={{ fontSize: '.68rem', color: '#9ca3af', marginTop: '.15rem' }}>{item.label}</div>
                  <div style={{ fontSize: '.78rem', fontWeight: 700, color: '#1a3a2a', marginTop: '.1rem' }}>{item.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Symptoms + Causes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={s.card}>
              <div style={s.sectionHead}>🔍 Symptoms Identified</div>
              {result.symptoms_identified.map((sym, i) => (
                <div key={i} style={{ display: 'flex', gap: '.5rem', marginBottom: '.4rem', fontSize: '.8rem', color: '#374151' }}>
                  <span style={{ color: '#e07b2a', fontWeight: 700 }}>•</span> {sym}
                </div>
              ))}
            </div>
            <div style={s.card}>
              <div style={s.sectionHead}>⚗️ Causes</div>
              {result.causes.map((cause, i) => (
                <div key={i} style={{ display: 'flex', gap: '.5rem', marginBottom: '.4rem', fontSize: '.8rem', color: '#374151' }}>
                  <span style={{ color: '#3b82f6', fontWeight: 700 }}>•</span> {cause}
                </div>
              ))}
              <div style={{ marginTop: '.6rem', padding: '.6rem', background: '#fef3c7', borderRadius: 8, fontSize: '.75rem', color: '#92400e' }}>
                ⚠️ {result.severity.description}
              </div>
            </div>
          </div>

          {/* Immediate Actions */}
          <div style={s.card}>
            <div style={s.sectionHead}>⚡ Immediate Actions</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '.6rem' }}>
              {result.treatment.immediate_actions.map((action, i) => (
                <div key={i} style={{ display: 'flex', gap: '.7rem', alignItems: 'flex-start', background: '#f0fdf4', borderRadius: 8, padding: '.7rem .9rem' }}>
                  <div style={{ width: 24, height: 24, background: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '.7rem', fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ fontSize: '.8rem', color: '#166534' }}>{action}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Agrochemicals */}
          <div style={s.card}>
            <div style={s.sectionHead}>🧪 Recommended Agrochemicals</div>
            {result.treatment.agrochemicals.map((chem, i) => (
              <div key={i} style={s.chemical}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.4rem' }}>
                  <div>
                    <span style={{ fontWeight: 700, color: '#1a3a2a', fontSize: '.9rem' }}>💊 {chem.name}</span>
                    <span style={{ marginLeft: '.5rem', background: '#fbbf24', color: '#78350f', fontSize: '.62rem', fontWeight: 700, padding: '.1rem .45rem', borderRadius: 999 }}>{chem.type}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: '#e07b2a', fontSize: '.82rem' }}>{chem.estimated_cost_kes}</span>
                </div>
                <div style={{ fontSize: '.75rem', color: '#6b7280', marginBottom: '.3rem' }}>Active: <strong>{chem.active_ingredient}</strong></div>
                <div style={{ fontSize: '.78rem', color: '#374151' }}>📋 {chem.application}</div>
              </div>
            ))}

            {/* Organic alternatives */}
            <div style={{ marginTop: '.8rem' }}>
              <div style={{ fontSize: '.78rem', fontWeight: 700, color: '#166534', marginBottom: '.5rem' }}>🌿 Organic Alternatives</div>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const }}>
                {result.treatment.organic_alternatives.map((alt, i) => (
                  <span key={i} style={s.chip}>✓ {alt}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Prevention */}
          <div style={s.card}>
            <div style={s.sectionHead}>🛡️ Prevention Tips</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '.5rem' }}>
              {result.treatment.prevention.map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: '.5rem', fontSize: '.78rem', color: '#374151', background: '#f9fafb', borderRadius: 7, padding: '.55rem .8rem' }}>
                  <span style={{ color: '#10b981' }}>✓</span> {tip}
                </div>
              ))}
            </div>
          </div>

          {/* Alternative diagnoses */}
          {result.alternative_diagnoses?.length > 0 && (
            <div style={s.card}>
              <div style={s.sectionHead}>🔄 Alternative Diagnoses</div>
              {result.alternative_diagnoses.map((alt, i) => (
                <div key={i} style={s.altCard}>
                  <div>
                    <div style={{ fontSize: '.82rem', fontWeight: 600, color: '#1a3a2a' }}>{alt.name}</div>
                    <div style={{ fontSize: '.72rem', color: '#6b7280', marginTop: '.15rem' }}>
                      To confirm: {alt.distinguishing_factor}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' as const, flexShrink: 0, marginLeft: '1rem' }}>
                    <div style={{ fontSize: '.82rem', fontWeight: 700, color: alt.confidence > 40 ? '#f59e0b' : '#9ca3af' }}>{alt.confidence}%</div>
                    <div style={{ fontSize: '.65rem', color: '#9ca3af' }}>likelihood</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Follow-up questions */}
          {result.follow_up_questions?.length > 0 && (
            <div style={{ ...s.card, background: '#1a3a2a', color: 'white' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', fontWeight: 700, color: '#f09448', marginBottom: '.7rem' }}>
                💬 Tell the AI More (to improve accuracy)
              </div>
              {result.follow_up_questions.map((q, i) => (
                <div key={i} style={{ fontSize: '.8rem', color: '#ece5d4', marginBottom: '.4rem', display: 'flex', gap: '.5rem' }}>
                  <span style={{ color: '#e07b2a' }}>?</span> {q}
                </div>
              ))}
              <textarea
                style={{ ...s.textarea, marginTop: '.7rem', background: 'rgba(255,255,255,.08)', color: 'white', border: '1px solid rgba(255,255,255,.15)' }}
                placeholder="Type your answers here, then run the scan again for a refined diagnosis..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
              <button style={{ ...s.scanBtn, background: '#e07b2a', marginTop: '.6rem' }} onClick={runScan}>
                🔄 Refine Diagnosis
              </button>
            </div>
          )}

          {/* Save scan */}
          {farmerId && (
            <div style={{ textAlign: 'center' as const, paddingBottom: '1rem' }}>
              {saved
                ? <div style={{ color: '#10b981', fontWeight: 700, fontSize: '.85rem' }}>✅ Scan saved to your history</div>
                : <button onClick={saveScan} style={{ background: 'white', border: '2px solid #1a3a2a', color: '#1a3a2a', padding: '.5rem 1.4rem', borderRadius: 999, fontFamily: "'DM Sans'", fontWeight: 700, fontSize: '.82rem', cursor: 'pointer' }}>
                    💾 Save Scan to History
                  </button>
              }
            </div>
          )}
        </>
      )}
    </div>
  );
}
