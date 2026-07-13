import "./facetime_window.scss";
import profilepic from "./../../assets/profil.jpg";
import { useEffect, useRef, useState } from "react";

const formatDuration = (seconds) => {
  const min = String(Math.floor(seconds / 60)).padStart(2, "0");
  const sec = String(seconds % 60).padStart(2, "0");
  return `${min}:${sec}`;
};

export default function FacetimeWindow(props) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  // connecting : demande d'accès caméra en cours | active : en appel | denied : refusé/indisponible
  const [callState, setCallState] = useState("connecting");
  const [cameraOn, setCameraOn] = useState(true);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!props.isVisible) {
      setCallState("connecting");
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      return undefined;
    }

    let cancelled = false;
    setCameraOn(true);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCallState("denied");
      return undefined;
    }
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        setCallState("active");
      })
      .catch(() => {
        if (!cancelled) {
          setCallState("denied");
        }
      });
    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [props.isVisible]);

  useEffect(() => {
    if (callState !== "active") {
      return;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [callState]);

  const handleToggleCamera = () => {
    streamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = !cameraOn ? true : false;
    });
    setCameraOn(!cameraOn);
  };

  const handleQuit = () => {
    props.closeWindow();
  };

  return (
        <section className="facetime-app">
          <video ref={videoRef} autoPlay playsInline muted />
          {callState !== "active" && (
            <div className="facetime-overlay">
              <img src={profilepic} alt="Milo" />
              {callState === "connecting" ? (
                <>
                  <p className="status">Appel FaceTime…</p>
                  <p className="hint">
                    Autorisez la caméra pour rejoindre l'appel 🎥
                  </p>
                </>
              ) : (
                <>
                  <p className="status">Caméra indisponible 😢</p>
                  <p className="hint">
                    Autorisez l'accès à la caméra pour l'expérience complète.
                    <br />
                    Promis : rien n'est enregistré ni envoyé, tout reste dans
                    votre navigateur.
                  </p>
                </>
              )}
            </div>
          )}
          {callState === "active" && (
            <>
              <div className="call-info">
                <p className="caller">Milo Roche-Vandenbroucque</p>
                <p className="duration">{formatDuration(seconds)}</p>
              </div>
              <div className="pip" title="Votre correspondant">
                <img src={profilepic} alt="Milo en appel" />
              </div>
            </>
          )}
          <div className="controls">
            {callState === "active" && (
              <button
                onClick={handleToggleCamera}
                title={cameraOn ? "Couper la caméra" : "Réactiver la caméra"}
                className={cameraOn ? "" : "off"}
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 7l-7 5 7 5V7z" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  {!cameraOn && <line x1="2" y1="2" x2="22" y2="22" />}
                </svg>
              </button>
            )}
            <button className="hangup" onClick={handleQuit} title="Raccrocher">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.7l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.68-1.36-2.66-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" />
              </svg>
            </button>
          </div>
        </section>
  );
}
