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
    if (window.XMLHttpRequest) {
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
    if (body.addEventListener) {
      util.listen = function(element, eventName, handler) {
        element.addEventListener(eventName, handler, false);
      };
    } else if (body.attachEvent) {
      util.listen = function(element, eventName, handler) {
        element.attachEvent('on' + eventName, handler);
      };
    } else {
      util.listen = function(element, eventName, handler) {
        element['on' + eventName] = handler;
      };
    }
  }

  // TODO: jsdoc
  function setUpStopListening() {
    var body = document.getElementsByTagName('body')[0];
    if (body.removeEventListener) {
      util.stopListening = function(element, eventName, handler) {
        element.removeEventListener(eventName, handler, false);
      };
    } else if (body.detachEvent) {
      util.stopListening = function(element, eventName, handler) {
        element.detachEvent('on' + eventName, handler);
      };
    } else {
      util.stopListening = function(element, eventName, handler) {
        element['on' + eventName] = null;
      };
    }
  }

  // TODO: jsdoc
  function setUpRequestFullScreen() {
    var body = document.getElementsByTagName('body')[0];
    if (body.requestFullscreen) {
      util.requestFullscreen = function(element) {
        element.requestFullscreen();
      };
    } else if (body.webkitEnterFullScreen) {
      util.requestFullscreen = function(element) {
        element.webkitEnterFullScreen();
      };
    } else if (body.mozRequestFullScreen) {
      util.requestFullscreen = function(element) {
        element.mozRequestFullScreen();
      };
    } else if (body.webkitRequestFullScreen) {
      util.requestFullscreen = function(element) {
        element.webkitRequestFullScreen();
      };
    } else {
      util.listen = function(element) {
        log.e('This browser does not support fullscreen mode.');
      };
      log.w('This browser does not support fullscreen mode.');
    }
  }

  // TODO: jsdoc
  function setUpCancelFullScreen() {
    if (document.cancelFullScreen) {
      util.cancelFullscreen = function() {
        element.cancelFullScreen();
      };
    } else if (document.mozCancelFullScreen) {
      util.cancelFullscreen = function() {
        element.mozCancelFullScreen();
      };
    } else if (document.webkitCancelFullScreen) {
      util.cancelFullscreen = function() {
        element.webkitCancelFullScreen();
      };
    } else if (document.webkitExitFullScreen) {
      util.cancelFullscreen = function() {
        element.webkitExitFullScreen();
      };
    } else {
      util.listen = function(element) {
        log.e('This browser does not support fullscreen mode.');
      };
      log.w('This browser does not support fullscreen mode.');
    }
  }

  // TODO: jsdoc
  function setUpStopPropogation() {
    util.stopPropogation = function(event) {
      if (event.stopPropagation) {
        event.stopPropagation();
      } else {
        event.cancelBubble = true;
      }
    };
  }

  // TODO: jsdoc
  function setUpPreventDefault() {
    util.preventDefault = function(event) {
      if (event.preventDefault) {
        event.preventDefault();
      } else {
        event.returnValue = false;
      }
    };
  }

  // TODO: jsdoc
  function setUpListenForTransitionEnd() {
    var body, transitions, transition, transitionEndEventName;

    body = document.getElementsByTagName('body')[0];

    transitions = {
      'transition': 'transitionend',
      'OTransition': 'otransitionend',
      'MozTransition': 'transitionend',
      'WebkitTransition': 'webkitTransitionEnd'
    };

    for (transition in transitions){
      if (body.style[transition] !== undefined) {
        transitionEndEventName = transitions[transition];
      }
    }

    if (transitionEndEventName) {
      util.listenForTransitionEnd = function(element, handler) {
        util.listen(element, transitionEndEventName, handler);
      };
      util.stopListeningForTransitionEnd = function(element, handler) {
        util.stopListening(element, transitionEndEventName, handler);
      };
    } else {
      util.listenForTransitionEnd = function(element, handler) {
        log.e('This browser does not support the transitionend event.');
      };
      util.stopListeningForTransitionEnd = function(element, handler) {
        log.e('This browser does not support the transitionend event.');
      };
      log.w('This browser does not support the transitionend event.');
    }
  }

  /**
   * Adds the given class to the given element.
   * @function util~addClass
   * @param {HTMLElement} element The element to add the class to.
   * @param {String} className The class to add.
   */
  function addClass(element, className) {
    element.className += ' ' + className;
  }

  /**
   * Removes the given class from the given element.
   * @function util~removeClass
   * @param {HTMLElement} element The element to remove the class from.
   * @param {String} className The class to remove.
   */
  function removeClass(element, className) {
    element.className = element.className.split(' ').filter(function(value) {
      return value !== className;
    }).join(' ');
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
    setUpStopListening();
    setUpRequestFullScreen();
    setUpCancelFullScreen();
    setUpStopPropogation();
    setUpPreventDefault();
    setUpListenForTransitionEnd();

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
   * Converts a Date object into a string representation in the form "yyyy/mm/dd@hh:mm:ss.mmm".
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
        dateObj.getSeconds() + '.' +
        dateObj.getMilliseconds();
  }

  /**
   * Converts a number of milliseconds into a string representation of the time in the form
   * "[hh:]mm:ss.mmm".
   * @function util.millisToTimeString
   * @param {Number} millis The number of milliseconds to convert to a string representation.
   * @returns {String} A string representation of the number of milliseconds.
   */
  function millisToTimeString(millis) {
    var hours, minutes, seconds;

    hours = parseInt((millis / 3600000), 10);
    millis %= 3600000;
    minutes = parseInt((millis / 60000), 10);
    millis %= 60000;
    seconds = parseInt((millis / 1000), 10);
    millis %= 1000;

    hours =
        hours > 9 ?
            '' + hours + ':' :
            hours > 0 ?
                '0' + hours + ':' :
                '';
    minutes =
        (minutes > 9 ?
            '' + minutes :
            '0' + minutes) + ':';
    seconds =
        (seconds > 9 ?
            '' + seconds :
            '0' + seconds) + '.';
    millis =
        millis > 99 ?
            '' + millis :
            millis > 9 ?
                '0' + millis :
                '00' + millis;

    return hours + minutes + seconds + millis;
  }

  // TODO: jsdoc
  function addTapEventListener(element, callback, preventDefault) {
    var preventionCallback;
    if (preventDefault) {
      preventionCallback = function(event) {
        util.preventDefault(event);
      };
      util.listen(element, 'mousedown', preventionCallback);
      util.listen(element, 'touchstart', preventionCallback);
    }
    util.listen(element, 'mouseup', callback);
    util.listen(element, 'touchend', callback);
    return preventionCallback;
  }

  // TODO: jsdoc
  function removeTapEventListener(element, callback, preventionCallback) {
    util.stopListening(element, 'mouseup', callback);
    util.stopListening(element, 'touchend', callback);
    util.stopListening(element, 'mousedown', preventionCallback);
    util.stopListening(element, 'touchstart', preventionCallback);
  }

  // TODO: jsdoc
  function addPointerMoveEventListener(element, callback) {
    util.listen(element, 'mousemove', callback);
    util.listen(element, 'touchmove', callback);
  }

  // TODO: jsdoc
  function removePointerMoveEventListener(element, callback) {
    util.stopListening(element, 'mousemove', callback);
    util.stopListening(element, 'touchmove', callback);
  }

  /**
   * Creates a DOM element with the given tag name, appends it to the given parent element, and
   * gives it the given id and classes.
   * @function util.createElement
   * @param {String} tagName The tag name to give the new element.
   * @param {HTMLElement} [parent] The parent element to append the new element to.
   * @param {String} [id] The id to give the new element.
   * @param {Array.<String>} [classes] The classes to give the new element.
   * @returns {HTMLElement} The new element.
   */
  function createElement(tagName, parent, id, classes) {
    var element = document.createElement(tagName);
    if (parent) {
      parent.appendChild(element);
    }
    if (id) {
      element.id = id;
    }
    if (classes) {
      classes.forEach(function(className) { addClass(element, className)});
    }
    return element;
  }

  /**
   * Determines whether the given element contains the given class.
   * @function util~containsClass
   * @param {HTMLElement} element The element to check.
   * @param {String} className The class to check for.
   * @returns {Boolean} True if the element does contain the class.
   */
  function containsClass(element, className) {
    var startIndex, indexAfterEnd;
    startIndex = element.className.indexOf(className);
    if (startIndex >= 0) {
      if (startIndex === 0 || element.className[startIndex - 1] === ' ') {
        indexAfterEnd = startIndex + className.length;
        if (indexAfterEnd === element.className.length || element.className[indexAfterEnd] === ' ') {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Toggles whether the given element has the given class. If the enabled argument is given, then
   * the inclusion of the class will be forced. That is, if enabled=true, then this will ensure the
   * element has the class; if enabled=false, then this will ensure the element does NOT have the
   * class; if enabled=undefined, then this will simply toggle whether the element has the class.
   * @function util.toggleClass
   * @param {HTMLElement} element The element to add the class to or remove the class from.
   * @param {String} className The class to add or remove.
   * @param {Boolean} [enabled] If given, then the inclusion of the class will be forced.
   */
  function toggleClass(element, className, enabled) {
    if (typeof enabled === 'undefined') {
      if (containsClass(element, className)) {
        removeClass(element, className);
      } else {
        addClass(element, className);
      }
    } else if (enabled) {
      addClass(element, className);
    } else {
      removeClass(element, className);
    }
  }

  /**
   * Gets the coordinates of the element relative to the top-left corner of the page.
   * @function util.getPageCoordinates
   * @param {HTMLElement} element The element to get the coordinates of.
   * @returns {{x: Number, y: Number}} The coordinates of the element relative to the top-left
   * corner of the page.
   */
  function getPageCoordinates(element) {
    var x = 0, y = 0;
    while (element.offsetParent) {
      x += element.offsetLeft;
      y += element.offsetTop;
      element = element.offsetParent;
    }
    return { x: x, y: y };
  }

  // TODO: jsdoc
  function getViewportSize() {
    var w, h;
    if (typeof window.innerWidth !== 'undefined') {
      // Good browsers
      w = window.innerWidth;
      h = window.innerHeight;
    } else if (typeof document.documentElement !== 'undefined' &&
        typeof document.documentElement.clientWidth !== 'undefined' &&
        document.documentElement.clientWidth !== 0) {
      // IE6 in standards compliant mode
      w = document.documentElement.clientWidth;
      h = document.documentElement.clientHeight;
    } else {
      // Older versions of IE
      w = document.getElementsByTagName('body')[0].clientWidth;
      h = document.getElementsByTagName('body')[0].clientHeight;
    }
    return { w: w, h: h };
  }

  /**
   * Removes the given child element from the given parent element if the child does indeed belong
   * to the parent.
   * @function util.removeChildIfPresent
   * @param {HTMLElement} parent The parent to remove the child from.
   * @param {HTMLElement} child The child to remove.
   * @returns {Boolean} True if the child did indeed belong to the parent.
   */
  function removeChildIfPresent(parent, child) {
    if (child.parentNode === parent) {
      parent.removeChild(child);
      return true;
    }
    return false
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
    millisToTimeString: millisToTimeString,
    addTapEventListener: addTapEventListener,
    removeTapEventListener: removeTapEventListener,
    addPointerMoveEventListener: addPointerMoveEventListener,
    removePointerMoveEventListener: removePointerMoveEventListener,
    createElement: createElement,
    containsClass: containsClass,
    toggleClass: toggleClass,
    getPageCoordinates: getPageCoordinates,
    getViewportSize: getViewportSize,
    removeChildIfPresent: removeChildIfPresent,
    XHR: null,
    listen: null,
    stopListening: null,
    requestFullscreen: null,
    cancelFullscreen: null,
    stopPropogation: null,
    preventDefault: null,
    listenForTransitionEnd: null,
    stopListeningForTransitionEnd: null
  };

  // Expose this module
  if (!window.app) window.app = {};
  window.app.util = util;

  console.log('util module loaded');
})();
