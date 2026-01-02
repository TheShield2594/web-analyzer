/**
 * Handles the environment form submission
 * @param {Event} event - The form submission event
 */
function handleEnvironmentFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const deviceType = formData.get('device-type');
  const os = formData.get('os');
  const connection = formData.get('connection');

  // Validate that all three fields are selected
  if (!deviceType || !os || !connection) {
    // Show error message
    const errorMessage = document.getElementById('environment-error');
    if (errorMessage) {
      errorMessage.hidden = false;
    }

    // Focus the first empty field for accessibility
    if (!deviceType) {
      const firstDeviceRadio = document.getElementById('device-desktop');
      if (firstDeviceRadio) {
        firstDeviceRadio.focus();
      }
    } else if (!os) {
      const firstOsRadio = document.getElementById('os-windows');
      if (firstOsRadio) {
        firstOsRadio.focus();
      }
    } else if (!connection) {
      const firstConnectionRadio = document.getElementById('connection-local');
      if (firstConnectionRadio) {
        firstConnectionRadio.focus();
      }
    }

    return;
  }

  // Log the selected environment details (for debugging/analytics)
  console.log('Environment selected:', {
    device: deviceType,
    os: os,
    connection: connection
  });

  // Navigate to the next diagnostic screen with all query parameters
  const params = new URLSearchParams(window.location.search);

  // Add environment parameters
  params.set('device', deviceType);
  params.set('os', os);
  params.set('connection', connection);

  window.location.href = `/diagnostic/next?${params.toString()}`;
}

/**
 * Clears validation errors when any radio button is selected
 */
function handleEnvironmentFieldChange() {
  const formData = new FormData(document.querySelector('.environment-form'));
  const deviceType = formData.get('device-type');
  const os = formData.get('os');
  const connection = formData.get('connection');

  // Clear validation error when all fields are selected
  if (deviceType && os && connection) {
    const errorMessage = document.getElementById('environment-error');
    if (errorMessage) {
      errorMessage.hidden = true;
    }
  }
}

// Initialize form handler and radio change listeners when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const environmentForm = document.querySelector('.environment-form');
  if (environmentForm) {
    environmentForm.addEventListener('submit', handleEnvironmentFormSubmit);
  }

  // Add change listeners to all radio buttons
  const radioButtons = document.querySelectorAll('input[type="radio"]');
  radioButtons.forEach(radio => {
    radio.addEventListener('change', handleEnvironmentFieldChange);
  });
});
