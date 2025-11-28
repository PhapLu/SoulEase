import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBorderAll,
  faChartColumn,
  faChartSimple,
  faComments,
  faDiagramProject,
  faFileArrowUp,
  faFileLines,
  faGear,
  faLock,
  faMagnifyingGlassChart,
  faMessage,
  faRobot,
  faShieldHalved,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import "./Services.css";

const heroSlides = [
  {
    title: "HIPAA-Ready",
    text: "Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsumLorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsumLorem ipsum Lorem ipsum",
    icon: faShieldHalved,
  },
  {
    title: "Soulra AI - Assistant",
    text: "Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsumLorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsumLorem ipsum Lorem ipsum",
    icon: faRobot,
  },
  {
    title: "Secure & Encrypted",
    text: "Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsumLorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsumLorem ipsum Lorem ipsum",
    icon: faLock,
  },
];

const serviceSections = [
  {
    id: "workspace",
    title: "Streamline workspace",
    blurb:
      "By organizing clients into meaningful groups for easier dashboard and system management, SoulEase enables you to use your time more efficiently and significantly boost your overall productivity.",
    cards: [
      {
        title: "Grouping clients",
        text: "Keep every profile neatly organized to reduce context switching and confusion.",
        icon: faUserGroup,
      },
      {
        title: "Dashboard",
        text: "Monitor the essentials at a glance with calm, readable metrics.",
        icon: faBorderAll,
      },
      {
        title: "Setting",
        text: "Fine-tune preferences, security, and visibility without friction.",
        icon: faGear,
      },
    ],
  },
  {
    id: "assistant",
    title: "Assistant clients care",
    blurb:
      "SoulEase keeps every interaction thoughtful. Summaries, suggestions, and chatbot support help you respond faster and stay empathetic.",
    cards: [
      {
        title: "Summarize Agent",
        text: "Capture key moments after sessions so nothing meaningful is lost.",
        icon: faFileLines,
      },
      {
        title: "Suggestive Agent",
        text: "Offer considerate next steps and care plans in a human tone.",
        icon: faChartSimple,
      },
      {
        title: "General Chatbot",
        text: "A gentle helper that answers quick questions and keeps context.",
        icon: faComments,
      },
    ],
  },
  {
    id: "tracking",
    title: "Track clients' health",
    blurb:
      "Stay on top of client well-being with real-time messaging, visualized progress, and secure storage.",
    cards: [
      {
        title: "Real-time Message",
        text: "Maintain safe, timely conversations that reassure your clients.",
        icon: faMessage,
      },
      {
        title: "Chart Visualization",
        text: "View trends clearly to make confident, data-informed decisions.",
        icon: faChartColumn,
      },
      {
        title: "Document Storage",
        text: "Keep every document protected and easy to retrieve when needed.",
        icon: faFileArrowUp,
      },
    ],
  },
];

export default function Services() {
  const [activeHero, setActiveHero] = useState(0);
  const activeCard = heroSlides[activeHero];

  useEffect(() => {
    const id = setInterval(() => {
      setActiveHero((prev) => (prev + 1) % heroSlides.length);
    }, 3000);
    return () => clearInterval(id);
  }, [activeHero]);

  return (
    <div className="services-page">
      <section className="services-hero" data-aos="fade-up">
        <div className="services-hero__grid">
          <div className="services-hero__content">
            <h1>Powerful tools support your work</h1>
            <p className="services-hero__subtitle">
              Enhance the quality of your work with a modern, intelligent toolkit
              designed to optimize your time, boost productivity, and help you
              deliver results with greater efficiency and confidence.
            </p>
          </div>

          <div className="services-hero__panel">
            <div className="services-hero__cards">
              <article className="services-hero__card is-active">
                <div className="services-hero__icon">
                  <FontAwesomeIcon icon={activeCard.icon} />
                </div>
                <h3>{activeCard.title}</h3>
                <p>{activeCard.text}</p>
              </article>
            </div>

            <div className="services-hero__dots" aria-label="Hero highlights">
              {heroSlides.map((_, index) => (
                <button
                  type="button"
                  key={index}
                  className={activeHero === index ? "is-active" : ""}
                  onClick={() => setActiveHero(index)}
                  aria-pressed={activeHero === index}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {serviceSections.map((section) => (
        <section
          key={section.id}
          className="services-section"
          data-aos="fade-up"
          data-aos-offset="80"
        >
          <div className="services-section__top">
            <div className="services-section__intro">
              <h2>{section.title}</h2>
              <p className="services-section__blurb">{section.blurb}</p>
            </div>
            <div className="services-section__visual" aria-hidden="true">
            </div>
          </div>

          <div className="services-card-grid">
            {section.cards.map((card) => (
              <article key={card.title} className="services-card">
                <div className="services-card__header">
                    <div className="services-card__icon">
                        <FontAwesomeIcon icon={card.icon} />
                    </div>
                    <h3>{card.title}</h3>
                </div>
                <div className="services-card__meta">
                  <p>{card.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
