# Energy Insights

A React Native and TypeScript mobile app, built with [Expo](https://expo.dev/), that charts U.S. electricity generation by fuel type and residential electricity prices by state. The data comes from the [EIA open data API](https://www.eia.gov/opendata/) and is fetched directly from the device. There is no backend.

<p align="center">
  <img src="docs/screenshot-dashboard.png" alt="Dashboard screen with four summary cards and a generation mix pie chart" width="320" />
</p>

The screenshot predates two changes: generation figures now cover individual fuels only, and prices cover the 50 states only. Its totals, pie legend and "States Reporting" count differ from what the current code shows.

## Screens

| Screen | Contents |
|---|---|
| Dashboard | Four summary cards (total generation, renewable share, mean of the state residential prices, number of states reporting a price) and a pie chart of the six largest fuels |
| Generation | Bar chart of net generation for the latest month, up to eight fuels, followed by a list of every charted fuel with its value in TWh and a badge on the renewable ones |
| Prices | Searchable `FlatList` of residential prices by state in cents per kWh, filtered by name or two-letter code. The default state from Settings is listed first and the rest follow by name. Tapping a row opens State Detail |
| State Detail | Line chart of the last 12 monthly residential prices for one state, with latest, average, minimum and maximum |
| Settings | Dark mode switch and a default-state picker |

## Running it

Requirements:

- Node.js 20.19.4 or later (the minimum that React Native 0.86 accepts)
- A free EIA API key from <https://www.eia.gov/opendata/register.php>
- [Expo Go](https://expo.dev/go) on a phone, or an iOS simulator or Android emulator

```bash
git clone https://github.com/calemccammon/react-native-energy-insights.git
cd react-native-energy-insights
npm install
cp .env.example .env.local   # then set EXPO_PUBLIC_EIA_API_KEY
npx expo start
```

Scan the QR code with Expo Go, or press `i` for the iOS simulator or `a` for the Android emulator.

`.env.local` is gitignored. Variables prefixed `EXPO_PUBLIC_` are compiled into the JavaScript bundle, so the key is readable by anyone who has a build of the app. If the key is missing, each data screen shows the error "EIA API key is not configured".

## How it works

```
EIA API v2   https://api.eia.gov/v2/electricity/
    |  axios, 15 s timeout
src/api/eiaClient.ts
    fetchGenerationRaw()        national monthly generation, all sectors
    fetchRetailPricesRaw()      residential price, newest 200 rows
    fetchStatePriceTrendRaw()   residential price, 12 months, one state
    buildGenerationStats() / buildStatePrices() / buildPriceTrend() / pinStateFirst()
    |  TanStack Query
src/hooks/  useGenerationMix / useRetailPrices / useStateDetail
    |
src/screens/  Dashboard / Generation / Prices / StateDetail / Settings
```

`eiaClient.ts` separates the HTTP calls from the transforms. The fetch functions return EIA rows unchanged. The `build*` functions are pure and produce the shapes the screens render. The trend is reversed into chronological order. The other two transforms also filter what EIA returns:

- `buildGenerationStats` converts thousand MWh to TWh and keeps the latest period. EIA returns aggregate rows (all fuels, fossil fuels, all renewables and similar) in the same list as individual fuels. The transform charts only the nine codes in `INDIVIDUAL_FUELS` (`NG`, `COL`, `NUC`, `WND`, `SUN`, `HYC`, `HPS`, `GEO`, `OTH`) and takes the total from EIA's `ALL` row. The renewable share is wind, solar, conventional hydro and geothermal divided by that total.
- `buildStatePrices` keeps the newest row with a price for each of the 50 states in `src/api/usStates.ts` and sorts by name. Rows for the U.S. total, census regions and the District of Columbia are dropped.

Each hook wraps one fetch and its transform in a `useQuery` with a one-hour stale time and a 24-hour garbage-collection time. The query client retries a failed request twice. Every screen renders a spinner while loading and the error message on failure.

Navigation is a native stack with two routes. The first is the bottom tab navigator (Dashboard, Generation, Prices, Settings) and the second is State Detail, which is pushed over the tabs and takes `stateid` and `stateDescription` as typed route params.

Dark mode and the default state live in a Zustand store (`src/store/useAppStore.ts`) that the `persist` middleware writes to AsyncStorage. `ThemeContext` reads the dark mode flag and provides one of two colour token sets from `src/theme/colors.ts`. Price rows are coloured green below 12¢, amber from 12¢ to 20¢ and red at 20¢ and above.

### EIA endpoints

| Endpoint | Query | Used for |
|---|---|---|
| `/v2/electricity/electric-power-operational-data/data/` | monthly `generation`, location `US`, sector `99`, newest 120 rows | Dashboard and Generation |
| `/v2/electricity/retail-sales/data/` | monthly `price`, sector `RES`, newest 200 rows | Dashboard and Prices |
| `/v2/electricity/retail-sales/data/` | monthly `price`, sector `RES`, one `stateid`, newest 12 rows | State Detail |

### Dependencies

| Purpose | Package |
|---|---|
| Framework | Expo SDK 57, React Native 0.86, React 19.2 |
| Language | TypeScript 6.0 with `strict` |
| Navigation | React Navigation 7 (bottom tabs, native stack) |
| Data fetching | TanStack Query 5, axios |
| State | Zustand 5 with the `persist` middleware |
| Charts | react-native-chart-kit (pie, bar and line) on react-native-svg |
| Unit tests | Jest 29 with the jest-expo preset, React Native Testing Library 14 |
| UI flows | Maestro |

### Layout

```
App.tsx                  QueryClientProvider, ThemeProvider, NavigationContainer
src/
  api/eiaClient.ts       EIA requests and transforms
  api/types.ts           response types, fuel labels and colours
  api/usStates.ts        the 50 states and their two-letter codes
  components/            SummaryCard, GenerationChart, PriceListItem, LoadingSpinner
  hooks/                 one TanStack Query hook per data set
  navigation/            root stack, tab navigator, route param types
  screens/               the five screens
  store/useAppStore.ts   Zustand store
  theme/                 colour tokens and ThemeContext
__tests__/               Jest tests (api, components, hooks, store)
e2e/                     Maestro flows
.github/workflows/       unit-tests.yml, e2e-tests.yml
```

## Testing

```bash
npm test
```

The Jest suite has 36 tests in 7 files. They cover the transforms and query-string builder in `eiaClient.ts` (including a generation fixture that mixes aggregate and individual fuel rows), three components (`SummaryCard`, `PriceListItem`, `LoadingSpinner`), the success, error and loading states of `useGenerationMix` and `useRetailPrices`, and the store's actions and persistence. No API key or network access is needed. The fetch functions, the screens, `GenerationChart` and `useStateDetail` have no unit tests.

`npx tsc --noEmit` type-checks the source and the tests. CI does not run it.

`unit-tests.yml` runs the suite with coverage on pushes to `main` and `develop` and on pull requests to `main`.

### Maestro flows

`e2e/` holds five Maestro flows, one per screen. They use the app id `host.exp.exponent`, so they drive the project inside Expo Go and need it already open there on a simulator or device. They also need a working EIA key, because they assert on live data.

```bash
maestro test e2e/dashboard.yaml
for f in e2e/*.yaml; do maestro test "$f"; done
```

`e2e-tests.yml` runs the flows on a macOS runner with an iOS simulator. It reads the API key from the repository secret `EXPO_PUBLIC_EIA_API_KEY`. It is triggered manually (`workflow_dispatch`) only. Its single run, on the first push to `main`, failed, and the push trigger was then removed. The flows have not passed in CI.

## Limitations

- The charted fuels do not add up to the total. The total is EIA's all-fuels figure, and fuels outside the nine charted codes (petroleum and biomass, for example) appear in it but not in the charts. Biomass is also absent from the renewable share.
- The list of individual fuel codes is fixed in `src/api/types.ts`. A code EIA reports that is not in the list is ignored.
- The average price on the Dashboard is an unweighted mean of the state prices, so it differs from the national average price.
- Settings persist only where the AsyncStorage 3.x native module is in the binary. The project installs `@react-native-async-storage/async-storage` 3.1.1, while Expo SDK 57 pins 2.2.0 in `bundledNativeModules.json`. When the module is missing, which is expected in Expo Go, the store keeps settings in memory for the session.
- `e2e-tests.yml` has never passed, as described above.

## Data

Data is from the U.S. Energy Information Administration (EIA) API v2.
