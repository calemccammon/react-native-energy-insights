import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { LoadingSpinner } from '../../src/components/LoadingSpinner';

jest.mock('../../src/theme/ThemeContext', () => ({
  useTheme: () => ({
    background: '#f8fafc',
    textSecondary: '#64748b',
    primary: '#1d4ed8',
  }),
}));

describe('LoadingSpinner', () => {
  it('renders ActivityIndicator via testID', async () => {
    await render(<LoadingSpinner />);
    expect(screen.getByTestId('activity-indicator')).toBeTruthy();
  });

  it('renders message when provided', async () => {
    await render(<LoadingSpinner message="Loading energy data..." />);
    expect(screen.getByText('Loading energy data...')).toBeTruthy();
  });

  it('renders without message by default', async () => {
    await render(<LoadingSpinner />);
    expect(screen.queryByText('Loading energy data...')).toBeNull();
  });
});
