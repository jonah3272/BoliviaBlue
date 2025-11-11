# Bolivia Blue con Paz

A modern dashboard that tracks Bolivia's blue market exchange rate under President Rodrigo Paz. The application provides live exchange rate tracking, historical data visualization, and curated news analysis to help understand market movements.

![Bolivia Blue con Paz](https://img.shields.io/badge/status-production-green)

## Features

- **Live Exchange Rates**: Real-time buy and sell rates from Binance P2P (USDT/BOB)
- **Historical Charts**: Interactive time-series visualizations with 1D, 1W, 1M, 1Y, and All-time views
- **News Feed**: Curated headlines from Bolivian media with sentiment analysis
- **Dark Mode**: Full light/dark theme support with system preference detection
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Accessibility**: WCAG AA compliant with proper ARIA labels and keyboard navigation

## Tech Stack

### Frontend
- **React 18** with functional components and hooks
- **Vite** for fast development and optimized production builds
- **Tailwind CSS** for utility-first styling with custom brand theme
- **Recharts** for interactive data visualizations

### Backend
- **Node.js 20** with ESM modules
- **Express** for REST API
- **SQLite** (better-sqlite3) for time-series and news storage
- **node-fetch** for HTTP requests to Binance P2P API

### Data Collection
- **Binance P2P API**: Fetches USDT/BOB market data every 15 minutes
- **RSS Feeds**: Parses news from major Bolivian sources
- **In-process Scheduler**: setInterval-based job system for periodic refreshes

## Architecture

The application uses a simple but robust architecture:

1. **Scheduler** runs every 15 minutes to:
   - Fetch buy/sell offers from Binance P2P
   - Calculate median rates to reduce outlier impact
   - Store time-series data in SQLite
   - Parse news feeds from configured sources
   - Classify news sentiment using keyword analysis

2. **API Layer** serves:
   - `/api/blue-rate` - Current buy/sell rates with staleness indicators
   - `/api/blue-history?range=1W` - Historical data for chart rendering
   - `/api/news` - Recent headlines with sentiment tags
   - `/api/health` - System status and metadata

3. **Frontend** features:
   - Rate cards with real-time updates and fade animations
   - Multi-range chart with responsive design
   - News feed with source attribution and time formatting
   - Theme toggle with localStorage persistence

## Why Proxy Binance P2P?

We use Binance P2P data as a proxy for Bolivia's blue market rate because:

1. **Transparency**: Binance P2P offers are publicly visible and auditable
2. **Liquidity**: High trading volume provides reliable price discovery
3. **Real-time**: Prices update continuously reflecting market sentiment
4. **Accessibility**: USDT/BOB pairs are actively traded by Bolivians

The median calculation helps filter outliers and provides a stable reference point.

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm 9 or higher

### Local Development

1. Clone the repository:

```bash
git clone <repository-url>
cd bolivia-blue-con-paz
```

2. Install dependencies:

```bash
npm run install:all
```

3. Create environment file:

Create `backend/.env` based on `backend/.env.example`:

```env
PORT=3000
ORIGIN=http://localhost:5173
BLUE_SAMPLE_SIZE=20
NEWS_SOURCES=https://eldeber.com.bo/rss,https://www.paginasiete.bo/rss
```

4. Start development servers:

```bash
npm run dev
```

This runs:
- Backend on http://localhost:3000
- Frontend on http://localhost:5173 (with API proxy to backend)

The frontend automatically proxies `/api/*` requests to the backend.

### Production Build

1. Build the frontend:

```bash
npm run build
```

2. Start the production server:

```bash
npm start
```

The backend will serve the built frontend from `/frontend/dist` on port 3000.

## Docker Deployment

### Build the image:

```bash
docker build -t bolivia-blue:latest .
```

### Run the container:

```bash
docker run -d \
  -p 3000:3000 \
  -e PORT=3000 \
  -e NEWS_SOURCES="https://eldeber.com.bo/rss,https://www.paginasiete.bo/rss" \
  --name bolivia-blue \
  bolivia-blue:latest
```

The application will be available at http://localhost:3000

## Deployment Options

### Long-lived VM (DigitalOcean, AWS EC2, etc.)

1. Provision a Ubuntu 22.04 VM with at least 1GB RAM
2. Install Node.js 20 and npm
3. Clone the repository and install dependencies
4. Set up environment variables
5. Use PM2 or systemd to keep the server running:

```bash
npm install -g pm2
pm2 start backend/server.js --name bolivia-blue
pm2 save
pm2 startup
```

6. Configure nginx as a reverse proxy with SSL (certbot)

### Vercel / Cloudflare Pages

For serverless deployment:

1. Deploy frontend to Vercel/Cloudflare Pages
2. Deploy backend to Vercel Serverless Functions or Cloudflare Workers
3. Note: SQLite needs to be replaced with a hosted database (Turso, PlanetScale, etc.)
4. Configure CORS and environment variables appropriately

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Backend server port |
| `ORIGIN` | `*` | CORS allowed origin (set to frontend URL in production) |
| `BLUE_SAMPLE_SIZE` | `20` | Number of P2P offers to fetch per side |
| `NEWS_SOURCES` | See .env.example | Comma-separated RSS feed URLs |

## Job Schedule

- **Blue Rate Refresh**: Every 15 minutes
- **News Refresh**: Every 15 minutes
- **Frontend Auto-refresh**: Rate cards update every 60 seconds, news every 5 minutes

## Data Caveats

**Important**: This application tracks the informal/parallel market exchange rate, not official rates from Banco Central de Bolivia. The data should be used for informational purposes only and does not constitute financial advice.

- Rates reflect Binance P2P USDT/BOB offers, which may differ from street exchange rates
- News sentiment is algorithmically classified and may not always be accurate
- Historical data is only as reliable as the collection system's uptime
- A "stale" badge appears if data is older than 45 minutes

## Testing

Run backend unit tests:

```bash
npm test
```

This runs Node.js native test runner on median calculation logic.

## Project Structure

```
bolivia-blue-con-paz/
├── backend/
│   ├── server.js           # Express app and routes
│   ├── db.js               # SQLite schema and queries
│   ├── p2pClient.js        # Binance P2P fetcher
│   ├── newsClient.js       # RSS parser and sentiment classifier
│   ├── scheduler.js        # 15-minute refresh jobs
│   ├── median.js           # Statistical utilities
│   ├── package.json
│   └── tests/
│       └── median.test.js
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page layouts
│   │   ├── contexts/       # Theme context
│   │   ├── utils/          # API and formatters
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   │   └── favicon.svg
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── Dockerfile
├── package.json            # Root scripts
└── README.md
```

## Brand Theme

The design follows a "calm clarity amid volatility" aesthetic inspired by Bloomberg and Kalshi:

- **Colors**:
  - Base background: `#F9FAFB`
  - Text primary: `#1F2937`
  - Accent red: `#EF4444` (sell/downward)
  - Accent yellow: `#FBBF24` (warning/stale)
  - Accent green: `#10B981` (buy/upward)

- **Typography**:
  - UI text: Inter
  - Numeric values: Space Mono

- **Motion**: 1-second ease-out fade on data updates

## Contributing

Contributions are welcome! Please ensure:

1. Code follows existing style conventions
2. Tests pass before submitting PRs
3. New features include appropriate documentation

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Exchange rate data sourced from Binance P2P public API
- News aggregated from Bolivian media outlets
- Built with transparency for the Bolivian people

---

**Disclaimer**: This is an informational tool tracking informal market data. It does not provide financial advice, and users should conduct their own research before making financial decisions.

