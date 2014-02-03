/**
 * This module defines a constructor for DropdownPhotoGrid objects.
 * @module dropdownPhotoGrid
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
   * @function DropdownPhotoGrid.initStaticFields
   */
  function initStaticFields() {
    params = app.params;
    util = app.util;
    log = new app.Log('dropdownPhotoGrid');
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
  function DropdownPhotoGrid() {

  }

  // Expose this module
  if (!window.app) window.app = {};
  window.app.DropdownPhotoGrid = DropdownPhotoGrid;
  DropdownPhotoGrid.initStaticFields = initStaticFields;

  console.log('dropdownPhotoGrid module loaded');
})();
