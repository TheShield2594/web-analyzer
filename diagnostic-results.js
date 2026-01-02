/**
 * Screen 10: Results Summary
 *
 * Analyzes diagnostic data and displays the most likely bottleneck
 * with confidence level and recommendations.
 */

/**
 * Analyzes diagnostic parameters and determines the most likely bottleneck
 * @param {URLSearchParams} params - URL parameters from diagnostic flow
 * @returns {Object} Analysis results with bottleneck, confidence, and recommendations
 */
function analyzeBottleneck(params) {
  // Default result
  const result = {
    bottleneck: 'Unable to determine',
    confidence: 'Low',
    confidencePercent: 0,
    recommendations: []
  };

  // Extract key diagnostic signals
  const highLatency = params.get('high_latency') === 'true';
  const lowBandwidth = params.get('low_bandwidth') === 'true';
  const dnsIssues = params.get('dns_issues') === 'true';
  const vpnIssue = params.get('vpn_issue') === 'true';
  const slownessScope = params.get('slowness_scope');
  const diagnosticPath = params.get('diagnostic_path');
  const scope = params.get('scope');
  const timing = params.get('timing');
  const connection = params.get('connection');

  // Get numeric metrics if available
  const dnsMs = parseFloat(params.get('dns_ms')) || 0;
  const latencyMs = parseFloat(params.get('latency_ms')) || 0;
  const ttfbMs = parseFloat(params.get('ttfb_ms')) || 0;
  const throughputMbps = parseFloat(params.get('throughput_mbps')) || 0;

  // Analysis logic based on diagnostic signals
  let confidence = 0;
  let bottleneckType = '';
  let recommendations = [];

  // DNS Issues Analysis
  if (dnsIssues || dnsMs > 200) {
    bottleneckType = 'DNS resolution delays';
    confidence = dnsMs > 500 ? 85 : 72;
    recommendations = [
      'Clear your DNS cache using your operating system tools',
      'Try switching to a faster DNS provider (e.g., 8.8.8.8, 1.1.1.1)',
      'Check if your local DNS server is experiencing issues',
      'Verify that your hosts file doesn\'t have conflicting entries'
    ];
  }
  // High Latency Analysis
  else if (highLatency || latencyMs > 200) {
    if (vpnIssue) {
      bottleneckType = 'VPN connection overhead';
      confidence = 88;
      recommendations = [
        'Try connecting without VPN to verify the issue',
        'Switch to a geographically closer VPN server',
        'Consider using a different VPN protocol (WireGuard vs OpenVPN)',
        'Check if split-tunneling can exclude certain traffic'
      ];
    } else if (connection === 'wifi') {
      bottleneckType = 'Wi-Fi signal interference';
      confidence = 76;
      recommendations = [
        'Move closer to your Wi-Fi router',
        'Switch to 5GHz band if available for faster speeds',
        'Reduce interference from other devices',
        'Try using a wired Ethernet connection for comparison'
      ];
    } else if (latencyMs > 500) {
      bottleneckType = 'Network latency issues';
      confidence = 82;
      recommendations = [
        'Check if other devices on your network are consuming bandwidth',
        'Restart your router/modem',
        'Contact your ISP to check for service issues',
        'Run a traceroute to identify where delays occur'
      ];
    } else {
      bottleneckType = 'General network latency';
      confidence = 68;
      recommendations = [
        'Test your connection at different times of day',
        'Check for background applications consuming bandwidth',
        'Verify your network equipment is functioning properly'
      ];
    }
  }
  // Low Bandwidth Analysis
  else if (lowBandwidth || throughputMbps < 5) {
    if (slownessScope === 'everything') {
      bottleneckType = 'Network bandwidth saturation';
      confidence = 84;
      recommendations = [
        'Check if other devices or applications are using bandwidth',
        'Pause large downloads or streaming on other devices',
        'Upgrade your internet plan if consistently slow',
        'Run a speed test at different times to identify patterns'
      ];
    } else {
      bottleneckType = 'Application-specific bandwidth limits';
      confidence = 71;
      recommendations = [
        'Check if the application has bandwidth throttling settings',
        'Verify server-side rate limiting isn\'t affecting you',
        'Try accessing from a different network to compare'
      ];
    }
  }
  // Server Response Time Analysis
  else if (ttfbMs > 1000) {
    bottleneckType = 'Server response time delays';
    confidence = 79;
    recommendations = [
      'Check server status pages for known issues',
      'Try accessing during off-peak hours',
      'Clear browser cache and cookies',
      'Verify the server isn\'t under heavy load'
    ];
  }
  // Timing-Based Analysis
  else if (timing === 'intermittent') {
    bottleneckType = 'Intermittent network instability';
    confidence = 65;
    recommendations = [
      'Monitor your connection over a longer period',
      'Check for scheduled maintenance windows',
      'Look for patterns in when the issues occur',
      'Consider environmental factors (time of day, network congestion)'
    ];
  }
  // Scope-Based Analysis
  else if (scope === 'single-page') {
    bottleneckType = 'Specific resource or endpoint issue';
    confidence = 70;
    recommendations = [
      'Check browser developer tools for failed requests',
      'Look for specific assets taking longer to load',
      'Verify the page doesn\'t have broken or slow third-party resources',
      'Try hard-refreshing the page (Ctrl+Shift+R or Cmd+Shift+R)'
    ];
  }
  // Network Diagnostic Path
  else if (diagnosticPath === 'network') {
    bottleneckType = 'Network infrastructure issues';
    confidence = 73;
    recommendations = [
      'Run network diagnostics on your operating system',
      'Check physical network connections',
      'Verify router and modem are functioning correctly',
      'Consider contacting your network administrator or ISP'
    ];
  }
  // Default analysis for insufficient data
  else {
    bottleneckType = 'Insufficient diagnostic data';
    confidence = 45;
    recommendations = [
      'Run the diagnostic wizard again with more detailed metrics',
      'Enable manual metrics input for more accurate analysis',
      'Check basic connectivity using ping and traceroute',
      'Monitor the issue over time to identify patterns'
    ];
  }

  // Format confidence level
  let confidenceLabel = 'Low';
  if (confidence >= 80) {
    confidenceLabel = 'High';
  } else if (confidence >= 60) {
    confidenceLabel = 'Medium';
  }

  result.bottleneck = bottleneckType;
  result.confidence = confidenceLabel;
  result.confidencePercent = confidence;
  result.recommendations = recommendations;

  return result;
}

