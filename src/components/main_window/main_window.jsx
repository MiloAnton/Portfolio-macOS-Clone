import "./main_window.scss";
import listStack from "./../../ressources/listStack.json";
import educationList from "./../../ressources/listEducation.json";
import experienceList from "./../../ressources/listExperiences.json";
import obs from "./../../assets/logosEntreprises/obs.png";
import bytel from "./../../assets/logosEntreprises/bytel.png";
import cf from "./../../assets/logosEntreprises/cf.png";
import demo from "./../../assets/demo.png";
import adobecc from "./../../assets/iconesStack/adobecc.png";
import angular from "./../../assets/iconesStack/angular.png";
import ansible from "./../../assets/iconesStack/ansible.png";
import c from "./../../assets/iconesStack/c.png";
import django from "./../../assets/iconesStack/django.png";
import docker from "./../../assets/iconesStack/docker.webp";
import express from "./../../assets/iconesStack/express.png";
import figma from "./../../assets/iconesStack/figma.png";
import finder from "./../../assets/iconesStack/finder.png";
import git from "./../../assets/iconesStack/git.png";
import gsuite from "./../../assets/iconesStack/gsuite.png";
import javascript from "./../../assets/iconesStack/javascript.png";
import jira from "./../../assets/iconesStack/jira.png";
import mongo from "./../../assets/iconesStack/mongo.png";
import nest from "./../../assets/iconesStack/nest.png";
import notion from "./../../assets/iconesStack/notion.png";
import office from "./../../assets/iconesStack/office.png";
import php from "./../../assets/iconesStack/php.png";
import python from "./../../assets/iconesStack/python.png";
import react from "./../../assets/iconesStack/react.png";
import sonarqube from "./../../assets/iconesStack/sonarqube.png";
import sql from "./../../assets/iconesStack/sql.png";
import tux from "./../../assets/iconesStack/tux.png";
import typescript from "./../../assets/iconesStack/typescript.png";
import vite from "./../../assets/iconesStack/vite.png";
import windows from "./../../assets/iconesStack/windows.png";
import MenuBar from "../menu_bar/menu_bar";
import Draggable from "react-draggable";

export default function MainWindow(props) {
  return (
    <Draggable handle="#handle">
      <div
        className="App"
        style={{ zIndex: props.zIndex }}
        onMouseDownCapture={() => props.handleClickZIndex()}
      >
        <MenuBar />
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
                        >
                          <img
                            src={
                              element.image === "react"
                                ? react
                                : element.image === "angular"
                                ? angular
                                : element.image === "vite"
                                ? vite
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
      </div>
    </Draggable>
  );
}
