import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders home page content', () => {
  render(<App />);
  expect(screen.getByText(/welcome to myapp/i)).toBeInTheDocument();
});
