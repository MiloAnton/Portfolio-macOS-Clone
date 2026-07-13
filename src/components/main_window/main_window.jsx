import "./main_window.scss";
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
import MenuBar from "../menu_bar/menu_bar";
import Draggable from "react-draggable";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import { useState, useEffect } from "react";
import usePersistentWindowPosition from "../../hooks/usePersistentWindowPosition";

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

function StackSection({ title, items }) {
  return (
    <div>
      <h3>{title}</h3>
      <div className="iconesStack">
        {items.map((element) => (
          <div
            key={element.nom}
            style={{ textAlign: "center" }}
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

export default function MainWindow(props) {
  const [defaultWidth, defaultHeight] = props.defaultSize || [1100, 700];
  const [initialWidth, setInitialWidth] = useState(defaultWidth);
  const [initialHeight, setInitialHeight] = useState(defaultHeight);
  const defaultPosition = {
    x: Math.round(window.innerWidth * 0.02 - 200),
    y: Math.round(window.innerHeight * 0.055 - 40),
  };
  const { position, handleDragStop } = usePersistentWindowPosition(
    "main",
    initialWidth,
    initialHeight,
    {
      initialPosition: defaultPosition,
      storageKeySuffix: "showcase-layout",
    }
  );

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      setInitialWidth(
        screenWidth > 900 ? Math.min(defaultWidth, screenWidth - 80) : screenWidth
      );
      setInitialHeight(
        screenHeight > 450
          ? Math.min(defaultHeight, screenHeight - 140)
          : screenHeight
      );
    };
    handleResize();
  }, [defaultHeight, defaultWidth]);

  const handleFullscreen = () => {
    props.fullScreen();
  };

  const handleQuit = () => {
    props.handleClose();
  };

  useEffect(() => {
    // Cascade d'apparition calculée par section (et non globalement, sinon
    // les dernières icônes attendraient plusieurs secondes).
    document.querySelectorAll(".iconesStack").forEach((section) => {
      Array.from(section.children).forEach((element, index) => {
        element.style.animationDelay = `${index * 0.08}s`;
      });
    });
  }, []);

  return (
    <Draggable handle="#handle" position={position} onStop={handleDragStop}>
      <ResizableBox
        className={`App ${
          props.isActive ? "window-active" : "window-inactive"
        }`}
        style={
          props.isMinimized
            ? { display: "none" }
            : props.isFullScreen
            ? {
                width: "calc(100vw - 100px) !important",
                height: "100vh !important",
              }
            : { zIndex: props.zIndex }
        }
        onMouseDownCapture={() => props.handleClickZIndex()}
        width={initialWidth} // Largeur initiale de la fenêtre
        height={initialHeight} // Hauteur initiale de la fenêtre
        minConstraints={[300, 200]} // Largeur et hauteur minimales
        maxConstraints={[2560, 1440]} // Largeur et hauteur maximales
        resizeHandles={["se"]} // Redimensionner uniquement depuis le coin inférieur droit
      >
        <MenuBar
          title="À propos de Milo"
          handleFullscreen={handleFullscreen}
          handleQuit={handleQuit}
          handleMinimize={props.handleMinimize}
        />
        <section className="page resume-page">
          <div className="content">
            <section className="demoMobile">
              <p>Profitez de l'expérience complète sur Desktop !</p>
              <img src={demo} alt="demo screenshot on desktop" loading="lazy" decoding="async" />
            </section>
            <section className="presentation" id="perso">
              <div className="round" />
              <div className="profile-copy">
                <p className="eyebrow">Portfolio professionnel</p>
                <h2>Milo Roche-Vandenbroucque</h2>
                <h3>Entrepreneur & Formateur 🦁</h3>
              </div>
            </section>
            <section className="stack" id="stack">
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
            <section className="experience" id="pro">
              <div className="section-heading">
                <p>Parcours</p>
                <h2>Expériences</h2>
              </div>
              <div className="card-container">
                {experienceList.experiences.map((element, index) => {
                  return (
                    <div className="cardExperience" key={index}>
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
                        {element.description.map((item) => {
                          return <li key={item}>{item}</li>;
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </section>
            <section className="education" id="education">
              <div className="section-heading">
                <p>Études</p>
                <h2>Formation</h2>
              </div>
              <div className="card-container">
                {educationList.education.map((element, index) => {
                  return (
                    <div className="cardEducation" key={index}>
                      <h3>{element.ecole}</h3>
                      <h4>{element.diplome}</h4>
                      <p>{element.localisation}</p>
                      <p>{element.timeline}</p>
                      <p>{element.description}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </section>
        <div className="resizeIndicator" />
      </ResizableBox>
    </Draggable>
  );
}
