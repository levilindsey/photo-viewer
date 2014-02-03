/**
 * This static module drives the PhotoViewer app.
 * @module index
 */
(function() {

  var params, util, log, animate, SVGProgressCircle, CSSProgressCircle, PhotoItem, PhotoGroup,
    photoMetadata, PhotoLightbox, DropdownPhotoGrid;

  // TODO: jsdoc
  function init() {
    params = app.params;
    util = app.util;
    app.Log.initStaticFields();
    log = new app.Log('index');

    log.i('init');

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
    CSSProgressCircle.initStaticFields();
    PhotoItem.initStaticFields();
    PhotoGroup.initStaticFields();
    photoMetadata.init();
    PhotoLightbox.initStaticFields();
    DropdownPhotoGrid.initStaticFields();

    log.i('reset', 'All modules initialized');

    photoMetadata.downloadAndParsePhotoMetadata(params.PHOTO_METADATA.URL, onParsePhotoMetadataSuccess, onParsePhotoMetadataError);
  }

  // TODO: jsdoc
  function onDocumentLoad() {
    log.i('onDocumentLoad');

    reset();

    // TODO: remove the following
    var progressCircle, body, svg, left, top, diameter, dotRadius;

    body = document.getElementsByTagName('body')[0];
    body.style.width = '100%';
    body.style.height = '100%';
    body.style.margin = '0px';
    body.style.backgroundColor = '#202020';

    svg = document.createElementNS(params.SVG_NAMESPACE, 'svg');
    svg.style.position = 'absolute';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.zIndex = '2147483647';
    body.appendChild(svg);

    left = 100;
    top = 100;
    diameter = 300;
    dotRadius = 10;
    progressCircle = new SVGProgressCircle(svg, left, top, diameter, dotRadius);
    setTimeout(function() {
      progressCircle.close();
    }, 1000);
  }

  /**
   * Caches the master sprite sheet.
   * @function index~cacheSpriteSheet
   */
  function cacheSpriteSheet() {
    var image = new Image();
    util.listen(image, 'load', function() { log.i('cacheSpriteSheet', 'success'); });
    util.listen(image, 'error', function() { log.e('cacheSpriteSheet', 'error'); });
    image.src = params.SPRITES.SRC;
  }

  // TODO: jsdoc
  function onParsePhotoMetadataSuccess(photoGroups) {
    log.i('onParsePhotoMetadataSuccess', 'Photo metadata successfully loaded and parsed');

    // TODO: now, cache the thumbnails for the first group that is displayed (and then, after that is done, cache the other groups' thumbnails)

    ///////////////////////////////////////////////////////////
    // TODO: replace this with grid module
    var width = 210, height = 160, colCount = 6, x, y;
    ///////////////////////////////////////////////////////////

    photoGroups.forEach(function(photoGroup) {
      /////////////////////////////////////////////////////////
      // TODO: replace this with grid module
      for (var i = 0, count = photoGroup.photos.length; i < count; i++) {
        x = i % colCount * width;
        y = parseInt(i / colCount) * height;
        photoGroup.photos[i].thumbnail.x = x;
        photoGroup.photos[i].thumbnail.y = y;
      }
      /////////////////////////////////////////////////////////

      photoGroup.loadImages('thumbnail', onPhotoGroupSingleSuccess,
        onPhotoGroupTotalSuccess, onPhotoGroupTotalError);
    });
  }

  // TODO: jsdoc
  function onPhotoGroupSingleSuccess(photoGroup, photo) {
    ///////////////////////////////////////////////////////////
    // TODO: replace this with grid module
    var pageCoords;
    photoGroup.addPhotoItemTapEventListeners('thumbnail', onPhotoItemTap);
    if (photoGroup.title === 'J+L') {
      photo.thumbnail.image.style.position = 'absolute';
      photo.thumbnail.image.style.left = photo.thumbnail.x + 'px';
      photo.thumbnail.image.style.top = photo.thumbnail.y + 'px';
      document.getElementsByTagName('body')[0].appendChild(photo.thumbnail.image);
      pageCoords = util.getPageCoordinates(photo.thumbnail.image);
      photo.thumbnail.x = pageCoords.x;
      photo.thumbnail.y = pageCoords.y;
    }
    ///////////////////////////////////////////////////////////
  }

  // TODO: jsdoc
  function onPhotoGroupTotalSuccess(photoGroup) {
    log.i('onPhotoGroupTotalSuccess', 'All photos loaded for group ' + photoGroup.title);
    // TODO:
  }

  // TODO: jsdoc
  function onPhotoGroupTotalError(photoGroup, failedPhotos) {
    log.e('onPhotoGroupTotalError', 'Unable to load ' + failedPhotos.length + ' photos for group ' + photoGroup.title);
    // TODO:
  }

  // TODO: jsdoc
  function onParsePhotoMetadataError(errorMessage) {
    log.e('onParsePhotoMetadataError', 'Unable to load/parse metadata: ' + errorMessage);
    // TODO:
  }

  // TODO: jsdoc
  function onPhotoItemTap(event, photo) {
    log.i('onPhotoItemTap', 'PhotoItem=' + photo.thumbnail.source);
    // TODO:
    alert("Hey!! Watch who you're poking!");
    util.stopPropogation(event);
  }

// TODO: PLAN OF ATTACK
//  - simple grid of thumbnails
//  - then click on one to enlarge it into a lightbox
//    - this should animate the large image from the small position to the new large position
//    - there should be a progress circle--for the loading of the large image--that I display either over the small image (when first opening the lightbox) or over the large image (when switching to previous or next)
//    - will need to store the photos on another server
//      - GoDaddy? Gandi? AWS?
//      - take this opportunity to straighten out my GoDaddy woes
//  - will need to have two folders
//    - the main one has the actual original images, the other has the thumbnails
//    - the thumbnail folder must have the same name as the main folder
//    - the thumbnail folder must have a tiny copy of each of the images in the main folder, each with the exact same name, but with a suffix of "-thumbnail"
//    - will need to create a script to automatically generate the thumbnails
//    - document this (in addition to how to set up the other parameters of the viewer (like full/main image size, or whether the full image should be full screen, and small/grid/thumbnail image size)
//  - will need all images to be pre-rotated
//  - must set up CORS
//  - add the ability to group the photos
//    - this will require the server to hold a different pair of folders for each group
//    - the groups dynamically and smoothly enlarge/shrink as the user changes group selections
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
