import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useRetailPrices } from '../hooks/useRetailPrices';
import { PriceListItem } from '../components/PriceListItem';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useTheme } from '../theme/ThemeContext';
import type { StatePrice } from '../api/types';

type PricesNav = NativeStackNavigationProp<RootStackParamList>;

export default function PricesScreen() {
  const colors = useTheme();
  const navigation = useNavigation<PricesNav>();
  const { data, isLoading, isError, error } = useRetailPrices();
  const [query, setQuery] = useState('');

  const filtered = (data ?? []).filter(
    (s) =>
      s.stateDescription.toLowerCase().includes(query.toLowerCase()) ||
      s.stateid.toLowerCase().includes(query.toLowerCase())
  );

  function handlePress(item: StatePrice) {
    navigation.navigate('StateDetail', {
      stateid: item.stateid,
      stateDescription: item.stateDescription,
    });
  }

  if (isLoading) return <LoadingSpinner message="Loading state prices..." />;

  if (isError) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          {error?.message ?? 'Failed to load price data.'}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Search bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TextInput
          testID="search-input"
          style={[styles.searchInput, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
          placeholder="Search state..."
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          clearButtonMode="while-editing"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={[styles.count, { color: colors.textSecondary }]}>
          {filtered.length} states
        </Text>
      </View>

      <FlatList
        testID="prices-list"
        data={filtered}
        keyExtractor={(item) => item.stateid}
        renderItem={({ item }) => (
          <PriceListItem
            testID={`price-item-${item.stateid}`}
            item={item}
            onPress={handlePress}
          />
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No states match "{query}"
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 14,
  },
  count: { fontSize: 12 },
  errorText: { fontSize: 14, textAlign: 'center' },
  emptyText: { fontSize: 14 },
});
