import { useAppStore } from '../../src/store/useAppStore';

// Reset store between tests
beforeEach(() => {
  useAppStore.setState({ isDarkMode: false, selectedState: 'US' });
});

describe('useAppStore', () => {
  it('starts with default state', () => {
    const state = useAppStore.getState();
    expect(state.isDarkMode).toBe(false);
    expect(state.selectedState).toBe('US');
  });

  it('toggleDarkMode flips isDarkMode', () => {
    useAppStore.getState().toggleDarkMode();
    expect(useAppStore.getState().isDarkMode).toBe(true);
    useAppStore.getState().toggleDarkMode();
    expect(useAppStore.getState().isDarkMode).toBe(false);
  });

  it('setSelectedState updates selectedState', () => {
    useAppStore.getState().setSelectedState('CA');
    expect(useAppStore.getState().selectedState).toBe('CA');
  });

  it('setSelectedState does not change isDarkMode', () => {
    useAppStore.getState().toggleDarkMode();
    useAppStore.getState().setSelectedState('TX');
    expect(useAppStore.getState().isDarkMode).toBe(true);
    expect(useAppStore.getState().selectedState).toBe('TX');
  });
});
