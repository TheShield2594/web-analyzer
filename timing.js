/**
 * Handles the timing pattern form submission
 * @param {Event} event - The form submission event
 */
function handleTimingFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const timingPattern = formData.get('timing-pattern');

  if (!timingPattern) {
    // Show error message
    const errorMessage = document.getElementById('timing-error');
    if (errorMessage) {
      errorMessage.hidden = false;
    }

    // Focus the first radio button for accessibility
    const firstRadio = document.getElementById('timing-always');
    if (firstRadio) {
      firstRadio.focus();
    }

    return;
  }

  // Set logic flags based on timing pattern selection
  let intermittent = false;
  let recent_change = false;

  switch (timingPattern) {
    case 'recent':
      recent_change = true;
      break;
    case 'intermittent':
    case 'busy':
      intermittent = true;
      break;
  }

  // Log the selected timing pattern and logic flags (for debugging/analytics)
  console.log('Timing pattern selected:', timingPattern);
  console.log('Logic flags - intermittent:', intermittent, 'recent_change:', recent_change);

  // Navigate to the next diagnostic screen with all query parameters
  const params = new URLSearchParams(window.location.search);
  params.set('timing', timingPattern);
  if (intermittent) {
    params.set('intermittent', 'true');
  }
  if (recent_change) {
    params.set('recent_change', 'true');
  }

  window.location.href = `/diagnostic/next?${params.toString()}`;
}

/**
 * Clears validation errors when a radio button is selected
 */
function handleTimingPatternChange() {
  const errorMessage = document.getElementById('timing-error');

  // Clear validation error when user selects an option
  if (errorMessage) {
    errorMessage.hidden = true;
  }
}

// Initialize form handler and radio change listeners when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const timingForm = document.querySelector('.timing-form');
  if (timingForm) {
    timingForm.addEventListener('submit', handleTimingFormSubmit);
  }

  // Add change listeners to all radio buttons
  const radioButtons = document.querySelectorAll('input[name="timing-pattern"]');
  radioButtons.forEach(radio => {
    radio.addEventListener('change', handleTimingPatternChange);
  });
});
