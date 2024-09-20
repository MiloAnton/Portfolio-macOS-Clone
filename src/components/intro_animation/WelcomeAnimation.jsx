import React, { useEffect, useState } from "react";
import "./WelcomeAnimation.scss";

const WelcomeAnimation = ({ onAnimationEnd }) => {
  const [isAnimationFinished, setIsAnimationFinished] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimationFinished(true);
      onAnimationEnd();
    }, 2000); // Durée de l'animation en millisecondes

    return () => {
      clearTimeout(timer);
    };
  }, [onAnimationEnd]);

  return (
    <div
      className={`welcome-animation ${isAnimationFinished ? "fadeOut" : ""}`}
    />
  );
};

export default WelcomeAnimation;
