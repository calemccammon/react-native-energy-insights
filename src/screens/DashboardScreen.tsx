import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useGenerationMix } from '../hooks/useGenerationMix';
import { useRetailPrices } from '../hooks/useRetailPrices';
import { SummaryCard } from '../components/SummaryCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useTheme } from '../theme/ThemeContext';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  const colors = useTheme();
  const generation = useGenerationMix();
  const prices = useRetailPrices();

  const isLoading = generation.isLoading || prices.isLoading;
  const hasError = generation.isError || prices.isError;

  if (isLoading) return <LoadingSpinner message="Fetching energy data..." />;

  if (hasError) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          {generation.error?.message ?? prices.error?.message ?? 'Failed to load data.'}
        </Text>
      </View>
    );
  }

  const stats = generation.data!;
  const statePrices = prices.data!;
  const avgPrice =
    statePrices.length > 0
      ? statePrices.reduce((s, p) => s + p.price, 0) / statePrices.length
      : 0;

  const pieData = stats.byFuel
    .filter((f) => f.generationTwh > 0)
    .slice(0, 6)
    .map((f) => ({
      name: f.label,
      population: parseFloat(f.generationTwh.toFixed(1)),
      color: f.color,
      legendFontColor: colors.textSecondary,
      legendFontSize: 11,
    }));

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
    >
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        U.S. Electricity Overview
      </Text>
      <Text style={[styles.period, { color: colors.textSecondary }]}>
        {stats.period ? `Period: ${stats.period}` : ''}
      </Text>

      {/* Summary cards */}
      <View style={styles.row}>
        <SummaryCard
          testID="card-total-generation"
          label="Total Generation"
          value={`${stats.totalTwh.toFixed(0)} TWh`}
          accentColor={colors.primary}
        />
        <View style={{ width: 12 }} />
        <SummaryCard
          testID="card-renewable-pct"
          label="Renewable"
          value={`${stats.renewablePct.toFixed(1)}%`}
          subtext={`${stats.renewableTwh.toFixed(0)} TWh`}
          accentColor={colors.renewable}
        />
      </View>
      <View style={[styles.row, { marginTop: 12 }]}>
        <SummaryCard
          testID="card-avg-price"
          label="Avg Residential Price"
          value={`${avgPrice.toFixed(1)}¢`}
          subtext="per kWh"
          accentColor="#f59e0b"
        />
        <View style={{ width: 12 }} />
        <SummaryCard
          testID="card-states"
          label="States Reporting"
          value={`${statePrices.length}`}
          accentColor={colors.neutral}
        />
      </View>

      {/* Generation mix pie chart */}
      <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
        Generation Mix
      </Text>
      {pieData.length > 0 && (
        <PieChart
          data={pieData}
          width={screenWidth - 32}
          height={200}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="8"
          chartConfig={{
            color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
            labelColor: () => colors.textSecondary,
          }}
          hasLegend
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  row: {
    flexDirection: 'row',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  period: {
    fontSize: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
