import React from 'react';
import { render, screen } from '@testing-library/react';
import ShiftingPanel from "./ShiftingPanel";

test('renders learn react link', () => {
  render(<ShiftingPanel direction="left" />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
