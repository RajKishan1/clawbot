"use client"
import { FC, ReactNode, useState } from "react";
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
const Tick: FC<{ yes: boolean }> = ({ yes }) => (
  <span
    className="f-mono text-xs"
    style={{ color: yes ? "#f0a500" : "#2e2c3a", flexShrink: 0, marginTop: 2 }}
  >
    {yes ? "✓" : "—"}
  </span>
);
const PLANS: Plan[] = [
  {
    name: "Hobby",
    desc: "For indie devs and side projects. Everything you need to get your first agent live.",
    monthlyPrice: 0,
    annualPrice: 0,
    annualNote: "Free forever",
    ctaLabel: "Get started free",
    ctaVariant: "outline",
    features: [
      {
        text: (
          <>
            <strong style={{ color: "#f0ede6" }}>2 agents</strong>
          </>
        ),
        included: true,
      },
      {
        text: (
          <>
            <strong style={{ color: "#f0ede6" }}>1 Telegram channel</strong> per
            agent
          </>
        ),
        included: true,
      },
      {
        text: (
          <>
            <strong style={{ color: "#f0ede6" }}>500 runs</strong> / month
          </>
        ),
        included: true,
      },
      { text: "Async worker execution", included: true },
      { text: "Conversation history", included: true },
      { text: "Basic observability", included: true },
      { text: "Tool execution", included: false },
      { text: "Long-term memory", included: false },
      { text: "Scheduling", included: false },
    ],
  },
  {
    name: "Pro",
    desc: "For teams shipping real products. Full tool access, memory, and scheduling.",
    monthlyPrice: 49,
    annualPrice: 39,
    annualNote: "Billed annually — $468/yr",
    badge: "Most Popular",
    featured: true,
    ctaLabel: "Start Pro →",
    ctaVariant: "amber",
    features: [
      {
        text: (
          <>
            <strong style={{ color: "#f0ede6" }}>Unlimited agents</strong>
          </>
        ),
        included: true,
      },
      {
        text: (
          <>
            <strong style={{ color: "#f0ede6" }}>Unlimited channels</strong>
          </>
        ),
        included: true,
      },
      {
        text: (
          <>
            <strong style={{ color: "#f0ede6" }}>10,000 runs</strong> / month
          </>
        ),
        included: true,
      },
      { text: "Shell + browser tools (sandboxed)", included: true },
      { text: "Long-term memory + pgvector", included: true },
      { text: "Cron scheduling + calendar triggers", included: true },
      { text: "SSE real-time streaming", included: true },
      { text: "RunStep logging + audit trail", included: true },
      { text: "Priority queue", included: true },
    ],
  },
  {
    name: "Enterprise",
    desc: "For orgs that need compliance, SSO, custom SLAs, and dedicated infrastructure.",
    monthlyPrice: "Custom",
    annualPrice: "Custom",
    annualNote: "Talk to us",
    ctaLabel: "Contact sales",
    ctaVariant: "outline",
    features: [
      { text: "Everything in Pro", included: true },
      {
        text: (
          <>
            <strong style={{ color: "#f0ede6" }}>Unlimited runs</strong>
          </>
        ),
        included: true,
      },
      { text: "Dedicated Worker cluster", included: true },
      { text: "BYOK (vaulted API keys)", included: true },
      { text: "SSO / SAML", included: true },
      { text: "Multi-tenant org management", included: true },
      { text: "Custom sandbox policy", included: true },
      { text: "SLA + dedicated support", included: true },
      { text: "On-prem deployment option", included: true },
    ],
  },
];
const PlanCard: FC<{ plan: Plan; annual: boolean }> = ({ plan, annual }) => {
  const price = annual ? plan.annualPrice : plan.monthlyPrice;
  const isNumeric = typeof price === "number";

  const ctaStyle: React.CSSProperties =
    plan.ctaVariant === "amber"
      ? { background: "#f0a500", color: "#09090e", borderColor: "#f0a500" }
      : {
          background: "transparent",
          color: "#f0ede6",
          borderColor: "rgba(240,240,230,0.09)",
        };

  return (
    <div
      className={plan.featured ? "plan-featured" : ""}
      style={{
        background: plan.featured ? "#14141f" : "#0f0f18",
        padding: "48px 40px",
        position: "relative",
      }}
    >
      {plan.badge && (
        <div
          className="f-mono text-xs uppercase tracking-widest"
          style={{
            display: "inline-block",
            background: "rgba(240,165,0,0.12)",
            border: "1px solid rgba(240,165,0,0.2)",
            color: "#f0a500",
            padding: "4px 14px",
            borderRadius: 100,
            marginBottom: 24,
            letterSpacing: "0.08em",
          }}
        >
          {plan.badge}
        </div>
      )}
      <div
        className="f-serif font-bold"
        style={{ fontSize: "1.4rem", color: "#f0ede6", marginBottom: 8 }}
      >
        {plan.name}
      </div>
      <div
        className="f-sans"
        style={{
          fontSize: "0.88rem",
          color: "#6b6878",
          lineHeight: 1.65,
          marginBottom: 28,
          minHeight: 56,
          fontWeight: 300,
        }}
      >
        {plan.desc}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 6,
          marginBottom: 6,
        }}
      >
        {isNumeric && (
          <span
            className="f-mono"
            style={{ fontSize: "1rem", color: "#6b6878", marginBottom: 8 }}
          >
            $
          </span>
        )}
        <span
          className="f-serif font-black"
          style={{
            fontSize: isNumeric ? "3.2rem" : "2rem",
            lineHeight: 1,
            color: "#f0ede6",
          }}
        >
          {price}
        </span>
        {isNumeric && (
          <span
            className="f-mono text-xs"
            style={{ color: "#6b6878", marginBottom: 10 }}
          >
            /&nbsp;mo
          </span>
        )}
      </div>
      <div
        className="f-mono text-xs"
        style={{ color: "#6b6878", marginBottom: 28, letterSpacing: "0.04em" }}
      >
        {annual && plan.annualNote
          ? plan.annualNote
          : !annual && isNumeric && price === 0
            ? "Free forever"
            : plan.annualNote}
      </div>

      <div
        style={{
          height: 1,
          background: "rgba(240,240,230,0.06)",
          margin: "0 0 28px",
        }}
      />

      <ul
        style={{
          listStyle: "none",
          margin: "0 0 36px",
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {plan.features.map((f, i) => (
          <li
            key={i}
            style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
          >
            <Tick yes={f.included} />
            <span
              className="f-sans"
              style={{
                fontSize: "0.88rem",
                color: f.included ? "#6b6878" : "#3a3847",
                lineHeight: 1.5,
                fontWeight: 300,
              }}
            >
              {f.text}
            </span>
          </li>
        ))}
      </ul>

      <a
        href={
          plan.ctaVariant === "outline" && plan.name === "Enterprise"
            ? "mailto:sales@claw.ai"
            : "#"
        }
        className="f-mono text-xs tracking-wider"
        style={{
          display: "block",
          textAlign: "center",
          padding: "13px 24px",
          borderRadius: 4,
          fontWeight: 500,
          textDecoration: "none",
          border: "1px solid",
          transition: "all 0.2s",
          letterSpacing: "0.04em",
          ...ctaStyle,
        }}
        onMouseEnter={(e) => {
          if (plan.ctaVariant === "amber") {
            e.currentTarget.style.background = "#ffc233";
            e.currentTarget.style.boxShadow = "0 8px 32px rgba(240,165,0,0.25)";
          } else {
            e.currentTarget.style.borderColor = "#f0a500";
            e.currentTarget.style.color = "#f0a500";
          }
        }}
        onMouseLeave={(e) => {
          if (plan.ctaVariant === "amber") {
            e.currentTarget.style.background = "#f0a500";
            e.currentTarget.style.boxShadow = "none";
          } else {
            e.currentTarget.style.borderColor = "rgba(240,240,230,0.09)";
            e.currentTarget.style.color = "#f0ede6";
          }
        }}
      >
        {plan.ctaLabel}
      </a>
    </div>
  );
};
const COMPARE_ROWS: CompareRow[] = [
  { label: "Core", hobby: "", pro: "", enterprise: "", category: true },
  { label: "Agents", hobby: "2", pro: "Unlimited", enterprise: "Unlimited" },
  {
    label: "Channels per agent",
    hobby: "1",
    pro: "Unlimited",
    enterprise: "Unlimited",
  },
  {
    label: "Runs / month",
    hobby: "500",
    pro: "10,000",
    enterprise: "Unlimited",
  },
  {
    label: "LLM providers",
    hobby: "All 3",
    pro: "All 3",
    enterprise: "All 3 + custom",
  },
  {
    label: "Tools & Execution",
    hobby: "",
    pro: "",
    enterprise: "",
    category: true,
  },
  {
    label: "Async Worker execution",
    hobby: <Tick yes />,
    pro: <Tick yes />,
    enterprise: <Tick yes />,
  },
  {
    label: "Shell tool (sandboxed)",
    hobby: <Tick yes={false} />,
    pro: <Tick yes />,
    enterprise: <Tick yes />,
  },
  {
    label: "Browser automation",
    hobby: <Tick yes={false} />,
    pro: <Tick yes />,
    enterprise: <Tick yes />,
  },
  {
    label: "Custom sandbox policy",
    hobby: <Tick yes={false} />,
    pro: <Tick yes={false} />,
    enterprise: <Tick yes />,
  },
  {
    label: "Memory & Scheduling",
    hobby: "",
    pro: "",
    enterprise: "",
    category: true,
  },
  {
    label: "Conversation history",
    hobby: <Tick yes />,
    pro: <Tick yes />,
    enterprise: <Tick yes />,
  },
  {
    label: "Long-term memory",
    hobby: <Tick yes={false} />,
    pro: <Tick yes />,
    enterprise: <Tick yes />,
  },
  {
    label: "Cron scheduling",
    hobby: <Tick yes={false} />,
    pro: <Tick yes />,
    enterprise: <Tick yes />,
  },
  {
    label: "Calendar triggers",
    hobby: <Tick yes={false} />,
    pro: <Tick yes />,
    enterprise: <Tick yes />,
  },
  {
    label: "Observability",
    hobby: "",
    pro: "",
    enterprise: "",
    category: true,
  },
  {
    label: "Run step logging",
    hobby: "Basic",
    pro: "Full",
    enterprise: "Full + export",
  },
  {
    label: "SSE streaming",
    hobby: <Tick yes={false} />,
    pro: <Tick yes />,
    enterprise: <Tick yes />,
  },
  {
    label: "Audit trail",
    hobby: <Tick yes={false} />,
    pro: <Tick yes />,
    enterprise: <Tick yes />,
  },
  { label: "Security", hobby: "", pro: "", enterprise: "", category: true },
  {
    label: "Per-agent permission flags",
    hobby: <Tick yes />,
    pro: <Tick yes />,
    enterprise: <Tick yes />,
  },
  {
    label: "SSO / SAML",
    hobby: <Tick yes={false} />,
    pro: <Tick yes={false} />,
    enterprise: <Tick yes />,
  },
  {
    label: "BYOK (vaulted)",
    hobby: <Tick yes={false} />,
    pro: <Tick yes={false} />,
    enterprise: <Tick yes />,
  },
  {
    label: "On-prem deployment",
    hobby: <Tick yes={false} />,
    pro: <Tick yes={false} />,
    enterprise: <Tick yes />,
  },
];
const SectionLabel: FC<{ children: string; center?: boolean }> = ({
  children,
  center,
}) => (
  <p
    className={`f-mono text-xs tracking-widest uppercase mb-5 flex items-center gap-3 ${center ? "justify-center" : ""}`}
    style={{ color: "#f0a500" }}
  >
    {center && (
      <span
        style={{
          display: "block",
          width: 32,
          height: 1,
          background: "#b07400",
        }}
      />
    )}
    {children}
    {!center && (
      <span
        style={{
          display: "block",
          width: 32,
          height: 1,
          background: "#b07400",
        }}
      />
    )}
  </p>
);
const Pricing: FC = () => {
  const [annual, setAnnual] = useState<boolean>(false);
  const th: React.CSSProperties = {
    padding: "18px 24px",
    fontFamily: "'JetBrains Mono',monospace",
    fontSize: "0.72rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#6b6878",
    textAlign: "center",
    borderBottom: "1px solid rgba(240,240,230,0.06)",
    fontWeight: 400,
  };

  return (
    <section
      id="pricing"
      style={{
        padding: "120px 48px",
        background: "#09090e",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: 900,
          height: 600,
          background:
            "radial-gradient(ellipse, rgba(240,165,0,0.04) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <div
            className="reveal"
            style={{ display: "flex", justifyContent: "center" }}
          >
            <SectionLabel center>Pricing</SectionLabel>
          </div>
          <h2
            className="f-serif font-bold reveal d1"
            style={{
              fontSize: "clamp(2rem,4vw,3.4rem)",
              letterSpacing: "-0.025em",
              color: "#f0ede6",
              marginBottom: 12,
            }}
          >
            Simple, honest pricing.
          </h2>
          <p
            className="f-sans reveal d2"
            style={{
              color: "#6b6878",
              fontSize: "0.98rem",
              lineHeight: 1.7,
              marginBottom: 28,
              fontWeight: 300,
            }}
          >
            Start free. Scale when you're ready. No hidden fees — you bring your
            own LLM API keys.
          </p>

          {/* Toggle */}
          <div
            className="reveal d3 flex items-center justify-center gap-3 f-mono text-xs"
            style={{ color: "#6b6878" }}
          >
            <span>Monthly</span>
            <div
              className="toggle-sw"
              onClick={() => setAnnual((v) => !v)}
              style={{
                width: 44,
                height: 22,
                background: annual ? "#f0a500" : "#14141f",
                border: `1px solid ${annual ? "#f0a500" : "rgba(240,240,230,0.09)"}`,
                borderRadius: 100,
                position: "relative",
                cursor: "none",
                transition: "background 0.2s,border-color 0.2s",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 3,
                  left: annual ? 23 : 3,
                  width: 14,
                  height: 14,
                  background: "#f0ede6",
                  borderRadius: "50%",
                  transition: "left 0.2s",
                }}
              />
            </div>
            <span style={{ color: annual ? "#f0ede6" : "#6b6878" }}>
              Annual
            </span>
            <span
              className="f-mono text-xs"
              style={{
                background: "rgba(240,165,0,0.12)",
                border: "1px solid rgba(240,165,0,0.2)",
                color: "#f0a500",
                padding: "3px 12px",
                borderRadius: 100,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Save 20%
            </span>
          </div>
        </div>

        {/* Plans */}
        <div
          className="reveal"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 1,
            background: "rgba(240,240,230,0.06)",
            border: "1px solid rgba(240,240,230,0.06)",
            marginBottom: 28,
          }}
        >
          {PLANS.map((p) => (
            <PlanCard key={p.name} plan={p} annual={annual} />
          ))}
        </div>

        <p
          className="reveal f-mono text-xs"
          style={{
            textAlign: "center",
            color: "#6b6878",
            letterSpacing: "0.04em",
          }}
        >
          LLM costs billed directly by provider. Claw charges platform usage
          only. Overage: $0.004/run on Pro.
        </p>

        {/* Compare table */}
        <div style={{ marginTop: 80 }}>
          <h3
            className="f-serif font-bold reveal"
            style={{
              fontSize: "1.8rem",
              color: "#f0ede6",
              textAlign: "center",
              marginBottom: 40,
            }}
          >
            Compare plans
          </h3>
          <div className="reveal d1" style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                border: "1px solid rgba(240,240,230,0.06)",
              }}
            >
              <thead>
                <tr style={{ background: "#14141f" }}>
                  <th style={{ ...th, textAlign: "left", color: "#f0ede6" }}>
                    Feature
                  </th>
                  <th style={th}>Hobby</th>
                  <th style={{ ...th, color: "#f0a500" }}>Pro</th>
                  <th style={th}>Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row, i) =>
                  row.category ? (
                    <tr key={i}>
                      <td
                        colSpan={4}
                        className="f-mono text-xs uppercase tracking-widest"
                        style={{
                          background: "#0f0f18",
                          padding: "12px 24px",
                          color: "#f0a500",
                          letterSpacing: "0.1em",
                        }}
                      >
                        {row.label}
                      </td>
                    </tr>
                  ) : (
                    <tr key={i} className="compare-row">
                      {(
                        [
                          row.label,
                          row.hobby,
                          row.pro,
                          row.enterprise,
                        ] as ReactNode[]
                      ).map((cell, ci) => (
                        <td
                          key={ci}
                          className="f-sans"
                          style={{
                            padding: "15px 24px",
                            fontSize: "0.88rem",
                            color: ci === 0 ? "#f0ede6" : "#6b6878",
                            textAlign: ci === 0 ? "left" : "center",
                            borderBottom: "1px solid rgba(240,240,230,0.06)",
                            fontWeight: 300,
                          }}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Pricing;
