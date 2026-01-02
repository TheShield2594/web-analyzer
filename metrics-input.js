/**
 * Screen 8: Manual Metrics (Optional but Powerful)
 *
 * This screen collects optional system metrics from admins:
 * - CPU usage
 * - Load average
 * - Disk latency
 * - Memory usage
 *
 * All fields are optional, allowing admins to provide
 * whatever data they have available.
 */

/**
 * Helper function to set or delete a URL parameter based on value
 * @param {URLSearchParams} params - The URL parameters object
 * @param {string} key - The parameter key
 * @param {string} value - The parameter value
 */
function setOrDeleteParam(params, key, value) {
  if (value) {
    params.set(key, value);
  } else {
    params.delete(key);
  }
}

/**
 * Handles the metrics form submission
 * @param {Event} event - The form submission event
 */
function handleMetricsFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);

  // Get all metric values (all optional)
  const cpuUsage = formData.get('cpu-usage')?.trim() || '';
  const loadAverage = formData.get('load-average')?.trim() || '';
  const diskLatency = formData.get('disk-latency')?.trim() || '';
  const memoryUsage = formData.get('memory-usage')?.trim() || '';

  // Navigate to the next screen with all query parameters
  const params = new URLSearchParams(window.location.search);

  // Add metrics to parameters only if they have values
  const metrics = [
    { key: 'cpu_usage', value: cpuUsage },
    { key: 'load_average', value: loadAverage },
    { key: 'disk_latency', value: diskLatency },
    { key: 'memory_usage', value: memoryUsage }
  ];

  metrics.forEach(metric => {
    setOrDeleteParam(params, metric.key, metric.value);
  });

  // Navigate to the analysis loading screen
  window.location.href = `analyzing.html?${params.toString()}`;
}

// Initialize form handler when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const metricsForm = document.querySelector('.metrics-form');
  if (metricsForm) {
    metricsForm.addEventListener('submit', handleMetricsFormSubmit);
  }
});