/**
 * Displays the analysis results on the page
 */
function displayResults() {
  const params = new URLSearchParams(window.location.search);
  const analysis = analyzeBottleneck(params);

  // Update bottleneck display
  const bottleneckElement = document.getElementById('bottleneckResult');
  if (bottleneckElement) {
    bottleneckElement.textContent = analysis.bottleneck;
  }

  // Update confidence display
  const confidenceElement = document.getElementById('confidenceValue');
  if (confidenceElement) {
    confidenceElement.textContent = `${analysis.confidence} (${analysis.confidencePercent}%)`;
  }

  // Display recommendations
  if (analysis.recommendations.length > 0) {
    const recommendationsSection = document.getElementById('recommendationsSection');
    const recommendationsList = document.getElementById('recommendationsList');

    if (recommendationsSection && recommendationsList) {
      recommendationsSection.style.display = 'block';

      analysis.recommendations.forEach(recommendation => {
        const li = document.createElement('li');
        li.className = 'recommendation-item';
        li.textContent = recommendation;
        recommendationsList.appendChild(li);
      });
    }
  }

  // Display diagnostic summary
  displayDiagnosticSummary(params);
}

/**
 * Displays the collected diagnostic parameters
 * @param {URLSearchParams} params - URL parameters from diagnostic flow
 */
function displayDiagnosticSummary(params) {
  const summaryContainer = document.getElementById('diagnosticSummary');

  if (!summaryContainer) return;

  const summary = document.createElement('details');
  summary.style.marginTop = '16px';

  const summaryTitle = document.createElement('summary');
  summaryTitle.textContent = 'View Diagnostic Data';
  summaryTitle.style.fontSize = '14px';
  summaryTitle.style.fontWeight = '600';
  summaryTitle.style.color = '#475569';
  summaryTitle.style.cursor = 'pointer';
  summaryTitle.style.padding = '12px 0';
  summary.appendChild(summaryTitle);

  const diagnosticData = document.createElement('div');
  diagnosticData.className = 'diagnostic-info-container';

  // Group parameters by category
  const categories = {
    'Scope & Target': ['scope', 'target'],
    'Timing Pattern': ['timing', 'intermittent', 'recent_change'],
    'Environment': ['device', 'os', 'connection'],
    'Quick Checks': ['high_latency', 'low_bandwidth', 'dns_issues'],
    'Metrics': ['dns_ms', 'latency_ms', 'ttfb_ms', 'throughput_mbps'],
    'Diagnostic Path': ['diagnostic_path'],
    'Network Diagnostic': ['vpn_issue', 'slowness_scope']
  };

  Object.entries(categories).forEach(([categoryName, keys]) => {
    const categoryParams = keys.filter(key => params.has(key));

    if (categoryParams.length > 0) {
      const categorySection = document.createElement('div');
      categorySection.style.marginTop = '16px';

      const categoryTitle = document.createElement('h4');
      categoryTitle.textContent = categoryName;
      categoryTitle.style.fontSize = '13px';
      categoryTitle.style.fontWeight = '600';
      categoryTitle.style.color = '#475569';
      categoryTitle.style.marginBottom = '8px';
      categorySection.appendChild(categoryTitle);

      const paramsList = document.createElement('ul');
      paramsList.className = 'diagnostic-params-list';

      categoryParams.forEach(key => {
        const value = params.get(key);
        const li = document.createElement('li');

        // Format the key for display
        const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

        // Format values
        let displayValue = value;
        if (value === 'true') displayValue = 'Yes';
        if (value === 'false') displayValue = 'No';

        li.innerHTML = `<strong>${formattedKey}:</strong> ${displayValue}`;
        paramsList.appendChild(li);
      });

      categorySection.appendChild(paramsList);
      diagnosticData.appendChild(categorySection);
    }
  });

  summary.appendChild(diagnosticData);
  summaryContainer.appendChild(summary);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', displayResults);
} else {
  displayResults();
}
