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
    } else if (body.mozRequestFullScreen) {
      util.requestFullscreen = function(element) {
        element.mozRequestFullScreen();
      };
    } else if (body.webkitRequestFullScreen) {
      util.requestFullscreen = function(element) {
        element.webkitRequestFullScreen();
      };
    } else if (body.msRequestFullScreen) {
      util.requestFullscreen = function(element) {
        element.msRequestFullScreen();
      };
    } else {
      util.requestFullscreen = function(element) {
        log.e('This browser does not support fullscreen mode.');
      };
      log.w('This browser does not support fullscreen mode.');
    }
  }

  // TODO: jsdoc
  function setUpCancelFullScreen() {
    if (document.cancelFullScreen) {
      util.cancelFullScreen = function() {
        document.cancelFullScreen();
      };
    } else if (document.mozCancelFullScreen) {
      util.cancelFullScreen = function() {
        document.mozCancelFullScreen();
      };
    } else if (document.webkitCancelFullScreen) {
      util.cancelFullScreen = function() {
        document.webkitCancelFullScreen();
      };
    } else if (document.webkitExitFullScreen) {
      util.cancelFullScreen = function() {
        document.webkitExitFullScreen();
      };
    } else {
      util.cancelFullScreen = function() {
        log.e('This browser does not support fullscreen mode.');
      };
      log.w('This browser does not support fullscreen mode.');
    }
  }

  // TODO: jsdoc
  function setUpAddOnEndFullScreen() {
    if (typeof document.webkitCancelFullScreen !== 'undefined') {
      util.addOnEndFullScreen = function(handler) {
        util.listen(document, 'webkitfullscreenchange', function() {
          if (!document.webkitIsFullScreen) {
            handler();
          }
        });
      }
    } else if (typeof document.mozCancelFullScreen !== 'undefined') {
      util.addOnEndFullScreen = function(handler) {
        util.listen(document, 'mozfullscreenchange', function() {
          if (!document.mozFullScreen) {
            handler();
          }
        });
      }
    } else if (typeof document.cancelFullScreen !== 'undefined') {
      util.addOnEndFullScreen = function(handler) {
        util.listen(document, 'fullscreenchange', function() {
          if (!document.fullScreen) {
            handler();
          }
        });
      }
    } else {
      util.addOnEndFullScreen = function(handler) {
        log.e('This browser does not support the fullscreenchange event.');
      }
      log.w('This browser does not support the fullscreenchange event.');
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

    for (transition in transitions) {
      if (body.style[transition] !== 'undefined') {
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

  // TODO: jsdoc
  function setUpGetScrollTop() {
    var body;
    if (typeof pageYOffset !== 'undefined') {
      util.getScrollTop = function() {
        return pageYOffset;
      };
    } else if (document.documentElement) {
      util.getScrollTop = function() {
        return document.documentElement.scrollTop;
      };
    } else {
      body = document.getElementsByTagName('body')[0];
      util.getScrollTop = function() {
        return body.scrollTop;
      };
    }
  }

  // TODO: jsdoc
  function setUpGetMidTransitionValue() {
    var body = document.getElementsByTagName('body')[0];
    if (window.getComputedStyle) {
      util.getMidTransitionValue = function(element, property) {
        return getComputedStyle(element).getPropertyValue(property);
      };
    } else if (body.currentStyle) {
      util.getMidTransitionValue = function(element, property) {
        try {
          return element.currentStyle[property];
        } catch (e) {
          log.w('Element ' + element + ' does not have intermediate property ' + property)
          return '';
        }
      };
    } else {
      util.getMidTransitionValue = function(element, property) {
        log.e('This browser dose not support getComputedStyle.');
        return '';
      };
      log.w('This browser dose not support getComputedStyle.');
    }
  }

  // TODO: jsdoc
  function checkIfMobileBrowser() {
    var MOBILE_REGEX_1, MOBILE_REGEX_2, userAgentInfo;

    MOBILE_REGEX_1 = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i;
    MOBILE_REGEX_2 = /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i;
    userAgentInfo = navigator.userAgent || navigator.vendor || window.opera;

    util.isMobileBrowser = mobileCheck(userAgentInfo);

    log.i('checkIfMobileBrowser', 'isMobileBrowser=' + util.isMobileBrowser);

    function mobileCheck(userAgentInfo) {
      return MOBILE_REGEX_1.test(userAgentInfo) ||
          MOBILE_REGEX_2.test(userAgentInfo.substr(0, 4));
    }
  }

  function checkIfSmallScreen() {
    util.isSmallScreen = screen.width < params.SMALL_SCREEN_WIDTH_THRESHOLD ||
        screen.height < params.SMALL_SCREEN_HEIGHT_THRESHOLD;
  }

  // TODO: jsdoc
  function setUpMobileBrowserDependantHelpers() {
    if (util.isMobileBrowser) {
      // TODO:
      util.addTapEventListener = function(element, callback, preventDefault) {
        var preventionCallback;
        if (preventDefault) {
          preventionCallback = function(event) {
            util.preventDefault(event);
          };
          util.listen(element, 'touchstart', preventionCallback);
        }
        util.listen(element, 'touchend', callback);
        return preventionCallback;
      }

      // TODO:
      util.removeTapEventListener = function(element, callback, preventionCallback) {
        util.stopListening(element, 'touchend', callback);
        util.stopListening(element, 'touchstart', preventionCallback);
      }

      // TODO:
      util.addPointerMoveEventListener = function(element, callback) {
        util.listen(element, 'touchmove', callback);
      }

      // TODO:
      util.removePointerMoveEventListener = function(element, callback) {
        util.stopListening(element, 'touchmove', callback);
      }
    } else {
      // TODO:
      util.addTapEventListener = function(element, callback, preventDefault) {
        var preventionCallback;
        if (preventDefault) {
          preventionCallback = function(event) {
            util.preventDefault(event);
          };
          util.listen(element, 'mousedown', preventionCallback);
        }
        util.listen(element, 'mouseup', callback);
        return preventionCallback;
      }

      // TODO:
      util.removeTapEventListener = function(element, callback, preventionCallback) {
        util.stopListening(element, 'mouseup', callback);
        util.stopListening(element, 'mousedown', preventionCallback);
      }

      // TODO:
      util.addPointerMoveEventListener = function(element, callback) {
        util.listen(element, 'mousemove', callback);
      }

      // TODO:
      util.removePointerMoveEventListener = function(element, callback) {
        util.stopListening(element, 'mousemove', callback);
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

    checkIfMobileBrowser();
    checkIfSmallScreen();

    setUpXHR();
    setUpListen();
    setUpStopListening();
    setUpRequestFullScreen();
    setUpCancelFullScreen();
    setUpStopPropogation();
    setUpPreventDefault();
    setUpListenForTransitionEnd();
    setUpGetScrollTop();
    setUpAddOnEndFullScreen();
    setUpGetMidTransitionValue();
    setUpMobileBrowserDependantHelpers();

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
  function listenToMultipleForMultiple(elements, events, callback) {
    elements.forEach(function(element) {
      events.forEach(function(event) {
        util.listen(element, event, callback);
      });
    });
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
      classes.forEach(function(className) {
        addClass(element, className)
      });
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

  /**
   * Adds the given class to the given element.
   * @function util.addClass
   * @param {HTMLElement} element The element to add the class to.
   * @param {String} className The class to add.
   */
  function addClass(element, className) {
    element.className += ' ' + className;
  }

  /**
   * Removes the given class from the given element.
   * @function util.removeClass
   * @param {HTMLElement} element The element to remove the class from.
   * @param {String} className The class to remove.
   */
  function removeClass(element, className) {
    element.className = element.className.split(' ').filter(function(value) {
      return value !== className;
    }).join(' ');
  }

  // TODO: jsdoc
  function clearClasses(element) {
    element.className = '';
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
    listenToMultipleForMultiple: listenToMultipleForMultiple,
    createElement: createElement,
    containsClass: containsClass,
    toggleClass: toggleClass,
    getPageCoordinates: getPageCoordinates,
    getViewportSize: getViewportSize,
    removeChildIfPresent: removeChildIfPresent,
    addClass: addClass,
    removeClass: removeClass,
    clearClasses: clearClasses,
    XHR: null,
    listen: null,
    stopListening: null,
    requestFullscreen: null,
    cancelFullScreen: null,
    stopPropogation: null,
    preventDefault: null,
    listenForTransitionEnd: null,
    stopListeningForTransitionEnd: null,
    getScrollTop: null,
    addOnEndFullScreen: null,
    getMidTransitionValue: null,
    addTapEventListener: null,
    removeTapEventListener: null,
    addPointerMoveEventListener: null,
    removePointerMoveEventListener: null,
    isMobileBrowser: false,
    isSmallScreen: false
  };

  // Expose this module
  if (!window.app) window.app = {};
  window.app.util = util;

  console.log('util module loaded');
})();
