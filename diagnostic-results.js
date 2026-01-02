/**
 * Screen 10: Results Summary
 *
 * Analyzes diagnostic data and displays the most likely bottleneck
 * with confidence level and recommendations.
 */

// Global variable to store diagnostic rules
let diagnosticRules = null;

/**
 * Load diagnostic rules from JSON file
 * @returns {Promise<Object>} Rules object
 */
async function loadDiagnosticRules() {
  if (diagnosticRules) {
    return diagnosticRules;
  }

  try {
    const response = await fetch('diagnostic-rules.json');
    diagnosticRules = await response.json();
    return diagnosticRules;
  } catch (error) {
    console.error('Failed to load diagnostic rules:', error);
    return null;
  }
}

/**
 * Transform URL parameters into signals for the diagnostic engine
 * @param {URLSearchParams} params - URL parameters from diagnostic flow
 * @returns {Object} Signals object for the diagnostic engine
 */
function extractSignals(params) {
  const signals = {};

  // Affected users mapping
  const scope = params.get('scope');
  if (scope === 'one') signals.affected_users = 'one';
  else if (scope === 'multiple') signals.affected_users = 'multiple';
  else if (scope === 'everyone') signals.affected_users = 'everyone';

  // Timing pattern
  signals.timing_pattern = params.get('timing') || '';

  // DNS latency
  const dnsMs = parseFloat(params.get('dns_ms'));
  if (!isNaN(dnsMs)) signals.dns_latency_ms = dnsMs;

  // Network latency
  const latencyMs = parseFloat(params.get('latency_ms'));
  if (!isNaN(latencyMs)) signals.network_latency_ms = latencyMs;

  // Packet loss (assume 0 if not specified)
  signals.packet_loss_percent = parseFloat(params.get('packet_loss_percent')) || 0;

  // Disk latency
  const diskLatency = parseFloat(params.get('disk_latency'));
  if (!isNaN(diskLatency)) signals.disk_latency_ms = diskLatency;

  // CPU usage
  const cpuUsage = parseFloat(params.get('cpu_usage'));
  if (!isNaN(cpuUsage)) signals.cpu_usage_percent = cpuUsage;

  // Load average
  const loadAvg = parseFloat(params.get('load_average'));
  if (!isNaN(loadAvg)) signals.load_average = loadAvg;

  // Memory pressure
  signals.memory_pressure = params.get('memory_pressure') === 'true';

  // Memory usage percentage
  const memUsage = parseFloat(params.get('memory_usage'));
  if (!isNaN(memUsage)) signals.memory_usage_percent = memUsage;

  // App specific
  const target = params.get('target');
  signals.app_specific = target === 'app' || target === 'website';

  // VPN in use
  signals.vpn_in_use = params.get('vpn_issue') === 'yes' || params.get('vpn_issue') === 'true';

  // Recent change
  signals.recent_change = params.get('recent_change') === 'true';

  // TTFB
  const ttfbMs = parseFloat(params.get('ttfb_ms'));
  if (!isNaN(ttfbMs)) signals.ttfb_ms = ttfbMs;

  // Throughput
  const throughputMbps = parseFloat(params.get('throughput_mbps'));
  if (!isNaN(throughputMbps)) signals.throughput_mbps = throughputMbps;

  return signals;
}

/**
 * Map diagnostic engine result to legacy format
 * @param {Object} engineResult - Result from diagnostic engine
 * @returns {Object} Legacy format result
 */
