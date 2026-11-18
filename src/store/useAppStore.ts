import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
  /** Two-letter state code selected by the user as their default (shown first in Prices). */
  selectedState: string;
  /** Dark mode toggle. */
  isDarkMode: boolean;

  setSelectedState: (state: string) => void;
  toggleDarkMode: () => void;
}

// AsyncStorage rejects every call when its native module is not in the binary.
// Expo SDK 57 pins the 2.x native module while this project installs the 3.x
// package, so Expo Go is expected to lack it. The in-memory copy keeps the
// settings working for the session when that happens.
const memStore: Record<string, string> = {};
export const appStorage: StateStorage = {
  getItem: async (key) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return memStore[key] ?? null;
    }
  },
  setItem: async (key, value) => {
    memStore[key] = value;
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      // kept in memStore only
    }
  },
  removeItem: async (key) => {
    delete memStore[key];
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // nothing to remove from device storage
    }
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedState: 'CA',
      isDarkMode: false,
      setSelectedState: (selectedState) => set({ selectedState }),
      toggleDarkMode: () => set((s) => ({ isDarkMode: !s.isDarkMode })),
    }),
    {
      name: 'energy-insights-store',
      storage: createJSONStorage(() => appStorage),
      partialize: (state) => ({
        selectedState: state.selectedState,
        isDarkMode: state.isDarkMode,
      }),
    }
  )
);
