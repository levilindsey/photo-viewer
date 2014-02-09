/**
 * This module defines a constructor for PhotoGridCollection objects.
 * @module photoGridCollection
 */
(function() {
  // ------------------------------------------------------------------------------------------- //
  // Private static variables

  var params, util, log, animate, PhotoLightbox, DropdownPhotoGrid;

  // ------------------------------------------------------------------------------------------- //
  // Private dynamic functions

  // TODO: jsdoc
  function createElements() {
    var gridCollection, container;

    gridCollection = this;

    container = util.createElement('div', gridCollection.parent, null, ['gridCollectionContainer']);

    gridCollection.elements = {
      container: container
    };

    resize.call(gridCollection);
  }

  // TODO: jsdoc
  function resize() {
    var gridCollection, viewportSize, columnCapacity, columnCount;

    gridCollection = this;
    viewportSize = util.getViewportSize();

    // Determine how many columns of thumbnails could fit in the parent container
    columnCapacity =
        parseInt((viewportSize.w - params.GRID.MARGIN * 2 - params.GRID.THUMBNAIL_MARGIN) /
            (params.GRID.THUMBNAIL_WIDTH + params.GRID.THUMBNAIL_MARGIN));

    // Determine how many columns of thumbnails to use
    columnCount = columnCapacity >= params.GRID.MAX_COLUMN_COUNT ?
        params.GRID.MAX_COLUMN_COUNT : columnCapacity;

    // Set the grid collection's width
    gridCollection.expandedWidth = columnCount * params.GRID.THUMBNAIL_WIDTH +
        (columnCount + 1) * params.GRID.THUMBNAIL_MARGIN;

    // Do not expand the grid collection width if it's in its shrunken, centered state
    if (gridCollection.expanded) {
      if (gridCollection.expanding) {
        // Update the animation object with the new width end value
        // TODO:
      } else {
        gridCollection.elements.container.style.width = gridCollection.expandedWidth + 'px';
      }
    }
  }

  // TODO: jsdoc
  function areAllGridsFullyClosed() {
    var gridCollection, i, count;
    gridCollection = this;
    for (i = 0, count = gridCollection.grids.length; i < count; i++) {
      if (gridCollection.grids[i].isOpen || gridCollection.grids[i].closing) {
        return false;
      }
    }
    return true;
  }

  // TODO: jsdoc
  function setTapThumbnailPromptsDisplay(areDisplayed) {
    var gridCollection, display, i, count;
    gridCollection = this;
    display = areDisplayed ? 'block' : 'none';
    for (i = 0, count = gridCollection.grids.length; i < count; i++) {
      gridCollection.grids[i].elements.tapThumbnailPromptContainer.style.display = display;
    }
  }

  // TODO: jsdoc
  function shrink() {
    var gridCollection, viewportSize, gridCollectionHeight, gridCollectionTop, pageOffset;

    gridCollection = this;
    gridCollection.expanded = false;
    gridCollection.expanding = false;
    gridCollection.shrinking = true;

    viewportSize = util.getViewportSize();

    gridCollectionHeight = gridCollection.grids.length * params.GRID.BANNER_HEIGHT +
        (gridCollection.grids.length - 1) * params.GRID.MARGIN;
    gridCollectionTop = (viewportSize.h - gridCollectionHeight) / 2;

    pageOffset = util.getPageOffset(gridCollection.elements.container);

    setTapThumbnailPromptsDisplay.call(gridCollection, false);

    // TODO: cancel any prior animations

    animate.startNumericStyleAnimation(gridCollection.elements.container, 'top', pageOffset.y,
        gridCollectionTop, null, params.GRID.ALL_GRIDS_SHRINK_DURATION, null, 'px',
        'easeInOutQuad', function() {
          // Ensure that nothing interrupted this animation while it was running
          if (!gridCollection.expanded && gridCollection.shrinking && !gridCollection.expanding) {
            gridCollection.shrinking = false;
            gridCollection.expanded = false;
          }
        }, null);
    animate.startNumericStyleAnimation(gridCollection.elements.container, 'width',
        gridCollection.elements.container.clientWidth, params.GRID.SHRUNKEN_GRIDS_WIDTH, null,
        params.GRID.ALL_GRIDS_SHRINK_DURATION, null, 'px', 'easeInOutQuad', null, null);
  }

  // ------------------------------------------------------------------------------------------- //
  // Public dynamic functions

  // TODO: jsdoc
  function expand(gridToOpen) {
    var gridCollection, pageOffset;

    gridCollection = this;
    gridCollection.expanded = true;
    gridCollection.expanding = true;
    gridCollection.shrinking = false;

    pageOffset = util.getPageOffset(gridCollection.elements.container);

    // TODO: cancel any prior animations

    animate.startNumericStyleAnimation(gridCollection.elements.container, 'top', pageOffset.y,
        params.GRID.MARGIN, null, params.GRID.ALL_GRIDS_SHRINK_DURATION, null, 'px',
        'easeInOutQuad', function(animation, gridToOpen) {
          // Ensure that nothing interrupted this animation while it was running
          if (gridCollection.expanded && gridCollection.expanding && !gridCollection.shrinking) {
            gridCollection.expanding = false;
            setTapThumbnailPromptsDisplay.call(gridCollection, true);
            gridToOpen.open();
          }
        }, gridToOpen);
    animate.startNumericStyleAnimation(gridCollection.elements.container, 'width',
        gridCollection.elements.container.clientWidth, gridCollection.expandedWidth, null,
        params.GRID.ALL_GRIDS_EXPAND_DURATION, null, 'px', 'easeInOutQuad', null, null);
  }

  // TODO: jsdoc
  function onGridOpenStart(grid) {
    var gridCollection = this;
    log.i('onPhotoGridOpen', 'photoGrid.title=' + grid.photoGroup.title);

    if (gridCollection.currentOpenGrid) {
      gridCollection.currentOpenGrid.close();
    }
    gridCollection.currentOpenGrid = grid;
  }

  // TODO: jsdoc
  function onGridCloseEnd(grid) {
    var gridCollection = this;

    if (grid === gridCollection.currentOpenGrid) {
      gridCollection.currentOpenGrid = null;
    }

    if (areAllGridsFullyClosed.call(gridCollection)) {
      shrink.call(gridCollection);
    }
  }

  // ------------------------------------------------------------------------------------------- //
  // Private static functions

  // ------------------------------------------------------------------------------------------- //
  // Public static functions

  /**
   * Initializes some static state for this module.
   * @function PhotoGridCollection.initStaticFields
   */
  function initStaticFields() {
    params = app.params;
    util = app.util;
    log = new app.Log('photoGridCollection');
    animate = app.animate;
    PhotoLightbox = app.PhotoLightbox;
    DropdownPhotoGrid = app.DropdownPhotoGrid;
    log.d('initStaticFields', 'Module initialized');
  }

  // ------------------------------------------------------------------------------------------- //
  // Expose this module's constructor

  /**
   * @constructor
   * @global
   * @param {Array.<PhotoGroup>} photoGroups The collection of photo data collections represented
   * in this grid collection.
   * @param {HTMLElement} parent The DOM element that this grid collection resides in.
   */
  function PhotoGridCollection(photoGroups, parent) {
    var gridCollection = this;

    gridCollection.photoLightbox = new PhotoLightbox();
    gridCollection.parent = parent;
    gridCollection.elements = null;
    gridCollection.grids = [];
    gridCollection.currentOpenGrid = null;
    gridCollection.expandedWidth = 0;
    gridCollection.expanded = false;
    gridCollection.expanding = false;
    gridCollection.shrinking = false;
    gridCollection.expand = expand;
    gridCollection.onGridOpenStart = onGridOpenStart;
    gridCollection.onGridCloseEnd = onGridCloseEnd;

    createElements.call(gridCollection);

    // TODO: instead:
    // - create this element right at the start of the page load
    // - then, provide a method for the index to pass in the parsed photo groups whenever they arrive
    // - show a progress circle until the photoGroups are passed in
    // - add a CSS transition to fade in the banners

    // Create the photo grids and add them to the DOM
    photoGroups.forEach(function(photoGroup) {
      gridCollection.grids.push(
          new DropdownPhotoGrid(photoGroup, gridCollection));
    });

    // Re-position the grid collection when the window re-sizes
    util.listen(window, 'resize', function() {
      resize.call(gridCollection);
      gridCollection.grids.forEach(function(grid) {
        grid.resize();
      });
    });
  }

  // Expose this module
  if (!window.app) window.app = {};
  window.app.PhotoGridCollection = PhotoGridCollection;
  PhotoGridCollection.initStaticFields = initStaticFields;

  console.log('photoGridCollection module loaded');
})();
