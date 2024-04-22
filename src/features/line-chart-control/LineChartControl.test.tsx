import React from 'react';
import { render, screen } from '@testing-library/react';
import {LineChartControl} from "./LineChartControl";

test('renders learn react link', () => {
  render(<LineChartControl />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
