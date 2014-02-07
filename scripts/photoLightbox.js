/**
 * This module defines a constructor for PhotoLightbox objects.
 * @module photoLightbox
 */
(function() {
  // ------------------------------------------------------------------------------------------- //
  // Private static variables

  var params, util, log, animate, SVGProgressCircle;

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
        nextButton, newImageTransitionEndEventListener, svg;

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
    }, false);
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

    closeButton = util.createElement('div', lightbox, null,
        ['spriteButton','closeButton','hidden']);
    util.addTapEventListener(closeButton, function(event) {
      onCloseButtonTap.call(photoLightbox, event);
    }, false);

    reduceFromFullButton = util.createElement('div', null, null,
        ['spriteButton','reduceFromFullButton','hidden']);
    expandToFullButton = util.createElement('div', null, null,
        ['spriteButton','expandToFullButton','hidden']);

    if (!util.isSmallScreen) {
      lightbox.appendChild(reduceFromFullButton);
      reduceFromFullButton.style.display = 'none';
      util.addTapEventListener(reduceFromFullButton, function(event) {
        onFullscreenButtonTap.call(photoLightbox, event);
      }, false);

      lightbox.appendChild(expandToFullButton);
      util.addTapEventListener(expandToFullButton, function(event) {
        onFullscreenButtonTap.call(photoLightbox, event);
      }, false);

      util.addOnEndFullScreen(function() {
        onFullScreenChange.call(photoLightbox, false);
      });
    }

    previousButton = util.createElement('div', lightbox, null,
        ['spriteButton','previousButton','hidden']);
    util.addTapEventListener(previousButton, function(event) {
      onPreviousButtonTap.call(photoLightbox, event);
    }, false);

    nextButton = util.createElement('div', lightbox, null,
        ['spriteButton','nextButton','hidden']);
    util.addTapEventListener(nextButton, function(event) {
      onNextButtonTap.call(photoLightbox, event);
    }, false);

    util.listenToMultipleForMultiple([closeButton,reduceFromFullButton,expandToFullButton,
      previousButton,nextButton], ['mouseover','mousemove','touchmove'], function(event) {
      onOverlayButtonHover.call(photoLightbox, event);
    });

    util.listenToMultipleForMultiple([closeButton,reduceFromFullButton,expandToFullButton,
      previousButton,nextButton], ['mouseout','touchend','touchcancel'], function(event) {
      onOverlayButtonHoverEnd.call(photoLightbox, event);
    });

    svg = document.createElementNS(params.SVG_NAMESPACE, 'svg');
    svg.style.width = params.LIGHTBOX.PROGRESS_CIRCLE_DIAMETER + 'px';
    svg.style.height = params.LIGHTBOX.PROGRESS_CIRCLE_DIAMETER + 'px';
    lightbox.appendChild(svg);

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
      nextButton: nextButton,
      svg: svg
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
      reduceFromFullScreen.call(photoLightbox);
    } else {
      expandToFullScreen.call(photoLightbox);
    }
    util.stopPropogation(event);
  }

  // TODO: jsdoc
  function onOverlayButtonHover() {
    //log.v('onOverlayButtonHover');
    var photoLightbox = this;

    photoLightbox.mouseIsOverOverlayButton = true;
  }

  // TODO: jsdoc
  function onOverlayButtonHoverEnd() {
    //log.v('onOverlayButtonHoverEnd');
    var photoLightbox = this;

    photoLightbox.mouseIsOverOverlayButton = false;
  }

  // TODO: jsdoc
  function onLightboxPointerMove() {
    var photoLightbox = this;

    // Stop any previous pointer move timer
    if (photoLightbox.pointerMoveTimeout) {
      //log.v('onLightboxPointerMove', 'Refreshing pointer move timeout');
      clearTimeout(photoLightbox.pointerMoveTimeout);
    } else {
      log.d('onLightboxPointerMove', 'Showing overlay buttons, and starting new pointer move timeout');
      photoLightbox.buttonsHaveBeenVisible = true;
      setOverlayButtonsVisibility.call(photoLightbox, true);
    }

    // Start a new pointer move timer
    photoLightbox.pointerMoveTimeout = setTimeout(function() {
      onLightboxPointerMoveTimeout.call(photoLightbox);
    }, params.LIGHTBOX.POINTER_MOVE_BUTTON_FADE_DELAY);
  }

  // TODO: jsdoc
  function onLightboxPointerMoveTimeout() {
    var photoLightbox = this;
    log.d('onLightboxPointerMoveTimeout', 'mouseIsOverOverlayButton=' +
        photoLightbox.mouseIsOverOverlayButton);
    // Don't hide the buttons on a mobile device
    if (!util.isMobileBrowser) {
      if (!photoLightbox.mouseIsOverOverlayButton) {
        setOverlayButtonsVisibility.call(photoLightbox, false);
        photoLightbox.pointerMoveTimeout = null;
      }
    }
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
    util.removeChildIfPresent(photoLightbox.elements.lightbox, photoLightbox.elements.oldSmallImage);
    util.removeChildIfPresent(photoLightbox.elements.lightbox, photoLightbox.elements.oldMainImage);

    // Remove the visibility classes from the old small and main images
    util.toggleClass(photoLightbox.elements.oldSmallImage, 'hidden', false);
    util.toggleClass(photoLightbox.elements.oldMainImage, 'visible', false);

    // Switch the previous new image elements to now be old image elements for this transition
    photoLightbox.elements.oldSmallImage = photoLightbox.elements.newSmallImage;
    photoLightbox.elements.oldMainImage = photoLightbox.elements.newMainImage;
    switchImageClassToOldOrNew(photoLightbox.elements.oldSmallImage, false, false);
    switchImageClassToOldOrNew(photoLightbox.elements.oldMainImage, true, false);

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
    }

    loadPhotoImage(photoLightbox, true, mainTargetSize, photoItem);

    if (mainImageIsNotYetCached) {
      // Show the progress circle
      loadPhotoImage(photoLightbox, false, smallTargetSize, photoItem);
      photoLightbox.progressCircle.open();
    }

    // Fade out the old image
    setElementVisibility(photoLightbox.elements.oldSmallImage, false, false);
    setElementVisibility(photoLightbox.elements.oldMainImage, false, false);

    // TODO: jsdoc
    function loadPhotoImage(photoLightbox, isMainImage, targetSize, photoItem) {
      log.d('setPhoto.loadPhotoImage', 'Sending image load request: ' +
          photoItem[targetSize].source);
      photoItem.loadImage(targetSize, function(photoItem) {
        onPhotoImageLoadSuccess.call(photoLightbox, isMainImage, targetSize, photoItem);
      }, function(photoItem) {
        onPhotoImageLoadError.call(photoLightbox, isMainImage, targetSize, photoItem);
      });
    }
  }

  // TODO: jsdoc
  function onPhotoImageLoadSuccess(isMainImage, targetSize, photoItem) {
    log.i('onPhotoImageLoadSuccess',
        targetSize === 'full' ? photoItem.full.source : photoItem.small.source);
    var photoLightbox, stillOnSameImage, previousIndex, nextIndex;

    photoLightbox = this;
    stillOnSameImage = false;

    // Do NOT display this image if the viewer has already skipped past it
    if (photoItem !== photoLightbox.photoGroup.photos[photoLightbox.currentIndex]) {
      log.w('onPhotoImageLoadSuccess', 'Not displaying photo, because it is no longer current');
    } else {
      // Check which image just loaded
      if (isMainImage) {
        // We only want to display the main image version that is appropriate for the current
        // fullscreen mode
        if (!photoLightbox.inFullscreenMode || targetSize === 'full') {
          stillOnSameImage = true;
        } else {
          // Do NOT display this image if the viewer has toggled fullscreens
          log.w('onPhotoImageLoadSuccess',
              'Not displaying photo, because viewer toggled fullscreen while it was loading: isMainImage=' +
                  isMainImage + ', inFullscreenMode=' + photoLightbox.inFullscreenMode +
                  ', targetSize=' + targetSize);
        }
      } else {
        // Display whatever image is first available for the temporary, small, background image
        stillOnSameImage = true;
      }
    }

    if (stillOnSameImage) {
      // Check whether we are displaying the main image or the small image
      if (isMainImage) {
        // Don't switch the images around while the lightbox is closing
        if (!photoLightbox.closing) {
          // Assign the freshly loaded photo item image as the lightbox's main image
          photoLightbox.elements.newMainImage = photoItem[targetSize].image;

          // Remove any pre-existing classes from the new image
          util.clearClasses(photoLightbox.elements.newMainImage);

          if (photoLightbox.opening) {
            // Set the initial dimensions of the new image to match that of the lightbox, so that we
            // can slide the image dimensions with the lightbox dimensions
            photoLightbox.elements.newMainImage.style.width =
                util.getMidTransitionValue(photoLightbox.elements.lightbox, 'width');
            photoLightbox.elements.newMainImage.style.height =
                util.getMidTransitionValue(photoLightbox.elements.lightbox, 'height');

            photoLightbox.opening = false;
          } else {
            // TODO: fix this for real (as is, it matches the dimensions of an image that may have completely different aspect ratio...)
            // Set the initial dimensions of the new image to match that of the old image, so that
            // we can slide the image to enlarged/shrunken states
//            if (photoLightbox.elements.oldMainImage) {
//              photoLightbox.elements.newMainImage.style.width =
//                  photoLightbox.elements.oldMainImage.style.width;
//              photoLightbox.elements.newMainImage.style.height =
//                  photoLightbox.elements.oldMainImage.style.height;
//            }
          }

          // Start the new image as hidden, so we can fade it in
          setElementVisibility(photoLightbox.elements.newMainImage, false, false);

          // Start listening for the end of any transition that will run for the new main image
          util.listenForTransitionEnd(photoLightbox.elements.newMainImage,
              photoLightbox.newImageTransitionEndEventListener);

          // Add the new main image to the DOM
          photoLightbox.elements.lightbox.appendChild(photoLightbox.elements.newMainImage);

          // Set up the class and transitions for the new image
          switchImageClassToOldOrNew(photoLightbox.elements.newMainImage, true, true);

          // Hide the small image
          setElementVisibility(photoLightbox.elements.newSmallImage, false, false);

          // Display this new image; there needs to be a slight delay after adding the element to
          // the DOM, and before adding its CSS transitions; otherwise, the transitions will not
          // work properly
          setElementVisibility(photoLightbox.elements.newMainImage, true, true, function() {
            // Set up the dimensions of the new image
            resizeMainImage(photoLightbox.elements.newMainImage, photoItem.small.width,
                photoItem.small.height, photoLightbox.inFullscreenMode);
          });

          // Start caching the neighboring images
          previousIndex = getPreviousPhotoItemIndex(photoLightbox);
          nextIndex = getNextPhotoItemIndex(photoLightbox);
          cacheNeighborImage(photoLightbox, targetSize,
              photoLightbox.photoGroup.photos[previousIndex]);
          cacheNeighborImage(photoLightbox, targetSize, photoLightbox.photoGroup.photos[nextIndex]);

          // Hide the progress circle
          photoLightbox.progressCircle.close();
        }
      } else {
        // Assign the freshly loaded photo item image as the lightbox's small image
        photoLightbox.elements.newSmallImage = photoItem[targetSize].image;

        setElementVisibility(photoLightbox.elements.newSmallImage, false, false);

        // Add the new small image to the DOM
        photoLightbox.elements.lightbox.appendChild(photoLightbox.elements.newSmallImage);

        // Set up the class and transitions for the new image
        switchImageClassToOldOrNew(photoLightbox.elements.newSmallImage, false, true);

        // Display this new image, but only if the main image has not already loaded
        if (!photoItem.full.isCached &&
            (!photoItem.small.isCached || photoLightbox.inFullscreenMode)) {
          // There needs to be a slight delay after adding the element to the DOM, and before
          // adding its CSS transitions; otherwise, the transitions will not work properly
          setElementVisibility(photoLightbox.elements.newSmallImage, true, true, null);
        }
      }
    }

    // TODO: jsdoc
    function cacheNeighborImage(photoLightbox, targetSize, photoItem) {
      log.v('onPhotoImageLoadSuccess.cacheNeighborImage', 'Sending image cache request: ' +
          photoItem[targetSize].source);
      photoItem.cacheImage(targetSize, function(photoItem) {
        onNeighborPhotoCacheSuccess.call(photoLightbox, targetSize, photoItem);
      }, function(photoItem) {
        onNeighborPhotoCacheError.call(photoLightbox, targetSize, photoItem);
      });
    }
  }

  // TODO: jsdoc
  function onPhotoImageLoadError(isMainImage, targetSize, photoItem) {
    log.e('onPhotoImageLoadError',
        targetSize === 'full' ? photoItem.full.source : photoItem.small.source);
    var photoLightbox;

    photoLightbox = this;

    // TODO: display an error image and/or retry loading the image
  }

  // TODO: jsdoc
  function onNeighborPhotoCacheSuccess(targetSize, photoItem) {
    log.v('onNeighborPhotoCacheSuccess',
        targetSize === 'full' ? photoItem.full.source : photoItem.small.source);
  }

  // TODO: jsdoc
  function onNeighborPhotoCacheError(targetSize, photoItem) {
    log.e('onNeighborPhotoCacheError',
        targetSize === 'full' ? photoItem.full.source : photoItem.small.source);
  }

  // TODO: jsdoc
  function onNewImageTransitionEnd(event) {
    log.d('onNewImageTransitionEnd', 'property=' + event.propertyName);
    var photoLightbox;

    photoLightbox = this;

    // Remove the old small and main images from the DOM
    util.removeChildIfPresent(photoLightbox.elements.lightbox,
        photoLightbox.elements.oldSmallImage);
    util.removeChildIfPresent(photoLightbox.elements.lightbox,
        photoLightbox.elements.oldMainImage);

    // Remove the visibility classes from the old small and main images
    util.toggleClass(photoLightbox.elements.oldSmallImage, 'hidden', false);
    util.toggleClass(photoLightbox.elements.oldMainImage, 'visible', false);
  }

  // TODO: jsdoc
  function onLightboxTransitionEnd(event) {
    var photoLightbox = this;

    // This event bubbles up from each descendant of the lightbox
    if (event.target === photoLightbox.elements.lightbox) {
      log.d('onLightboxTransitionEnd', 'property=' + event.propertyName);

      photoLightbox.opening = false;
      photoLightbox.closing = false;

      // Determine whether the lightbox just appeared or disappeared
      if (!util.containsClass(photoLightbox.elements.lightbox, 'hidden')) {
        // --- The lightbox just appeared --- //

        // Hide the overlay buttons
        setLightboxButtonsDisplay.call(photoLightbox, true);

        // TODO: this is a hack; fix the root problem of why this function gets called at times other than when we open or close the lightbox
        if (!photoLightbox.buttonsHaveBeenVisible) {
          // Have the overlay buttons briefly show at the start
          setTimeout(function() {
            onLightboxPointerMove.call(photoLightbox);
          }, params.ADD_CSS_TRANSITION_DELAY);
        }

        // If we are still loading the main image, show the progress circle
        if (util.containsClass(photoLightbox.elements.newMainImage, 'hidden')) {
          photoLightbox.progressCircle.open();
        }
      } else {
        // --- The lightbox just disappeared --- //

        // Hide the lightbox and the background haze
        photoLightbox.elements.lightbox.style.display = 'none';
        photoLightbox.elements.backgroundHaze.style.display = 'none';
      }
    }
  }

  // TODO: jsdoc
  function expandToFullScreen() {
    var photoLightbox = this;
    photoLightbox.inFullscreenMode = true;
    adjustForFullScreenChange.call(photoLightbox);
    util.requestFullscreen(photoLightbox.elements.lightbox);
  }

  // TODO: jsdoc
  function reduceFromFullScreen() {
    var photoLightbox = this;
    photoLightbox.inFullscreenMode = false;
    adjustForFullScreenChange.call(photoLightbox);
    util.cancelFullScreen();
  }

  // TODO: jsdoc
  function onFullScreenChange(expandedToFullScreen) {
    log.i('onFullScreenChange', 'expandedToFullScreen=' + expandedToFullScreen);
    var photoLightbox = this;
    if (expandedToFullScreen !== photoLightbox.inFullscreenMode) {
      photoLightbox.inFullscreenMode = expandedToFullScreen;
      adjustForFullScreenChange.call(photoLightbox);
    }
  }

  // TODO: jsdoc
  function adjustForFullScreenChange() {
    var photoLightbox = this;
    if (photoLightbox.inFullscreenMode) {
      photoLightbox.elements.reduceFromFullButton.style.display = 'block';
      photoLightbox.elements.expandToFullButton.style.display = 'none';
      util.toggleClass(photoLightbox.elements.lightbox, 'fullScreen', true);
    } else {
      photoLightbox.elements.expandToFullButton.style.display = 'block';
      photoLightbox.elements.reduceFromFullButton.style.display = 'none';
      util.toggleClass(photoLightbox.elements.lightbox, 'fullScreen', false);
    }
    recenterAndResize.call(photoLightbox);
    setPhoto.call(photoLightbox, photoLightbox.currentIndex);
  }

  // TODO: jsdoc
  function setOverlayButtonsVisibility(visible) {
    var photoLightbox = this;
    setElementVisibility(photoLightbox.elements.closeButton, visible, false);
    setElementVisibility(photoLightbox.elements.reduceFromFullButton, visible, false);
    setElementVisibility(photoLightbox.elements.expandToFullButton, visible, false);
    setElementVisibility(photoLightbox.elements.previousButton, visible, false);
    setElementVisibility(photoLightbox.elements.nextButton, visible, false);
  }

  // TODO: jsdoc
  function recenterAndResize() {
    var photoLightbox, boundingBox, viewportSize;
    photoLightbox = this;

    // Only change the lightbox dimensions if the lightbox is visible
    if (photoLightbox.elements.lightbox.style.display !== 'none' &&
        !util.containsClass(photoLightbox.elements.lightbox, 'hidden')) {
      boundingBox = getCenteredBoundingBox();
      viewportSize = util.getViewportSize();
      if (photoLightbox.inFullscreenMode ||
          boundingBox.w > viewportSize.w || boundingBox.h > viewportSize.h) {
        photoLightbox.elements.lightbox.style.left = '0';
        photoLightbox.elements.lightbox.style.top = '0';
        photoLightbox.elements.lightbox.style.width = '100%';
        photoLightbox.elements.lightbox.style.height = '100%';
      } else {
        photoLightbox.elements.lightbox.style.left = boundingBox.x + 'px';
        photoLightbox.elements.lightbox.style.top = boundingBox.y + 'px';
        photoLightbox.elements.lightbox.style.width = boundingBox.w + 'px';
        photoLightbox.elements.lightbox.style.height = boundingBox.h + 'px';
      }
    }
  }

  // TODO: jsdoc
  function setLightboxButtonsDisplay(areDisplayed) {
    var photoLightbox, display;
    photoLightbox = this;
    display = areDisplayed ? 'block' : 'none';
    photoLightbox.elements.closeButton.style.display = display;
    photoLightbox.elements.previousButton.style.display = display;
    photoLightbox.elements.nextButton.style.display = display;
    if (!areDisplayed) {
      photoLightbox.elements.reduceFromFullButton.style.display = display;
      photoLightbox.elements.expandToFullButton.style.display = display;
    } else {
      // Don't ever display both the reduce and expand buttons simultaneously
      if (photoLightbox.inFullscreenMode) {
        photoLightbox.elements.reduceFromFullButton.style.display = 'block';
        photoLightbox.elements.expandToFullButton.style.display = 'none';
      } else {
        photoLightbox.elements.reduceFromFullButton.style.display = 'none';
        photoLightbox.elements.expandToFullButton.style.display = 'block';
      }
    }
  }

  // ------------------------------------------------------------------------------------------- //
  // Public dynamic functions

  // TODO: jsdoc
  function open(photoGroup, index) {
    var photoLightbox, photoItem, body, bodyTapEventListener;

    photoLightbox = this;
    photoLightbox.photoGroup = photoGroup;
    photoLightbox.currentIndex = index;
    photoItem = photoLightbox.photoGroup.photos[photoLightbox.currentIndex];
    body = document.getElementsByTagName('body')[0];
    photoLightbox.buttonsHaveBeenVisible = false;
    photoLightbox.opening = true;

    // Remove the visible/hidden classes from the lightbox, so the next property changes can
    // happen instantly, without its CSS transitions getting in the way
    util.toggleClass(photoLightbox.elements.lightbox, 'hidden', false);
    util.toggleClass(photoLightbox.elements.lightbox, 'visible', false);

    // Start the lightbox animation with its dimensions matching the thumbnail
    photoLightbox.elements.lightbox.style.left = photoItem.thumbnail.x + 'px';
    photoLightbox.elements.lightbox.style.top = photoItem.thumbnail.y - util.getScrollTop() + 'px';
    photoLightbox.elements.lightbox.style.width = photoItem.thumbnail.width + 'px';
    photoLightbox.elements.lightbox.style.height = photoItem.thumbnail.height + 'px';

    // Make the lightbox visible and start its CSS transitions
    photoLightbox.elements.lightbox.style.display = 'block';
    setElementVisibility(photoLightbox.elements.lightbox, true, true, function() {
      // Have the lightbox transition to its larger, centered dimensions
      recenterAndResize.call(photoLightbox);
    });

    // Make the background haze visible and start its CSS transitions
    photoLightbox.elements.backgroundHaze.style.display = 'block';
    setElementVisibility(photoLightbox.elements.backgroundHaze, true, true, null);

    // The lightbox is closed when the viewer taps outside of it
    bodyTapEventListener = function(event) {
      onCloseButtonTap.call(photoLightbox, event);
    };
    photoLightbox.bodyTapEventListener = bodyTapEventListener;
    photoLightbox.bodyTapPreventionCallback =
        util.addTapEventListener(body, bodyTapEventListener, false);

    // Show the first photo
    setPhoto.call(photoLightbox, photoLightbox.currentIndex);
  }

  // TODO: jsdoc
  function close() {
    var photoLightbox, photoItem, body;

    photoLightbox = this;
    photoItem = photoLightbox.photoGroup.photos[photoLightbox.currentIndex];
    photoLightbox.closing = true;
    body = document.getElementsByTagName('body')[0];

    // Make sure we close from not fullscreen mode
    if (photoLightbox.inFullscreenMode) {
      reduceFromFullScreen.call(photoLightbox);
    }

    // If the progress circle is running, hide it
    photoLightbox.progressCircle.close();

    // Hide the overlay buttons
    setLightboxButtonsDisplay.call(photoLightbox, false);

    // Start the lightbox's transition to being hidden
    setElementVisibility(photoLightbox.elements.lightbox, false, false);

    // Have the lightbox transition to match the dimensions of the thumbnail
    photoLightbox.elements.lightbox.style.left = photoItem.thumbnail.x + 'px';
    photoLightbox.elements.lightbox.style.top = photoItem.thumbnail.y - util.getScrollTop() + 'px';
    photoLightbox.elements.lightbox.style.width = photoItem.thumbnail.width + 'px';
    photoLightbox.elements.lightbox.style.height = photoItem.thumbnail.height + 'px';

    // Have the image dimensions also transition with those of the lightbox
    photoLightbox.elements.newMainImage.style.width = photoItem.thumbnail.width + 'px';
    photoLightbox.elements.newMainImage.style.height = photoItem.thumbnail.height + 'px';

    // Start the background haze's transition to being hidden
    setElementVisibility(photoLightbox.elements.backgroundHaze, false, false);

    // We don't need to listen for when the viewer taps outside of the lightbox anymore
    util.removeTapEventListener(body, photoLightbox.bodyTapEventListener,
        photoLightbox.bodyTapPreventionCallback);
    photoLightbox.bodyTapEventListener = null;
    photoLightbox.bodyTapPreventionCallback = null;
  }

  // ------------------------------------------------------------------------------------------- //
  // Private static functions

  /**
   * Adds or removes the hidden and visible classes from the given element, in order for it to be
   * visible or hidden, as specified. These two classes have corresponding CSS rules regarding
   * visibility and transitions.
   * @function photoLightbox~setElementVisibility
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

  /**
   * Switches the given element's classes according to whether this is a main image and whether
   * this is a new image. These classes have corresponding CSS rules regarding visibility and
   * transitions.
   * @function photoLightbox~switchImageClassToOldOrNew
   * @param {HTMLElement} element The image element whose classes will be switched.
   * @param {Boolean} isMainImage True if the element is a main image.
   * @param {Boolean} switchToNew True if the element is a new image.
   */
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

  // TODO: jsdoc
  function resizeMainImage(element, smallWidth, smallHeight, isFullScreen) {
    var photoAspectRatio, screenAspectRatio, scaledWidth, scaledHeight;

    photoAspectRatio = smallWidth / smallHeight;

    if (isFullScreen) {
      screenAspectRatio = screen.width / screen.height;

      // Stretch the photo uniformly to fit within the screen
      if (photoAspectRatio > screenAspectRatio) {
        scaledWidth = screen.width;
        scaledHeight = screen.width / photoAspectRatio;
      } else {
        scaledWidth = screen.height * photoAspectRatio;
        scaledHeight = screen.height;
      }
    } else {
      scaledWidth = smallWidth;
      scaledHeight = smallHeight;
    }

    element.style.width = scaledWidth + 'px';
    element.style.height = scaledHeight + 'px';
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
    SVGProgressCircle = app.SVGProgressCircle;
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
    var photoLightbox = this;

    photoLightbox.elements = null;
    photoLightbox.currentIndex = Number.NaN;
    photoLightbox.photoGroup = null;
    photoLightbox.inFullscreenMode = false;
    photoLightbox.bodyTapEventListener = null;
    photoLightbox.bodyTapPreventionCallback = null;
    photoLightbox.newImageTransitionEndEventListener = null;
    photoLightbox.pointerMoveTimeout = null;
    photoLightbox.buttonsHaveBeenVisible = false;
    photoLightbox.mouseIsOverOverlayButton = false;
    photoLightbox.opening = false;
    photoLightbox.closing = false;
    photoLightbox.open = open;
    photoLightbox.close = close;

    createElements.call(photoLightbox, width, height);

    photoLightbox.progressCircle = new SVGProgressCircle(photoLightbox.elements.svg, 0, 0,
        params.LIGHTBOX.PROGRESS_CIRCLE_DIAMETER, params.LIGHTBOX.PROGRESS_CIRCLE_DOT_RADIUS);

    // Re-position the lightbox when the window re-sizes
    util.listen(window, 'resize', function() {
      recenterAndResize.call(photoLightbox);
    });
  }

  // Expose this module
  if (!window.app) window.app = {};
  window.app.PhotoLightbox = PhotoLightbox;
  PhotoLightbox.initStaticFields = initStaticFields;

  console.log('photoLightbox module loaded');
})();
