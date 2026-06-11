# 🚀 Deployment Guide

This document provides instructions for deploying the Gambit Chess Game.

## Prerequisites

- Node.js 18+ (for frontend)
- Python 3.12+ (for backend)
- Git

## Local Development

### 1. Clone the Repository

```bash
git clone https://github.com/jatin223089-ui/v0-chess-game.git
cd v0-chess-game
```

### 2. Backend Setup

```bash
cd backend
pip install -e .
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

### 4. Environment Configuration

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
python -m uvicorn main:app --reload
```
Backend URL: http://127.0.0.1:8000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend URL: http://localhost:3000

## Production Deployment

### Vercel (Frontend + Backend)

The project is already configured for Vercel with `vercel.json`.

#### Deploy via Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

#### Deploy via GitHub Integration

1. Go to https://vercel.com
2. Import your GitHub repository
3. Vercel will auto-detect the Next.js frontend
4. The backend will be deployed as serverless functions

### Environment Variables (Production)

Set these in your deployment platform:

**Frontend:**
- `NEXT_PUBLIC_API_URL` - Your backend API URL

### Alternative Deployment Options

#### Frontend (Static Export)

```bash
cd frontend
npm run build
```

Deploy the `frontend/.next` directory to any static hosting service:
- Netlify
- Cloudflare Pages
- AWS S3 + CloudFront
- GitHub Pages (with Next.js static export)

#### Backend (Python API)

Deploy to:
- **Heroku**: Use `Procfile` with `web: uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Railway**: Auto-detected Python app
- **Render**: Auto-detected FastAPI app
- **AWS Lambda**: Use Mangum adapter
- **Google Cloud Run**: Containerize with Docker
- **DigitalOcean App Platform**: Auto-detected Python app

#### Docker Deployment

**Backend Dockerfile:**
```dockerfile
FROM python:3.12-slim

WORKDIR /app
COPY backend/ .
RUN pip install -e .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

**Docker Compose:**
```yaml
version: '3.8'
services:
  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    ports:
      - "8000:8000"
    
  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
    depends_on:
      - backend
```

## Health Checks

### Backend
```bash
curl http://your-backend-url/health
```

Expected response:
```json
{"status": "ok"}
```

### Frontend
Open your browser to `http://your-frontend-url` and verify the chess board loads.

## Performance Optimization

### Frontend
1. Enable Next.js static generation where possible
2. Use CDN for static assets
3. Enable caching for API responses
4. Compress images and assets

### Backend
1. Enable CORS only for your frontend domain in production
2. Add rate limiting for API endpoints
3. Consider caching AI moves for common positions
4. Use Redis for session storage if needed

## Monitoring

### Recommended Tools
- **Frontend**: Vercel Analytics, Google Analytics
- **Backend**: Sentry for error tracking
- **Uptime**: UptimeRobot, Pingdom
- **Performance**: Lighthouse CI, WebPageTest

## Security Checklist

- [ ] Update CORS settings to allow only production domain
- [ ] Enable HTTPS for both frontend and backend
- [ ] Set secure environment variables
- [ ] Add rate limiting to API endpoints
- [ ] Keep dependencies updated
- [ ] Enable security headers (CSP, HSTS, etc.)
- [ ] Regular security audits with `npm audit`

## Troubleshooting

### Backend Not Connecting
- Verify backend URL in `frontend/.env.local`
- Check CORS settings in `backend/main.py`
- Ensure backend is running and accessible

### Build Failures
- Clear `.next` cache: `rm -rf frontend/.next`
- Clear node_modules: `rm -rf frontend/node_modules && npm install`
- Check Node.js version compatibility

### API Errors
- Check backend logs for detailed error messages
- Verify Python version (3.12+)
- Ensure all dependencies are installed

## Scaling Considerations

- **Backend**: The AI engine is CPU-intensive. Consider:
  - Horizontal scaling with load balancers
  - Dedicated compute instances
  - Background job queues for deep analysis
  
- **Frontend**: Static assets can be served via CDN with edge caching

## Cost Optimization

- Use serverless functions for API (pay per request)
- Implement client-side caching
- Optimize AI depth based on load
- Use static site generation where possible

---

For more information, see the main [README.md](README.md)
