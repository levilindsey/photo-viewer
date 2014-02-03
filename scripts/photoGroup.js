/**
 * This module defines a constructor for PhotoGroup objects.
 * @module photoGroup
 */
(function() {
  // ------------------------------------------------------------------------------------------- //
  // Private static variables

  var params, util, log, PhotoItem;

  // ------------------------------------------------------------------------------------------- //
  // Private dynamic functions



  // ------------------------------------------------------------------------------------------- //
  // Public dynamic functions

  // TODO: jsdoc
  function cacheImages(targetSize, onSingleSuccess, onTotalSuccess, onTotalError) {
    loadOrCacheIMages.call(this, targetSize, onSingleSuccess, onTotalSuccess, onTotalError, true);
  }

  // TODO: jsdoc
  function loadImages(targetSize, onSingleSuccess, onTotalSuccess, onTotalError) {
    loadOrCacheIMages.call(this, targetSize, onSingleSuccess, onTotalSuccess, onTotalError, false);
  }

  // TODO: jsdoc
  function loadOrCacheIMages(targetSize, onSingleSuccess, onTotalSuccess, onTotalError,
                             onlyCache) {
    var loadedCount, failedPhotos, photoGroup, photoFunction;

    photoGroup = this;
    loadedCount = 0;
    failedPhotos = [];

    photoFunction = onlyCache ? 'cacheImage' : 'loadImage';

    photoGroup.photos.forEach(function(photo) {
      photo[photoFunction](targetSize, onImageLoadSuccess, onImageLoadError);
    });

    // TODO: jsdoc
    function onImageLoadSuccess(photo) {
      onSingleSuccess(photoGroup, photo);
      if (++loadedCount === photoGroup.photos.length) {
        onTotalSuccess(photoGroup);
      } else if (failedPhotos.length + loadedCount === photoGroup.photos.length) {
        onTotalError(photoGroup, failedPhotos);
      }
    }

    // TODO: jsdoc
    function onImageLoadError(photo) {
      failedPhotos.push(photo);
      if (failedPhotos.length + loadedCount === photoGroup.photos.length) {
        onTotalError(photoGroup, failedPhotos);
      }
    }
  }

  // TODO: jsdoc
  function addPhotoItemTapEventListeners(targetSize, tapHandler) {
    var photoGroup = this;
    photoGroup.photos.forEach(function(photo) {
      photo.addTapEventListener(targetSize, function(event) {
        tapHandler(event, photoGroup, photo.index);
      });
    });
  }

  // ------------------------------------------------------------------------------------------- //
  // Private static functions

  // ------------------------------------------------------------------------------------------- //
  // Public static functions

  /**
   * Initializes some static state for this module.
   * @function PhotoGroup.initStaticFields
   */
  function initStaticFields() {
    params = app.params;
    util = app.util;
    log = new app.Log('photoGroup');
    PhotoItem = app.PhotoItem;
    log.d('initStaticFields', 'Module initialized');
  }

  // ------------------------------------------------------------------------------------------- //
  // Expose this module's constructor

  /**
   * @constructor
   * @global
   * @param {string} title The title to display for this photo group.
   * @param {Array.<PhotoItem>} photos The photo items that comprise this group.
   */
  function PhotoGroup(title, photos) {
    this.title = title;
    this.photos = photos;

    this.cacheImages = cacheImages;
    this.loadImages = loadImages;
    this.addPhotoItemTapEventListeners = addPhotoItemTapEventListeners;
  }

  // Expose this module
  if (!window.app) window.app = {};
  window.app.PhotoGroup = PhotoGroup;
  PhotoGroup.initStaticFields = initStaticFields;

  console.log('photoGroup module loaded');
})();
