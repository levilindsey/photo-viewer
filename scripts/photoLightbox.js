/**
 * This module defines a constructor for PhotoLightbox objects.
 * @module photoLightbox
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
   * @function PhotoLightbox.initStaticFields
   */
  function initStaticFields() {
    // TODO:

    console.log('photoLightbox module loaded');
  }

  // ------------------------------------------------------------------------------------------- //
  // Expose this module's constructor

  /**
   * @constructor
   * @global
   * @param {} ...
   */
  function PhotoLightbox() {
    return {

    };
  }

  // Expose this module
  if (!window.app) window.app = {};
  window.app.PhotoLightbox = PhotoLightbox;
  PhotoLightbox.initStaticFields = initStaticFields;

  console.log('photoLightbox module loaded');
})();
