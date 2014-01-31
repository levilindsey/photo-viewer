/**
 * This module defines a constructor for PhotoLightbox objects.
 * @module photoLightbox
 */
(function() {
  // ------------------------------------------------------------------------------------------- //
  // Private static variables

  var ENLARGE_PERIOD = 0.8,
      REDUCE_PERIOD = 0.5;



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

    console.log('photoLightbox module initialized');
  }



  // ------------------------------------------------------------------------------------------- //
  // Public classes

  /**
   * @constructor
   * @global
   * @param {string} originalSrc A URL to the original, full-size image.
   * @param {number} originalWidth The width of the original, full-size image.
   * @param {number} originalHeight The height of the original, full-size image.
   * @param {string} thumbnailSrc A URL to a thumbnail version of the image.
   * @param {number} thumbnailWidth The width of the thumbnail version of the image.
   * @param {number} thumbnailHeight The height of the thumbnail version of the image.
   * @param {number} thumbnailX The x-coordinate of the placement of the thumbnail image, with the
   * origin at the top-left corner of the entire page/document.
   * @param {number} thumbnailY The y-coordinate of the placement of the thumbnail image, with the
   * origin at the top-left corner of the entire page/document.
   */
  function PhotoItem(originalSrc, originalWidth, originalHeight, thumbnailSrc, thumbnailWidth,
                     thumbnailHeight, thumbnailX, thumbnailY) {
    this.originalSrc = originalSrc;
    this.originalWidth = originalWidth;
    this.originalHeight = originalHeight;
    this.thumbnailSrc = thumbnailSrc;
    this.thumbnailWidth = thumbnailWidth;
    this.thumbnailHeight = thumbnailHeight;
    this.thumbnailX = thumbnailX;
    this.thumbnailY = thumbnailY;
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
  window.app.PhotoItem = PhotoItem;

  console.log('photoLightbox module loaded');
})();
