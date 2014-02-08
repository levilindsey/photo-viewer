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
   * Downloads and caches the target size of this PhotoItem's image, but does not actually keep a
   * reference to it.
   * @function PhotoItem#cacheImage
   * @param {'full'|'small'|'thumbnail'|'gridThumbnail'} targetSize Which size version of this photo to cache.
   * @param {Function} onSuccess An event listener called if the image is cached successfully.
   * @param {Function} onError An event listener called if an error occurs while caching the image.
   * @returns {HTMLElement} The image DOM element that is used to cache the image.
   */
  function cacheImage(targetSize, onSuccess, onError) {
    var photo, image;
    photo = this;
    image = new Image();
    util.listen(image, 'load', function () {
      if (targetSize !== 'gridThumbnail') {
        photo[targetSize].isCached = true;
      }
      onSuccess(photo);
    });
    util.listen(image, 'error', function() {
      onError(photo);
    });
    if (targetSize !== 'gridThumbnail') {
      image.src = photo[targetSize].source;
    } else {
      image.src = photo.thumbnail.source;
    }
    return image;
  }

  /**
   * Loads, and keeps a reference to, the target size of this PhotoItem's image.
   * @function PhotoItem#loadImage
   * @param {'full'|'small'|'thumbnail'|'gridThumbnail'} targetSize Which size version of this photo to load.
   * @param {Function} onSuccess An event listener called if the image is loaded successfully.
   * @param {Function} onError An event listener called if an error occurs while loading the image.
   */
  function loadImage(targetSize, onSuccess, onError) {
    var photo = this;
    photo[targetSize].image = cacheImage.call(photo, targetSize, onSuccess, onError);
  }

  /**
   * Adds an event listener for a tap event over one of the image elements of this PhotoItem.
   * @function PhotoItem#addTapEventListener
   * @param {'full'|'small'|'thumbnail'|'gridThumbnail'} targetSize Which size image to use as the target for
   * this event listener.
   * @param {Function} tapHandler The callback function to call when a image tap occurs.
   */
  function addTapEventListener(targetSize, tapHandler) {
    var photo = this;
    util.addTapEventListener(photo[targetSize].image, function(event) {
      tapHandler(event, photo);
    }, false);
  }

  // TODO: jsdoc
  function getPageOffset(targetSize) {
    var photo = this;
    return util.getPageOffset(photo[targetSize].image);
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
   * @param {Number} thumbnailX The x-coordinate of the placement of the thumbnail image, with the
   * origin at the top-left corner of the entire page/document.
   * @param {Number} thumbnailY The y-coordinate of the placement of the thumbnail image, with the
   * origin at the top-left corner of the entire page/document.
   */
  function PhotoItem(index, fullSource, fullWidth, fullHeight, smallSource, smallWidth,
                     smallHeight, thumbnailSource, thumbnailWidth, thumbnailHeight, thumbnailX,
                     thumbnailY) {
    this.index = index;
    this.full = {
      image: null,
      isCached: false,
      source: fullSource,
      width: fullWidth,
      height: fullHeight
    };
    this.small = {
      image: null,
      isCached: false,
      source: smallSource,
      width: smallWidth,
      height: smallHeight
    };
    this.thumbnail = {
      image: null,
      isCached: false,
      source: thumbnailSource,
      width: thumbnailWidth,
      height: thumbnailHeight
    };
    this.gridThumbnail = {
      image: null,
      columnIndex: -1,
      rowIndex: -1
    };

    this.cacheImage = cacheImage;
    this.loadImage = loadImage;
    this.addTapEventListener = addTapEventListener;
    this.getPageOffset = getPageOffset;
  }

  // Expose this module
  if (!window.app) window.app = {};
  window.app.PhotoItem = PhotoItem;
  PhotoItem.initStaticFields = initStaticFields;

  console.log('photoItem module loaded');
})();
