import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { PriceListItem } from '../../src/components/PriceListItem';
import type { StatePrice } from '../../src/api/types';

jest.mock('../../src/theme/ThemeContext', () => ({
  useTheme: () => ({
    surface: '#fff',
    border: '#e2e8f0',
    primary: '#1d4ed8',
    text: '#0f172a',
    textSecondary: '#64748b',
    renewable: '#16a34a',
    fossil: '#dc2626',
  }),
}));

const sampleItem: StatePrice = {
  stateid: 'CA',
  stateDescription: 'California',
  price: 25.4,
  period: '2024-06',
};

describe('PriceListItem', () => {
  it('renders state code and name', async () => {
    await render(<PriceListItem item={sampleItem} onPress={jest.fn()} />);
    expect(screen.getByText('CA')).toBeTruthy();
    expect(screen.getByText('California')).toBeTruthy();
  });

  it('renders formatted price', async () => {
    await render(<PriceListItem item={sampleItem} onPress={jest.fn()} />);
    expect(screen.getByText('25.4¢')).toBeTruthy();
  });

  it('calls onPress with the item when tapped', async () => {
    const handlePress = jest.fn();
    await render(<PriceListItem testID="item-CA" item={sampleItem} onPress={handlePress} />);
    fireEvent.press(screen.getByTestId('item-CA'));
    expect(handlePress).toHaveBeenCalledWith(sampleItem);
  });

  it('renders period text', async () => {
    await render(<PriceListItem item={sampleItem} onPress={jest.fn()} />);
    expect(screen.getByText('2024-06')).toBeTruthy();
  });
});
