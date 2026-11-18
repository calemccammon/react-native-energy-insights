# Energy Insights

A React Native and TypeScript mobile app, built with [Expo](https://expo.dev/), that charts U.S. electricity generation by fuel type and residential electricity prices by state. The data comes from the [EIA open data API](https://www.eia.gov/opendata/) and is fetched directly from the device. There is no backend.

<p align="center">
  <img src="docs/screenshot-dashboard.png" alt="Dashboard screen with four summary cards and a generation mix pie chart" width="320" />
</p>

## Screens

| Screen | Contents |
|---|---|
| Dashboard | Four summary cards (total generation, renewable share, average residential price, number of areas reporting a price) and a pie chart of the six largest generation categories |
| Generation | Bar chart of net generation for the latest month, up to eight categories, followed by a list of every category with its value and a badge on the renewable ones |
| Prices | Searchable `FlatList` of residential prices in cents per kWh, filtered by name or two-letter code. Tapping a row opens State Detail |
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
    buildGenerationStats() / buildStatePrices() / buildPriceTrend()
    |  TanStack Query
src/hooks/  useGenerationMix / useRetailPrices / useStateDetail
    |
src/screens/  Dashboard / Generation / Prices / StateDetail / Settings
```

`eiaClient.ts` separates the HTTP calls from the transforms. The fetch functions return EIA rows unchanged. The `build*` functions are pure and produce the shapes the screens render: generation is converted from thousand MWh to TWh and reduced to the latest period, prices are reduced to the newest row per area and sorted by name, and the trend is reversed into chronological order.

Each hook wraps one fetch and its transform in a `useQuery` with a one-hour stale time and a 24-hour garbage-collection time. The query client retries a failed request twice. Every screen renders a spinner while loading and the error message on failure.

Navigation is a native stack with two routes. The first is the bottom tab navigator (Dashboard, Generation, Prices, Settings) and the second is State Detail, which is pushed over the tabs and takes `stateid` and `stateDescription` as typed route params.

Dark mode and the default state live in a Zustand store (`src/store/useAppStore.ts`). `ThemeContext` reads the dark mode flag and provides one of two colour token sets from `src/theme/colors.ts`. Price rows are coloured green below 12¢, amber from 12¢ to 20¢ and red at 20¢ and above.

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
  components/            SummaryCard, GenerationChart, PriceListItem, LoadingSpinner
  hooks/                 one TanStack Query hook per data set
  navigation/            root stack, tab navigator, route param types
  screens/               the five screens
  store/useAppStore.ts   Zustand store
  theme/                 colour tokens and ThemeContext
__tests__/               Jest tests (components, hooks, store)
e2e/                     Maestro flows
.github/workflows/       unit-tests.yml, e2e-tests.yml
```

## Testing

```bash
npm test
```

The Jest suite has 21 tests in 6 files. They cover three components (`SummaryCard`, `PriceListItem`, `LoadingSpinner`), the success, error and loading states of `useGenerationMix` and `useRetailPrices`, and the store actions. No API key or network access is needed. The hook tests mock the whole of `eiaClient.ts`, so the three `build*` transform functions, the screens, `GenerationChart` and `useStateDetail` have no unit tests.

`unit-tests.yml` runs the suite with coverage on pushes to `main` and `develop` and on pull requests to `main`.

### Maestro flows

`e2e/` holds five Maestro flows, one per screen. They use the app id `host.exp.exponent`, so they drive the project inside Expo Go and need it already open there on a simulator or device. They also need a working EIA key, because they assert on live data.

```bash
maestro test e2e/dashboard.yaml
for f in e2e/*.yaml; do maestro test "$f"; done
```

`e2e-tests.yml` runs the flows on a macOS runner with an iOS simulator. It is triggered manually (`workflow_dispatch`) only. Its single run, on the first push to `main`, failed, and the push trigger was then removed. The flows have not passed in CI.

## Limitations

- The generation totals are too high. The generation request does not filter by fuel type, and `buildGenerationStats` excludes only the `ALL` row. EIA also returns aggregate categories such as "fossil fuels" and "all renewables", and these are summed and charted together with the individual fuels. The screenshot above shows the effect in the pie legend. The total and the renewable share on the Dashboard are therefore not reliable figures.
- The Prices list is not limited to the 50 states. `buildStatePrices` keeps every area the endpoint returns except the `US` total, which gave 61 entries when the screenshot was taken. The average price on the Dashboard is an unweighted mean over those entries.
- The Generation screen subtitle labels the unit "Thousand TWh". The values are TWh.
- Settings are not kept across app restarts. The store uses the Zustand `persist` middleware with an in-memory storage object, chosen so that the app runs in Expo Go without the native AsyncStorage module. `@react-native-async-storage/async-storage` is installed but not used by the app.
- The default state chosen in Settings is stored but nothing reads it. The Prices list is always sorted by name.
- `npx tsc --noEmit` reports errors and CI does not run it. One error is in `src/screens/StateDetailScreen.tsx`, where a `testID` prop is passed to `LineChart` and the chart library's types do not declare it. The others are unresolved Jest globals in the test files.
- Both workflows read the key from a secret named `EIA_API_KEY`. The unit tests do not use it. The Maestro workflow does.

## Licence and data

MIT. See [LICENSE](LICENSE).

Data is from the U.S. Energy Information Administration (EIA) API v2.
