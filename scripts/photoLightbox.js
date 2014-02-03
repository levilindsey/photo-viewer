/**
 * This module defines a constructor for PhotoLightbox objects.
 * @module photoLightbox
 */
(function() {
  // ------------------------------------------------------------------------------------------- //
  // Private static variables

  var params, util, log, animate;

  // ------------------------------------------------------------------------------------------- //
  // Private dynamic functions

  /**
   * Creates the DOM elements that form this lightbox, adds them to the DOM, and adds them to the
   * elements property of this lightbox.
   * @function PhotoLightbox~createElements
   * @param {Number} [width] The width of this lightbox when not in full-screen mode.
   * @param {Number} [height] The height of this lightbox when not in full-screen mode.
   */
  function createElements(width, height) {
    var photoLightbox, body, lightbox, oldMainImage, newMainImage, newSmallImage, oldSmallImage,
        backgroundHaze, closeButton, reduceFromFullButton, expandToFullButton, previousButton,
        nextButton, newImageTransitionEndEventListener;

    photoLightbox = this;
    body = document.getElementsByTagName('body')[0];

    if (!width || !height) {
      width = params.LIGHTBOX.WIDTH;
      height = params.LIGHTBOX.HEIGHT;
    }

    lightbox = util.createElement('div', body, null, ['lightbox','hidden']);
    lightbox.style.width = width + 'px';
    lightbox.style.height = height + 'px';
    util.addTapEventListener(lightbox, function(event) {
      onNextButtonTap.call(photoLightbox, event);
    }, true);
    util.addPointerMoveEventListener(lightbox, function(event) {
      onLightboxPointerMove.call(photoLightbox, event);
    });
    util.listenForTransitionEnd(lightbox, function(event) {
      onLightboxTransitionEnd.call(photoLightbox, event);
    });

    oldMainImage = util.createElement('img', lightbox, null, ['oldMainImage','hidden']);
    newMainImage = util.createElement('img', lightbox, null, ['newMainImage','hidden']);
    newImageTransitionEndEventListener = function(event) {
      onNewImageTransitionEnd.call(photoLightbox, event);
    };
    photoLightbox.newImageTransitionEndEventListener = newImageTransitionEndEventListener;
    util.listenForTransitionEnd(newMainImage, newImageTransitionEndEventListener);
    newSmallImage = util.createElement('img', lightbox, null, ['newSmallImage','hidden']);
    oldSmallImage = util.createElement('img', lightbox, null, ['oldSmallImage','hidden']);

    backgroundHaze = util.createElement('div', body, null, ['backgroundHaze','hidden']);

    closeButton =
        util.createElement('div', lightbox, null, ['spriteButton','closeButton','hidden']);
    util.addTapEventListener(closeButton, function(event) {
      onCloseButtonTap.call(photoLightbox, event);
    }, true);

    reduceFromFullButton =
        util.createElement('div', lightbox, null, ['spriteButton','reduceFromFullButton','hidden']);
    reduceFromFullButton.style.display = 'none';
    util.addTapEventListener(reduceFromFullButton, function(event) {
      onFullscreenButtonTap.call(photoLightbox, event);
    }, true);

    expandToFullButton =
        util.createElement('div', lightbox, null, ['spriteButton','expandToFullButton','hidden']);
    util.addTapEventListener(expandToFullButton, function(event) {
      onFullscreenButtonTap.call(photoLightbox, event);
    }, true);

    previousButton =
        util.createElement('div', lightbox, null, ['spriteButton','previousButton','hidden']);
    util.addTapEventListener(previousButton, function(event) {
      onPreviousButtonTap.call(photoLightbox, event);
    }, true);

    nextButton = util.createElement('div', lightbox, null, ['spriteButton','nextButton','hidden']);
    util.addTapEventListener(nextButton, function(event) {
      onNextButtonTap.call(photoLightbox, event);
    }, true);

    photoLightbox.elements = {
      lightbox: lightbox,
      oldMainImage: oldMainImage,
      newMainImage: newMainImage,
      newSmallImage: newSmallImage,
      oldSmallImage: oldSmallImage,
      backgroundHaze: backgroundHaze,
      closeButton: closeButton,
      reduceFromFullButton: reduceFromFullButton,
      expandToFullButton: expandToFullButton,
      previousButton: previousButton,
      nextButton: nextButton
    };
  }

  /**
   * Transitions to the previous photo.
   * @function PhotoLightbox~onPreviousButtonTap
   * @param {Object} event The original DOM event that triggered this call.
   */
  function onPreviousButtonTap(event) {
    log.i('onPreviousButtonTap');
    var photoLightbox = this;
    setPhoto.call(photoLightbox, getPreviousPhotoItemIndex(photoLightbox));
    util.stopPropogation(event);
  }

  /**
   * Transitions to the next photo.
   * @function PhotoLightbox~onNextButtonTap
   * @param {Object} event The original DOM event that triggered this call.
   */
  function onNextButtonTap(event) {
    log.i('onNextButtonTap');
    var photoLightbox = this;
    setPhoto.call(photoLightbox, getNextPhotoItemIndex(photoLightbox));
    util.stopPropogation(event);
  }

  // TODO: jsdoc
  function onCloseButtonTap(event) {
    log.i('onCloseButtonTap');
    var photoLightbox = this;
    close.call(photoLightbox);
    util.stopPropogation(event);
  }

  // TODO: jsdoc
  function onFullscreenButtonTap(event) {
    log.i('onFullscreenButtonTap');
    var photoLightbox = this;
    if (photoLightbox.inFullscreenMode) {
      reduceFromFullscreen.call(photoLightbox);
    } else {
      expandToFullscreen.call(photoLightbox);
    }
    util.stopPropogation(event);
  }

  // TODO: jsdoc
  function onLightboxPointerMove() {
    //log.v('onLightboxPointerMove');
    var photoLightbox = this;

    // Stop any previous pointer move timer
    if (photoLightbox.pointerMoveTimeout) {
      clearTimeout(photoLightbox.pointerMoveTimeout);
    } else {
      setOverlayButtonsVisibility.call(photoLightbox, true);
    }

    // Start a new pointer move timer
    photoLightbox.pointerMoveTimeout =
        setTimeout(onLightboxPointerMoveTimeout, params.LIGHTBOX.POINTER_MOVE_BUTTON_FADE_DELAY);
  }

  // TODO: jsdoc
  function onLightboxPointerMoveTimeout() {
    log.i('onLightboxPointerMoveTimeout');
    var photoLightbox = this;
    setOverlayButtonsVisibility.call(photoLightbox, true);
    photoLightbox.pointerMoveTimeout = null;
  }

  // TODO: jsdoc
  function setPhoto(index) {
    var photoLightbox, photoItem, mainImageIsNotYetCached, mainTargetSize, smallTargetSize;

    photoLightbox = this;
    photoLightbox.currentIndex = index;
    photoItem = photoLightbox.photoGroup.photos[index];
    mainImageIsNotYetCached = true;

    // Stop listening for the end of any transition that may still be running for the old main
    // image
    util.stopListeningForTransitionEnd(photoLightbox.elements.oldMainImage,
        photoLightbox.newImageTransitionEndEventListener);

    // Remove the old small and main images from the DOM
    photoLightbox.elements.lightbox.removeChild(photoLightbox.elements.oldSmallImage);
    photoLightbox.elements.lightbox.removeChild(photoLightbox.elements.oldMainImage);

    // Switch the previous new image elements to now be old image elements for this transition
    photoLightbox.elements.oldSmallImage = photoLightbox.elements.newSmallImage;
    switchImageClassToOldOrNew(photoLightbox.elements.oldSmallImage, false, false);
    photoLightbox.elements.oldMainImage = photoLightbox.elements.newMainImage;
    switchImageClassToOldOrNew(photoLightbox.elements.oldMainImage, true, false);

    // Start listening for the end of any transition that will run for the new main image
    util.listenForTransitionEnd(photoLightbox.elements.newMainImage,
        photoLightbox.newImageTransitionEndEventListener);

    // Set up the new image sources
    if (photoLightbox.inFullscreenMode) {
      mainTargetSize = 'full';

      // Determine the new target small size
      if (photoItem.full.isCached) {
        smallTargetSize = 'full';
        mainImageIsNotYetCached = false;
      } else if (photoItem.small.isCached) {
        smallTargetSize = 'small';
      } else {
        smallTargetSize = 'thumbnail';
      }

      loadPhotoImage(photoLightbox, true, mainTargetSize, photoItem);
      loadPhotoImage(photoLightbox, false, smallTargetSize, photoItem);
    } else {
      // Determine the new target small and main size
      if (photoItem.full.isCached) {
        mainTargetSize = 'full';
        smallTargetSize = 'full';
        mainImageIsNotYetCached = false;
      } else if (photoItem.small.isCached) {
        mainTargetSize = 'small';
        smallTargetSize = 'small';
        mainImageIsNotYetCached = false;
      } else {
        mainTargetSize = 'small';
        smallTargetSize = 'thumbnail';
      }

      loadPhotoImage(photoLightbox, true, mainTargetSize, photoItem);
      loadPhotoImage(photoLightbox, false, smallTargetSize, photoItem);
    }

    if (mainImageIsNotYetCached) {
      // Show the progress circle
      //**;// TODO: !!!
    }

    // Fade out the old image, and fade in the temporary, small version of the image
    setElementVisibility(photoLightbox.elements.newSmallImage, false);
    setElementVisibility(photoLightbox.elements.newMainImage, false);
    setElementVisibility(photoLightbox.elements.oldSmallImage, false);
    setElementVisibility(photoLightbox.elements.oldMainImage, false);

    // TODO: jsdoc
    function loadPhotoImage(photoLightbox, isMainImage, targetSize, photoItem) {
      photoItem.loadImage(targetSize, function(photoItem) {
        onPhotoImageLoadSuccess.call(photoLightbox, isMainImage, targetSize, photoItem);
      }, function(photoItem) {
        onPhotoImageLoadError.call(photoLightbox, isMainImage, targetSize, photoItem);
      });
    }
  }

  // TODO: jsdoc
  function onPhotoImageLoadSuccess(isMainImage, targetSize, photoItem) {
    log.i('onPhotoImageLoadSuccess', targetSize === 'full' ? photoItem.full.source : photoItem.small.source);
    var photoLightbox, stillOnSameImage, previousIndex, nextIndex;

    photoLightbox = this;
    stillOnSameImage = false;

    // Do NOT display this image if the viewer has already skipped past it
    if (photoItem !== photoLightbox.photoGroup.photos[photoLightbox.currentIndex]) {
      log.w('onPhotoImageLoadSuccess', 'Not displaying photo, because it is no longer current');
    } else {
      // Check which image just loaded
      if (photoLightbox.inFullscreenMode && targetSize === 'full') {
        stillOnSameImage = true;
      } else if (!photoLightbox.inFullscreenMode && targetSize === 'small') {
        stillOnSameImage = true;
      } else {
        // Do NOT display this image if the viewer has toggled fullscreens
        log.w('onPhotoImageLoadSuccess',
            'Not displaying photo, because viewer toggled fullscreen while it was loading: isMainImage=' +
                isMainImage + ', inFullscreenMode=' + photoLightbox.inFullscreenMode +
                ', targetSize=' + targetSize);
      }
    }

    if (stillOnSameImage) {
      // Check whether we are displaying the main image or the small image
      if (isMainImage) {
        // Assign the freshly loaded photo item image as the lightbox's main image
        photoLightbox.elements.newMainImage = photoItem[targetSize].image;
        switchImageClassToOldOrNew(photoLightbox.elements.newMainImage, true, true);

        // Add the new main image to the DOM
        photoLightbox.elements.lightbox.appendChild(photoLightbox.elements.newMainImage);

        // Display this new image
        setElementVisibility(photoLightbox.elements.newSmallImage, false);
        setElementVisibility(photoLightbox.elements.newMainImage, true);

        // Start caching the neighboring images
        previousIndex = getPreviousPhotoItemIndex(photoLightbox);
        nextIndex = getNextPhotoItemIndex(photoLightbox);
        cacheNeighborImage(photoLightbox, targetSize, photoLightbox.photoGroup.photos[previousIndex]);
        cacheNeighborImage(photoLightbox, targetSize, photoLightbox.photoGroup.photos[nextIndex]);

        // Hide the progress circle
        //**;// TODO: !!!
      } else {
        // Assign the freshly loaded photo item image as the lightbox's small image
        photoLightbox.elements.newSmallImage = photoItem[targetSize].image;
        switchImageClassToOldOrNew(photoLightbox.elements.newSmallImage, false, true);

        // Add the new small image to the DOM
        photoLightbox.elements.lightbox.appendChild(photoLightbox.elements.newSmallImage);

        // Display this new image
        setElementVisibility(photoLightbox.elements.newSmallImage, true);
      }
    }

    // TODO: jsdoc
    function cacheNeighborImage(photoLightbox, targetSize, photoItem) {
      photoItem.cacheImage(targetSize, function(photoItem) {
        onNeighborPhotoCacheSuccess.call(photoLightbox, targetSize, photoItem);
      }, function(photoItem) {
        onNeighborPhotoCacheError.call(photoLightbox, targetSize, photoItem);
      });
    }
  }

  // TODO: jsdoc
  function onPhotoImageLoadError(isMainImage, targetSize, photoItem) {
    log.e('onPhotoImageLoadError', targetSize === 'full' ? photoItem.full.source : photoItem.small.source);
    var photoLightbox;

    photoLightbox = this;

    // TODO: display an error image and/or retry loading the image
  }

  // TODO: jsdoc
  function onNeighborPhotoCacheSuccess(targetSize, photoItem) {
    log.v('onNeighborPhotoCacheSuccess', targetSize === 'full' ? photoItem.full.source : photoItem.small.source);
  }

  // TODO: jsdoc
  function onNeighborPhotoCacheError(targetSize, photoItem) {
    log.e('onNeighborPhotoCacheError', targetSize === 'full' ? photoItem.full.source : photoItem.small.source);
  }

  // TODO: jsdoc
  function onNewImageTransitionEnd(event) {
    log.d('onNewImageTransitionEnd');
    var photoLightbox;

    photoLightbox = this;

    // Remove the old small and main images from the DOM
    photoLightbox.elements.lightbox.removeChild(photoLightbox.elements.oldSmallImage);
    photoLightbox.elements.lightbox.removeChild(photoLightbox.elements.oldMainImage);
  }

  // TODO: jsdoc
  function onLightboxTransitionEnd(event) {
    log.d('onLightboxTransitionEnd');
    var photoLightbox;

    photoLightbox = this;

    // Determine whether the lightbox just appeared or disappeared
    if (util.containsClass(photoLightbox.elements.lightbox, 'visible')) {
      // --- The lightbox just appeared --- //

      // Hide the overlay buttons
      setLightboxButtonsDisplay.call(photoLightbox, true);

      // Have the overlay buttons briefly show at the start
      onLightboxPointerMove.call(photoLightbox);

      // If we are still loading the main image, show the progress circle
      if (util.containsClass(photoLightbox.elements.newMainImage, 'hidden')) {
        //**; // TODO: !!!
      }
    } else {
      // --- The lightbox just disappeared --- //

      // Hide the lightbox and the background haze
      photoLightbox.elements.lightbox.style.display = 'none';
      photoLightbox.elements.backgroundHaze.style.display = 'none';
    }
  }

  // TODO: jsdoc
  function expandToFullscreen() {
    var photoLightbox = this;
    photoLightbox.inFullscreenMode = true;
    photoLightbox.elements.reduceFromFullButton.style.display = 'block';
    photoLightbox.elements.expandToFullButton.style.display = 'none';
    util.requestFullscreen(photoLightbox.elements.lightbox);
    setPhoto.call(photoLightbox, photoLightbox.currentIndex);
  }

  // TODO: jsdoc
  function reduceFromFullscreen() {
    var photoLightbox = this;
    photoLightbox.inFullscreenMode = false;
    photoLightbox.elements.expandToFullButton.style.display = 'block';
    photoLightbox.elements.reduceFromFullButton.style.display = 'none';
    util.cancelFullscreen();
    recenterAndResize.call(photoLightbox);
    setPhoto.call(photoLightbox, photoLightbox.currentIndex);
  }

  // TODO: jsdoc
  function setOverlayButtonsVisibility(visible) {
    var photoLightbox = this;
    setElementVisibility(photoLightbox.elements.closeButton, visible);
    setElementVisibility(photoLightbox.elements.reduceFromFullButton, visible);
    setElementVisibility(photoLightbox.elements.expandToFullButton, visible);
    setElementVisibility(photoLightbox.elements.previousButton, visible);
    setElementVisibility(photoLightbox.elements.nextButton, visible);
  }

  // TODO: jsdoc
  function recenterAndResize() {
    var photoLightbox, boundingBox;
    photoLightbox = this;
    // Only change the lightbox dimensions if we are not in fullscreen mode and the lightbox is
    // visible
    if (!photoLightbox.inFullscreenMode &&
        photoLightbox.elements.lightbox.style.display !== 'none' &&
        util.containsClass(photoLightbox.elements.lightbox, 'visible')) {
      boundingBox = getCenteredBoundingBox();
      photoLightbox.elements.lightbox.style.left = boundingBox.x + 'px';
      photoLightbox.elements.lightbox.style.top = boundingBox.y + 'px';
      photoLightbox.elements.lightbox.style.width = boundingBox.w + 'px';
      photoLightbox.elements.lightbox.style.height = boundingBox.h + 'px';
    }
  }

  // TODO: jsdoc
  function setLightboxButtonsDisplay(areDisplayed) {
    var photoLightbox, display;
    photoLightbox = this;
    display = areDisplayed ? 'block' : 'none';
    photoLightbox.elements.closeButton.style.display = display;
    photoLightbox.elements.reduceFromFullButton.style.display = display;
    photoLightbox.elements.expandToFullButton.style.display = display;
    photoLightbox.elements.previousButton.style.display = display;
    photoLightbox.elements.nextButton.style.display = display;
  }

  // ------------------------------------------------------------------------------------------- //
  // Public dynamic functions

  // TODO: jsdoc
  function open(photoGroup, index) {
    var photoLightbox, photoItem, body, bodyTapEventListener;

    photoLightbox = this;
    photoItem = photoLightbox.photoGroup.photos[photoLightbox.currentIndex];

    // Remove the visible/hidden classes from the lightbox, so the next property changes can
    // happen instantly, without its CSS transitions getting in the way
    util.toggleClass(photoLightbox.elements.lightbox, 'hidden', false);
    util.toggleClass(photoLightbox.elements.lightbox, 'visible', false);

    // Start the lightbox animation with its dimensions matching the thumbnail
    photoLightbox.elements.lightbox.style.left = photoItem.thumbnail.x + 'px';
    photoLightbox.elements.lightbox.style.top = photoItem.thumbnail.y + 'px';
    photoLightbox.elements.lightbox.style.width = photoItem.thumbnail.width + 'px';
    photoLightbox.elements.lightbox.style.height = photoItem.thumbnail.height + 'px';

    // Make the lightbox visible and start its CSS transitions
    photoLightbox.elements.lightbox.style.display = 'block';
    setElementVisibility(photoLightbox.elements.lightbox, true);

    // Have the lightbox transition to its larger, centered dimensions
    recenterAndResize.call(photoLightbox);

    // Make the background haze visible and start its CSS transitions
    photoLightbox.elements.backgroundHaze.style.display = 'block';
    setElementVisibility(photoLightbox.elements.backgroundHaze, true);

    // The lightbox is closed when the viewer taps outside of it
    bodyTapEventListener = function(event) { onCloseButtonTap(event, photoLightbox); };
    photoLightbox.bodyTapEventListener = bodyTapEventListener;
    body = document.getElementsByTagName('body')[0];
    photoLightbox.bodyTapPreventionCallback = util.addTapEventListener(body, bodyTapEventListener, true);
  }

  // TODO: jsdoc
  function close() {
    var photoLightbox, photoItem, body;

    photoLightbox = this;
    photoItem = photoLightbox.photoGroup.photos[photoLightbox.currentIndex];

    // Make sure we close from not fullscreen mode
    if (photoLightbox.inFullscreenMode) {
      reduceFromFullscreen.call(photoLightbox);
    }

    // If the progress circle is running, hide it
    //**; // TODO: !!!

    // Hide the overlay buttons
    setLightboxButtonsDisplay.call(photoLightbox, false);

    // Start the lightbox's transition to being hidden
    setElementVisibility(photoLightbox.elements.lightbox, false);

    // Have the lightbox transition to match the dimensions of the thumbnail
    photoLightbox.elements.lightbox.style.left = photoItem.thumbnail.x + 'px';
    photoLightbox.elements.lightbox.style.top = photoItem.thumbnail.y + 'px';
    photoLightbox.elements.lightbox.style.width = photoItem.thumbnail.width + 'px';
    photoLightbox.elements.lightbox.style.height = photoItem.thumbnail.height + 'px';

    // Start the background haze's transition to being hidden
    setElementVisibility(photoLightbox.elements.backgroundHaze, false);

    // We don't need to listen for when the viewer taps outside of the lightbox anymore
    body = document.getElementsByTagName('body')[0];
    util.removeTapEventListener(body, photoLightbox.bodyTapEventListener,
        photoLightbox.bodyTapPreventionCallback);
    photoLightbox.bodyTapEventListener = null;
    photoLightbox.bodyTapPreventionCallback = null;
  }

  // ------------------------------------------------------------------------------------------- //
  // Private static functions

  // TODO: jsdoc
  function setElementVisibility(element, visible) {
    util.toggleClass(element, 'hidden', !visible);
    util.toggleClass(element, 'visible', visible);
  }

  // TODO: jsdoc
  function switchImageClassToOldOrNew(element, isMainImage, switchToNew) {
    var newClass, oldClass;
    if (isMainImage) {
      newClass = 'newMainImage';
      oldClass = 'oldMainImage';
    } else {
      newClass = 'newSmallImage';
      oldClass = 'oldSmallImage';
    }
    util.toggleClass(element, newClass, switchToNew);
    util.toggleClass(element, oldClass, !switchToNew);
  }

  // TODO: jsdoc
  function getPreviousPhotoItemIndex(photoLightbox) {
    return (photoLightbox.currentIndex - 1 + photoLightbox.photoGroup.photos.length) %
        photoLightbox.photoGroup.photos.length;
  }

  // TODO: jsdoc
  function getNextPhotoItemIndex(photoLightbox) {
    return (photoLightbox.currentIndex + 1) % photoLightbox.photoGroup.photos.length;
  }

  // TODO: jsdoc
  function getCenteredBoundingBox() {
    var w, h, viewportSize;
    w = params.LIGHTBOX.WIDTH;
    h = params.LIGHTBOX.HEIGHT;
    viewportSize = util.getViewportSize();
    return {
      x: (viewportSize.w - w) * 0.5,
      y: (viewportSize.h - h) * 0.5,
      w: w,
      h: h
    };
  }

  // ------------------------------------------------------------------------------------------- //
  // Public static functions

  /**
   * Initializes some static state for this module.
   * @function PhotoLightbox.initStaticFields
   */
  function initStaticFields() {
    params = app.params;
    util = app.util;
    log = new app.Log('photoLightbox');
    animate = app.animate;
    log.d('initStaticFields', 'Module initialized');
  }

  // ------------------------------------------------------------------------------------------- //
  // Expose this module's constructor

  /**
   * @constructor
   * @global
   * @param {Number} [width] The width of this lightbox when not in full-screen mode.
   * @param {Number} [height] The height of this lightbox when not in full-screen mode.
   */
  function PhotoLightbox(width, height) {
    this.elements = null;
    this.currentIndex = Number.NaN;
    this.photoGroup = null;
    this.inFullscreenMode = false;
    this.bodyTapEventListener = null;
    this.bodyTapPreventionCallback = null;
    this.newImageTransitionEndEventListener = null;
    this.pointerMoveTimeout = null;
    this.open = open;
    this.close = close;

    createElements.call(this, width, height);

    // Re-position the lightbox when the window re-sizes
    util.listen(window, 'resize', function() {
      recenterAndResize.call(this);
    });
  }

  // Expose this module
  if (!window.app) window.app = {};
  window.app.PhotoLightbox = PhotoLightbox;
  PhotoLightbox.initStaticFields = initStaticFields;

  console.log('photoLightbox module loaded');
})();
