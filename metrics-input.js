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

  // Log the collected metrics (for debugging/analytics)
  console.log('Manual Metrics collected:', {
    cpuUsage,
    loadAverage,
    diskLatency,
    memoryUsage
  });

  // Navigate to the next screen with all query parameters
  const params = new URLSearchParams(window.location.search);

  // Add metrics to parameters only if they have values
  if (cpuUsage) {
    params.set('cpu_usage', cpuUsage);
  } else {
    params.delete('cpu_usage');
  }

  if (loadAverage) {
    params.set('load_average', loadAverage);
  } else {
    params.delete('load_average');
  }

  if (diskLatency) {
    params.set('disk_latency', diskLatency);
  } else {
    params.delete('disk_latency');
  }

  if (memoryUsage) {
    params.set('memory_usage', memoryUsage);
  } else {
    params.delete('memory_usage');
  }

  // Navigate to the diagnostic results page
  // This can be updated based on your application's flow
  window.location.href = `diagnostic-results.html?${params.toString()}`;
}

// Initialize form handler when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const metricsForm = document.querySelector('.metrics-form');
  if (metricsForm) {
    metricsForm.addEventListener('submit', handleMetricsFormSubmit);
  }
});
