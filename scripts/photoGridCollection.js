/**
 * This module defines a constructor for PhotoGridCollection objects.
 * @module photoGridCollection
 */
(function() {
  // ------------------------------------------------------------------------------------------- //
  // Private static variables

  var params, util, log, animate, PhotoLightbox, DropdownPhotoGrid, SVGProgressCircle;

  // ------------------------------------------------------------------------------------------- //
  // Private dynamic functions

  // TODO: jsdoc
  function createElements() {
    var gridCollection, container;

    gridCollection = this;

    container = util.createElement('div', gridCollection.parent, null, ['gridCollectionContainer']);

    gridCollection.elements = {
      container: container,
      svg: null,
      pulseCircle: null
    };

    createBackgroundPulse.call(gridCollection);

    gridCollection.progressCircle = new SVGProgressCircle(gridCollection.elements.svg,
        params.GRID.PROGRESS_CIRCLE_OFFSET, params.GRID.PROGRESS_CIRCLE_OFFSET,
        params.GRID.PROGRESS_CIRCLE_DIAMETER, params.GRID.PROGRESS_CIRCLE_DOT_RADIUS);

    resize.call(gridCollection);

    gridCollection.progressCircle.open();
  }

  // TODO: jsdoc
  function createBackgroundPulse() {
    var gridCollection, svg, defs, gradient, stop1, stop2, pulseCircle;

    gridCollection = this;

    svg = document.createElementNS(params.SVG_NAMESPACE, 'svg');
    svg.style.width = params.GRID.SVG_SIDE_LENGTH + 'px';
    svg.style.height = params.GRID.SVG_SIDE_LENGTH + 'px';
    gridCollection.parent.appendChild(svg);

    defs = document.createElementNS(params.SVG_NAMESPACE, 'defs');
    svg.appendChild(defs);

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
    svg.appendChild(pulseCircle);

    gridCollection.elements.svg = svg;
    gridCollection.elements.pulseCircle = pulseCircle;
  }

  // TODO: jsdoc
  function resize() {
    var gridCollection, viewportSize, columnCapacity, columnCount, gridCollectionHeight;

    gridCollection = this;
    viewportSize = util.getViewportSize();

    // Determine how many columns of thumbnails could fit in the parent container
    columnCapacity =
        parseInt((viewportSize.w - params.GRID.MARGIN * 2 - params.GRID.THUMBNAIL_MARGIN) /
            (params.GRID.THUMBNAIL_WIDTH + params.GRID.THUMBNAIL_MARGIN));

    // Determine how many columns of thumbnails to use
    columnCount = columnCapacity >= params.GRID.MAX_COLUMN_COUNT ?
        params.GRID.MAX_COLUMN_COUNT : columnCapacity;

    // Calculate the grid collection's expanded and shrunken dimensions
    gridCollection.expandedWidth = columnCount * params.GRID.THUMBNAIL_WIDTH +
        (columnCount + 1) * params.GRID.THUMBNAIL_MARGIN;
    gridCollectionHeight = gridCollection.grids.length * params.GRID.BANNER_HEIGHT +
        (gridCollection.grids.length - 1) * params.GRID.MARGIN;
    gridCollection.shrunkenTop = (viewportSize.h - gridCollectionHeight) / 2;

    // Determine whether the grid is in its expanded state or its shrunken state
    if (gridCollection.expanded) {
      // Determine whether the grid is currently animating
      if (gridCollection.expanding) {
        // Update the animation object with the new width end value
        // TODO:
      } else {
        gridCollection.elements.container.style.width = gridCollection.expandedWidth + 'px';
        gridCollection.elements.container.style.top = params.GRID.MARGIN + 'px';
      }
    } else {
      // Determine whether the grid is currently animating
      if (gridCollection.shrinking) {
        // Update the animation object with the new width end value
        // TODO:
      } else {
        gridCollection.elements.container.style.width = params.GRID.SHRUNKEN_GRIDS_WIDTH + 'px';
        gridCollection.elements.container.style.top = gridCollection.shrunkenTop + 'px';
      }
    }

    gridCollection.elements.svg.style.top =
        (viewportSize.h - params.GRID.SVG_SIDE_LENGTH) / 2 + 'px';
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
  function startBackgroundPulseAnimation() {
    var gridCollection, startTime;

    gridCollection = this;
    startTime = Date.now();

    // Animate both the radius and the opacity together
    gridCollection.backgroundPulseRadiusAnimation = animate.startNumericAttributeAnimation(
        gridCollection.elements.pulseCircle, 'r', params.GRID.BACKGROUND_PULSE_INNER_RADIUS,
        params.GRID.BACKGROUND_PULSE_OUTER_RADIUS, startTime,
        params.GRID.BACKGROUND_PULSE_PERIOD / 2, null, null, 'easeInQuad', onHalfPulseEnd,
        gridCollection);
    gridCollection.backgroundPulseOpacityAnimation = animate.startNumericAttributeAnimation(
        gridCollection.elements.pulseCircle, 'opacity', params.GRID.BACKGROUND_PULSE_INNER_OPACITY,
        params.GRID.BACKGROUND_PULSE_OUTER_OPACITY, startTime,
        params.GRID.BACKGROUND_PULSE_PERIOD / 2, null, null, 'easeInQuad', null, gridCollection);

    // Repeat the same pair of animations, but in reverse
    function onHalfPulseEnd(animation, gridCollection) {
      var startTime, easingFunction, startRadius, endRadius, startOpacity, endOpacity;

      // Determine whether to use the values for the forward half-pulse or the backward half-pulse
      if (animation.startValue === params.GRID.BACKGROUND_PULSE_INNER_RADIUS) {
        easingFunction = 'easeOutQuad';
        startRadius = params.GRID.BACKGROUND_PULSE_OUTER_RADIUS;
        endRadius = params.GRID.BACKGROUND_PULSE_INNER_RADIUS;
        startOpacity = params.GRID.BACKGROUND_PULSE_OUTER_OPACITY;
        endOpacity = params.GRID.BACKGROUND_PULSE_INNER_OPACITY;
      } else {
        easingFunction = 'easeInQuad';
        startRadius = params.GRID.BACKGROUND_PULSE_INNER_RADIUS;
        endRadius = params.GRID.BACKGROUND_PULSE_OUTER_RADIUS;
        startOpacity = params.GRID.BACKGROUND_PULSE_INNER_OPACITY;
        endOpacity = params.GRID.BACKGROUND_PULSE_OUTER_OPACITY;
      }

      startTime = animation.startTime + animation.duration;

      // Animate both the radius and the opacity together
      gridCollection.backgroundPulseRadiusAnimation = animate.startNumericAttributeAnimation(
          animation.element, 'r', startRadius, endRadius, startTime, animation.duration, null,
          null, easingFunction, onHalfPulseEnd, gridCollection);
      gridCollection.backgroundPulseOpacityAnimation = animate.startNumericAttributeAnimation(
          animation.element, 'opacity', startOpacity, endOpacity, startTime, animation.duration,
          null, null, easingFunction, null, gridCollection);
    }
  }

  // TODO: jsdoc
  function stopBackgroundPulseAnimation() {
    var gridCollection = this;
    animate.stopAnimation(gridCollection.backgroundPulseRadiusAnimation);
    animate.stopAnimation(gridCollection.backgroundPulseOpacityAnimation);
  }

  // TODO: jsdoc
  function shrink() {
    var gridCollection, pageOffset;

    gridCollection = this;
    gridCollection.expanded = false;
    gridCollection.expanding = false;
    gridCollection.shrinking = true;

    pageOffset = util.getPageOffset(gridCollection.elements.container);

    setTapThumbnailPromptsDisplay.call(gridCollection, false);

    // TODO: cancel any prior animations

    animate.startNumericStyleAnimation(gridCollection.elements.container, 'top', pageOffset.y,
        gridCollection.shrunkenTop, null, params.GRID.ALL_GRIDS_SHRINK_DURATION, null, 'px',
        'easeInOutQuad', function() {
          onShrinkEnd.call(gridCollection);
        }, null);
    animate.startNumericStyleAnimation(gridCollection.elements.container, 'width',
        gridCollection.elements.container.clientWidth, params.GRID.SHRUNKEN_GRIDS_WIDTH, null,
        params.GRID.ALL_GRIDS_SHRINK_DURATION, null, 'px', 'easeInOutQuad', null, null);
  }

  // TODO: jsdoc
  function onShrinkEnd() {
    var gridCollection = this;

    // Ensure that nothing interrupted this animation while it was running
    if (!gridCollection.expanded && gridCollection.shrinking && !gridCollection.expanding) {
      gridCollection.shrinking = false;
      gridCollection.expanded = false;

      startBackgroundPulseAnimation.call(gridCollection);
    }
  }

  // TODO: jsdoc
  function onExpandEnd(gridToOpen) {
    var gridCollection = this;

    // Ensure that nothing interrupted this animation while it was running
    if (gridCollection.expanded && gridCollection.expanding && !gridCollection.shrinking) {
      gridCollection.expanding = false;
      setTapThumbnailPromptsDisplay.call(gridCollection, true);
      gridToOpen.open();
    }
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

    stopBackgroundPulseAnimation.call(gridCollection);

    animate.startNumericStyleAnimation(gridCollection.elements.container, 'top', pageOffset.y,
        params.GRID.MARGIN, null, params.GRID.ALL_GRIDS_SHRINK_DURATION, null, 'px',
        'easeInOutQuad', function(animation, gridToOpen) {
          onExpandEnd.call(gridCollection, gridToOpen);
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

  /**
   * Creates the photo grids and adds them to the DOM.
   * @function PhotoGridCollection#onPhotoMetadataParsed
   * @param {Array.<PhotoGroup>} photoGroups The collection of photo data collections to represent
   * in this grid collection.
   */
  function onPhotoMetadataParsed(photoGroups) {
    var gridCollection = this;

    // Create the grids
    photoGroups.forEach(function(photoGroup) {
      gridCollection.grids.push(
          new DropdownPhotoGrid(photoGroup, gridCollection));
    });
    resize.call(gridCollection);

    // Re-position the grid collection when the window re-sizes
    util.listen(window, 'resize', function() {
      resize.call(gridCollection);
      gridCollection.grids.forEach(function(grid) {
        grid.resize();
      });
    });

    gridCollection.progressCircle.close();
    startBackgroundPulseAnimation.call(gridCollection);
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
    SVGProgressCircle = app.SVGProgressCircle;
    log.d('initStaticFields', 'Module initialized');
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

    gridCollection.photoLightbox = new PhotoLightbox();
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
    gridCollection.expand = expand;
    gridCollection.onGridOpenStart = onGridOpenStart;
    gridCollection.onGridCloseEnd = onGridCloseEnd;
    gridCollection.onPhotoMetadataParsed = onPhotoMetadataParsed;

    createElements.call(gridCollection);
  }

  // Expose this module
  if (!window.app) window.app = {};
  window.app.PhotoGridCollection = PhotoGridCollection;
  PhotoGridCollection.initStaticFields = initStaticFields;

  console.log('photoGridCollection module loaded');
})();