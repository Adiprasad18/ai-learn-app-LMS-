'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Download, Trash2, AlertTriangle, CheckCircle, Clock, Zap, Filter } from 'lucide-react';

export default function TelemetryDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [operationFilter, setOperationFilter] = useState('all');

  const fetchTelemetryData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/telemetry?type=dashboard');
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch telemetry data');
      console.error('Telemetry fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCleanup = async () => {
    try {
      const response = await fetch('/api/admin/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cleanup' })
      });
      
      const result = await response.json();
      if (result.success) {
        await fetchTelemetryData();
      }
    } catch (err) {
      console.error('Cleanup error:', err);
    }
  };

  const handleExport = async (format = 'json') => {
    try {
      const response = await fetch(`/api/admin/telemetry?type=export&format=${format}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `telemetry.${format === 'prometheus' ? 'txt' : 'json'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  useEffect(() => {
    fetchTelemetryData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchTelemetryData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (ms) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatOperationName = (name) => {
    if (!name) return 'General';
    return name
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  const formatPercentage = (value) => {
    if (!Number.isFinite(value)) return '-';
    return `${(value * 100).toFixed(1)}%`;
  };

  const { summary, metrics, recentErrors, topOperations } = data || {};

  const collectOperations = useMemo(() => {
    if (!metrics) return ['all'];
    const names = new Set(['all']);
    let hasGeneralMetrics = false;

    Object.values(metrics).forEach((metric) => {
      const operation = metric.tags?.operation;
      if (operation) {
        names.add(operation);
      } else {
        hasGeneralMetrics = true;
      }
    });

    if (hasGeneralMetrics) {
      names.add('general');
    }

    return Array.from(names).sort((a, b) => (a === 'all' ? -1 : b === 'all' ? 1 : a.localeCompare(b)));
  }, [metrics]);

  const getOperationLabel = (operation) => {
    if (operation === 'all') return 'All Operations';
    return formatOperationName(operation || 'general');
  };

  useEffect(() => {
    if (!collectOperations.length) return;
    if (!collectOperations.includes(operationFilter)) {
      setOperationFilter('all');
    }
  }, [collectOperations, operationFilter]);

  const formatCount = (value) => {
    if (!Number.isFinite(value)) return '-';
    return Math.round(value).toLocaleString();
  };

  const formatDecimal = (value, fractionDigits = 1) => {
    if (!Number.isFinite(value)) return '-';
    return value.toFixed(fractionDigits);
  };

  const formatOptionalDuration = (value) => {
    if (!Number.isFinite(value)) return '-';
    return formatDuration(value);
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Loading telemetry data...
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const metricsList = useMemo(() => {
    if (!metrics) return [];
    const allMetrics = Object.values(metrics);
    if (operationFilter === 'all') return allMetrics;

    return allMetrics.filter((metric) => {
      const operation = metric.tags?.operation || 'general';
      return operation === operationFilter;
    });
  }, [metrics, operationFilter]);

  const operationDurationStats = useMemo(() => {
    if (!metricsList.length) return [];
    const aggregated = {};

    metricsList.forEach((metric) => {
      if (metric.name !== 'operation_duration') return;
      const operation = metric.tags?.operation || 'general';

      if (!aggregated[operation]) {
        aggregated[operation] = {
          operation,
          sum: 0,
          count: 0,
          min: Infinity,
          max: -Infinity
        };
      }

      aggregated[operation].sum += metric.sum ?? 0;
      aggregated[operation].count += metric.count ?? 0;
      aggregated[operation].min = Math.min(aggregated[operation].min, metric.min ?? Infinity);
      aggregated[operation].max = Math.max(aggregated[operation].max, metric.max ?? -Infinity);
    });

    return Object.values(aggregated)
      .map((stat) => ({
        ...stat,
        avg: stat.count ? stat.sum / stat.count : null,
        min: stat.min === Infinity ? null : stat.min,
        max: stat.max === -Infinity ? null : stat.max
      }))
      .sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0));
  }, [metricsList]);

  const aiRequestStats = useMemo(() => {
    if (!metricsList.length) return [];
    const aggregated = {};
    const parseBoolean = (value) => value === true || value === 'true';

    metricsList.forEach((metric) => {
      if (metric.name !== 'ai_request_duration' && metric.name !== 'ai_request_retries') return;
      const operation = metric.tags?.operation || 'general';

      if (!aggregated[operation]) {
        aggregated[operation] = {
          operation,
          success: { sum: 0, count: 0 },
          failure: { sum: 0, count: 0 },
          retries: { sum: 0, count: 0 }
        };
      }

      if (metric.name === 'ai_request_duration') {
        const bucket = parseBoolean(metric.tags?.success) ? 'success' : 'failure';
        aggregated[operation][bucket].sum += metric.sum ?? 0;
        aggregated[operation][bucket].count += metric.count ?? 0;
      } else {
        aggregated[operation].retries.sum += metric.sum ?? 0;
        aggregated[operation].retries.count += metric.count ?? 0;
      }
    });

    return Object.values(aggregated)
      .map((stat) => {
        const totalRequests = stat.success.count + stat.failure.count;
        return {
          operation: stat.operation,
          totalRequests,
          failureCount: stat.failure.count,
          successRate: totalRequests ? stat.success.count / totalRequests : null,
          avgSuccessDuration: stat.success.count ? stat.success.sum / stat.success.count : null,
          avgFailureDuration: stat.failure.count ? stat.failure.sum / stat.failure.count : null,
          avgRetries: stat.retries.count ? stat.retries.sum / stat.retries.count : null
        };
      })
      .sort((a, b) => (b.totalRequests ?? 0) - (a.totalRequests ?? 0));
  }, [metricsList]);

  const streamingStats = useMemo(() => {
    if (!metricsList.length) return [];
    const aggregated = {};

    const relevantNames = [
      'streaming_chunk_length',
      'streaming_generation_chunks',
      'streaming_generation_retry_delay'
    ];

    metricsList.forEach((metric) => {
      if (!relevantNames.includes(metric.name)) return;
      const operation = metric.tags?.operation || 'general';

      if (!aggregated[operation]) {
        aggregated[operation] = {
          operation,
          chunkLength: { sum: 0, count: 0 },
          chunkCount: { sum: 0, count: 0 },
          retryDelay: { sum: 0, count: 0 }
        };
      }

      const target =
        metric.name === 'streaming_chunk_length'
          ? aggregated[operation].chunkLength
          : metric.name === 'streaming_generation_chunks'
            ? aggregated[operation].chunkCount
            : aggregated[operation].retryDelay;

      target.sum += metric.sum ?? 0;
      target.count += metric.count ?? 0;
    });

    return Object.values(aggregated)
      .map((stat) => ({
        operation: stat.operation,
        avgChunkLength: stat.chunkLength.count ? stat.chunkLength.sum / stat.chunkLength.count : null,
        avgChunksPerRun: stat.chunkCount.count ? stat.chunkCount.sum / stat.chunkCount.count : null,
        retryCount: stat.retryDelay.count,
        avgRetryDelay: stat.retryDelay.count ? stat.retryDelay.sum / stat.retryDelay.count : null
      }))
      .sort((a, b) => (b.avgChunksPerRun ?? 0) - (a.avgChunksPerRun ?? 0));
  }, [metricsList]);

  const contentMetricLabels = {
    chapter_flashcards_count: 'Flashcards per Chapter',
    chapter_quiz_question_count: 'Quiz Questions per Chapter',
    chapter_notes_stream_chunk: 'Notes Stream Chunks'
  };

  const contentStats = useMemo(() => {
    if (!metricsList.length) return [];
    const aggregated = {};

    metricsList.forEach((metric) => {
      if (!contentMetricLabels[metric.name]) return;

      if (!aggregated[metric.name]) {
        aggregated[metric.name] = {
          name: contentMetricLabels[metric.name],
          sum: 0,
          count: 0,
          min: Infinity,
          max: -Infinity
        };
      }

      aggregated[metric.name].sum += metric.sum ?? 0;
      aggregated[metric.name].count += metric.count ?? 0;
      aggregated[metric.name].min = Math.min(aggregated[metric.name].min, metric.min ?? Infinity);
      aggregated[metric.name].max = Math.max(aggregated[metric.name].max, metric.max ?? -Infinity);
    });

    return Object.values(aggregated).map((stat) => ({
      ...stat,
      avg: stat.count ? stat.sum / stat.count : null,
      min: stat.min === Infinity ? null : stat.min,
      max: stat.max === -Infinity ? null : stat.max
    }));
  }, [metricsList]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Content Generation Telemetry</h1>
          <p className="text-muted-foreground">
            Monitor performance, errors, and usage patterns
            {lastUpdated && (
              <span className="ml-2">
                • Last updated: {formatTimestamp(lastUpdated.getTime())}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchTelemetryData} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => handleExport('json')} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
          <Button onClick={() => handleExport('prometheus')} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Prometheus
          </Button>
          <Button onClick={handleCleanup} variant="outline" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Cleanup
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Course Generations</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalCourseGenerations}</div>
              <p className="text-xs text-muted-foreground">
                {summary.successfulGenerations} successful
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Requests</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalAiRequests}</div>
              <p className="text-xs text-muted-foreground">
                {summary.successfulAiRequests} successful
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Generation Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatOptionalDuration(summary.averageGenerationTime || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                AI: {formatOptionalDuration(summary.averageAiRequestTime || 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Errors</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{summary.totalErrors}</div>
              <p className="text-xs text-muted-foreground">Last hour</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Tabs */}
      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="errors">Recent Errors</TabsTrigger>
          <TabsTrigger value="operations">Top Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Operation Timings</CardTitle>
              <CardDescription>Average duration for key operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  <span>Filter by operation</span>
                </div>
                <Select value={operationFilter} onValueChange={setOperationFilter}>
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue placeholder="Select operation" />
                  </SelectTrigger>
                  <SelectContent>
                    {collectOperations.map((operation) => (
                      <SelectItem key={operation} value={operation}>
                        {getOperationLabel(operation)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {operationDurationStats.length ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="text-left text-muted-foreground">
                      <tr>
                        <th className="py-2 pr-4 font-medium">Operation</th>
                        <th className="py-2 pr-4 font-medium">Avg Duration</th>
                        <th className="py-2 pr-4 font-medium">Min</th>
                        <th className="py-2 pr-4 font-medium">Max</th>
                        <th className="py-2 pr-4 font-medium">Samples</th>
                      </tr>
                    </thead>
                    <tbody>
                      {operationDurationStats.map((stat) => (
                        <tr key={stat.operation} className="border-t">
                          <td className="py-2 pr-4 font-medium">{formatOperationName(stat.operation)}</td>
                          <td className="py-2 pr-4">{formatOptionalDuration(stat.avg)}</td>
                          <td className="py-2 pr-4">{formatOptionalDuration(stat.min)}</td>
                          <td className="py-2 pr-4">{formatOptionalDuration(stat.max)}</td>
                          <td className="py-2 pr-4">{formatCount(stat.count)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">No operation timing data available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Request Outcomes</CardTitle>
              <CardDescription>Success, retry, and latency patterns per operation</CardDescription>
            </CardHeader>
            <CardContent>
              {aiRequestStats.length ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="text-left text-muted-foreground">
                      <tr>
                        <th className="py-2 pr-4 font-medium">Operation</th>
                        <th className="py-2 pr-4 font-medium">Success Rate</th>
                        <th className="py-2 pr-4 font-medium">Requests</th>
                        <th className="py-2 pr-4 font-medium">Failures</th>
                        <th className="py-2 pr-4 font-medium">Avg Success</th>
                        <th className="py-2 pr-4 font-medium">Avg Failure</th>
                        <th className="py-2 pr-4 font-medium">Avg Retries</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aiRequestStats.map((stat) => (
                        <tr key={stat.operation} className="border-t">
                          <td className="py-2 pr-4 font-medium">{formatOperationName(stat.operation)}</td>
                          <td className="py-2 pr-4">{formatPercentage(stat.successRate)}</td>
                          <td className="py-2 pr-4">{formatCount(stat.totalRequests)}</td>
                          <td className="py-2 pr-4 text-red-500">{formatCount(stat.failureCount)}</td>
                          <td className="py-2 pr-4">{formatOptionalDuration(stat.avgSuccessDuration)}</td>
                          <td className="py-2 pr-4">{formatOptionalDuration(stat.avgFailureDuration)}</td>
                          <td className="py-2 pr-4">{formatDecimal(stat.avgRetries ?? NaN, 2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">No AI request data available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Streaming Performance</CardTitle>
              <CardDescription>Chunking behavior and retry dynamics</CardDescription>
            </CardHeader>
            <CardContent>
              {streamingStats.length ? (
                <div className
