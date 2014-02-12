/**
 * This module defines a constructor for PhotoGroup objects.
 * @module photoGroup
 */
(function () {
  // ------------------------------------------------------------------------------------------- //
  // Private static variables

  var params, util, log, PhotoItem;

  // ------------------------------------------------------------------------------------------- //
  // Public dynamic functions

  /**
   * Cache the given image version of each of the photos in this collection.
   * @function photoGroup#cacheImages
   * @param {'full'|'small'|'thumbnail'|'gridThumbnail'} targetSize Which image version to cache.
   * @param {Function} onSingleSuccess An event listener called if all of the images are cached
   * successfully.
   * @param {Function} onTotalSuccess An event listener called once if any errors occur while
   * caching all of the images.
   * @param {Function} onTotalError An event listener called once for each error that occurs while
   * caching all of the images.
   */
  function cacheImages(targetSize, onSingleSuccess, onTotalSuccess, onTotalError) {
    loadOrCacheIMages.call(this, targetSize, onSingleSuccess, onTotalSuccess, onTotalError, true);
  }

  /**
   * Load the given image version of each of the photos in this collection.
   * @function photoGroup#loadImages
   * @param {'full'|'small'|'thumbnail'|'gridThumbnail'} targetSize Which image version to load.
   * @param {Function} onSingleSuccess An event listener called if all of the images are loaded
   * successfully.
   * @param {Function} onTotalSuccess An event listener called once if any errors occur while
   * loading all of the images.
   * @param {Function} onTotalError An event listener called once for each error that occurs while
   * loading all of the images.
   */
  function loadImages(targetSize, onSingleSuccess, onTotalSuccess, onTotalError) {
    loadOrCacheIMages.call(this, targetSize, onSingleSuccess, onTotalSuccess, onTotalError, false);
  }

  /**
   * Cache and maybe load (i.e., keep a reference to) of the given image version of each of the
   * photos in this collection.
   * @function photoGroup#loadOrCacheIMages
   * @param {'full'|'small'|'thumbnail'|'gridThumbnail'} targetSize Which image version to
   * load/cache.
   * @param {Function} onSingleSuccess An event listener called if all of the images are loaded
   * successfully.
   * @param {Function} onTotalSuccess An event listener called once if any errors occur while
   * loading all of the images.
   * @param {Function} onTotalError An event listener called once for each error that occurs while
   * loading all of the images.
   * @param {Boolean} onlyCache If true, then the images will be cached and not "loaded" (i.e.,
   * references to the images will not be kept).
   */
  function loadOrCacheIMages(targetSize, onSingleSuccess, onTotalSuccess, onTotalError, onlyCache) {
    var loadedCount, failedPhotos, photoGroup, photoFunction;

    photoGroup = this;
    loadedCount = 0;
    failedPhotos = [];

    photoFunction = onlyCache ? 'cacheImage' : 'loadImage';

    photoGroup.photos.forEach(function (photo) {
      photo[photoFunction](targetSize, onImageLoadSuccess, onImageLoadError);
    });

    function onImageLoadSuccess(photo) {
      onSingleSuccess(photoGroup, photo);
      if (++loadedCount === photoGroup.photos.length) {
        onTotalSuccess(photoGroup);
      } else if (failedPhotos.length + loadedCount === photoGroup.photos.length) {
        onTotalError(photoGroup, failedPhotos);
      }
    }

    function onImageLoadError(photo) {
      failedPhotos.push(photo);
      if (failedPhotos.length + loadedCount === photoGroup.photos.length) {
        onTotalError(photoGroup, failedPhotos);
      }
    }
  }

  /**
   * Adds a tap event listener to the given image version of each of the photos in this collection.
   * @function photoGroup#addPhotoItemTapEventListeners
   * @param {'full'|'small'|'thumbnail'|'gridThumbnail'} targetSize Which image version to add the
   * tap event listener to.
   * @param {Function} tapHandler The function to handle the event.
   */
  function addPhotoItemTapEventListeners(targetSize, tapHandler) {
    var photoGroup = this;
    photoGroup.photos.forEach(function (photo) {
      photo.addTapEventListener(targetSize, function (event) {
        tapHandler(event, photoGroup, photo.index);
      });
    });
  }

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
