import React from 'react';
import { render, screen } from '@testing-library/react';
import LineChart from "./LineChart";

test('renders learn react link', () => {
  render(<LineChart values={[]} />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
