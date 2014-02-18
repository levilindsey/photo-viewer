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
   * @param {Function} onSingleSuccess An event listener called once for each successfully loaded
   * image.
   * @param {Function} onSingleError An event listener called once for each error that occurs while
   * loading all of the images.
   * @param {Function} onTotalSuccess An event listener called once if all of the images are loaded
   * successfully.
   * @param {Function} onTotalError An event listener called once if any errors occur while
   * loading all of the images.
   */
  function cacheImages(targetSize, onSingleSuccess, onSingleError, onTotalSuccess, onTotalError) {
    loadOrCacheIMages.call(this, targetSize, onSingleSuccess, onSingleError, onTotalSuccess,
        onTotalError, true);
  }

  /**
   * Load the given image version of each of the photos in this collection.
   * @function photoGroup#loadImages
   * @param {'full'|'small'|'thumbnail'|'gridThumbnail'} targetSize Which image version to load.
   * @param {Function} onSingleSuccess An event listener called once for each successfully loaded
   * image.
   * @param {Function} onSingleError An event listener called once for each error that occurs while
   * loading all of the images.
   * @param {Function} onTotalSuccess An event listener called once if all of the images are loaded
   * successfully.
   * @param {Function} onTotalError An event listener called once if any errors occur while
   * loading all of the images.
   */
  function loadImages(targetSize, onSingleSuccess, onSingleError, onTotalSuccess, onTotalError) {
    loadOrCacheIMages.call(this, targetSize, onSingleSuccess, onSingleError, onTotalSuccess,
        onTotalError, false);
  }

  /**
   * Cache and maybe load (i.e., keep a reference to) of the given image version of each of the
   * photos in this collection.
   * @function photoGroup#loadOrCacheIMages
   * @param {'full'|'small'|'thumbnail'|'gridThumbnail'} targetSize Which image version to
   * load/cache.
   * @param {Function} onSingleSuccess An event listener called once for each successfully loaded
   * image.
   * @param {Function} onSingleError An event listener called once for each error that occurs while
   * loading all of the images.
   * @param {Function} onTotalSuccess An event listener called once if all of the images are loaded
   * successfully.
   * @param {Function} onTotalError An event listener called once if any errors occur while
   * loading all of the images.
   * @param {Boolean} onlyCache If true, then the images will be cached and not "loaded" (i.e.,
   * references to the images will not be kept).
   */
  function loadOrCacheIMages(targetSize, onSingleSuccess, onSingleError, onTotalSuccess,
                             onTotalError, onlyCache) {
    var loadedCount, failedPhotos, photoGroup, photoFunction;

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
      onSingleError(photoGroup, photo);
      if (failedPhotos.length + loadedCount === photoGroup.photos.length) {
        onTotalError(photoGroup, failedPhotos);
      }
    }

    photoGroup = this;
    loadedCount = 0;
    failedPhotos = [];

    photoFunction = onlyCache ? 'cacheImage' : 'loadImage';

    photoGroup.photos.forEach(function (photo) {
      photo[photoFunction](targetSize, onImageLoadSuccess, onImageLoadError);
    });
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

  /**
   * Removes all extra images from memory according to the given parameters.
   * @function photoGroup#clearImages
   * @param {'full'|'small'|'thumbnail'|'gridThumbnail'} targetSize Which image version to clear.
   */
  function clearImages(targetSize) {
    var photoGroup, i, count;
    photoGroup = this;

    for (i = 0, count = photoGroup.photos.length; i < count; i++) {
      photoGroup.photos[i][targetSize].image = null;
    }
  }


  /**
   * Cancels any current image downloads. Any index given in the exceptions array will be ignored.
   * @function photoGroup#cancelImageDownloads
   * @param {Array.<Number>} [exceptions] Indices of photo items to NOT stop downloading.
   */
  function cancelImageDownloads(exceptions) {
    var photoGroup, i, count;
    photoGroup = this;

    for (i = 0, count = photoGroup.photos.length; i < count; i++) {
      if (exceptions && exceptions.indexOf(i) < 0) {
        photoGroup.photos[i].cancelImageDownload();
      }
    }
  }

  // ------------------------------------------------------------------------------------------- //
  // Public static functions

  /**
   * Initializes some static state for this module.
   * @function photoGroup.initStaticFields
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
    var photoGroup = this;

    photoGroup.title = title;
    photoGroup.photos = photos;

    photoGroup.cacheImages = cacheImages;
    photoGroup.loadImages = loadImages;
    photoGroup.addPhotoItemTapEventListeners = addPhotoItemTapEventListeners;
    photoGroup.clearImages = clearImages;
    photoGroup.cancelImageDownloads = cancelImageDownloads;
  }

  // Expose this module
  if (!window.app) window.app = {};
  window.app.PhotoGroup = PhotoGroup;
  PhotoGroup.initStaticFields = initStaticFields;

  console.log('photoGroup module loaded');
})();
