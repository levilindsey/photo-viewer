/**
 * This module defines a constructor for PhotoItem objects.
 * @module photoItem
 */
(function () {
  // ------------------------------------------------------------------------------------------- //
  // Private static variables

  var params, util, log;

  // ------------------------------------------------------------------------------------------- //
  // Public dynamic functions

  /**
   * Downloads and caches the target size of this PhotoItem's image, but does not actually keep a
   * reference to it.
   * @function PhotoItem#cacheImage
   * @param {'full'|'small'|'thumbnail'|'gridThumbnail'} targetSize Which image version of this
   * photo to cache.
   * @param {Function} onSuccess An event listener called if the image is cached successfully.
   * @param {Function} onError An event listener called if an error occurs while caching the image.
   * @param {Function} [onProgress] An event listener called for each progress update while loading
   * the image.
   * @returns {HTMLElement} The image DOM element that is used to cache the image.
   */
  function cacheImage(targetSize, onSuccess, onError, onProgress) {
    var photo, image, src, onSuccessWrapper, onErrorWrapper, onProgressWrapper;

    photo = this;
    image = new Image();

    src = targetSize !== 'gridThumbnail' ? photo[targetSize].source : photo.thumbnail.source;

    onSuccessWrapper = function () {
      if (photo[targetSize].xhr) {
        photo[targetSize].xhr = null;
      }
      if (targetSize !== 'gridThumbnail') {
        photo[targetSize].isCached = true;
      }
      onSuccess(photo);
    };

    onErrorWrapper = function () {
      if (photo[targetSize].xhr) {
        photo[targetSize].xhr = null;
      }
      onError(photo);
    };

    onProgressWrapper = function (progress) {
      onProgress(photo, progress);
    };

    if (!onProgress) {
      // Load the image in the normal way, by setting the img element's src attribute
      util.listen(image, 'load', onSuccessWrapper);
      util.listen(image, 'error', onErrorWrapper);
      image.src = src;
    } else {
      // Load the image via XHR, so we can track its progress
      photo[targetSize].xhr =
          util.loadImageViaXHR(src, image, onSuccessWrapper, onErrorWrapper, onProgressWrapper);
    }
    return image;
  }

  /**
   * Loads, and keeps a reference to, the target size of this PhotoItem's image.
   * @function PhotoItem#loadImage
   * @param {'full'|'small'|'thumbnail'|'gridThumbnail'} targetSize Which image version of this
   * photo to load.
   * @param {Function} onSuccess An event listener called if the image is loaded successfully.
   * @param {Function} onError An event listener called if an error occurs while loading the image.
   * @param {Function} [onProgress] An event listener called for each progress update while loading
   * the image.
   */
  function loadImage(targetSize, onSuccess, onError, onProgress) {
    var photo = this;
    photo[targetSize].image = cacheImage.call(photo, targetSize, onSuccess, onError, onProgress);
  }

  /**
   * Adds an event listener for a tap event over one of the image elements of this PhotoItem.
   * @function PhotoItem#addTapEventListener
   * @param {'full'|'small'|'thumbnail'|'gridThumbnail'} targetSize Which image version to use as
   * the target for this event listener.
   * @param {Function} tapHandler The callback function to call when a image tap occurs.
   */
  function addTapEventListener(targetSize, tapHandler) {
    var photo = this;
    util.addTapEventListener(photo[targetSize].image, function (event) {
      tapHandler(event, photo);
    }, false);
  }

  /**
   * Gets the position of the given version of this photo relative to the top-left corner of the
   * overall page.
   * @function photoItem#getPageOffset
   * @param {'full'|'small'|'thumbnail'|'gridThumbnail'} targetSize Which image version to find
   * the position of.
   * @returns {{x: Number, y: Number}|*} The position of the image.
   */
  function getPageOffset(targetSize) {
    var photo = this;
    return util.getPageOffset(photo[targetSize].image);
  }

  /**
   *
   * @function photoLightbox#cancelImageDownload
   */
  function cancelImageDownload() {
    var photoItem = this;
    if (photoItem.full.xhr) {
      util.abortXHR(photoItem.full.xhr);
      photoItem.full.xhr = null;
    }
    if (photoItem.small.xhr) {
      util.abortXHR(photoItem.small.xhr);
      photoItem.small.xhr = null;
    }
  }

  // ------------------------------------------------------------------------------------------- //
  // Public static functions

  /**
   * Initializes some static state for this module.
   * @function PhotoItem.initStaticFields
   */
  function initStaticFields() {
    params = app.params;
    util = app.util;
    log = new app.Log('photoItem');
    log.d('initStaticFields', 'Module initialized');
  }

  /**
   * @function PhotoItem.setLoadError
   * @param {PhotoItem} photoItem
   * @param {HTMLElement} parent
   * @param {Boolean} isError
   * @param {Boolean} isLightbox
   */
  function setLoadError(photoItem, parent, isError, isLightbox) {
    // Add or remove an error message element
    if (isError) {
      util.createElement('div', parent, null, ['imageErrorMessage']);
    } else {
      util.removeChildrenWithClass(parent, 'imageErrorMessage');
    }

    // Show or hide the image
    if (isLightbox) {
      if (photoItem.thumbnail.image) {
        util.toggleClass(photoItem.thumbnail.image, 'failedImage', isError);
      }
      if (photoItem.small.image) {
        util.toggleClass(photoItem.small.image, 'failedImage', isError);
      }
      if (photoItem.full.image) {
        util.toggleClass(photoItem.full.image, 'failedImage', isError);
      }
    } else {
      util.toggleClass(photoItem.gridThumbnail.image, 'failedImage', isError);
    }
  }

  // ------------------------------------------------------------------------------------------- //
  // Expose this module's constructor

  /**
   * @constructor
   * @global
   * @param {Number} index The index of this photo item within its containing photo group.
   * @param {String} fullSource A URL to the original, full-size image.
   * @param {Number} fullWidth The width of the original, full-size image.
   * @param {Number} fullHeight The height of the original, full-size image.
   * @param {String} smallSource A URL to a smaller version of the image.
   * @param {Number} smallWidth The width of a smaller version of the image.
   * @param {Number} smallHeight The height of a smaller version of the image.
   * @param {String} thumbnailSource A URL to a thumbnail version of the image.
   * @param {Number} thumbnailWidth The width of the thumbnail version of the image.
   * @param {Number} thumbnailHeight The height of the thumbnail version of the image.
   */
  function PhotoItem(index, fullSource, fullWidth, fullHeight, smallSource, smallWidth, smallHeight,
                     thumbnailSource, thumbnailWidth, thumbnailHeight) {
    var photoItem = this;

    photoItem.index = index;
    photoItem.full = {
      image: null,
      isCached: false,
      xhr: null,
      source: fullSource,
      width: fullWidth,
      height: fullHeight
    };
    photoItem.small = {
      image: null,
      isCached: false,
      xhr: null,
      source: smallSource,
      width: smallWidth,
      height: smallHeight
    };
    photoItem.thumbnail = {
      image: null,
      isCached: false,
      source: thumbnailSource,
      width: thumbnailWidth,
      height: thumbnailHeight
    };
    photoItem.gridThumbnail = {
      image: null,
      columnIndex: -1,
      rowIndex: -1
    };

    photoItem.cacheImage = cacheImage;
    photoItem.loadImage = loadImage;
    photoItem.addTapEventListener = addTapEventListener;
    photoItem.getPageOffset = getPageOffset;
    photoItem.cancelImageDownload = cancelImageDownload;
  }

  // Expose this module
  if (!window.app) window.app = {};
  window.app.PhotoItem = PhotoItem;
  PhotoItem.initStaticFields = initStaticFields;
  PhotoItem.setLoadError = setLoadError;

  console.log('photoItem module loaded');
})();
