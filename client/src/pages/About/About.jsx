// import React from "react";
import "./About.css";

const OMV = [
  {
    title: "Objective",
    text: "Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum.",
  },
  {
    title: "Mission",
    text: "Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum.",
  },
  {
    title: "Value",
    text: "Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum.",
  },
];

const team = [
  { name: "Quoc Phap" },
  { name: "Gia Hy" },
  { name: "Minh Tuan" },
  { name: "Bao Tran" },
];

export default function About() {
  return (
    <div className="about-page">
      {/* HERO -------------------------------------------------- */}
      <section className="about-hero" data-aos="fade-up">
        <div className="about-hero-inner">
          <p className="about-hero-eyebrow">SoulEase’s story</p>

          <h1 className="about-hero-title">
            SoulEase is an all-in-one workspace for
            <br />
            <span className="about-hero-highlight">
              clinicians / therapists / psychiatrists
            </span>
          </h1>

          <p className="about-hero-description">
            SoulEase focuses on mental-health needs by improving communication
            and capturing daily-life insights. Our integrated tools help your
            business thrive while caring for others.
          </p>

          <button className="about-btn-primary">Discover more</button>
        </div>
      </section>

      {/* OBJECTIVE - MISSION - VALUE --------------------------- */}
      <section
        className="about-section"
        data-aos="fade-up"
        data-aos-delay="150"
      >
        <h2 className="about-section-title">Objective - Mission - Value</h2>
        <p className="about-section-subtitle">
          By organizing clinicians’ knowledge, we support personalized care and
          meaningful insights for mental-health improvement.
        </p>

        <div className="about-card-grid">
          {OMV.map((item) => (
            <div key={item.title} className="about-card">
              <h3 className="about-card-title">{item.title}</h3>
              <p className="about-card-text">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* OUR TEAM ---------------------------------------------- */}
      <section
        className="about-section"
        data-aos="fade-up"
        data-aos-delay="250"
      >
        <h2 className="about-section-title">Our Team</h2>
        <p className="about-section-subtitle">
          Meet the people behind SoulEase — blending psychology, design and
          technology to create meaningful tools.
        </p>

        <div className="about-team-grid">
          {team.map((m) => (
            <div key={m.name} className="about-team-card">
              <div className="about-team-avatar" />
              <p className="about-team-name">{m.name}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
