import React, { createRef, useEffect, useState} from 'react';
import './App.css';
import { FrameCounter } from '../components/Frame_Counter';
import { GameArena, GameArenaConfig } from '../components/Game_arena';

function App() {
  const frameCounterRef = createRef<FrameCounter>();
  const gameArenaRef = createRef<GameArena>();
  const [gameConfig, setGameConfig] = useState<GameArenaConfig | null>(null);

  useEffect(() => {
    // This useEffect runs once after the components are mounted
    const config: GameArenaConfig = {
      width: 800,
      height: 600,
      resolution: 80,
      fpsCounter: frameCounterRef.current as FrameCounter,
    };

    // Update the state with the configuration
    setGameConfig(config);
  }, []);
  return (
    <div className="App">
      <FrameCounter ref={frameCounterRef}/>
      {gameConfig && <GameArena ref={gameArenaRef} {...gameConfig} />}
      <button onClick={
        ()=>{gameArenaRef.current?.play()}
        }>Start</button>
    </div>
  );
}

export default App;
