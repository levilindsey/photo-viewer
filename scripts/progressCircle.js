/**
 * This module defines a constructor for ProgressCircle objects.
 * @module progressCircle
 */
(function() {
  // ------------------------------------------------------------------------------------------- //
  // Private static variables



  // ------------------------------------------------------------------------------------------- //
  // Private dynamic functions



  // ------------------------------------------------------------------------------------------- //
  // Public dynamic functions



  // ------------------------------------------------------------------------------------------- //
  // Private static functions



  // ------------------------------------------------------------------------------------------- //
  // Public static functions

  /**
   * Initializes some static state for this module.
   * @function ProgressCircle.initStaticFields
   */
  function initStaticFields() {
    // TODO:

    console.log('progressCircle module loaded');
  }

  // ------------------------------------------------------------------------------------------- //
  // Expose this module's constructor

  /**
   * @constructor
   * @global
   * @param {} ...
   */
  function ProgressCircle() {
    return {

    };
  }

  // Expose this module
  if (!window.app) window.app = {};
  window.app.ProgressCircle = ProgressCircle;
  ProgressCircle.initStaticFields = initStaticFields;

  console.log('progressCircle module loaded');
})();
