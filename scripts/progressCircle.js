/**
 * This module defines a constructor for ProgressCircle objects.
 * @module progressCircle
 */
(function() {
  // ------------------------------------------------------------------------------------------- //
  // Private static variables

  var DOT_COUNT = 11,

      DOT_REVOLUTION_PERIOD = 4000, // milliseconds per revolution
      COLOR_REVOLUTION_PERIOD = DOT_REVOLUTION_PERIOD * 0.3, // milliseconds per revolution
      RADIUS_PULSE_PERIOD = 3000, // milliseconds per pulse
      BRIGHTNESS_PULSE_PERIOD = 3000, // milliseconds per pulse
      WIND_DOWN_PERIOD = 500, // milliseconds to end spinning

      WIND_DOWN_REVOLUTION_DEG = 500000 / DOT_REVOLUTION_PERIOD, // degrees
      RADIUS_PULSE_INNER_RADIUS_RATIO = 0.8,
      BRIGHTNESS_PULSE_INNER_LIGHTNESS = 90, // from 0 to 100
      BRIGHTNESS_PULSE_OUTER_LIGHTNESS = 30, // from 0 to 100
      BRIGHTNESS_PULSE_INNER_SATURATION = 20, // from 0 to 100
      BRIGHTNESS_PULSE_OUTER_SATURATION = 90, // from 0 to 100
      DOT_OPACITY = 1;

  var SVG_NAMESPACE = 'http://www.w3.org/2000/svg',
      RADIUS_PULSE_HALF_PERIOD = RADIUS_PULSE_PERIOD * 0.5,
      BRIGHTNESS_PULSE_HALF_PERIOD = BRIGHTNESS_PULSE_PERIOD * 0.5;

  var animate;

  // ------------------------------------------------------------------------------------------- //
  // Private static functions

  /**
   * Starts the closing animation of the progress circle.
   * @function ProgressCircle#close
   */
  function close() {
    var startTime = Date.now();

    this.dots.forEach(function(dot) {
      var a;

      // Stop the original animations that conflict with the closing animations
      animate.stopAnimation(dot.animations.dotRevolution);
      animate.stopAnimation(dot.animations.radiusHalfPulseY);

      // Spin the dots faster for closing
      a = dot.animations.dotRevolution;
      dot.animations.dotRevolution = animate.startNumericAttributeAnimation(a.element,
        a.attribute, a.currentValue, a.currentValue + WIND_DOWN_REVOLUTION_DEG,
        startTime, WIND_DOWN_PERIOD, a.prefix, a.suffix, 'linear', null, dot);

      // Draw the balls inward and fade them away
      dot.animations.windDownShrink = animate.startNumericAttributeAnimation(dot.element,
        'cy', dot.animations.radiusHalfPulseY.currentValue, dot.progressCircleCenterY, startTime,
        WIND_DOWN_PERIOD, null, null, 'linear', onWindDownAnimationDone, dot);
      dot.animations.windDownFade = animate.startNumericAttributeAnimation(dot.element, 'opacity',
        1, 0, startTime, WIND_DOWN_PERIOD, null, null, 'linear', null, dot);
    });
  }

  /**
   * Creates all of the individual dots, which comprise this progress circle, and starts their
   * animations.
   * @function progressCircle~createDots
   * @param {HTMLElement} svgElement The SVG container element to add the DOM elements of these
   * dots to.
   * @param {number} dotCount The number of dots to create for this progress circle.
   * @param {number} left The left-side x-coordinate of the progress circle.
   * @param {number} top The top-side y-coordinate of the progress circle.
   * @param {number} diameter The diameter of the overall progress circle.
   * @param {number} dotRadius The radius to give the individual dots.
   * @returns {Array.<ProgressDot>} The dots that were just created.
   */
  function createDots(svgElement, dotCount, left, top, diameter, dotRadius) {
    var i, dots, angleDeg, dot, color, progressCircleCenterX, progressCircleCenterY,
      progressCircleRadius, dotBaseCenterX, dotBaseCenterY, dotInnerPulseCenterY,
      deltaAngleDeg, startTime;

    dots = [];
    deltaAngleDeg = 360 / dotCount;
    progressCircleRadius = diameter / 2;

    // Same for all of the dots
    progressCircleCenterX = left + progressCircleRadius;
    progressCircleCenterY = top + progressCircleRadius;
    dotBaseCenterX = left + progressCircleRadius;
    dotBaseCenterY = top + dotRadius;
    dotInnerPulseCenterY =
      dotBaseCenterY + (diameter - dotRadius) * (1 - RADIUS_PULSE_INNER_RADIUS_RATIO);
    startTime = Date.now();

    for (i = 0, angleDeg = 0; i < dotCount; i++, angleDeg += deltaAngleDeg) {
      color = new animate.HSLAColor(-angleDeg, 50, 50, DOT_OPACITY);

      // Create the new dot
      dot = new ProgressDot(svgElement, color, dotBaseCenterX, dotBaseCenterY,
        dotInnerPulseCenterY, dotRadius, angleDeg, progressCircleCenterY);
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
   * @param {number} startTime The start time of these animations.
   * @param {number} progressCircleCenterX The x-coordinate of the center of the parent progress circle.
   * @param {number} progressCircleCenterY The y-coordinate of the center of the parent progress circle.
   */
  function startAnimationsForDot(dot, startTime, progressCircleCenterX, progressCircleCenterY) {
    // Constant attributes
    dot.element.setAttribute('cx', dot.dotBaseCenterX);
    dot.element.setAttribute('r', dot.dotRadius);

    // Dot revolution
    dot.animations.dotRevolution = animate.startNumericAttributeAnimation(dot.element, 'transform',
      dot.revolutionAngleRad, dot.revolutionAngleRad + 360, startTime, DOT_REVOLUTION_PERIOD,
      'rotate(', ' ' + progressCircleCenterX + ' ' + progressCircleCenterY + ')', 'linear',
      onDotRevolutionDone, dot);

    // Color revolution
    dot.animations.colorRevolution = animate.startObjectPropertyAnimation(dot.color, 'h',
      dot.color.h, dot.color.h - 360, startTime, COLOR_REVOLUTION_PERIOD, 'linear',
      onColorRevolutionDone, dot);

    // Brightness pulse half cycle
    dot.animations.brightnessHalfPulseS = animate.startObjectPropertyAnimation(dot.color, 's',
      BRIGHTNESS_PULSE_OUTER_SATURATION, BRIGHTNESS_PULSE_INNER_SATURATION, startTime,
      BRIGHTNESS_PULSE_HALF_PERIOD, 'easeInQuint', null, dot);
    dot.animations.brightnessHalfPulseL = animate.startObjectPropertyAnimation(dot.color, 'l',
      BRIGHTNESS_PULSE_OUTER_LIGHTNESS, BRIGHTNESS_PULSE_INNER_LIGHTNESS, startTime,
      BRIGHTNESS_PULSE_HALF_PERIOD, 'easeInQuint', onBrightnessPulseHalfCycleDone, dot);

    // Radius pulse half cycle; start at outer radius and move to inner radius
    dot.animations.radiusHalfPulseY = animate.startNumericAttributeAnimation(dot.element, 'cy',
      dot.dotBaseCenterY, dot.dotInnerPulseCenterY, startTime, RADIUS_PULSE_HALF_PERIOD, null,
      null, 'easeInQuint', onRadiusPulseHalfCycleDone, dot);

    // Keep updating the color as the various animations separately change its components
    dot.colorSynchronization = animate.startSyncingObjectHSLAColorProperty(dot, 'color',
      dot.element, 'fill');
  }

  /**
   * Restarts the dot revolution animation. This is the callback for the dot revolution animation.
   * @function progressCircle~onDotRevolutionDone
   * @param {ObjectPropertyAnimation|NumericAttributeAnimation|ColorAttributeAnimation} animation
   * The old animation object that just finished.
   * @param {ProgressDot} dot The dot object that has been animating.
   */
  function onDotRevolutionDone(animation, dot) {
    dot.animations.dotRevolution = animate.startNumericAttributeAnimation(animation.element,
      animation.attribute, animation.startValue, animation.endValue,
      animation.startTime + animation.duration, animation.duration, animation.prefix,
      animation.suffix, animation.easingFunction, onDotRevolutionDone, dot);
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
    dot.animations.colorRevolution = animate.startObjectPropertyAnimation(animation.object,
      animation.property, animation.startValue, animation.endValue,
      animation.startTime + animation.duration, animation.duration, animation.easingFunction,
      onColorRevolutionDone, dot);
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

    if (animation.endValue === BRIGHTNESS_PULSE_INNER_LIGHTNESS) {
      // This is the end of an inward half cycle
      startValueS = BRIGHTNESS_PULSE_INNER_SATURATION;
      endValueS = BRIGHTNESS_PULSE_OUTER_SATURATION;
      startValueL = BRIGHTNESS_PULSE_INNER_LIGHTNESS;
      endValueL = BRIGHTNESS_PULSE_OUTER_LIGHTNESS;
      easingFunction = 'easeOutQuint';
    } else {
      // This is the end of an outward half cycle
      startValueS = BRIGHTNESS_PULSE_OUTER_SATURATION;
      endValueS = BRIGHTNESS_PULSE_INNER_SATURATION;
      startValueL = BRIGHTNESS_PULSE_OUTER_LIGHTNESS;
      endValueL = BRIGHTNESS_PULSE_INNER_LIGHTNESS;
      easingFunction = 'easeInQuint';
    }

    dot.animations.brightnessHalfPulseS = animate.startObjectPropertyAnimation(animation.object,
      's', startValueS, endValueS, animation.startTime + animation.duration,
      animation.duration, easingFunction, null, dot);
    dot.animations.brightnessHalfPulseL = animate.startObjectPropertyAnimation(animation.object,
      'l', startValueL, endValueL, animation.startTime + animation.duration,
      animation.duration, easingFunction, onBrightnessPulseHalfCycleDone, dot);
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
    var easingFunction = animation.startValue === dot.dotBaseCenterY ? 'easeOutQuint' : 'easeInQuint';
    dot.animations.radiusHalfPulseY = animate.startNumericAttributeAnimation(animation.element,
      animation.attribute, animation.endValue, animation.startValue,
      animation.startTime + animation.duration, animation.duration, animation.prefix,
      animation.suffix, easingFunction, onRadiusPulseHalfCycleDone, dot);
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

  // ------------------------------------------------------------------------------------------- //
  // Private classes

  /**
   * @constructor
   * @param {HTMLElement} svgElement The SVG container element to add the DOM element of this dot
   * to.
   * @param {HSLAColor|RGBAColor} color The color of the dot.
   * @param {number} dotBaseCenterX The center x-coordinate of the dot before any transformations
   * have occurred.
   * @param {number} dotBaseCenterY The center y-coordinate of the dot before any transformations
   * have occurred.
   * @param {number} dotInnerPulseCenterY The center y-coordinate of the dot after the shrinking
   * pulse animation has occurred.
   * @param {number} dotRadius The radius of the dot.
   * @param {number} revolutionAngleRad The initial rotation angle of the dot.
   * @param {number} progressCircleCenterY The y-coordinate of the center of the parent progress
   * circle.
   */
  function ProgressDot(svgElement, color, dotBaseCenterX, dotBaseCenterY, dotInnerPulseCenterY,
                       dotRadius, revolutionAngleRad, progressCircleCenterY) {

    this.svgElement = svgElement;
    this.element = document.createElementNS(SVG_NAMESPACE, 'circle');
    this.color = color;
    this.dotBaseCenterX = dotBaseCenterX;
    this.dotBaseCenterY = dotBaseCenterY;
    this.dotInnerPulseCenterY = dotInnerPulseCenterY;
    this.dotRadius = dotRadius;
    this.revolutionAngleRad = revolutionAngleRad;
    this.progressCircleCenterY = progressCircleCenterY;
    this.animations = {
      dotRevolution: null,
      colorRevolution: null,
      brightnessHalfPulseS: null,
      brightnessHalfPulseL: null,
      radiusHalfPulseY: null,
      windDownShrink: null,
      windDownFade: null
    };
    this.colorSynchronization = null;
  }

  // ------------------------------------------------------------------------------------------- //
  // Public static functions

  /**
   * Initializes some static state for this module.
   * @function ProgressCircle.initStaticFields
   */
  function initStaticFields() {
    animate = app.animate;
    console.log('progressCircle module initialized');
  }

  // ------------------------------------------------------------------------------------------- //
  // Expose this module's constructor

  /**
   * When the constructor is used to create a progress circle, the component elements are
   * automatically created and added to the DOM, and the animations are automatically started.
   * @constructor
   * @global
   * @param {HTMLElement} svgElement The SVG container element to add the elements of this
   * progress circle to.
   * @param {number} left The left-side x-coordinate of the progress circle.
   * @param {number} top The top-side y-coordinate of the progress circle.
   * @param {number} diameter The diameter of the overall progress circle.
   * @param {number} dotRadius The radius to give the individual dots.
   */
  function ProgressCircle(svgElement, left, top, diameter, dotRadius) {
    this.dots = createDots(svgElement, DOT_COUNT, left, top, diameter, dotRadius);
    this.close = close;
  }

  // Expose this module
  if (!window.app) window.app = {};
  window.app.ProgressCircle = ProgressCircle;
  ProgressCircle.initStaticFields = initStaticFields;

  console.log('progressCircle module loaded');
})();
