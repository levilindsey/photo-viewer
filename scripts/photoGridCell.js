/**
 * This module defines a constructor for PhotoGridCell objects.
 * @module photoGridCell
 */
(function () {
  // ------------------------------------------------------------------------------------------- //
  // Private static variables

  var params, util, log;

  // ------------------------------------------------------------------------------------------- //
  // Private dynamic functions

  /**
   * Creates the DOM element for this grid cell, adding its child content element to it, and
   * adding it to its parent element.
   * @function photoGridCell~createElement
   * @param {HTMLElement} parent The parent element that contains this grid cell.
   * @param {PhotoItem} photo The photo item that this grid cell contains.
   */
  function createElement(parent, photo) {
    var cell, element;
    cell = this;
    element = util.createElement('div', parent, null, ['gridCell', 'nonLoaded']);
    element.style.display = 'none';
    element.appendChild(photo.gridThumbnail.image);
    cell.element = element;
  }

  /**
   * Computes and sets the CSS transition parameters for this grid cell according to the given
   * overall grid transition duration.
   * @function photoGridCell~setUpCSSTransitions
   */
  function setUpCSSTransitions(duration) {
    var cell = this;
    util.setTransitionDurationSeconds(cell.element, cell.durationRatio * duration);
    util.setTransitionDelaySeconds(cell.element, cell.delayRatio * duration);
  }

  // ------------------------------------------------------------------------------------------- //
  // Private static functions

  // ------------------------------------------------------------------------------------------- //
  // Public dynamic functions

  /**
   * Starts the animation to move this grid cell from its current position to its position within
   * the open grid.
   * @function photoGridCell#animateToOpen
   */
  function animateToOpen(duration) {
    var cell = this;
    cell.isOpen = true;
    setUpCSSTransitions.call(cell, duration);
    cell.element.style.top = cell.openY + 'px';
  }

  /**
   * Starts the animation to move this grid cell from its current position to its position within
   * the closed grid.
   * @function photoGridCell#animateToClosed
   */
  function animateToClosed(duration) {
    var cell = this;
    cell.isOpen = false;
    setUpCSSTransitions.call(cell, duration);
    cell.element.style.top = cell.closedY + 'px';
  }

  /**
   * Sets the open and closed positions of this cell.
   * @function photoGridCell#setPositions
   * @param {Number} x The x coordinate of this grid cell.
   * @param {Number} closedY The y coordinate of this grid cell when the grid is closed.
   * @param {Number} openY The y coordinate of this grid cell when the grid is open.
   */
  function setPositions(x, closedY, openY) {
    var cell, currentY;
    cell = this;
    cell.closedY = closedY;
    cell.openY = openY;
    cell.element.style.left = x + 'px';
    currentY = cell.isOpen ? cell.openY : cell.closedY;
    cell.element.style.top = currentY + 'px';
    cell.element.style.display = 'block';
  }

  /**
   * Sets the transition parameters of this cell.
   * @function photoGridCell#setTransitionParameters
   * @param {Number} durationRatio A ratio describing the transition duration of this grid cell
   * relative to the overall grid transition duration.
   * @param {Number} delayRatio A ratio describing the transition delay of this grid cell relative
   * to the overall grid transition duration.
   * @param {{p1x: Number, p1y: Number, p2x: Number, p2y: Number}} bezierPts The cubic-bezier
   * points to use to animate this grid cell.
   */
  function setTransitionParameters(durationRatio, delayRatio, bezierPts) {
    var cell = this;
    cell.durationRatio = durationRatio;
    cell.delayRatio = delayRatio;
    util.setTransitionCubicBezierTimingFunction(cell.element, bezierPts);
  }

  // ------------------------------------------------------------------------------------------- //
  // Public static functions

  /**
   * Initializes some static state for this module.
   * @function photoGridCell.initStaticFields
   */
  function initStaticFields() {
    params = app.params;
    util = app.util;
    log = new app.Log('photoGridCell');
    log.d('initStaticFields', 'Module initialized');
  }

  // ------------------------------------------------------------------------------------------- //
  // Expose this module's constructor

  /**
   * @constructor
   * @global
   * @param {HTMLElement} parent The parent element that contains this grid cell.
   * @param {PhotoItem} photo The photo item that this grid cell contains.
   */
  function PhotoGridCell(parent, photo) {
    var cell = this;

    cell.element = null;
    cell.closedY = Number.NaN;
    cell.openY = Number.NaN;
    cell.durationRatio = Number.NaN;
    cell.delayRatio = Number.NaN;
    cell.isOpen = false;
    cell.animateToOpen = animateToOpen;
    cell.animateToClosed = animateToClosed;
    cell.setPositions = setPositions;
    cell.setTransitionParameters = setTransitionParameters;

    createElement.call(this, parent, photo);
  }

  // Expose this module
  if (!window.app) window.app = {};
  window.app.PhotoGridCell = PhotoGridCell;
  PhotoGridCell.initStaticFields = initStaticFields;

  console.log('photoGridCell module loaded');
})();
