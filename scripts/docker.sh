#!/bin/bash
# Docker Helper Scripts for Nature Navigator

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Function to print colored messages
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi
    print_info "Docker is running ✓"
}

# Function to build Docker image
build() {
    print_info "Building Docker image..."
    cd "$PROJECT_ROOT"
    docker build -t nature-navigator:latest .
    print_info "Build complete! Image: nature-navigator:latest"
}

# Function to start services
start() {
    print_info "Starting services with Docker Compose..."
    cd "$PROJECT_ROOT"
    docker-compose up -d
    print_info "Services started!"
    print_info "App: http://localhost:3000"
    print_info "Health: http://localhost:3000/api/health"
}

# Function to stop services
stop() {
    print_info "Stopping services..."
    cd "$PROJECT_ROOT"
    docker-compose down
    print_info "Services stopped!"
}

# Function to view logs
logs() {
    print_info "Showing logs (Ctrl+C to exit)..."
    cd "$PROJECT_ROOT"
    docker-compose logs -f
}

# Function to run health check
health() {
    print_info "Checking application health..."
    response=$(curl -s -w "\n%{http_code}" http://localhost:3000/api/health)
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$status_code" -eq 200 ]; then
        print_info "Health check passed! ✓"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        print_error "Health check failed! Status: $status_code"
        echo "$body"
        exit 1
    fi
}

# Function to reset environment
reset() {
    print_warn "This will delete all data. Are you sure? (y/N)"
    read -r confirm
    if [[ $confirm == [yY] ]]; then
        print_info "Resetting environment..."
        cd "$PROJECT_ROOT"
        docker-compose down -v
        print_info "Environment reset complete!"
    else
        print_info "Reset cancelled."
    fi
}

# Function to open shell in container
shell() {
    print_info "Opening shell in app container..."
    cd "$PROJECT_ROOT"
    docker-compose exec app sh
}

# Function to run database migrations
migrate() {
    print_info "Running database migrations..."
    cd "$PROJECT_ROOT"
    docker-compose exec app npx prisma migrate deploy
    print_info "Migrations complete!"
}

# Function to open Prisma Studio
studio() {
    print_info "Opening Prisma Studio..."
    cd "$PROJECT_ROOT"
    docker-compose exec app npx prisma studio
}

# Main command handler
case "${1:-help}" in
    build)
        check_docker
        build
        ;;
    start)
        check_docker
        start
        ;;
    stop)
        check_docker
        stop
        ;;
    restart)
        check_docker
        stop
        start
        ;;
    logs)
        check_docker
        logs
        ;;
    health)
        health
        ;;
    reset)
        check_docker
        reset
        ;;
    shell)
        check_docker
        shell
        ;;
    migrate)
        check_docker
        migrate
        ;;
    studio)
        check_docker
        studio
        ;;
    help|*)
        echo "Nature Navigator Docker Helper"
        echo ""
        echo "Usage: $0 {command}"
        echo ""
        echo "Commands:"
        echo "  build      Build Docker image"
        echo "  start      Start all services"
        echo "  stop       Stop all services"
        echo "  restart    Restart all services"
        echo "  logs       View service logs"
        echo "  health     Check application health"
        echo "  reset      Reset environment (deletes all data)"
        echo "  shell      Open shell in app container"
        echo "  migrate    Run database migrations"
        echo "  studio     Open Prisma Studio"
        echo "  help       Show this help message"
        ;;
esac
