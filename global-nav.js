/**
 * Global Navigation Utilities
 * Provides back button and restart diagnostic functionality across all pages
 */

(function() {
  'use strict';

  // Initialize global navigation on page load
  document.addEventListener('DOMContentLoaded', function() {
    initializeGlobalNavigation();
  });

  function initializeGlobalNavigation() {
    // Create navigation container
    const navContainer = createNavigationBar();

    // Insert navigation at the top of the page, before the main content
    const body = document.body;
    if (body.firstChild) {
      body.insertBefore(navContainer, body.firstChild);
    } else {
      body.appendChild(navContainer);
    }
  }

  function createNavigationBar() {
    const nav = document.createElement('nav');
    nav.className = 'global-nav';
    nav.setAttribute('aria-label', 'Global navigation');

    // Determine if we should show the back button
    const currentPage = getCurrentPageName();
    const showBackButton = currentPage !== 'index.html';

    // Create back button (if not on first page)
    if (showBackButton) {
      const backButton = document.createElement('button');
      backButton.className = 'nav-button nav-back';
      backButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Back</span>
      `;
      backButton.setAttribute('aria-label', 'Go back to previous screen');
      backButton.addEventListener('click', handleBackClick);
      nav.appendChild(backButton);
    } else {
      // Add empty div for flex spacing
      const spacer = document.createElement('div');
      nav.appendChild(spacer);
    }

    // Create restart button
    const restartButton = document.createElement('button');
    restartButton.className = 'nav-button nav-restart';
    restartButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M1 4V8H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M15 12V8H11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2.51 9C2.83153 10.3304 3.58431 11.5204 4.65923 12.3854C5.73415 13.2505 7.06978 13.7446 8.45551 13.7932C9.84124 13.8419 11.2082 13.4422 12.3414 12.6547C13.4746 11.8671 14.3117 10.7361 14.72 9.43M1.28 6.57C1.68832 5.26392 2.52543 4.13288 3.65863 3.34533C4.79184 2.55778 6.15882 2.15809 7.54455 2.20673C8.93028 2.25537 10.2659 2.74953 11.3408 3.61458C12.4157 4.47962 13.1685 5.66962 13.49 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>Restart Diagnostic</span>
    `;
    restartButton.setAttribute('aria-label', 'Restart diagnostic from beginning');
    restartButton.addEventListener('click', handleRestartClick);
    nav.appendChild(restartButton);

    return nav;
  }

  function getCurrentPageName() {
    const path = window.location.pathname;
    const pageName = path.substring(path.lastIndexOf('/') + 1);
    return pageName || 'index.html';
  }

  function handleBackClick(event) {
    event.preventDefault();

    // Use browser history to go back
    // This preserves the diagnostic state naturally
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback: go to index
      window.location.href = 'index.html';
    }
  }

  function handleRestartClick(event) {
    event.preventDefault();

    // Confirm before restarting
    const confirmed = window.confirm('Are you sure you want to restart the diagnostic? All progress will be lost.');

    if (confirmed) {
      // Clear any stored state and go to beginning
      window.location.href = 'index.html';
    }
  }

  // Export utilities for use in other scripts if needed
  window.GlobalNav = {
    restart: function() {
      window.location.href = 'index.html';
    },
    back: function() {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = 'index.html';
      }
    }
  };
})();
