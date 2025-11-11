# Quick Start Guide

Get Bolivia Blue con Paz running locally in 5 minutes.

## Prerequisites

- Node.js 20+ ([download here](https://nodejs.org/))
- npm (comes with Node.js)

## Installation

```bash
# 1. Navigate to the project directory
cd "Bolivia Blue Con Paz"

# 2. Install all dependencies
npm run install:all

# 3. Create environment file
# Windows PowerShell:
Copy-Item backend\env.example.txt backend\.env

# Or manually create backend/.env with:
# PORT=3000
# ORIGIN=http://localhost:5173
# BLUE_SAMPLE_SIZE=20
# NEWS_SOURCES=https://eldeber.com.bo/rss,https://www.paginasiete.bo/rss

# 4. Start development servers
npm run dev
```

## Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api/health

## What Happens Next

1. The backend starts and immediately attempts to fetch data from Binance P2P
2. The SQLite database is created automatically (`backend/blue.db`)
3. Data refreshes every 15 minutes
4. The frontend auto-updates every 60 seconds

## First-Time Data Load

On first startup, it may take 10-30 seconds for the initial data to appear because:
- The scheduler needs to fetch from Binance P2P
- News feeds need to be parsed
- The database needs to be populated

## Testing

```bash
# Run backend tests
npm test

# Run frontend tests (when in frontend directory)
cd frontend
npm test
```

## Production Build

```bash
# Build frontend
npm run build

# Start production server
npm start
```

The production server runs on http://localhost:3000 and serves both API and frontend.

## Docker Quick Start

If you prefer Docker:

```bash
docker-compose up -d
```

Access at http://localhost:3000

## Troubleshooting

### "Module not found" errors
```bash
npm run install:all
```

### Port 3000 or 5173 already in use
Edit `backend/.env` and change `PORT=3000` to another port.

### No data appearing
1. Check your internet connection (needs access to Binance P2P API)
2. Wait 30 seconds for first data fetch
3. Check backend logs for errors

### SQLite errors on Windows
```bash
cd backend
npm rebuild better-sqlite3
```

## Next Steps

- Read the full [README.md](README.md) for detailed information
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- Review the code structure in the README

## Need Help?

- Check the logs: Backend terminal will show fetch status
- Verify the health endpoint: http://localhost:3000/api/health
- Check the browser console for frontend errors

---

Happy tracking! 📊🇧🇴

