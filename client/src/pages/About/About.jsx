import { useState, useEffect } from "react";
import "./About.css";
import logo from "../../assets/logo.svg";
import { Link } from "react-router-dom";

const OMV = [
  {
    icon: (<svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#0C896B"><path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-80q-100 0-170-70t-70-170q0-100 70-170t170-70q100 0 170 70t70 170q0 100-70 170t-170 70Zm0-80q66 0 113-47t47-113q0-66-47-113t-113-47q-66 0-113 47t-47 113q0 66 47 113t113 47Zm0-80q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Z"/></svg>),
    title: "Objective",
    text: "The objective of SoulEase is to simplify electronic health record management by organizing patients, clinical data, and workflows into a clear and structured system",
  },
  {
    icon: (<svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#0C896B"><path d="m226-559 78 33q14-28 29-54t33-52l-56-11-84 84Zm142 83 114 113q42-16 90-49t90-75q70-70 109.5-155.5T806-800q-72-5-158 34.5T492-656q-42 42-75 90t-49 90Zm178-65q-23-23-23-56.5t23-56.5q23-23 57-23t57 23q23 23 23 56.5T660-541q-23 23-57 23t-57-23Zm19 321 84-84-11-56q-26 18-52 32.5T532-299l33 79Zm313-653q19 121-23.5 235.5T708-419l20 99q4 20-2 39t-20 33L538-80l-84-197-171-171-197-84 167-168q14-14 33.5-20t39.5-2l99 20q104-104 218-147t235-24ZM157-321q35-35 85.5-35.5T328-322q35 35 34.5 85.5T327-151q-25 25-83.5 43T82-76q14-103 32-161.5t43-83.5Zm57 56q-10 10-20 36.5T180-175q27-4 53.5-13.5T270-208q12-12 13-29t-11-29q-12-12-29-11.5T214-265Z"/></svg>),
    title: "Mission",
    text: "SoulEase’s mission is to support healthcare professionals with a digital workspace that combines secure data management and intelligent assistance.",
  },
  {
    icon: (<svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#0C896B"><path d="M600-800H360v280h240v-280Zm200 0H680v280h120v-280ZM575-440H320v240h222q21 0 40.5-7t35.5-21l166-137q-8-8-18-12t-21-6q-17-3-33 1t-30 15l-108 87H400v-80h146l44-36q5-3 7.5-8t2.5-11q0-10-7.5-17.5T575-440Zm-335 0h-80v280h80v-280Zm40 0v-360q0-33 23.5-56.5T360-880h440q33 0 56.5 23.5T880-800v280q0 33-23.5 56.5T800-440H280ZM240-80h-80q-33 0-56.5-23.5T80-160v-280q0-33 23.5-56.5T160-520h415q85 0 164 29t127 98l27 41-223 186q-27 23-60 34.5T542-120H309q-11 18-29 29t-40 11Z"/></svg>),
    title: "Value",
    text: "SoulEase delivers value by prioritizing patient privacy, system reliability, and ease of use.",
  },
];

const team = [
  {
    name: "Quoc Phap",
    img: "/images/phap.jpg",
    role: "Project Leader - Fullstack Developer",
  },
  {
    name: "Gia Hy",
    img: "/images/hy.jpg",
    role: "UI/UX Designer - Fullstack Developer ",
  },
  { name: "Minh Tuan", img: logo, role: "Fullstack Developer - Security Developer" },
  {
    name: "Bao Tran",
    img: "/images/tran.jpg",
    role: "Frontend Developer - Project Planner",
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

          <Link to ="/auth/signup" className="about-btn-primary">Discover more</Link>
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
              <div className="about-card-head">
                <span className="about-card-icon">{item.icon}</span>
                <h3 className="about-card-title">{item.title}</h3>
              </div>
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
