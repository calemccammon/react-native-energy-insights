import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore, appStorage } from '../../src/store/useAppStore';

const STORE_KEY = 'energy-insights-store';

beforeEach(() => {
  useAppStore.setState(useAppStore.getInitialState(), true);
  jest.clearAllMocks();
});

describe('useAppStore', () => {
  it('starts with light mode and California selected', () => {
    const state = useAppStore.getInitialState();
    expect(state.isDarkMode).toBe(false);
    expect(state.selectedState).toBe('CA');
  });

  it('toggleDarkMode flips isDarkMode', () => {
    useAppStore.getState().toggleDarkMode();
    expect(useAppStore.getState().isDarkMode).toBe(true);
    useAppStore.getState().toggleDarkMode();
    expect(useAppStore.getState().isDarkMode).toBe(false);
  });

  it('setSelectedState updates selectedState', () => {
    useAppStore.getState().setSelectedState('NY');
    expect(useAppStore.getState().selectedState).toBe('NY');
  });

  it('setSelectedState does not change isDarkMode', () => {
    useAppStore.getState().toggleDarkMode();
    useAppStore.getState().setSelectedState('TX');
    expect(useAppStore.getState().isDarkMode).toBe(true);
    expect(useAppStore.getState().selectedState).toBe('TX');
  });

  it('writes the settings to AsyncStorage when they change', () => {
    useAppStore.getState().setSelectedState('TX');

    const calls = (AsyncStorage.setItem as jest.Mock).mock.calls;
    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toBe(STORE_KEY);
    expect(JSON.parse(calls[0][1]).state).toEqual({ selectedState: 'TX', isDarkMode: false });
  });

  it('restores the settings from AsyncStorage', async () => {
    await AsyncStorage.setItem(
      STORE_KEY,
      JSON.stringify({ state: { selectedState: 'OR', isDarkMode: true }, version: 0 })
    );

    await useAppStore.persist.rehydrate();

    expect(useAppStore.getState().selectedState).toBe('OR');
    expect(useAppStore.getState().isDarkMode).toBe(true);
  });
});

describe('appStorage', () => {
  it('falls back to memory when AsyncStorage rejects', async () => {
    const unavailable = new Error('Native module is null');
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(unavailable);
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(unavailable);

    await appStorage.setItem('fallback-key', 'kept');

    await expect(appStorage.getItem('fallback-key')).resolves.toBe('kept');
  });
});
