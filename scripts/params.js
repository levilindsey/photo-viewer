/**
 * This module defines a collection of parameters used throughout this app.
 * @module params
 */
(function() {
  var params, moduleParams;

  params = {};

  // --- General app parameters --- //

  moduleParams = {};
  params.APP = moduleParams;

  moduleParams.TITLE = 'Photo Viewer';
  moduleParams.VERSION = '??.??.??';
  moduleParams.LICENSE = 'The MIT License (MIT). Copyright (c) 2014 Levi Lindsey <levi@jackieandlevi.com>.';

  // --- Photo metadata parameters --- //

  moduleParams = {};
  params.PHOTO_METADATA = moduleParams;

  moduleParams.URL = 'http://ukulelefury.com/weddingphotos/metadata.json';

  // --- Photo lightbox parameters --- //

  moduleParams = {};
  params.LIGHTBOX = moduleParams;

  // Max image size is 600x450, but padding size is 20
  moduleParams.WIDTH = 640;
  moduleParams.HEIGHT = 490;
  moduleParams.POINTER_MOVE_BUTTON_FADE_DELAY = 700; // milliseconds

  // --- Dropdown photo grid parameters --- //

  moduleParams = {};
  params.GRID = moduleParams;

  // Max image size is 112x84, but margin size is 20
  moduleParams.THUMBNAIL_WIDTH = 132;
  moduleParams.THUMBNAIL_HEIGHT = 104;

  // --- Progress circle parameters --- //

  moduleParams = {};
  params.PROGRESS_CIRCLE = moduleParams;

  moduleParams.DOT_COUNT = 11;

  moduleParams.DOT_REVOLUTION_PERIOD = 4000; // milliseconds per revolution
  moduleParams.COLOR_REVOLUTION_PERIOD = params.PROGRESS_CIRCLE.DOT_REVOLUTION_PERIOD * 0.3; // milliseconds per revolution
  moduleParams.RADIUS_PULSE_PERIOD = 3000; // milliseconds per pulse
  moduleParams.BRIGHTNESS_PULSE_PERIOD = 3000; // milliseconds per pulse
  moduleParams.WIND_DOWN_PERIOD = 500; // milliseconds to end spinning

  moduleParams.WIND_DOWN_REVOLUTION_DEG = 500000 / params.PROGRESS_CIRCLE.DOT_REVOLUTION_PERIOD; // degrees
  moduleParams.RADIUS_PULSE_INNER_RADIUS_RATIO = 0.8;
  moduleParams.BRIGHTNESS_PULSE_INNER_LIGHTNESS = 90; // from 0 to 100
  moduleParams.BRIGHTNESS_PULSE_OUTER_LIGHTNESS = 30; // from 0 to 100
  moduleParams.BRIGHTNESS_PULSE_INNER_SATURATION = 20; // from 0 to 100
  moduleParams.BRIGHTNESS_PULSE_OUTER_SATURATION = 90; // from 0 to 100
  moduleParams.DOT_OPACITY = 1; // from 0 to 1

  moduleParams.RADIUS_PULSE_HALF_PERIOD = params.PROGRESS_CIRCLE.RADIUS_PULSE_PERIOD * 0.5; // milliseconds per half pulse
  moduleParams.BRIGHTNESS_PULSE_HALF_PERIOD = params.PROGRESS_CIRCLE.BRIGHTNESS_PULSE_PERIOD * 0.5; // milliseconds per half pulse

  // --- Log parameters --- //

  moduleParams = {};
  params.LOG = moduleParams;

  moduleParams.RECENT_ENTRIES_LIMIT = 80;
  moduleParams.DEBUG = true;
  moduleParams.VERBOSE = true;

  // --- Sprite parameters --- //

  moduleParams = {};
  params.SPRITES = moduleParams;

  moduleParams.SRC = '../images/spritesheet.png';

  // --- Miscellaneous parameters --- //

  params.SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
  params.TWO_PI = Math.PI * 2;
  params.HALF_PI = Math.PI * 0.5;

  // --- Expose this module --- //

  if (!window.app) window.app = {};
  window.app.params = params;

  console.log('params module loaded');
})();
