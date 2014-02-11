/**
 * This static module drives the PhotoViewer app.
 * @module index
 */
(function() {

  var params, util, log, animate, SVGProgressCircle, CSSProgressCircle, PhotoItem, PhotoGroup,
    photoMetadata, PhotoLightbox, DropdownPhotoGrid, PhotoGridCollection, photoGridCollection;

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
    SVGProgressCircle = app.SVGProgressCircle;
    CSSProgressCircle = app.CSSProgressCircle;
    PhotoItem = app.PhotoItem;
    PhotoGroup = app.PhotoGroup;
    photoMetadata = app.photoMetadata;
    PhotoLightbox = app.PhotoLightbox;
    DropdownPhotoGrid = app.DropdownPhotoGrid;
    PhotoGridCollection = app.PhotoGridCollection;

    animate.init();
    SVGProgressCircle.initStaticFields();
    //CSSProgressCircle.initStaticFields(); // TODO: ...
    PhotoItem.initStaticFields();
    PhotoGroup.initStaticFields();
    photoMetadata.init();
    PhotoLightbox.initStaticFields();
    DropdownPhotoGrid.initStaticFields();
    PhotoGridCollection.initStaticFields();

    log.i('reset', 'All modules initialized');

    body = document.getElementsByTagName('body')[0];
    photoGridCollection = new PhotoGridCollection(body);

    photoMetadata.downloadAndParsePhotoMetadata(params.PHOTO_METADATA.URL,
        onParsePhotoMetadataSuccess, onParsePhotoMetadataError);
    cacheSpriteSheet();
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

  /**
   * This is the event handler for all of the photo metadata being downloaded and parse
   * successfully.
   * @function index~onParsePhotoMetadataSuccess
   * @param photoGroups
   */
  function onParsePhotoMetadataSuccess(photoGroups) {
    log.i('onParsePhotoMetadataSuccess', 'Photo metadata successfully loaded and parsed');
    photoGridCollection.onPhotoMetadataParsed(photoGroups);
  }

  /**
   * This is the event handler for an error occurring while downloading or parsing the photo
   * metadata.
   * @function index~onParsePhotoMetadataError
   * @param errorMessage
   */
  function onParsePhotoMetadataError(errorMessage) {
    log.e('onParsePhotoMetadataError', 'Unable to load/parse metadata: ' + errorMessage);
    // TODO:
  }

  if (!window.app) window.app = {};

  console.log('index module loaded');

  init();
})();