function mapEngineResultToLegacy(engineResult) {
  // Map cause names to bottleneck descriptions
  const bottleneckNames = {
    dns: 'DNS resolution delays',
    network: 'Network latency issues',
    disk: 'Disk I/O bottleneck',
    cpu: 'CPU saturation',
    memory: 'Memory pressure',
    application: 'Application-layer issues',
    vpn: 'VPN connection overhead',
    bandwidth: 'Network bandwidth saturation',
    unknown: 'Insufficient diagnostic data'
  };

  const bottleneck = bottleneckNames[engineResult.primary_cause] || engineResult.primary_cause;

  // Generate explanation based on primary cause
  const explanations = {
    dns: 'DNS resolution happens before any network request. High DNS times indicate your system is waiting for domain name lookups to complete before it can even start connecting to the server.',
    network: 'High network latency means packets are taking a long time to travel between your device and servers. This could be due to network congestion, routing issues, or problems with your ISP\'s infrastructure.',
    disk: 'Disk I/O bottlenecks occur when your storage device cannot keep up with read/write demands. This is often characterized by high latency with low CPU usage, indicating the system is waiting for disk operations.',
    cpu: 'CPU saturation means your processor is working at or near maximum capacity. This leaves little headroom for additional work and causes delays in processing requests.',
    memory: 'Memory pressure occurs when your system is running low on available RAM and may be swapping to disk. This significantly degrades performance as disk is much slower than RAM.',
    application: 'Application-layer issues are problems within the specific software or service, such as inefficient code, database queries, or resource contention within the application itself.',
    vpn: 'VPNs encrypt and route your traffic through remote servers, adding extra network hops. This encryption and routing overhead increases latency, especially with distant servers or slower VPN protocols.',
    bandwidth: 'When your network bandwidth is fully utilized, all devices and applications compete for limited capacity. This creates a bottleneck where data transfer speeds are constrained by your internet connection\'s maximum throughput.',
    unknown: 'Without sufficient diagnostic data, it\'s difficult to pinpoint the exact bottleneck. Performance issues can stem from many sources including network, server, or application-level problems. More detailed metrics help isolate the root cause.'
  };

  return {
    bottleneck: bottleneck,
    confidence: engineResult.confidence_level,
    confidencePercent: engineResult.confidence_percent,
    evidence: engineResult.evidence,
    nextSteps: engineResult.next_steps,
    explanation: explanations[engineResult.primary_cause] || '',
    recommendations: engineResult.next_steps,
    _engineResult: engineResult // Keep original for debugging
  };
}

/**
 * Analyzes diagnostic parameters and determines the most likely bottleneck
 * @param {URLSearchParams} params - URL parameters from diagnostic flow
 * @returns {Object} Analysis results with bottleneck, confidence, and recommendations
 */
async function analyzeBottleneckWithEngine(params) {
  // Try to use the rule-based engine
  const rules = await loadDiagnosticRules();

  if (rules && typeof DiagnosticEngine !== 'undefined') {
    try {
      const signals = extractSignals(params);
      const engine = new DiagnosticEngine(rules);
      const result = engine.analyze(signals);

      console.log('Diagnostic Engine Result:', result);
      console.log('Signals:', signals);

      return mapEngineResultToLegacy(result);
    } catch (error) {
      console.error('Error running diagnostic engine:', error);
      // Fall back to legacy analysis
    }
  }

  // Fallback to legacy analysis if engine is not available
  return analyzeBottleneckLegacy(params);
}

/**
 * Legacy bottleneck analysis (original implementation)
 * @param {URLSearchParams} params - URL parameters from diagnostic flow
 * @returns {Object} Analysis results with bottleneck, confidence, and recommendations
 */
