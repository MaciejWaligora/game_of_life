import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import GameOflife from './app/GameOflife';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <GameOflife />
  </React.StrictMode>
);
