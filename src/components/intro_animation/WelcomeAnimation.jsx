import React, { useEffect, useState } from "react";
import "./WelcomeAnimation.scss";
import logo from "./../../assets/logo512.png";

const WelcomeAnimation = ({ onAnimationEnd }) => {
  const [isAnimationFinished, setIsAnimationFinished] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimationFinished(true);
      onAnimationEnd();
    }, 3000); // Durée de l'animation en millisecondes

    return () => {
      clearTimeout(timer);
    };
  }, [onAnimationEnd]);

  return (
    <div
      className={`welcome-animation ${isAnimationFinished ? "fadeOut" : ""}`}
    >
      <img src={logo} alt="Logo" className="welcome-logo" />
    </div>
  );
};

export default WelcomeAnimation;
