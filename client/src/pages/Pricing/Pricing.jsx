import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldHalved,
  faRobot,
  faLock,
  faUserGroup,
  faBorderAll,
  faGear,
  faFileLines,
  faChartSimple,
  faComments,
  faCommentDots,
  faChartColumn,
  faFileArrowUp,
  faDiagramProject,
  faUsers,
  faWaveSquare,
  faUserDoctor,
  faDatabase,
  faBoxArchive,
} from "@fortawesome/free-solid-svg-icons";
import "./Pricing.css";

const toolTabs = [
  {
    label: "Streamline workspace",
    heading: "Streamline workspace",
    blurb:
      "From grouping clients' types to managing dashboards or systems, SoulEase helps you focus time where it matters most.",
    checklist: ["Clients", "Dashboard", "System"],
    icons: [faUserGroup, faBorderAll, faGear],
    cardTitle: "Workspace",
    cardText:
      "Organize every team, client, and workflow within a single, beautifully simple dashboard built for mental health work.",
    cardIcon: faDiagramProject,
    cardMeta: "Collaboration-ready",
    cardMetaIcon: faUsers,
  },
  {
    label: "Assistant clients care",
    heading: "Assistant clients care",
    blurb: "Tools that help you respond faster, summarize sessions, and guide next steps with clarity.",
    checklist: ["Summarize Agent", "Suggestive Agent", "General Chatbot"],
    icons: [faFileLines, faChartSimple, faComments],
    cardTitle: "Soulra AI - Assistant",
    cardText:
      "Draft, summarize, and suggest care actions while keeping your tone warm and human.",
    cardIcon: faRobot,
    cardMeta: "AI-powered",
    cardMetaIcon: faWaveSquare,
  },
  {
    label: "Track clients' health",
    heading: "Track clients' health",
    blurb: "Keep a close pulse on well-being with messaging, charts, and secure documents.",
    checklist: ["Real-time Message", "Chart visualization", "Document storage"],
    icons: [faCommentDots, faChartColumn, faFileArrowUp],
    cardTitle: "Tracking",
    cardText:
      "Monitor progress, share updates, and keep every file safe in one calm space.",
    cardIcon: faShieldHalved,
    cardMeta: "Private & secure",
    cardMetaIcon: faLock,
  },
];

const plans = [
  {
    name: "Individual",
    price: "$149",
    cadence: "/month",
    note: "Billed monthly, cancel anytime",
    features: [
      { accent: "5", text: "doctor accounts", icon: faUserDoctor },
      { accent: "2k", text: "patient records", icon: faDatabase },
      { accent: "5GB", text: "storage per account", icon: faBoxArchive },
    ],
  },
  {
    name: "Organization",
    price: "$990",
    cadence: "/month",
    note: "Billed monthly, cancel anytime",
    features: [
      { accent: "50", text: "doctor accounts", icon: faUserDoctor },
      { accent: "20k", text: "patient records", icon: faDatabase },
      { accent: "25GB", text: "storage per account", icon: faBoxArchive },
    ],
  },
  {
    name: "Enterprise",
    price: "$2000",
    cadence: "/month",
    note: "Billed monthly, cancel anytime",
    features: [
      { accent: "unlimited", text: "doctor accounts", icon: faUserDoctor },
      { accent: "unlimited", text: "patient records", icon: faDatabase },
      { accent: "unlimited", text: "storage per account", icon: faBoxArchive },
    ],
  },
  {
    name: "Solo Practice",
    price: "$39",
    cadence: "/month",
    note: "Billed monthly, cancel anytime",
    fullWidth: true,
    features: [
      { accent: "unlimited", text: "doctor accounts", icon: faUserDoctor },
      { accent: "unlimited", text: "patient records", icon: faDatabase },
      { accent: "unlimited", text: "storage per account", icon: faBoxArchive },
    ],
  },
];

export default function Pricing() {
  const [activeTab, setActiveTab] = useState(0);
  const active = toolTabs[activeTab];

  return (
    <div className="pricing-page">
      <section className="pricing-hero" data-aos="fade-up">
        <div className="pricing-hero__text">
          <h1>Simple Price for Simple Use</h1>
          <p className="pricing-hero__subtitle">
            Get started for free during our early bird stage. All core features are
            included—no credit card required.
          </p>
        </div>

        <div className="pricing-card-grid">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`pricing-card ${plan.fullWidth ? "is-full" : ""} ${
                plan.name === "Solo Practice" ? "pricing-card--center" : ""
              }`}
            >
              <div className="pricing-card__header">
                <h3>{plan.name}</h3>
              </div>
              <div className="pricing-card__price">
                <span className="pricing-card__amount">{plan.price}</span>
                <span className="pricing-card__cadence">{plan.cadence}</span>
              </div>
              <p className="pricing-card__note">{plan.note}</p>
              <button className="pricing-card__cta" type="button">
                Start free trial
              </button>
              <div className="pricing-card__features-title">All our features with:</div>
              <ul className="pricing-card__list">
                {plan.features.map((item) => (
                  <li key={`${plan.name}-${item.accent}-${item.text}`}>
                    <FontAwesomeIcon icon={item.icon || faDiagramProject} />
                    <span>
                      <span className="pricing-highlight">{item.accent}</span>{" "}
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-tools pricing-features" data-aos="fade-up" data-aos-delay="120">
        <div className="landing-section__header">
          <h2 className="landing-section__title">Our features included in every plan</h2>
        </div>

        <div className="landing-tablist" role="tablist" aria-label="Tool highlights">
          {toolTabs.map((tab, index) => (
            <button
              key={tab.label}
              className={`landing-tab ${index === activeTab ? "is-active" : ""}`}
              type="button"
              aria-pressed={index === activeTab}
              onClick={() => setActiveTab(index)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="landing-tools__grid">
          <div className="landing-tools__content landing-tools__pane" key={`content-${active.label}`}>
            <h3>{active.heading}</h3>
            <p>{active.blurb}</p>

            <ul className="landing-list">
              {active.checklist.map((item, idx) => (
                <li key={item}>
                  <FontAwesomeIcon
                    icon={active.icons ? active.icons[idx] : faDiagramProject}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <button className="landing-btn landing-btn--primary">Explore all services</button>
          </div>

          <div className="landing-feature-card landing-tools__card landing-tools__pane" key={`card-${active.label}`}>
            <div className="landing-tools__card-icon">
              <FontAwesomeIcon icon={active.cardIcon} />
            </div>
            <h3 className="landing-feature-title">{active.cardTitle}</h3>
            <p className="landing-feature-text">{active.cardText}</p>
            <div className="landing-tools__meta">
              <FontAwesomeIcon icon={active.cardMetaIcon ?? faUsers} />
              <span>{active.cardMeta ?? "Collaboration-ready"}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
