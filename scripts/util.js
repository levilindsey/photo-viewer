/**
 * This module defines a collection of static general utility functions.
 * @module util
 */
(function() {
  // ------------------------------------------------------------------------------------------- //
  // Private static variables

  var util, params, log;

  /**
   * Sets up XHR to be cross-browser compatible.
   * @function util~setUpXHR
   */
  function setUpXHR() {
    if (typeof window.XMLHttpRequest !== 'undefined') {
      util.XHR = window.XMLHttpRequest;
    } else {
      util.XHR = function() {
        try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch (e1) {}
        try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch (e2) {}
        try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch (e3) {}
        throw new Error('This browser does not support XMLHttpRequest.');
      };
    }
  }

  // TODO: jsdoc
  function setUpListen() {
    var body = document.getElementsByTagName('body')[0];
    if (typeof body.addEventListener !== 'undefined') {
      util.listen = function(element, eventName, handler) {
        element.addEventListener(eventName, handler, false);
      }
    } else if (typeof body.attachEvent !== 'undefined') {
      util.listen = function(element, eventName, handler) {
        element.attachEvent('on' + eventName, handler);
      }
    } else {
      util.listen = function(element, eventName, handler) {
        element['on' + eventName] = handler;
      }
    }
  }

  // ------------------------------------------------------------------------------------------- //
  // Public static functions

  /**
   * Initializes some static state for this module.
   * @function util.init
   */
  function init() {
    params = app.params;
    log = new app.Log('util');

    setUpXHR();
    setUpListen();

    log.d('init', 'Module initialized');
  }

  /**
   * Sends an asynchronous GET request to the given URL, and calls the appropriate callback
   * function when the request succeeds or fails.
   * @function util.sendRequest
   * @param {String} url The URL to send the GET request to.
   * @param {Function} onSuccess The function to call when a response is successfully received.
   * @param {Function} [onError] The function to call when the request does not complete successfully.
   */
  function sendRequest(url, onSuccess, onError) {
    var xhr;

    onError = onError || function(msg) {};

    // Initialize the request
    xhr = new util.XHR();
    try {
        xhr.open('GET', url);
    } catch (e) {
      if (onError) {
        onError('Unable to open the request');
      }
    }

    // Prepare to handle the response
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          onSuccess(xhr.responseText);
        } else {
          if (onError) {
            onError('Server responded with code ' + xhr.status + ' and message ' + xhr.responseText);
          }
        }
      }
    };

    // Send the request
    try {
      xhr.send();
    } catch (e) {
      onError('Unable to send the request');
    }
  }

  /**
   * Converts a Date object into a string representation in the form yyyy/mm/dd@hh:mm:ss:mmm.
   * @function util.dateObjToDateTimeString
   * @param {Date} dateObj The Date object to get a string representation of.
   * @returns {String} A string representation of the date and time.
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

  // TODO: jsdoc
  function addTapEventListener(element, callback) {
    util.listen(element, 'mouseup', callback);
    util.listen(element, 'touchend', callback);
  }

  // ------------------------------------------------------------------------------------------- //
  // Expose this module

  /**
   * Exposes the static util functions.
   * @global
   */
  util = {
    init: init,
    sendRequest: sendRequest,
    dateObjToDateTimeString: dateObjToDateTimeString,
    addTapEventListener: addTapEventListener,
    XHR: null,
    listen: null
  };

  // Expose this module
  if (!window.app) window.app = {};
  window.app.util = util;

  console.log('util module loaded');
})();
