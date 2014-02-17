/**
 * This module defines a constructor for PhotoGridCollection objects.
 * @module photoGridCollection
 */
(function () {
  // ------------------------------------------------------------------------------------------- //
  // Private static variables

  var params, util, log, animate, PhotoLightbox, DropdownPhotoGrid, ProgressCircle;

  // ------------------------------------------------------------------------------------------- //
  // Private dynamic functions

  /**
   * Creates the DOM elements that form this grid collection, adds them to the DOM, and adds them
   * to the elements property of this grid collection.
   * @function photoGridCollection~createElements
   */
  function createElements() {
    var gridCollection, container, progressCircleContainer;

    gridCollection = this;

    container = util.createElement('div', gridCollection.parent, null, ['gridCollectionContainer']);
    progressCircleContainer =
        util.createElement('div', gridCollection.parent, null, ['progressCircleContainer']);
    progressCircleContainer.style.width = params.GRID.PROGRESS_CIRCLE_CONTAINER_SIDE_LENGTH + 'px';
    progressCircleContainer.style.height = params.GRID.PROGRESS_CIRCLE_CONTAINER_SIDE_LENGTH + 'px';

    gridCollection.elements = {
      container: container,
      progressCircleContainer: progressCircleContainer,
      pulseCircle: null,
      svg: null
    };

    gridCollection.progressCircle =
        new ProgressCircle(progressCircleContainer,
            params.GRID.PROGRESS_CIRCLE_CONTAINER_SIDE_LENGTH, params.GRID.PROGRESS_CIRCLE_DIAMETER,
            params.GRID.PROGRESS_CIRCLE_DOT_RADIUS, false);
    gridCollection.elements.svg = gridCollection.progressCircle.elements.svg;

    createBackgroundPulse.call(gridCollection);

    resize.call(gridCollection);

    gridCollection.progressCircle.open();
  }

  /**
   *
   * @function photoGridCollection~createBackgroundPulse
   */
  function createBackgroundPulse() {
    var gridCollection, defs, gradient, stop1, stop2, pulseCircle;

    gridCollection = this;

    defs = document.createElementNS(params.SVG_NAMESPACE, 'defs');
    gridCollection.elements.svg.appendChild(defs);

    gradient = document.createElementNS(params.SVG_NAMESPACE, 'radialGradient');
    gradient.id = 'gridCollectionPulseGradient';
    gradient.setAttribute('cx', '50%');
    gradient.setAttribute('cy', '50%');
    gradient.setAttribute('r', '50%');
    gradient.setAttribute('fx', '50%');
    gradient.setAttribute('fy', '50%');
    gradient.setAttribute('opacity', '0');
    defs.appendChild(gradient);

    stop1 = document.createElementNS(params.SVG_NAMESPACE, 'stop');
    stop1.setAttribute('stop-color', params.GRID.BACKGROUND_PULSE_STOP_1_COLOR);
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-opacity', '1');
    gradient.appendChild(stop1);

    stop2 = document.createElementNS(params.SVG_NAMESPACE, 'stop');
    stop2.setAttribute('stop-color', params.GRID.BACKGROUND_PULSE_STOP_2_COLOR);
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-opacity', '0');
    gradient.appendChild(stop2);

    pulseCircle = document.createElementNS(params.SVG_NAMESPACE, 'circle');
    pulseCircle.setAttribute('fill', 'url(#' + gradient.id + ')');
    pulseCircle.setAttribute('cx', '50%');
    pulseCircle.setAttribute('cy', '50%');
    pulseCircle.setAttribute('r', '' + params.GRID.BACKGROUND_PULSE_INNER_RADIUS);
    pulseCircle.setAttribute('opacity', '' + params.GRID.BACKGROUND_PULSE_INNER_OPACITY);
    gridCollection.elements.svg.appendChild(pulseCircle);

    gridCollection.elements.pulseCircle = pulseCircle;
  }

  /**
   *
   * @function photoGridCollection~resize
   */
  function resize() {
    var gridCollection, viewportSize, columnCapacity, columnCount, gridCollectionHeight;

    gridCollection = this;
    viewportSize = util.getViewportSize();

    // Determine how many columns of thumbnails could fit in the parent container
    columnCapacity =
        parseInt((viewportSize.w - params.GRID.MARGIN * 2 - params.GRID.THUMBNAIL_MARGIN) /
            (params.GRID.THUMBNAIL_WIDTH + params.GRID.THUMBNAIL_MARGIN));

    // Determine how many columns of thumbnails to use
    columnCount =
        columnCapacity >= params.GRID.MAX_COLUMN_COUNT ? params.GRID.MAX_COLUMN_COUNT :
            columnCapacity;

    // Calculate the grid collection's expanded and shrunken dimensions
    gridCollection.expandedWidth =
        columnCount * params.GRID.THUMBNAIL_WIDTH +
            (columnCount + 1) * params.GRID.THUMBNAIL_MARGIN;
    gridCollectionHeight =
        gridCollection.grids.length * params.GRID.BANNER_HEIGHT +
            (gridCollection.grids.length - 1) * params.GRID.MARGIN;
    gridCollection.shrunkenTop = (viewportSize.h - gridCollectionHeight) / 2;

    // Determine whether the grid is in its expanded state or its shrunken state
    if (gridCollection.expanded) {
      // Determine whether the grid is currently animating
      if (gridCollection.expanding) {
        // Update the animation with a new end value
        gridCollection.widthAnimation.endValue = gridCollection.expandedWidth;
        gridCollection.topAnimation.endValue = params.GRID.MARGIN;
      } else {
        gridCollection.elements.container.style.width = gridCollection.expandedWidth + 'px';
        gridCollection.elements.container.style.top = params.GRID.MARGIN + 'px';
      }
    } else {
      // Determine whether the grid is currently animating
      if (gridCollection.shrinking) {
        // Update the animation with a new end value
        gridCollection.widthAnimation.endValue = params.GRID.SHRUNKEN_GRIDS_WIDTH;
        gridCollection.topAnimation.endValue = gridCollection.shrunkenTop;
      } else {
        gridCollection.elements.container.style.width = params.GRID.SHRUNKEN_GRIDS_WIDTH + 'px';
        gridCollection.elements.container.style.top = gridCollection.shrunkenTop + 'px';
      }
    }

    gridCollection.elements.progressCircleContainer.style.top =
        (viewportSize.h - params.GRID.PROGRESS_CIRCLE_CONTAINER_SIDE_LENGTH) / 2 + 'px';
    gridCollection.elements.progressCircleContainer.style.left =
        (viewportSize.w - params.GRID.PROGRESS_CIRCLE_CONTAINER_SIDE_LENGTH) / 2 + 'px';
  }

  /**
   *
   * @function photoGridCollection~areAllGridsFullyClosed
   * @returns {Boolean}
   */
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

  /**
   *
   * @function photoGridCollection~setTapThumbnailPromptsDisplay
   * @param {Boolean} areDisplayed
   */
  function setTapThumbnailPromptsDisplay(areDisplayed) {
    var gridCollection, display, i, count;
    gridCollection = this;
    display = areDisplayed ? 'block' : 'none';
    for (i = 0, count = gridCollection.grids.length; i < count; i++) {
      gridCollection.grids[i].elements.tapThumbnailPromptContainer.style.display = display;
    }
  }

  /**
   *
   * @function photoGridCollection~startBackgroundPulseAnimation
   */
  function startBackgroundPulseAnimation() {
    var gridCollection, startTime;

    // Repeat the same pair of animations, but in reverse
    function onHalfPulseEnd(animation, gridCollection) {
      var startTime, startRadius, endRadius, startOpacity, endOpacity;

      // Determine whether to use the values for the forward half-pulse or the backward half-pulse
      if (animation.startValue === params.GRID.BACKGROUND_PULSE_INNER_RADIUS) {
        startRadius = params.GRID.BACKGROUND_PULSE_OUTER_RADIUS;
        endRadius = params.GRID.BACKGROUND_PULSE_INNER_RADIUS;
        startOpacity = params.GRID.BACKGROUND_PULSE_OUTER_OPACITY;
        endOpacity = params.GRID.BACKGROUND_PULSE_INNER_OPACITY;
      } else {
        startRadius = params.GRID.BACKGROUND_PULSE_INNER_RADIUS;
        endRadius = params.GRID.BACKGROUND_PULSE_OUTER_RADIUS;
        startOpacity = params.GRID.BACKGROUND_PULSE_INNER_OPACITY;
        endOpacity = params.GRID.BACKGROUND_PULSE_OUTER_OPACITY;
      }

      startTime = animation.startTime + animation.duration;

      // Animate both the radius and the opacity together
      gridCollection.backgroundPulseRadiusAnimation =
        animate.startNumericAttributeAnimation(animation.element, 'r', startRadius, endRadius,
          startTime, animation.duration, null, null, animation.easingFunction, onHalfPulseEnd,
          gridCollection);
      gridCollection.backgroundPulseOpacityAnimation =
        animate.startNumericAttributeAnimation(animation.element, 'opacity', startOpacity,
          endOpacity, startTime, animation.duration, null, null, animation.easingFunction, null,
          gridCollection);
    }

    gridCollection = this;
    startTime = Date.now();

    // Animate both the radius and the opacity together
    gridCollection.backgroundPulseRadiusAnimation =
        animate.startNumericAttributeAnimation(gridCollection.elements.pulseCircle, 'r',
            params.GRID.BACKGROUND_PULSE_INNER_RADIUS, params.GRID.BACKGROUND_PULSE_OUTER_RADIUS,
            startTime, params.GRID.BACKGROUND_PULSE_PERIOD / 2, null, null, 'easeInQuad',
            onHalfPulseEnd, gridCollection);
    gridCollection.backgroundPulseOpacityAnimation =
        animate.startNumericAttributeAnimation(gridCollection.elements.pulseCircle, 'opacity',
            params.GRID.BACKGROUND_PULSE_INNER_OPACITY, params.GRID.BACKGROUND_PULSE_OUTER_OPACITY,
            startTime, params.GRID.BACKGROUND_PULSE_PERIOD / 2, null, null, 'easeInQuad', null,
            gridCollection);
  }

  /**
   *
   * @function photoGridCollection~stopBackgroundPulseAnimation
   */
  function stopBackgroundPulseAnimation() {
    var gridCollection = this;

    if (gridCollection.backgroundPulseRadiusAnimation) {
      animate.stopAnimation(gridCollection.backgroundPulseRadiusAnimation);
      animate.stopAnimation(gridCollection.backgroundPulseOpacityAnimation);

      // Reset the pulse background gradient to its default state
      gridCollection.elements.pulseCircle.setAttribute('r',
          '' + params.GRID.BACKGROUND_PULSE_INNER_RADIUS);
      gridCollection.elements.pulseCircle.setAttribute('opacity',
          '' + params.GRID.BACKGROUND_PULSE_INNER_OPACITY);

      gridCollection.backgroundPulseRadiusAnimation = null;
      gridCollection.backgroundPulseOpacityAnimation = null;
    }
  }

  /**
   *
   * @function photoGridCollection~stopExpandOrShrinkAnimation
   */
  function stopExpandOrShrinkAnimation() {
    var gridCollection = this;

    if (gridCollection.topAnimation) {
      animate.stopAnimation(gridCollection.topAnimation);
      animate.stopAnimation(gridCollection.widthAnimation);

      gridCollection.topAnimation = null;
      gridCollection.widthAnimation = null;
    }
  }

  /**
   *
   * @function photoGridCollection~shrink
   */
  function shrink() {
    var gridCollection, pageOffset;

    gridCollection = this;
    gridCollection.expanded = false;
    gridCollection.expanding = false;
    gridCollection.shrinking = true;

    pageOffset = util.getPageOffset(gridCollection.elements.container);

    setTapThumbnailPromptsDisplay.call(gridCollection, false);

    stopExpandOrShrinkAnimation.call(gridCollection);

    gridCollection.topAnimation =
        animate.startNumericStyleAnimation(gridCollection.elements.container, 'top', pageOffset.y,
            gridCollection.shrunkenTop, null, params.GRID.ALL_GRIDS_SHRINK_DURATION, null, 'px',
            'easeInOutQuad', function () {
              onShrinkEnd.call(gridCollection);
            }, null);
    gridCollection.widthAnimation =
        animate.startNumericStyleAnimation(gridCollection.elements.container, 'width',
            gridCollection.elements.container.clientWidth, params.GRID.SHRUNKEN_GRIDS_WIDTH, null,
            params.GRID.ALL_GRIDS_SHRINK_DURATION, null, 'px', 'easeInOutQuad', null, null);
  }

  /**
   *
   * @function photoGridCollection~onShrinkEnd
   */
  function onShrinkEnd() {
    var gridCollection = this;

    // Ensure that nothing interrupted this animation while it was running
    if (!gridCollection.expanded && gridCollection.shrinking && !gridCollection.expanding) {
      gridCollection.shrinking = false;
      gridCollection.expanded = false;

      startBackgroundPulseAnimation.call(gridCollection);
    }
  }

  /**
   *
   * @function photoGridCollection~onExpandEnd
   * @param {DropdownPhotoGrid} gridToOpen
   */
  function onExpandEnd(gridToOpen) {
    var gridCollection = this;

    // Ensure that nothing interrupted this animation while it was running
    if (gridCollection.expanded && gridCollection.expanding && !gridCollection.shrinking) {
      gridCollection.expanding = false;
      setTapThumbnailPromptsDisplay.call(gridCollection, true);
      gridToOpen.open();
    }
  }

  /**
   *
   * @function photoGridCollection~recordCurrentOpenGrid
   * @param {DropdownPhotoGrid} currentOpenGrid
   */
  function recordCurrentOpenGrid(currentOpenGrid) {
    var gridCollection, photoGroup;

    gridCollection = this;
    gridCollection.currentOpenGrid = currentOpenGrid;

    if (!currentOpenGrid) {
      photoGroup = null;
    } else {
      photoGroup = currentOpenGrid.photoGroup;
    }

    app.updateQueryString(photoGroup, -1);
  }

  // ------------------------------------------------------------------------------------------- //
  // Public dynamic functions

  /**
   *
   * @function photoGridCollection#expand
   * @param {DropdownPhotoGrid} gridToOpen
   */
  function expand(gridToOpen) {
    var gridCollection, pageOffset;

    gridCollection = this;
    gridCollection.expanded = true;
    gridCollection.expanding = true;
    gridCollection.shrinking = false;

    pageOffset = util.getPageOffset(gridCollection.elements.container);

    stopExpandOrShrinkAnimation.call(gridCollection);
    stopBackgroundPulseAnimation.call(gridCollection);

    gridCollection.topAnimation =
        animate.startNumericStyleAnimation(gridCollection.elements.container, 'top', pageOffset.y,
            params.GRID.MARGIN, null, params.GRID.ALL_GRIDS_SHRINK_DURATION, null, 'px',
            'easeInOutQuad', function (animation, gridToOpen) {
              onExpandEnd.call(gridCollection, gridToOpen);
            }, gridToOpen);
    gridCollection.widthAnimation =
        animate.startNumericStyleAnimation(gridCollection.elements.container, 'width',
            gridCollection.elements.container.clientWidth, gridCollection.expandedWidth, null,
            params.GRID.ALL_GRIDS_EXPAND_DURATION, null, 'px', 'easeInOutQuad', null, null);
  }

  /**
   *
   * @function photoGridCollection#onGridOpenStart
   * @param {DropdownPhotoGrid} grid
   */
  function onGridOpenStart(grid) {
    var gridCollection = this;
    log.i('onPhotoGridOpen', 'photoGrid.title=' + grid.photoGroup.title);

    if (gridCollection.currentOpenGrid && grid !== gridCollection.currentOpenGrid) {
      gridCollection.currentOpenGrid.close();
    }
    recordCurrentOpenGrid.call(gridCollection, grid);
  }

  /**
   *
   * @function photoGridCollection#onGridCloseEnd
   * @param {DropdownPhotoGrid} grid
   */
  function onGridCloseEnd(grid) {
    var gridCollection = this;

    if (grid === gridCollection.currentOpenGrid) {
      recordCurrentOpenGrid.call(gridCollection, null);
    }

    if (areAllGridsFullyClosed.call(gridCollection)) {
      shrink.call(gridCollection);
    }
  }

  /**
   *
   * @function photoGridCollection#onLightboxCloseStart
   */
  function onLightboxCloseStart() {
    var gridCollection = this;
    recordCurrentOpenGrid.call(gridCollection, gridCollection.currentOpenGrid);
  }

  /**
   * Creates the photo grids and adds them to the DOM.
   * @function photoGridCollection#onPhotoMetadataParsed
   * @param {Array.<PhotoGroup>} photoGroups The collection of photo data collections to represent
   * in this grid collection.
   */
  function onPhotoMetadataParsed(photoGroups) {
    var gridCollection = this;

    // Create the grids
    photoGroups.forEach(function (photoGroup) {
      gridCollection.grids.push(new DropdownPhotoGrid(photoGroup, gridCollection));
    });
    resize.call(gridCollection);

    // Re-position the grid collection when the window re-sizes
    util.listen(window, 'resize', function () {
      resize.call(gridCollection);
      gridCollection.grids.forEach(function (grid) {
        grid.resize();
      });
    });

    gridCollection.progressCircle.close();
    startBackgroundPulseAnimation.call(gridCollection);
  }

  /**
   * Opens the grid whose photo group has the given name.
   * @function photoGridCollection#openPhoto
   * @param {String} groupName The name of the photo group to open.
   * @returns {Boolean} True if the grid was opened successfully.
   */
  function openGroup(groupName) {
    var gridCollection, grid;

    gridCollection = this;
    grid = getGridByTitle(gridCollection.grids, groupName);

    if (grid) {
      grid.open();
      return true;
    }

    return false;
  }

  /**
   * Opens the photo at the given index within the current grid's photo group.
   * @function photoGridCollection#openPhoto
   * @param {Number} index The index of the photo to open.
   * @param {String} [groupName] The name of the photo group to open.
   * @returns {Boolean} True if the photo was opened successfully.
   */
  function openPhoto(index, groupName) {
    var gridCollection, grid;

    gridCollection = this;

    if (gridCollection.currentOpenGrid) {
      return gridCollection.currentOpenGrid.openPhoto(index);
    } else if (groupName) {
      grid = getGridByTitle(gridCollection.grids, groupName);
      grid.openPhoto(index);
    }

    return false;
  }

  // ------------------------------------------------------------------------------------------- //
  // Public static functions

  /**
   * Initializes some static state for this module.
   * @function photoGridCollection.initStaticFields
   */
  function initStaticFields() {
    params = app.params;
    util = app.util;
    log = new app.Log('photoGridCollection');
    animate = app.animate;
    PhotoLightbox = app.PhotoLightbox;
    DropdownPhotoGrid = app.DropdownPhotoGrid;
    ProgressCircle = app.ProgressCircle;
    log.d('initStaticFields', 'Module initialized');
  }

  // ------------------------------------------------------------------------------------------- //
  // Private static functions

  /**
   *
   * @function photoGridCollection~getGridByTitle
   * @param {Array.<DropdownPhotoGrid>} grids
   * @param {String} title
   * @returns {DropdownPhotoGrid}
   */
  function getGridByTitle(grids, title) {
    var i, count;
    for (i = 0, count = grids.length; i < count; i++) {
      if (grids[i].photoGroup.title.toLowerCase() === title.toLowerCase()) {
        return grids[i];
      }
    }
    return null;
  }

  // ------------------------------------------------------------------------------------------- //
  // Expose this module's constructor

  /**
   * @constructor
   * @global
   * @param {HTMLElement} parent The DOM element that this grid collection resides in.
   */
  function PhotoGridCollection(parent) {
    var gridCollection = this;

    gridCollection.photoLightbox = new PhotoLightbox(null, null, function () {
      onLightboxCloseStart.call(gridCollection);
    });
    gridCollection.parent = parent;
    gridCollection.elements = null;
    gridCollection.grids = [];
    gridCollection.progressCircle = null;
    gridCollection.currentOpenGrid = null;
    gridCollection.expandedWidth = 0;
    gridCollection.expanded = false;
    gridCollection.expanding = false;
    gridCollection.shrinking = false;
    gridCollection.backgroundPulseRadiusAnimation = null;
    gridCollection.backgroundPulseOpacityAnimation = null;
    gridCollection.topAnimation = null;
    gridCollection.widthAnimation = null;
    gridCollection.expand = expand;
    gridCollection.onGridOpenStart = onGridOpenStart;
    gridCollection.onGridCloseEnd = onGridCloseEnd;
    gridCollection.onLightboxCloseStart = onLightboxCloseStart;
    gridCollection.onPhotoMetadataParsed = onPhotoMetadataParsed;
    gridCollection.openGroup = openGroup;
    gridCollection.openPhoto = openPhoto;

    createElements.call(gridCollection);
  }

  // Expose this module
  if (!window.app) window.app = {};
  window.app.PhotoGridCollection = PhotoGridCollection;
  PhotoGridCollection.initStaticFields = initStaticFields;

  console.log('photoGridCollection module loaded');
})();
