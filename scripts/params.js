/**
 * This module defines a collection of parameters used throughout this app.
 * @module params
 */
(function() {
  /**
   * The static parameters.
   * @global
   */
  var params = {
    LOG_RECENT_ENTRIES_LIMIT: 80,
    LOG_DEBUG: true,
    LOG_VERBOSE: true,



    TWO_PI: Math.PI * 2,
    HALF_PI: Math.PI * 0.5
  };

  // Expose this module
  if (!window.app) window.app = {};
  window.app.params = params;

  console.log('params module loaded');
})();
