/**
 * This static module drives the PhotoViewer app.
 * @module index
 */
(function() {

  var params, util, log, animate, SVGProgressCircle, CSSProgressCircle, PhotoItem, PhotoGroup,
    photoMetadata, PhotoLightbox, DropdownPhotoGrid, photoGrids;

  // TODO: jsdoc
  function init() {
    params = app.params;
    util = app.util;
    app.Log.initStaticFields();
    log = new app.Log('index');

    log.d('init');

    util.init();

    util.listen(window, 'load', onDocumentLoad);
  }

  // TODO: jsdoc
  function reset() {
    animate = app.animate;
    SVGProgressCircle = app.SVGProgressCircle;
    CSSProgressCircle = app.CSSProgressCircle;
    PhotoItem = app.PhotoItem;
    PhotoGroup = app.PhotoGroup;
    photoMetadata = app.photoMetadata;
    PhotoLightbox = app.PhotoLightbox;
    DropdownPhotoGrid = app.DropdownPhotoGrid;

    animate.init();
    SVGProgressCircle.initStaticFields();
    //CSSProgressCircle.initStaticFields(); // TODO: ...
    PhotoItem.initStaticFields();
    PhotoGroup.initStaticFields();
    photoMetadata.init();
    PhotoLightbox.initStaticFields();
    DropdownPhotoGrid.initStaticFields();

    log.i('reset', 'All modules initialized');

    photoGrids = [];

    photoMetadata.downloadAndParsePhotoMetadata(params.PHOTO_METADATA.URL,
        onParsePhotoMetadataSuccess, onParsePhotoMetadataError);
    cacheSpriteSheet();
  }

  // TODO: jsdoc
  function onDocumentLoad() {
    log.i('onDocumentLoad');

    reset();
  }

  /**
   * Caches the master sprite sheet.
   * @function index~cacheSpriteSheet
   */
  function cacheSpriteSheet() {
    var image = new Image();
    util.listen(image, 'load', function() {
      log.i('cacheSpriteSheet', 'success');
    });
    util.listen(image, 'error', function() {
      log.e('cacheSpriteSheet', 'error');
    });
    image.src = params.SPRITES.SRC;
  }

  // TODO: jsdoc
  function onParsePhotoMetadataSuccess(photoGroups) {
    log.i('onParsePhotoMetadataSuccess', 'Photo metadata successfully loaded and parsed');
    var photoGrid, body;

    body = document.getElementsByTagName('body')[0];

    // TODO: now, cache the thumbnails for the first group that is displayed (and then, after that is done, cache the other groups' thumbnails)
    // TODO: call photoGrid.cacheThumbnails() on only the first photoGrid
    // TODO: attach photoGrid.openEventListener

    photoGroups.forEach(function(photoGroup) {
      photoGrid = new DropdownPhotoGrid(photoGroup, body);
      photoGrids.push(photoGrid);
    });
  }

  // TODO: jsdoc
  function onParsePhotoMetadataError(errorMessage) {
    log.e('onParsePhotoMetadataError', 'Unable to load/parse metadata: ' + errorMessage);
    // TODO:
  }

// TODO: PLAN OF ATTACK
//  - will need to have two folders
//    - document this (in addition to how to set up the other parameters of the viewer (like full/main image size, or whether the full image should be full screen, and small/grid/thumbnail image size)
//  - place this app at jackieandlevi.com/wedding/photos
//    - add a link on the home page
//    - add a link on my projects page
//    - add a link, in the form of an eight bubble, to the invite page
//      - this may require fixing some bugs in the wedding swoosh logic...
//  - move the invite page to /wedding/invite
//    - but also show the invite page whenever anyone goes to /wedding

  if (!window.app) window.app = {};

  console.log('index module loaded');

  init();
})();
