/**
 * This module defines a collection of static general utility functions.
 * @module util
 */
(function() {
  // ------------------------------------------------------------------------------------------- //
  // Private static variables

  var util;

  // ------------------------------------------------------------------------------------------- //
  // Public static functions

  /**
   * Converts a Date object into a string representation in the form yyyy/mm/dd@hh:mm:ss:mmm.
   * @function util.dateObjToDateTimeString
   * @param {Date} dateObj The Date object to get a string representation of.
   * @returns {string} A string representation of the date and time.
   */
  function dateObjToDateTimeString(dateObj) {
    return dateObj.getFullYear() + '/' +
        (dateObj.getMonth() + 1) + '/' +
        dateObj.getDate() + '@' +
        dateObj.getHours() + ':' +
        dateObj.getMinutes() + ':' +
        dateObj.getSeconds() + ':' +
        dateObj.getMilliseconds();
  }

  // ------------------------------------------------------------------------------------------- //
  // Expose this module

  /**
   * Exposes the static util functions.
   * @global
   */
  util = {
    dateObjToDateTimeString: dateObjToDateTimeString
  };

  // Expose this module
  if (!window.app) window.app = {};
  window.app.util = util;

  console.log('util module loaded');
})();
