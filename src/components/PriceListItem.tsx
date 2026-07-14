import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import type { StatePrice } from '../api/types';

interface PriceListItemProps {
  item: StatePrice;
  onPress: (item: StatePrice) => void;
  testID?: string;
}

export function PriceListItem({ item, onPress, testID }: PriceListItemProps) {
  const colors = useTheme();

  // Colour-code price: green < 12¢, amber 12–20¢, red > 20¢
  const priceColor =
    item.price < 12 ? colors.renewable :
    item.price < 20 ? '#f59e0b' :
    colors.fossil;

  return (
    <TouchableOpacity
      testID={testID}
      onPress={() => onPress(item)}
      style={[styles.row, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        <Text style={[styles.stateCode, { color: colors.primary }]}>{item.stateid}</Text>
        <Text style={[styles.stateName, { color: colors.text }]}>{item.stateDescription}</Text>
        <Text style={[styles.period, { color: colors.textSecondary }]}>{item.period}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.price, { color: priceColor }]}>
          {item.price.toFixed(1)}¢
        </Text>
        <Text style={[styles.unit, { color: colors.textSecondary }]}>per kWh</Text>
      </View>
      <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  left: {
    flex: 1,
  },
  stateCode: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  stateName: {
    fontSize: 15,
    fontWeight: '500',
  },
  period: {
    fontSize: 11,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
  },
  unit: {
    fontSize: 11,
  },
  chevron: {
    fontSize: 20,
    marginLeft: 4,
  },
});
