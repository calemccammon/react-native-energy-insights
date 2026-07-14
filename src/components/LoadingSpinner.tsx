import React from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface LoadingSpinnerProps {
  message?: string;
  testID?: string;
}

export function LoadingSpinner({ message, testID }: LoadingSpinnerProps) {
  const colors = useTheme();
  return (
    <View testID={testID ?? 'loading-spinner'} style={styles.container}>
      <ActivityIndicator testID="activity-indicator" size="large" color={colors.primary} />
      {message ? (
        <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  message: {
    fontSize: 14,
  },
});
