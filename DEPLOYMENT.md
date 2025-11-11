# Deployment Guide

This document provides detailed instructions for deploying Bolivia Blue con Paz in various environments.

## Table of Contents

1. [Docker Deployment](#docker-deployment)
2. [Traditional VPS Deployment](#traditional-vps-deployment)
3. [Serverless Deployment](#serverless-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Monitoring and Maintenance](#monitoring-and-maintenance)

## Docker Deployment

### Using Docker Compose (Recommended)

The easiest way to deploy is using Docker Compose:

```bash
# Clone the repository
git clone <repo-url>
cd bolivia-blue-con-paz

# Start with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

The application will be available at http://localhost:3000

### Manual Docker Build

If you prefer to build and run manually:

```bash
# Build the image
docker build -t bolivia-blue:latest .

# Run the container
docker run -d \
  -p 3000:3000 \
  -e PORT=3000 \
  -e NEWS_SOURCES="https://eldeber.com.bo/rss" \
  -v $(pwd)/data:/app/data \
  --name bolivia-blue \
  bolivia-blue:latest

# Check logs
docker logs -f bolivia-blue

# Stop and remove
docker stop bolivia-blue
docker rm bolivia-blue
```

## Traditional VPS Deployment

For deployment on a VPS (DigitalOcean, AWS EC2, Linode, etc.):

### Prerequisites

- Ubuntu 22.04 LTS (or similar)
- At least 1GB RAM
- 10GB storage
- Domain name (optional but recommended)

### Step 1: Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install build essentials (required for better-sqlite3)
sudo apt install -y build-essential python3

# Verify installation
node --version  # Should be v20.x
npm --version   # Should be 9.x or higher
```

### Step 2: Application Setup

```bash
# Create application directory
sudo mkdir -p /var/www/bolivia-blue
sudo chown $USER:$USER /var/www/bolivia-blue
cd /var/www/bolivia-blue

# Clone repository
git clone <repo-url> .

# Install dependencies
npm run install:all

# Build frontend
npm run build

# Create environment file
cp backend/env.example.txt backend/.env
nano backend/.env  # Edit as needed
```

### Step 3: Process Manager (PM2)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start application
cd /var/www/bolivia-blue
pm2 start backend/server.js --name bolivia-blue

# Setup auto-restart on server reboot
pm2 startup
pm2 save

# Useful PM2 commands
pm2 status          # Check status
pm2 logs            # View logs
pm2 restart bolivia-blue
pm2 stop bolivia-blue
```

### Step 4: Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/bolivia-blue
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/bolivia-blue /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 5: SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal is configured automatically
# Test renewal
sudo certbot renew --dry-run
```

## Serverless Deployment

### Vercel Deployment

For Vercel deployment, some modifications are needed:

1. **Database**: Replace SQLite with a hosted solution:
   - [Turso](https://turso.tech/) - SQLite on the edge
   - [PlanetScale](https://planetscale.com/) - MySQL compatible
   - [Supabase](https://supabase.com/) - PostgreSQL

2. **Backend**: Convert to Vercel Serverless Functions

Create `api/` directory structure:

```
api/
├── blue-rate.js
├── blue-history.js
├── news.js
└── health.js
```

3. **Cron Jobs**: Use Vercel Cron Jobs or external service like:
   - [Cron-job.org](https://cron-job.org/)
   - [EasyCron](https://www.easycron.com/)
   - GitHub Actions

4. **Deploy**:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

### Cloudflare Pages + Workers

Similar to Vercel, but uses Cloudflare Workers for backend:

1. Use Cloudflare D1 (SQLite) for database
2. Deploy frontend to Cloudflare Pages
3. Deploy backend functions as Workers
4. Use Cloudflare Cron Triggers for scheduled jobs

## Environment Configuration

### Required Variables

| Variable | Production Value | Description |
|----------|------------------|-------------|
| `PORT` | `3000` | Server port |
| `ORIGIN` | `https://yourdomain.com` | CORS origin |
| `BLUE_SAMPLE_SIZE` | `20` | P2P sample size |
| `NEWS_SOURCES` | RSS feed URLs | Comma-separated |

### Recommended Production Settings

```env
PORT=3000
ORIGIN=https://bolivia-blue.com
BLUE_SAMPLE_SIZE=20
NEWS_SOURCES=https://eldeber.com.bo/rss,https://www.paginasiete.bo/rss,https://www.la-razon.com/rss
```

## Monitoring and Maintenance

### Health Checks

The application provides a health endpoint:

```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "ok": true,
  "updated_at_iso": "2025-11-11T12:34:56Z",
  "history_points": 1250
}
```

### Log Management

**PM2 Logs:**
```bash
pm2 logs bolivia-blue --lines 100
```

**Docker Logs:**
```bash
docker logs -f bolivia-blue
```

### Backup Strategy

**SQLite Database:**
```bash
# Backup
cp backend/blue.db backups/blue_$(date +%Y%m%d).db

# Automated backup script
0 2 * * * cp /var/www/bolivia-blue/backend/blue.db /backups/blue_$(date +\%Y\%m\%d).db
```

### Updates

```bash
# Pull latest code
cd /var/www/bolivia-blue
git pull origin main

# Install dependencies
npm run install:all

# Rebuild frontend
npm run build

# Restart application
pm2 restart bolivia-blue
```

### Performance Optimization

1. **Enable Gzip in Nginx:**
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

2. **Browser Caching:**
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

3. **Rate Limiting:**
```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api/ {
    limit_req zone=api burst=20;
    proxy_pass http://localhost:3000;
}
```

## Troubleshooting

### Application won't start

1. Check Node.js version: `node --version` (must be 20+)
2. Check dependencies: `npm run install:all`
3. Check logs: `pm2 logs` or `docker logs`
4. Verify .env file exists and is correct

### Database errors

1. Check file permissions on `backend/blue.db`
2. Ensure better-sqlite3 compiled correctly: `npm rebuild better-sqlite3`

### No data showing

1. Check if scheduler is running: `pm2 logs bolivia-blue | grep "Refreshing"`
2. Test Binance P2P manually: `curl https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search`
3. Check firewall isn't blocking outbound HTTPS

## Security Considerations

1. **Firewall**: Only allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS)
2. **Updates**: Keep system and Node.js updated
3. **SSH**: Use key-based authentication, disable password auth
4. **CORS**: Set specific origin in production, not `*`
5. **Rate Limiting**: Implement rate limiting on API endpoints
6. **HTTPS**: Always use SSL/TLS in production

## Support

For issues or questions:
- GitHub Issues: <repo-url>/issues
- Email: info@example.com

---

**Last Updated**: November 2025

