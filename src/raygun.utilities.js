/*globals Raygun, __DEV__ */

// js-url - see LICENSE file

var raygunUtilityFactory = function (window) {

  // Mozilla's toISOString() shim for IE8
  if (!Date.prototype.toISOString) {
      (function () {
          function pad(number) {
              var r = String(number);
              if (r.length === 1) {
                  r = '0' + r;
              }
              return r;
          }

           Date.prototype.toISOString = function () {
              return this.getUTCFullYear() + '-' + pad(this.getUTCMonth() + 1) + '-' + pad(this.getUTCDate()) + 'T' + pad(this.getUTCHours()) + ':' + pad(this.getUTCMinutes()) + ':' + pad(this.getUTCSeconds()) + '.' + String((this.getUTCMilliseconds() / 1000).toFixed(3)).slice(2, 5) + 'Z';
           };
      }());
  }

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(searchElement, fromIndex) {
      var k;
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }
      var o = Object(this);
      var len = o.length >>> 0;

      if (len === 0) {
        return -1;
      }
      var n = fromIndex | 0;

      if (n >= len) {
        return -1;
      }
      k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

      while (k < len) {
        if (k in o && o[k] === searchElement) {
          return k;
        }
        k++;
      }
      return -1;
    };
  }

  // Production steps of ECMA-262, Edition 5, 15.4.4.19
  // Reference: http://es5.github.io/#x15.4.4.19
  if (!Array.prototype.map) {

    Array.prototype.map = function(callback/*, thisArg*/) {

      var T, A, k;

      if (this == null) {
        throw new TypeError('this is null or not defined');
      }

      var O = Object(this);
      var len = O.length >>> 0;

      if (typeof callback !== 'function') {
        throw new TypeError(callback + ' is not a function');
      }

      if (arguments.length > 1) {
        T = arguments[1];
      }

      A = new Array(len);
      k = 0;

      while (k < len) {
        var kValue, mappedValue;

        if (k in O) {
          kValue = O[k];

          mappedValue = callback.call(T, kValue, k, O);
          A[k] = mappedValue;
        }
        k++;
      }

      return A;
    };
  }

  // Production steps of ECMA-262, Edition 5, 15.4.4.18
  // Reference: http://es5.github.io/#x15.4.4.18
  if (!Array.prototype.forEach) {

    Array.prototype.forEach = function(callback/*, thisArg*/) {
      var T, k;

      if (this == null) {
        throw new TypeError('this is null or not defined');
      }

      var O = Object(this);
      var len = O.length >>> 0;

      if (typeof callback !== 'function') {
        throw new TypeError(callback + ' is not a function');
      }

      if (arguments.length > 1) {
        T = arguments[1];
      }

      k = 0;
      while (k < len) {
        var kValue;

        if (k in O) {
          kValue = O[k];

          callback.call(T, kValue, k, O);
        }
        k++;
      }
    };
  }

  // Mozilla's bind() shim for IE8
  if (!Function.prototype.bind) {
      Function.prototype.bind = function (oThis) {
          if (typeof this !== 'function') {
              throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
          }

            var aArgs = Array.prototype.slice.call(arguments, 1),
              fToBind = this,
              FNOP = function () {
              },
              fBound = function () {
                  return fToBind.apply(this instanceof FNOP && oThis ? this : oThis,
                      aArgs.concat(Array.prototype.slice.call(arguments)));
              };

          FNOP.prototype = this.prototype;
          fBound.prototype = new FNOP();

          return fBound;
      };
  }

  var rg = {
    Utilities: {
      getUuid: function () {
          function _p8(s) {
              var p = (Math.random().toString(16) + "000000000").substr(2, 8);
              return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
          }

          return _p8() + _p8(true) + _p8(true) + _p8();
      },

      createCookie: function (name, value, hours) {
          if (Raygun.Utilities.isReactNative()) {
              return;
          }

          var expires;
          if (hours) {
              var date = new Date();
              date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
              expires = "; expires=" + date.toGMTString();
          }
          else {
              expires = "";
          }

          document.cookie = name + "=" + value + expires + "; path=/";
      },

      readCookie: function (name, doneCallback) {
          if (Raygun.Utilities.isReactNative()) {
              doneCallback(null, 'none');

              return;
          }

          var nameEQ = name + "=";
          var ca = document.cookie.split(';');
          for (var i = 0; i < ca.length; i++) {
              var c = ca[i];
              while (c.charAt(0) === ' ') {
                  c = c.substring(1, c.length);
              }
              if (c.indexOf(nameEQ) === 0) {
                  var cookieValue = c.substring(nameEQ.length, c.length);

                  doneCallback(null, cookieValue);

                  return;
              }
          }

          doneCallback(null, null);
      },

      clearCookie: function (key) {
          if (Raygun.Utilities.isReactNative()) {
              return;
          }

          Raygun.Utilities.createCookie(key, '', -1);
      },

      log: function (message, data) {
          if (window.console && window.console.log && Raygun.Options._debugMode) {
              window.console.log(message);

              if (data) {
                  window.console.log(data);
              }
          }
      },

      isApiKeyConfigured: function () {
          if (Raygun.Options._raygunApiKey && Raygun.Options._raygunApiKey !== '') {
              return true;
          }
          Raygun.Utilities.log("Raygun API key has not been configured, make sure you call Raygun.init(yourApiKey)");
          return false;
      },

      isReactNative: function () {
          return typeof document === 'undefined' && typeof __DEV__ !== 'undefined';
      },

      defaultReactNativeGlobalHandler: function (error, fatal) {
          if (typeof _defaultReactNativeGlobalHandler === 'function') {
              _defaultReactNativeGlobalHandler(error, fatal);
          }
      },

      localStorageAvailable: function () {
          try {
              return ('localStorage' in window) && window['localStorage'] !== null;
          } catch (e) {
              return false;
          }
      },

      truncateURL: function (url) {
          // truncate after fourth /, or 24 characters, whichever is shorter
          // /api/1/diagrams/xyz/server becomes
          // /api/1/diagrams/...
          var truncated = url;
          var path = url.split('//')[1];

          if (path) {
              var queryStart = path.indexOf('?');
              var sanitizedPath = path.toString().substring(0, queryStart);
              var truncated_parts = sanitizedPath.split('/').slice(0, 4).join('/');
              var truncated_length = sanitizedPath.substring(0, 48);
              truncated = truncated_parts.length < truncated_length.length ?
                  truncated_parts : truncated_length;
              if (truncated !== sanitizedPath) {
                  truncated += '..';
              }
          }

          return truncated;
      },

      merge: function (o1, o2) {
          var a, o3 = {};
          for (a in o1) {
              o3[a] = o1[a];
          }
          for (a in o2) {
              o3[a] = o2[a];
          }
          return o3;
      },

      mergeArray: function (t0, t1) {
          if (t1 != null) {
              return t0.concat(t1);
          }
          return t0;
      },

      forEach: function (set, func) {
          for (var i = 0; i < set.length; i++) {
              func.call(null, i, set[i]);
          }
      },

      isEmpty: function (o) {
          for (var p in o) {
              if (o.hasOwnProperty(p)) {
                  return false;
              }
          }
          return true;
      },

      contains: function (array, obj) {
          var i = array.length;
          while (i--) {
              if (array[i] === obj) {
                  return true;
              }
          }
          return false;
      },

      getRandomInt: function () {
          return Math.floor(Math.random() * 9007199254740993);
      },

      getViewPort: function () {
          if (Raygun.Utilities.isReactNative()) {
              return { width: 'Not available', height: 'Not available' };
          }

          var e = document.documentElement,
              g = document.getElementsByTagName('body')[0],
              x = window.innerWidth || e.clientWidth || g.clientWidth,
              y = window.innerHeight || e.clientHeight || g.clientHeight;
          return {width: x, height: y};
      },

      parseUrl: function(arg, url) {
        function isNumeric(arg) {
        return !isNaN(parseFloat(arg)) && isFinite(arg);
        }

        return (function(arg, url) {
        if (typeof document === 'undefined') {
            return '';
        }

        var _ls = url || window.location.toString();

        if (!arg) { return _ls; }
        else { arg = arg.toString(); }

        if (_ls.substring(0,2) === '//') { _ls = 'http:' + _ls; }
        else if (_ls.split('://').length === 1) { _ls = 'http://' + _ls; }

        url = _ls.split('/');
        var _l = {auth:''}, host = url[2].split('@');

        if (host.length === 1) { host = host[0].split(':'); }
        else { _l.auth = host[0]; host = host[1].split(':'); }

        _l.protocol=url[0];
        _l.hostname=host[0];
        _l.port=(host[1] || ((_l.protocol.split(':')[0].toLowerCase() === 'https') ? '443' : '80'));
        _l.pathname=( (url.length > 3 ? '/' : '') + url.slice(3, url.length).join('/').split('?')[0].split('#')[0]);
        var _p = _l.pathname;

        if (_p.charAt(_p.length-1) === '/') { _p=_p.substring(0, _p.length-1); }
        var _h = _l.hostname, _hs = _h.split('.'), _ps = _p.split('/');

        if (arg === 'hostname') { return _h; }
        else if (arg === 'domain') {
            if (/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(_h)) { return _h; }
            return _hs.slice(-2).join('.');
        }
        //else if (arg === 'tld') { return _hs.slice(-1).join('.'); }
        else if (arg === 'sub') { return _hs.slice(0, _hs.length - 2).join('.'); }
        else if (arg === 'port') { return _l.port; }
        else if (arg === 'protocol') { return _l.protocol.split(':')[0]; }
        else if (arg === 'auth') { return _l.auth; }
        else if (arg === 'user') { return _l.auth.split(':')[0]; }
        else if (arg === 'pass') { return _l.auth.split(':')[1] || ''; }
        else if (arg === 'path') { return _l.pathname; }
        else if (arg.charAt(0) === '.')
        {
            arg = arg.substring(1);
            if(isNumeric(arg)) {arg = parseInt(arg, 10); return _hs[arg < 0 ? _hs.length + arg : arg-1] || ''; }
        }
        else if (isNumeric(arg)) { arg = parseInt(arg, 10); return _ps[arg < 0 ? _ps.length + arg : arg] || ''; }
        else if (arg === 'file') { return _ps.slice(-1)[0]; }
        else if (arg === 'filename') { return _ps.slice(-1)[0].split('.')[0]; }
        else if (arg === 'fileext') { return _ps.slice(-1)[0].split('.')[1] || ''; }
        else if (arg.charAt(0) === '?' || arg.charAt(0) === '#')
        {
            var params = _ls, param = null;

            if(arg.charAt(0) === '?') { params = (params.split('?')[1] || '').split('#')[0]; }
            else if(arg.charAt(0) === '#') { params = (params.split('#')[1] || ''); }

            if(!arg.charAt(1)) { return params; }

            arg = arg.substring(1);
            params = params.split('&');

            for(var i=0,ii=params.length; i<ii; i++)
            {
                param = params[i].split('=');
                if(param[0] === arg) { return param[1] || ''; }
            }

            return null;
        }

        return '';
        })(arg, url);
      },
      // Replace existing function on object with new, but call old one afterwards still
      // Returns function that when called will un-enhance object
      enhance: function(object, property, newFunction) {
        var existingFunction = object[property];

        object[property] = function enhanced() {
          newFunction.apply(this, arguments);

          if (typeof existingFunction === "function") {
            existingFunction.apply(this, arguments);
          }
        };

        return function unhenance() {
          object[property] = existingFunction;
        };
      },
      addEventHandler: function(element, event, handler) {
        if (element.addEventListener) {
          element.addEventListener(event, handler);
        } else if (element.attachEvent) {
          element.attachEvent('on' + event, handler);
        }

        return function() {
          if (element.removeEventListener) {
            element.removeEventListener(event, handler);
          } else if (element.detachEvent) {
            element.detachEvent('on' + event, handler);
          }
        };
      }
    }
  };

  if (!window.Raygun) {
      window.Raygun = rg;
  }

  var _defaultReactNativeGlobalHandler;
  if (Raygun.Utilities.isReactNative() && __DEV__ !== true && window.ErrorUtils && window.ErrorUtils.getGlobalHandler) {
      _defaultReactNativeGlobalHandler = window.ErrorUtils.getGlobalHandler();
  }
};


raygunUtilityFactory(window);
