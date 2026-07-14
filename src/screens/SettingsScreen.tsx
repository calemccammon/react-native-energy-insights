import React from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme/ThemeContext';

const US_STATES = [
  { id: 'AL', name: 'Alabama' }, { id: 'AK', name: 'Alaska' }, { id: 'AZ', name: 'Arizona' },
  { id: 'AR', name: 'Arkansas' }, { id: 'CA', name: 'California' }, { id: 'CO', name: 'Colorado' },
  { id: 'CT', name: 'Connecticut' }, { id: 'DE', name: 'Delaware' }, { id: 'FL', name: 'Florida' },
  { id: 'GA', name: 'Georgia' }, { id: 'HI', name: 'Hawaii' }, { id: 'ID', name: 'Idaho' },
  { id: 'IL', name: 'Illinois' }, { id: 'IN', name: 'Indiana' }, { id: 'IA', name: 'Iowa' },
  { id: 'KS', name: 'Kansas' }, { id: 'KY', name: 'Kentucky' }, { id: 'LA', name: 'Louisiana' },
  { id: 'ME', name: 'Maine' }, { id: 'MD', name: 'Maryland' }, { id: 'MA', name: 'Massachusetts' },
  { id: 'MI', name: 'Michigan' }, { id: 'MN', name: 'Minnesota' }, { id: 'MS', name: 'Mississippi' },
  { id: 'MO', name: 'Missouri' }, { id: 'MT', name: 'Montana' }, { id: 'NE', name: 'Nebraska' },
  { id: 'NV', name: 'Nevada' }, { id: 'NH', name: 'New Hampshire' }, { id: 'NJ', name: 'New Jersey' },
  { id: 'NM', name: 'New Mexico' }, { id: 'NY', name: 'New York' }, { id: 'NC', name: 'North Carolina' },
  { id: 'ND', name: 'North Dakota' }, { id: 'OH', name: 'Ohio' }, { id: 'OK', name: 'Oklahoma' },
  { id: 'OR', name: 'Oregon' }, { id: 'PA', name: 'Pennsylvania' }, { id: 'RI', name: 'Rhode Island' },
  { id: 'SC', name: 'South Carolina' }, { id: 'SD', name: 'South Dakota' }, { id: 'TN', name: 'Tennessee' },
  { id: 'TX', name: 'Texas' }, { id: 'UT', name: 'Utah' }, { id: 'VT', name: 'Vermont' },
  { id: 'VA', name: 'Virginia' }, { id: 'WA', name: 'Washington' }, { id: 'WV', name: 'West Virginia' },
  { id: 'WI', name: 'Wisconsin' }, { id: 'WY', name: 'Wyoming' },
];

export default function SettingsScreen() {
  const colors = useTheme();
  const { isDarkMode, toggleDarkMode, selectedState, setSelectedState } = useAppStore();

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
    >
      {/* Theme toggle */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>APPEARANCE</Text>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.text }]}>Dark Mode</Text>
          <Switch
            testID="dark-mode-toggle"
            value={isDarkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.textInverse}
          />
        </View>
      </View>

      {/* Default state picker */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 16 }]}>
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>DEFAULT STATE</Text>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          Shown first in the Prices list
        </Text>
        {US_STATES.map((state) => (
          <TouchableOpacity
            key={state.id}
            testID={`state-option-${state.id}`}
            style={[
              styles.stateRow,
              { borderBottomColor: colors.border },
              selectedState === state.id && { backgroundColor: colors.primaryLight },
            ]}
            onPress={() => setSelectedState(state.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.stateCode, { color: colors.primary }]}>{state.id}</Text>
            <Text style={[styles.stateName, { color: colors.text }]}>{state.name}</Text>
            {selectedState === state.id && (
              <Text style={[styles.check, { color: colors.primary }]}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Data attribution */}
      <Text style={[styles.attribution, { color: colors.textSecondary }]}>
        Data source: U.S. Energy Information Administration (EIA) API v2.
        {'\n'}Updates are published monthly.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  section: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  label: { fontSize: 15 },
  hint: { fontSize: 12, paddingHorizontal: 16, paddingBottom: 8 },
  stateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  stateCode: { fontSize: 12, fontWeight: '700', width: 36 },
  stateName: { flex: 1, fontSize: 14 },
  check: { fontSize: 16, fontWeight: '700' },
  attribution: { fontSize: 11, textAlign: 'center', marginTop: 24, lineHeight: 17 },
});
