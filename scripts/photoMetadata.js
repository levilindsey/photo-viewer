/**
 * This module defines a static functions and state for handling photo metadata.
 * @module photoMetadata
 */
(function () {
  // ------------------------------------------------------------------------------------------- //
  // Private static variables

  var photoMetadata, params, util, log, PhotoGroup, PhotoItem;

  // ------------------------------------------------------------------------------------------- //
  // Private static functions

  /**
   * Attempts to parse the given HTTP response text as a JSON object containing photo metadata.
   * @function photoMetadata~parsePhotoMetadata
   * @param {String} responseText The text to parse as JSON data.
   * @param {Function} onSuccess This function is called if the JSON data was successfully parsed.
   * @param {Function} onError This function is called if there was an error parsing the JSON data.
   */
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

  /**
   * Parses the given collection of photo metadata into an internal photo group object.
   * @function photoMetadata~parsePhotoGroupMetadata
   * @param {String} title The title of this collection of photos.
   * @param {Object} groupedPhotoItemMetadata The photo collection data to parse into an internal
   * photo group object.
   * @returns {PhotoGroup} The internal photo group object that represents the given photo
   * collection data.
   */
  function parsePhotoGroupMetadata(title, groupedPhotoItemMetadata) {
    var photos, i, count;

    photos = [];

    for (i = 0, count = groupedPhotoItemMetadata.length; i < count; i++) {
      photos.push(parsePhotoItem(groupedPhotoItemMetadata[i], i));
    }

    return new PhotoGroup(title, photos);
  }

  /**
   * Parses the given photo metadata into an internal photo item object.
   * @function photoMetadata~parsePhotoItem
   * @param {Object} photoItemMetadata The photo metadata to parse.
   * @param {Number} index The index of this photo item within its collection.
   * @returns {PhotoItem} The internal photo item object that represents the given photo item data.
   */
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

  /**
   * Downloads and parses photo metadata in JSON form from the given URL.
   * @function photoMetadata.downloadAndParsePhotoMetadata
   * @param {String} url The location of the photo metadata.
   * @param {Function} onSuccess This function is called if the JSON data was successfully parsed.
   * @param {Function} onError This function is called if there was an error parsing the JSON data.
   */
  function downloadAndParsePhotoMetadata(url, onSuccess, onError) {
    util.sendRequest(url, function (responseText) {
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
