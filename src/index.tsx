import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import GameOflife from './components/game-of-life/GameOflife';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const props = {
  width: 800,
  height: 600,
  resolution: 70,
  gridColor: '#888888',
  deadTileColor: '#666666',
  aliveTileColor: '#222222'
}
root.render(
  <React.StrictMode>
    <GameOflife {...props} />
  </React.StrictMode>
);
