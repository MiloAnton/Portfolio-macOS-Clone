import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import FacetimeWindow from "./facetime_window";

describe("FacetimeWindow camera lifecycle", () => {
  let originalMediaDevices;

  beforeEach(() => {
    originalMediaDevices = navigator.mediaDevices;
  });

  afterEach(() => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: originalMediaDevices,
    });
  });

  test("stops every camera track when the window is minimized", async () => {
    const videoTrack = { stop: jest.fn(), enabled: true };
    const stream = {
      getTracks: () => [videoTrack],
      getVideoTracks: () => [videoTrack],
    };
    const getUserMedia = jest.fn().mockResolvedValue(stream);
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia },
    });

    const { rerender } = render(
      <FacetimeWindow isVisible closeWindow={jest.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText("Milo Roche-Vandenbroucque")).toBeInTheDocument();
    });
    expect(getUserMedia).toHaveBeenCalledWith({ video: true, audio: false });

    rerender(<FacetimeWindow isVisible={false} closeWindow={jest.fn()} />);

    expect(videoTrack.stop).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByText("Milo Roche-Vandenbroucque")
    ).not.toBeInTheDocument();
  });
});
