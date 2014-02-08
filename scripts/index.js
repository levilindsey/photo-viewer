/**
 * This static module drives the PhotoViewer app.
 * @module index
 */
(function() {

  var params, util, log, animate, SVGProgressCircle, CSSProgressCircle, PhotoItem, PhotoGroup,
    photoMetadata, PhotoLightbox, DropdownPhotoGrid, photoGrids, currentOpenPhotoGrid;

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
    currentOpenPhotoGrid = null;

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

    // Create the photo grids and add them to the DOM
    photoGroups.forEach(function(photoGroup) {
      photoGrid = new DropdownPhotoGrid(photoGroup, body, onPhotoGridOpen, onPhotoGridClose);
      photoGrids.push(photoGrid);
      photoGrid.cacheThumbnails();
    });
  }

  // TODO: jsdoc
  function onParsePhotoMetadataError(errorMessage) {
    log.e('onParsePhotoMetadataError', 'Unable to load/parse metadata: ' + errorMessage);
    // TODO:
  }

  // TODO: jsdoc
  function onPhotoGridOpen(photoGrid) {
    log.i('onPhotoGridOpen', 'photoGrid.title=' + photoGrid.photoGroup.title);
    if (currentOpenPhotoGrid) {
      currentOpenPhotoGrid.close();
    }
    currentOpenPhotoGrid = photoGrid;
  }

  // TODO: jsdoc
  function onPhotoGridClose(photoGrid) {
    log.i('onPhotoGridClose', 'photoGrid.title=' + photoGrid.photoGroup.title);
    currentOpenPhotoGrid = null;
  }

  if (!window.app) window.app = {};

  console.log('index module loaded');

  init();
})();
