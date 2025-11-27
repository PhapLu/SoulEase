import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldHalved,
  faRobot,
  faLock,
  faCircleCheck,
  faUsers,
  faDiagramProject,
  faUserGroup,
  faBorderAll,
  faGear,
  faCommentDots,
  faChartColumn,
  faFileArrowUp,
  faFileLines,
  faChartSimple,
  faComments,
  faWaveSquare,
} from "@fortawesome/free-solid-svg-icons";
import "./LandingPage.css";

const featureCards = [
  {
    icon: faShieldHalved,
    title: "HIPAA-Ready",
    text: "Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsumLorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsumLorem ipsum Lorem ipsum",
  },
  {
    icon: faRobot,
    title: "Sora AI - Assistant",
    text: "Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsumLorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsumLorem ipsum Lorem ipsum",
  },
  {
    icon: faLock,
    title: "Secure & Encrypted",
    text: "Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsumLorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsumLorem ipsum Lorem ipsum",
  },
];

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

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState(0);
  const active = toolTabs[activeTab];

  return (
    <div className="landing-page">
      {/* HERO -------------------------------------------------- */}
      <section className="landing-hero" data-aos="fade-up">
        <div className="landing-hero__surface">
          <div className="landing-hero__badge">
            <span className="landing-hero__pill">New</span>
            <span className="landing-hero__badge-text">
              Set up new workspaces in just minutes!
            </span>
          </div>

          <h1 className="landing-hero__title">
            A Calmer, Smarter EHR for{" "}
            <span className="landing-hero__script">Mental Healthcare</span>
          </h1>

          <p className="landing-hero__subtitle">
            Track patients, manage therapy notes, Sora-AI assistant, strengthen
            communication - all in one gentle, user-friendly workspace
          </p>

          <div className="landing-hero__actions">
            <button className="landing-btn">
              Get Started
            </button>
          </div>
        </div>

        <div className="landing-hero__panel" data-aos="fade-up" data-aos-delay="120">
          <div className="landing-hero__panel-glow">
            <img src="" alt="" />
            </div>
        </div>
      </section>

      {/* WHY SOULEASE ----------------------------------------- */}
      <section className="landing-section" data-aos="fade-up" data-aos-delay="80">
        <div className="landing-section__header">
          <h2 className="landing-section__title">
            Why <span className="landing-highlight">SoulEase</span> ?
          </h2>
          <p className="landing-section__subtitle">
            Discover what makes SoulEase the best choice EHR platform for your
            workspace.
          </p>
        </div>

        <div className="landing-features">
          {featureCards.map((card) => (
            <article key={card.title} className="landing-feature-card">
              <div className="landing-feature-icon">
                <FontAwesomeIcon icon={card.icon} />
              </div>
              <h3 className="landing-feature-title">{card.title}</h3>
              <p className="landing-feature-text">{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* TOOLS ------------------------------------------------ */}
      <section className="landing-tools" data-aos="fade-up" data-aos-delay="120">
        <div className="landing-section__header">
          <h2 className="landing-section__title">
            Powerful tools <span className="landing-highlight">support</span>{" "}
            your <span className="landing-highlight">work</span>
          </h2>
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
                    icon={active.icons ? active.icons[idx] : faCircleCheck}
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
