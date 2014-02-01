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
    var images, image, cachedCount, failedPhotos, photoGroup;

    photoGroup = this;
    cachedCount = 0;
    images = [];
    failedPhotos = [];

    photoGroup.photos.forEach(function(photo) {
      image = photo.cacheImage(targetSize, onImageLoaded, onImageFailed);
      images.push(image);
    });

    // TODO: jsdoc
    function onImageLoaded(photo) {
      onSingleSuccess(photoGroup, photo);
      cachedCount++;
      if (cachedCount === photoGroup.photos.length) {
        onTotalSuccess(photoGroup);
      } else if (failedPhotos.length + cachedCount === photoGroup.photos.length) {
        onTotalError(photoGroup, failedPhotos);
      }
    }

    // TODO: jsdoc
    function onImageFailed(photo) {
      failedPhotos.push(photo);
      if (failedPhotos.length + cachedCount === photoGroup.photos.length) {
        onTotalError(photoGroup, failedPhotos);
      }
    }
  }

  // TODO: jsdoc
  function loadImages(targetSize, onSingleSuccess, onTotalSuccess, onTotalError) {
    var loadedCount, failedPhotos, photoGroup;

    photoGroup = this;
    loadedCount = 0;
    failedPhotos = [];

    photoGroup.photos.forEach(function(photo) {
      photo.loadImage(targetSize, onImageLoaded, onImageFailed);
    });

    // TODO: jsdoc
    function onImageLoaded(photo) {
      onSingleSuccess(photoGroup, photo);
      if (++loadedCount === photoGroup.photos.length) {
        onTotalSuccess(photoGroup);
      } else if (failedPhotos.length + loadedCount === photoGroup.photos.length) {
        onTotalError(photoGroup, failedPhotos);
      }
    }

    // TODO: jsdoc
    function onImageFailed(photo) {
      failedPhotos.push(photo);
      if (failedPhotos.length + loadedCount === photoGroup.photos.length) {
        onTotalError(photoGroup, failedPhotos);
      }
    }
  }

  // TODO: jsdoc
  function addPhotoItemTapEventListeners(targetSize, tapHandler) {
    this.photos.forEach(function(photo) {
      photo.addTapEventListener(targetSize, tapHandler);
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
