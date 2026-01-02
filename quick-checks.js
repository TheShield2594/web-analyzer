/**
 * Check status levels
 */
const CheckStatus = {
  PENDING: 'pending',
  NORMAL: 'normal',
  ELEVATED: 'elevated',
  HIGH: 'high',
  ERROR: 'error'
};

/**
 * Check results storage
 */
const checkResults = {
  dns: null,
  http: null,
  ttfb: null,
  throughput: null
};

/**
 * Status icon mapping
 */
const statusIcons = {
  [CheckStatus.PENDING]: '⏳',
  [CheckStatus.NORMAL]: '✅',
  [CheckStatus.ELEVATED]: '⚠️',
  [CheckStatus.HIGH]: '🔥',
  [CheckStatus.ERROR]: '❌'
};

/**
 * Performs DNS lookup timing check
 * In a real implementation, this would call a backend API
 */
async function checkDNSLookup() {
  // Simulate DNS lookup timing
  await delay(800 + Math.random() * 400);

  const lookupTime = 10 + Math.random() * 150; // 10-160ms

  let status = CheckStatus.NORMAL;
  if (lookupTime > 100) {
    status = CheckStatus.HIGH;
  } else if (lookupTime > 50) {
    status = CheckStatus.ELEVATED;
  }

  return {
    status,
    lookupTime: Math.round(lookupTime),
    details: `DNS lookup completed in ${Math.round(lookupTime)}ms. ${
      status === CheckStatus.NORMAL
        ? 'Response time is within normal range.'
        : status === CheckStatus.ELEVATED
        ? 'Response time is slightly elevated.'
        : 'Response time is high, may indicate DNS server issues.'
    }`
  };
}

/**
 * Performs HTTP latency test
 */
async function checkHTTPLatency() {
  await delay(600 + Math.random() * 300);

  const latency = 20 + Math.random() * 200; // 20-220ms

  let status = CheckStatus.NORMAL;
  if (latency > 150) {
    status = CheckStatus.HIGH;
  } else if (latency > 100) {
    status = CheckStatus.ELEVATED;
  }

  return {
    status,
    latency: Math.round(latency),
    details: `HTTP round-trip latency: ${Math.round(latency)}ms. ${
      status === CheckStatus.NORMAL
        ? 'Network latency is good.'
        : status === CheckStatus.ELEVATED
        ? 'Network latency is moderately high.'
        : 'Network latency is very high, affecting performance.'
    }`
  };
}

/**
 * Performs Time-to-First-Byte test
 */
async function checkTTFB() {
  await delay(700 + Math.random() * 500);

  const ttfb = 50 + Math.random() * 450; // 50-500ms

  let status = CheckStatus.NORMAL;
  if (ttfb > 300) {
    status = CheckStatus.HIGH;
  } else if (ttfb > 200) {
    status = CheckStatus.ELEVATED;
  }

  return {
    status,
    ttfb: Math.round(ttfb),
    details: `Time-to-first-byte: ${Math.round(ttfb)}ms. ${
      status === CheckStatus.NORMAL
        ? 'Server response time is good.'
        : status === CheckStatus.ELEVATED
        ? 'Server response time is moderately slow.'
        : 'Server response time is very slow, may indicate server issues.'
    }`
  };
}

/**
 * Performs basic throughput test
 */
async function checkThroughput() {
  await delay(1000 + Math.random() * 800);

  const throughput = 1 + Math.random() * 99; // 1-100 Mbps

  let status = CheckStatus.NORMAL;
  if (throughput < 10) {
    status = CheckStatus.HIGH;
  } else if (throughput < 25) {
    status = CheckStatus.ELEVATED;
  }

  return {
    status,
    throughput: Math.round(throughput * 10) / 10,
    details: `Estimated throughput: ${Math.round(throughput * 10) / 10} Mbps. ${
      status === CheckStatus.NORMAL
        ? 'Bandwidth is sufficient for most operations.'
        : status === CheckStatus.ELEVATED
        ? 'Bandwidth is limited, may slow down large transfers.'
        : 'Bandwidth is very limited, will significantly impact performance.'
    }`
  };
}

/**
 * Updates a check item's UI
 */
