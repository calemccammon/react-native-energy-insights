import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { SummaryCard } from '../../src/components/SummaryCard';

jest.mock('../../src/theme/ThemeContext', () => ({
  useTheme: () => ({
    card: '#fff',
    border: '#e2e8f0',
    primary: '#1d4ed8',
    text: '#0f172a',
    textSecondary: '#64748b',
  }),
}));

describe('SummaryCard', () => {
  it('renders value and label', async () => {
    await render(<SummaryCard testID="card" value="42 TWh" label="Total Generation" />);
    expect(screen.getByText('42 TWh')).toBeTruthy();
    expect(screen.getByText('Total Generation')).toBeTruthy();
  });

  it('renders subtext when provided', async () => {
    await render(<SummaryCard value="30%" label="Renewable" subtext="18 TWh" />);
    expect(screen.getByText('18 TWh')).toBeTruthy();
  });

  it('does not render subtext when omitted', async () => {
    await render(<SummaryCard value="30%" label="Renewable" />);
    expect(screen.queryByText('18 TWh')).toBeNull();
  });

  it('applies testID to container', async () => {
    await render(<SummaryCard testID="my-card" value="5¢" label="Price" />);
    expect(screen.getByTestId('my-card')).toBeTruthy();
  });
});
