import { useEffect, useState } from "react";
import Soulra from "../../assets/icons/Soulra.svg";

import "./Services.css";

const heroSlides = [
  {
    title: "Workspace",
    text: "Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsumLorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsumLorem ipsum Lorem ipsum",
    icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                height="32px"
                viewBox="0 -960 960 960"
                width="32px"
                fill="#0A8769"
            >
                <path d="M200-80q-50 0-85-35t-35-85q0-39 22.5-69.5T160-313v-334q-35-13-57.5-43.5T80-760q0-50 35-85t85-35q39 0 69.5 22.5T313-800h334q12-35 42.5-57.5T760-880q50 0 85 35t35 85q0 40-22.5 70.5T800-647v334q35 13 57.5 43.5T880-200q0 50-35 85t-85 35q-39 0-69.5-22.5T647-160H313q-13 35-43.5 57.5T200-80Zm0-640q17 0 28.5-11.5T240-760q0-17-11.5-28.5T200-800q-17 0-28.5 11.5T160-760q0 17 11.5 28.5T200-720Zm560 0q17 0 28.5-11.5T800-760q0-17-11.5-28.5T760-800q-17 0-28.5 11.5T720-760q0 17 11.5 28.5T760-720ZM313-240h334q9-26 28-45t45-28v-334q-26-9-45-28t-28-45H313q-9 26-28 45t-45 28v334q26 9 45 28t28 45Zm447 80q17 0 28.5-11.5T800-200q0-17-11.5-28.5T760-240q-17 0-28.5 11.5T720-200q0 17 11.5 28.5T760-160Zm-560 0q17 0 28.5-11.5T240-200q0-17-11.5-28.5T200-240q-17 0-28.5 11.5T160-200q0 17 11.5 28.5T200-160Zm0-600Zm560 0Zm0 560Zm-560 0Z" />
            </svg>
        ),
  },
  {
    title: "Soulra AI - Assistant",
    text: "Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsumLorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsumLorem ipsum Lorem ipsum",
    icon: (
                <img
                    src={Soulra}
                    alt="Soulra AI icon"
                    width={32}
                    height={32}
                    style={{ display: "block" }}
                />
            ),
  },
  {
    title: "Tracking",
    text: "Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsumLorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsumLorem ipsum Lorem ipsum",
    icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                height="32px"
                viewBox="0 -960 960 960"
                width="32px"
                fill="#0A8769"
            >
                <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880h40v331q18 11 29 28.5t11 40.5q0 33-23.5 56.5T480-400q-33 0-56.5-23.5T400-480q0-23 11-41t29-28v-86q-52 14-86 56.5T320-480q0 66 47 113t113 47q66 0 113-47t47-113q0-36-14.5-66.5T586-600l57-57q35 33 56 78.5t21 98.5q0 100-70 170t-170 70q-100 0-170-70t-70-170q0-90 57-156.5T440-717v-81q-119 15-199.5 105T160-480q0 134 93 227t227 93q134 0 227-93t93-227q0-69-27-129t-74-104l57-57q57 55 90.5 129.5T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z" />
            </svg>
        ),
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
        icon: (<svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#0A8769"
            >
                <path d="M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM360-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm400-160q0 66-47 113t-113 47q-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113ZM120-240h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T440-640q0-33-23.5-56.5T360-720q-33 0-56.5 23.5T280-640q0 33 23.5 56.5T360-560Zm0 320Zm0-400Z" />
            </svg>),
      },
      {
        title: "Dashboard",
        text: "Monitor the essentials at a glance with calm, readable metrics.",
        icon: (<svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#0A8769"
            >
                <path d="M520-600v-240h320v240H520ZM120-440v-400h320v400H120Zm400 320v-400h320v400H520Zm-400 0v-240h320v240H120Zm80-400h160v-240H200v240Zm400 320h160v-240H600v240Zm0-480h160v-80H600v80ZM200-200h160v-80H200v80Zm160-320Zm240-160Zm0 240ZM360-280Z" />
            </svg>),
      },
      {
        title: "Setting",
        text: "Fine-tune preferences, security, and visibility without friction.",
        icon: (<svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#0A8769"
            >
                <path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z" />
            </svg>),
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
        icon: (<svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#0A8769"
            >
                <path d="M320-600q17 0 28.5-11.5T360-640q0-17-11.5-28.5T320-680q-17 0-28.5 11.5T280-640q0 17 11.5 28.5T320-600Zm0 160q17 0 28.5-11.5T360-480q0-17-11.5-28.5T320-520q-17 0-28.5 11.5T280-480q0 17 11.5 28.5T320-440Zm0 160q17 0 28.5-11.5T360-320q0-17-11.5-28.5T320-360q-17 0-28.5 11.5T280-320q0 17 11.5 28.5T320-280ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h440l200 200v440q0 33-23.5 56.5T760-120H200Zm0-80h560v-400H600v-160H200v560Zm0-560v160-160 560-560Z" />
            </svg>),
      },
      {
        title: "Suggestive Agent",
        text: "Offer considerate next steps and care plans in a human tone.",
        icon: (<svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#0A8769"
            >
                <path d="M280-280h80v-200h-80v200Zm320 0h80v-400h-80v400Zm-160 0h80v-120h-80v120Zm0-200h80v-80h-80v80ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z" />
            </svg>),
      },
      {
        title: "General Chatbot",
        text: "A gentle helper that answers quick questions and keeps context.",
        icon: (<svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#0A8769"
            >
                <path d="M578-160q-17 0-28.5-11.5T538-200q0-17 11.5-28.5T578-240h113l-92-65q-14-10-16.5-25.5T589-360q9-14 25-16.5t30 6.5l93 64-39-106q-6-15 1-30t23-21q16-6 31 1t21 23l38 106 30-109q5-16 18.5-24.5T890-470q16 5 24.5 18.5T918-422l-70 262H578Zm-458 0v-600q0-33 23.5-56.5T200-840h480q33 0 56.5 23.5T760-760v203q-10-2-20-2.5t-20-.5q-10 0-20 .5t-20 2.5v-203H200v400h283q-2 10-2.5 20t-.5 20q0 10 .5 20t2.5 20H240L120-160Zm160-440h320v-80H280v80Zm0 160h200v-80H280v80Zm-80 80v-400 400Z" />
            </svg>),
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
        icon: (<svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#0A8769"
            >
                <path d="M240-400h320v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80ZM80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Zm126-240h594v-480H160v525l46-45Zm-46 0v-480 480Z" />
            </svg>),
      },
      {
        title: "Chart Visualization",
        text: "View trends clearly to make confident, data-informed decisions.",
        icon: (<svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#0A8769"
            >
                <path d="M640-160v-280h160v280H640Zm-240 0v-640h160v640H400Zm-240 0v-440h160v440H160Z" />
            </svg>),
      },
      {
        title: "Document Storage",
        text: "Keep every document protected and easy to retrieve when needed.",
        icon: (<svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#0A8769"
            >
                <path d="m720-120 160-160-56-56-64 64v-167h-80v167l-64-64-56 56 160 160ZM560 0v-80h320V0H560ZM240-160q-33 0-56.5-23.5T160-240v-560q0-33 23.5-56.5T240-880h280l240 240v121h-80v-81H480v-200H240v560h240v80H240Zm0-80v-560 560Z" />
            </svg>),
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
                  {activeCard.icon}
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
                        {card.icon}
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
