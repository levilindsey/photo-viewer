/**
 * This module defines a constructor for PhotoGridCollection objects.
 * @module photoGridCollection
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
   * @function PhotoGridCollection.initStaticFields
   */
  function initStaticFields() {
    params = app.params;
    util = app.util;
    log = new app.Log('photoGridCollection');
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
  function PhotoGridCollection(photoGroups, parent) {
    var gridCollection = this;

    gridCollection.parent = parent;
    gridCollection.elements = null;


  }

  // Expose this module
  if (!window.app) window.app = {};
  window.app.PhotoGridCollection = PhotoGridCollection;
  PhotoGridCollection.initStaticFields = initStaticFields;

  console.log('photoGridCollection module loaded');
})();
