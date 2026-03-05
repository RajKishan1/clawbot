import { useState, useEffect, useRef, FC, ReactNode } from "react";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface Step {
  num: string;
  title: string;
  desc: string;
}

interface Feature {
  icon: string;
  title: string;
  desc: string;
}

interface PlanFeature {
  text: ReactNode;
  included: boolean;
}

interface Plan {
  name: string;
  desc: string;
  monthlyPrice: number | "Custom";
  annualPrice: number | "Custom";
  annualNote: string;
  badge?: string;
  featured?: boolean;
  ctaLabel: string;
  ctaVariant: "default" | "amber" | "outline";
  features: PlanFeature[];
}

interface CompareRow {
  label: string;
  hobby: ReactNode;
  pro: ReactNode;
  enterprise: ReactNode;
  category?: boolean;
}

interface FAQItem {
  q: string;
  a: string;
}

interface Integration {
  label: string;
}

/* ─────────────────────────────────────────────
   Global Styles (fonts + keyframes Tailwind can't express)
───────────────────────────────────────────── */
const GlobalStyles: FC = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=JetBrains+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { cursor: none; overflow-x: hidden; background: #09090e; }

    .f-serif { font-family: 'Playfair Display', serif; }
    .f-mono  { font-family: 'JetBrains Mono', monospace; }
    .f-sans  { font-family: 'DM Sans', sans-serif; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(26px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes marqueeScroll {
      from { transform: translateX(0); }
      to   { transform: translateX(-50%); }
    }
    @keyframes gridFloat {
      from { background-position: 0 0; }
      to   { background-position: 80px 80px; }
    }

    .anim-fu1 { animation: fadeUp 0.75s 0.10s both; }
    .anim-fu2 { animation: fadeUp 0.75s 0.28s both; }
    .anim-fu3 { animation: fadeUp 0.75s 0.46s both; }
    .anim-fu4 { animation: fadeUp 0.75s 0.62s both; }
    .anim-fu5 { animation: fadeUp 0.75s 0.78s both; }

    .marquee-track { animation: marqueeScroll 28s linear infinite; white-space: nowrap; }
    .marquee-track:hover { animation-play-state: paused; }

    .hero-grid {
      background-image:
        linear-gradient(rgba(240,165,0,0.045) 1px, transparent 1px),
        linear-gradient(90deg, rgba(240,165,0,0.045) 1px, transparent 1px);
      background-size: 80px 80px;
      mask-image: radial-gradient(ellipse 75% 65% at 65% 42%, black 20%, transparent 80%);
      animation: gridFloat 14s linear infinite;
    }

    /* reveal on scroll */
    .reveal {
      opacity: 0;
      transform: translateY(28px);
      transition: opacity 0.7s ease, transform 0.7s ease;
    }
    .reveal.d1 { transition-delay: 0.10s; }
    .reveal.d2 { transition-delay: 0.20s; }
    .reveal.d3 { transition-delay: 0.32s; }
    .reveal.visible { opacity: 1 !important; transform: translateY(0) !important; }

    /* feature card top-line shine */
    .feat-card { position: relative; overflow: hidden; }
    .feat-card::before {
      content: '';
      position: absolute; top: 0; left: 0; right: 0; height: 1px;
      background: linear-gradient(90deg, transparent, #f0a500, transparent);
      opacity: 0;
      transition: opacity 0.35s;
    }
    .feat-card:hover::before { opacity: 1; }

    /* plan featured top bar */
    .plan-featured::before {
      content: '';
      position: absolute; top: 0; left: 0; right: 0; height: 2px;
      background: #f0a500;
    }

    /* FAQ */
    .faq-body {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.38s ease, padding 0.25s;
    }
    .faq-body.open { max-height: 240px; padding-bottom: 24px; }

    /* scrollbar */
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: #09090e; }
    ::-webkit-scrollbar-thumb { background: #2a2835; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #f0a500; }
    
    table { border-collapse: collapse; }
  `}</style>
);

/* ─────────────────────────────────────────────
   Cursor
───────────────────────────────────────────── */
const Cursor: FC = () => {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ mx: 0, my: 0, rx: 0, ry: 0 });
  const raf = useRef<number>(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pos.current.mx = e.clientX;
      pos.current.my = e.clientY;
    };
    window.addEventListener("mousemove", onMove);

    const tick = () => {
      const { mx, my } = pos.current;
      pos.current.rx += (mx - pos.current.rx) * 0.14;
      pos.current.ry += (my - pos.current.ry) * 0.14;
      if (dotRef.current)  { dotRef.current.style.left  = mx + "px"; dotRef.current.style.top  = my + "px"; }
      if (ringRef.current) { ringRef.current.style.left = pos.current.rx + "px"; ringRef.current.style.top  = pos.current.ry + "px"; }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    const expand  = () => { if (ringRef.current) { ringRef.current.style.cssText += "width:54px;height:54px;border-color:rgba(240,165,0,0.9)"; } };
    const shrink  = () => { if (ringRef.current) { ringRef.current.style.cssText += "width:36px;height:36px;border-color:rgba(240,165,0,0.4)"; } };
    const targets = document.querySelectorAll<HTMLElement>("a,button,.faq-q,.toggle-sw");
    targets.forEach(el => { el.addEventListener("mouseenter", expand); el.addEventListener("mouseleave", shrink); });

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf.current);
      targets.forEach(el => { el.removeEventListener("mouseenter", expand); el.removeEventListener("mouseleave", shrink); });
    };
  }, []);

  const baseStyle: React.CSSProperties = {
    position: "fixed",
    pointerEvents: "none",
    transform: "translate(-50%,-50%)",
    zIndex: 9999,
  };

  return (
    <>
      <div ref={dotRef}  style={{ ...baseStyle, width: 10, height: 10, background: "#f0a500", borderRadius: "50%" }} />
      <div ref={ringRef} style={{ ...baseStyle, width: 36, height: 36, border: "1px solid rgba(240,165,0,0.4)", borderRadius: "50%", zIndex: 9998, transition: "width 0.2s,height 0.2s,border-color 0.2s" }} />
    </>
  );
};

/* ─────────────────────────────────────────────
   useReveal – IntersectionObserver
───────────────────────────────────────────── */
const useReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); } }),
      { threshold: 0.1 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
};

/* ─────────────────────────────────────────────
   Section Label
───────────────────────────────────────────── */
const SectionLabel: FC<{ children: string; center?: boolean }> = ({ children, center }) => (
  <p className={`f-mono text-xs tracking-widest uppercase mb-5 flex items-center gap-3 ${center ? "justify-center" : ""}`}
     style={{ color: "#f0a500" }}>
    {center && <span style={{ display: "block", width: 32, height: 1, background: "#b07400" }} />}
    {children}
    {!center && <span style={{ display: "block", width: 32, height: 1, background: "#b07400" }} />}
  </p>
);

/* ─────────────────────────────────────────────
   Nav
───────────────────────────────────────────── */
const Nav: FC = () => {
  const [scrolled, setScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const links: { label: string; href: string }[] = [
    { label: "Features",     href: "#features"     },
    { label: "How it works", href: "#how-it-works"  },
    { label: "Pricing",      href: "#pricing"       },
  ];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 500,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "20px 48px",
      borderBottom: scrolled ? "1px solid rgba(240,240,230,0.06)" : "1px solid transparent",
      background:   scrolled ? "rgba(9,9,14,0.88)"                : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      transition: "all 0.3s",
    }}>
      {/* Logo */}
      <a href="#" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <div style={{ width: 24, height: 24, background: "#f0a500", clipPath: "polygon(50% 0%,100% 50%,50% 100%,0% 50%)", flexShrink: 0 }} />
        <span className="f-serif font-black text-xl" style={{ color: "#f0ede6", letterSpacing: "-0.02em" }}>
          Claw<span style={{ color: "#f0a500" }}>.</span>
        </span>
      </a>

      {/* Links */}
      <ul style={{ display: "flex", alignItems: "center", gap: 32, listStyle: "none", margin: 0, padding: 0 }}>
        {links.map(({ label, href }) => (
          <li key={label}>
            <a href={href} className="f-mono text-xs tracking-wider uppercase"
               style={{ color: "#6b6878", textDecoration: "none", transition: "color 0.2s" }}
               onMouseEnter={e => (e.currentTarget.style.color = "#f0ede6")}
               onMouseLeave={e => (e.currentTarget.style.color = "#6b6878")}>
              {label}
            </a>
          </li>
        ))}
        <li>
          <a href="#pricing" className="f-mono text-xs tracking-wider uppercase"
             style={{ background: "#f0a500", color: "#09090e", padding: "8px 22px", borderRadius: 4, fontWeight: 500, textDecoration: "none", display: "block", transition: "background 0.2s,transform 0.15s" }}
             onMouseEnter={e => { e.currentTarget.style.background = "#ffc233"; e.currentTarget.style.transform = "translateY(-1px)"; }}
             onMouseLeave={e => { e.currentTarget.style.background = "#f0a500"; e.currentTarget.style.transform = "translateY(0)"; }}>
            Get Started
          </a>
        </li>
      </ul>
    </nav>
  );
};

/* ─────────────────────────────────────────────
   Hero
───────────────────────────────────────────── */
const Hero: FC = () => {
  const stats: { val: string; label: string }[] = [
    { val: "3+",  label: "LLM Providers"      },
    { val: "<1s", label: "Webhook response"    },
    { val: "∞",   label: "Agents per workspace"},
  ];

  return (
    <section id="home" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", padding: "140px 48px 80px", position: "relative", overflow: "hidden", background: "#09090e" }}>
      <div className="hero-grid" style={{ position: "absolute", inset: 0 }} />
      <div style={{ position: "absolute", top: -200, right: -200, width: 700, height: 700, background: "radial-gradient(circle, rgba(240,165,0,0.08) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -100, left: 180,  width: 420, height: 420, background: "radial-gradient(circle, rgba(100,80,240,0.05) 0%, transparent 65%)",  pointerEvents: "none" }} />

      <p className="anim-fu1 f-mono text-xs tracking-widest uppercase flex items-center gap-3" style={{ color: "#f0a500", position: "relative", marginBottom: 24 }}>
        <span style={{ display: "block", width: 28, height: 1, background: "#f0a500" }} />
        AI Agent Deployment Platform
      </p>

      <h1 className="anim-fu2 f-serif font-black" style={{ fontSize: "clamp(3rem,7vw,6.6rem)", lineHeight: 1.01, letterSpacing: "-0.03em", maxWidth: 820, margin: "0 0 24px", position: "relative", color: "#f0ede6" }}>
        Deploy agents.<br />
        <em style={{ fontStyle: "italic", color: "#f0a500" }}>Not boilerplate.</em>
      </h1>

      <p className="anim-fu3 f-sans" style={{ fontSize: "1.08rem", fontWeight: 300, color: "#6b6878", maxWidth: 500, lineHeight: 1.75, marginBottom: 44, position: "relative" }}>
        Build, configure, and deploy AI agents across Telegram and beyond — with a secure async runtime, sandboxed tool execution, and full observability. No scaffolding required.
      </p>

      <div className="anim-fu4 flex items-center gap-4" style={{ position: "relative" }}>
        {/* primary btn */}
        <a href="#pricing"
           className="f-mono text-sm tracking-wider"
           style={{ background: "#f0a500", color: "#09090e", padding: "14px 32px", borderRadius: 4, fontWeight: 500, textDecoration: "none", transition: "background 0.2s,transform 0.15s,box-shadow 0.2s", display: "inline-block" }}
           onMouseEnter={e => { e.currentTarget.style.background = "#ffc233"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(240,165,0,0.3)"; }}
           onMouseLeave={e => { e.currentTarget.style.background = "#f0a500"; e.currentTarget.style.transform = "translateY(0)";   e.currentTarget.style.boxShadow = "none"; }}>
          Start building →
        </a>
        {/* ghost btn */}
        <a href="#how-it-works"
           className="f-mono text-sm tracking-wider"
           style={{ background: "transparent", color: "#f0ede6", padding: "14px 32px", borderRadius: 4, border: "1px solid rgba(240,240,230,0.09)", textDecoration: "none", transition: "border-color 0.2s,color 0.2s", display: "inline-block" }}
           onMouseEnter={e => { e.currentTarget.style.borderColor = "#f0a500"; e.currentTarget.style.color = "#f0a500"; }}
           onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(240,240,230,0.09)"; e.currentTarget.style.color = "#f0ede6"; }}>
          See how it works
        </a>
      </div>

      {/* Stats bar */}
      <div className="anim-fu5 flex gap-14" style={{ marginTop: 72, paddingTop: 44, borderTop: "1px solid rgba(240,240,230,0.06)", width: "100%", maxWidth: 660, position: "relative" }}>
        {stats.map(s => (
          <div key={s.label}>
            <div className="f-serif font-bold" style={{ fontSize: "2.6rem", lineHeight: 1, color: "#f0ede6" }}>
              {s.val.includes("+") || s.val.includes("∞") || s.val.includes("<")
                ? <>{s.val.replace(/[+<∞]/g, "")}<span style={{ color: "#f0a500" }}>{s.val.match(/[+<∞]/)?.[0]}</span></>
                : s.val}
            </div>
            <div className="f-mono text-xs uppercase tracking-widest" style={{ color: "#6b6878", marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────
   Marquee
───────────────────────────────────────────── */
const MARQUEE_ITEMS: string[] = [
  "OpenAI", "Anthropic", "Gemini", "Telegram", "PostgreSQL",
  "Redis Queues", "Browser Automation", "Shell Execution",
  "Calendar Integration", "Semantic Memory", "SSE Streaming", "Cron Scheduling",
];

const Marquee: FC = () => (
  <div style={{ overflow: "hidden", borderTop: "1px solid rgba(240,240,230,0.06)", borderBottom: "1px solid rgba(240,240,230,0.06)", padding: "16px 0", background: "#0f0f18" }}>
    <div className="marquee-track flex gap-16" style={{ width: "max-content" }}>
      {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
        <div key={i} className="f-mono text-xs uppercase tracking-widest flex items-center gap-3" style={{ color: "#6b6878", flexShrink: 0 }}>
          <span style={{ width: 5, height: 5, background: "#f0a500", borderRadius: "50%", display: "block" }} />
          {item}
        </div>
      ))}
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   How It Works
───────────────────────────────────────────── */
const STEPS: Step[] = [
  { num: "01", title: "Create & configure your agent",     desc: "Name your agent, write its system prompt, pick a model (GPT-4, Claude, Gemini), tune temperature — all from a clean UI. No YAML, no deploy scripts." },
  { num: "02", title: "Connect a channel",                  desc: "Link your Telegram bot token. Claw registers the webhook automatically and handles all inbound message routing to the right agent." },
  { num: "03", title: "Messages are enqueued & executed",   desc: "Incoming messages hit the API, which returns 200 immediately and enqueues an async job. The Worker runs the full LLM loop — with tools, memory, and step logging — inside an isolated sandbox." },
  { num: "04", title: "Observe, iterate, schedule",         desc: "Watch conversations and run steps in real time via SSE. Set cron schedules. Adjust permissions. No redeployment needed for any config change." },
];

const HowItWorks: FC = () => (
  <section id="how-it-works" style={{ padding: "120px 48px", background: "#09090e" }}>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, maxWidth: 1200, margin: "0 auto", alignItems: "start" }}>
      {/* sticky left */}
      <div style={{ position: "sticky", top: 120 }}>
        <div className="reveal"><SectionLabel>How it works</SectionLabel></div>
        <h2 className="f-serif font-bold reveal d1" style={{ fontSize: "clamp(2rem,4vw,3.4rem)", lineHeight: 1.08, letterSpacing: "-0.025em", color: "#f0ede6", marginBottom: 16 }}>
          From config<br />to deployed<br /><em style={{ fontStyle: "italic", color: "#f0a500" }}>in minutes.</em>
        </h2>
        <p className="f-sans reveal d2" style={{ fontSize: "0.98rem", fontWeight: 300, color: "#6b6878", lineHeight: 1.75, maxWidth: 400 }}>
          Every run is fully isolated. The API stays fast, the Worker does the heavy lifting, and your agents stay safe inside sandboxed environments.
        </p>
      </div>

      {/* steps */}
      <div>
        {STEPS.map((s, i) => (
          <div key={s.num} className={`reveal ${i > 0 ? `d${Math.min(i,3)}` : ""}`}
               style={{ display: "flex", gap: 24, padding: "28px 0", borderBottom: "1px solid rgba(240,240,230,0.06)" }}>
            <span className="f-mono text-xs" style={{ color: "#f0a500", width: 28, flexShrink: 0, paddingTop: 3 }}>{s.num}</span>
            <div>
              <div className="f-serif font-bold" style={{ fontSize: "1.1rem", color: "#f0ede6", marginBottom: 8 }}>{s.title}</div>
              <div className="f-sans" style={{ fontSize: "0.9rem", color: "#6b6878", lineHeight: 1.65, fontWeight: 300 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────
   Features
───────────────────────────────────────────── */
const FEATURES: Feature[] = [
  { icon: "⚡", title: "Async Worker Architecture",      desc: "API returns 200 immediately. A separate Worker process consumes jobs from a queue, keeping your agent runtime decoupled, scalable, and never blocking." },
  { icon: "🔒", title: "Sandboxed Tool Execution",       desc: "Shell, browser, file, and network tools run inside isolated containers with resource limits and network allowlists. Default deny — you enable what you need." },
  { icon: "🧠", title: "Long-Term Memory",               desc: "Agents remember what matters. Semantic retrieval with optional pgvector surfaces the right context at run time. Memory is agent-scoped and privacy-preserving." },
  { icon: "📡", title: "Real-Time SSE Streaming",        desc: "Subscribe to run progress via SSE. Watch tool calls and step completions live. Fallback to polling for older clients — same data, different transport." },
  { icon: "🗓️", title: "Cron & Calendar Scheduling",    desc: "Schedule agents on a cron expression or trigger them from calendar events. Scheduler is stateless — it just enqueues. Worker does the rest." },
  { icon: "🔭", title: "Full Observability",             desc: "RunStep logging captures every LLM call, tool invocation, and memory retrieval. Structured logs, per-tool metrics, and circuit breakers keep production healthy." },
  { icon: "🔌", title: "Multi-Provider LLM",             desc: "Unified adapter for OpenAI, Anthropic, and Gemini. Swap models per agent from the UI. No code changes, no redeployments required." },
  { icon: "🛡️", title: "Per-Agent Permissions",         desc: "Fine-grained capability flags: allow_shell, allow_browser, allow_network, allow_calendar. Each agent gets exactly the access it needs — nothing more." },
  { icon: "🔁", title: "Reliable Retry & Recovery",      desc: "At-least-once job delivery with idempotent run handling. Exponential backoff, dead-letter queues, graceful shutdown, and stale-run cleanup." },
];

const Features: FC = () => (
  <section id="features" style={{ padding: "120px 48px", background: "#0f0f18" }}>
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 64 }}>
        <div className="reveal"><SectionLabel>Capabilities</SectionLabel></div>
        <h2 className="f-serif font-bold reveal d1" style={{ fontSize: "clamp(2rem,4vw,3.2rem)", lineHeight: 1.08, letterSpacing: "-0.025em", color: "#f0ede6" }}>
          Built for<br />production agents.
        </h2>
      </div>

      {/* 3-col grid with 1px gap / shared border */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "rgba(240,240,230,0.06)", border: "1px solid rgba(240,240,230,0.06)" }}>
        {FEATURES.map((f, i) => (
          <div key={f.title} className={`feat-card reveal ${i % 3 !== 0 ? `d${Math.min(i % 3, 3)}` : ""}`}
               style={{ background: "#0f0f18", padding: "40px 36px", transition: "background 0.2s", cursor: "default" }}
               onMouseEnter={e => (e.currentTarget.style.background = "#14141f")}
               onMouseLeave={e => (e.currentTarget.style.background = "#0f0f18")}>
            <div style={{ width: 40, height: 40, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(240,165,0,0.1)", border: "1px solid rgba(240,165,0,0.15)", borderRadius: 4, fontSize: "1.1rem" }}>
              {f.icon}
            </div>
            <div className="f-serif font-bold" style={{ fontSize: "1.08rem", color: "#f0ede6", marginBottom: 10 }}>{f.title}</div>
            <div className="f-sans" style={{ fontSize: "0.88rem", color: "#6b6878", lineHeight: 1.65, fontWeight: 300 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────
   Integrations
───────────────────────────────────────────── */
const INTEGRATIONS: Integration[] = [
  { label: "OpenAI GPT-4" }, { label: "Anthropic Claude" }, { label: "Google Gemini" },
  { label: "Telegram Bot API" }, { label: "Google Calendar" }, { label: "PostgreSQL + pgvector" },
  { label: "Redis / BullMQ" }, { label: "AWS SQS" }, { label: "Docker Containers" },
  { label: "Playwright / CDP" }, { label: "Sentry" }, { label: "+ more soon" },
];

const Integrations: FC = () => (
  <section style={{ padding: "100px 48px", background: "#0f0f18", textAlign: "center" }}>
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div className="reveal" style={{ display: "flex", justifyContent: "center" }}><SectionLabel center>Integrations</SectionLabel></div>
      <h2 className="f-serif font-bold reveal d1" style={{ fontSize: "clamp(1.8rem,3vw,2.8rem)", letterSpacing: "-0.025em", color: "#f0ede6", marginBottom: 12 }}>Works with your stack</h2>
      <p className="f-sans reveal d2" style={{ color: "#6b6878", fontSize: "0.98rem", lineHeight: 1.7, marginBottom: 48, fontWeight: 300 }}>Plug into the tools you already use. More added based on your feedback.</p>
      <div className="reveal d3 flex flex-wrap justify-center gap-3">
        {INTEGRATIONS.map(({ label }) => (
          <div key={label} className="f-mono text-xs flex items-center gap-2"
               style={{ background: "#14141f", border: "1px solid rgba(240,240,230,0.06)", padding: "12px 24px", borderRadius: 100, color: "#6b6878", letterSpacing: "0.04em", transition: "border-color 0.2s,color 0.2s", cursor: "default" }}
               onMouseEnter={e => { e.currentTarget.style.borderColor = "#f0a500"; e.currentTarget.style.color = "#f0ede6"; }}
               onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(240,240,230,0.06)"; e.currentTarget.style.color = "#6b6878"; }}>
            <span style={{ width: 5, height: 5, background: "#f0a500", borderRadius: "50%", display: "block", flexShrink: 0 }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────
   Pricing
───────────────────────────────────────────── */
const Tick: FC<{ yes: boolean }> = ({ yes }) => (
  <span className="f-mono text-xs" style={{ color: yes ? "#f0a500" : "#2e2c3a", flexShrink: 0, marginTop: 2 }}>{yes ? "✓" : "—"}</span>
);

const PLANS: Plan[] = [
  {
    name: "Hobby", desc: "For indie devs and side projects. Everything you need to get your first agent live.",
    monthlyPrice: 0, annualPrice: 0, annualNote: "Free forever",
    ctaLabel: "Get started free", ctaVariant: "outline",
    features: [
      { text: <><strong style={{ color: "#f0ede6" }}>2 agents</strong></>,                          included: true  },
      { text: <><strong style={{ color: "#f0ede6" }}>1 Telegram channel</strong> per agent</>,       included: true  },
      { text: <><strong style={{ color: "#f0ede6" }}>500 runs</strong> / month</>,                   included: true  },
      { text: "Async worker execution",                                                              included: true  },
      { text: "Conversation history",                                                                included: true  },
      { text: "Basic observability",                                                                 included: true  },
      { text: "Tool execution",                                                                      included: false },
      { text: "Long-term memory",                                                                    included: false },
      { text: "Scheduling",                                                                          included: false },
    ],
  },
  {
    name: "Pro", desc: "For teams shipping real products. Full tool access, memory, and scheduling.",
    monthlyPrice: 49, annualPrice: 39, annualNote: "Billed annually — $468/yr",
    badge: "Most Popular", featured: true,
    ctaLabel: "Start Pro →", ctaVariant: "amber",
    features: [
      { text: <><strong style={{ color: "#f0ede6" }}>Unlimited agents</strong></>,                   included: true },
      { text: <><strong style={{ color: "#f0ede6" }}>Unlimited channels</strong></>,                 included: true },
      { text: <><strong style={{ color: "#f0ede6" }}>10,000 runs</strong> / month</>,                included: true },
      { text: "Shell + browser tools (sandboxed)",                                                   included: true },
      { text: "Long-term memory + pgvector",                                                         included: true },
      { text: "Cron scheduling + calendar triggers",                                                 included: true },
      { text: "SSE real-time streaming",                                                             included: true },
      { text: "RunStep logging + audit trail",                                                       included: true },
      { text: "Priority queue",                                                                      included: true },
    ],
  },
  {
    name: "Enterprise", desc: "For orgs that need compliance, SSO, custom SLAs, and dedicated infrastructure.",
    monthlyPrice: "Custom", annualPrice: "Custom", annualNote: "Talk to us",
    ctaLabel: "Contact sales", ctaVariant: "outline",
    features: [
      { text: "Everything in Pro",                                                                   included: true },
      { text: <><strong style={{ color: "#f0ede6" }}>Unlimited runs</strong></>,                     included: true },
      { text: "Dedicated Worker cluster",                                                            included: true },
      { text: "BYOK (vaulted API keys)",                                                             included: true },
      { text: "SSO / SAML",                                                                          included: true },
      { text: "Multi-tenant org management",                                                         included: true },
      { text: "Custom sandbox policy",                                                               included: true },
      { text: "SLA + dedicated support",                                                             included: true },
      { text: "On-prem deployment option",                                                           included: true },
    ],
  },
];

const PlanCard: FC<{ plan: Plan; annual: boolean }> = ({ plan, annual }) => {
  const price = annual ? plan.annualPrice : plan.monthlyPrice;
  const isNumeric = typeof price === "number";

  const ctaStyle: React.CSSProperties = plan.ctaVariant === "amber"
    ? { background: "#f0a500", color: "#09090e", borderColor: "#f0a500" }
    : { background: "transparent", color: "#f0ede6", borderColor: "rgba(240,240,230,0.09)" };

  return (
    <div className={plan.featured ? "plan-featured" : ""}
         style={{ background: plan.featured ? "#14141f" : "#0f0f18", padding: "48px 40px", position: "relative" }}>
      {plan.badge && (
        <div className="f-mono text-xs uppercase tracking-widest" style={{ display: "inline-block", background: "rgba(240,165,0,0.12)", border: "1px solid rgba(240,165,0,0.2)", color: "#f0a500", padding: "4px 14px", borderRadius: 100, marginBottom: 24, letterSpacing: "0.08em" }}>
          {plan.badge}
        </div>
      )}
      <div className="f-serif font-bold" style={{ fontSize: "1.4rem", color: "#f0ede6", marginBottom: 8 }}>{plan.name}</div>
      <div className="f-sans" style={{ fontSize: "0.88rem", color: "#6b6878", lineHeight: 1.65, marginBottom: 28, minHeight: 56, fontWeight: 300 }}>{plan.desc}</div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginBottom: 6 }}>
        {isNumeric && <span className="f-mono" style={{ fontSize: "1rem", color: "#6b6878", marginBottom: 8 }}>$</span>}
        <span className="f-serif font-black" style={{ fontSize: isNumeric ? "3.2rem" : "2rem", lineHeight: 1, color: "#f0ede6" }}>
          {price}
        </span>
        {isNumeric && <span className="f-mono text-xs" style={{ color: "#6b6878", marginBottom: 10 }}>/&nbsp;mo</span>}
      </div>
      <div className="f-mono text-xs" style={{ color: "#6b6878", marginBottom: 28, letterSpacing: "0.04em" }}>
        {annual && plan.annualNote ? plan.annualNote : !annual && isNumeric && price === 0 ? "Free forever" : plan.annualNote}
      </div>

      <div style={{ height: 1, background: "rgba(240,240,230,0.06)", margin: "0 0 28px" }} />

      <ul style={{ listStyle: "none", margin: "0 0 36px", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        {plan.features.map((f, i) => (
          <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <Tick yes={f.included} />
            <span className="f-sans" style={{ fontSize: "0.88rem", color: f.included ? "#6b6878" : "#3a3847", lineHeight: 1.5, fontWeight: 300 }}>{f.text}</span>
          </li>
        ))}
      </ul>

      <a href={plan.ctaVariant === "outline" && plan.name === "Enterprise" ? "mailto:sales@claw.ai" : "#"}
         className="f-mono text-xs tracking-wider"
         style={{ display: "block", textAlign: "center", padding: "13px 24px", borderRadius: 4, fontWeight: 500, textDecoration: "none", border: "1px solid", transition: "all 0.2s", letterSpacing: "0.04em", ...ctaStyle }}
         onMouseEnter={e => {
           if (plan.ctaVariant === "amber") { e.currentTarget.style.background = "#ffc233"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(240,165,0,0.25)"; }
           else { e.currentTarget.style.borderColor = "#f0a500"; e.currentTarget.style.color = "#f0a500"; }
         }}
         onMouseLeave={e => {
           if (plan.ctaVariant === "amber") { e.currentTarget.style.background = "#f0a500"; e.currentTarget.style.boxShadow = "none"; }
           else { e.currentTarget.style.borderColor = "rgba(240,240,230,0.09)"; e.currentTarget.style.color = "#f0ede6"; }
         }}>
        {plan.ctaLabel}
      </a>
    </div>
  );
};

const COMPARE_ROWS: CompareRow[] = [
  { label: "Core", hobby: "", pro: "", enterprise: "", category: true },
  { label: "Agents",                    hobby: "2",         pro: "Unlimited",   enterprise: "Unlimited"     },
  { label: "Channels per agent",        hobby: "1",         pro: "Unlimited",   enterprise: "Unlimited"     },
  { label: "Runs / month",              hobby: "500",       pro: "10,000",      enterprise: "Unlimited"     },
  { label: "LLM providers",            hobby: "All 3",     pro: "All 3",       enterprise: "All 3 + custom"},
  { label: "Tools & Execution", hobby: "", pro: "", enterprise: "", category: true },
  { label: "Async Worker execution",    hobby: <Tick yes />, pro: <Tick yes />, enterprise: <Tick yes />   },
  { label: "Shell tool (sandboxed)",    hobby: <Tick yes={false} />, pro: <Tick yes />, enterprise: <Tick yes /> },
  { label: "Browser automation",        hobby: <Tick yes={false} />, pro: <Tick yes />, enterprise: <Tick yes /> },
  { label: "Custom sandbox policy",     hobby: <Tick yes={false} />, pro: <Tick yes={false} />, enterprise: <Tick yes /> },
  { label: "Memory & Scheduling", hobby: "", pro: "", enterprise: "", category: true },
  { label: "Conversation history",      hobby: <Tick yes />, pro: <Tick yes />, enterprise: <Tick yes />   },
  { label: "Long-term memory",          hobby: <Tick yes={false} />, pro: <Tick yes />, enterprise: <Tick yes /> },
  { label: "Cron scheduling",           hobby: <Tick yes={false} />, pro: <Tick yes />, enterprise: <Tick yes /> },
  { label: "Calendar triggers",         hobby: <Tick yes={false} />, pro: <Tick yes />, enterprise: <Tick yes /> },
  { label: "Observability", hobby: "", pro: "", enterprise: "", category: true },
  { label: "Run step logging",          hobby: "Basic",     pro: "Full",        enterprise: "Full + export" },
  { label: "SSE streaming",             hobby: <Tick yes={false} />, pro: <Tick yes />, enterprise: <Tick yes /> },
  { label: "Audit trail",               hobby: <Tick yes={false} />, pro: <Tick yes />, enterprise: <Tick yes /> },
  { label: "Security", hobby: "", pro: "", enterprise: "", category: true },
  { label: "Per-agent permission flags",hobby: <Tick yes />, pro: <Tick yes />, enterprise: <Tick yes />   },
  { label: "SSO / SAML",                hobby: <Tick yes={false} />, pro: <Tick yes={false} />, enterprise: <Tick yes /> },
  { label: "BYOK (vaulted)",            hobby: <Tick yes={false} />, pro: <Tick yes={false} />, enterprise: <Tick yes /> },
  { label: "On-prem deployment",        hobby: <Tick yes={false} />, pro: <Tick yes={false} />, enterprise: <Tick yes /> },
];

const Pricing: FC = () => {
  const [annual, setAnnual] = useState<boolean>(false);
  const th: React.CSSProperties = { padding: "18px 24px", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b6878", textAlign: "center", borderBottom: "1px solid rgba(240,240,230,0.06)", fontWeight: 400 };

  return (
    <section id="pricing" style={{ padding: "120px 48px", background: "#09090e", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 900, height: 600, background: "radial-gradient(ellipse, rgba(240,165,0,0.04) 0%, transparent 65%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <div className="reveal" style={{ display: "flex", justifyContent: "center" }}><SectionLabel center>Pricing</SectionLabel></div>
          <h2 className="f-serif font-bold reveal d1" style={{ fontSize: "clamp(2rem,4vw,3.4rem)", letterSpacing: "-0.025em", color: "#f0ede6", marginBottom: 12 }}>Simple, honest pricing.</h2>
          <p className="f-sans reveal d2" style={{ color: "#6b6878", fontSize: "0.98rem", lineHeight: 1.7, marginBottom: 28, fontWeight: 300 }}>Start free. Scale when you're ready. No hidden fees — you bring your own LLM API keys.</p>

          {/* Toggle */}
          <div className="reveal d3 flex items-center justify-center gap-3 f-mono text-xs" style={{ color: "#6b6878" }}>
            <span>Monthly</span>
            <div className="toggle-sw"
                 onClick={() => setAnnual(v => !v)}
                 style={{ width: 44, height: 22, background: annual ? "#f0a500" : "#14141f", border: `1px solid ${annual ? "#f0a500" : "rgba(240,240,230,0.09)"}`, borderRadius: 100, position: "relative", cursor: "none", transition: "background 0.2s,border-color 0.2s" }}>
              <div style={{ position: "absolute", top: 3, left: annual ? 23 : 3, width: 14, height: 14, background: "#f0ede6", borderRadius: "50%", transition: "left 0.2s" }} />
            </div>
            <span style={{ color: annual ? "#f0ede6" : "#6b6878" }}>Annual</span>
            <span className="f-mono text-xs" style={{ background: "rgba(240,165,0,0.12)", border: "1px solid rgba(240,165,0,0.2)", color: "#f0a500", padding: "3px 12px", borderRadius: 100, letterSpacing: "0.06em", textTransform: "uppercase" }}>Save 20%</span>
          </div>
        </div>

        {/* Plans */}
        <div className="reveal" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "rgba(240,240,230,0.06)", border: "1px solid rgba(240,240,230,0.06)", marginBottom: 28 }}>
          {PLANS.map(p => <PlanCard key={p.name} plan={p} annual={annual} />)}
        </div>

        <p className="reveal f-mono text-xs" style={{ textAlign: "center", color: "#6b6878", letterSpacing: "0.04em" }}>
          LLM costs billed directly by provider. Claw charges platform usage only. Overage: $0.004/run on Pro.
        </p>

        {/* Compare table */}
        <div style={{ marginTop: 80 }}>
          <h3 className="f-serif font-bold reveal" style={{ fontSize: "1.8rem", color: "#f0ede6", textAlign: "center", marginBottom: 40 }}>Compare plans</h3>
          <div className="reveal d1" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", border: "1px solid rgba(240,240,230,0.06)" }}>
              <thead>
                <tr style={{ background: "#14141f" }}>
                  <th style={{ ...th, textAlign: "left", color: "#f0ede6" }}>Feature</th>
                  <th style={th}>Hobby</th>
                  <th style={{ ...th, color: "#f0a500" }}>Pro</th>
                  <th style={th}>Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row, i) => (
                  row.category ? (
                    <tr key={i}>
                      <td colSpan={4} className="f-mono text-xs uppercase tracking-widest" style={{ background: "#0f0f18", padding: "12px 24px", color: "#f0a500", letterSpacing: "0.1em" }}>{row.label}</td>
                    </tr>
                  ) : (
                    <tr key={i} className="compare-row">
                      {([row.label, row.hobby, row.pro, row.enterprise] as ReactNode[]).map((cell, ci) => (
                        <td key={ci} className="f-sans" style={{ padding: "15px 24px", fontSize: "0.88rem", color: ci === 0 ? "#f0ede6" : "#6b6878", textAlign: ci === 0 ? "left" : "center", borderBottom: "1px solid rgba(240,240,230,0.06)", fontWeight: 300 }}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────
   FAQ
───────────────────────────────────────────── */
const FAQ_ITEMS: FAQItem[] = [
  { q: "Do I need to bring my own API keys?", a: "Yes — Claw is a platform, not an LLM reseller. You bring your OpenAI, Anthropic, or Gemini keys. We never mark up model costs. Your keys are stored encrypted in env, never exposed to the frontend." },
  { q: "How does sandboxed tool execution work?", a: "Shell, browser, and file tools run inside isolated containers with CPU caps, memory limits, and network allowlists. The Worker never calls tools in-process — they always cross a sandbox boundary. You enable each tool category per agent via capability flags." },
  { q: "What happens if a run fails or a Worker crashes?", a: "Jobs are at-least-once in the queue. Worker checks Run status before executing — if already completed or cancelled, it skips (idempotent). Crashed runs are cleaned up by a periodic recovery job and marked failed. Dead-letter queues catch max-retry exhaustion." },
  { q: "Can I run agents on a schedule?", a: "Yes, on Pro and Enterprise. Define a cron expression and timezone per agent. The Scheduler enqueues a run job when due — same Worker, same execution model as message-triggered runs. Calendar-driven triggers are also supported." },
  { q: "Is there a free trial for Pro?", a: "Yes — all new accounts get a 14-day Pro trial with no credit card required. After the trial you'll be downgraded to Hobby unless you add billing. Your agents, channels, and config are preserved." },
];

const FAQ: FC = () => {
  const [open, setOpen] = useState<number | null>(null);
  const toggle = (i: number) => setOpen(prev => (prev === i ? null : i));

  return (
    <section style={{ padding: "100px 48px", background: "#0f0f18" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div className="reveal" style={{ display: "flex", justifyContent: "center" }}><SectionLabel center>FAQ</SectionLabel></div>
          <h2 className="f-serif font-bold reveal d1" style={{ fontSize: "clamp(1.8rem,3vw,2.8rem)", letterSpacing: "-0.025em", color: "#f0ede6" }}>Questions?</h2>
        </div>
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} className="reveal" style={{ borderBottom: "1px solid rgba(240,240,230,0.06)" }}>
            <div className="faq-q flex items-center justify-between gap-6 f-sans"
                 onClick={() => toggle(i)}
                 style={{ padding: "24px 0", cursor: "none", fontSize: "0.98rem", fontWeight: 500, color: open === i ? "#f0a500" : "#f0ede6", userSelect: "none", transition: "color 0.2s" }}>
              {item.q}
              <div style={{ width: 22, height: 22, border: "1px solid rgba(240,240,230,0.09)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#f0a500", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem", transform: open === i ? "rotate(45deg)" : "rotate(0deg)", transition: "transform 0.25s" }}>
                +
              </div>
            </div>
            <div className={`faq-body f-sans ${open === i ? "open" : ""}`}
                 style={{ fontSize: "0.9rem", color: "#6b6878", lineHeight: 1.75, fontWeight: 300 }}>
              {item.a}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────
   CTA Banner
───────────────────────────────────────────── */
const CTABanner: FC = () => (
  <section style={{ padding: "100px 48px", background: "#09090e", textAlign: "center", position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 400, background: "radial-gradient(ellipse, rgba(240,165,0,0.06) 0%, transparent 65%)", pointerEvents: "none" }} />
    <h2 className="f-serif font-black reveal" style={{ fontSize: "clamp(2.4rem,5vw,4rem)", letterSpacing: "-0.025em", lineHeight: 1.05, color: "#f0ede6", marginBottom: 18, position: "relative" }}>
      Ready to ship your<br /><em style={{ fontStyle: "italic", color: "#f0a500" }}>first agent?</em>
    </h2>
    <p className="f-sans reveal d1" style={{ color: "#6b6878", fontSize: "1rem", marginBottom: 40, position: "relative", fontWeight: 300 }}>No scaffolding. No boilerplate. Just configure, connect, and deploy.</p>
    <div className="reveal d2 flex items-center justify-center gap-4" style={{ position: "relative" }}>
      <a href="#"
         className="f-mono text-sm tracking-wider"
         style={{ background: "#f0a500", color: "#09090e", padding: "14px 32px", borderRadius: 4, fontWeight: 500, textDecoration: "none", transition: "background 0.2s,transform 0.15s,box-shadow 0.2s", display: "inline-block" }}
         onMouseEnter={e => { e.currentTarget.style.background = "#ffc233"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(240,165,0,0.3)"; }}
         onMouseLeave={e => { e.currentTarget.style.background = "#f0a500"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
        Start free →
      </a>
      <a href="mailto:sales@claw.ai"
         className="f-mono text-sm tracking-wider"
         style={{ background: "transparent", color: "#f0ede6", padding: "14px 32px", borderRadius: 4, border: "1px solid rgba(240,240,230,0.09)", textDecoration: "none", transition: "border-color 0.2s,color 0.2s", display: "inline-block" }}
         onMouseEnter={e => { e.currentTarget.style.borderColor = "#f0a500"; e.currentTarget.style.color = "#f0a500"; }}
         onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(240,240,230,0.09)"; e.currentTarget.style.color = "#f0ede6"; }}>
        Talk to us
      </a>
    </div>
  </section>
);

/* ─────────────────────────────────────────────
   Footer
───────────────────────────────────────────── */
const FOOTER_LINKS: { label: string; href: string }[] = [
  { label: "Docs",    href: "#" },
  { label: "GitHub",  href: "#" },
  { label: "Status",  href: "#" },
  { label: "Privacy", href: "#" },
  { label: "Terms",   href: "#" },
];

const Footer: FC = () => (
  <footer style={{ padding: "44px 48px", borderTop: "1px solid rgba(240,240,230,0.06)", background: "#09090e", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <span className="f-serif font-black text-xl" style={{ color: "#f0ede6", letterSpacing: "-0.02em" }}>
      Claw<span style={{ color: "#f0a500" }}>.</span>
    </span>
    <ul style={{ display: "flex", gap: 28, listStyle: "none", margin: 0, padding: 0 }}>
      {FOOTER_LINKS.map(({ label, href }) => (
        <li key={label}>
          <a href={href} className="f-mono text-xs uppercase tracking-widest"
             style={{ color: "#6b6878", textDecoration: "none", transition: "color 0.2s" }}
             onMouseEnter={e => (e.currentTarget.style.color = "#f0a500")}
             onMouseLeave={e => (e.currentTarget.style.color = "#6b6878")}>
            {label}
          </a>
        </li>
      ))}
    </ul>
    <span className="f-mono text-xs" style={{ color: "#6b6878", letterSpacing: "0.04em" }}>© 2025 Claw. All rights reserved.</span>
  </footer>
);

/* ═══════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════ */
export default function ClawLanding(): JSX.Element {
  useReveal();

  return (
    <>
      <GlobalStyles />
      <Cursor />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <HowItWorks />
        <Features />
        <Integrations />
        <Pricing />
        <FAQ />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
