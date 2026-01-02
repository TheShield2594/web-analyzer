/**
 * Screen 6: Branch Selection Logic
 *
 * This screen analyzes diagnostic data collected from previous screens
 * and determines which diagnostic path to follow:
 * - Network path
 * - DNS path
 * - System resource path
 * - App-layer path
 */

// Parse URL parameters
function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    // Screen 1: Impact Scope
    scope: params.get('scope'),

    // Screen 2: What Is Slow
    target: params.get('target'),

    // Screen 3: Timing Pattern
    timing: params.get('timing'),
    intermittent: params.get('intermittent') === 'true',
    recent_change: params.get('recent_change') === 'true',

    // Screen 4: Environment Context
    device: params.get('device'),
    os: params.get('os'),
    connection: params.get('connection'),

    // Screen 5: Quick Checks Results
    high_latency: params.get('high_latency') === 'true',
    low_bandwidth: params.get('low_bandwidth') === 'true',
    dns_issues: params.get('dns_issues') === 'true',
    dns_ms: parseFloat(params.get('dns_ms')) || 0,
    latency_ms: parseFloat(params.get('latency_ms')) || 0,
    ttfb_ms: parseFloat(params.get('ttfb_ms')) || 0,
    throughput_mbps: parseFloat(params.get('throughput_mbps')) || 0
  };
}

// Diagnostic path types
const DiagnosticPath = {
  DNS: 'dns',
  NETWORK: 'network',
  SYSTEM: 'system',
  APP_LAYER: 'app-layer'
};

// Path configurations with user messages
const pathConfigs = {
  [DiagnosticPath.DNS]: {
    message: "Based on what we've seen so far, let's check your DNS resolution.",
    nextScreen: 'dns-diagnostic.html',
    icon: '🌐'
  },
  [DiagnosticPath.NETWORK]: {
    message: "Based on what we've seen so far, let's check your network.",
    nextScreen: 'network-diagnostic.html',
    icon: '📡'
  },
  [DiagnosticPath.SYSTEM]: {
    message: "Based on what we've seen so far, let's check your system resources.",
    nextScreen: 'system-diagnostic.html',
    icon: '💻'
  },
  [DiagnosticPath.APP_LAYER]: {
    message: "Based on what we've seen so far, let's check your application layer.",
    nextScreen: 'app-diagnostic.html',
    icon: '🔧'
  }
};

/**
 * Determine which diagnostic path to take based on collected data
 *
 * Priority order:
 * 1. DNS path - If DNS issues detected (most specific)
 * 2. Network path - If high latency detected (general connectivity)
 * 3. System resource path - If system-level performance issues
 * 4. App-layer path - Default for application-specific issues
 *
 * @param {Object} diagnosticData - All collected diagnostic parameters
 * @returns {string} - The diagnostic path to take
 */
function determineDiagnosticPath(diagnosticData) {
  const {
    scope,
    target,
    timing,
    intermittent,
    recent_change,
    device,
    os,
    connection,
    high_latency,
    low_bandwidth,
    dns_issues,
    dns_ms,
    latency_ms,
    ttfb_ms,
    throughput_mbps
  } = diagnosticData;

  // Priority 1: DNS Issues
  if (dns_issues) {
    console.log('Branch decision: DNS path (DNS issues detected)');
    return DiagnosticPath.DNS;
  }

  // Priority 2: Network/Connectivity Issues
  if (high_latency) {
    console.log('Branch decision: Network path (high latency detected)');
    return DiagnosticPath.NETWORK;
  }

  // Priority 3: System Resource Issues
  // Indicators: single user affected + entire system slow
  // OR: local connection with low bandwidth (local resource constraint)
  // OR: system-level slowness (DNS/network issues already handled above)
  const systemResourceIndicators = (
    (scope === 'one' && target === 'system') ||
    (connection === 'local' && low_bandwidth) ||
    target === 'system'
  );

  if (systemResourceIndicators) {
    console.log('Branch decision: System resource path (system-level performance issues)');
    return DiagnosticPath.SYSTEM;
  }

  // Priority 4: Application Layer (Default)
  // For application/website specific issues, or unclear cases
  console.log('Branch decision: App-layer path (application-specific or default)');
  return DiagnosticPath.APP_LAYER;
}

/**
 * Show the path message to the user
 */
function showPathMessage(path) {
  const config = pathConfigs[path];
  const spinner = document.querySelector('.spinner');
  const pathMessage = document.getElementById('pathMessage');
  const messageText = document.getElementById('messageText');
  const messageIcon = document.querySelector('.message-icon');

  // Hide spinner
  if (spinner) {
    spinner.style.display = 'none';
  }

  // Update and show message
  if (messageIcon) {
    messageIcon.textContent = config.icon;
  }

  if (messageText) {
    messageText.textContent = config.message;
  }

  if (pathMessage) {
    pathMessage.style.display = 'block';
  }
}

/**
 * Navigate to the next screen based on selected path
 */
function navigateToPath(path, diagnosticData) {
  const config = pathConfigs[path];

  // Preserve all diagnostic data in URL parameters
  const params = new URLSearchParams(window.location.search);

  // Add the selected path
  params.set('diagnostic_path', path);

  // Navigate to next screen
  const nextUrl = `${config.nextScreen}?${params.toString()}`;

  console.log(`Navigating to: ${nextUrl}`);
  window.location.href = nextUrl;
}

/**
 * Show debug information (for development/testing)
 */
function showDebugInfo(diagnosticData, selectedPath) {
  // Only show in development (check for debug parameter)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('debug') !== 'true') {
    return;
  }

  const debugInfo = document.getElementById('debugInfo');
  const debugOutput = document.getElementById('debugOutput');

  if (debugInfo && debugOutput) {
    debugOutput.textContent = JSON.stringify({
      diagnosticData,
      selectedPath,
      pathConfig: pathConfigs[selectedPath]
    }, null, 2);

    debugInfo.style.display = 'block';
  }
}

/**
 * Utility function to delay execution
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} - Promise that resolves after the delay
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main execution
 */
async function initBranchSelection() {
  // Get all diagnostic data from URL parameters
  const diagnosticData = getUrlParams();

  // Determine which path to take
  const selectedPath = determineDiagnosticPath(diagnosticData);

  // Show debug info if enabled
  showDebugInfo(diagnosticData, selectedPath);

  // Initial processing delay for UX
  await sleep(1000);

  // Show the path message
  showPathMessage(selectedPath);

  // Delay to let user read the message
  await sleep(2000);

  // Navigate to the next screen
  navigateToPath(selectedPath, diagnosticData);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBranchSelection);
} else {
  initBranchSelection();
}
