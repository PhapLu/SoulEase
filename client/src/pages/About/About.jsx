import { useState, useEffect } from "react";
import "./About.css";
import logo from "../../assets/logo.svg";

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
  {
    name: "Quoc Phap",
    img: "/images/phap.jpg",
    role: "Loremmmm mmmmmmmmm mmmmmmmmmmmm",
  },
  {
    name: "Gia Hy",
    img: "/images/hy.jpg",
    role: "Loremmmmmm mmmmmmmmmmm mmmmmmmm",
  },
  { name: "Minh Tuan", img: logo, role: "Loremmmmmm mmmmmmmmmmm mmmmmmmm" },
  {
    name: "Bao Tran",
    img: "/images/tran.jpg",
    role: "Loremmmmm mmmmmmmmmm mmmmmmmmmm",
  },
];

export default function About({
  interest = ["Clinicians", "Therapists", "Psychiatrists"],
}) {
  // Typing effect
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const TYPING_MS = 60;
  const DELETING_MS = 38;
  const HOLD_MS = 8000;
  const words = interest && interest.length ? interest : ["Clinicians"];
  const currentWord = words[wordIndex % words.length];
  const display = currentWord.slice(0, charIndex);

  useEffect(() => {
    let timer;
    if (!isDeleting) {
      if (charIndex < currentWord.length) {
        timer = setTimeout(() => setCharIndex((c) => c + 1), TYPING_MS);
      } else {
        timer = setTimeout(() => setIsDeleting(true), HOLD_MS);
      }
    } else {
      if (charIndex > 0) {
        timer = setTimeout(() => setCharIndex((c) => c - 1), DELETING_MS);
      } else {
        setIsDeleting(false);
        setWordIndex((i) => (i + 1) % words.length);
      }
    }
    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, wordIndex, currentWord.length]);
  return (
    <div className="about-page">
      {/* HERO -------------------------------------------------- */}
      <section className="about-hero " data-aos="fade-up">
        <div className="about-hero-inner">
          <p className="about-hero-eyebrow">SoulEase’s story</p>

          <h1 className="about-hero-title">
            SoulEase is an all-in-one workspace for
            <br />
            <span className="about-hero-highlight">{display}</span>
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
          By organizing clients into meaningful groups for easier dashboard and
          system management, SoulEase enables you to use your time more
          efficiently and significantly boost your overall productivity.
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
        className="about-section team"
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
              <img src={m.img} alt={m.name} className="about-team-avatar" />
              <p className="about-team-text">{m.role}</p>
              <p className="about-team-name">{m.name}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
