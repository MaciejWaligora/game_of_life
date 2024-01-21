import { createRef, useEffect, useState } from 'react';
import './GameOflife.css';
import { FrameCounter } from '../components/Frame_Counter';
import { GameArena, GameArenaConfig } from '../components/Game_arena';

function GameOflife(props: { width: number, height: number, resolution: number, gridColor: string, deadTileColor: string, aliveTileColor: string }) {
  const frameCounterRef = createRef<FrameCounter>();
  const gameArenaRef = createRef<GameArena>();
  const [gameConfig, setGameConfig] = useState<GameArenaConfig | null>(null);

  useEffect(() => {
    const config: GameArenaConfig = {
      width: props.width,
      height: props.height,
      resolution: props.resolution,
      fpsCounter: frameCounterRef.current as FrameCounter,
      gridColor: props.gridColor,
      deadTileColor: props.deadTileColor,
      aliveTileColor: props.aliveTileColor
    };
    setGameConfig(config);
  }, []);

  return (
    <div className="GameOflife">
      <div className="top_bar" style={{ width: gameConfig?.width }}>
        <div className="frame_counter_container">
          <FrameCounter ref={frameCounterRef} />
        </div>
        <div className="controls_container">
          <button className="play_button" onClick={
            () => { gameArenaRef.current?.play() }
          }>Start</button>
          <button className="stop_button" onClick={
            () => { gameArenaRef.current?.stop() }
          }>Stop</button>
          <button className="restart_button" onClick={
            () => { gameArenaRef.current?.restartGame() }
          }>Restart</button>
        </div>
      </div>
      <div className="display_container">
        {gameConfig && <GameArena ref={gameArenaRef} {...gameConfig} />}
      </div>
    </div >
  );
}

export default GameOflife;
