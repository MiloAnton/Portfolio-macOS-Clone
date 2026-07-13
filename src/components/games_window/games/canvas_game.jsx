export default function CanvasGame({
  title,
  status,
  running,
  onRestart,
  help,
  canvasRef,
}) {
  return (
    <div className="canvas-game game-stage">
      <div className="game-info">
        <span>{title}</span>
        <strong>{status}</strong>
        <button type="button" onClick={onRestart}>
          {running ? "Recommencer" : "Jouer"}
        </button>
      </div>

      <canvas ref={canvasRef} width="640" height="360" />
      <p className="game-help">{help}</p>
    </div>
  );
}
