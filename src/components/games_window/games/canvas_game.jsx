export default function CanvasGame({
  title,
  status,
  running,
  onRestart,
  actionLabel,
  controls,
  help,
  canvasRef,
}) {
  return (
    <div className="canvas-game game-stage">
      <div className="game-info">
        <span>{title}</span>
        <strong>{status}</strong>
        <button type="button" onClick={onRestart}>
          {actionLabel || (running ? "Recommencer" : "Jouer")}
        </button>
      </div>

      <canvas ref={canvasRef} width="640" height="360" />
      {controls}
      <p className="game-help">{help}</p>
    </div>
  );
}
