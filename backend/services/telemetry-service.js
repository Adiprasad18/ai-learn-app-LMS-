/**
 * Telemetry Service for AI Content Generation Monitoring
 * Tracks performance metrics, error rates, and usage patterns
 */

class TelemetryService {
  constructor() {
    this.metrics = new Map();
    this.events = [];
    this.maxEvents = 1000; // Keep last 1000 events in memory
  }

  /**
   * Record a metric value
   */
  recordMetric(name, value, tags = {}) {
    const timestamp = Date.now();
    const key = `${name}_${JSON.stringify(tags)}`;
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, {
        name,
        tags,
        values: [],
        count: 0,
        sum: 0,
        min: Infinity,
        max: -Infinity,
        avg: 0
      });
    }

    const metric = this.metrics.get(key);
    metric.values.push({ value, timestamp });
    metric.count++;
    metric.sum += value;
    metric.min = Math.min(metric.min, value);
    metric.max = Math.max(metric.max, value);
    metric.avg = metric.sum / metric.count;

    // Keep only last 100 values per metric
    if (metric.values.length > 100) {
      metric.values = metric.values.slice(-100);
    }
  }

  /**
   * Record an event
   */
  recordEvent(type, data = {}) {
    const event = {
      type,
      data,
      timestamp: Date.now(),
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    this.events.push(event);

    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log important events
    if (['error', 'warning', 'generation_failed'].includes(type)) {
      console.log(`[Telemetry] ${type.toUpperCase()}:`, data);
    }
  }

  /**
   * Start timing an operation
   */
  startTimer(operationName, metadata = {}) {
    const startTime = Date.now();
    return {
      operationName,
      startTime,
      metadata,
      end: (additionalData = {}) => {
        const duration = Date.now() - startTime;
        this.recordMetric('operation_duration', duration, { 
          operation: operationName,
          ...metadata 
        });
        this.recordEvent('operation_completed', {
          operation: operationName,
          duration,
          ...metadata,
          ...additionalData
        });
        return duration;
      }
    };
  }

  /**
   * Record AI request metrics
   */
  recordAiRequest(operation, duration, success, retryCount = 0, error = null) {
    this.recordMetric('ai_request_duration', duration, { operation, success });
    this.recordMetric('ai_request_retries', retryCount, { operation });
    
    this.recordEvent('ai_request', {
      operation,
      duration,
      success,
      retryCount,
      error: error?.message,
      timestamp: Date.now()
    });

    if (!success) {
      this.recordEvent('ai_request_failed', {
        operation,
        duration,
        retryCount,
        error: error?.message,
        stack: error?.stack
      });
    }
  }

  /**
   * Record course generation metrics
   */
  recordCourseGeneration(courseId, userId, topic, duration, success, stats = {}) {
    this.recordMetric('course_generation_duration', duration, { success });
    
    this.recordEvent('course_generation', {
      courseId,
      userId,
      topic,
      duration,
      success,
      chaptersGenerated: stats.chaptersGenerated || 0,
      notesGenerated: stats.notesGenerated || 0,
      flashcardsGenerated: stats.flashcardsGenerated || 0,
      quizzesGenerated: stats.quizzesGenerated || 0,
      errors: stats.errors || 0,
      warnings: stats.warnings || 0
    });
  }

  /**
   * Get metric summary
   */
  getMetricSummary(name, tags = {}) {
    const key = `${name}_${JSON.stringify(tags)}`;
    return this.metrics.get(key) || null;
  }

  /**
   * Get all metrics
   */
  getAllMetrics() {
    const result = {};
    for (const [key, metric] of this.metrics.entries()) {
      result[key] = {
        name: metric.name,
        tags: metric.tags,
        count: metric.count,
        sum: metric.sum,
        min: metric.min,
        max: metric.max,
        avg: metric.avg,
        latest: metric.values[metric.values.length - 1]
      };
    }
    return result;
  }

  /**
   * Get recent events
   */
  getRecentEvents(type = null, limit = 50) {
    let events = this.events;
    
    if (type) {
      events = events.filter(event => event.type === type);
    }
    
    return events
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get performance dashboard data
   */
  getDashboardData() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const recentEvents = this.events.filter(e => now - e.timestamp < oneHour);

    const courseGenerations = recentEvents.filter(e => e.type === 'course_generation');
    const aiRequests = recentEvents.filter(e => e.type === 'ai_request');
    const errors = recentEvents.filter(e => e.type === 'error' || e.type.includes('failed'));

    return {
      summary: {
        totalCourseGenerations: courseGenerations.length,
        successfulGenerations: courseGenerations.filter(e => e.data.success).length,
        totalAiRequests: aiRequests.length,
        successfulAiRequests: aiRequests.filter(e => e.data.success).length,
        totalErrors: errors.length,
        averageGenerationTime: this.calculateAverage(
          courseGenerations.map(e => e.data.duration)
        ),
        averageAiRequestTime: this.calculateAverage(
          aiRequests.map(e => e.data.duration)
        )
      },
      metrics: this.getAllMetrics(),
      recentErrors: errors.slice(0, 10),
      topOperations: this.getTopOperations(recentEvents)
    };
  }

  /**
   * Calculate average of an array of numbers
   */
  calculateAverage(numbers) {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }

  /**
   * Get top operations by frequency
   */
  getTopOperations(events) {
    const operationCounts = {};
    
    events.forEach(event => {
      if (event.data.operation) {
        operationCounts[event.data.operation] = 
          (operationCounts[event.data.operation] || 0) + 1;
      }
    });

    return Object.entries(operationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([operation, count]) => ({ operation, count }));
  }

  /**
   * Export metrics for external monitoring systems
   */
  exportMetrics(format = 'json') {
    const data = {
      timestamp: Date.now(),
      metrics: this.getAllMetrics(),
      events: this.getRecentEvents(null, 100),
      dashboard: this.getDashboardData()
    };

    if (format === 'prometheus') {
      return this.formatPrometheusMetrics(data);
    }

    return JSON.stringify(data, null, 2);
  }

  /**
   * Format metrics for Prometheus
   */
  formatPrometheusMetrics(data) {
    let output = '';
    
    for (const [key, metric] of Object.entries(data.metrics)) {
      const metricName = metric.name.replace(/[^a-zA-Z0-9_]/g, '_');
      const tags = Object.entries(metric.tags)
        .map(([k, v]) => `${k}="${v}"`)
        .join(',');
      
      output += `# HELP ${metricName} ${metric.name}\n`;
      output += `# TYPE ${metricName} gauge\n`;
      output += `${metricName}_count{${tags}} ${metric.count}\n`;
      output += `${metricName}_sum{${tags}} ${metric.sum}\n`;
      output += `${metricName}_avg{${tags}} ${metric.avg}\n`;
      output += `${metricName}_min{${tags}} ${metric.min}\n`;
      output += `${metricName}_max{${tags}} ${metric.max}\n\n`;
    }
    
    return output;
  }

  /**
   * Clear old data
   */
  cleanup(maxAge = 24 * 60 * 60 * 1000) { // 24 hours default
    const cutoff = Date.now() - maxAge;
    
    // Clean old events
    this.events = this.events.filter(event => event.timestamp > cutoff);
    
    // Clean old metric values
    for (const metric of this.metrics.values()) {
      metric.values = metric.values.filter(v => v.timestamp > cutoff);
    }
  }

  /**
   * Reset all metrics and events
   */
  reset() {
    this.metrics.clear();
    this.events = [];
  }
}

// Create singleton instance
const telemetryService = new TelemetryService();

// Auto-cleanup every hour
setInterval(() => {
  telemetryService.cleanup();
}, 60 * 60 * 1000);

export default telemetryService;