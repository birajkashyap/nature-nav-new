# Docker Setup for Nature Navigator

This project includes full Docker containerization for local development and production deployment.

## 📦 What's Included

- **Multi-stage Dockerfile**: Optimized production build with minimal image size
- **Docker Compose**: Complete local development environment with PostgreSQL
- **Health Check Endpoint**: `/api/health` for monitoring and orchestration
- **Security**: Non-root user, health checks, minimal dependencies

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed ([Download](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)

### Local Development with Docker

1. **Copy environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your actual API keys
   ```

2. **Start all services**:
   ```bash
   docker-compose up
   ```
   
   This will start:
   - PostgreSQL database (port 5432)
   - Next.js app (port 3000)
   - Automatic database migrations

3. **Access the application**:
   - App: http://localhost:3000
   - Health check: http://localhost:3000/api/health

4. **Stop services**:
   ```bash
   docker-compose down
   ```

5. **Reset database** (if needed):
   ```bash
   docker-compose down -v  # Removes volumes
   docker-compose up
   ```

### Optional: pgAdmin (Database Management UI)

Start with pgAdmin for database management:
```bash
docker-compose --profile tools up
```

Access pgAdmin at http://localhost:5050
- Email: admin@naturenavigator.local
- Password: admin

## 🏗️ Production Docker Build

### Build the Docker image:
```bash
docker build -t nature-navigator:latest .
```

### Run the production container:
```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="your-production-db-url" \
  -e NEXTAUTH_SECRET="your-secret" \
  -e NEXTAUTH_URL="https://yourapp.com" \
  # ... add all other env vars
  nature-navigator:latest
```

### Push to Docker Hub (or any registry):
```bash
# Tag the image
docker tag nature-navigator:latest yourusername/nature-navigator:latest

# Push to registry
docker push yourusername/nature-navigator:latest
```

## 🔍 Health Check Endpoint

The `/api/health` endpoint provides detailed health status:

```bash
curl http://localhost:3000/api/health
```

**Response** (200 OK when healthy):
```json
{
  "status": "healthy",
  "timestamp": "2026-01-19T14:00:00.000Z",
  "uptime": 123.456,
  "checks": {
    "database": {
      "status": "healthy",
      "latency": 15
    },
    "environment": {
      "status": "healthy"
    },
    "memory": {
      "status": "healthy",
      "usage": 128,
      "limit": 512,
      "percentage": 25
    }
  }
}
```

**Response** (503 Service Unavailable when unhealthy):
```json
{
  "status": "unhealthy",
  "checks": {
    "database": {
      "status": "unhealthy"
    }
  },
  "error": "Connection refused"
}
```

## 🏗️ Multi-Stage Build Explained

The Dockerfile uses 3 stages:

1. **deps**: Installs production dependencies only
2. **builder**: Builds the Next.js application with all dev dependencies
3. **runner**: Minimal production image with only built artifacts

**Benefits**:
- Smaller final image (~150MB vs ~1GB)
- Faster deployments
- Enhanced security (fewer packages = smaller attack surface)

## 🔒 Security Features

- ✅ **Non-root user**: App runs as `nextjs` user (UID 1001)
- ✅ **Minimal base image**: Alpine Linux (~5MB)
- ✅ **No dev dependencies**: Only production packages in final image
- ✅ **Health checks**: Built-in container health monitoring
- ✅ **Read-only filesystem**: Can be enforced in orchestration

## 🐛 Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs app

# Check database connection
docker-compose logs postgres
```

### Database connection issues
```bash
# Verify database is healthy
docker-compose ps

# Check DATABASE_URL format
echo $DATABASE_URL
```

### Port already in use
```bash
# Change ports in docker-compose.yml
# Or stop conflicting services
lsof -ti:3000 | xargs kill
```

### Rebuild after changes
```bash
# Rebuild image
docker-compose build

# Restart services
docker-compose up
```

## 📊 Useful Commands

```bash
# View running containers
docker-compose ps

# View logs (follow mode)
docker-compose logs -f app

# Execute commands in running container
docker-compose exec app sh
docker-compose exec app npx prisma studio

# Run database migrations manually
docker-compose exec app npx prisma migrate deploy

# Inspect database
docker-compose exec postgres psql -U postgres -d nature_navigator
```

## 🚢 Deployment Options

### Option 1: Vercel (Recommended)
- Vercel handles containerization automatically
- Just push to GitHub, Vercel deploys
- No Docker configuration needed

### Option 2: Docker Container Platforms
- **AWS ECS/Fargate**: Managed container service
- **Google Cloud Run**: Serverless containers
- **Azure Container Instances**: Simple container deployment
- **DigitalOcean App Platform**: Container-based PaaS

### Option 3: Kubernetes
See `k8s/` folder for Kubernetes manifests (coming soon)

## 🎯 Next Steps

- [ ] Add Kubernetes manifests (`k8s/deployment.yaml`)
- [ ] Add CI/CD pipeline (GitHub Actions)
- [ ] Add Redis for caching
- [ ] Add monitoring (Prometheus metrics)
- [ ] Add log aggregation

## 📚 Resources

- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
