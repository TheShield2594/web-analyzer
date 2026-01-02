/**
 * Shared utilities for diagnostic pages
 */

/**
 * Renders diagnostic information on diagnostic result pages
 *
 * @param {string} pathTitle - The title of the diagnostic path (e.g., "DNS", "Network")
 * @param {string[]} keyParams - Array of URL parameter keys to display
 */
function renderDiagnosticInfo(pathTitle, keyParams) {
  const params = new URLSearchParams(window.location.search);
  const diagnosticInfo = document.getElementById('diagnosticInfo');

  if (!diagnosticInfo) {
    console.warn('diagnosticInfo element not found');
    return;
  }

  const info = document.createElement('div');
  info.className = 'diagnostic-info-container';

  const title = document.createElement('h3');
  title.textContent = `Diagnostic Path: ${pathTitle}`;
  title.className = 'diagnostic-info-title';
  info.appendChild(title);

  const paramsList = document.createElement('ul');
  paramsList.className = 'diagnostic-params-list';

  keyParams.forEach(key => {
    const value = params.get(key);
    if (value) {
      const li = document.createElement('li');
      li.textContent = `${key}: ${value}`;
      paramsList.appendChild(li);
    }
  });

  info.appendChild(paramsList);
  diagnosticInfo.appendChild(info);
}
