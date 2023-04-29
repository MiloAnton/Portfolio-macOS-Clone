import "./main_window.scss";
import listStack from "./../../ressources/listStack.json";
import educationList from "./../../ressources/listEducation.json";
import experienceList from "./../../ressources/listExperiences.json";
import obs from "./../../assets/logosEntreprises/obs.png";
import bytel from "./../../assets/logosEntreprises/bytel.png";
import cf from "./../../assets/logosEntreprises/cf.png";
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

export default function MainWindow(props) {
  const [initialWidth, setInitialWidth] = useState(1100);
  const [initialHeight, setInitialHeight] = useState(700);

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      setInitialWidth(screenWidth > 900 ? 1100 : screenWidth);
      setInitialHeight(screenHeight > 450 ? 700 : screenHeight);
    };
    handleResize();
  }, []);

  const handleFullscreen = () => {
    props.fullscreen();
  };

  const handleQuit = () => {
    props.handleClose();
  };

  useEffect(() => {
    const elements = document.querySelectorAll(".fade-in-from-top");

    elements.forEach((element, index) => {
      element.style.animationDelay = `${index * 0.1}s`;
    });
  }, []);

  return (
    <Draggable handle="#handle">
      <ResizableBox
        className="App"
        style={
          props.isMinimized
            ? { display: "none" }
            : props.isFullscreen
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
        <MenuBar handleFullscreen={handleFullscreen} handleQuit={handleQuit} />
        <section className="page">
          <div className="content">
            <section className="demoMobile">
              <p>Profitez de l'expérience complète sur Desktop !</p>
              <img src={demo} alt="demo screenshot on desktop" />
            </section>
            <section className="presentation" id="perso">
              <div className="round" />
              <div>
                <h2>Milo Roche-Vandenbroucque</h2>
                <h3>Étudiant, Alternant et Entrepreneur passionné 💪💻🎉</h3>
              </div>
            </section>
            <section className="stack" id="stack">
              <h2>Stack maîtrisée</h2>
              <div className="gridStack">
                <div>
                  <h3>Frontend</h3>
                  <div className="iconesStack">
                    {listStack.frontend.map((element) => {
                      return (
                        <div
                          style={{ textAlign: "center" }}
                          title={element.description}
                          className={
                            element.image === "react"
                              ? "element-1 fade-in-from-top"
                              : element.image === "angular"
                              ? "element-2 fade-in-from-top"
                              : element.image === "vite"
                              ? "element-3 fade-in-from-top"
                              : null
                          }
                        >
                          <img
                            src={
                              element.image === "react"
                                ? react
                                : element.image === "angular"
                                ? angular
                                : element.image === "vite"
                                ? vite
                                : element.image === "next"
                                ? next
                                : element.image === "tailwind"
                                ? tailwind
                                : null
                            }
                            alt="logo"
                            height="40px"
                          />
                          <p key={element.nom}>{element.nom}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h3>Backend</h3>
                  <div className="iconesStack">
                    {listStack.backend.map((element) => {
                      return (
                        <div
                          style={{ textAlign: "center" }}
                          title={element.description}
                          className={
                            element.image === "django"
                              ? "element-1 fade-in-from-top"
                              : element.image === "nest"
                              ? "element-2 fade-in-from-top"
                              : element.image === "express"
                              ? "element-3 fade-in-from-top"
                              : element.image === "sql"
                              ? "element-4 fade-in-from-top"
                              : element.image === "mongo"
                              ? "element-5 fade-in-from-top"
                              : null
                          }
                        >
                          <img
                            src={
                              element.image === "django"
                                ? django
                                : element.image === "nest"
                                ? nest
                                : element.image === "express"
                                ? express
                                : element.image === "sql"
                                ? sql
                                : element.image === "mongo"
                                ? mongo
                                : null
                            }
                            alt="logo"
                            height="40px"
                          />
                          <p key={element.nom}>{element.nom}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="gridStack">
                <div>
                  <h3>DevOps</h3>
                  <div className="iconesStack">
                    {listStack.devops.map((element) => {
                      return (
                        <div
                          style={{ textAlign: "center" }}
                          title={element.description}
                          className={
                            element.image === "git"
                              ? "element-1 fade-in-from-top"
                              : element.image === "sonarqube"
                              ? "element-2 fade-in-from-top"
                              : element.image === "ansible"
                              ? "element-3 fade-in-from-top"
                              : element.image === "docker"
                              ? "element-4 fade-in-from-top"
                              : element.image === "jira"
                              ? "element-5 fade-in-from-top"
                              : null
                          }
                        >
                          <img
                            src={
                              element.image === "git"
                                ? git
                                : element.image === "sonarqube"
                                ? sonarqube
                                : element.image === "ansible"
                                ? ansible
                                : element.image === "docker"
                                ? docker
                                : element.image === "jira"
                                ? jira
                                : null
                            }
                            alt="logo"
                            height="40px"
                          />
                          <p key={element.nom}>{element.nom}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h3>Langages</h3>
                  <div className="iconesStack">
                    {listStack.langages.map((element) => {
                      return (
                        <div
                          style={{ textAlign: "center" }}
                          title={element.description}
                          className={
                            element.image === "javascript"
                              ? "element-1 fade-in-from-top"
                              : element.image === "typescript"
                              ? "element-2 fade-in-from-top"
                              : element.image === "c"
                              ? "element-3 fade-in-from-top"
                              : element.image === "python"
                              ? "element-4 fade-in-from-top"
                              : element.image === "php"
                              ? "element-5 fade-in-from-top"
                              : null
                          }
                        >
                          <img
                            src={
                              element.image === "javascript"
                                ? javascript
                                : element.image === "typescript"
                                ? typescript
                                : element.image === "c"
                                ? c
                                : element.image === "python"
                                ? python
                                : element.image === "php"
                                ? php
                                : null
                            }
                            alt="logo"
                            height="40px"
                          />
                          <p key={element.nom}>{element.nom}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="gridStack">
                <div>
                  <h3>Autres</h3>
                  <div className="iconesStack">
                    {listStack.autres.map((element) => {
                      return (
                        <div
                          style={{ textAlign: "center" }}
                          title={element.description}
                          className={
                            element.image === "figma"
                              ? "element-1 fade-in-from-top"
                              : element.image === "adobecc"
                              ? "element-2 fade-in-from-top"
                              : element.image === "notion"
                              ? "element-3 fade-in-from-top"
                              : element.image === "gsuite"
                              ? "element-4 fade-in-from-top"
                              : element.image === "office"
                              ? "element-5 fade-in-from-top"
                              : null
                          }
                        >
                          <img
                            src={
                              element.image === "figma"
                                ? figma
                                : element.image === "adobecc"
                                ? adobecc
                                : element.image === "notion"
                                ? notion
                                : element.image === "gsuite"
                                ? gsuite
                                : element.image === "office"
                                ? office
                                : null
                            }
                            alt="logo"
                            height="40px"
                          />
                          <p key={element.nom}>{element.nom}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h3>OS</h3>
                  <div className="iconesStack">
                    {listStack.os.map((element) => {
                      return (
                        <div
                          style={{ textAlign: "center" }}
                          title={element.description}
                          className={
                            element.image === "tux"
                              ? "element-1 fade-in-from-top"
                              : element.image === "finder"
                              ? "element-2 fade-in-from-top"
                              : element.image === "windows"
                              ? "element-3 fade-in-from-top"
                              : null
                          }
                        >
                          <img
                            src={
                              element.image === "tux"
                                ? tux
                                : element.image === "finder"
                                ? finder
                                : element.image === "windows"
                                ? windows
                                : null
                            }
                            alt="logo"
                            height="40px"
                          />
                          <p key={element.nom}>{element.nom}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
            <section className="experience" id="pro">
              <h2>Expériences</h2>
              <div className="card-container">
                {experienceList.experiences.map((element, index) => {
                  return (
                    <div className="cardExperience" key={index}>
                      <div className="row">
                        <img
                          src={
                            element.logo === "obs"
                              ? obs
                              : element.logo === "bytel"
                              ? bytel
                              : element.logo === "cf"
                              ? cf
                              : null
                          }
                          alt="logo"
                        />
                      </div>
                      <div className="rowText">
                        <h4>{element.poste}</h4>-<p>{element.contrat}</p>
                      </div>
                      <p>{element.timeline}</p>
                      <ul>
                        {element.description.map((item) => {
                          return <li key={element.item}>{item}</li>;
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </section>
            <section className="education" id="education">
              <h2>Formation</h2>
              <div className="card-container">
                {educationList.education.map((element, index) => {
                  return (
                    <div className="cardEducation" key={index}>
                      <h3>{element.ecole}</h3>
                      <h4>{element.diplome}</h4>
                      <p>{element.localisation}</p>
                      <p>{element.timeline}</p>
                      <p>{element.description}</p>
                      <p>---------------------------</p>
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
