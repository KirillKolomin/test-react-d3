import React from 'react';
import { render, screen } from '@testing-library/react';
import ValuesPanel from "./ValuesPanel";

test('renders learn react link', () => {
    render(<ValuesPanel values={[]} onValueRemove={() => {}} onNewValueAdd={() => {}} />);
    const linkElement = screen.getByText(/learn react/i);
    expect(linkElement).toBeInTheDocument();
});
