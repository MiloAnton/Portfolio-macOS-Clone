import React, { useEffect, useState } from "react";
import "./WelcomeAnimation.scss";

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
      <div class="spinner">
        <div class="spinnerin"></div>
      </div>
    </div>
  );
};

export default WelcomeAnimation;
