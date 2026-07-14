import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface SummaryCardProps {
  label: string;
  value: string;
  subtext?: string;
  accentColor?: string;
  testID?: string;
}

export function SummaryCard({ label, value, subtext, accentColor, testID }: SummaryCardProps) {
  const colors = useTheme();
  return (
    <View
      testID={testID}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={[styles.accent, { backgroundColor: accentColor ?? colors.primary }]} />
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      {subtext ? (
        <Text style={[styles.subtext, { color: colors.textSecondary }]}>{subtext}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    flex: 1,
    minWidth: 140,
    overflow: 'hidden',
  },
  accent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  value: {
    fontSize: 26,
    fontWeight: '700',
    marginTop: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtext: {
    fontSize: 11,
    marginTop: 2,
  },
});
