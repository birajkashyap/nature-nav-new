import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Health check endpoint for monitoring and container orchestration
 * Returns 200 OK if all critical systems are healthy
 * Returns 503 Service Unavailable if any critical system is down
 */
export async function GET() {
  const healthCheck = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: { status: "unknown", latency: 0 },
      environment: { status: "unknown" },
      memory: { status: "unknown", usage: 0 },
    },
  };

  try {
    // 1. Check Database Connection
    const dbStartTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - dbStartTime;

    healthCheck.checks.database = {
      status: dbLatency < 1000 ? "healthy" : "degraded",
      latency: dbLatency,
    };

    // 2. Check Critical Environment Variables
    const requiredEnvVars = [
      "DATABASE_URL",
      "NEXTAUTH_SECRET",
      "NEXTAUTH_URL",
    ];

    const missingEnvVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );

    healthCheck.checks.environment = {
      status: missingEnvVars.length === 0 ? "healthy" : "unhealthy",
      ...(missingEnvVars.length > 0 && {
        missing: missingEnvVars,
      }),
    };

    // 3. Check Memory Usage
    const memUsage = process.memoryUsage();
    const memUsageMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const memLimitMB = Math.round(memUsage.heapTotal / 1024 / 1024);

    healthCheck.checks.memory = {
      status: memUsageMB < memLimitMB * 0.9 ? "healthy" : "warning",
      usage: memUsageMB,
      limit: memLimitMB,
      percentage: Math.round((memUsageMB / memLimitMB) * 100),
    };

    // Determine overall health
    const isHealthy =
      healthCheck.checks.database.status === "healthy" &&
      healthCheck.checks.environment.status === "healthy";

    if (!isHealthy) {
      healthCheck.status = "unhealthy";
      return NextResponse.json(healthCheck, { status: 503 });
    }

    return NextResponse.json(healthCheck, { status: 200 });
  } catch (error) {
    console.error("Health check failed:", error);

    healthCheck.status = "unhealthy";
    healthCheck.checks.database.status = "unhealthy";

    return NextResponse.json(
      {
        ...healthCheck,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}

/**
 * Readiness check - for Kubernetes readiness probes
 * Returns 200 when the app is ready to receive traffic
 */
export async function HEAD() {
  try {
    // Quick database ping
    await prisma.$queryRaw`SELECT 1`;
    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}
