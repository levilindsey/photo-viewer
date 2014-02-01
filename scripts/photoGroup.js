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
  function cacheThumbnails(onSingleSuccess, onTotalSuccess, onTotalError) {
    var images, image, cachedCount, failedPhotos, photoGroup;

    photoGroup = this;
    cachedCount = 0;
    images = [];
    failedPhotos = [];

    photoGroup.photos.forEach(function(photo) {
      image = photo.cacheThumbnail(onImageLoaded, onImageFailed);
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
  function loadThumbnails(onSingleSuccess, onTotalSuccess, onTotalError) {
    var loadedCount, failedPhotos, photoGroup;

    photoGroup = this;
    loadedCount = 0;
    failedPhotos = [];

    photoGroup.photos.forEach(function(photo) {
      photo.loadThumbnail(onImageLoaded, onImageFailed);
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
  function addPhotoItemTapEventListeners(tapHandler) {
    this.photos.forEach(function(photo) {
      photo.addTapEventListener(tapHandler, 'thumbnail');
    });
  }

  // ------------------------------------------------------------------------------------------- //
  // Private static functions

  // TODO: jsdoc
  function parsePhotoMetadata(responseText, onSuccess, onError) {
    var metadata, groupTitle, photoGroups;

    try {
      metadata = JSON.parse(responseText);
    } catch (e) {
      onError('Unable to parse response string into a valid JSON object: ' + responseText);
    }

    try {
      photoGroups = [];
      for (groupTitle in metadata) {
        photoGroups.push(parsePhotoGroupMetadata(groupTitle, metadata[groupTitle]));
      }
    } catch (e) {
      onError('Unable to parse metadata object into PhotoItems: ' + responseText);
    }

    onSuccess(photoGroups);
  }

  // TODO: jsdoc
  function parsePhotoGroupMetadata(title, groupedPhotoItemMetadata) {
    var photos, i, count;

    photos = [];

    for (i = 0, count = groupedPhotoItemMetadata.length; i < count; i++) {
      photos.push(parsePhotoItem(groupedPhotoItemMetadata[i]));
    }

    return new PhotoGroup(title, photos);
  }

  // TODO: jsdoc
  function parsePhotoItem(photoItemMetadata) {
    var orig, thumb;

    orig = photoItemMetadata.orig;
    thumb = photoItemMetadata.thumb;

    return new PhotoItem(
      orig.src, orig.w, orig.h,
      thumb.src, thumb.w, thumb.h,
      Number.NaN, Number.NaN);
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

  // TODO: jsdoc
  function downloadAndParsePhotoMetadata(url, onSuccess, onError) {
    util.sendRequest(url, function(responseText) {
      parsePhotoMetadata(responseText, onSuccess, onError);
    }, onError);
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

    this.cacheThumbnails = cacheThumbnails;
    this.loadThumbnails = loadThumbnails;
    this.addPhotoItemTapEventListeners = addPhotoItemTapEventListeners;
  }

  // Expose this module
  if (!window.app) window.app = {};
  window.app.PhotoGroup = PhotoGroup;
  PhotoGroup.initStaticFields = initStaticFields;
  PhotoGroup.downloadAndParsePhotoMetadata = downloadAndParsePhotoMetadata;

  console.log('photoGroup module loaded');
})();
