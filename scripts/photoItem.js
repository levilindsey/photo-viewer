/**
 * This module defines a constructor for PhotoItem objects.
 * @module photoItem
 */
(function() {
  // ------------------------------------------------------------------------------------------- //
  // Private static variables

  var params, util, log;

  // ------------------------------------------------------------------------------------------- //
  // Private dynamic functions



  // ------------------------------------------------------------------------------------------- //
  // Public dynamic functions

  /**
   * Downloads and caches this PhotoItem's original image, but does not actually keep a reference
   * to it.
   * @function PhotoItem#cacheOriginalImage
   * @param {Function} onSuccess An event listener called if the image is cached successfully.
   * @param {Function} onError An event listener called if an error occurs while caching the image.
   * @returns {HTMLElement} The image DOM element that is used to cache the image.
   */
  function cacheOriginal(onSuccess, onError) {
    var photo, image;
    photo = this;
    image = new Image();
    util.listen(image, 'load', function () { onSuccess(photo); }, false);
    util.listen(image, 'error', function() { onError(photo); }, false);
    image.src = photo.original.source;
    return image;
  }

  /**
   * Loads, and keeps a reference to, this PhotoItem's original image.
   * @function PhotoItem#loadOriginalImage
   * @param {Function} onSuccess An event listener called if the image is loaded successfully.
   * @param {Function} onError An event listener called if an error occurs while loading the image.
   */
  function loadOriginal(onSuccess, onError) {
    var photo, image;
    photo = this;
    image = new Image();
    util.listen(image, 'load', function() { onSuccess(photo); });
    util.listen(image, 'error', function() { onError(photo); }, false);
    image.src = photo.original.source;
    photo.original.image = image;
  }

  /**
   * Downloads and caches this PhotoItem's thumbnail image, but does not actually keep a reference
   * to it.
   * @function PhotoItem#cacheThumbnailImage
   * @param {Function} onSuccess An event listener called if the image is cached successfully.
   * @param {Function} onError An event listener called if an error occurs while caching the image.
   * @returns {HTMLElement} The image DOM element that is used to cache the image.
   */
  function cacheThumbnail(onSuccess, onError) {
    var photo, image;
    photo = this;
    image = new Image();
    util.listen(image, 'load', function () { onSuccess(photo); }, false);
    util.listen(image, 'error', function() { onError(photo); }, false);
    image.src = photo.thumbnail.source;
    return image;
  }

  /**
   * Loads, and keeps a reference to, this PhotoItem's thumbnail image.
   * @function PhotoItem#loadThumbnailImage
   * @param {Function} onSuccess An event listener called if the image is loaded successfully.
   * @param {Function} onError An event listener called if an error occurs while loading the image.
   */
  function loadThumbnail(onSuccess, onError) {
    var photo, image;
    photo = this;
    image = new Image();
    util.listen(image, 'load', function() { onSuccess(photo); }, false);
    util.listen(image, 'error', function() { onError(photo); }, false);
    image.src = photo.thumbnail.source;
    photo.thumbnail.image = image;
  }

  /**
   * Adds an event listener for a tap event over one of the image elements of this PhotoItem.
   * @function PhotoItem#addTapEventListener
   * @param {Function} tapHandler The callback function to call when a image tap occurs.
   * @param {'original'|'small'|'thumbnail'} targetSize Which size image to use as the target for
   * this event listener.
   */
  function addTapEventListener(tapHandler, targetSize) {
    var photo = this;
    util.addTapEventListener(photo[targetSize].image, function onTap() { tapHandler(photo); });
  }

  // ------------------------------------------------------------------------------------------- //
  // Private static functions



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

  // ------------------------------------------------------------------------------------------- //
  // Expose this module's constructor

  /**
   * @constructor
   * @global
   * @param {String} originalSource A URL to the original, full-size image.
   * @param {Number} originalWidth The width of the original, full-size image.
   * @param {Number} originalHeight The height of the original, full-size image.
   * @param {String} thumbnailSource A URL to a thumbnail version of the image.
   * @param {Number} thumbnailWidth The width of the thumbnail version of the image.
   * @param {Number} thumbnailHeight The height of the thumbnail version of the image.
   * @param {Number} thumbnailX The x-coordinate of the placement of the thumbnail image, with the
   * origin at the top-left corner of the entire page/document.
   * @param {Number} thumbnailY The y-coordinate of the placement of the thumbnail image, with the
   * origin at the top-left corner of the entire page/document.
   */
  function PhotoItem(originalSource, originalWidth, originalHeight, thumbnailSource,
                     thumbnailWidth, thumbnailHeight, thumbnailX, thumbnailY) {
    this.original = {
      image: null,
      source: originalSource,
      width: originalWidth,
      height: originalHeight
    };
    this.thumbnail = {
      image: null,
      source: thumbnailSource,
      width: thumbnailWidth,
      height: thumbnailHeight,
      x: thumbnailX,
      y: thumbnailY
    };

    this.cacheOriginal = cacheOriginal;
    this.loadOriginal = loadOriginal;
    this.cacheThumbnail = cacheThumbnail;
    this.loadThumbnail = loadThumbnail;
    this.addTapEventListener = addTapEventListener;
  }

  // Expose this module
  if (!window.app) window.app = {};
  window.app.PhotoItem = PhotoItem;
  PhotoItem.initStaticFields = initStaticFields;

  console.log('photoItem module loaded');
})();
