import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import telemetryService from "@/backend/services/telemetry-service";

export async function GET(req) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // In a real app, you'd check if user has admin privileges
    // For now, we'll allow any authenticated user to view telemetry
    
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'json';
    const type = searchParams.get('type') || 'dashboard';

    switch (type) {
      case 'dashboard':
        const dashboardData = telemetryService.getDashboardData();
        return NextResponse.json({
          success: true,
          data: dashboardData
        });

      case 'metrics':
        const metrics = telemetryService.getAllMetrics();
        if (format === 'prometheus') {
          const prometheusData = telemetryService.exportMetrics('prometheus');
          return new Response(prometheusData, {
            headers: {
              'Content-Type': 'text/plain; charset=utf-8'
            }
          });
        }
        return NextResponse.json({
          success: true,
          data: metrics
        });

      case 'events':
        const eventType = searchParams.get('eventType');
        const limit = parseInt(searchParams.get('limit') || '50');
        const events = telemetryService.getRecentEvents(eventType, limit);
        return NextResponse.json({
          success: true,
          data: events
        });

      case 'export':
        const exportData = telemetryService.exportMetrics(format);
        if (format === 'prometheus') {
          return new Response(exportData, {
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'Content-Disposition': 'attachment; filename="metrics.txt"'
            }
          });
        }
        return new Response(exportData, {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': 'attachment; filename="telemetry.json"'
          }
        });

      default:
        return NextResponse.json(
          { success: false, error: "Invalid type parameter" },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error("Error in telemetry API:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve telemetry data" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action } = body;

    switch (action) {
      case 'cleanup':
        const maxAge = body.maxAge || 24 * 60 * 60 * 1000; // 24 hours default
        telemetryService.cleanup(maxAge);
        return NextResponse.json({
          success: true,
          message: "Telemetry data cleaned up successfully"
        });

      case 'reset':
        telemetryService.reset();
        return NextResponse.json({
          success: true,
          message: "Telemetry data reset successfully"
        });

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error("Error in telemetry POST API:", error);
    return NextResponse.json(
      { success: false, error: "Failed to perform telemetry action" },
      { status: 500 }
    );
  }
}
