/**
 * Handles the target type form submission
 * @param {Event} event - The form submission event
 */
function handleTargetFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const targetType = formData.get('target-type');

  if (!targetType) {
    // Show error message
    const errorMessage = document.getElementById('target-error');
    if (errorMessage) {
      errorMessage.hidden = false;
    }

    // Focus the first radio button for accessibility
    const firstRadio = document.getElementById('target-app');
    if (firstRadio) {
      firstRadio.focus();
    }

    return;
  }

  // Log the selected target type (for debugging/analytics)
  console.log('Target type selected:', targetType);

  // Navigate to the next diagnostic screen
  window.location.href = `/diagnostic/next?target=${encodeURIComponent(targetType)}`;
}

/**
 * Handles the conditional note display based on radio selection
 * and clears any validation errors
 */
function handleTargetTypeChange() {
  const unsureRadio = document.getElementById('target-unsure');
  const conditionalNote = document.getElementById('unsure-note');
  const errorMessage = document.getElementById('target-error');

  if (!unsureRadio || !conditionalNote) {
    return;
  }

  // Clear validation error when user selects an option
  if (errorMessage) {
    errorMessage.hidden = true;
  }

  // Show the note if "Not sure" is selected, hide otherwise
  if (unsureRadio.checked) {
    conditionalNote.hidden = false;
  } else {
    conditionalNote.hidden = true;
  }
}

// Initialize form handler and radio change listeners when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const targetForm = document.querySelector('.target-form');
  if (targetForm) {
    targetForm.addEventListener('submit', handleTargetFormSubmit);
  }

  // Add change listeners to all radio buttons
  const radioButtons = document.querySelectorAll('input[name="target-type"]');
  radioButtons.forEach(radio => {
    radio.addEventListener('change', handleTargetTypeChange);
  });

  // Initialize conditional note visibility for any pre-selected radio
  handleTargetTypeChange();
});
