/**
 * This module defines a constructor for DropdownPhotoGrid objects.
 * @module dropdownPhotoGrid
 */
(function() {
  // ------------------------------------------------------------------------------------------- //
  // Private static variables

  var params, util, log, animate, PhotoLightbox, photoLightbox;

  // ------------------------------------------------------------------------------------------- //
  // Private dynamic functions

  // TODO: jsdoc
  function createElements() {
    var photoGrid, container, banner, bannerIcon, bannerTextContainer, bannerText, grid,
        photoGridInnerContainer;

    photoGrid = this;

    container = util.createElement('div', photoGrid.parent, null, ['photoGridContainer']);

    banner = util.createElement('div', container, null, ['photoGridBanner','closed']);
    util.addTapEventListener(banner, function() {
      onBannerTap.call(photoGrid);
    }, false);

    bannerIcon = util.createElement('img', banner, null, ['bannerIcon']);

    bannerTextContainer = util.createElement('div', banner, null, ['bannerTextContainer']);

    bannerText = util.createElement('span', bannerTextContainer, null, ['insetText']);
    bannerText.setAttribute('text', photoGrid.photoGroup.title);
    bannerText.innerHTML = photoGrid.photoGroup.title;

    grid = util.createElement('div', container, null, ['photoGrid']);
    // TODO: !!
    // - use capturing (as opposed to bubbling) to let the grid element capture taps before the images know about them
    // - will need to add an additional optional parameter to the util.addTapEventListener for this
    // - when a tap occurs, and grid.opening === true, invoke calculateThumbnailPositions()

    photoGridInnerContainer = util.createElement('div', grid, null, ['photoGridInnerContainer']);

    photoGrid.elements = {
      container: container,
      banner: banner,
      bannerIcon: bannerIcon,
      grid: grid,
      photoGridInnerContainer: photoGridInnerContainer,
      gridCells: null
    };

    createThumbnails.call(photoGrid);
    resize.call(photoGrid);
  }

  // TODO: jsdoc
  function createThumbnails() {
    var photoGrid, gridCell;

    photoGrid = this;
    photoGrid.elements.gridCells = [];

    // Load the thumbnails
    photoGrid.photoGroup.loadImages('gridThumbnail',
        function(photoGroup, photo) {
          onPhotoGroupSingleLoadSuccess.call(photoGrid, photoGroup, photo);
        },
        function(photoGroup) {
          onPhotoGroupTotalLoadSuccess.call(photoGrid, photoGroup);
        },
        function(photoGroup, failedPhotos) {
          onPhotoGroupTotalLoadError.call(photoGrid, photoGroup, failedPhotos);
        });

    // Create the thumbnail elements and add them to the DOM
    photoGrid.photoGroup.photos.forEach(function(photo) {
      gridCell = util.createElement('div', photoGrid.elements.photoGridInnerContainer, null,
          ['gridCell']);
      gridCell.appendChild(photo.gridThumbnail.image);
      photoGrid.elements.gridCells.push(gridCell);
    });

    // Listen for thumbnail taps
    photoGrid.photoGroup.addPhotoItemTapEventListeners('gridThumbnail',
        function(event, photoGroup, index) {
          onPhotoItemTap.call(photoGrid, event, photoGroup, index);
        });
  }

  // TODO: jsdoc
  function resize() {
    var photoGrid, parentColumnCapacity;

    // TODO: actually call this from window.onresize too

    photoGrid = this;

    // Determine how many columns could fit in the parent container
    parentColumnCapacity =
        (parseInt(photoGrid.parent.clientWidth) - params.GRID.THUMBNAIL_MARGIN) /
        (params.GRID.THUMBNAIL_WIDTH + params.GRID.THUMBNAIL_MARGIN);

    // Determine how many columns and rows of thumbnails to use
    photoGrid.columnCount = parentColumnCapacity >= params.GRID.MAX_COLUMN_COUNT ?
        params.GRID.MAX_COLUMN_COUNT : parentColumnCapacity;
    photoGrid.rowCount = parseInt(1 + photoGrid.photoGroup.photos.length / photoGrid.columnCount);

    // Set the grid's width and heights
    photoGrid.elements.container.style.width =
        photoGrid.columnCount * params.GRID.THUMBNAIL_WIDTH +
        (photoGrid.columnCount + 1) * params.GRID.THUMBNAIL_MARGIN + 'px';
    photoGrid.gridHeight = photoGrid.rowCount * params.GRID.THUMBNAIL_HEIGHT +
        (photoGrid.rowCount + 1) * params.GRID.THUMBNAIL_MARGIN;
    photoGrid.elements.photoGridInnerContainer.style.height = photoGrid.gridHeight + 'px';

    photoGrid.openCloseDuration = photoGrid.gridHeight / params.GRID.HEIGHT_CHANGE_RATE;

    // TODO: if the grid is opening, then re-start the animation
  }

  // TODO: jsdoc
  function calculateThumbnailRowsAndColumns() {
    var photoGrid, photos, i, count, columnIndex, rowIndex;

    photoGrid = this;
    photos = photoGrid.photoGroup.photos;

    for (i = 0, count = photos.length; i < count; i++) {
      columnIndex = i % photoGrid.columnCount;
      rowIndex = parseInt(i / photoGrid.columnCount);
      photos[i].gridThumbnail.columnIndex = columnIndex;
      photos[i].gridThumbnail.rowIndex = rowIndex;
    }
  }

  // TODO: jsdoc
  function onPhotoGroupSingleLoadSuccess(photoGroup, photo) {
    //log.v('onPhotoGroupSingleLoadSuccess');
    // TODO: cancel the progress circle (which will need to have been absolutely positioned at this image)
  }

  // TODO: jsdoc
  function onPhotoGroupTotalLoadSuccess(photoGroup) {
    log.i('onPhotoGroupTotalLoadSuccess', 'All photos loaded for group ' + photoGroup.title);
    // TODO:
  }

  // TODO: jsdoc
  function onPhotoGroupTotalLoadError(photoGroup, failedPhotos) {
    log.e('onPhotoGroupTotalLoadError',
        'Unable to load ' + failedPhotos.length + ' photos for group ' + photoGroup.title);
    // TODO:
  }

  // TODO: jsdoc
  function onPhotoGroupSingleCacheSuccess(photoGroup, photo) {
    //log.v('onPhotoGroupSingleCacheSuccess');
  }

  // TODO: jsdoc
  function onPhotoGroupTotalCacheSuccess(photoGroup) {
    log.i('onPhotoGroupTotalCacheSuccess', 'All photos cached for group ' + photoGroup.title);
  }

  // TODO: jsdoc
  function onPhotoGroupTotalCacheError(photoGroup, failedPhotos) {
    log.e('onPhotoGroupTotalCacheError',
        'Unable to cache ' + failedPhotos.length + ' photos for group ' + photoGroup.title);
  }

  // TODO: jsdoc
  function onPhotoItemTap(event, photoGroup, index) {
    log.i('onPhotoItemTap', 'PhotoItem=' + photoGroup.photos[index].gridThumbnail.source);
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

    photoGrid.opening = false;
  }

  // TODO: jsdoc
  function onClosingFinished() {
    var photoGrid;

    photoGrid = this;

    photoGrid.closing = false;
    util.toggleClass(photoGrid.elements.banner, 'closed', true);
  }

  // ------------------------------------------------------------------------------------------- //
  // Public dynamic functions

  // TODO: jsdoc
  function open() {
    var photoGrid, duration;

    photoGrid = this;
    photoGrid.isOpen = true;
    photoGrid.opening = true;
    util.toggleClass(photoGrid.elements.banner, 'closed', false);

    if (photoGrid.openEventListener) {
      photoGrid.openEventListener(photoGrid);
    }

    calculateThumbnailRowsAndColumns.call(photoGrid);
    duration = (photoGrid.gridHeight - photoGrid.elements.grid.clientHeight) /
        params.HEIGHT_CHANGE_RATE;

    // TODO: add the bounce
    // - for the bouncing thing:
    //   - apply the transition properties manually in javascript
    //     - because I will want smaller height changes to take less time
    animate.startNumericStyleAnimation(photoGrid.elements.grid, 'height',
        photoGrid.elements.grid.clientHeight, photoGrid.gridHeight, null, duration, null, 'px',
        'easeInOutQuad', function(animation, photoGrid) {
          onOpeningFinished.call(photoGrid);
        }, photoGrid);
  }

  // TODO: jsdoc
  function close() {
    var photoGrid, duration;

    photoGrid = this;
    photoGrid.isOpen = false;
    photoGrid.closing = true;

    if (photoGrid.closeEventListener) {
      photoGrid.closeEventListener(photoGrid);
    }

    duration = photoGrid.elements.grid.clientHeight / params.HEIGHT_CHANGE_RATE;

    // TODO: add the bounce
    animate.startNumericStyleAnimation(photoGrid.elements.grid, 'height',
        photoGrid.elements.grid.clientHeight, 0, null, duration, null, 'px', 'easeInOutQuad',
        function(animation, photoGrid) {
          onClosingFinished.call(photoGrid);
        }, photoGrid);
  }

  // TODO: jsdoc
  function cacheThumbnails() {
    var photoGrid = this;

    photoGrid.photoGroup.cacheImages('thumbnail',
        function(photoGroup, photo) {
          onPhotoGroupSingleCacheSuccess.call(photoGrid, photoGroup, photo);
        },
        function(photoGroup) {
          onPhotoGroupTotalCacheSuccess.call(photoGrid, photoGroup);
        },
        function(photoGroup, failedPhotos) {
          onPhotoGroupTotalCacheError.call(photoGrid, photoGroup, failedPhotos);
        });
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
    PhotoLightbox = app.PhotoLightbox;
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
  function DropdownPhotoGrid(photoGroup, parent, openEventListener, closeEventListener) {
    var photoGrid = this;

    photoGrid.photoGroup = photoGroup;
    photoGrid.parent = parent;
    photoGrid.elements = null;
    photoGrid.isOpen = false;
    photoGrid.opening = false;
    photoGrid.closing = false;
    photoGrid.columnCount = 0;
    photoGrid.rowCount = 0;
    photoGrid.gridHeight = 0;
    photoGrid.openCloseDuration = 0;
    photoGrid.openEventListener = openEventListener;
    photoGrid.closeEventListener = closeEventListener;
    photoGrid.open = open;
    photoGrid.close = close;
    photoGrid.cacheThumbnails = cacheThumbnails;

    createElements.call(photoGrid);
  }

  // Expose this module
  if (!window.app) window.app = {};
  window.app.DropdownPhotoGrid = DropdownPhotoGrid;
  DropdownPhotoGrid.initStaticFields = initStaticFields;

  console.log('dropdownPhotoGrid module loaded');
})();
