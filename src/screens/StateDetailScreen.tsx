import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useStateDetail } from '../hooks/useStateDetail';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useTheme } from '../theme/ThemeContext';
import type { RootStackParamList } from '../navigation/types';

type StateDetailRouteProp = RouteProp<RootStackParamList, 'StateDetail'>;

const screenWidth = Dimensions.get('window').width;

export default function StateDetailScreen() {
  const colors = useTheme();
  const route = useRoute<StateDetailRouteProp>();
  const { stateid, stateDescription } = route.params;
  const { data, isLoading, isError, error } = useStateDetail(stateid);

  if (isLoading) return <LoadingSpinner message={`Loading ${stateDescription} prices...`} />;

  if (isError || !data || data.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          {error?.message ?? `No price data available for ${stateDescription}.`}
        </Text>
      </View>
    );
  }

  const latestPrice = data[data.length - 1].price;
  const minPrice = Math.min(...data.map((d) => d.price));
  const maxPrice = Math.max(...data.map((d) => d.price));
  const avgPrice = data.reduce((s, d) => s + d.price, 0) / data.length;

  const chartData = {
    labels: data.map((d) => {
      const [, month] = d.period.split('-');
      return month ?? d.period;
    }),
    datasets: [
      {
        data: data.map((d) => d.price),
        color: (opacity = 1) => `rgba(29, 78, 216, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    color: (opacity = 1) => `rgba(29, 78, 216, ${opacity})`,
    labelColor: () => colors.textSecondary,
    propsForDots: { r: '4', strokeWidth: '2', stroke: colors.primary },
    decimalPlaces: 1,
    propsForLabels: { fontSize: 10 },
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
    >
      <Text style={[styles.title, { color: colors.text }]}>Residential Electricity Price</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {stateDescription} · Last 12 months · ¢/kWh
      </Text>

      <LineChart
        testID="price-trend-chart"
        data={chartData}
        width={screenWidth - 32}
        height={220}
        chartConfig={chartConfig}
        bezier
        yAxisLabel=""
        yAxisSuffix="¢"
        style={styles.chart}
      />

      {/* Stats row */}
      <View style={styles.statsRow}>
        {[
          { label: 'Latest', value: `${latestPrice.toFixed(1)}¢` },
          { label: 'Average', value: `${avgPrice.toFixed(1)}¢` },
          { label: 'Min', value: `${minPrice.toFixed(1)}¢` },
          { label: 'Max', value: `${maxPrice.toFixed(1)}¢` },
        ].map(({ label, value }) => (
          <View key={label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 18, fontWeight: '700' },
  subtitle: { fontSize: 12, marginBottom: 16, marginTop: 2 },
  chart: { borderRadius: 12, marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 8 },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  statValue: { fontSize: 16, fontWeight: '700' },
  statLabel: { fontSize: 11, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  errorText: { fontSize: 14, textAlign: 'center' },
});