function analyzeBottleneckLegacy(params) {
  // Default result
  const result = {
    bottleneck: 'Unable to determine',
    confidence: 'Low',
    confidencePercent: 0,
    evidence: [],
    nextSteps: [],
    explanation: '',
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
  let evidence = [];
  let nextSteps = [];
  let explanation = '';
  let recommendations = [];

  // DNS Issues Analysis
  if (dnsIssues || dnsMs > 200) {
    bottleneckType = 'DNS resolution delays';
    confidence = dnsMs > 500 ? 85 : 72;
    evidence = [
      `DNS lookup time: ${dnsMs}ms (normal: <100ms)`,
      'High DNS resolution latency detected',
      'Issue occurs before establishing connection'
    ];
    nextSteps = [
      'Switch to a public DNS server (8.8.8.8 or 1.1.1.1)',
      'Flush your DNS cache',
      'Check DNS server response times with dig/nslookup'
    ];
    explanation = 'DNS resolution happens before any network request. High DNS times indicate your system is waiting for domain name lookups to complete before it can even start connecting to the server.';
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
      evidence = [
        `Network latency: ${latencyMs}ms (normal: <100ms)`,
        'VPN connection confirmed',
        'Extra routing hops through VPN server'
      ];
      nextSteps = [
        'Temporarily disable VPN to test',
        'Select a closer VPN server location',
        'Switch VPN protocol (try WireGuard for lower latency)'
      ];
      explanation = 'VPNs encrypt and route your traffic through remote servers, adding extra network hops. This encryption and routing overhead increases latency, especially with distant servers or slower VPN protocols.';
      recommendations = [
        'Try connecting without VPN to verify the issue',
        'Switch to a geographically closer VPN server',
        'Consider using a different VPN protocol (WireGuard vs OpenVPN)',
        'Check if split-tunneling can exclude certain traffic'
      ];
    } else if (connection === 'wifi') {
      bottleneckType = 'Wi-Fi signal interference';
      confidence = 76;
      evidence = [
        `Network latency: ${latencyMs}ms`,
        'Connected via Wi-Fi',
        'Wireless interference likely affecting signal'
      ];
      nextSteps = [
        'Move closer to your router',
        'Switch to 5GHz Wi-Fi band if available',
        'Test with wired Ethernet connection'
      ];
      explanation = 'Wi-Fi signals can be affected by distance, physical obstacles, and interference from other devices. This causes packet retransmissions and variable latency that wired connections don\'t experience.';
      recommendations = [
        'Move closer to your Wi-Fi router',
        'Switch to 5GHz band if available for faster speeds',
        'Reduce interference from other devices',
        'Try using a wired Ethernet connection for comparison'
      ];
    } else if (latencyMs > 500) {
      bottleneckType = 'Network latency issues';
      confidence = 82;
      evidence = [
        `Severe latency: ${latencyMs}ms (normal: <100ms)`,
        'Consistent high ping times',
        'Affects all network requests'
      ];
      nextSteps = [
        'Run traceroute to identify bottleneck location',
        'Restart your router and modem',
        'Contact ISP to check for service issues'
      ];
      explanation = 'High network latency means packets are taking a long time to travel between your device and servers. This could be due to network congestion, routing issues, or problems with your ISP\'s infrastructure.';
      recommendations = [
        'Check if other devices on your network are consuming bandwidth',
        'Restart your router/modem',
        'Contact your ISP to check for service issues',
        'Run a traceroute to identify where delays occur'
      ];
    } else {
      bottleneckType = 'General network latency';
      confidence = 68;
      evidence = [
        `Elevated latency: ${latencyMs}ms`,
        'Network response slower than expected',
        'Multiple factors could be contributing'
      ];
      nextSteps = [
        'Test at different times of day',
        'Check for bandwidth-heavy applications',
        'Verify network equipment is functioning'
      ];
      explanation = 'Moderate network latency can result from various factors including network congestion, distance to servers, or local network issues. It\'s important to isolate the specific cause through testing.';
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
      evidence = [
        `Throughput: ${throughputMbps} Mbps (expected: >10 Mbps)`,
        'Affects all applications and devices',
        'Consistent low bandwidth measurements'
      ];
      nextSteps = [
        'Pause downloads/streaming on other devices',
        'Run speed test to confirm available bandwidth',
        'Check router for bandwidth-heavy connections'
      ];
      explanation = 'When your network bandwidth is fully utilized, all devices and applications compete for limited capacity. This creates a bottleneck where data transfer speeds are constrained by your internet connection\'s maximum throughput.';
      recommendations = [
        'Check if other devices or applications are using bandwidth',
        'Pause large downloads or streaming on other devices',
        'Upgrade your internet plan if consistently slow',
        'Run a speed test at different times to identify patterns'
      ];
    } else {
      bottleneckType = 'Application-specific bandwidth limits';
      confidence = 71;
      evidence = [
        `Low throughput: ${throughputMbps} Mbps`,
        'Only affects specific application or service',
        'Other services perform normally'
      ];
      nextSteps = [
        'Check application bandwidth settings',
        'Verify no server-side rate limiting',
        'Test from different network to compare'
      ];
      explanation = 'Some applications or servers implement bandwidth throttling to manage load or enforce fair usage. This creates an artificial ceiling on transfer speeds even when your network has available capacity.';
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
    evidence = [
      `TTFB: ${ttfbMs}ms (normal: <200ms)`,
      'Server taking long to process requests',
      'Network latency is normal, server is slow'
    ];
    nextSteps = [
      'Check server status page for outages',
      'Try accessing during off-peak hours',
      'Monitor server response times over time'
    ];
    explanation = 'Time To First Byte (TTFB) measures how long the server takes to start responding. High TTFB indicates the server is busy processing your request, not a network issue. This could be due to server load, slow database queries, or inefficient backend code.';
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
    evidence = [
      'Performance varies over time',
      'No consistent pattern detected',
      'Issue comes and goes unpredictably'
    ];
    nextSteps = [
      'Monitor connection over extended period',
      'Note times when issues occur',
      'Check for patterns (time of day, specific actions)'
    ];
    explanation = 'Intermittent issues are often caused by temporary conditions like network congestion during peak hours, wireless interference, or periodic server load. Identifying when issues occur helps narrow down the root cause.';
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
    evidence = [
      'Only one page or resource affected',
      'Other pages load normally',
      'Isolated to specific endpoint'
    ];
    nextSteps = [
      'Inspect browser DevTools Network tab',
      'Identify which specific resource is slow',
      'Check for failed or hanging requests'
    ];
    explanation = 'When only specific pages or resources are slow, the bottleneck is likely with that particular asset or API endpoint. This could be due to large file sizes, slow third-party scripts, or backend issues with specific endpoints.';
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
    evidence = [
      'Network diagnostics indicate problems',
      'Infrastructure-level issues detected',
      'Affects multiple services'
    ];
    nextSteps = [
      'Run system network diagnostics',
      'Check physical cable connections',
      'Restart network equipment'
    ];
    explanation = 'Network infrastructure problems occur at the hardware or routing level, affecting all traffic. This includes issues with routers, switches, cables, or ISP routing problems that impact your entire connection.';
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
    evidence = [
      'Limited diagnostic information available',
      'Unable to isolate specific cause',
      'More data needed for accurate diagnosis'
    ];
    nextSteps = [
      'Re-run diagnostic with manual metrics',
      'Collect more detailed measurements',
      'Monitor performance over longer period'
    ];
    explanation = 'Without sufficient diagnostic data, it\'s difficult to pinpoint the exact bottleneck. Performance issues can stem from many sources including network, server, or application-level problems. More detailed metrics help isolate the root cause.';
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
  result.evidence = evidence;
  result.nextSteps = nextSteps;
  result.explanation = explanation;
  result.recommendations = recommendations;

  return result;
}

/**
 * Displays the analysis results on the page
 */
async function displayResults() {
  const params = new URLSearchParams(window.location.search);
  const analysis = await analyzeBottleneckWithEngine(params);

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

  // Display evidence
  if (analysis.evidence.length > 0) {
    const evidenceSection = document.getElementById('evidenceSection');
    const evidenceList = document.getElementById('evidenceList');

    if (evidenceSection && evidenceList) {
      evidenceSection.style.display = 'block';

      analysis.evidence.forEach(item => {
        const li = document.createElement('li');
        li.className = 'evidence-item';
        li.textContent = item;
        evidenceList.appendChild(li);
      });
    }
  }

  // Display next steps
  if (analysis.nextSteps.length > 0) {
    const nextStepsSection = document.getElementById('nextStepsSection');
    const nextStepsList = document.getElementById('nextStepsList');

    if (nextStepsSection && nextStepsList) {
      nextStepsSection.style.display = 'block';

      analysis.nextSteps.forEach(step => {
        const li = document.createElement('li');
        li.className = 'next-step-item';
        li.textContent = step;
        nextStepsList.appendChild(li);
      });
    }
  }

  // Display "Teach me why" explanation
  if (analysis.explanation) {
    const teachMeSection = document.getElementById('teachMeSection');
    const teachMeText = document.getElementById('teachMeText');

    if (teachMeSection && teachMeText) {
      teachMeSection.style.display = 'block';
      teachMeText.textContent = analysis.explanation;

      // Set up toggle functionality
      setupTeachMeToggle();
    }
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
 * Sets up the "Teach me why" toggle functionality
 */
function setupTeachMeToggle() {
  const toggle = document.getElementById('teachMeToggle');
  const content = document.getElementById('teachMeContent');

  if (!toggle || !content) return;

  toggle.addEventListener('click', () => {
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

    // Toggle state
    toggle.setAttribute('aria-expanded', !isExpanded);
    toggle.classList.toggle('expanded');
    content.classList.toggle('visible');
  });
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
