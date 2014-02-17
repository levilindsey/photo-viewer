/**
 * This module defines a constructor for DropdownPhotoGrid objects.
 * @module dropdownPhotoGrid
 */
(function () {
  // ------------------------------------------------------------------------------------------- //
  // Private static variables

  var params, util, log, PhotoGridCell, PhotoItem;

  // ------------------------------------------------------------------------------------------- //
  // Private dynamic functions

  /**
   * Creates the DOM elements that form this photo grid, adds them to the DOM, and adds them to the
   * elements property of this photo grid.
   * @function dropdownPhotoGrid~createElements
   */
  function createElements() {
    var photoGrid, container, banner, bannerIcon, bannerTitleContainer, bannerTitleText, tapThumbnailPromptContainer, tapThumbnailPromptText, grid, width;

    photoGrid = this;

    container = util.createElement('div', photoGrid.parent, null, ['photoGridContainer']);

    banner = util.createElement('div', container, null, ['photoGridBanner', 'closed']);
    util.addTapEventListener(banner, function () {
      onBannerTap.call(photoGrid);
    }, false);

    bannerIcon = util.createElement('img', banner, null, ['bannerIcon', 'openGridIcon']);
    bannerIcon.src = params.TRANSPARENT_GIF_URL;

    bannerTitleContainer = util.createElement('div', banner, null, ['bannerTitleContainer']);
    width =
        util.getTextWidth(photoGrid.photoGroup.title, 'span', bannerTitleContainer, null,
            ['insetText']);
    bannerTitleContainer.style.width = width + 2 + 'px';

    bannerTitleText = util.createElement('span', bannerTitleContainer, null, ['insetText']);
    bannerTitleText.setAttribute('text', photoGrid.photoGroup.title);
    bannerTitleText.innerHTML = photoGrid.photoGroup.title;

    tapThumbnailPromptContainer =
        util.createElement('div', banner, null, ['tapThumbnailPromptContainer', 'hidden']);

    tapThumbnailPromptText =
        util.createElement('span', tapThumbnailPromptContainer, null, ['insetText']);
    tapThumbnailPromptText.setAttribute('text', params.L18N.EN.TAP_THUMBNAIL_PROMPT);
    tapThumbnailPromptText.innerHTML = params.L18N.EN.TAP_THUMBNAIL_PROMPT;

    grid = util.createElement('div', container, null, ['photoGrid']);
    util.listenForTransitionEnd(grid, function () {
      onOpenCloseEnd.call(photoGrid);
    });
    util.setTransitionCubicBezierTimingFunction(grid, params.GRID.BOUNCE.BOTTOM_ROW_BEZIER_PTS);

    photoGrid.elements = {
      container: container,
      banner: banner,
      bannerIcon: bannerIcon,
      tapThumbnailPromptContainer: tapThumbnailPromptContainer,
      grid: grid
    };
  }

  /**
   *
   * @function dropdownPhotoGrid~createThumbnails
   */
  function createThumbnails() {
    var photoGrid, gridCell;

    photoGrid = this;
    photoGrid.cells = [];

    // Load the thumbnails
    photoGrid.photoGroup.loadImages('gridThumbnail', function (photoGroup, photo) {
      onPhotoGroupSingleLoadSuccess.call(photoGrid, photo);
    }, function (photoGroup, photo) {
      onPhotoGroupSingleLoadError.call(photoGrid, photo);
    }, function (photoGroup) {
      onPhotoGroupTotalLoadSuccess.call(photoGrid, photoGroup);
    }, function (photoGroup, failedPhotos) {
      onPhotoGroupTotalLoadError.call(photoGrid, photoGroup, failedPhotos);
    });

    // Create the thumbnail elements and add them to the DOM
    photoGrid.photoGroup.photos.forEach(function (photo) {
      gridCell = new PhotoGridCell(photoGrid.elements.grid, photo);
      photoGrid.cells.push(gridCell);
    });

    // Listen for thumbnail taps
    photoGrid.photoGroup.addPhotoItemTapEventListeners('gridThumbnail',
        function (event, photoGroup, index) {
          onPhotoItemTap.call(photoGrid, event, photoGroup, index);
        });
  }

  /**
   *
   * @function dropdownPhotoGrid~onPhotoGroupSingleLoadSuccess
   * @param {PhotoItem} photo
   */
  function onPhotoGroupSingleLoadSuccess(photo) {
    //log.v('onPhotoGroupSingleLoadSuccess');
    var photoGrid = this;
    PhotoItem.setLoadError(photo, photoGrid.cells[photo.index].element, false, false);
    util.toggleClass(photoGrid.cells[photo.index].element, 'nonLoaded', false);
  }

  /**
   *
   * @function dropdownPhotoGrid~onPhotoGroupSingleLoadError
   * @param {PhotoItem} photo
   */
  function onPhotoGroupSingleLoadError(photo) {
    log.w('onPhotoGroupSingleLoadError');
    var photoGrid = this;
    PhotoItem.setLoadError(photo, photoGrid.cells[photo.index].element, true, false);
  }

  /**
   *
   * @function dropdownPhotoGrid~onPhotoGroupTotalLoadSuccess
   * @param {PhotoGroup} photoGroup
   */
  function onPhotoGroupTotalLoadSuccess(photoGroup) {
    log.i('onPhotoGroupTotalLoadSuccess', 'All photos loaded for group ' + photoGroup.title);
  }

  /**
   *
   * @function dropdownPhotoGrid~onPhotoGroupTotalLoadError
   * @param {PhotoGroup} photoGroup
   * @param {Array.<PhotoItem>} failedPhotos
   */
  function onPhotoGroupTotalLoadError(photoGroup, failedPhotos) {
    log.w('onPhotoGroupTotalLoadError',
        'Unable to load ' + failedPhotos.length + ' photos for group ' + photoGroup.title);
  }

  /**
   *
   * @function dropdownPhotoGrid~onPhotoItemTap
   * @param {Object} event
   * @param {PhotoGroup} photoGroup
   * @param {Number} index
   */
  function onPhotoItemTap(event, photoGroup, index) {
    log.i('onPhotoItemTap', 'PhotoItem=' + photoGroup.photos[index].gridThumbnail.source);
    var photoGrid = this;
    photoGrid.gridCollection.photoLightbox.open(photoGroup, index);
    util.stopPropogation(event);
  }

  /**
   *
   * @function dropdownPhotoGrid~onBannerTap
   */
  function onBannerTap() {
    var photoGrid = this;
    log.i('onBannerTap', 'isOpen=' + photoGrid.isOpen);
    if (photoGrid.isOpen) {
      close.call(photoGrid);
    } else {
      open.call(photoGrid);
    }
  }

  /**
   *
   * @function dropdownPhotoGrid~onOpeningFinished
   */
  function onOpeningFinished() {
    var photoGrid = this;

    // Ensure that nothing interrupted this animation while it was running
    if (photoGrid.opening && !photoGrid.closing) {
      photoGrid.opening = false;

      // Don't show the tap thumbnail prompt on small screens
      if (!util.isSmallScreen) {
        setElementVisibility(photoGrid.elements.tapThumbnailPromptContainer, true, false, null);
      }

      // If this grid was told to open a photo while it itself was still opening, then open that
      // photo now
      if (photoGrid.showPhotoAtIndexAfterOpening >= 0) {
        photoGrid.gridCollection.photoLightbox.open(photoGrid.photoGroup,
            photoGrid.showPhotoAtIndexAfterOpening);
        photoGrid.showPhotoAtIndexAfterOpening = -1;
      }
    }
  }

  /**
   *
   * @function dropdownPhotoGrid~onClosingFinished
   */
  function onClosingFinished() {
    var photoGrid = this;

    // Ensure that nothing interrupted this animation while it was running
    if (photoGrid.closing && !photoGrid.opening) {
      photoGrid.closing = false;
      util.toggleClass(photoGrid.elements.banner, 'closed', true);

      photoGrid.gridCollection.onGridCloseEnd(photoGrid);
    }
  }

  /**
   * @function dropdownPhotoGrid~onOpenCloseEnd
   */
  function onOpenCloseEnd() {
    var photoGrid = this;

    if (photoGrid.isOpen) {
      onOpeningFinished.call(photoGrid);
    } else {
      onClosingFinished.call(photoGrid);
    }
  }

  // ------------------------------------------------------------------------------------------- //
  // Public dynamic functions

  /**
   *
   * @function dropdownPhotoGrid#open
   */
  function open() {
    var photoGrid = this;

    // The grid collection needs to be in its fully expanded form before we can open a grid
    if (!photoGrid.gridCollection.expanded) {
      // Quickly expand the grid collection
      photoGrid.gridCollection.expand(photoGrid);
      return;
    } else if (photoGrid.gridCollection.expanding) {
      // Wait for the grid collection expansion to complete
      return;
    }

    photoGrid.isOpen = true;
    photoGrid.opening = true;
    photoGrid.closing = false;
    util.toggleClass(photoGrid.elements.banner, 'closed', false);

    photoGrid.gridCollection.onGridOpenStart(photoGrid);

    switchOpenCloseIconImageClass(photoGrid.elements.bannerIcon, false);

    util.setTransitionDurationSeconds(photoGrid.elements.grid, params.GRID.OPEN_CLOSE_DURATION);

    photoGrid.elements.grid.style.height = photoGrid.gridHeight + 'px';

    photoGrid.cells.forEach(function (cell) {
      cell.animateToOpen(params.GRID.OPEN_CLOSE_DURATION);
    });
  }

  /**
   *
   * @function dropdownPhotoGrid#close
   */
  function close() {
    var photoGrid = this;

    photoGrid.isOpen = false;
    photoGrid.closing = true;
    photoGrid.opening = false;

    switchOpenCloseIconImageClass(photoGrid.elements.bannerIcon, true);

    util.setTransitionDurationSeconds(photoGrid.elements.grid, params.GRID.OPEN_CLOSE_DURATION);

    photoGrid.elements.grid.style.height = '0';

    photoGrid.cells.forEach(function (cell) {
      cell.animateToClosed(params.GRID.OPEN_CLOSE_DURATION);
    });

    setElementVisibility(photoGrid.elements.tapThumbnailPromptContainer, false, false, null);

    // Clear extra small-sized images from memory
    photoGrid.photoGroup.clearImages('small');
  }

  /**
   *
   * @function dropdownPhotoGrid#resize
   */
  function resize() {
    var photoGrid, columnCapacity, viewportSize, width;

    photoGrid = this;
    viewportSize = util.getViewportSize();

    // Determine how many columns could fit in the parent container
    columnCapacity =
        parseInt((viewportSize.w - params.GRID.MARGIN * 2 - params.GRID.THUMBNAIL_MARGIN) /
            (params.GRID.THUMBNAIL_WIDTH + params.GRID.THUMBNAIL_MARGIN));

    // Determine how many columns and rows of thumbnails to use
    photoGrid.columnCount =
        columnCapacity >= params.GRID.MAX_COLUMN_COUNT ? params.GRID.MAX_COLUMN_COUNT :
            columnCapacity;
    photoGrid.rowCount =
        parseInt(0.99999 + photoGrid.photoGroup.photos.length / photoGrid.columnCount);

    // Set the grid's width and height
    photoGrid.gridHeight =
        photoGrid.rowCount * params.GRID.THUMBNAIL_HEIGHT +
            (photoGrid.rowCount + 1) * params.GRID.THUMBNAIL_MARGIN;
    width =
        photoGrid.columnCount * params.GRID.THUMBNAIL_WIDTH +
            (photoGrid.columnCount + 1) * params.GRID.THUMBNAIL_MARGIN;

    photoGrid.elements.grid.style.height = photoGrid.isOpen ? photoGrid.gridHeight + 'px' : '0';
    photoGrid.elements.grid.style.width = width + 'px';

    updateCellRowsAndColumns.call(photoGrid);
  }

  /**
   * Calculates which row and column each cell belongs to and updates the cells' position and
   * transition parameters accordingly.
   * @function dropdownPhotoGrid~updateCellRowsAndColumns
   */
  function updateCellRowsAndColumns() {
    var photoGrid, i, count, column, row;
    photoGrid = this;
    for (i = 0, count = photoGrid.cells.length; i < count; i++) {
      column = i % photoGrid.columnCount;
      row = parseInt(i / photoGrid.columnCount);

      photoGrid.photoGroup.photos[i].gridThumbnail.columnIndex = column;
      photoGrid.photoGroup.photos[i].gridThumbnail.rowIndex = row;

      updateCellPositions(photoGrid.cells[i], photoGrid.gridHeight, row, column);
      updateCellTransitionParameters(photoGrid.cells[i], photoGrid.rowCount, row);
    }
  }

  /**
   * Opens the photo at the given index within this grid's photo group.
   * @function dropdownPhotoGrid#openPhoto
   * @param {Number} index The index of the photo to open.
   * @returns {Boolean} True if the photo was opened successfully.
   */
  function openPhoto(index) {
    var photoGrid = this;

    if (photoGrid.gridCollection.expanding || photoGrid.opening) {
      photoGrid.showPhotoAtIndexAfterOpening = index;
      return true;
    } else if (photoGrid.isOpen) {
      photoGrid.gridCollection.photoLightbox.open(photoGrid.photoGroup, index);
      return true;
    }

    return false;
  }

  // ------------------------------------------------------------------------------------------- //
  // Private static functions

  /**
   * Adds or removes the hidden and visible classes from the given element, in order for it to be
   * visible or hidden, as specified. These two classes have corresponding CSS rules regarding
   * visibility and transitions.
   * @function dropdownPhotoGrid~setElementVisibility
   * @param {HTMLElement} element The element to show or hide.
   * @param {Boolean} visible If true, then the element will be made visible.
   * @param {Boolean} [delay] If true, then there will be a slight delay before the element's
   * classes are changed. This is important, because if a CSS transition is added to an element
   * immediately after changing the element's display, or adding it to the DOM, then there will be
   * problems with the transition.
   * @param {Function} [callback] This function will be called after the delay.
   */
  function setElementVisibility(element, visible, delay, callback) {

    function setVisibility() {
      util.toggleClass(element, 'visible', visible);
      if (callback) {
        callback();
      }
    }

    util.toggleClass(element, 'hidden', !visible);

    if (delay) {
      setTimeout(function () {
        setVisibility();
      }, params.ADD_CSS_TRANSITION_DELAY);
    } else {
      setVisibility();
    }
  }

  /**
   *
   * @function dropdownPhotoGrid~switchOpenCloseIconImageClass
   * @param {HTMLElement} element
   * @param {Boolean} open
   */
  function switchOpenCloseIconImageClass(element, open) {
    var addClass, removeClass;
    if (open) {
      addClass = 'openGridIcon';
      removeClass = 'closeGridIcon';
    } else {
      addClass = 'closeGridIcon';
      removeClass = 'openGridIcon';
    }
    util.toggleClass(element, removeClass, false);
    util.toggleClass(element, addClass, true);
  }

  /**
   * Updates the given cell's position values according to the given row and column.
   * @function dropdownPhotoGrid~updateCellPositions
   * @param {PhotoGridCell} cell The cell to update.
   * @param {Number} gridHeight The height of the grid containing the cell.
   * @param {Number} row The row index the cell is in.
   * @param {Number} column The column index the cell is in.
   */
  function updateCellPositions(cell, gridHeight, row, column) {
    var x, closedY, openY;

    x =
        column * (params.GRID.THUMBNAIL_WIDTH + params.GRID.THUMBNAIL_MARGIN) +
            params.GRID.THUMBNAIL_MARGIN;
    openY =
        row * (params.GRID.THUMBNAIL_HEIGHT + params.GRID.THUMBNAIL_MARGIN) +
            params.GRID.THUMBNAIL_MARGIN;
    closedY = openY - gridHeight;

    cell.setPositions(x, closedY, openY);
  }

  /**
   * Updates the given cell's transition parameters according to the given row and column.
   * @function dropdownPhotoGrid~updateCellTransitionParameters
   * @param {PhotoGridCell} cell The cell to update.
   * @param {Number} rowCount The total number of rows in the grid.
   * @param {Number} row The row index the cell is in.
   */
  function updateCellTransitionParameters(cell, rowCount, row) {
    var rowBaseDurationRatio, cellDurationRatioOffset, durationRatio, rowBaseDelayRatio, cellDelayRatioOffset, delayRatio, rowBaseP1x, rowBaseP1y, rowBaseP2x, rowBaseP2y, bezierPts, minWeight, maxWeight;

    minWeight = row / (rowCount - 1);
    maxWeight = 1 - minWeight;

    rowBaseDurationRatio =
        util.interpolate(params.GRID.BOUNCE.BOTTOM_ROW_DURATION_RATIO,
            params.GRID.BOUNCE.TOP_ROW_DURATION_RATIO, minWeight, maxWeight);
    cellDurationRatioOffset =
        util.getRandom(params.GRID.BOUNCE.MIN_DURATION_RATIO_OFFSET,
            params.GRID.BOUNCE.MAX_DURATION_RATIO_OFFSET);

    rowBaseDelayRatio =
        util.interpolate(params.GRID.BOUNCE.BOTTOM_ROW_DELAY_RATIO,
            params.GRID.BOUNCE.TOP_ROW_DELAY_RATIO, minWeight, maxWeight);
    cellDelayRatioOffset =
        util.getRandom(params.GRID.BOUNCE.MIN_DELAY_RATIO_OFFSET,
            params.GRID.BOUNCE.MAX_DELAY_RATIO_OFFSET);

    rowBaseP1x =
        util.interpolate(params.GRID.BOUNCE.BOTTOM_ROW_BEZIER_PTS.p1x,
            params.GRID.BOUNCE.TOP_ROW_BEZIER_PTS.p1x, minWeight, maxWeight);
    rowBaseP1y =
        util.interpolate(params.GRID.BOUNCE.BOTTOM_ROW_BEZIER_PTS.p1y,
            params.GRID.BOUNCE.TOP_ROW_BEZIER_PTS.p1y, minWeight, maxWeight);
    rowBaseP2x =
        util.interpolate(params.GRID.BOUNCE.BOTTOM_ROW_BEZIER_PTS.p2x,
            params.GRID.BOUNCE.TOP_ROW_BEZIER_PTS.p2x, minWeight, maxWeight);
    rowBaseP2y =
        util.interpolate(params.GRID.BOUNCE.BOTTOM_ROW_BEZIER_PTS.p2y,
            params.GRID.BOUNCE.TOP_ROW_BEZIER_PTS.p2y, minWeight, maxWeight);

    durationRatio = rowBaseDurationRatio + cellDurationRatioOffset;
    delayRatio = rowBaseDelayRatio + cellDelayRatioOffset;
    bezierPts = { p1x: rowBaseP1x, p1y: rowBaseP1y, p2x: rowBaseP2x, p2y: rowBaseP2y };

    cell.setTransitionParameters(durationRatio, delayRatio, bezierPts);
  }

  // ------------------------------------------------------------------------------------------- //
  // Public static functions

  /**
   * Initializes some static state for this module.
   * @function dropdownPhotoGrid.initStaticFields
   */
  function initStaticFields() {
    params = app.params;
    util = app.util;
    log = new app.Log('dropdownPhotoGrid');
    PhotoGridCell = app.PhotoGridCell;
    PhotoItem = app.PhotoItem;
    log.d('initStaticFields', 'Module initialized');
  }

  // ------------------------------------------------------------------------------------------- //
  // Expose this module's constructor

  /**
   * @constructor
   * @global
   * @param {PhotoGroup} photoGroup The collection of photo data for this grid.
   * @param {PhotoGridCollection} gridCollection The parent grid collection that this grid is a
   * part of.
   */
  function DropdownPhotoGrid(photoGroup, gridCollection) {
    var photoGrid = this;

    photoGrid.cells = null;
    photoGrid.photoGroup = photoGroup;
    photoGrid.gridCollection = gridCollection;
    photoGrid.parent = gridCollection.elements.container;
    photoGrid.elements = null;
    photoGrid.isOpen = false;
    photoGrid.opening = false;
    photoGrid.closing = false;
    photoGrid.columnCount = 0;
    photoGrid.rowCount = 0;
    photoGrid.gridHeight = 0;
    photoGrid.showPhotoAtIndexAfterOpening = -1;
    photoGrid.open = open;
    photoGrid.close = close;
    photoGrid.resize = resize;
    photoGrid.openPhoto = openPhoto;

    createElements.call(photoGrid);
    createThumbnails.call(photoGrid);
    resize.call(photoGrid);
  }

  // Expose this module
  if (!window.app) window.app = {};
  window.app.DropdownPhotoGrid = DropdownPhotoGrid;
  DropdownPhotoGrid.initStaticFields = initStaticFields;

  console.log('dropdownPhotoGrid module loaded');
})();
