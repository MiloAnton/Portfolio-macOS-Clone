import { useCallback, useEffect, useRef, useState } from "react";
import profilePicture from "../../assets/profil.jpg";
import "./facetime_window.scss";

export const formatDuration = (seconds) => {
  const min = String(Math.floor(seconds / 60)).padStart(2, "0");
  const sec = String(seconds % 60).padStart(2, "0");
  return `${min}:${sec}`;
};

export const classifyMediaError = (error) => {
  if (
    ["NotAllowedError", "PermissionDeniedError", "SecurityError"].includes(
      error?.name
    )
  ) {
    return "permission";
  }
  if (
    ["NotFoundError", "DevicesNotFoundError", "OverconstrainedError"].includes(
      error?.name
    )
  ) {
    return "no-camera";
  }
  return "technical";
};

const ERROR_CONTENT = {
  permission: {
    title: "Accès à la caméra refusé",
    detail:
      "Autorise la caméra dans les réglages du navigateur, puis réessaie.",
  },
  "no-camera": {
    title: "Aucune caméra détectée",
    detail:
      "Connecte une caméra ou vérifie qu’elle n’est pas désactivée par le système.",
  },
  unsupported: {
    title: "Caméra non prise en charge",
    detail: "Ce navigateur ne permet pas d’accéder aux périphériques vidéo.",
  },
  technical: {
    title: "Impossible de démarrer la caméra",
    detail:
      "La caméra est peut-être déjà utilisée par une autre application.",
  },
};

function CameraIcon({ off = false }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M23 7l-7 5 7 5V7z" />
      <rect x="1" y="5" width="15" height="14" rx="2" />
      {off && <line x1="2" y1="2" x2="22" y2="22" />}
    </svg>
  );
}

function MicrophoneIcon({ off = false }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0M12 17v4M8 21h8" />
      {off && <line x1="3" y1="3" x2="21" y2="21" />}
    </svg>
  );
}

function MirrorIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 4 3 9l5 5M3 9h11a5 5 0 0 1 5 5v6" />
    </svg>
  );
}

