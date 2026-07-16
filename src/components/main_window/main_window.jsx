import "./main_window.scss";
import { useRef, useState } from "react";
import listStack from "./../../ressources/listStack.json";
import educationList from "./../../ressources/listEducation.json";
import experienceList from "./../../ressources/listExperiences.json";
import obs from "./../../assets/logosEntreprises/obs.png";
import bytel from "./../../assets/logosEntreprises/bytel.png";
import cf from "./../../assets/logosEntreprises/cf.png";
import ff from "./../../assets/logosEntreprises/ff.png";
import mdc from "./../../assets/logosEntreprises/mdc.png";
import leonis from "./../../assets/logosEntreprises/leonis.png";
import demo from "./../../assets/demo.png";
import adobecc from "./../../assets/iconesStack/adobecc.webp";
import angular from "./../../assets/iconesStack/angular.webp";
import ansible from "./../../assets/iconesStack/ansible.webp";
import c from "./../../assets/iconesStack/c.webp";
import django from "./../../assets/iconesStack/django.webp";
import docker from "./../../assets/iconesStack/docker.webp";
import express from "./../../assets/iconesStack/express.webp";
import figma from "./../../assets/iconesStack/figma.webp";
import finder from "./../../assets/iconesStack/finder.webp";
import git from "./../../assets/iconesStack/git.webp";
import gsuite from "./../../assets/iconesStack/gsuite.webp";
import javascript from "./../../assets/iconesStack/javascript.webp";
import jira from "./../../assets/iconesStack/jira.webp";
import mongo from "./../../assets/iconesStack/mongo.webp";
import nest from "./../../assets/iconesStack/nest.webp";
import notion from "./../../assets/iconesStack/notion.webp";
import office from "./../../assets/iconesStack/office.webp";
import php from "./../../assets/iconesStack/php.webp";
import python from "./../../assets/iconesStack/python.webp";
import react from "./../../assets/iconesStack/react.webp";
import sonarqube from "./../../assets/iconesStack/sonarqube.webp";
import sql from "./../../assets/iconesStack/sql.webp";
import tux from "./../../assets/iconesStack/tux.webp";
import typescript from "./../../assets/iconesStack/typescript.webp";
import vite from "./../../assets/iconesStack/vite.webp";
import next from "./../../assets/iconesStack/next.svg";
import tailwind from "./../../assets/iconesStack/tailwind.png";
import windows from "./../../assets/iconesStack/windows.webp";
import { downloadCv } from "../../utils/downloadCv";

// Icônes importées de la stack : les entrées absentes retombent sur
// element.logo (URL CDN) définie dans listStack.json.
const stackIcons = {
  adobecc,
  angular,
  ansible,
  c,
  django,
  docker,
  express,
  figma,
  finder,
  git,
  gsuite,
  javascript,
  jira,
  mongo,
  nest,
  next,
  notion,
  office,
  php,
  python,
  react,
  sonarqube,
  sql,
  tailwind,
  tux,
  typescript,
  vite,
  windows,
};

const companyLogos = { obs, bytel, cf, ff, mdc, leonis };
const LINKEDIN_URL =
  "https://www.linkedin.com/in/milo-roche-vandenbroucque/";

const NAVIGATION_ITEMS = [
  { id: "perso", label: "Profil", number: "01" },
  { id: "stack", label: "Stack", number: "02" },
  { id: "pro", label: "Expériences", number: "03" },
  { id: "education", label: "Formation", number: "04" },
];

function MessageIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M16.5 3.5h-13A2.5 2.5 0 0 0 1 6v6a2.5 2.5 0 0 0 2.5 2.5H6l4 3 4-3h2.5A2.5 2.5 0 0 0 19 12V6a2.5 2.5 0 0 0-2.5-2.5Z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 2v10m-4-4 4 4 4-4M3 15v2h14v-2" />
    </svg>
  );
}

