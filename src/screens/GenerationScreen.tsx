import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useGenerationMix } from '../hooks/useGenerationMix';
import { GenerationChart } from '../components/GenerationChart';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useTheme } from '../theme/ThemeContext';
import { RENEWABLE_FUELS } from '../api/types';
import type { FuelTypeId } from '../api/types';

export default function GenerationScreen() {
  const colors = useTheme();
  const { data, isLoading, isError, error } = useGenerationMix();

  if (isLoading) return <LoadingSpinner message="Loading generation data..." />;

  if (isError) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          {error?.message ?? 'Failed to load generation data.'}
        </Text>
      </View>
    );
  }

  const stats = data!;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
    >
      <Text style={[styles.title, { color: colors.text }]}>Generation by Fuel Type</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {stats.period} · Thousand TWh · All Sectors · United States
      </Text>

      <GenerationChart data={stats.byFuel} maxBars={8} />

      {/* Legend */}
      <Text style={[styles.sectionLabel, { color: colors.text }]}>Fuel Type Legend</Text>
      {stats.byFuel.map((item) => (
        <View
          key={item.fuelType}
          style={[styles.legendRow, { borderBottomColor: colors.border }]}
        >
          <View style={[styles.dot, { backgroundColor: item.color }]} />
          <Text style={[styles.legendName, { color: colors.text }]}>{item.label}</Text>
          <View style={styles.spacer} />
          <Text style={[styles.legendValue, { color: colors.textSecondary }]}>
            {item.generationTwh.toFixed(1)} TWh
          </Text>
          {(RENEWABLE_FUELS as FuelTypeId[]).includes(item.fuelType) && (
            <View style={[styles.badge, { backgroundColor: colors.successLight }]}>
              <Text style={[styles.badgeText, { color: colors.renewable }]}>renewable</Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 18, fontWeight: '700' },
  subtitle: { fontSize: 12, marginBottom: 16, marginTop: 2 },
  sectionLabel: { fontSize: 15, fontWeight: '600', marginTop: 24, marginBottom: 8 },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  legendName: { fontSize: 14 },
  spacer: { flex: 1 },
  legendValue: { fontSize: 13, marginRight: 8 },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  errorText: { fontSize: 14, textAlign: 'center' },
});
