import { useState, useEffect, useRef } from "react";

const FREE_LIMIT = 3;
const STORAGE_KEY = "pitchforge_uses";

const PLANS = [
  { name: "Starter", price: "$9", period: "/mo", credits: "50 pitches/mo", cta: "Start Free Trial" },
  { name: "Pro", price: "$19", period: "/mo", credits: "Unlimited pitches", cta: "Go Pro", highlight: true },
];

function getUses() {
  try {
    return parseInt(localStorage.getItem(STORAGE_KEY) || "0");
  } catch { return 0; }
}
function incrementUses() {
  try {
    const n = getUses() + 1;
    localStorage.setItem(STORAGE_KEY, n);
    return n;
  } catch { return 0; }
}

export default function PitchForge() {
  const [page, setPage] = useState("app"); // app | pricing | how
  const [service, setService] = useState("");
  const [prospect, setProspect] = useState("");
  const [tone, setTone] = useState("professional");
  const [channel, setChannel] = useState("email");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [uses, setUses] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [copied, setCopied] = useState(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    setUses(getUses());
  }, []);

  const remaining = Math.max(0, FREE_LIMIT - uses);

  async function generate() {
    if (!service.trim() || !prospect.trim()) {
      setError("Please fill in both fields.");
      return;
    }
    if (uses >= FREE_LIMIT) {
      setShowPaywall(true);
      return;
    }
    setError("");
    setLoading(true);
    setResults(null);

    const systemPrompt = `You are PitchForge, an expert cold outreach copywriter. You write highly personalized, concise, and compelling ${channel === "email" ? "cold emails" : "cold DMs"} that get replies. 
Generate exactly 3 distinct pitch variations. Each should have a different angle/hook.
Respond ONLY with valid JSON in this exact format:
{
  "pitches": [
    { "label": "The Problem-First", "subject": "...", "body": "..." },
    { "label": "The Social Proof", "subject": "...", "body": "..." },
    { "label": "The Curiosity Hook", "subject": "...", "body": "..." }
  ]
}
${channel === "dm" ? "For DMs: skip the subject field (set it to null). Keep body under 120 words." : "For emails: include subject line. Keep body under 180 words."}
Tone: ${tone}. Make each pitch feel human, not AI-written. No clichés like 'I hope this finds you well'.`;

    const userPrompt = `My service/offer: ${service}
Prospect info: ${prospect}
Generate 3 personalized ${channel === "email" ? "cold email" : "cold DM"} pitches.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }]
        })
      });
      const data = await res.json();
      const text = data.content?.map(c => c.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResults(parsed.pitches);
      const newUses = incrementUses();
      setUses(newUses);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e) {
      setError("Generation failed. Please try again.");
    }
    setLoading(false);
  }

  function copyText(text, idx) {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  }

  const tones = ["professional", "casual", "bold", "friendly"];
  const channels = [
    { id: "email", icon: "✉️", label: "Cold Email" },
    { id: "dm", icon: "💬", label: "Cold DM" }
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#08090c",
      fontFamily: "'Syne', 'DM Sans', sans-serif",
      color: "#e8e8f0",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: #2563eb44; }
        textarea, input { outline: none; }
        textarea:focus, input:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px #3b82f610; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin { to { transform: rotate(360deg); } }
        .pitch-card { transition: border-color 0.2s, transform 0.2s; }
        .pitch-card:hover { border-color: #3b82f660 !important; transform: translateY(-2px); }
        .nav-link { cursor: pointer; opacity: 0.5; transition: opacity 0.2s; font-size: 13px; color: #e8e8f0; background: none; border: none; font-family: inherit; }
        .nav-link:hover, .nav-link.active { opacity: 1; }
        .tone-btn { cursor: pointer; transition: all 0.15s; border: none; font-family: inherit; text-transform: capitalize; }
        .tone-btn:hover { background: #1e2030 !important; }
        .ch-btn { cursor: pointer; transition: all 0.2s; border: none; font-family: inherit; }
      `}</style>

      {/* Nav */}
      <nav style={{ borderBottom: "1px solid #ffffff0d", padding: "0 24px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#08090cf0", backdropFilter: "blur(12px)", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "28px", height: "28px", background: "linear-gradient(135deg, #2563eb, #7c3aed)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>⚡</div>
          <span style={{ fontWeight: "800", fontSize: "15px", letterSpacing: "-0.3px" }}>PitchForge</span>
          <span style={{ fontSize: "9px", background: "#2563eb20", color: "#60a5fa", border: "1px solid #2563eb30", borderRadius: "4px", padding: "2px 6px", fontFamily: "'DM Mono'", letterSpacing: "1px" }}>BETA</span>
        </div>
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <button className={`nav-link ${page === "app" ? "active" : ""}`} onClick={() => setPage("app")}>Generator</button>
          <button className={`nav-link ${page === "how" ? "active" : ""}`} onClick={() => setPage("how")}>How it works</button>
          <button className={`nav-link ${page === "pricing" ? "active" : ""}`} onClick={() => setPage("pricing")}>Pricing</button>
          <button onClick={() => setPage("pricing")} style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", color: "#fff", border: "none", borderRadius: "8px", padding: "7px 16px", fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.3px" }}>
            Get Full Access
          </button>
        </div>
      </nav>

      {/* MAIN APP PAGE */}
      {page === "app" && (
        <div style={{ maxWidth: "760px", margin: "0 auto", padding: "40px 20px" }}>
          {/* Hero */}
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#2563eb12", border: "1px solid #2563eb25", borderRadius: "20px", padding: "5px 14px", fontSize: "11px", color: "#60a5fa", marginBottom: "16px", fontFamily: "'DM Mono'" }}>
              <span style={{ width: "6px", height: "6px", background: "#22c55e", borderRadius: "50%", display: "inline-block", animation: "shimmer 1.5s infinite" }} />
              AI-POWERED · FREE TIER ACTIVE · {remaining} USES REMAINING
            </div>
            <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: "800", lineHeight: 1.1, letterSpacing: "-1.5px", marginBottom: "12px" }}>
              Cold outreach that<br />
              <span style={{ background: "linear-gradient(90deg, #3b82f6, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>actually gets replies.</span>
            </h1>
            <p style={{ color: "#6b7280", fontSize: "15px", lineHeight: 1.6, maxWidth: "480px", margin: "0 auto" }}>
              Paste your offer + prospect info. Get 3 battle-tested pitch variations in seconds.
            </p>
          </div>

          {/* Form Card */}
          <div style={{ background: "#0d0f18", border: "1px solid #ffffff0d", borderRadius: "16px", padding: "28px", marginBottom: "24px" }}>

            {/* Channel selector */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
              {channels.map(c => (
                <button key={c.id} className="ch-btn" onClick={() => setChannel(c.id)} style={{
                  flex: 1, padding: "10px", borderRadius: "10px", fontSize: "13px", fontWeight: "700",
                  background: channel === c.id ? "#2563eb" : "#ffffff08",
                  color: channel === c.id ? "#fff" : "#6b7280",
                  border: `1px solid ${channel === c.id ? "#2563eb" : "#ffffff10"}`,
                }}>
                  {c.icon} {c.label}
                </button>
              ))}
            </div>

            {/* Service input */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", letterSpacing: "1.5px", display: "block", marginBottom: "8px", fontFamily: "'DM Mono'" }}>YOUR SERVICE / OFFER</label>
              <textarea
                value={service}
                onChange={e => setService(e.target.value)}
                placeholder="e.g. I build Shopify stores for fashion brands. I've helped 20+ brands increase conversions by 30%."
                rows={3}
                style={{
                  width: "100%", background: "#080a10", border: "1px solid #ffffff12", borderRadius: "10px",
                  padding: "12px 14px", color: "#e8e8f0", fontSize: "14px", resize: "none",
                  lineHeight: 1.6, fontFamily: "inherit", transition: "all 0.2s"
                }}
              />
            </div>

            {/* Prospect input */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", letterSpacing: "1.5px", display: "block", marginBottom: "8px", fontFamily: "'DM Mono'" }}>PROSPECT INFO</label>
              <textarea
                value={prospect}
                onChange={e => setProspect(e.target.value)}
                placeholder="e.g. Sarah runs a sustainable clothing brand called 'EcoThread'. 50k Instagram followers. Just launched a new summer collection. Seems to struggle with website sales vs social engagement."
                rows={3}
                style={{
                  width: "100%", background: "#080a10", border: "1px solid #ffffff12", borderRadius: "10px",
                  padding: "12px 14px", color: "#e8e8f0", fontSize: "14px", resize: "none",
                  lineHeight: 1.6, fontFamily: "inherit", transition: "all 0.2s"
                }}
              />
            </div>

            {/* Tone selector */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", letterSpacing: "1.5px", display: "block", marginBottom: "8px", fontFamily: "'DM Mono'" }}>TONE</label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {tones.map(t => (
                  <button key={t} className="tone-btn" onClick={() => setTone(t)} style={{
                    padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
                    background: tone === t ? "#2563eb20" : "#ffffff08",
                    color: tone === t ? "#60a5fa" : "#6b7280",
                    border: `1px solid ${tone === t ? "#2563eb50" : "#ffffff10"}`,
                  }}>{t}</button>
                ))}
              </div>
            </div>

            {error && <p style={{ color: "#f87171", fontSize: "13px", marginBottom: "14px" }}>⚠️ {error}</p>}

            {/* CTA */}
            <button
              onClick={generate}
              disabled={loading}
              style={{
                width: "100%", padding: "14px", borderRadius: "12px",
                background: loading ? "#1a1d28" : "linear-gradient(135deg, #2563eb, #7c3aed)",
                color: loading ? "#6b7280" : "#fff", border: "none", fontSize: "15px",
                fontWeight: "800", cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit", letterSpacing: "-0.3px", display: "flex",
                alignItems: "center", justifyContent: "center", gap: "8px", transition: "opacity 0.2s"
              }}
            >
              {loading ? (
                <>
                  <div style={{ width: "16px", height: "16px", border: "2px solid #6b7280", borderTopColor: "#e8e8f0", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  Crafting your pitches...
                </>
              ) : (
                <>⚡ Generate 3 Pitches — {remaining} free uses left</>
              )}
            </button>
          </div>

          {/* Results */}
          {results && (
            <div ref={resultsRef} style={{ animation: "fadeUp 0.4s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{ height: "1px", flex: 1, background: "linear-gradient(90deg, #2563eb30, transparent)" }} />
                <span style={{ fontSize: "11px", color: "#6b7280", fontFamily: "'DM Mono'", letterSpacing: "1.5px" }}>YOUR 3 PITCHES</span>
                <div style={{ height: "1px", flex: 1, background: "linear-gradient(90deg, transparent, #2563eb30)" }} />
              </div>
              {results.map((p, i) => (
                <div key={i} className="pitch-card" style={{
                  background: "#0d0f18", border: "1px solid #ffffff0d", borderRadius: "14px",
                  padding: "20px", marginBottom: "14px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", borderRadius: "6px", width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "700", color: "#fff" }}>{i + 1}</div>
                      <span style={{ fontWeight: "700", fontSize: "13px", color: "#a78bfa" }}>{p.label}</span>
                    </div>
                    <button
                      onClick={() => copyText(p.subject ? `Subject: ${p.subject}\n\n${p.body}` : p.body, i)}
                      style={{ background: copied === i ? "#22c55e20" : "#ffffff08", border: `1px solid ${copied === i ? "#22c55e40" : "#ffffff15"}`, borderRadius: "7px", padding: "5px 12px", fontSize: "11px", color: copied === i ? "#22c55e" : "#9ca3af", cursor: "pointer", fontFamily: "'DM Mono'", transition: "all 0.2s" }}
                    >
                      {copied === i ? "✓ Copied" : "Copy"}
                    </button>
                  </div>
                  {p.subject && (
                    <div style={{ marginBottom: "10px", padding: "8px 12px", background: "#2563eb0d", borderRadius: "7px", border: "1px solid #2563eb20" }}>
                      <span style={{ fontSize: "10px", color: "#6b7280", fontFamily: "'DM Mono'", letterSpacing: "1px" }}>SUBJECT: </span>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#93c5fd" }}>{p.subject}</span>
                    </div>
                  )}
                  <p style={{ fontSize: "14px", lineHeight: 1.7, color: "#c4c8d8", whiteSpace: "pre-wrap" }}>{p.body}</p>
                </div>
              ))}
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <button onClick={() => setPage("pricing")} style={{ background: "none", border: "1px solid #2563eb40", borderRadius: "10px", color: "#60a5fa", padding: "10px 24px", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>
                  🔓 Unlock unlimited pitches →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* HOW IT WORKS PAGE */}
      {page === "how" && (
        <div style={{ maxWidth: "680px", margin: "0 auto", padding: "60px 20px" }}>
          <h2 style={{ fontWeight: "800", fontSize: "32px", letterSpacing: "-1px", marginBottom: "8px" }}>How PitchForge works</h2>
          <p style={{ color: "#6b7280", marginBottom: "48px" }}>Three steps. Under 30 seconds.</p>
          {[
            { n: "01", title: "Describe your service", desc: "Tell us what you offer and what makes you different. One paragraph is enough." },
            { n: "02", title: "Add your prospect's info", desc: "Paste their job title, company, social bio, pain points — anything you know. More context = better pitches." },
            { n: "03", title: "Get 3 personalized pitches", desc: "PitchForge generates 3 different angle variations — problem-first, social proof, and curiosity hook. Copy the one that fits and send." }
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", gap: "24px", marginBottom: "36px", alignItems: "flex-start" }}>
              <div style={{ fontFamily: "'DM Mono'", fontSize: "32px", fontWeight: "500", color: "#2563eb30", minWidth: "50px" }}>{s.n}</div>
              <div>
                <h3 style={{ fontWeight: "700", fontSize: "17px", marginBottom: "6px" }}>{s.title}</h3>
                <p style={{ color: "#6b7280", lineHeight: 1.7, fontSize: "14px" }}>{s.desc}</p>
              </div>
            </div>
          ))}
          <button onClick={() => setPage("app")} style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", color: "#fff", border: "none", borderRadius: "10px", padding: "12px 28px", fontSize: "14px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}>
            Try it free →
          </button>
        </div>
      )}

      {/* PRICING PAGE */}
      {page === "pricing" && (
        <div style={{ maxWidth: "680px", margin: "0 auto", padding: "60px 20px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#2563eb12", border: "1px solid #2563eb25", borderRadius: "20px", padding: "5px 14px", fontSize: "11px", color: "#60a5fa", marginBottom: "16px", fontFamily: "'DM Mono'" }}>
            SIMPLE PRICING
          </div>
          <h2 style={{ fontWeight: "800", fontSize: "32px", letterSpacing: "-1px", marginBottom: "8px" }}>One client pays this off forever.</h2>
          <p style={{ color: "#6b7280", marginBottom: "40px", fontSize: "14px" }}>
            The average freelancer closes 1 extra client every month using PitchForge.<br />That client is worth $500–$5,000. Do the math.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }}>
            {PLANS.map((plan, i) => (
              <div key={i} style={{
                background: plan.highlight ? "linear-gradient(135deg, #2563eb12, #7c3aed12)" : "#0d0f18",
                border: `1px solid ${plan.highlight ? "#7c3aed50" : "#ffffff0d"}`,
                borderRadius: "16px", padding: "28px",
                position: "relative"
              }}>
                {plan.highlight && (
                  <div style={{ position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #2563eb, #7c3aed)", borderRadius: "20px", padding: "3px 12px", fontSize: "10px", fontWeight: "700", color: "#fff", whiteSpace: "nowrap" }}>
                    MOST POPULAR
                  </div>
                )}
                <div style={{ fontWeight: "700", color: "#9ca3af", fontSize: "12px", letterSpacing: "1.5px", marginBottom: "12px", fontFamily: "'DM Mono'" }}>{plan.name.toUpperCase()}</div>
                <div style={{ fontWeight: "800", fontSize: "36px", letterSpacing: "-1.5px", marginBottom: "4px" }}>
                  {plan.price}<span style={{ fontSize: "14px", color: "#6b7280", fontWeight: "400" }}>{plan.period}</span>
                </div>
                <div style={{ color: "#6b7280", fontSize: "13px", marginBottom: "24px" }}>{plan.credits}</div>
                <button style={{
                  width: "100%", padding: "11px", borderRadius: "10px",
                  background: plan.highlight ? "linear-gradient(135deg, #2563eb, #7c3aed)" : "#ffffff0d",
                  color: "#fff", border: "none", fontWeight: "700", fontSize: "13px",
                  cursor: "pointer", fontFamily: "inherit"
                }}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          {/* USDT Payment Section */}
          <div style={{ background: "#0d1a0d", border: "1px solid #22c55e30", borderRadius: "16px", padding: "24px", marginBottom: "20px", textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <span style={{ fontSize: "20px" }}>₮</span>
              <span style={{ fontWeight: "800", fontSize: "15px", color: "#22c55e" }}>Pay with USDT (TRC20)</span>
              <span style={{ fontSize: "10px", background: "#22c55e20", color: "#22c55e", border: "1px solid #22c55e30", borderRadius: "4px", padding: "2px 8px", fontFamily: "'DM Mono'" }}>RECOMMENDED</span>
            </div>
            <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "16px", lineHeight: 1.6 }}>
              Send USDT on the <strong style={{ color: "#e8e8f0" }}>TRON (TRC20)</strong> network to the address below. Then email us your transaction ID to activate your account.
            </p>

            {/* Steps */}
            {[
              "Open Binance or any crypto wallet",
              "Send $9 (Starter) or $19 (Pro) in USDT",
              "Select TRC20 network",
              "Paste the wallet address below",
              "Email your TX ID to: pitchforge@gmail.com"
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "8px", alignItems: "flex-start" }}>
                <div style={{ minWidth: "18px", height: "18px", background: "#22c55e", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: "700", color: "#000", flexShrink: 0 }}>{i + 1}</div>
                <span style={{ fontSize: "12px", color: "#c4c8d8", lineHeight: 1.5 }}>{s}</span>
              </div>
            ))}

            {/* Wallet address */}
            <div style={{ marginTop: "16px", background: "#000", border: "1px solid #22c55e40", borderRadius: "10px", padding: "14px" }}>
              <div style={{ fontSize: "10px", color: "#6b7280", fontFamily: "'DM Mono'", letterSpacing: "1px", marginBottom: "6px" }}>USDT TRC20 WALLET ADDRESS</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
                <code style={{ fontSize: "11px", color: "#22c55e", fontFamily: "'DM Mono'", wordBreak: "break-all" }}>TUY6KhFdgP3CFP7vFH3ejYdD9tLrVBU764</code>
                <button
                  onClick={() => { navigator.clipboard.writeText("TUY6KhFdgP3CFP7vFH3ejYdD9tLrVBU764"); alert("Address copied!"); }}
                  style={{ background: "#22c55e20", border: "1px solid #22c55e40", borderRadius: "6px", padding: "5px 12px", fontSize: "11px", color: "#22c55e", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
                >
                  Copy
                </button>
              </div>
            </div>

            <p style={{ fontSize: "11px", color: "#4b5563", marginTop: "12px" }}>
              ⚠️ Only send USDT on TRC20 network. Sending on wrong network will result in loss of funds.
            </p>
          </div>

          {/* Payoneer Payment Section */}
          <div style={{ background: "#0d0f18", border: "1px solid #3b82f630", borderRadius: "16px", padding: "24px", marginBottom: "16px", textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <span style={{ fontSize: "20px" }}>💳</span>
              <span style={{ fontWeight: "800", fontSize: "15px", color: "#60a5fa" }}>Pay via Payoneer</span>
            </div>
            <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "16px", lineHeight: 1.6 }}>
              Send your payment directly to our Payoneer account. Works from any country, any bank or card.
            </p>
            {[
              "Log in or sign up at payoneer.com",
              "Click 'Pay' or 'Send Payment'",
              "Send $9 (Starter) or $19 (Pro)",
              "Pay to email: Jad_sa3da2002@hotmail.com",
              "Email your receipt to pitchforge@gmail.com to activate"
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "8px", alignItems: "flex-start" }}>
                <div style={{ minWidth: "18px", height: "18px", background: "#3b82f6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: "700", color: "#fff", flexShrink: 0 }}>{i + 1}</div>
                <span style={{ fontSize: "12px", color: "#c4c8d8", lineHeight: 1.5 }}>{s}</span>
              </div>
            ))}
            <div style={{ marginTop: "16px", background: "#080a10", border: "1px solid #3b82f630", borderRadius: "10px", padding: "14px" }}>
              <div style={{ fontSize: "10px", color: "#6b7280", fontFamily: "'DM Mono'", letterSpacing: "1px", marginBottom: "6px" }}>PAYONEER EMAIL</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
                <code style={{ fontSize: "12px", color: "#60a5fa", fontFamily: "'DM Mono'" }}>Jad_sa3da2002@hotmail.com</code>
                <button onClick={() => { navigator.clipboard.writeText("Jad_sa3da2002@hotmail.com"); alert("Email copied!"); }} style={{ background: "#3b82f620", border: "1px solid #3b82f640", borderRadius: "6px", padding: "5px 12px", fontSize: "11px", color: "#60a5fa", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>Copy</button>
              </div>
            </div>
          </div>

          <p style={{ color: "#374151", fontSize: "12px" }}>No credit card required · Cancel anytime · Payments processed within 24hrs</p>
        </div>
      )}

      {/* PAYWALL MODAL */}
      {showPaywall && (
        <div style={{ position: "fixed", inset: 0, background: "#000000cc", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "20px" }} onClick={() => setShowPaywall(false)}>
          <div style={{ background: "#0d0f18", border: "1px solid #7c3aed40", borderRadius: "20px", padding: "36px", maxWidth: "420px", width: "100%", textAlign: "center", animation: "fadeUp 0.3s ease" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔒</div>
            <h3 style={{ fontWeight: "800", fontSize: "22px", marginBottom: "8px", letterSpacing: "-0.5px" }}>You've used all 3 free pitches</h3>
            <p style={{ color: "#6b7280", fontSize: "14px", lineHeight: 1.7, marginBottom: "24px" }}>
              Upgrade to get unlimited pitch generation and start closing more clients today.
            </p>
            <button
              onClick={() => { setShowPaywall(false); setPage("pricing"); }}
              style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, #2563eb, #7c3aed)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "800", fontSize: "15px", cursor: "pointer", fontFamily: "inherit", marginBottom: "10px" }}
            >
              See Plans — from $9/mo →
            </button>
            <button onClick={() => setShowPaywall(false)} style={{ background: "none", border: "none", color: "#6b7280", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>Maybe later</button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #ffffff08", padding: "20px", textAlign: "center", marginTop: "40px" }}>
        <p style={{ color: "#374151", fontSize: "11px", fontFamily: "'DM Mono'" }}>
          ⚡ PITCHFORGE · BUILT WITH CLAUDE AI · © 2026
        </p>
      </footer>
    </div>
  );
}