function StackSection({ title, items }) {
  return (
    <div>
      <h3>{title}</h3>
      <div className="iconesStack">
        {items.map((element, index) => (
          <div
            key={element.nom}
            style={{
              textAlign: "center",
              animationDelay: `${index * 0.08}s`,
            }}
            title={element.description}
            className="fade-in-from-top"
          >
            <img
              className={element.image === "github" ? "github-icon" : undefined}
              src={stackIcons[element.image] || element.logo || null}
              alt={`Logo ${element.nom}`}
              height="40px"
              loading="lazy"
              decoding="async"
            />
            <p>{element.nom}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MainWindow() {
  const [activeSection, setActiveSection] = useState("perso");
  const pageRef = useRef(null);
  const sectionRefs = useRef({});

  const registerSection = (sectionId) => (element) => {
    sectionRefs.current[sectionId] = element;
  };

  const navigateToSection = (sectionId) => {
    setActiveSection(sectionId);
    sectionRefs.current[sectionId]?.scrollIntoView?.({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleScroll = () => {
    const page = pageRef.current;
    if (!page) return;
    const activationLine = page.scrollTop + Math.min(page.clientHeight * 0.28, 180);
    let currentSection = NAVIGATION_ITEMS[0].id;

    NAVIGATION_ITEMS.forEach(({ id }) => {
      const section = sectionRefs.current[id];
      if (section && section.offsetTop <= activationLine) currentSection = id;
    });
    setActiveSection(currentSection);
  };

  return (
    <section
      ref={pageRef}
      className="page resume-page"
      onScroll={handleScroll}
    >
      <div className="resume-layout">
        <nav className="resume-nav" aria-label="Sommaire du curriculum">
          <span className="resume-nav-title">Sommaire</span>
          <div>
            {NAVIGATION_ITEMS.map((item) => (
              <button
                type="button"
                className={activeSection === item.id ? "active" : ""}
                aria-current={activeSection === item.id ? "location" : undefined}
                onClick={() => navigateToSection(item.id)}
                key={item.id}
              >
                <span>{item.number}</span>
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="content">
          <section className="demoMobile">
            <p>Profitez de l'expérience complète sur Desktop !</p>
            <img
              src={demo}
              alt="demo screenshot on desktop"
              loading="lazy"
              decoding="async"
            />
          </section>

          <section
            ref={registerSection("perso")}
            className="presentation"
            id="perso"
          >
            <div className="round" />
            <div className="profile-copy">
              <p className="eyebrow">Portfolio professionnel</p>
              <h2>Milo Roche-Vandenbroucque</h2>
              <h3>Entrepreneur & Formateur 🦁</h3>
            </div>
            <div className="profile-actions">
              <a href={LINKEDIN_URL} target="_blank" rel="noreferrer">
                <MessageIcon />
                Me contacter
              </a>
              <button type="button" className="primary" onClick={downloadCv}>
                <DownloadIcon />
                Télécharger le CV
              </button>
            </div>
          </section>

          <section ref={registerSection("stack")} className="stack" id="stack">
            <div className="section-heading">
              <p>Expertise</p>
              <h2>Stack maîtrisée</h2>
            </div>
            <div className="gridStack">
              <StackSection title="Frontend" items={listStack.frontend} />
              <StackSection title="Backend" items={listStack.backend} />
            </div>
            <div className="gridStack">
              <StackSection title="DevSecOps" items={listStack.devops} />
              <StackSection title="Langages" items={listStack.langages} />
            </div>
            <div className="gridStack">
              <StackSection title="Autres" items={listStack.autres} />
              <StackSection title="OS" items={listStack.os} />
            </div>
          </section>

          <section
            ref={registerSection("pro")}
            className="experience"
            id="pro"
          >
            <div className="section-heading">
              <p>Parcours</p>
              <h2>Expériences</h2>
            </div>
            <div className="card-container">
              {experienceList.experiences.map((element) => (
                <div className="cardExperience" key={`${element.entreprise}-${element.timeline}`}>
                  <div className="row">
                    <img
                      src={companyLogos[element.logo] || null}
                      alt={`Logo ${element.entreprise}`}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="rowText">
                    <h4>{element.poste}</h4>-<p>{element.contrat}</p>
                  </div>
                  <p>{element.entreprise}</p>
                  <p>{element.timeline}</p>
                  <ul>
                    {element.description.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section
            ref={registerSection("education")}
            className="education"
            id="education"
          >
            <div className="section-heading">
              <p>Études</p>
              <h2>Formation</h2>
            </div>
            <div className="card-container">
              {educationList.education.map((element) => (
                <div className="cardEducation" key={`${element.ecole}-${element.timeline}`}>
                  <h3>{element.ecole}</h3>
                  <h4>{element.diplome}</h4>
                  <p>{element.localisation}</p>
                  <p>{element.timeline}</p>
                  <p>{element.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
