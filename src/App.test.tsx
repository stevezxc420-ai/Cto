import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders home page heading', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /welcome to/i })).toBeInTheDocument();
});
