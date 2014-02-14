/**
 * This module defines a collection of static general animation functions.
 * @module animate
 */
(function () {
  // ------------------------------------------------------------------------------------------- //
  // Private static variables

  var DEFAULT_DURATION = 1000;

  var animate, params, util, log, currentlyLooping, currentAnimations, currentSynchronizations;

  currentAnimations = [];
  currentSynchronizations = [];

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
   * @param {Number} currentTime The current time.
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
   * @param {ObjectPropertyAnimation|NumericAttributeAnimation|ColorAttributeAnimation|NumericStyleAnimation|ColorStyleAnimation} animation
   * An object representing the animation.
   * @param {Number} currentTime The current time.
   * @returns {Boolean} True if the animation is finished at this time.
   */
  function updateAnimation(animation, currentTime) {
    var animationFinished, updateFunction;

    if (animation instanceof ObjectPropertyAnimation) {
      updateFunction = updateObjectPropertyAnimation;
    } else if (animation instanceof NumericAttributeAnimation) {
      updateFunction = updateNumericAttributeAnimation;
    } else if (animation instanceof NumericStyleAnimation) {
      updateFunction = updateNumericStyleAnimation;
    } else if (animation instanceof ColorAttributeAnimation) {
      if (animation.startColor instanceof HSLAColor) {
        updateFunction = updateHSLAAttributeAnimation;
      } else if (animation.endColor instanceof RGBAColor) {
        updateFunction = updateRGBAAttributeAnimation;
      }
    } else if (animation instanceof ColorStyleAnimation) {
      if (animation.startColor instanceof HSLAColor) {
        updateFunction = updateHSLAStyleAnimation;
      } else if (animation.endColor instanceof RGBAColor) {
        updateFunction = updateRGBAStyleAnimation;
      }
    }

    animationFinished = updateFunction(animation, currentTime);

    return animationFinished;
  }

  /**
   * Updates the given object property animation.
   * @function animate~updateObjectPropertyAnimation
   * @param {ObjectPropertyAnimation} animation An object representing the animation.
   * @param {Number} currentTime The current time.
   * @returns {Boolean} True if the animation is finished at this time.
   */
  function updateObjectPropertyAnimation(animation, currentTime) {
    var deltaTime, animationFinished, progress, remaining;

    deltaTime = currentTime - animation.startTime;

    if (deltaTime < animation.duration) {
      progress = util.getEasedProgress(deltaTime, animation.duration, animation.easingFunction);
      remaining = 1 - progress;
      animation.currentValue =
          util.interpolate(animation.startValue, animation.endValue, remaining, progress);
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
   * @param {Number} currentTime The current time.
   * @returns {Boolean} True if the animation is finished at this time.
   */
  function updateNumericAttributeAnimation(animation, currentTime) {
    var deltaTime, animationFinished, progress, remaining;

    deltaTime = currentTime - animation.startTime;

    if (deltaTime < animation.duration) {
      progress = util.getEasedProgress(deltaTime, animation.duration, animation.easingFunction);
      remaining = 1 - progress;
      animation.currentValue =
          util.interpolate(animation.startValue, animation.endValue, remaining, progress);
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
   * @param {Number} currentTime The current time.
   * @returns {Boolean} True if the animation is finished at this time.
   */
  function updateHSLAAttributeAnimation(animation, currentTime) {
    var deltaTime, animationFinished, h, s, l, a, progress, remaining;

    deltaTime = currentTime - animation.startTime;

    if (deltaTime < animation.duration) {
      progress = util.getEasedProgress(deltaTime, animation.duration, animation.easingFunction);
      remaining = 1 - progress;
      h = util.interpolate(animation.startColor.h, animation.endColor.h, remaining, progress);
      s = util.interpolate(animation.startColor.s, animation.endColor.s, remaining, progress);
      l = util.interpolate(animation.startColor.l, animation.endColor.l, remaining, progress);
      a = util.interpolate(animation.startColor.a, animation.endColor.a, remaining, progress);
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
   * @param {Number} currentTime The current time.
   * @returns {Boolean} True if the animation is finished at this time.
   */
  function updateRGBAAttributeAnimation(animation, currentTime) {
    var deltaTime, animationFinished, r, g, b, a, progress, remaining;

    deltaTime = currentTime - animation.startTime;

    if (deltaTime < animation.duration) {
      progress = util.getEasedProgress(deltaTime, animation.duration, animation.easingFunction);
      remaining = 1 - progress;
      r = util.interpolate(animation.startColor.r, animation.endColor.r, remaining, progress);
      g = util.interpolate(animation.startColor.g, animation.endColor.g, remaining, progress);
      b = util.interpolate(animation.startColor.b, animation.endColor.b, remaining, progress);
      a = util.interpolate(animation.startColor.a, animation.endColor.a, remaining, progress);
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
   * Updates the given numeric style property animation.
   * @function animate~updateNumericStyleAnimation
   * @param {NumericStyleAnimation} animation An object representing the animation.
   * @param {Number} currentTime The current time.
   * @returns {Boolean} True if the animation is finished at this time.
   */
  function updateNumericStyleAnimation(animation, currentTime) {
    var deltaTime, animationFinished, progress, remaining;

    deltaTime = currentTime - animation.startTime;

    if (deltaTime < animation.duration) {
      progress = util.getEasedProgress(deltaTime, animation.duration, animation.easingFunction);
      remaining = 1 - progress;
      animation.currentValue =
          util.interpolate(animation.startValue, animation.endValue, remaining, progress);
      animationFinished = false;
    } else {
      animation.currentValue = animation.endValue;
      animationFinished = true;
    }

    animation.element.style[animation.property] =
        animation.prefix + animation.currentValue + animation.suffix;

    return animationFinished;
  }

  /**
   * Updates the given HSLA style property animation.
   * @function animate~updateHSLAStyleAnimation
   * @param {ColorStyleAnimation} animation An object representing the animation.
   * @param {Number} currentTime The current time.
   * @returns {Boolean} True if the animation is finished at this time.
   */
  function updateHSLAStyleAnimation(animation, currentTime) {
    var deltaTime, animationFinished, h, s, l, a, progress, remaining;

    deltaTime = currentTime - animation.startTime;

    if (deltaTime < animation.duration) {
      progress = util.getEasedProgress(deltaTime, animation.duration, animation.easingFunction);
      remaining = 1 - progress;
      h = util.interpolate(animation.startColor.h, animation.endColor.h, remaining, progress);
      s = util.interpolate(animation.startColor.s, animation.endColor.s, remaining, progress);
      l = util.interpolate(animation.startColor.l, animation.endColor.l, remaining, progress);
      a = util.interpolate(animation.startColor.a, animation.endColor.a, remaining, progress);
      animation.currentColor = new HSLAColor(h, s, l, a);
      animationFinished = false;
    } else {
      animation.currentColor = animation.endColor;
      animationFinished = true;
    }

    animation.element.style[animation.property] = hslaColorToString(animation.currentColor);

    return animationFinished;
  }

  /**
   * Updates the given RGBA style property animation.
   * @function animate~updateRGBAStyleAnimation
   * @param {ColorStyleAnimation} animation An object representing the animation.
   * @param {Number} currentTime The current time.
   * @returns {Boolean} True if the animation is finished at this time.
   */
  function updateRGBAStyleAnimation(animation, currentTime) {
    var deltaTime, animationFinished, r, g, b, a, progress, remaining;

    deltaTime = currentTime - animation.startTime;

    if (deltaTime < animation.duration) {
      progress = util.getEasedProgress(deltaTime, animation.duration, animation.easingFunction);
      remaining = 1 - progress;
      r = util.interpolate(animation.startColor.r, animation.endColor.r, remaining, progress);
      g = util.interpolate(animation.startColor.g, animation.endColor.g, remaining, progress);
      b = util.interpolate(animation.startColor.b, animation.endColor.b, remaining, progress);
      a = util.interpolate(animation.startColor.a, animation.endColor.a, remaining, progress);
      animation.currentColor = new RGBAColor(r, g, b, a);
      animationFinished = false;
    } else {
      animation.currentColor = animation.endColor;
      animationFinished = true;
    }

    animation.element.style[animation.property] = rgbaColorToString(animation.currentColor);

    return animationFinished;
  }

  /**
   * Synchronizes all attributes/properties from the synchronization collection.
   * @function animate~refreshSynchronizations
   */
  function refreshSynchronizations() {
    currentSynchronizations.forEach(function (synchronization) {
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
    synchronization.element.setAttribute(synchronization.attribute,
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
    synchronization.element.setAttribute(synchronization.attribute,
        hslaColorToString(synchronization.object[synchronization.property]));
  }

  /**
   * Synchronizes the values represented by the given synchronization object.
   * @function animate~refreshRGBAColorSynchronization
   * @param {ObjectRGBAColorPropertySync} synchronization An object representing the
   * synchronization.
   */
  function refreshRGBAColorSynchronization(synchronization) {
    synchronization.element.setAttribute(synchronization.attribute,
        rgbaColorToString(synchronization.object[synchronization.property]));
  }

  // ------------------------------------------------------------------------------------------- //
  // Private classes

  /**
   * @constructor
   * @param {HTMLElement} element The element to animate.
   * @param {String} attribute The attribute to animate.
   * @param {Number} startValue The value of the attribute at the start of the animation.
   * @param {Number} endValue The value of the attribute at the end of the animation.
   * @param {Number} [startTime] The time at which the animation starts.
   * @param {Number} [duration] The duration of the animation.
   * @param {String} [prefix] A prefix to prepend to the numeric value.
   * @param {String} [suffix] A suffix to append to the numeric value.
   * @param {String} [easingFunction] The name of the easing function to use with this animation.
   * @param {Function} [onDoneCallback] A callback function to call when this animation has
   * finished. This callback will be given as arguments a reference to the animation object, and
   * whatever argument is passed to this constructor as the identifier parameter.
   * @param {*} [identifier] This will be passed as an argument to the onDoneCallback, and can
   * help the client to identify this particular animation.
   */
  function NumericAttributeAnimation(element, attribute, startValue, endValue, startTime, duration,
                                     prefix, suffix, easingFunction, onDoneCallback, identifier) {
    this.element = element;
    this.attribute = attribute;
    this.startValue = startValue;
    this.endValue = endValue;
    this.currentValue = startValue;
    this.startTime = startTime || Date.now();
    this.duration = duration || DEFAULT_DURATION;
    this.prefix = prefix || '';
    this.suffix = suffix || '';
    this.easingFunction =
        typeof easingFunction === 'function' ? easingFunction :
            util.getEasingFunction(easingFunction);
    this.onDoneCallback = onDoneCallback;
    this.identifier = identifier;
  }

  /**
   * @constructor
   * @param {HTMLElement} element The element to animate.
   * @param {String} attribute The attribute to animate.
   * @param {HSLAColor|RGBAColor} startColor The value of the attribute at the start of the
   * animation.
   * @param {HSLAColor|RGBAColor} endColor The value of the attribute at the end of the animation.
   * @param {Number} [startTime] The time at which the animation starts.
   * @param {Number} [duration] The duration of the animation.
   * @param {String} [easingFunction] The name of the easing function to use with this animation.
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
    this.startTime = startTime || Date.now();
    this.duration = duration || DEFAULT_DURATION;
    this.easingFunction =
        typeof easingFunction === 'function' ? easingFunction :
            util.getEasingFunction(easingFunction);
    this.onDoneCallback = onDoneCallback;
    this.identifier = identifier;
  }

  /**
   * @constructor
   * @param {HTMLElement} element The element to animate.
   * @param {String} property The style property to animate.
   * @param {Number} startValue The value of the property at the start of the animation.
   * @param {Number} endValue The value of the property at the end of the animation.
   * @param {Number} [startTime] The time at which the animation starts.
   * @param {Number} [duration] The duration of the animation.
   * @param {String} [prefix] A prefix to prepend to the numeric value.
   * @param {String} [suffix] A suffix to append to the numeric value.
   * @param {String} [easingFunction] The name of the easing function to use with this animation.
   * @param {Function} [onDoneCallback] A callback function to call when this animation has
   * finished. This callback will be given as arguments a reference to the animation object, and
   * whatever argument is passed to this constructor as the identifier parameter.
   * @param {*} [identifier] This will be passed as an argument to the onDoneCallback, and can
   * help the client to identify this particular animation.
   */
  function NumericStyleAnimation(element, property, startValue, endValue, startTime, duration,
                                 prefix, suffix, easingFunction, onDoneCallback, identifier) {
    this.element = element;
    this.property = property;
    this.startValue = startValue;
    this.endValue = endValue;
    this.currentValue = startValue;
    this.startTime = startTime || Date.now();
    this.duration = duration || DEFAULT_DURATION;
    this.prefix = prefix || '';
    this.suffix = suffix || '';
    this.easingFunction =
        typeof easingFunction === 'function' ? easingFunction :
            util.getEasingFunction(easingFunction);
    this.onDoneCallback = onDoneCallback;
    this.identifier = identifier;
  }

  /**
   * @constructor
   * @param {HTMLElement} element The element to animate.
   * @param {String} property The style property to animate.
   * @param {HSLAColor|RGBAColor} startColor The value of the property at the start of the
   * animation.
   * @param {HSLAColor|RGBAColor} endColor The value of the property at the end of the animation.
   * @param {Number} [startTime] The time at which the animation starts.
   * @param {Number} [duration] The duration of the animation.
   * @param {String} [easingFunction] The name of the easing function to use with this animation.
   * @param {Function} [onDoneCallback] A callback function to call when this animation has
   * finished. This callback will be given as arguments a reference to the animation object, and
   * whatever argument is passed to this constructor as the identifier parameter.
   * @param {*} [identifier] This will be passed as an argument to the onDoneCallback, and can
   * help the client to identify this particular animation.
   */
  function ColorStyleAnimation(element, property, startColor, endColor, startTime, duration,
                               easingFunction, onDoneCallback, identifier) {
    this.element = element;
    this.property = property;
    this.startColor = startColor;
    this.endColor = endColor;
    this.currentColor = startColor;
    this.startTime = startTime || Date.now();
    this.duration = duration || DEFAULT_DURATION;
    this.easingFunction =
        typeof easingFunction === 'function' ? easingFunction :
            util.getEasingFunction(easingFunction);
    this.onDoneCallback = onDoneCallback;
    this.identifier = identifier;
  }

  /**
   * @constructor
   * @param {object} object The object whose property this will animate.
   * @param {String} property The property to animate.
   * @param {Number} startValue The value of the property at the start of the animation.
   * @param {Number} endValue The value of the property at the end of the animation.
   * @param {Number} [startTime] The time at which the animation starts.
   * @param {Number} [duration] The duration of the animation.
   * @param {String} [easingFunction] The name of the easing function to use with this animation.
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
    this.startTime = startTime || Date.now();
    this.duration = duration || DEFAULT_DURATION;
    this.easingFunction =
        typeof easingFunction === 'function' ? easingFunction :
            util.getEasingFunction(easingFunction);
    this.onDoneCallback = onDoneCallback;
    this.identifier = identifier;
  }

  /**
   * @constructor
   * @param {object} object The object whose property this will animate.
   * @param {String} property The property to animate.
   * @param {HTMLElement} element The element whose attribute will be kept in sync with the given
   * property.
   * @param {String} attribute The attribute to keep in sync with the given property.
   * @param {String} [prefix] A prefix to prepend to the attribute.
   * @param {String} [suffix] A suffix to append to the attribute.
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
   * @param {String} property The property to animate.
   * @param {HTMLElement} element The element whose attribute will be kept in sync with the given
   * property.
   * @param {String} attribute The attribute to keep in sync with the given property.
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
   * @param {String} property The property to animate.
   * @param {HTMLElement} element The element whose attribute will be kept in sync with the given
   * property.
   * @param {String} attribute The attribute to keep in sync with the given property.
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
   * Initializes some static state for this module.
   * @function animate.init
   */
  function init() {
    params = app.params;
    util = app.util;
    log = new app.Log('animate');
    log.d('init', 'Module initialized');
  }

  /**
   * Starts a new animation of the given numeric attribute for the given DOM element.
   * @function animate.startNumericAttributeAnimation
   * @param {HTMLElement} element The element to animate.
   * @param {String} attribute The attribute to animate.
   * @param {Number} startValue The value of the attribute at the start of the animation.
   * @param {Number} endValue The value of the attribute at the end of the animation.
   * @param {Number} [startTime] The time at which the animation starts.
   * @param {Number} [duration] The duration of the animation.
   * @param {String} [prefix] A prefix to prepend to the numeric value.
   * @param {String} [suffix] A suffix to append to the numeric value.
   * @param {String} [easingFunction] The name of the easing function to use with this animation.
   * @param {Function} [onDoneCallback] A callback function to call when this animation has
   * finished.
   * @param {*} [identifier] This will be passed as an argument to the onDoneCallback, and can
   * help the client to identify this particular animation.
   * @returns {NumericAttributeAnimation} The animation object created for this new animation.
   */
  function startNumericAttributeAnimation(element, attribute, startValue, endValue, startTime,
                                          duration, prefix, suffix, easingFunction, onDoneCallback,
                                          identifier) {
    var animation = new NumericAttributeAnimation(element, attribute, startValue, endValue,
        startTime, duration, prefix, suffix, easingFunction, onDoneCallback, identifier);
    currentAnimations.push(animation);
    startAnimationLoop();
    return animation;
  }

  /**
   * Starts a new animation of the given HSLA color attribute for the given DOM element.
   * @function animate.startHSLAColorAttributeAnimation
   * @param {HTMLElement} element The element to animate.
   * @param {String} attribute The attribute to animate.
   * @param {HSLAColor|RGBAColor} startColor The value of the attribute at the start of the
   * animation.
   * @param {HSLAColor|RGBAColor} endColor The value of the attribute at the end of the animation.
   * @param {Number} [startTime] The time at which the animation starts.
   * @param {Number} [duration] The duration of the animation.
   * @param {String} [easingFunction] The name of the easing function to use with this animation.
   * @param {Function} [onDoneCallback] A callback function to call when this animation has
   * finished.
   * @param {*} [identifier] This will be passed as an argument to the onDoneCallback, and can
   * help the client to identify this particular animation.
   * @returns {ColorAttributeAnimation} The animation object created for this new animation.
   */
  function startColorAttributeAnimation(element, attribute, startColor, endColor, startTime,
                                        duration, easingFunction, onDoneCallback, identifier) {
    var animation = new ColorAttributeAnimation(element, attribute, startColor, endColor, startTime,
        duration, easingFunction, onDoneCallback, identifier);
    currentAnimations.push(animation);
    startAnimationLoop();
    return animation;
  }

  /**
   * Starts a new animation of the given numeric style property for the given element.
   * @function animate.startNumericStyleAnimation
   * @param {HTMLElement} element The element to animate.
   * @param {String} property The style property to animate.
   * @param {Number} startValue The value of the property at the start of the animation.
   * @param {Number} endValue The value of the property at the end of the animation.
   * @param {Number} [startTime] The time at which the animation starts.
   * @param {Number} [duration] The duration of the animation.
   * @param {String} [prefix] A prefix to prepend to the numeric value.
   * @param {String} [suffix] A suffix to append to the numeric value.
   * @param {String} [easingFunction] The name of the easing function to use with this animation.
   * @param {Function} [onDoneCallback] A callback function to call when this animation has
   * finished.
   * @param {*} [identifier] This will be passed as an argument to the onDoneCallback, and can
   * help the client to identify this particular animation.
   * @returns {NumericStyleAnimation} The animation object created for this new animation.
   */
  function startNumericStyleAnimation(element, property, startValue, endValue, startTime, duration,
                                      prefix, suffix, easingFunction, onDoneCallback, identifier) {
    var animation = new NumericStyleAnimation(element, property, startValue, endValue, startTime,
        duration, prefix, suffix, easingFunction, onDoneCallback, identifier);
    currentAnimations.push(animation);
    startAnimationLoop();
    return animation;
  }

  /**
   * Starts a new animation of the given HSLA color style property for the given element.
   * @function animate.startColorStyleAnimation
   * @param {HTMLElement} element The element to animate.
   * @param {String} property The style property to animate.
   * @param {HSLAColor|RGBAColor} startColor The value of the property at the start of the
   * animation.
   * @param {HSLAColor|RGBAColor} endColor The value of the property at the end of the animation.
   * @param {Number} [startTime] The time at which the animation starts.
   * @param {Number} [duration] The duration of the animation.
   * @param {String} [easingFunction] The name of the easing function to use with this animation.
   * @param {Function} [onDoneCallback] A callback function to call when this animation has
   * finished.
   * @param {*} [identifier] This will be passed as an argument to the onDoneCallback, and can
   * help the client to identify this particular animation.
   * @returns {ColorStyleAnimation} The animation object created for this new animation.
   */
  function startColorStyleAnimation(element, property, startColor, endColor, startTime, duration,
                                    easingFunction, onDoneCallback, identifier) {
    var animation = new ColorStyleAnimation(element, property, startColor, endColor, startTime,
        duration, easingFunction, onDoneCallback, identifier);
    currentAnimations.push(animation);
    startAnimationLoop();
    return animation;
  }

  /**
   * Starts a new animation of the given numeric property for the given element.
   * @function animate.startNumericAttributeAnimation
   * @param {object} object The object whose property this will animate.
   * @param {String} property The property to animate.
   * @param {Number} startValue The value of the property at the start of the animation.
   * @param {Number} endValue The value of the property at the end of the animation.
   * @param {Number} [startTime] The time at which the animation starts.
   * @param {Number} [duration] The duration of the animation.
   * @param {String} [easingFunction] The name of the easing function to use with this animation.
   * @param {Function} [onDoneCallback] A callback function to call when this animation has
   * finished.
   * @param {*} [identifier] This will be passed as an argument to the onDoneCallback, and can
   * help the client to identify this particular animation.
   * @returns {ObjectPropertyAnimation} The animation object created for this new animation.
   */
  function startObjectPropertyAnimation(object, property, startValue, endValue, startTime, duration,
                                        easingFunction, onDoneCallback, identifier) {
    var animation = new ObjectPropertyAnimation(object, property, startValue, endValue, startTime,
        duration, easingFunction, onDoneCallback, identifier);
    currentAnimations.push(animation);
    startAnimationLoop();
    return animation;
  }

  /**
   * Stops the given animation. This will NOT result in the animation invoking its onDoneCallback.
   * @function animate.stopAnimation
   * @param {ObjectPropertyAnimation|NumericAttributeAnimation|ColorAttributeAnimation} animation
   * The object representing the animation to stop.
   * @returns {Boolean} True if the given animation was found and stopped.
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
   * Informs the animation module to start synchronizing the given attribute of the given element
   * with the property of the given object. This synchronizing is helpful when there is a single
   * attribute value that actually consists of multiple component values, which could all be
   * animating independently and simultaneously--e.g., the r, g, and b components of a color value.
   * @function animate.startSyncingObjectNumericProperty
   * @param {object} object The object whose property is, supposedly, changing.
   * @param {String} property The property that is, supposedly, changing.
   * @param {HTMLElement} element The element whose attribute needs to be kept synchronized with
   * the given property.
   * @param {String} attribute The attribute that needs to be kept synchronized with the given
   * property.
   * @param {String} [prefix] A prefix to prepend to the attribute.
   * @param {String} [suffix] A suffix to append to the attribute.
   * @returns {ObjectNumericPropertySync} An object representing the synchronization. This can
   * be passed to the stopSyncingObjectProperty function to stop the synchronization.
   */
  function startSyncingObjectNumericProperty(object, property, element, attribute, prefix, suffix) {
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
   * @param {String} property The property that is, supposedly, changing.
   * @param {HTMLElement} element The element whose attribute needs to be kept synchronized with
   * the given property.
   * @param {String} attribute The attribute that needs to be kept synchronized with the given
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
   * @param {String} property The property that is, supposedly, changing.
   * @param {HTMLElement} element The element whose attribute needs to be kept synchronized with
   * the given property.
   * @param {String} attribute The attribute that needs to be kept synchronized with the given
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
   * @returns {Boolean} True if the given synchronization was found and stopped.
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
   * @returns {Boolean} True if there are current animations in progress.
   */
  function currentlyAnimating() {
    return currentAnimations.length > 0;
  }

  /**
   * A cross-browser compatible requestAnimationFrame.
   * @type {Function}
   */
  var requestAnimationFrame = window.requestAnimationFrame || // the standard
      window.webkitRequestAnimationFrame || // chrome/safari
      window.mozRequestAnimationFrame || // firefox
      window.oRequestAnimationFrame || // opera
      window.msRequestAnimationFrame || // ie
      function (callback) { // default
        window.setTimeout(callback, 16); // 60fps
      };

  /**
   * Creates a legal CSS string representation for the given HSLA color.
   * @function animate.hslaColorToString
   * @param {HSLAColor} color The HSLA color to get the string representation of.
   * @returns {String} The string representation of the given HSLA color.
   */
  function hslaColorToString(color) {
    return 'hsla(' + color.h + ',' + color.s + '%,' + color.l + '%,' + color.a + ')';
  }

  /**
   * Creates a legal CSS string representation for the given RGBA color.
   * @function animate.rgbaColorToString
   * @param {RGBAColor} color The RGBA color to get the string representation of.
   * @returns {String} The string representation of the given RGBA color.
   */
  function rgbaColorToString(color) {
    return 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + color.a + ')';
  }

  // ------------------------------------------------------------------------------------------- //
  // Public classes

  /**
   * @constructor
   * @param {Number} h Hue value (from 0 to 360).
   * @param {Number} s Saturation value (from 0 to 100).
   * @param {Number} l Lightness value (from 0 to 100).
   * @param {Number} [a=1] Alpha (opacity) value (from 0 to 1).
   */
  function HSLAColor(h, s, l, a) {
    this.h = h;
    this.s = s;
    this.l = l;
    this.a = typeof a !== 'undefined' ? a : 1;
  }

  /**
   * @constructor
   * @param {Number} r Red color component (from 0 to 255).
   * @param {Number} g Green color component (from 0 to 255).
   * @param {Number} b Blue color component (from 0 to 255).
   * @param {Number} [a=1] Alpha (opacity) value (from 0 to 1).
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
    init: init,
    startNumericAttributeAnimation: startNumericAttributeAnimation,
    startColorAttributeAnimation: startColorAttributeAnimation,
    startNumericStyleAnimation: startNumericStyleAnimation,
    startColorStyleAnimation: startColorStyleAnimation,
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
