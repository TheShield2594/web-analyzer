/**
 * Screen 7: Targeted Follow-Up (Network)
 *
 * This screen collects network-specific diagnostic information:
 * - Whether the issue occurs when not on VPN
 * - Whether file downloads or apps are affected (conditional follow-up)
 */

/**
 * Handles the VPN issue radio button change
 * Shows/hides the follow-up question based on selection
 */
function handleVpnIssueChange() {
  const vpnYes = document.getElementById('vpn-yes');
  const vpnNo = document.getElementById('vpn-no');
  const followupSection = document.getElementById('followup-section');
  const vpnError = document.getElementById('vpn-error');
  const slownessError = document.getElementById('slowness-error');

  // Clear validation error when user selects an option
  if (vpnError) {
    vpnError.hidden = true;
  }

  // Show follow-up question if "Yes" or "No" is selected
  // Hide if "Not applicable" is selected
  if (followupSection) {
    const shouldShowFollowup = vpnYes?.checked || vpnNo?.checked;
    followupSection.hidden = !shouldShowFollowup;

    // Clear follow-up validation error when hiding the section
    if (!shouldShowFollowup && slownessError) {
      slownessError.hidden = true;
    }

    // Clear follow-up selection when hiding
    if (!shouldShowFollowup) {
      const slownessRadios = document.querySelectorAll('input[name="slowness-scope"]');
      slownessRadios.forEach(radio => {
        radio.checked = false;
      });
    }
  }
}

/**
 * Handles the slowness scope radio button change
 * Clears validation errors
 */
function handleSlownessScopeChange() {
  const slownessError = document.getElementById('slowness-error');

  // Clear validation error when user selects an option
  if (slownessError) {
    slownessError.hidden = true;
  }
}

/**
 * Handles the network diagnostic form submission
 * @param {Event} event - The form submission event
 */
function handleNetworkDiagnosticFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const vpnIssue = formData.get('vpn-issue');
  const slownessScope = formData.get('slowness-scope');

  const vpnError = document.getElementById('vpn-error');
  const slownessError = document.getElementById('slowness-error');
  const followupSection = document.getElementById('followup-section');

  let hasError = false;

  // Validate VPN question
  if (!vpnIssue) {
    if (vpnError) {
      vpnError.hidden = false;
    }

    // Focus the first radio button for accessibility
    const firstRadio = document.getElementById('vpn-yes');
    if (firstRadio) {
      firstRadio.focus();
    }

    hasError = true;
  }

  // Validate follow-up question if visible
  const isFollowupVisible = followupSection && !followupSection.hidden;
  if (isFollowupVisible && !slownessScope) {
    if (slownessError) {
      slownessError.hidden = false;
    }

    // Focus the first radio button of follow-up for accessibility
    const firstFollowupRadio = document.getElementById('slowness-both');
    if (firstFollowupRadio) {
      firstFollowupRadio.focus();
    }

    hasError = true;
  }

  // Don't proceed if there are validation errors
  if (hasError) {
    return;
  }

  // Log the selected values (for debugging/analytics)
  console.log('Network diagnostic - VPN issue:', vpnIssue);
  console.log('Network diagnostic - Slowness scope:', slownessScope || 'N/A');

  // Navigate to the next screen with all query parameters
  const params = new URLSearchParams(window.location.search);

  // Set network diagnostic parameters
  params.set('vpn_issue', vpnIssue);

  // Only set slowness scope if it was answered
  if (slownessScope) {
    params.set('slowness_scope', slownessScope);
  } else {
    // Remove the parameter if it exists but wasn't answered this time
    params.delete('slowness_scope');
  }

  // Navigate to the analysis loading screen
  window.location.href = `analyzing.html?${params.toString()}`;
}

// Initialize form handlers and radio change listeners when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const networkForm = document.querySelector('.network-diagnostic-form');
  if (networkForm) {
    networkForm.addEventListener('submit', handleNetworkDiagnosticFormSubmit);
  }

  // Add change listeners to VPN issue radio buttons
  const vpnRadios = document.querySelectorAll('input[name="vpn-issue"]');
  vpnRadios.forEach(radio => {
    radio.addEventListener('change', handleVpnIssueChange);
  });

  // Add change listeners to slowness scope radio buttons
  const slownessRadios = document.querySelectorAll('input[name="slowness-scope"]');
  slownessRadios.forEach(radio => {
    radio.addEventListener('change', handleSlownessScopeChange);
  });

  // Initialize follow-up section visibility for any pre-selected radio
  handleVpnIssueChange();
});
