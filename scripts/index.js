/**
 * This static module drives the PhotoViewer app.
 * @module index
 */
(function () {

  var params, util, log, animate, ProgressCircle, PhotoItem, PhotoGroup, photoMetadata, PhotoLightbox, PhotoGridCell, DropdownPhotoGrid, PhotoGridCollection, photoGridCollection;

  // ------------------------------------------------------------------------------------------- //
  // Private static functions

  /**
   * Initializes this app.
   * @function index~init
   */
  function init() {
    params = app.params;
    util = app.util;
    app.Log.initStaticFields();
    log = new app.Log('index');

    log.d('init');

    util.init();

    util.listen(window, 'load', onDocumentLoad);
  }

  /**
   * Resets all of the state for this app.
   * @function index~reset
   */
  function reset() {
    var body;

    animate = app.animate;
    ProgressCircle = app.ProgressCircle;
    PhotoItem = app.PhotoItem;
    PhotoGroup = app.PhotoGroup;
    photoMetadata = app.photoMetadata;
    PhotoLightbox = app.PhotoLightbox;
    PhotoGridCell = app.PhotoGridCell;
    DropdownPhotoGrid = app.DropdownPhotoGrid;
    PhotoGridCollection = app.PhotoGridCollection;

    animate.init();
    ProgressCircle.initStaticFields();
    PhotoItem.initStaticFields();
    PhotoGroup.initStaticFields();
    photoMetadata.init();
    PhotoLightbox.initStaticFields();
    PhotoGridCell.initStaticFields();
    DropdownPhotoGrid.initStaticFields();
    PhotoGridCollection.initStaticFields();

    log.i('reset', 'All modules initialized');

    body = document.getElementsByTagName('body')[0];
    photoGridCollection = new PhotoGridCollection(body);

    photoMetadata.downloadAndParsePhotoMetadata(params.PHOTO_METADATA.URL,
        onParsePhotoMetadataSuccess, onParsePhotoMetadataError);
    cacheSpriteSheet();
    checkBrowserCompatibility();
  }

  /**
   * This is the event handler for the completion of the DOM loading.
   * @function index~onDocumentLoad
   */
  function onDocumentLoad() {
    log.i('onDocumentLoad');

    reset();
  }

  /**
   * @function index~checkBrowserCompatibility
   */
  function checkBrowserCompatibility() {
    if (!util.isBrowserCompatible) {
      showErrorMessage(params.L18N.EN.BAD_BROWSER_MESSAGE);
    }
  }

  /**
   * Adds an error message ribbon overtop of the document body. This message can be closed by
   * tapping on it.
   * @param {String} message The text to show in the error display.
   */
  function showErrorMessage(message) {
    var body, errorMessageElement;

    body = document.getElementsByTagName('body')[0];

    errorMessageElement = util.createElement('div', body, null, ['errorMessage']);
    errorMessageElement.innerHTML = message;
    errorMessageElement.onclick = function () {
      body.removeChild(errorMessageElement);
    };
  }

  /**
   * Caches the master sprite sheet.
   * @function index~cacheSpriteSheet
   */
  function cacheSpriteSheet() {
    var image = new Image();
    util.listen(image, 'load', function () {
      log.i('cacheSpriteSheet', 'success');
    });
    util.listen(image, 'error', function () {
      log.e('cacheSpriteSheet', 'error');
    });
    image.src = params.SPRITES.SRC;
  }

  /**
   * This is the event handler for all of the photo metadata being downloaded and parse
   * successfully.
   * @function index~onParsePhotoMetadataSuccess
   * @param photoGroups
   */
  function onParsePhotoMetadataSuccess(photoGroups) {
    log.i('onParsePhotoMetadataSuccess', 'Photo metadata successfully loaded and parsed');
    photoGridCollection.onPhotoMetadataParsed(photoGroups);
    openPhotoForQueryString(location.search);
  }

  /**
   * This is the event handler for an error occurring while downloading or parsing the photo
   * metadata.
   * @function index~onParsePhotoMetadataError
   * @param errorMessage
   */
  function onParsePhotoMetadataError(errorMessage) {
    log.e('onParsePhotoMetadataError', 'Unable to load/parse metadata: ' + errorMessage);
    showErrorMessage(params.L18N.EN.METADATA_ERROR_MESSAGE);
  }

  /**
   * Opens the grid and photo to match the given query string (if the query string is valid).
   * @function index~openPhotoForQueryString
   * @param {String} queryString The query string.
   */
  function openPhotoForQueryString(queryString) {
    var groupName, index, openSuccess;
    groupName = util.getQueryStringParameterValue(queryString, 'group');
    if (groupName) {
      // Open the appropriate grid
      openSuccess = photoGridCollection.openGroup(groupName);

      // Don't try to open a photo if opening the group didn't work
      if (openSuccess) {
        index = parseInt(util.getQueryStringParameterValue(queryString, 'index'));
        if (!isNaN(index) && index >= 0) {
          // Open the lightbox to the appropriate photo
          openSuccess = photoGridCollection.openPhoto(index, groupName);

          if (!openSuccess) {
            log.w('openPhotoForQueryString',
                'Invalid query string photo index parameter: queryString=' + queryString +
                    ', index=' + index);
          }
        }
      } else {
        log.w('openPhotoForQueryString',
            'Invalid query string photo group parameter: queryString=' + queryString + ', group=' +
                groupName);
      }
    }
  }

  // ------------------------------------------------------------------------------------------- //
  // Public static functions

  /**
   * Updates the query string to reflect the current grid and photo.
   * @global
   * @function index.updateQueryString
   * @param {PhotoGroup} photoGroup The current photo group.
   * @param {Number} photoIndex The index of the current photo.
   */
  function updateQueryString(photoGroup, photoIndex) {
    var params, queryString;
    params = {};

    if (photoGroup) {
      // Add the current grid
      params.group = photoGroup.title;

      if (photoIndex >= 0) {
        // Add the current photo index
        params.index = photoIndex;
      }

      queryString = util.encodeQueryString(params);
    } else {
      // There is no current grid or photo
      queryString = '?';
    }

    history.replaceState({}, 'Photo Viewer', queryString);
  }

  // ------------------------------------------------------------------------------------------- //

  if (!window.app) window.app = {};
  app.updateQueryString = updateQueryString;

  console.log('index module loaded');

  init();
})();
