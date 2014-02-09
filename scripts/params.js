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

  // Max image size is 600x450; padding is 10 or 20 (I messed up on the aspect ratios of the converted images)
  moduleParams.WIDTH = 640;
  moduleParams.HEIGHT = 470;
  moduleParams.POINTER_MOVE_BUTTON_FADE_DELAY = 700; // milliseconds

  moduleParams.PROGRESS_CIRCLE_DIAMETER = 290;
  moduleParams.PROGRESS_CIRCLE_DOT_RADIUS = 10;

  // --- Dropdown photo grid parameters --- //

  moduleParams = {};
  params.GRID = moduleParams;

  // Max image size is 112x84; margin size is 10
  // NOTE: if changing these values, also change them in dropdownphotogrid.css
  moduleParams.THUMBNAIL_WIDTH = 112;
  moduleParams.THUMBNAIL_HEIGHT = 84;

  moduleParams.THUMBNAIL_MARGIN = 10;
  moduleParams.MAX_COLUMN_COUNT = 9;

  moduleParams.MARGIN = 10;
  moduleParams.BANNER_HEIGHT = 50;
  moduleParams.SHRUNKEN_GRIDS_WIDTH = 260;

  moduleParams.HEIGHT_CHANGE_RATE = 0.001; // pixels / milliseconds
  moduleParams.ALL_GRIDS_EXPAND_DURATION = 200; // milliseconds
  moduleParams.ALL_GRIDS_SHRINK_DURATION = 400; // milliseconds

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

  // --- Localization parameters --- //

  params.L18N = {};

  moduleParams = {};
  params.L18N.EN = moduleParams;

  moduleParams.TAP_THUMBNAIL_PROMPT = '(tap to expand thumbnail)';

  // --- Miscellaneous parameters --- //

  params.SPRITE_SHEET_URL = '../images/spritesheet.png';
  params.TRANSPARENT_GIF_URL = '../images/transparent.gif';
  params.ADD_CSS_TRANSITION_DELAY = 10;
  params.SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
  params.TWO_PI = Math.PI * 2;
  params.HALF_PI = Math.PI * 0.5;
  params.SMALL_SCREEN_WIDTH_THRESHOLD = 900;
  params.SMALL_SCREEN_HEIGHT_THRESHOLD = 675;

  // --- Expose this module --- //

  if (!window.app) window.app = {};
  window.app.params = params;

  console.log('params module loaded');
})();
