import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { useTheme } from '../theme/ThemeContext';
import type { GenerationSummary } from '../api/types';

interface GenerationChartProps {
  data: GenerationSummary[];
  /** Maximum number of bars to display (sorted by generation desc). */
  maxBars?: number;
  testID?: string;
}

const screenWidth = Dimensions.get('window').width;

export function GenerationChart({ data, maxBars = 6, testID }: GenerationChartProps) {
  const colors = useTheme();

  const displayData = data
    .filter((d) => d.generationTwh > 0)
    .slice(0, maxBars);

  const chartData = {
    labels: displayData.map((d) => d.label.split(' ')[0]), // first word only for brevity
    datasets: [
      {
        data: displayData.map((d) => parseFloat(d.generationTwh.toFixed(1))),
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    color: (opacity = 1) => `rgba(29, 78, 216, ${opacity})`,
    labelColor: () => colors.textSecondary,
    barPercentage: 0.6,
    decimalPlaces: 0,
    propsForLabels: { fontSize: 11 },
  };

  return (
    <View testID={testID ?? 'generation-chart'}>
      <BarChart
        data={chartData}
        width={screenWidth - 32}
        height={220}
        chartConfig={chartConfig}
        yAxisLabel=""
        yAxisSuffix=" TWh"
        fromZero
        showValuesOnTopOfBars
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    borderRadius: 12,
    marginVertical: 4,
  },
});
