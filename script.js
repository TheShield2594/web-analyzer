/**
 * Handles the impact scope form submission
 * @param {Event} event - The form submission event
 */
function handleScopeFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const impactScope = formData.get('impact-scope');

  if (!impactScope) {
    return;
  }

  // Log the selected scope (for debugging/analytics)
  console.log('Impact scope selected:', impactScope);

  // Navigate to Screen 2
  window.location.href = `target.html?scope=${impactScope}`;
}

// Initialize form handler when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const scopeForm = document.querySelector('.scope-form');
  if (scopeForm) {
    scopeForm.addEventListener('submit', handleScopeFormSubmit);
  }
});
