/**
 * This module defines a constructor for DropdownPhotoGrid objects.
 * @module dropdownPhotoGrid
 */
(function() {
  // ------------------------------------------------------------------------------------------- //
  // Private static variables

  var params, util, log, animate;

  // ------------------------------------------------------------------------------------------- //
  // Private dynamic functions

  // TODO: jsdoc
  function createElements() {
    var photoGrid, container, banner, bannerIcon, bannerTitleContainer, bannerTitleText,
        tapThumbnailPromptContainer, tapThumbnailPromptText, grid, photoGridInnerContainer, width;

    photoGrid = this;

    container = util.createElement('div', photoGrid.parent, null, ['photoGridContainer']);

    banner = util.createElement('div', container, null, ['photoGridBanner','closed']);
    util.addTapEventListener(banner, function() {
      onBannerTap.call(photoGrid);
    }, false);

    bannerIcon = util.createElement('img', banner, null, ['bannerIcon','openGridIcon']);
    bannerIcon.src = params.TRANSPARENT_GIF_URL;

    bannerTitleContainer = util.createElement('div', banner, null, ['bannerTitleContainer']);
    width = util.getTextWidth(photoGrid.photoGroup.title, 'span', bannerTitleContainer, null,
        ['insetText']);
    bannerTitleContainer.style.width = width + 2 + 'px';

    bannerTitleText = util.createElement('span', bannerTitleContainer, null, ['insetText']);
    bannerTitleText.setAttribute('text', photoGrid.photoGroup.title);
    bannerTitleText.innerHTML = photoGrid.photoGroup.title;

    tapThumbnailPromptContainer = util.createElement('div', banner, null,
        ['tapThumbnailPromptContainer','hidden']);

    tapThumbnailPromptText = util.createElement('span', tapThumbnailPromptContainer, null,
        ['insetText']);
    tapThumbnailPromptText.setAttribute('text', params.L18N.EN.TAP_THUMBNAIL_PROMPT);
    tapThumbnailPromptText.innerHTML = params.L18N.EN.TAP_THUMBNAIL_PROMPT;

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
      tapThumbnailPromptContainer: tapThumbnailPromptContainer,
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
    var photoGrid = this;
    photoGrid.gridCollection.photoLightbox.open(photoGroup, index);
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

  // TODO: jsdoc
  function onClosingFinished() {
    var photoGrid;

    photoGrid = this;

    // Ensure that nothing interrupted this animation while it was running
    if (photoGrid.closing && !photoGrid.opening) {
      photoGrid.closing = false;
      util.toggleClass(photoGrid.elements.banner, 'closed', true);

      photoGrid.gridCollection.onGridCloseEnd(photoGrid);
    }
  }

  // ------------------------------------------------------------------------------------------- //
  // Public dynamic functions

  // TODO: jsdoc
  function open() {
    var photoGrid, duration;

    photoGrid = this;

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

    calculateThumbnailRowsAndColumns.call(photoGrid);
    duration = (photoGrid.gridHeight - photoGrid.elements.grid.clientHeight) /
        params.HEIGHT_CHANGE_RATE;

    switchOpenCloseIconImageClass(photoGrid.elements.bannerIcon, false);

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
    photoGrid.opening = false;

    duration = photoGrid.elements.grid.clientHeight / params.HEIGHT_CHANGE_RATE;

    switchOpenCloseIconImageClass(photoGrid.elements.bannerIcon, true);

    // TODO: cancel any prior animations

    // TODO: add the bounce
    animate.startNumericStyleAnimation(photoGrid.elements.grid, 'height',
        photoGrid.elements.grid.clientHeight, 0, null, duration, null, 'px', 'easeInOutQuad',
        function(animation, photoGrid) {
          onClosingFinished.call(photoGrid);
        }, photoGrid);

    setElementVisibility(photoGrid.elements.tapThumbnailPromptContainer, false, false, null);
  }

  // TODO: jsdoc
  function resize() {
    var photoGrid, columnCapacity, viewportSize;

    photoGrid = this;
    viewportSize = util.getViewportSize();

    // Determine how many columns could fit in the parent container
    columnCapacity =
        parseInt((viewportSize.w - params.GRID.MARGIN * 2 - params.GRID.THUMBNAIL_MARGIN) /
            (params.GRID.THUMBNAIL_WIDTH + params.GRID.THUMBNAIL_MARGIN));

    // Determine how many columns and rows of thumbnails to use
    photoGrid.columnCount = columnCapacity >= params.GRID.MAX_COLUMN_COUNT ?
        params.GRID.MAX_COLUMN_COUNT : columnCapacity;
    photoGrid.rowCount = parseInt(1 + photoGrid.photoGroup.photos.length / photoGrid.columnCount);

    // Set the grid's heights (the width expands to fill its containing element)
    photoGrid.gridHeight = photoGrid.rowCount * params.GRID.THUMBNAIL_HEIGHT +
        (photoGrid.rowCount + 1) * params.GRID.THUMBNAIL_MARGIN;
    photoGrid.elements.photoGridInnerContainer.style.height = photoGrid.gridHeight + 'px';

    photoGrid.openCloseDuration = photoGrid.gridHeight / params.GRID.HEIGHT_CHANGE_RATE;

    // TODO: if the grid is opening, then re-start the animation
  }

  /**
   * Opens the photo at the given index within this grid's photo group.
   * @function DropdownPhotoGrid#openPhoto
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
    util.toggleClass(element, 'hidden', !visible);

    if (delay) {
      setTimeout(function() {
        setVisibility();
      }, params.ADD_CSS_TRANSITION_DELAY);
    } else {
      setVisibility();
    }

    function setVisibility() {
      util.toggleClass(element, 'visible', visible);
      if (callback) {
        callback();
      }
    }
  }

  // TODO: jsdoc
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
   */// TODO: refactor these function parameters to instead pass in the collection object
  function DropdownPhotoGrid(photoGroup, gridCollection) {
    var photoGrid = this;

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
    photoGrid.openCloseDuration = 0;
    photoGrid.showPhotoAtIndexAfterOpening = -1;
    photoGrid.open = open;
    photoGrid.close = close;
    photoGrid.resize = resize;
    photoGrid.openPhoto = openPhoto;

    createElements.call(photoGrid);
  }

  // Expose this module
  if (!window.app) window.app = {};
  window.app.DropdownPhotoGrid = DropdownPhotoGrid;
  DropdownPhotoGrid.initStaticFields = initStaticFields;

  console.log('dropdownPhotoGrid module loaded');
})();
