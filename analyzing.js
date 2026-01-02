/**
 * Screen 9: Analysis Loading Screen
 *
 * Simple loading screen that processes diagnostic data
 * and navigates to the results page.
 */

/**
 * Utility function to delay execution
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} - Promise that resolves after the delay
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Main execution
 */
async function initAnalyzing() {
  // Preserve all URL parameters from previous screens
  const params = new URLSearchParams(window.location.search);

  // Show loading animation for a reasonable duration
  await sleep(2500);

  // Navigate to results screen with all diagnostic data
  const nextUrl = `diagnostic-results.html?${params.toString()}`;
  console.log(`Analysis complete. Navigating to: ${nextUrl}`);
  window.location.href = nextUrl;
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAnalyzing);
} else {
  initAnalyzing();
}