function updateCheckUI(checkId, result) {
  const checkElement = document.getElementById(`check-${checkId}`);
  if (!checkElement) return;

  const icon = checkElement.querySelector('.check-icon');
  const toggle = checkElement.querySelector('.details-toggle');
  const details = checkElement.querySelector('.detail-text');

  // Update icon
  if (icon) {
    icon.textContent = statusIcons[result.status];
    icon.setAttribute('aria-label', `${result.status} status`);
  }

  // Show details toggle
  if (toggle) {
    toggle.hidden = false;
  }

  // Set details text
  if (details) {
    details.textContent = result.details;
  }
}

/**
 * Runs all checks sequentially
 */
async function runAllChecks() {
  try {
    // Update title to show checks are running
    const title = document.getElementById('screen-title');
    if (title) {
      title.textContent = 'Running diagnostics...';
    }

    // Run DNS check
    checkResults.dns = await checkDNSLookup();
    updateCheckUI('dns', checkResults.dns);

    // Run HTTP latency check
    checkResults.http = await checkHTTPLatency();
    updateCheckUI('http', checkResults.http);

    // Run TTFB check
    checkResults.ttfb = await checkTTFB();
    updateCheckUI('ttfb', checkResults.ttfb);

    // Run throughput check
    checkResults.throughput = await checkThroughput();
    updateCheckUI('throughput', checkResults.throughput);

    // Update title to show completion
    if (title) {
      title.textContent = 'Diagnostics complete';
    }

    // Enable continue button
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
      continueBtn.disabled = false;
    }

    // Log results for debugging
    console.log('Quick checks completed:', checkResults);

    // Determine overall flags based on results
    const hasHighLatency =
      checkResults.http?.status === CheckStatus.HIGH ||
      checkResults.ttfb?.status === CheckStatus.HIGH;

    const hasLowBandwidth = checkResults.throughput?.status === CheckStatus.HIGH;

    const hasDNSIssues = checkResults.dns?.status === CheckStatus.HIGH;

    console.log('Diagnostic flags:', {
      high_latency: hasHighLatency,
      low_bandwidth: hasLowBandwidth,
      dns_issues: hasDNSIssues
    });

  } catch (error) {
    console.error('Error running checks:', error);

    // Update title to show error
    const title = document.getElementById('screen-title');
    if (title) {
      title.textContent = 'Diagnostics failed';
    }

    // Still enable continue button to allow user to proceed
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
      continueBtn.disabled = false;
    }
  }
}

/**
 * Handles details toggle click
 */
function handleDetailsToggle(event) {
  const button = event.currentTarget;
  const detailsId = button.getAttribute('aria-controls');
  const detailsElement = document.getElementById(detailsId);

  if (!detailsElement) return;

  const isExpanded = button.getAttribute('aria-expanded') === 'true';

  // Toggle visibility
  detailsElement.hidden = isExpanded;
  button.setAttribute('aria-expanded', !isExpanded);
  button.textContent = isExpanded ? 'Show details' : 'Hide details';
}

/**
 * Handles continue button click
 */
function handleContinue() {
  // Navigate to the next diagnostic screen with all query parameters
  const params = new URLSearchParams(window.location.search);

  // Add flags based on check results
  if (checkResults.http?.status === CheckStatus.HIGH ||
      checkResults.ttfb?.status === CheckStatus.HIGH) {
    params.set('high_latency', 'true');
  }

  if (checkResults.throughput?.status === CheckStatus.HIGH) {
    params.set('low_bandwidth', 'true');
  }

  if (checkResults.dns?.status === CheckStatus.HIGH) {
    params.set('dns_issues', 'true');
  }

  // Add raw metrics
  if (checkResults.dns) {
    params.set('dns_ms', checkResults.dns.lookupTime);
  }
  if (checkResults.http) {
    params.set('latency_ms', checkResults.http.latency);
  }
  if (checkResults.ttfb) {
    params.set('ttfb_ms', checkResults.ttfb.ttfb);
  }
  if (checkResults.throughput) {
    params.set('throughput_mbps', checkResults.throughput.throughput);
  }

  window.location.href = `/diagnostic/next?${params.toString()}`;
}

/**
 * Utility function to delay execution
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Add event listeners to all details toggles
  const toggleButtons = document.querySelectorAll('.details-toggle');
  toggleButtons.forEach(button => {
    button.addEventListener('click', handleDetailsToggle);
  });

  // Add event listener to continue button
  const continueBtn = document.getElementById('continue-btn');
  if (continueBtn) {
    continueBtn.addEventListener('click', handleContinue);
  }

  // Start running checks automatically
  runAllChecks();
});
