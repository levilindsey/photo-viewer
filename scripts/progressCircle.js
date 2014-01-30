/**
 * This module defines a constructor for ProgressCircle objects.
 * @module progressCircle
 */
(function() {
  // ------------------------------------------------------------------------------------------- //
  // Private static variables

  // TODO: use these
  var DOT_COUNT = 3,

      DOT_REVOLUTION_PERIOD = 500, // milliseconds per revolution
      COLOR_REVOLUTION_PERIOD = 450, // milliseconds per revolution
      RADIUS_PULSE_PERIOD = 4000, // milliseconds per pulse
      BRIGHTNESS_PULSE_PERIOD = 4000, // milliseconds per pulse
      WIND_DOWN_PERIOD = 500, // milliseconds to end spinning

      RADIUS_PULSE_INNER_RADIUS_RATIO = 0.5,
      BRIGHTNESS_PULSE_INNER_LIGHTNESS = 90, // from 0 to 100
      BRIGHTNESS_PULSE_OUTER_LIGHTNESS = 20, // from 0 to 100
      BRIGHTNESS_PULSE_INNER_SATURATION = 80, // from 0 to 100
      BRIGHTNESS_PULSE_OUTER_SATURATION = 30, // from 0 to 100
      DOT_OPACITY = 1;

  var SVG_NAMESPACE = 'http://www.w3.org/2000/svg',
      TWO_PI = Math.PI * 2,
      RADIUS_PULSE_HALF_PERIOD = RADIUS_PULSE_PERIOD * 0.5,
      BRIGHTNESS_PULSE_HALF_PERIOD = BRIGHTNESS_PULSE_PERIOD * 0.5;

  var animate;

  // ------------------------------------------------------------------------------------------- //
  // Private static functions

  // TODO: jsdoc
  function close() {
    var startTime = Date.now();

    this.dots.forEach(function(dot) {
      dot.animations.windDownRevolution = animate.startNumericAttributeAnimation(dot.element,
        'cy', dot.animations.radiusHalfPulseY.currentValue, dot.progressCircleCenterY, startTime,
        WIND_DOWN_PERIOD, null, null, 'linear', onWindDownAnimationDone, dot);
      dot.animations.windDownFade = animate.startNumericAttributeAnimation(dot.element, 'opacity',
        1, 0, startTime, WIND_DOWN_PERIOD, null, null, 'linear', null, dot);
      animate.stopAnimation(dot.animations.radiusHalfPulseY);
    });
  }

  // TODO: jsdoc
  function createDots(parentElement, dotCount, left, top, diameter, dotRadius) {
    var i, angleRad, dots, dot, color, hue, progressCircleCenterX, progressCircleCenterY,
      progressCircleRadius, dotBaseCenterX, dotBaseCenterY, dotInnerPulseCenterY,
      revolutionAngleRad, deltaAngleRad, startTime;

    dots = [];
    deltaAngleRad = TWO_PI / dotCount;
    progressCircleRadius = diameter / 2;

    // Same for all of the dots
    progressCircleCenterX = left + progressCircleRadius;
    progressCircleCenterY = top + progressCircleRadius;
    dotBaseCenterX = left + progressCircleRadius;
    dotBaseCenterY = top + dotRadius;
    dotInnerPulseCenterY =
      dotBaseCenterY + (diameter - dotRadius) * (1 - RADIUS_PULSE_INNER_RADIUS_RATIO);
    startTime = Date.now();

    for (i = 0, angleRad = 0; i < dotCount; i++, angleRad += deltaAngleRad) {
      // Different for each dot
      hue = angleRad;
      color = new animate.HSLAColor(hue, 50, 50, DOT_OPACITY);
      revolutionAngleRad = angleRad;

      // Create the new dot
      dot = new ProgressDot(parentElement, color, dotBaseCenterX, dotBaseCenterY,
        dotInnerPulseCenterY, dotRadius, revolutionAngleRad, progressCircleCenterY);
      startAnimationsForDot(dot, startTime, progressCircleCenterX, progressCircleCenterY);
      parentElement.appendChild(dot.element);
      dots.push(dot);
    }

    return dots;
  }

  // TODO: jsdoc
  function startAnimationsForDot(dot, startTime, progressCircleCenterX, progressCircleCenterY) {
    // Constant attributes
    dot.element.setAttribute('cx', dot.dotBaseCenterX);
    dot.element.setAttribute('r', dot.dotRadius);

    // Dot revolution
    dot.animations.dotRevolution = animate.startNumericAttributeAnimation(dot.element, 'transform',
      dot.revolutionAngleRad, dot.revolutionAngleRad + TWO_PI, startTime, DOT_REVOLUTION_PERIOD,
      'rotate(', ' ' + progressCircleCenterX + ' ' + progressCircleCenterY + ')', 'linear',
      onDotRevolutionDone, dot);

    // Color revolution
    dot.animations.colorRevolution = animate.startObjectPropertyAnimation(dot.color, 'h',
      dot.color.h, dot.color.h - 360, startTime, COLOR_REVOLUTION_PERIOD, 'easeInQuad',
      onColorRevolutionDone, dot);

    // Brightness pulse half cycle
    dot.animations.brightnessHalfPulseS = animate.startObjectPropertyAnimation(dot.color, 's',
      BRIGHTNESS_PULSE_OUTER_SATURATION, BRIGHTNESS_PULSE_INNER_SATURATION, startTime,
      BRIGHTNESS_PULSE_HALF_PERIOD, 'easeInQuad', null, dot);
    dot.animations.brightnessHalfPulseL = animate.startObjectPropertyAnimation(dot.color, 'l',
      BRIGHTNESS_PULSE_OUTER_LIGHTNESS, BRIGHTNESS_PULSE_INNER_LIGHTNESS, startTime,
      BRIGHTNESS_PULSE_HALF_PERIOD, 'easeInQuad', onBrightnessPulseHalfCycleDone, dot);

    // Radius pulse half cycle; start at outer radius and move to inner radius
    dot.animations.radiusHalfPulseY = animate.startNumericAttributeAnimation(dot.element, 'cy',
      dot.dotBaseCenterY, dot.dotInnerPulseCenterY, startTime, RADIUS_PULSE_HALF_PERIOD, null,
      null, 'easeInQuad', onRadiusPulseHalfCycleDone, dot);

    dot.colorSynchronization = animate.startSyncingObjectHSLAColorProperty(dot, 'color', dot.element, 'fill');// TODO: stop this at some point...
  }

  // TODO: jsdoc
  function onDotRevolutionDone(animation, dot) {
    dot.animations.dotRevolution = animate.startNumericAttributeAnimation(animation.element,
      animation.property, animation.startValue, animation.endValue,
      animation.startTime + animation.duration, animation.duration, animation.prefix,
      animation.suffix, animation.easingFunction, onDotRevolutionDone, dot);
  }

  // TODO: jsdoc
  function onColorRevolutionDone(animation, dot) {
    dot.animations.colorRevolution = animate.startObjectPropertyAnimation(animation.object,
      animation.property, animation.startValue, animation.endValue,
      animation.startTime + animation.duration, animation.duration, animation.easingFunction,
      onColorRevolutionDone, dot);
  }

  // TODO: jsdoc
  function onBrightnessPulseHalfCycleDone(animation, dot) {
    var startValueS, endValueS, startValueL, endValueL;

    if (animation.endValue === BRIGHTNESS_PULSE_INNER_LIGHTNESS) {
      // This is the end of an inward half cycle
      startValueS = BRIGHTNESS_PULSE_INNER_SATURATION;
      endValueS = BRIGHTNESS_PULSE_OUTER_SATURATION;
      startValueL = BRIGHTNESS_PULSE_INNER_LIGHTNESS;
      endValueL = BRIGHTNESS_PULSE_OUTER_LIGHTNESS;
    } else {
      // This is the end of an outward half cycle
      startValueS = BRIGHTNESS_PULSE_OUTER_SATURATION;
      endValueS = BRIGHTNESS_PULSE_INNER_SATURATION;
      startValueL = BRIGHTNESS_PULSE_OUTER_LIGHTNESS;
      endValueL = BRIGHTNESS_PULSE_INNER_LIGHTNESS;
    }

    dot.animations.brightnessHalfPulseS = animate.startObjectPropertyAnimation(animation.object,
      animation.property, startValueS, endValueS, animation.startTime + animation.duration,
      animation.duration, animation.easingFunction, null, dot);
    dot.animations.brightnessHalfPulseL = animate.startObjectPropertyAnimation(animation.object,
      animation.property, startValueL, endValueL, animation.startTime + animation.duration,
      animation.duration, animation.easingFunction, onBrightnessPulseHalfCycleDone, dot);
  }

  // TODO: jsdoc
  function onRadiusPulseHalfCycleDone(animation, dot) {
    dot.animations.radiusHalfPulseY = animate.startNumericAttributeAnimation(animation.element,
      animation.property, animation.endValue, animation.startValue,
      animation.startTime + animation.duration, animation.duration, animation.prefix,
      animation.suffix, animation.easingFunction, onRadiusPulseHalfCycleDone, dot);
  }

  // TODO: jsdoc
  function onWindDownAnimationDone(animation, dot) {
    animate.stopAnimation(dot.animations.dotRevolution);
    animate.stopAnimation(dot.animations.colorRevolution);
    animate.stopAnimation(dot.animations.brightnessHalfPulseS);
    animate.stopAnimation(dot.animations.brightnessHalfPulseL);
    animate.stopSyncingObjectProperty(dot.colorSynchronization);

    dot.parentElement.removeChild(dot.element);

    // TODO: think about/test garbage collection. if the client got rid of the reference to this ProgressCircle object, does this get kept in memory? will it then get cleaned up after this last winddown callback?
  }

  // ------------------------------------------------------------------------------------------- //
  // Private classes

  /**
   * @constructor
   * @param {} ... // TODO: jsdoc
   */
  function ProgressDot(parentElement, color, dotBaseCenterX, dotBaseCenterY, dotInnerPulseCenterY,
                       dotRadius, revolutionAngleRad, progressCircleCenterY) {
    this.parentElement = parentElement;
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
      windDownRevolution: null,
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
    // TODO:

    console.log('progressCircle module initialized');
  }

  // ------------------------------------------------------------------------------------------- //
  // Expose this module's constructor

  /**
   * @constructor
   * @global
   * @param {} ... // TODO: jsdoc
   */
  function ProgressCircle(parentElement, left, top, diameter, dotRadius) {
    return {
      dots: createDots(parentElement, DOT_COUNT, left, top, diameter, dotRadius),
      close: close
    };
  }

  // Expose this module
  if (!window.app) window.app = {};
  window.app.ProgressCircle = ProgressCircle;
  ProgressCircle.initStaticFields = initStaticFields;

  console.log('progressCircle module loaded');
})();
