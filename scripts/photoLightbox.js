/**
 * This module defines a constructor for PhotoLightbox objects.
 * @module photoLightbox
 */
(function() {
  // ------------------------------------------------------------------------------------------- //
  // Private static variables

  var params, util, log, animate;

  // ------------------------------------------------------------------------------------------- //
  // Private dynamic functions

  /**
   * Transitions to the previous image. This makes a request to the client for the previous image's data.
   */
  function onPreviousTap() {
    // TODO:
  }

  // TODO: jsdoc
  function onNextTap() {
    // TODO:
  }

  // TODO: jsdoc
  function onCloseTap() {
    // TODO:
  }

  // TODO: jsdoc
  function onFullscreenTap() {
    // TODO:
  }

  // ------------------------------------------------------------------------------------------- //
  // Public dynamic functions



  // ------------------------------------------------------------------------------------------- //
  // Private static functions



  // ------------------------------------------------------------------------------------------- //
  // Public static functions

  /**
   * Initializes some static state for this module.
   * @function PhotoLightbox.initStaticFields
   */
  function initStaticFields() {
    params = app.params;
    util = app.util;
    log = new app.Log('photoLightbox');
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
  function PhotoLightbox() {

  }

  // Expose this module
  if (!window.app) window.app = {};
  window.app.PhotoLightbox = PhotoLightbox;
  PhotoLightbox.initStaticFields = initStaticFields;

  console.log('photoLightbox module loaded');
})();
