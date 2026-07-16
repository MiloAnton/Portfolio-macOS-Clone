import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import FacetimeWindow, { classifyMediaError } from "./facetime_window";

const createTrack = (kind, deviceId = "") => ({
  enabled: true,
  getSettings: () => ({ deviceId }),
  kind,
  stop: jest.fn(),
});

const createStream = (initialTracks) => {
  const tracks = [...initialTracks];
  return {
    addTrack: jest.fn((track) => tracks.push(track)),
    getAudioTracks: () => tracks.filter((track) => track.kind === "audio"),
    getTracks: () => tracks,
    getVideoTracks: () => tracks.filter((track) => track.kind === "video"),
    removeTrack: jest.fn((track) => {
      const index = tracks.indexOf(track);
      if (index >= 0) tracks.splice(index, 1);
    }),
  };
};

describe("FacetimeWindow", () => {
  let originalMediaDevices;

  beforeEach(() => {
    jest.useFakeTimers();
    originalMediaDevices = navigator.mediaDevices;
  });

  afterEach(() => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: originalMediaDevices,
    });
    jest.useRealTimers();
  });

  test("waits for consent, shows a preview and resets the timer for each call", async () => {
    const closeWindow = jest.fn();
    const getUserMedia = jest.fn((constraints) => {
      if (constraints.video) {
        return Promise.resolve(createStream([createTrack("video", "camera-1")]));
      }
      return Promise.resolve(createStream([createTrack("audio")]));
    });
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        enumerateDevices: jest.fn().mockResolvedValue([]),
        getUserMedia,
      },
    });

    render(<FacetimeWindow isVisible closeWindow={closeWindow} />);
    expect(getUserMedia).not.toHaveBeenCalled();
    expect(screen.getByText(/La caméra ne sera demandée/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Préparer l’appel/ }));
    await screen.findByRole("button", { name: "Rejoindre" });
    expect(getUserMedia).toHaveBeenNthCalledWith(1, {
      video: true,
      audio: false,
    });

    fireEvent.click(screen.getByRole("button", { name: "Rejoindre" }));
    await screen.findByText("Milo Roche-Vandenbroucque");
    expect(getUserMedia).toHaveBeenNthCalledWith(2, {
      video: false,
      audio: true,
    });
    expect(screen.getByText("00:00")).toBeInTheDocument();
    act(() => jest.advanceTimersByTime(2000));
    expect(screen.getByText("00:02")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Raccrocher" }));
    expect(closeWindow).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: /Préparer l’appel/ }));
    await screen.findByRole("button", { name: "Rejoindre" });
    fireEvent.click(screen.getByRole("button", { name: "Rejoindre" }));
    await waitFor(() => expect(screen.getByText("00:00")).toBeInTheDocument());
  });

  test("stops every media track when the window is minimized", async () => {
    const videoTrack = createTrack("video", "camera-1");
    const stream = createStream([videoTrack]);
    const getUserMedia = jest.fn().mockResolvedValue(stream);
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        enumerateDevices: jest.fn().mockResolvedValue([]),
        getUserMedia,
      },
    });

    const { rerender } = render(
      <FacetimeWindow isVisible closeWindow={jest.fn()} />
    );
    fireEvent.click(screen.getByRole("button", { name: /Préparer l’appel/ }));
    await screen.findByRole("button", { name: "Rejoindre" });

    rerender(<FacetimeWindow isVisible={false} closeWindow={jest.fn()} />);
    expect(videoTrack.stop).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: /Préparer l’appel/ })).toBeInTheDocument();
    expect(getUserMedia).toHaveBeenCalledTimes(1);
  });

  test("controls camera, microphone and mirror with a real camera-off screen", async () => {
    const videoTrack = createTrack("video", "camera-1");
    const audioTrack = createTrack("audio");
    const videoStream = createStream([videoTrack]);
    const audioStream = createStream([audioTrack]);
    const getUserMedia = jest
      .fn()
      .mockResolvedValueOnce(videoStream)
      .mockResolvedValueOnce(audioStream);
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        enumerateDevices: jest.fn().mockResolvedValue([]),
        getUserMedia,
      },
    });

    const { container } = render(
      <FacetimeWindow isVisible closeWindow={jest.fn()} />
    );
    fireEvent.click(screen.getByRole("button", { name: /Préparer l’appel/ }));
    await screen.findByRole("button", { name: "Rejoindre" });
    fireEvent.click(screen.getByRole("button", { name: "Rejoindre" }));
    await screen.findByRole("button", { name: "Couper la caméra" });

    fireEvent.click(screen.getByRole("button", { name: "Couper la caméra" }));
    expect(videoTrack.enabled).toBe(false);
    expect(screen.getByText("Caméra coupée")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Couper le microphone" }));
    expect(audioTrack.enabled).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Désactiver le miroir" }));
    expect(container.querySelector("video")).not.toHaveClass("mirrored");
  });

  test("distinguishes permission, missing-camera and technical errors", async () => {
    expect(classifyMediaError({ name: "NotAllowedError" })).toBe("permission");
    expect(classifyMediaError({ name: "NotFoundError" })).toBe("no-camera");
    expect(classifyMediaError({ name: "NotReadableError" })).toBe("technical");

    const getUserMedia = jest
      .fn()
      .mockRejectedValueOnce({ name: "NotAllowedError" })
      .mockRejectedValueOnce({ name: "NotFoundError" })
      .mockRejectedValueOnce({ name: "NotReadableError" });
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia },
    });

    render(<FacetimeWindow isVisible closeWindow={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /Préparer l’appel/ }));
    expect(await screen.findByText("Accès à la caméra refusé")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Réessayer" }));
    expect(await screen.findByText("Aucune caméra détectée")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Réessayer" }));
    expect(await screen.findByText("Impossible de démarrer la caméra")).toBeInTheDocument();
  });

  test("enumerates cameras and safely replaces the selected video track", async () => {
    const firstTrack = createTrack("video", "camera-1");
    const secondTrack = createTrack("video", "camera-2");
    const firstStream = createStream([firstTrack]);
    const secondStream = createStream([secondTrack]);
    const getUserMedia = jest
      .fn()
      .mockResolvedValueOnce(firstStream)
      .mockResolvedValueOnce(secondStream);
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        enumerateDevices: jest.fn().mockResolvedValue([
          { kind: "videoinput", deviceId: "camera-1", label: "FaceTime HD" },
          { kind: "videoinput", deviceId: "camera-2", label: "Caméra USB" },
        ]),
        getUserMedia,
      },
    });

    render(<FacetimeWindow isVisible closeWindow={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /Préparer l’appel/ }));
    const cameraSelect = await screen.findByRole("combobox", {
      name: "Choisir la caméra",
    });
    fireEvent.change(cameraSelect, { target: { value: "camera-2" } });

    await waitFor(() => expect(firstTrack.stop).toHaveBeenCalledTimes(1));
    expect(getUserMedia).toHaveBeenNthCalledWith(2, {
      video: { deviceId: { exact: "camera-2" } },
      audio: false,
    });
    expect(firstStream.addTrack).toHaveBeenCalledWith(secondTrack);
  });

  test("stops a late camera stream after the app is closed", async () => {
    let resolveCamera;
    const videoTrack = createTrack("video");
    const pendingCamera = new Promise((resolve) => {
      resolveCamera = resolve;
    });
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: jest.fn().mockReturnValue(pendingCamera) },
    });

    const { unmount } = render(
      <FacetimeWindow isVisible closeWindow={jest.fn()} />
    );
    fireEvent.click(screen.getByRole("button", { name: /Préparer l’appel/ }));
    unmount();
    await act(async () => {
      resolveCamera(createStream([videoTrack]));
      await pendingCamera;
    });

    expect(videoTrack.stop).toHaveBeenCalledTimes(1);
  });

  test("stops a microphone stream granted after the app is closed", async () => {
    let resolveMicrophone;
    const videoStream = createStream([createTrack("video")]);
    const audioTrack = createTrack("audio");
    const pendingMicrophone = new Promise((resolve) => {
      resolveMicrophone = resolve;
    });
    const getUserMedia = jest
      .fn()
      .mockResolvedValueOnce(videoStream)
      .mockReturnValueOnce(pendingMicrophone);
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        enumerateDevices: jest.fn().mockResolvedValue([]),
        getUserMedia,
      },
    });

    const { unmount } = render(
      <FacetimeWindow isVisible closeWindow={jest.fn()} />
    );
    fireEvent.click(screen.getByRole("button", { name: /Préparer l’appel/ }));
    await screen.findByRole("button", { name: "Rejoindre" });
    fireEvent.click(screen.getByRole("button", { name: "Rejoindre" }));
    unmount();

    await act(async () => {
      resolveMicrophone(createStream([audioTrack]));
      await pendingMicrophone;
    });

    expect(audioTrack.stop).toHaveBeenCalledTimes(1);
  });
});
