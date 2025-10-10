/**
 * AI Telemetry API
 * Provides monitoring and analytics for AI operations
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import telemetryService from "@/backend/services/telemetry-service";

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const format = searchParams.get('format') || 'json';
    const limit = parseInt(searchParams.get('limit')) || 50;

    switch (type) {
      case 'dashboard':
        const dashboardData = telemetryService.getDashboardData();
        return NextResponse.json(dashboardData);

      case 'metrics':
        const metrics = telemetryService.getAllMetrics();
        if (format === 'prometheus') {
          const prometheusData = telemetryService.exportMetrics('prometheus');
          return new Response(prometheusData, {
            headers: {
              'Content-Type': 'text/plain; version=0.0.4; charset=utf-8'
            }
          });
        }
        return NextResponse.json(metrics);

      case 'events':
        const eventType = searchParams.get('eventType');
        const events = telemetryService.getRecentEvents(eventType, limit);
        return NextResponse.json({
          events,
          total: events.length,
          eventType: eventType || 'all'
        });

      case 'export':
        const exportData = telemetryService.exportMetrics(format);
        if (format === 'prometheus') {
          return new Response(exportData, {
            headers: {
              'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
              'Content-Disposition': 'attachment; filename="ai-telemetry.txt"'
            }
          });
        }
        return new Response(exportData, {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': 'attachment; filename="ai-telemetry.json"'
          }
        });

      default:
        return NextResponse.json({
          availableTypes: ['dashboard', 'metrics', 'events', 'export'],
          availableFormats: ['json', 'prometheus'],
          usage: {
            dashboard: '/api/ai/telemetry?type=dashboard',
            metrics: '/api/ai/telemetry?type=metrics',
            events: '/api/ai/telemetry?type=events&eventType=error&limit=10',
            export: '/api/ai/telemetry?type=export&format=json'
          }
        });
    }

  } catch (error) {
    console.error('Telemetry API error:', error);
    return NextResponse.json(
      { error: "Failed to retrieve telemetry data" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'record_event':
        const { type, eventData } = data;
        if (!type) {
          return NextResponse.json({ error: "Event type is required" }, { status: 400 });
        }
        telemetryService.recordEvent(type, { ...eventData, userId });
        return NextResponse.json({ success: true, message: "Event recorded" });

      case 'record_metric':
        const { name, value, tags } = data;
        if (!name || value === undefined) {
          return NextResponse.json({ error: "Metric name and value are required" }, { status: 400 });
        }
        telemetryService.recordMetric(name, value, { ...tags, userId });
        return NextResponse.json({ success: true, message: "Metric recorded" });

      case 'cleanup':
        const { maxAge } = data;
        telemetryService.cleanup(maxAge);
        return NextResponse.json({ success: true, message: "Cleanup completed" });

      case 'reset':
        telemetryService.reset();
        return NextResponse.json({ success: true, message: "Telemetry data reset" });

      default:
        return NextResponse.json({
          error: "Invalid action",
          availableActions: ['record_event', 'record_metric', 'cleanup', 'reset']
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Telemetry POST error:', error);
    return NextResponse.json(
      { error: "Failed to process telemetry request" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'cleanup':
        const maxAge = parseInt(searchParams.get('maxAge')) || 24 * 60 * 60 * 1000; // 24 hours
        telemetryService.cleanup(maxAge);
        return NextResponse.json({ 
          success: true, 
          message: `Cleaned up data older than ${maxAge}ms` 
        });

      case 'reset':
        telemetryService.reset();
        return NextResponse.json({ 
          success: true, 
          message: "All telemetry data has been reset" 
        });

      default:
        return NextResponse.json({
          error: "Invalid action",
          availableActions: ['cleanup', 'reset'],
          usage: {
            cleanup: '/api/ai/telemetry?action=cleanup&maxAge=86400000',
            reset: '/api/ai/telemetry?action=reset'
          }
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Telemetry DELETE error:', error);
    return NextResponse.json(
      { error: "Failed to process telemetry deletion" },
      { status: 500 }
    );
  }
}
