/**
 * This module defines a constructor for PhotoGrid objects.
 * @module photoGrid
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
   * @function PhotoGrid.initStaticFields
   */
  function initStaticFields() {
    // TODO:

    console.log('photoGrid module initialized');
  }

  // ------------------------------------------------------------------------------------------- //
  // Expose this module's constructor

  /**
   * @constructor
   * @global
   * @param {} ...
   */
  function PhotoGrid() {
    return {

    };
  }

  // Expose this module
  if (!window.app) window.app = {};
  window.app.PhotoGrid = PhotoGrid;
  PhotoGrid.initStaticFields = initStaticFields;

  console.log('photoGrid module loaded');
})();