export default function FacetimeWindow({
  isVisible = true,
  closeWindow = () => {},
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const requestGenerationRef = useRef(0);
  const [phase, setPhase] = useState("idle");
  const [errorType, setErrorType] = useState(null);
  const [cameraOn, setCameraOn] = useState(true);
  const [microphoneOn, setMicrophoneOn] = useState(true);
  const [microphoneAvailable, setMicrophoneAvailable] = useState(true);
  const [mirrored, setMirrored] = useState(true);
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);
  const [deviceMessage, setDeviceMessage] = useState("");
  const [seconds, setSeconds] = useState(0);

  const attachStream = useCallback((stream) => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, []);

  const stopCurrentStream = useCallback(() => {
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const loadCameraChoices = useCallback(async (stream, requestGeneration) => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      if (requestGeneration !== requestGenerationRef.current) return;
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );
      setCameras(videoDevices);
      const currentDeviceId =
        stream.getVideoTracks()[0]?.getSettings?.().deviceId;
      if (currentDeviceId) setSelectedCameraId(currentDeviceId);
      else if (videoDevices[0]?.deviceId) {
        setSelectedCameraId(videoDevices[0].deviceId);
      }
    } catch (error) {
      setCameras([]);
    }
  }, []);

  useEffect(() => {
    if (isVisible) return;
    requestGenerationRef.current += 1;
    stopCurrentStream();
    setPhase("idle");
    setErrorType(null);
    setSeconds(0);
    setCameras([]);
    setSelectedCameraId("");
  }, [isVisible, stopCurrentStream]);

  useEffect(
    () => () => {
      requestGenerationRef.current += 1;
      stopCurrentStream();
    },
    [stopCurrentStream]
  );

  useEffect(() => {
    if (phase !== "active") return undefined;
    setSeconds(0);
    const timer = window.setInterval(
      () => setSeconds((currentSeconds) => currentSeconds + 1),
      1000
    );
    return () => window.clearInterval(timer);
  }, [phase]);

  const prepareCall = async () => {
    const mediaDevices = navigator.mediaDevices;
    if (!mediaDevices?.getUserMedia) {
      setErrorType("unsupported");
      setPhase("error");
      return;
    }

    requestGenerationRef.current += 1;
    const requestGeneration = requestGenerationRef.current;
    stopCurrentStream();
    setPhase("requesting");
    setErrorType(null);
    setDeviceMessage("");
    setCameraOn(true);
    setMicrophoneOn(true);
    setMicrophoneAvailable(true);
    setSeconds(0);

    try {
      const videoConstraint = selectedCameraId
        ? { deviceId: { exact: selectedCameraId } }
        : true;
      const stream = await mediaDevices.getUserMedia({
        video: videoConstraint,
        audio: false,
      });
      if (
        requestGeneration !== requestGenerationRef.current ||
        !isVisible
      ) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      attachStream(stream);
      setPhase("preview");
      loadCameraChoices(stream, requestGeneration);
    } catch (error) {
      if (requestGeneration !== requestGenerationRef.current) return;
      setErrorType(classifyMediaError(error));
      setPhase("error");
    }
  };

  const requestMicrophone = async () => {
    if (!navigator.mediaDevices?.getUserMedia) return false;
    const requestGeneration = requestGenerationRef.current;
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });
      const audioTracks = audioStream.getAudioTracks();
      if (
        requestGeneration !== requestGenerationRef.current ||
        !streamRef.current ||
        !isVisible
      ) {
        audioStream.getTracks().forEach((track) => track.stop());
        return false;
      }

      audioTracks.forEach((track) => streamRef.current.addTrack(track));
      setMicrophoneAvailable(audioTracks.length > 0);
      setMicrophoneOn(audioTracks.length > 0);
      return audioTracks.length > 0;
    } catch (error) {
      if (requestGeneration !== requestGenerationRef.current) return false;
      setMicrophoneAvailable(false);
      setMicrophoneOn(false);
      setDeviceMessage("Microphone indisponible — l’appel continue sans audio.");
      return false;
    }
  };

  const joinCall = async () => {
    if (!streamRef.current || isSwitchingCamera) return;
    const requestGeneration = requestGenerationRef.current;
    setPhase("joining");
    setSeconds(0);
    if (microphoneOn) await requestMicrophone();
    if (requestGeneration !== requestGenerationRef.current) return;
    setPhase("active");
  };

  const switchCamera = async (deviceId) => {
    if (!deviceId || !navigator.mediaDevices?.getUserMedia) return;
    setIsSwitchingCamera(true);
    setDeviceMessage("");
    const requestGeneration = ++requestGenerationRef.current;

    try {
      const replacementStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
        audio: false,
      });
      if (requestGeneration !== requestGenerationRef.current) {
        replacementStream.getTracks().forEach((track) => track.stop());
        return;
      }

      const currentStream = streamRef.current;
      const previousVideoTracks = currentStream?.getVideoTracks() || [];
      previousVideoTracks.forEach((track) => {
        track.stop();
        currentStream?.removeTrack?.(track);
      });
      replacementStream.getVideoTracks().forEach((track) => {
        track.enabled = cameraOn;
        currentStream?.addTrack?.(track);
      });
      attachStream(currentStream || replacementStream);
      setSelectedCameraId(deviceId);
    } catch (error) {
      setDeviceMessage("Impossible d’utiliser cette caméra.");
    } finally {
      if (requestGeneration === requestGenerationRef.current) {
        setIsSwitchingCamera(false);
      }
    }
  };

  const toggleCamera = () => {
    const nextCameraState = !cameraOn;
    streamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = nextCameraState;
    });
    setCameraOn(nextCameraState);
  };

  const toggleMicrophone = async () => {
    const audioTracks = streamRef.current?.getAudioTracks() || [];
    if (phase === "preview") {
      setMicrophoneOn((currentState) => !currentState);
      setDeviceMessage("");
      return;
    }

    if (audioTracks.length === 0 && !microphoneOn) {
      setDeviceMessage("");
      await requestMicrophone();
      return;
    }
    const nextMicrophoneState = !microphoneOn;
    audioTracks.forEach((track) => {
      track.enabled = nextMicrophoneState;
    });
    setMicrophoneOn(nextMicrophoneState);
  };

  const hangUp = () => {
    requestGenerationRef.current += 1;
    stopCurrentStream();
    setPhase("idle");
    setSeconds(0);
    closeWindow();
  };

  const errorContent = ERROR_CONTENT[errorType] || ERROR_CONTENT.technical;
  const streamVisible = ["preview", "joining", "active"].includes(phase);

  return (
    <section className={`facetime-app phase-${phase}`}>
      <video
        ref={videoRef}
        className={`${streamVisible ? "visible" : ""}${
          mirrored ? " mirrored" : ""
        }`}
        autoPlay
        playsInline
        muted
      />

      {phase === "idle" && (
        <div className="facetime-lobby">
          <div className="lobby-glow" />
          <img src={profilePicture} alt="Milo" />
          <p className="eyebrow">FaceTime avec</p>
          <h2>Milo Roche-Vandenbroucque</h2>
          <p className="privacy-copy">
            La caméra ne sera demandée qu’après ton action. Aucun flux n’est
            enregistré ni envoyé.
          </p>
          <button type="button" className="prepare-call" onClick={prepareCall}>
            <CameraIcon />
            Préparer l’appel
          </button>
        </div>
      )}

      {phase === "requesting" && (
        <div className="facetime-state-card" role="status">
          <span className="facetime-spinner" />
          <strong>Préparation de la caméra…</strong>
          <p>Le navigateur peut maintenant demander ton autorisation.</p>
        </div>
      )}

      {phase === "error" && (
        <div className="facetime-state-card error-state" role="alert">
          <span className="state-icon"><CameraIcon off /></span>
          <strong>{errorContent.title}</strong>
          <p>{errorContent.detail}</p>
          <button type="button" onClick={prepareCall}>Réessayer</button>
        </div>
      )}

      {phase === "preview" && (
        <div className="preview-panel">
          <img src={profilePicture} alt="" />
          <div>
            <span>Prêt pour l’appel ?</span>
            <strong>Milo Roche-Vandenbroucque</strong>
          </div>
          <button type="button" onClick={joinCall} disabled={isSwitchingCamera}>
            Rejoindre
          </button>
        </div>
      )}

      {phase === "joining" && (
        <div className="joining-indicator" role="status">
          <span className="facetime-spinner" /> Connexion…
        </div>
      )}

      {phase === "active" && (
        <>
          <div className="call-info">
            <p className="caller">Milo Roche-Vandenbroucque</p>
            <p className="duration">{formatDuration(seconds)}</p>
          </div>
          <div className="pip" title="Votre correspondant">
            <img src={profilePicture} alt="Milo en appel" />
          </div>
        </>
      )}

      {phase === "active" && !cameraOn && (
        <div className="camera-off-screen">
          <span><CameraIcon off /></span>
          <strong>Caméra coupée</strong>
          <p>Ta vidéo est suspendue. Tu peux la réactiver à tout moment.</p>
        </div>
      )}

      {streamVisible && (
        <div className="device-toolbar">
          {cameras.length > 1 && (
            <select
              value={selectedCameraId}
              onChange={(event) => switchCamera(event.target.value)}
              disabled={isSwitchingCamera || phase === "joining"}
              aria-label="Choisir la caméra"
            >
              {cameras.map((camera, index) => (
                <option value={camera.deviceId} key={camera.deviceId}>
                  {camera.label || `Caméra ${index + 1}`}
                </option>
              ))}
            </select>
          )}
          {deviceMessage && <span role="status">{deviceMessage}</span>}
        </div>
      )}

      {streamVisible && (
        <div className="controls">
          {phase === "active" && (
            <button
              type="button"
              onClick={toggleCamera}
              aria-label={cameraOn ? "Couper la caméra" : "Réactiver la caméra"}
              className={cameraOn ? "" : "off"}
            >
              <CameraIcon off={!cameraOn} />
            </button>
          )}
          <button
            type="button"
            onClick={toggleMicrophone}
            disabled={phase === "joining" || isSwitchingCamera}
            aria-label={microphoneOn ? "Couper le microphone" : "Réactiver le microphone"}
            className={microphoneOn ? "" : "off"}
          >
            <MicrophoneIcon off={!microphoneOn} />
          </button>
          <button
            type="button"
            onClick={() => setMirrored((currentState) => !currentState)}
            disabled={phase === "joining"}
            aria-label={mirrored ? "Désactiver le miroir" : "Activer le miroir"}
            aria-pressed={mirrored}
            className={mirrored ? "mirror-active" : ""}
          >
            <MirrorIcon />
          </button>
          {phase === "active" && (
            <button type="button" className="hangup" onClick={hangUp} aria-label="Raccrocher">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.7l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.68-1.36-2.66-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" />
              </svg>
            </button>
          )}
        </div>
      )}

      {!microphoneAvailable && phase === "preview" && (
        <p className="microphone-note">Le microphone sera testé au moment de rejoindre.</p>
      )}
    </section>
  );
}
