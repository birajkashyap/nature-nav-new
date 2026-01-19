# GitHub Actions CI/CD Documentation

This project uses GitHub Actions for continuous integration and deployment.

## 🔄 Workflows

### 1. CI - Build and Test (`ci.yml`)

**Triggers:**
- Pull requests to `main` or `develop`
- Pushes to `main` or `develop`

**Jobs:**
1. **Lint and Type Check**
   - Runs ESLint
   - TypeScript type checking with `tsc --noEmit`

2. **Build**
   - Installs dependencies
   - Generates Prisma Client
   - Builds Next.js application
   - Uploads build artifacts

3. **Test**
   - Spins up PostgreSQL service container
   - Runs database migrations
   - Executes test suite (if present)
   - Uploads coverage reports

4. **Security Audit**
   - npm audit for known vulnerabilities
   - Checks for moderate+ severity issues

**Status:** ✅ All jobs must pass for PR to be merged

---

### 2. Docker Build and Push (`docker-build.yml`)

**Triggers:**
- Push to `main` branch
- Version tags (`v*.*.*`)
- Manual trigger via workflow_dispatch

**Jobs:**
1. **Build and Push**
   - Builds multi-stage Docker image
   - Pushes to GitHub Container Registry (GHCR)
   - Tags: `latest`, `main`, SHA, version tags
   - Multi-platform: linux/amd64, linux/arm64
   - Uses build cache for speed

2. **Container Scan**
   - Scans image with Trivy
   - Checks for CRITICAL and HIGH vulnerabilities
   - Uploads results to GitHub Security tab

**Output:** `ghcr.io/birajkashyap/nature-nav-new:latest`

---

### 3. Security Scanning (`security-scan.yml`)

**Triggers:**
- Pull requests to `main` or `develop`
- Pushes to `main` or `develop`
- Weekly schedule (Mondays at 9 AM UTC)
- Manual trigger

**Jobs:**
1. **Dependency Review** (PR only)
   - Reviews new dependencies in PRs
   - Fails on moderate+ severity vulnerabilities

2. **CodeQL Analysis**
   - SAST (Static Application Security Testing)
   - Scans JavaScript and TypeScript code
   - Security-extended queries
   - Results published to GitHub Security

3. **Secret Scanning**
   - TruffleHog scan for exposed secrets
   - Checks commit history
   - Validates leaked credentials

4. **Container Scan**
   - Trivy vulnerability scanner
   - OS and library vulnerabilities
   - CRITICAL and HIGH severity

5. **NPM Audit**
   - Checks for vulnerable dependencies
   - Fails on high severity issues

---

### 4. Deploy to Production (`deploy.yml`)

**Triggers:**
- Push to `main` branch
- Manual trigger

**Concurrency:** Only one deployment at a time

**Jobs:**
1. **Deploy to Vercel**
   - Installs Vercel CLI
   - Pulls environment config
   - Builds project
   - Deploys to production
   - Outputs deployment URL

2. **Run Migrations**
   - Connects to production database
   - Runs Prisma migrations
   - Ensures schema is up-to-date

3. **Health Check**
   - Waits for deployment to stabilize (30s)
   - Checks `/api/health` endpoint
   - Verifies critical pages (/, /login)
   - Fails deployment if unhealthy

4. **Notify Team** (optional)
   - Sends Slack notification
   - Deployment status
   - Commit info and URL

**Environment:** `production` (requires approval if configured)

---

## 🔐 Required Secrets

Configure these in **Settings → Secrets and variables → Actions**:

### For Vercel Deployment
```
VERCEL_TOKEN=xxx          # Vercel API token
VERCEL_ORG_ID=xxx         # Your Vercel org ID
VERCEL_PROJECT_ID=xxx     # Your Vercel project ID
```

### For Production Database
```
DATABASE_URL=postgresql://...  # Production database connection string
```

### Optional: Slack Notifications
```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx
```

---

## 📦 Artifact Outputs

### Build Artifacts
- **Name:** `nextjs-build`
- **Contents:** `.next/` directory
- **Retention:** 1 day
- **Use:** Can be downloaded for debugging

### Coverage Reports
- **Name:** `coverage`
- **Contents:** Test coverage HTML
- **Retention:** 7 days
- **Use:** View coverage locally

### Docker Images
- **Registry:** GitHub Container Registry (GHCR)
- **Image:** `ghcr.io/birajkashyap/nature-nav-new`
- **Tags:** `latest`, `main`, version tags, SHA

---

## 🛠️ Manual Workflows

### Trigger Docker Build Manually
```bash
# Via GitHub UI
Actions → "Build and Push Docker Image" → Run workflow

# Via GitHub CLI
gh workflow run docker-build.yml
```

### Trigger Production Deployment
```bash
# Via GitHub UI
Actions → "Deploy to Production" → Run workflow

# Via GitHub CLI
gh workflow run deploy.yml
```

---

## 🔍 Monitoring Workflows

### View Workflow Runs
```bash
# List recent workflow runs
gh run list

# View specific run
gh run view <run-id>

# Watch run in real-time
gh run watch
```

### Check Security Alerts
- **Code Scanning:** Security tab → Code scanning
- **Dependabot:** Security tab → Dependabot
- **Secret Scanning:** Security tab → Secret scanning

---

## 🐛 Troubleshooting

### Build Fails
1. Check Node.js version matches (`20`)
2. Ensure `package-lock.json` is committed
3. Verify Prisma schema is valid
4. Check build logs for specific errors

### Docker Build Fails
1. Test Dockerfile locally: `docker build -t test .`
2. Check multi-platform support
3. Verify registry permissions

### Deployment Fails
1. Check Vercel token validity
2. Verify project ID and org ID
3. Check database connection string
4. Review Vercel dashboard logs

### Health Check Fails
1. Check if `/api/health` endpoint works locally
2. Verify database connectivity
3. Check environment variables
4. Review Vercel function logs

---

## 📊 Workflow Status Badges

Add to README.md:

```markdown
![CI](https://github.com/birajkashyap/nature-nav-new/workflows/CI%20-%20Build%20and%20Test/badge.svg)
![Docker](https://github.com/birajkashyap/nature-nav-new/workflows/Build%20and%20Push%20Docker%20Image/badge.svg)
![Security](https://github.com/birajkashyap/nature-nav-new/workflows/Security%20Scanning/badge.svg)
```

---

## 🎯 Best Practices

1. **Always create PRs for changes**
   - Triggers CI checks
   - Requires review
   - Ensures quality

2. **Fix security issues immediately**
   - Security scans run weekly
   - Address CRITICAL/HIGH vulnerabilities
   - Review Dependabot PRs

3. **Monitor deployment health**
   - Check health checks after deployment
   - Review Vercel logs
   - Test critical user flows

4. **Keep dependencies updated**
   - Merge Dependabot PRs
   - Review breaking changes
   - Update major versions carefully

---

## 📈 Future Improvements

- [ ] Add E2E tests with Playwright
- [ ] Add performance budgets
- [ ] Add automatic rollback on failure
- [ ] Add staging environment
- [ ] Add canary deployments
- [ ] Add load testing
