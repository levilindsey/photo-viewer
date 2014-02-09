/**
 * This module defines a constructor for DropdownPhotoGrid objects.
 * @module dropdownPhotoGrid
 */
(function() {
  // ------------------------------------------------------------------------------------------- //
  // Private static variables

  var params, util, log, animate, PhotoLightbox, photoLightbox, allGrids, currentOpenPhotoGrid,
      allGridsAreExpanded, expandingAllGrids, shrinkingAllGrids, gridCollectionExpandedWidth,
      gridCollectionContainer;

  // ------------------------------------------------------------------------------------------- //
  // Private dynamic functions

  // TODO: jsdoc
  function createElements() {
    var photoGrid, container, banner, bannerIcon, bannerTextContainer, bannerText, grid,
        photoGridInnerContainer;

    photoGrid = this;

    container = util.createElement('div', gridCollectionContainer, null, ['photoGridContainer']);

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
    var photoGrid, columnCapacity, viewportSize;

    photoGrid = this;
    viewportSize = util.getViewportSize();

    // Determine how many columns could fit in the parent container
    columnCapacity =
        (parseInt(viewportSize.w) - params.GRID.THUMBNAIL_MARGIN) /
        (params.GRID.THUMBNAIL_WIDTH + params.GRID.THUMBNAIL_MARGIN);

    // Determine how many columns and rows of thumbnails to use
    photoGrid.columnCount = columnCapacity >= params.GRID.MAX_COLUMN_COUNT ?
        params.GRID.MAX_COLUMN_COUNT : columnCapacity;
    photoGrid.rowCount = parseInt(1 + photoGrid.photoGroup.photos.length / photoGrid.columnCount);

    // Set the grid's width and heights
    gridCollectionExpandedWidth = photoGrid.columnCount * params.GRID.THUMBNAIL_WIDTH +
        (photoGrid.columnCount + 1) * params.GRID.THUMBNAIL_MARGIN - params.GRID.MARGIN * 2;
    photoGrid.gridHeight = photoGrid.rowCount * params.GRID.THUMBNAIL_HEIGHT +
        (photoGrid.rowCount + 1) * params.GRID.THUMBNAIL_MARGIN;
    photoGrid.elements.photoGridInnerContainer.style.height = photoGrid.gridHeight + 'px';

    // Do not expand the grid collection width if it is in its shrunken, centered state
    if (allGridsAreExpanded) {
      if (expandingAllGrids) {
        // Update the animation object with the new width
        // TODO:
      } else {
        gridCollectionContainer.style.width = gridCollectionExpandedWidth + 'px';
      }
    }

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

    if (areAllGridsFullyClosed()) {
      shrinkAndCenterAllGrids();
    }
  }

  // ------------------------------------------------------------------------------------------- //
  // Public dynamic functions

  // TODO: jsdoc
  function open() {
    var photoGrid, duration;

    photoGrid = this;

    // The grid collection needs to be in its fully expanded form before we can open a grid
    if (!allGridsAreExpanded) {
      // Quickly expand the grid collection
      expandAndRaiseAllGrids(photoGrid);
      return;
    } else if (expandingAllGrids) {
      // Wait for the grid collection expansion to complete
      return;
    }

    photoGrid.isOpen = true;
    photoGrid.opening = true;
    util.toggleClass(photoGrid.elements.banner, 'closed', false);

    onPhotoGridOpen(photoGrid);

    calculateThumbnailRowsAndColumns.call(photoGrid);
    duration = (photoGrid.gridHeight - photoGrid.elements.grid.clientHeight) /
        params.HEIGHT_CHANGE_RATE;

    // TODO: cancel any prior animations

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

    onPhotoGridClose(photoGrid);

    duration = photoGrid.elements.grid.clientHeight / params.HEIGHT_CHANGE_RATE;

    // TODO: cancel any prior animations

    // TODO: add the bounce
    animate.startNumericStyleAnimation(photoGrid.elements.grid, 'height',
        photoGrid.elements.grid.clientHeight, 0, null, duration, null, 'px', 'easeInOutQuad',
        function(animation, photoGrid) {
          onClosingFinished.call(photoGrid);
        }, photoGrid);
  }

  // ------------------------------------------------------------------------------------------- //
  // Private static functions

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

  // TODO: jsdoc
  function areAllGridsFullyClosed() {
    var i, count;
    for (i = 0, count = allGrids.length; i < count; i++) {
      if (allGrids[i].isOpen || allGrids[i].closing) {
        return false;
      }
    }
    return true;
  }

  // TODO: jsdoc
  function shrinkAndCenterAllGrids() {
    var viewportSize, gridCollectionHeight, gridCollectionTop, pageOffset;

    allGridsAreExpanded = false;
    shrinkingAllGrids = true;

    viewportSize = util.getViewportSize();

    gridCollectionHeight = allGrids.length * params.GRID.BANNER_HEIGHT +
        (allGrids.length - 1) * params.GRID.MARGIN;
    gridCollectionTop = (viewportSize.h - gridCollectionHeight) / 2;

    pageOffset = util.getPageOffset(gridCollectionContainer);

    // TODO: cancel any prior animations

    animate.startNumericStyleAnimation(gridCollectionContainer, 'top', pageOffset.y,
        gridCollectionTop, null, params.GRID.ALL_GRIDS_SHRINK_DURATION, null, 'px',
        'easeInOutQuad', function(animation, identifier) {
          shrinkingAllGrids = false;
        }, null);
    animate.startNumericStyleAnimation(gridCollectionContainer, 'width',
        gridCollectionContainer.clientWidth, params.GRID.SHRUNKEN_GRIDS_WIDTH, null,
        params.GRID.ALL_GRIDS_SHRINK_DURATION, null, 'px', 'easeInOutQuad', null, null);
  }

  // TODO: jsdoc
  function expandAndRaiseAllGrids(gridToOpen) {
    var pageOffset;

    allGridsAreExpanded = true;
    expandingAllGrids = true;

    pageOffset = util.getPageOffset(gridCollectionContainer);

    // TODO: cancel any prior animations

    animate.startNumericStyleAnimation(gridCollectionContainer, 'top', pageOffset.y,
        params.GRID.MARGIN, null, params.GRID.ALL_GRIDS_SHRINK_DURATION, null, 'px',
        'easeInOutQuad', function(animation, gridToOpen) {
          expandingAllGrids = false;
          gridToOpen.open();
        }, gridToOpen);
    animate.startNumericStyleAnimation(gridCollectionContainer, 'width',
        gridCollectionContainer.clientWidth, gridCollectionExpandedWidth, null,
        params.GRID.ALL_GRIDS_EXPAND_DURATION, null, 'px', 'easeInOutQuad', null, null);

    gridToOpen.open();
  }

  // ------------------------------------------------------------------------------------------- //
  // Public static functions

  /**
   * Initializes some static state for this module.
   * @function DropdownPhotoGrid.initStaticFields
   */
  function initStaticFields() {
    var body;

    params = app.params;
    util = app.util;
    log = new app.Log('dropdownPhotoGrid');
    animate = app.animate;
    PhotoLightbox = app.PhotoLightbox;
    photoLightbox = new PhotoLightbox();
    allGrids = [];
    currentOpenPhotoGrid = null;
    allGridsAreExpanded = false;
    expandingAllGrids = false;
    shrinkingAllGrids = false;
    gridCollectionExpandedWidth = 0;
    body = document.getElementsByTagName('body')[0];
    gridCollectionContainer = util.createElement('div', body, null, ['gridCollectionContainer']);
    log.d('initStaticFields', 'Module initialized');
  }

  // ------------------------------------------------------------------------------------------- //
  // Expose this module's constructor

  /**
   * @constructor
   * @global
   * @param {} ...
   */
  function DropdownPhotoGrid(photoGroup) {
    var photoGrid = this;

    allGrids.push(photoGrid);

    photoGrid.photoGroup = photoGroup;
    photoGrid.elements = null;
    photoGrid.isOpen = false;
    photoGrid.opening = false;
    photoGrid.closing = false;
    photoGrid.columnCount = 0;
    photoGrid.rowCount = 0;
    photoGrid.gridHeight = 0;
    photoGrid.openCloseDuration = 0;
    photoGrid.open = open;
    photoGrid.close = close;

    createElements.call(photoGrid);

    // Re-position the grid when the window re-sizes
    util.listen(window, 'resize', function() {
      resize.call(photoGrid);
    });
  }

  // Expose this module
  if (!window.app) window.app = {};
  window.app.DropdownPhotoGrid = DropdownPhotoGrid;
  DropdownPhotoGrid.initStaticFields = initStaticFields;

  console.log('dropdownPhotoGrid module loaded');
})();
