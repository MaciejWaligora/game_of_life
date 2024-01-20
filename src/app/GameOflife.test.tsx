import React from 'react';
import { render, screen } from '@testing-library/react';
import GameOflife from './GameOflife';

test('renders learn react link', () => {
  render(<GameOflife />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
