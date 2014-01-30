/**
 * This module defines a collection of static general animation functions.
 * @module animate
 */
(function() {
  // ------------------------------------------------------------------------------------------- //
  // Private static variables

  var animate, easingFunctions, currentlyLooping, currentAnimations, currentSynchronizations;

  currentAnimations = [];
  currentSynchronizations = [];

  // A collection of different types of easing functions.
  easingFunctions = {
    linear: function(t) { return t; },
    easeInQuad: function(t) { return t * t; },
    easeOutQuad: function(t) { return t * (2 - t); },
    easeInOutQuad: function(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; },
    easeInCubic: function(t) { return t * t * t; },
    easeOutCubic: function(t) { return 1 + --t * t * t; },
    easeInOutCubic:
      function(t) { return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1; },
    easeInQuart: function(t) { return t * t * t * t; },
    easeOutQuart: function(t) { return 1 - --t * t * t * t; },
    easeInOutQuart: function(t) { return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t; },
    easeInQuint: function(t) { return t * t * t * t * t; },
    easeOutQuint: function(t) { return 1 + --t * t * t * t * t; },
    easeInOutQuint:
      function(t) { return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t; }
  };

  // ------------------------------------------------------------------------------------------- //
  // Private static functions

  /**
   * Starts the animation loop, if it was not already running.
   * @function animate~startAnimationLoop
   */
  function startAnimationLoop() {
    if (!currentlyLooping) {
      requestAnimationFrame.call(window, animationLoop);
    }
  }

  /**
   * The animation loop. This continuously re-invokes itself while there are animations to animate.
   * @function animate~animationLoop
   */
  function animationLoop() {
    currentlyLooping = true;

    // Check whether there is anything to animate
    if (currentlyAnimating()) {
      updateAnimations(Date.now());
      refreshSynchronizations();

      requestAnimationFrame.call(window, animationLoop);
    } else {
      currentlyLooping = false;
    }
  }

  /**
   * Updates all of the current animations.
   * @function animate~updateAnimations
   * @param {number} currentTime The current time.
   */
  function updateAnimations(currentTime) {
    var i, animationFinished, animation;

    for (i = 0; i < currentAnimations.length; i++) {
      animation = currentAnimations[i];

      animationFinished = updateAnimation(animation, currentTime);

      if (animationFinished) {
        // Remove the finished animation
        currentAnimations.splice(i, 1);
        i--;

        // Notify the client that the animation finished
        if (animation.onDoneCallback) {
          animation.onDoneCallback(animation, animation.identifier);
        }
      }
    }
  }

  /**
   * Updates the given animation.
   * @function animate~updateAnimation
   * @param {ObjectPropertyAnimation|NumericAttributeAnimation|ColorAttributeAnimation} animation
   * An object representing the animation.
   * @param {number} currentTime The current time.
   * @returns {boolean} True if the animation is finished at this time.
   */
  function updateAnimation(animation, currentTime) {
    var animationFinished;

    if (animation instanceof ObjectPropertyAnimation) {
      animationFinished = updateObjectPropertyAnimation(animation, currentTime);
    } else if (animation instanceof NumericAttributeAnimation) {
      animationFinished = updateNumericAttributeAnimation(animation, currentTime);
    } else if (animation.startColor instanceof HSLAColor) {
      animationFinished = updateHSLAAttributeAnimation(animation, currentTime);
    } else if (animation.endColor instanceof RGBAColor) {
      animationFinished = updateRGBAAttributeAnimation(animation, currentTime);
    }

    return animationFinished;
  }

  /**
   * Updates the given object property animation.
   * @function animate~updateObjectPropertyAnimation
   * @param {ObjectPropertyAnimation} animation An object representing the animation.
   * @param {number} currentTime The current time.
   * @returns {boolean} True if the animation is finished at this time.
   */
  function updateObjectPropertyAnimation(animation, currentTime) {
    var deltaTime, animationFinished, progress, remaining;

    deltaTime = currentTime - animation.startTime;

    if (deltaTime < animation.duration) {
      progress = getEasedProgress(deltaTime, animation.duration, animation.easingFunction);
      remaining = 1 - progress;
      animation.currentValue = interpolate(animation.startValue, animation.endValue, remaining,
        progress);
      animationFinished = false;
    } else {
      animation.currentValue = animation.endValue;
      animationFinished = true;
    }

    animation.object[animation.property] = animation.currentValue;

    return animationFinished;
  }

  /**
   * Updates the given numeric attribute animation.
   * @function animate~updateNumericAttributeAnimation
   * @param {NumericAttributeAnimation} animation An object representing the animation.
   * @param {number} currentTime The current time.
   * @returns {boolean} True if the animation is finished at this time.
   */
  function updateNumericAttributeAnimation(animation, currentTime) {
    var deltaTime, animationFinished, progress, remaining;

    deltaTime = currentTime - animation.startTime;

    if (deltaTime < animation.duration) {
      progress = getEasedProgress(deltaTime, animation.duration, animation.easingFunction);
      remaining = 1 - progress;
      animation.currentValue = interpolate(animation.startValue, animation.endValue, remaining,
        progress);
      animationFinished = false;
    } else {
      animation.currentValue = animation.endValue;
      animationFinished = true;
    }

    animation.element.setAttribute(animation.attribute,
      animation.prefix + animation.currentValue + animation.suffix);

    return animationFinished;
  }

  /**
   * Updates the given HSLA attribute animation.
   * @function animate~updateHSLAAttributeAnimation
   * @param {ColorAttributeAnimation} animation An object representing the animation.
   * @param {number} currentTime The current time.
   * @returns {boolean} True if the animation is finished at this time.
   */
  function updateHSLAAttributeAnimation(animation, currentTime) {
    var deltaTime, animationFinished, h, s, l, a, progress, remaining;

    deltaTime = currentTime - animation.startTime;

    if (deltaTime < animation.duration) {
      progress = getEasedProgress(deltaTime, animation.duration, animation.easingFunction);
      remaining = 1 - progress;
      h = interpolate(animation.startColor.h, animation.endColor.h, remaining, progress);
      s = interpolate(animation.startColor.s, animation.endColor.s, remaining, progress);
      l = interpolate(animation.startColor.l, animation.endColor.l, remaining, progress);
      a = interpolate(animation.startColor.a, animation.endColor.a, remaining, progress);
      animation.currentColor = new HSLAColor(h, s, l, a);
      animationFinished = false;
    } else {
      animation.currentColor = animation.endColor;
      animationFinished = true;
    }

    animation.element.setAttribute(animation.attribute, hslaColorToString(animation.currentColor));

    return animationFinished;
  }

  /**
   * Updates the given RGBA attribute animation.
   * @function animate~updateRGBAAttributeAnimation
   * @param {ColorAttributeAnimation} animation An object representing the animation.
   * @param {number} currentTime The current time.
   * @returns {boolean} True if the animation is finished at this time.
   */
  function updateRGBAAttributeAnimation(animation, currentTime) {
    var deltaTime, animationFinished, r, g, b, a, progress, remaining;

    deltaTime = currentTime - animation.startTime;

    if (deltaTime < animation.duration) {
      progress = getEasedProgress(deltaTime, animation.duration, animation.easingFunction);
      remaining = 1 - progress;
      r = interpolate(animation.startColor.r, animation.endColor.r, remaining, progress);
      g = interpolate(animation.startColor.g, animation.endColor.g, remaining, progress);
      b = interpolate(animation.startColor.b, animation.endColor.b, remaining, progress);
      a = interpolate(animation.startColor.a, animation.endColor.a, remaining, progress);
      animation.currentColor = new RGBAColor(r, g, b, a);
      animationFinished = false;
    } else {
      animation.currentColor = animation.endColor;
      animationFinished = true;
    }

    animation.element.setAttribute(animation.attribute, rgbaColorToString(animation.currentColor));

    return animationFinished;
  }

  /**
   * Calculates an eased progress value.
   * @function animate~getEasedProgress
   * @param {number} deltaTime The elapsed time since the start of the animation.
   * @param {number} duration The duration of the animation.
   * @param {Function} easingFunction The easing function to use.
   * @returns {number} The eased progress value.
   */
  function getEasedProgress(deltaTime, duration, easingFunction) {
    return easingFunction(deltaTime / duration);
  }

  /**
   * Interpolates the given values using the given weights.
   * @function animate~interpolate
   * @param {number} value1 The first value.
   * @param {number} value2 The second value.
   * @param {number} weight1 The weight of the first value.
   * @param {number} weight2 The weight of the second value.
   * @returns {number} The interpolated value.
   */
  function interpolate(value1, value2, weight1, weight2) {
    return value1 * weight1 + value2 * weight2;
  }

  /**
   * Synchronizes all attributes/properties from the synchronization collection.
   * @function animate~refreshSynchronizations
   */
  function refreshSynchronizations() {
    currentSynchronizations.forEach(function(synchronization) {
      if (synchronization instanceof ObjectNumericPropertySync) {
        refreshNumericSynchronization(synchronization);
      } else if (synchronization instanceof ObjectHSLAColorPropertySync) {
        refreshHSLAColorSynchronization(synchronization);
      } else if (synchronization instanceof ObjectRGBAColorPropertySync) {
        refreshRGBAColorSynchronization(synchronization);
      }
    });
  }

  /**
   * Synchronizes the values represented by the given synchronization object.
   * @function animate~refreshNumericSynchronization
   * @param {ObjectNumericPropertySync} synchronization An object representing the synchronization.
   */
  function refreshNumericSynchronization(synchronization) {
    synchronization.element.setAttribute(
      synchronization.attribute,
      synchronization.prefix + synchronization.object[synchronization.property] +
        synchronization.suffix);
  }

  /**
   * Synchronizes the values represented by the given synchronization object.
   * @function animate~refreshHSLAColorSynchronization
   * @param {ObjectHSLAColorPropertySync} synchronization An object representing the
   * synchronization.
   */
  function refreshHSLAColorSynchronization(synchronization) {
    synchronization.element.setAttribute(
      synchronization.attribute,
      hslaColorToString(synchronization.object[synchronization.property]));
  }

  /**
   * Synchronizes the values represented by the given synchronization object.
   * @function animate~refreshRGBAColorSynchronization
   * @param {ObjectRGBAColorPropertySync} synchronization An object representing the
   * synchronization.
   */
  function refreshRGBAColorSynchronization(synchronization) {
    synchronization.element.setAttribute(
      synchronization.attribute,
      rgbaColorToString(synchronization.object[synchronization.property]));
  }

  // ------------------------------------------------------------------------------------------- //
  // Private classes

  /**
   * @constructor
   * @param {HTMLElement} element The element to animate.
   * @param {string} attribute The attribute to animate.
   * @param {number} startValue The value of the property at the start of the animation.
   * @param {number} endValue The value of the property at the end of the animation.
   * @param {number} startTime The time at which the animation starts.
   * @param {number} duration The duration of the animation.
   * @param {string} [prefix] A prefix to prepend to the numeric value.
   * @param {string} [suffix] A suffix to append to the numeric value.
   * @param {string} [easingFunction] The name of the easing function to use with this animation.
   * @param {Function} [onDoneCallback] A callback function to call when this animation has
   * finished. This callback will be given as arguments a reference to the animation object, and
   * whatever argument is passed to this constructor as the identifier parameter.
   * @param {*} [identifier] This will be passed as an argument to the onDoneCallback, and can
   * help the client to identify this particular animation.
   */
  function NumericAttributeAnimation(element, attribute, startValue, endValue, startTime,
                                     duration, prefix, suffix, easingFunction, onDoneCallback,
                                     identifier) {
    this.element = element;
    this.attribute = attribute;
    this.startValue = startValue;
    this.endValue = endValue;
    this.currentValue = startValue;
    this.startTime = startTime;
    this.duration = duration;
    this.prefix = prefix || '';
    this.suffix = suffix || '';
    this.easingFunction = typeof easingFunction === 'function' ?
      easingFunction : easingFunctions[easingFunction || 'linear'];
    this.onDoneCallback = onDoneCallback;
    this.identifier = identifier;
  }

  /**
   * @constructor
   * @param {HTMLElement} element The element to animate.
   * @param {string} attribute The attribute to animate.
   * @param {HSLAColor|RGBAColor} startColor The value of the property at the start of the
   * animation.
   * @param {HSLAColor|RGBAColor} endColor The value of the property at the end of the animation.
   * @param {number} startTime The time at which the animation starts.
   * @param {number} duration The duration of the animation.
   * @param {string} [easingFunction] The name of the easing function to use with this animation.
   * @param {Function} [onDoneCallback] A callback function to call when this animation has
   * finished. This callback will be given as arguments a reference to the animation object, and
   * whatever argument is passed to this constructor as the identifier parameter.
   * @param {*} [identifier] This will be passed as an argument to the onDoneCallback, and can
   * help the client to identify this particular animation.
   */
  function ColorAttributeAnimation(element, attribute, startColor, endColor, startTime, duration,
                                   easingFunction, onDoneCallback, identifier) {
    this.element = element;
    this.attribute = attribute;
    this.startColor = startColor;
    this.endColor = endColor;
    this.currentColor = startColor;
    this.startTime = startTime;
    this.duration = duration;
    this.easingFunction = typeof easingFunction === 'function' ?
      easingFunction : easingFunctions[easingFunction || 'linear'];
    this.onDoneCallback = onDoneCallback;
    this.identifier = identifier;
  }

  /**
   * @constructor
   * @param {object} object The object whose property this will animate.
   * @param {string} property The property to animate.
   * @param {number} startValue The value of the property at the start of the animation.
   * @param {number} endValue The value of the property at the end of the animation.
   * @param {number} startTime The time at which the animation starts.
   * @param {number} duration The duration of the animation.
   * @param {string} [easingFunction] The name of the easing function to use with this animation.
   * @param {Function} [onDoneCallback] A callback function to call when this animation has
   * finished. This callback will be given as arguments a reference to the animation object, and
   * whatever argument is passed to this constructor as the identifier parameter.
   * @param {*} [identifier] This will be passed as an argument to the onDoneCallback, and can
   * help the client to identify this particular animation.
   */
  function ObjectPropertyAnimation(object, property, startValue, endValue, startTime, duration,
                                   easingFunction, onDoneCallback, identifier) {
    this.object = object;
    this.property = property;
    this.startValue = startValue;
    this.endValue = endValue;
    this.currentValue = startValue;
    this.startTime = startTime;
    this.duration = duration;
    this.easingFunction = typeof easingFunction === 'function' ?
      easingFunction : easingFunctions[easingFunction || 'linear'];
    this.onDoneCallback = onDoneCallback;
    this.identifier = identifier;
  }

  /**
   * @constructor
   * @param {object} object The object whose property this will animate.
   * @param {string} property The property to animate.
   * @param {HTMLElement} element The element whose attribute will be kept in sync with the given
   * property.
   * @param {string} attribute The attribute to keep in sync with the given property.
   * @param {string} [prefix] A prefix to prepend to the attribute.
   * @param {string} [suffix] A suffix to append to the attribute.
   */
  function ObjectNumericPropertySync(object, property, element, attribute, prefix, suffix) {
    this.object = object;
    this.property = property;
    this.element = element;
    this.attribute = attribute;
    this.prefix = prefix || '';
    this.suffix = suffix || '';
  }

  /**
   * @constructor
   * @param {object} object The object whose property this will animate.
   * @param {string} property The property to animate.
   * @param {HTMLElement} element The element whose attribute will be kept in sync with the given
   * property.
   * @param {string} attribute The attribute to keep in sync with the given property.
   */
  function ObjectHSLAColorPropertySync(object, property, element, attribute) {
    this.object = object;
    this.property = property;
    this.element = element;
    this.attribute = attribute;
  }

  /**
   * @constructor
   * @param {object} object The object whose property this will animate.
   * @param {string} property The property to animate.
   * @param {HTMLElement} element The element whose attribute will be kept in sync with the given
   * property.
   * @param {string} attribute The attribute to keep in sync with the given property.
   */
  function ObjectRGBAColorPropertySync(object, property, element, attribute) {
    this.object = object;
    this.property = property;
    this.element = element;
    this.attribute = attribute;
  }

  // ------------------------------------------------------------------------------------------- //
  // Public static functions

  /**
   * Starts a new animation of the given numeric property for the given element.
   * @function animate.startNumericAttributeAnimation
   * @param {HTMLElement} element The element to animate.
   * @param {string} attribute The attribute to animate.
   * @param {number} startValue The value of the property at the start of the animation.
   * @param {number} endValue The value of the property at the end of the animation.
   * @param {number} startTime The time at which the animation starts.
   * @param {number} duration The duration of the animation.
   * @param {string} [prefix] A prefix to prepend to the numeric value.
   * @param {string} [suffix] A suffix to append to the numeric value.
   * @param {string} [easingFunction] The name of the easing function to use with this animation.
   * @param {Function} [onDoneCallback] A callback function to call when this animation has
   * finished.
   * @param {*} [identifier] This will be passed as an argument to the onDoneCallback, and can
   * help the client to identify this particular animation.
   * @returns {NumericAttributeAnimation} The animation object created for this new animation.
   */
  function startNumericAttributeAnimation(element, attribute, startValue, endValue, startTime,
                                          duration, prefix, suffix, easingFunction,
                                          onDoneCallback, identifier) {
    var animation = new NumericAttributeAnimation(element, attribute, startValue, endValue,
      startTime, duration, prefix, suffix, easingFunction, onDoneCallback, identifier);
    currentAnimations.push(animation);
    startAnimationLoop();
    return animation;
  }

  /**
   * Starts a new animation of the given HSLA color property for the given element.
   * @function animate.startHSLAColorAttributeAnimation
   * @param {HTMLElement} element The element to animate.
   * @param {string} attribute The attribute to animate.
   * @param {HSLAColor|RGBAColor} startColor The value of the property at the start of the
   * animation.
   * @param {HSLAColor|RGBAColor} endColor The value of the property at the end of the animation.
   * @param {number} startTime The time at which the animation starts.
   * @param {number} duration The duration of the animation.
   * @param {string} [easingFunction] The name of the easing function to use with this animation.
   * @param {Function} [onDoneCallback] A callback function to call when this animation has
   * finished.
   * @param {*} [identifier] This will be passed as an argument to the onDoneCallback, and can
   * help the client to identify this particular animation.
   * @returns {ColorAttributeAnimation} The animation object created for this new animation.
   */
  function startColorAttributeAnimation(element, attribute, startColor, endColor, startTime,
                                        duration, easingFunction, onDoneCallback, identifier) {
    var animation = new ColorAttributeAnimation(element, attribute, startColor, endColor,
      startTime, duration, easingFunction, onDoneCallback, identifier);
    currentAnimations.push(animation);
    startAnimationLoop();
    return animation;
  }

  /**
   * Stops the given animation. This will NOT result in the animation invoking its onDoneCallback.
   * @function animate.stopAnimation
   * @param {ObjectPropertyAnimation|NumericAttributeAnimation|ColorAttributeAnimation} animation
   * The object representing the animation to stop.
   * @returns {boolean} True if the given animation was found and stopped.
   */
  function stopAnimation(animation) {
    var i, count;
    for (i = 0, count = currentAnimations.length; i < count; i++) {
      if (currentAnimations[i] === animation) {
        currentAnimations.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  /**
   * Starts a new animation of the given numeric property for the given element.
   * @function animate.startNumericAttributeAnimation
   * @param {object} object The object whose property this will animate.
   * @param {string} property The property to animate.
   * @param {number} startValue The value of the property at the start of the animation.
   * @param {number} endValue The value of the property at the end of the animation.
   * @param {number} startTime The time at which the animation starts.
   * @param {number} duration The duration of the animation.
   * @param {string} [easingFunction] The name of the easing function to use with this animation.
   * @param {Function} [onDoneCallback] A callback function to call when this animation has
   * finished.
   * @param {*} [identifier] This will be passed as an argument to the onDoneCallback, and can
   * help the client to identify this particular animation.
   * @returns {ObjectPropertyAnimation} The animation object created for this new animation.
   */
  function startObjectPropertyAnimation(object, property, startValue, endValue, startTime,
                                        duration, easingFunction, onDoneCallback, identifier) {
    var animation = new ObjectPropertyAnimation(object, property, startValue, endValue, startTime,
      duration, easingFunction, onDoneCallback, identifier);
    currentAnimations.push(animation);
    startAnimationLoop();
    return animation;
  }

  /**
   * Informs the animation module to start synchronizing the given attribute of the given element
   * with the property of the given object. This synchronizing is helpful when there is a single
   * attribute value that actually consists of multiple component values, which could all be
   * animating independently and simultaneously--e.g., the r, g, and b components of a color value.
   * @function animate.startSyncingObjectNumericProperty
   * @param {object} object The object whose property is, supposedly, changing.
   * @param {string} property The property that is, supposedly, changing.
   * @param {HTMLElement} element The element whose attribute needs to be kept synchronized with
   * the given property.
   * @param {string} attribute The attribute that needs to be kept synchronized with the given
   * property.
   * @param {string} [prefix] A prefix to prepend to the attribute.
   * @param {string} [suffix] A suffix to append to the attribute.
   * @returns {ObjectNumericPropertySync} An object representing the synchronization. This can
   * be passed to the stopSyncingObjectProperty function to stop the synchronization.
   */
  function startSyncingObjectNumericProperty(object, property, element, attribute, prefix,
                                             suffix) {
    var synchronization = new ObjectNumericPropertySync(object, property, element, attribute,
      prefix, suffix);
    currentSynchronizations.push(synchronization);
    return synchronization;
  }

  /**
   * Informs the animation module to start synchronizing the given attribute of the given element
   * with the property of the given object. This synchronizing is helpful when there is a single
   * attribute value that actually consists of multiple component values, which could all be
   * animating independently and simultaneously--e.g., the r, g, and b components of a color value.
   * @function animate.startSyncingObjectHSLAColorProperty
   * @param {object} object The object whose property is, supposedly, changing.
   * @param {string} property The property that is, supposedly, changing.
   * @param {HTMLElement} element The element whose attribute needs to be kept synchronized with
   * the given property.
   * @param {string} attribute The attribute that needs to be kept synchronized with the given
   * property.
   * @returns {ObjectHSLAColorPropertySync} An object representing the synchronization. This can
   * be passed to the stopSyncingObjectProperty function to stop the synchronization.
   */
  function startSyncingObjectHSLAColorProperty(object, property, element, attribute) {
    var synchronization = new ObjectHSLAColorPropertySync(object, property, element, attribute);
    currentSynchronizations.push(synchronization);
    return synchronization;
  }

  /**
   * Informs the animation module to start synchronizing the given attribute of the given element
   * with the property of the given object. This synchronizing is helpful when there is a single
   * attribute value that actually consists of multiple component values, which could all be
   * animating independently and simultaneously--e.g., the r, g, and b components of a color value.
   * @function animate.startSyncingObjectRGBAColorProperty
   * @param {object} object The object whose property is, supposedly, changing.
   * @param {string} property The property that is, supposedly, changing.
   * @param {HTMLElement} element The element whose attribute needs to be kept synchronized with
   * the given property.
   * @param {string} attribute The attribute that needs to be kept synchronized with the given
   * property.
   * @returns {ObjectRGBAColorPropertySync} An object representing the synchronization. This can
   * be passed to the stopSyncingObjectProperty function to stop the synchronization.
   */
  function startSyncingObjectRGBAColorProperty(object, property, element, attribute) {
    var synchronization = new ObjectRGBAColorPropertySync(object, property, element, attribute);
    currentSynchronizations.push(synchronization);
    return synchronization;
  }

  /**
   * Stops the given object property synchronization.
   * @function animate.stopSyncingObjectProperty
   * @param {ObjectNumericPropertySync|ObjectHSLAColorPropertySync|ObjectRGBAColorPropertySync} synchronization
   * The object representing the synchronization to stop.
   * @returns {boolean} True if the given synchronization was found and stopped.
   */
  function stopSyncingObjectProperty(synchronization) {
    var i, count;
    for (i = 0, count = currentSynchronizations.length; i < count; i++) {
      if (currentSynchronizations[i] === synchronization) {
        currentSynchronizations.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  /**
   * Gets whether there are any current animations in progress.
   * @function animate.currentlyAnimating
   * @returns {boolean} True if there are current animations in progress.
   */
  function currentlyAnimating() {
    return currentAnimations.length > 0;
  }

  /**
   * A cross-browser compatible requestAnimationFrame.
   * @type {Function}
   */
  var requestAnimationFrame =
    window.requestAnimationFrame || // the standard
    window.webkitRequestAnimationFrame || // chrome/safari
    window.mozRequestAnimationFrame || // firefox
    window.oRequestAnimationFrame || // opera
    window.msRequestAnimationFrame || // ie
    function(callback) { // default
      window.setTimeout(callback, 16); // 60fps
    };

  /**
   * Creates a legal CSS string representation for the given HSLA color.
   * @function animate.hslaColorToString
   * @param {HSLAColor} color The HSLA color to get the string representation of.
   * @returns {string} The string representation of the given HSLA color.
   */
  function hslaColorToString(color) {
    return 'hsla(' + color.h + ',' + color.s + '%,' + color.l + '%,' + color.a + ')';
  }

  /**
   * Creates a legal CSS string representation for the given RGBA color.
   * @function animate.rgbaColorToString
   * @param {RGBAColor} color The RGBA color to get the string representation of.
   * @returns {string} The string representation of the given RGBA color.
   */
  function rgbaColorToString(color) {
    return 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + color.a + ')';
  }

  // ------------------------------------------------------------------------------------------- //
  // Public classes

  /**
   * @constructor
   * @param {number} h Hue value (from 0 to 360).
   * @param {number} s Saturation value (from 0 to 100).
   * @param {number} l Lightness value (from 0 to 100).
   * @param {number} [a=1] Alpha (opacity) value (from 0 to 1).
   */
  function HSLAColor(h, s, l, a) {
    this.h = h;
    this.s = s;
    this.l = l;
    this.a = typeof a !== 'undefined' ? a : 1;
  }

  /**
   * @constructor
   * @param {number} r Red color component (from 0 to 255).
   * @param {number} g Green color component (from 0 to 255).
   * @param {number} b Blue color component (from 0 to 255).
   * @param {number} [a=1] Alpha (opacity) value (from 0 to 1).
   */
  function RGBAColor(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = typeof a !== 'undefined' ? a : 1;
  }

  // ------------------------------------------------------------------------------------------- //
  // Expose this module

  /**
   * Exposes the static animate functions.
   * @global
   */
  animate = {
    startNumericAttributeAnimation: startNumericAttributeAnimation,
    startColorAttributeAnimation: startColorAttributeAnimation,
    startObjectPropertyAnimation: startObjectPropertyAnimation,
    stopAnimation: stopAnimation,
    startSyncingObjectNumericProperty: startSyncingObjectNumericProperty,
    startSyncingObjectHSLAColorProperty: startSyncingObjectHSLAColorProperty,
    startSyncingObjectRGBAColorProperty: startSyncingObjectRGBAColorProperty,
    stopSyncingObjectProperty: stopSyncingObjectProperty,
    currentlyAnimating: currentlyAnimating,
    hslaColorToString: hslaColorToString,
    rgbaColorToString: rgbaColorToString,
    HSLAColor: HSLAColor,
    RGBAColor: RGBAColor
  };

  // Expose this module
  if (!window.app) window.app = {};
  window.app.animate = animate;

  console.log('animate module loaded');
})();
