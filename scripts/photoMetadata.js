/**
 * This module defines a static functions and state for handling photo metadata.
 * @module photoMetadata
 */
(function() {
  // ------------------------------------------------------------------------------------------- //
  // Private static variables

  var photoMetadata, params, util, log, PhotoGroup, PhotoItem;

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
      photos.push(parsePhotoItem(groupedPhotoItemMetadata[i], i));
    }

    return new PhotoGroup(title, photos);
  }

  // TODO: jsdoc
  function parsePhotoItem(photoItemMetadata, index) {
    var full, small, thumb;

    full = photoItemMetadata.full;
    small = photoItemMetadata.small || full;
    thumb = photoItemMetadata.thumb || small;

    return new PhotoItem(index, full.src, full.w, full.h, small.src, small.w, small.h, thumb.src,
        thumb.w, thumb.h, Number.NaN, Number.NaN);
  }

  // ------------------------------------------------------------------------------------------- //
  // Public static functions

  /**
   * Initializes some static state for this module.
   * @function photoMetadata.init
   */
  function init() {
    params = app.params;
    util = app.util;
    log = new app.Log('photoMetadata');
    PhotoItem = app.PhotoItem;
    PhotoGroup = app.PhotoGroup;
    log.d('init', 'Module initialized');
  }

  // TODO: jsdoc
  function downloadAndParsePhotoMetadata(url, onSuccess, onError) {
    util.sendRequest(url, function(responseText) {
      log.i('downloadAndParsePhotoMetadata', 'Metadata successfully downloaded');
      parsePhotoMetadata(responseText, onSuccess, onError);
    }, onError);
  }

  // ------------------------------------------------------------------------------------------- //
  // Expose this module

  /**
   * Exposes the static photoMetadata functions and state.
   * @global
   */
  photoMetadata = {
    init: init,
    downloadAndParsePhotoMetadata: downloadAndParsePhotoMetadata
  };

  // Expose this module
  if (!window.app) window.app = {};
  window.app.photoMetadata = photoMetadata;

  console.log('photoMetadata module loaded');
})();
