/**
 * This module defines a constructor for DropdownPhotoGrid objects.
 * @module dropdownPhotoGrid
 */
(function() {
  // ------------------------------------------------------------------------------------------- //
  // Private static variables

  var params, util, log, animate, photoLightbox;

  // ------------------------------------------------------------------------------------------- //
  // Private dynamic functions

  // TODO: jsdoc
  function createElements() {
    var photoGrid, container, banner, bannerIcon, grid;

    photoGrid = this;

    container = util.createElement('div', photoGrid.parent, null, ['photoGridContainer']);

    banner = util.createElement('div', container, null, ['photoGridBanner']);
    util.addTapEventListener(banner, function() {
      onBannerTap.call(photoGrid);
    }, false);

    bannerIcon = util.createElement('div', banner, null, ['bannerIcon']);

    grid = util.createElement('div', container, null, ['photoGrid']);
    // TODO: !!
    // - use capturing (as opposed to bubbling) to let the grid element capture taps before the images know about them
    // - will need to add an additional optional parameter to the util.addTapEventListener for this
    // - when a tap occurs, and grid.opening === true, invoke calculateThumbnailPositions()

    photoGrid.elements = {
      container: container,
      banner: banner,
      bannerIcon: bannerIcon,
      grid: grid
    };

    createThumbnails.call(photoGrid);
    resize.call(photoGrid);
  }

  // TODO: jsdoc
  function createThumbnails() {
    var photoGrid = this;

    photoGrid.photoGroup.loadImages('thumbnail', onPhotoGroupSingleSuccess,
        onPhotoGroupTotalSuccess, onPhotoGroupTotalError);

    photoGrid.photoGroup.photos.forEach(function(photo) {
      photoGrid.grid.appendChild(photo.thumbnail.image);
    });
  }

  // TODO: jsdoc
  function resize() {
    var photoGrid, parentColumnCapacity, maxWidth;

    photoGrid = this;

    parentColumnCapacity =
        (parseInt(photoGrid.parent.style.width) - params.GRID.THUMBNAIL_MARGIN) /
        (params.GRID.THUMBNAIL_WIDTH + params.GRID.THUMBNAIL_MARGIN);

    maxWidth = (params.GRID.THUMBNAIL_MARGIN * params.GRID.MAX_COLUMN_COUNT + 1) +
        params.GRID.THUMBNAIL_WIDTH * params.GRID.MAX_COLUMN_COUNT;

    photoGrid.columnCount = parentColumnCapacity >= params.GRID.MAX_COLUMN_COUNT ?
        params.GRID.MAX_COLUMN_COUNT : parentColumnCapacity;
    photoGrid.rowCount = **;

    // TODO:
    // - compute the width to use (according to max width, current parent width, and thumbnail width);
    // - compute the columnCount and rowCount
    // - compute the height this will then need
    // - apply these dimensions to the grid

    // TODO: if the grid is currently open, then re-position the thumbnails, then start the bouncing thing as the css transition handles the grid height
    // - for the bouncing thing:
    //   - apply the transition properties manually in javascript
    //     - because I will want smaller height changes to take less time
  }

  // TODO: jsdoc
  function calculateThumbnailPositions() {
    // TODO:
//    for (var i = 0, count = photoGroup.photos.length; i < count; i++) {
//      x = i % colCount * width;
//      y = parseInt(i / colCount) * height;
//      photoGroup.photos[i].thumbnail.x = x;
//      photoGroup.photos[i].thumbnail.y = y;
//    }
  }

  // TODO: jsdoc
  function onPhotoGroupSingleSuccess(photoGroup, photo) {
    ///////////////////////////////////////////////////////////
    // TODO: CHANGE THIS (as is, it was directly copied from old index code)
    var pageCoords;
    if (photoGroup.title === 'J+L') {
      photo.thumbnail.image.style.position = 'absolute';
      photo.thumbnail.image.style.left = photo.thumbnail.x + 'px';
      photo.thumbnail.image.style.top = photo.thumbnail.y + 'px';
      document.getElementsByTagName('body')[0].appendChild(photo.thumbnail.image);
//      pageCoords = util.getPageCoordinates(photo.thumbnail.image);
//      photo.thumbnail.x = pageCoords.x;
//      photo.thumbnail.y = pageCoords.y;
    }
    ///////////////////////////////////////////////////////////
  }

  // TODO: jsdoc
  function onPhotoGroupTotalSuccess(photoGroup) {
    log.i('onPhotoGroupTotalSuccess', 'All photos loaded for group ' + photoGroup.title);
    photoGroup.addPhotoItemTapEventListeners('thumbnail', onPhotoItemTap);
    // TODO:
  }

  // TODO: jsdoc
  function onPhotoGroupTotalError(photoGroup, failedPhotos) {
    log.e('onPhotoGroupTotalError', 'Unable to load ' + failedPhotos.length + ' photos for group ' + photoGroup.title);
    // TODO:
  }

  // TODO: jsdoc
  function onPhotoItemTap(event, photoGroup, index) {
    log.i('onPhotoItemTap', 'PhotoItem=' + photoGroup.photos[index].thumbnail.source);
    // TODO:
    photoLightbox.open(photoGroup, index);
    util.stopPropogation(event);
  }

  // TODO: jsdoc
  function onBannerTap() {
    var photoGrid = this;
    log.i('onBannerTap', 'isOpen=' + photoGrid.isOpen);
    if (photoGrid.isOpen) {
      close.call(photoGrid);
    } else {
      open.call(photoGrid);
    }
  }

  // TODO: jsdoc
  function onOpeningFinished() {
    var photoGrid;

    photoGrid = this;

    // TODO:

    calculateThumbnailPositions();

    photoGrid.opening = false;
  }

  // TODO: jsdoc
  function onClosingFinished() {
    var photoGrid;

    photoGrid = this;

    // TODO:

    photoGrid.closing = false;
  }

  // ------------------------------------------------------------------------------------------- //
  // Public dynamic functions

  // TODO: jsdoc
  function open() {
    var photoGrid;

    photoGrid = this;
    photoGrid.opening = true;

    // TODO:
    // - use the current width/height/columnCount/rowCount dimensions that have been saved from resize();
    // - loop through each thumbnail and assign each a rowIndex (top row is zero)
    // -

    if (photoGrid.openEventListener) {
      photoGrid.openEventListener();
    }
  }

  // TODO: jsdoc
  function close() {
    var photoGrid;

    photoGrid = this;
    photoGrid.closing = true;

    // TODO:
  }

  // TODO: jsdoc
  function cacheThumbnails() {
    // TODO:
  }

  // ------------------------------------------------------------------------------------------- //
  // Private static functions



  // ------------------------------------------------------------------------------------------- //
  // Public static functions

  /**
   * Initializes some static state for this module.
   * @function DropdownPhotoGrid.initStaticFields
   */
  function initStaticFields() {
    params = app.params;
    util = app.util;
    log = new app.Log('dropdownPhotoGrid');
    animate = app.animate;
    photoLightbox = new PhotoLightbox();
    log.d('initStaticFields', 'Module initialized');
  }

  // ------------------------------------------------------------------------------------------- //
  // Expose this module's constructor

  /**
   * @constructor
   * @global
   * @param {} ...
   */
  function DropdownPhotoGrid(photoGroup, parent, openEventListener) {
    var photoGrid = this;

    photoGrid.photoGroup = photoGroup;
    photoGrid.parent = parent;
    photoGrid.elements = null;
    photoGrid.isOpen = false;
    photoGrid.opening = false;
    photoGrid.closing = false;
    photoGrid.columnCount = 0;
    photoGrid.rowCount = 0;
    photoGrid.openEventListener = openEventListener;
    photoGrid.cacheThumbnails = cacheThumbnails;

    createElements.call(photoGrid);
  }

  // Expose this module
  if (!window.app) window.app = {};
  window.app.DropdownPhotoGrid = DropdownPhotoGrid;
  DropdownPhotoGrid.initStaticFields = initStaticFields;

  console.log('dropdownPhotoGrid module loaded');
})();
