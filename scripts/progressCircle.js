/**
 * This module defines a constructor for ProgressCircle objects.
 * @module progressCircle
 */
(function () {
  // ------------------------------------------------------------------------------------------- //
  // Private static variables

  var params, util, log, animate;

  // ------------------------------------------------------------------------------------------- //
  // Private static functions

  /**
   * Creates the main DOM elements that form this progress circle, adds them to the DOM, and adds
   * them to the elements property of this progress circle.
   * @function progressCircle~createElements
   * @param {HTMLElement} parent The parent element that this progress circle is a descendant of.
   * @param {Number} containerSideLength The side length of the container.
   */
  function createElements(parent, containerSideLength) {
    var progressCircle, svg, percentDisplay;

    progressCircle = this;

    svg = document.createElementNS(params.SVG_NAMESPACE, 'svg');
    parent.appendChild(svg);

    percentDisplay = util.createElement('div', parent, null, ['percentDisplay']);
    percentDisplay.style.lineHeight = containerSideLength + 'px';

    progressCircle.elements = {
      svg: svg,
      percentDisplay: percentDisplay
    };
  }

  /**
   * Creates all of the individual dots, which comprise this progress circle, and starts their
   * animations.
   * @function progressCircle~createDots
   * @param {HTMLElement} svgElement The SVG container element to add the DOM elements of these
   * dots to.
   * @param {Number} dotCount The number of dots to create for this progress circle.
   * @param {Number} left The left-side x-coordinate of the progress circle.
   * @param {Number} top The top-side y-coordinate of the progress circle.
   * @param {Number} diameter The diameter of the overall progress circle.
   * @param {Number} dotRadius The radius to give the individual dots.
   * @returns {Array.<ProgressDot>} The dots that were just created.
   */
  function createDots(svgElement, dotCount, left, top, diameter, dotRadius) {
    var i, dots, angleDeg, dot, color, progressCircleCenterX, progressCircleCenterY, progressCircleRadius, dotBaseCenterX, dotBaseCenterY, dotInnerPulseCenterY, deltaAngleDeg, startTime;

    dots = [];
    deltaAngleDeg = 360 / dotCount;
    progressCircleRadius = diameter / 2;

    // Same for all of the dots
    progressCircleCenterX = left + progressCircleRadius;
    progressCircleCenterY = top + progressCircleRadius;
    dotBaseCenterX = left + progressCircleRadius;
    dotBaseCenterY = top + dotRadius;
    dotInnerPulseCenterY =
        dotBaseCenterY +
            (diameter - dotRadius) * (1 - params.PROGRESS_CIRCLE.RADIUS_PULSE_INNER_RADIUS_RATIO);
    startTime = Date.now();

    for (i = 0, angleDeg = 0; i < dotCount; i++, angleDeg += deltaAngleDeg) {
      color = new animate.HSLAColor(-angleDeg, 50, 50, params.PROGRESS_CIRCLE.DOT_OPACITY);

      // Create the new dot
      dot =
          new ProgressDot(svgElement, color, dotBaseCenterX, dotBaseCenterY, dotInnerPulseCenterY,
              dotRadius, angleDeg, progressCircleCenterY);
      startAnimationsForDot(dot, startTime, progressCircleCenterX, progressCircleCenterY);
      svgElement.appendChild(dot.element);
      dots.push(dot);
    }

    return dots;
  }

  /**
   * Start the animations for the given dot.
   * @function progressCircle~startAnimationsForDot
   * @param {ProgressDot} dot The dot to animate.
   * @param {Number} startTime The start time of these animations.
   * @param {Number} progressCircleCenterX The x-coordinate of the center of the parent progress circle.
   * @param {Number} progressCircleCenterY The y-coordinate of the center of the parent progress circle.
   */
  function startAnimationsForDot(dot, startTime, progressCircleCenterX, progressCircleCenterY) {
    // Constant attributes
    dot.element.setAttribute('cx', dot.dotBaseCenterX);
    dot.element.setAttribute('r', dot.dotRadius);

    // Dot revolution
    dot.animations.dotRevolution =
        animate.startNumericAttributeAnimation(dot.element, 'transform', dot.revolutionAngleRad,
            dot.revolutionAngleRad + 360, startTime, params.PROGRESS_CIRCLE.DOT_REVOLUTION_PERIOD,
            'rotate(', ' ' + progressCircleCenterX + ' ' + progressCircleCenterY + ')', 'linear',
            onDotRevolutionDone, dot);

    // Color revolution
    dot.animations.colorRevolution =
        animate.startObjectPropertyAnimation(dot.color, 'h', dot.color.h, dot.color.h - 360,
            startTime, params.PROGRESS_CIRCLE.COLOR_REVOLUTION_PERIOD, 'linear',
            onColorRevolutionDone, dot);

    // Brightness pulse half cycle
    dot.animations.brightnessHalfPulseS =
        animate.startObjectPropertyAnimation(dot.color, 's',
            params.PROGRESS_CIRCLE.BRIGHTNESS_PULSE_OUTER_SATURATION,
            params.PROGRESS_CIRCLE.BRIGHTNESS_PULSE_INNER_SATURATION, startTime,
            params.PROGRESS_CIRCLE.BRIGHTNESS_PULSE_HALF_PERIOD, 'easeInQuint', null, dot);
    dot.animations.brightnessHalfPulseL =
        animate.startObjectPropertyAnimation(dot.color, 'l',
            params.PROGRESS_CIRCLE.BRIGHTNESS_PULSE_OUTER_LIGHTNESS,
            params.PROGRESS_CIRCLE.BRIGHTNESS_PULSE_INNER_LIGHTNESS, startTime,
            params.PROGRESS_CIRCLE.BRIGHTNESS_PULSE_HALF_PERIOD, 'easeInQuint',
            onBrightnessPulseHalfCycleDone, dot);

    // Radius pulse half cycle; start at outer radius and move to inner radius
    dot.animations.radiusHalfPulseY =
        animate.startNumericAttributeAnimation(dot.element, 'cy', dot.dotBaseCenterY,
            dot.dotInnerPulseCenterY, startTime, params.PROGRESS_CIRCLE.RADIUS_PULSE_HALF_PERIOD,
            null, null, 'easeInQuint', onRadiusPulseHalfCycleDone, dot);

    // Keep updating the color as the various animations separately change its components
    dot.colorSynchronization =
        animate.startSyncingObjectHSLAColorProperty(dot, 'color', dot.element, 'fill');
  }

  /**
   * Restarts the dot revolution animation. This is the callback for the dot revolution animation.
   * @function progressCircle~onDotRevolutionDone
   * @param {ObjectPropertyAnimation|NumericAttributeAnimation|ColorAttributeAnimation} animation
   * The old animation object that just finished.
   * @param {ProgressDot} dot The dot object that has been animating.
   */
  function onDotRevolutionDone(animation, dot) {
    dot.animations.dotRevolution =
        animate.startNumericAttributeAnimation(animation.element, animation.attribute,
            animation.startValue, animation.endValue, animation.startTime + animation.duration,
            animation.duration, animation.prefix, animation.suffix, animation.easingFunction,
            onDotRevolutionDone, dot);
  }

  /**
   * Restarts the color revolution animation. This is the callback for the color revolution
   * animation.
   * @function progressCircle~onColorRevolutionDone
   * @param {ObjectPropertyAnimation|NumericAttributeAnimation|ColorAttributeAnimation} animation
   * The old animation object that just finished.
   * @param {ProgressDot} dot The dot object that has been animating.
   */
  function onColorRevolutionDone(animation, dot) {
    dot.animations.colorRevolution =
        animate.startObjectPropertyAnimation(animation.object, animation.property,
            animation.startValue, animation.endValue, animation.startTime + animation.duration,
            animation.duration, animation.easingFunction, onColorRevolutionDone, dot);
  }

  /**
   * Restarts the brightness half-pulse animation. This is the callback for the brightness half-
   * pulse animation.
   * @function progressCircle~onBrightnessPulseHalfCycleDone
   * @param {ObjectPropertyAnimation|NumericAttributeAnimation|ColorAttributeAnimation} animation
   * The old animation object that just finished.
   * @param {ProgressDot} dot The dot object that has been animating.
   */
  function onBrightnessPulseHalfCycleDone(animation, dot) {
    var startValueS, endValueS, startValueL, endValueL, easingFunction;

    if (animation.endValue === params.PROGRESS_CIRCLE.BRIGHTNESS_PULSE_INNER_LIGHTNESS) {
      // This is the end of an inward half cycle
      startValueS = params.PROGRESS_CIRCLE.BRIGHTNESS_PULSE_INNER_SATURATION;
      endValueS = params.PROGRESS_CIRCLE.BRIGHTNESS_PULSE_OUTER_SATURATION;
      startValueL = params.PROGRESS_CIRCLE.BRIGHTNESS_PULSE_INNER_LIGHTNESS;
      endValueL = params.PROGRESS_CIRCLE.BRIGHTNESS_PULSE_OUTER_LIGHTNESS;
      easingFunction = 'easeOutQuint';
    } else {
      // This is the end of an outward half cycle
      startValueS = params.PROGRESS_CIRCLE.BRIGHTNESS_PULSE_OUTER_SATURATION;
      endValueS = params.PROGRESS_CIRCLE.BRIGHTNESS_PULSE_INNER_SATURATION;
      startValueL = params.PROGRESS_CIRCLE.BRIGHTNESS_PULSE_OUTER_LIGHTNESS;
      endValueL = params.PROGRESS_CIRCLE.BRIGHTNESS_PULSE_INNER_LIGHTNESS;
      easingFunction = 'easeInQuint';
    }

    dot.animations.brightnessHalfPulseS =
        animate.startObjectPropertyAnimation(animation.object, 's', startValueS, endValueS,
            animation.startTime + animation.duration, animation.duration, easingFunction, null,
            dot);
    dot.animations.brightnessHalfPulseL =
        animate.startObjectPropertyAnimation(animation.object, 'l', startValueL, endValueL,
            animation.startTime + animation.duration, animation.duration, easingFunction,
            onBrightnessPulseHalfCycleDone, dot);
  }

  /**
   * Restarts the radius half-pulse animation. This is the callback for the radius half-pulse
   * animation.
   * @function progressCircle~onRadiusPulseHalfCycleDone
   * @param {ObjectPropertyAnimation|NumericAttributeAnimation|ColorAttributeAnimation} animation
   * The old animation object that just finished.
   * @param {ProgressDot} dot The dot object that has been animating.
   */
  function onRadiusPulseHalfCycleDone(animation, dot) {
    var easingFunction = animation.startValue === dot.dotBaseCenterY ? 'easeOutQuint' :
        'easeInQuint';
    dot.animations.radiusHalfPulseY =
        animate.startNumericAttributeAnimation(animation.element, animation.attribute,
            animation.endValue, animation.startValue, animation.startTime + animation.duration,
            animation.duration, animation.prefix, animation.suffix, easingFunction,
            onRadiusPulseHalfCycleDone, dot);
  }

  /**
   * Closes the given dot's animations and removes the dot from the DOM. This is the callback for
   * the wind-down animation.
   * @function progressCircle~onWindDownAnimationDone
   * @param {ObjectPropertyAnimation|NumericAttributeAnimation|ColorAttributeAnimation} animation
   * The old animation object that just finished.
   * @param {ProgressDot} dot The dot object that has been animating.
   */
  function onWindDownAnimationDone(animation, dot) {
    animate.stopAnimation(dot.animations.colorRevolution);
    animate.stopAnimation(dot.animations.brightnessHalfPulseS);
    animate.stopAnimation(dot.animations.brightnessHalfPulseL);
    animate.stopSyncingObjectProperty(dot.colorSynchronization);

    dot.svgElement.removeChild(dot.element);
  }

  /**
   * @function progressCircle~openPercentDisplay
   */
  function openPercentDisplay() {
    var progressCircle = this;

    if (!progressCircle.percentIsShown && progressCircle.showPercent) {
      progressCircle.percentIsShown = true;
      setElementVisibility(progressCircle.elements.percentDisplay, true, false, null);
    }
  }

  /**
   * @function progressCircle~closePercentDisplay
   */
  function closePercentDisplay() {
    var progressCircle = this;

    progressCircle.percentIsShown = false;
    setElementVisibility(progressCircle.elements.percentDisplay, false, false, null);
  }

  // ------------------------------------------------------------------------------------------- //
  // Private classes

  /**
   * @constructor
   * @param {HTMLElement} svgElement The SVG container element to add the DOM element of this dot
   * to.
   * @param {HSLAColor|RGBAColor} color The color of the dot.
   * @param {Number} dotBaseCenterX The center x-coordinate of the dot before any transformations
   * have occurred.
   * @param {Number} dotBaseCenterY The center y-coordinate of the dot before any transformations
   * have occurred.
   * @param {Number} dotInnerPulseCenterY The center y-coordinate of the dot after the shrinking
   * pulse animation has occurred.
   * @param {Number} dotRadius The radius of the dot.
   * @param {Number} revolutionAngleRad The initial rotation angle of the dot.
   * @param {Number} progressCircleCenterY The y-coordinate of the center of the parent progress
   * circle.
   */
  function ProgressDot(svgElement, color, dotBaseCenterX, dotBaseCenterY, dotInnerPulseCenterY,
                       dotRadius, revolutionAngleRad, progressCircleCenterY) {
    var progressDot = this;

    progressDot.svgElement = svgElement;
    progressDot.element = document.createElementNS(params.SVG_NAMESPACE, 'circle');
    progressDot.color = color;
    progressDot.dotBaseCenterX = dotBaseCenterX;
    progressDot.dotBaseCenterY = dotBaseCenterY;
    progressDot.dotInnerPulseCenterY = dotInnerPulseCenterY;
    progressDot.dotRadius = dotRadius;
    progressDot.revolutionAngleRad = revolutionAngleRad;
    progressDot.progressCircleCenterY = progressCircleCenterY;
    progressDot.animations = {
      dotRevolution: null,
      colorRevolution: null,
      brightnessHalfPulseS: null,
      brightnessHalfPulseL: null,
      radiusHalfPulseY: null,
      windDownShrink: null,
      windDownFade: null
    };
    progressDot.colorSynchronization = null;
  }

  // ------------------------------------------------------------------------------------------- //
  // Public static functions

  /**
   * Starts the animation of the progress circle.
   * @function progressCircle#open
   */
  function open() {
    var progressCircle = this;

    progressCircle.opacityAnimation =
        animate.startNumericStyleAnimation(progressCircle.elements.svg, 'opacity', 0, 1, null,
            params.PROGRESS_CIRCLE.OPEN_OPACITY_CHANGE_DURATION, null, null, 'easeInQuad', null,
            null);

    if (!progressCircle.dots) {
      progressCircle.dots =
          createDots(progressCircle.elements.svg, params.PROGRESS_CIRCLE.DOT_COUNT,
              progressCircle.left, progressCircle.top, progressCircle.diameter,
              progressCircle.dotRadius);
    }
  }

  /**
   * Starts the closing animation of the progress circle.
   * @function progressCircle#close
   */
  function close() {
    var progressCircle, startTime;

    progressCircle = this;
    startTime = Date.now();

    if (this.dots) {
      progressCircle.dots.forEach(function (dot) {
        var a;

        // Stop the original animations that conflict with the closing animations
        animate.stopAnimation(dot.animations.dotRevolution);
        animate.stopAnimation(dot.animations.radiusHalfPulseY);

        // Spin the dots faster for closing
        a = dot.animations.dotRevolution;
        dot.animations.dotRevolution =
            animate.startNumericAttributeAnimation(a.element, a.attribute, a.currentValue,
                a.currentValue + params.PROGRESS_CIRCLE.WIND_DOWN_REVOLUTION_DEG, startTime,
                params.PROGRESS_CIRCLE.WIND_DOWN_PERIOD, a.prefix, a.suffix, 'linear', null, dot);

        // Draw the balls inward and fade them away
        dot.animations.windDownShrink =
            animate.startNumericAttributeAnimation(dot.element, 'cy',
                dot.animations.radiusHalfPulseY.currentValue, dot.progressCircleCenterY, startTime,
                params.PROGRESS_CIRCLE.WIND_DOWN_PERIOD, null, null, 'linear',
                onWindDownAnimationDone, dot);
        dot.animations.windDownFade =
            animate.startNumericAttributeAnimation(dot.element, 'opacity', 1, 0, startTime,
                params.PROGRESS_CIRCLE.WIND_DOWN_PERIOD, null, null, 'linear', null, dot);
      });

      progressCircle.dots = null;
    }

    closePercentDisplay.call(progressCircle);
  }

  /**
   * @function progressCircle#updateProgress
   * @param {Number} progress
   */
  function updateProgress(progress) {
    var progressCircle, text;

    progressCircle = this;
    text = parseInt(progress * 100) + '%';

    progressCircle.elements.percentDisplay.innerHTML = text;

    openPercentDisplay.call(progressCircle);
  }

  // ------------------------------------------------------------------------------------------- //
  // Public static functions

  /**
   * Initializes some static state for this module.
   * @function progressCircle.initStaticFields
   */
  function initStaticFields() {
    params = app.params;
    util = app.util;
    log = new app.Log('progressCircle');
    animate = app.animate;
    log.d('initStaticFields', 'Module initialized');
  }

  /**
   * Adds or removes the hidden and visible classes from the given element, in order for it to be
   * visible or hidden, as specified. These two classes have corresponding CSS rules regarding
   * visibility and transitions.
   * @function progressCircle~setElementVisibility
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

  // ------------------------------------------------------------------------------------------- //
  // Expose this module's constructor

  /**
   * @constructor
   * @global
   * @param {HTMLElement} parent The container element to add the elements of this progress circle
   * to.
   * @param {Number} containerSideLength The side length of the container.
   * @param {Number} diameter The diameter of the overall progress circle.
   * @param {Number} dotRadius The radius to give the individual dots.
   * @param {Boolean} showPercent If true, then the progress percentage will be shown.
   */
  function ProgressCircle(parent, containerSideLength, diameter, dotRadius, showPercent) {
    var progressCircle = this;

    progressCircle.parent = parent;
    progressCircle.elements = null;
    progressCircle.showPercent = showPercent;
    progressCircle.left = (containerSideLength - diameter) / 2;
    progressCircle.top = (containerSideLength - diameter) / 2;
    progressCircle.diameter = diameter;
    progressCircle.dotRadius = dotRadius;
    progressCircle.dots = null;
    progressCircle.percentIsShown = false;
    progressCircle.open = open;
    progressCircle.close = close;
    progressCircle.updateProgress = updateProgress;
    progressCircle.opacityAnimation = null;

    createElements.call(progressCircle, parent, containerSideLength);
  }

  // Expose this module
  if (!window.app) window.app = {};
  window.app.ProgressCircle = ProgressCircle;
  ProgressCircle.initStaticFields = initStaticFields;

  console.log('progressCircle module loaded');
})();
