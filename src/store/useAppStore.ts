import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AppState {
  /** Two-letter state code selected by the user as their default (shown first in Prices). */
  selectedState: string;
  /** Dark mode toggle — persisted across app restarts. */
  isDarkMode: boolean;

  setSelectedState: (state: string) => void;
  toggleDarkMode: () => void;
}

// Simple in-memory storage — works in Expo Go without native AsyncStorage module.
// For a production build, swap this for createJSONStorage(() => AsyncStorage).
const memStore: Record<string, string> = {};
const memoryStorage = {
  getItem: (key: string) => Promise.resolve(memStore[key] ?? null),
  setItem: (key: string, value: string) => { memStore[key] = value; return Promise.resolve(); },
  removeItem: (key: string) => { delete memStore[key]; return Promise.resolve(); },
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
      storage: createJSONStorage(() => memoryStorage),
      partialize: (state) => ({
        selectedState: state.selectedState,
        isDarkMode: state.isDarkMode,
      }),
    }
  )
);
