/**
 * This module defines a constructor for PhotoGrid objects.
 * @module photoGrid
 */
(function() {
  // ------------------------------------------------------------------------------------------- //
  // Private static variables

  var params, util, log, animate;

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
   * @function PhotoGrid.initStaticFields
   */
  function initStaticFields() {
    params = app.params;
    util = app.util;
    log = new app.Log('photoGrid');
    animate = app.animate;
    log.d('initStaticFields', 'Module initialized');
  }

  // ------------------------------------------------------------------------------------------- //
  // Expose this module's constructor

  /**
   * @constructor
   * @global
   * @param {} ...
   */
  function PhotoGrid() {

  }

  // Expose this module
  if (!window.app) window.app = {};
  window.app.PhotoGrid = PhotoGrid;
  PhotoGrid.initStaticFields = initStaticFields;

  console.log('photoGrid module loaded');
})();
