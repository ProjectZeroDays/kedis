var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/benchmark/benchmark.js
var require_benchmark = __commonJS({
  "node_modules/benchmark/benchmark.js"(exports, module) {
    "use strict";
    (function() {
      "use strict";
      var undefined2;
      var objectTypes = {
        "function": true,
        "object": true
      };
      var root = objectTypes[typeof window] && window || this;
      var freeDefine = typeof define == "function" && typeof define.amd == "object" && define.amd && define;
      var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;
      var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;
      var freeGlobal = freeExports && freeModule && typeof global == "object" && global;
      if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal)) {
        root = freeGlobal;
      }
      var freeRequire = typeof __require == "function" && __require;
      var counter = 0;
      var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;
      var rePrimitive = /^(?:boolean|number|string|undefined)$/;
      var uidCounter = 0;
      var contextProps = [
        "Array",
        "Date",
        "Function",
        "Math",
        "Object",
        "RegExp",
        "String",
        "_",
        "clearTimeout",
        "chrome",
        "chromium",
        "document",
        "navigator",
        "phantom",
        "platform",
        "process",
        "runtime",
        "setTimeout"
      ];
      var divisors = {
        "1": 4096,
        "2": 512,
        "3": 64,
        "4": 8,
        "5": 0
      };
      var tTable = {
        "1": 12.706,
        "2": 4.303,
        "3": 3.182,
        "4": 2.776,
        "5": 2.571,
        "6": 2.447,
        "7": 2.365,
        "8": 2.306,
        "9": 2.262,
        "10": 2.228,
        "11": 2.201,
        "12": 2.179,
        "13": 2.16,
        "14": 2.145,
        "15": 2.131,
        "16": 2.12,
        "17": 2.11,
        "18": 2.101,
        "19": 2.093,
        "20": 2.086,
        "21": 2.08,
        "22": 2.074,
        "23": 2.069,
        "24": 2.064,
        "25": 2.06,
        "26": 2.056,
        "27": 2.052,
        "28": 2.048,
        "29": 2.045,
        "30": 2.042,
        "infinity": 1.96
      };
      var uTable = {
        "5": [0, 1, 2],
        "6": [1, 2, 3, 5],
        "7": [1, 3, 5, 6, 8],
        "8": [2, 4, 6, 8, 10, 13],
        "9": [2, 4, 7, 10, 12, 15, 17],
        "10": [3, 5, 8, 11, 14, 17, 20, 23],
        "11": [3, 6, 9, 13, 16, 19, 23, 26, 30],
        "12": [4, 7, 11, 14, 18, 22, 26, 29, 33, 37],
        "13": [4, 8, 12, 16, 20, 24, 28, 33, 37, 41, 45],
        "14": [5, 9, 13, 17, 22, 26, 31, 36, 40, 45, 50, 55],
        "15": [5, 10, 14, 19, 24, 29, 34, 39, 44, 49, 54, 59, 64],
        "16": [6, 11, 15, 21, 26, 31, 37, 42, 47, 53, 59, 64, 70, 75],
        "17": [6, 11, 17, 22, 28, 34, 39, 45, 51, 57, 63, 67, 75, 81, 87],
        "18": [7, 12, 18, 24, 30, 36, 42, 48, 55, 61, 67, 74, 80, 86, 93, 99],
        "19": [7, 13, 19, 25, 32, 38, 45, 52, 58, 65, 72, 78, 85, 92, 99, 106, 113],
        "20": [8, 14, 20, 27, 34, 41, 48, 55, 62, 69, 76, 83, 90, 98, 105, 112, 119, 127],
        "21": [8, 15, 22, 29, 36, 43, 50, 58, 65, 73, 80, 88, 96, 103, 111, 119, 126, 134, 142],
        "22": [9, 16, 23, 30, 38, 45, 53, 61, 69, 77, 85, 93, 101, 109, 117, 125, 133, 141, 150, 158],
        "23": [9, 17, 24, 32, 40, 48, 56, 64, 73, 81, 89, 98, 106, 115, 123, 132, 140, 149, 157, 166, 175],
        "24": [10, 17, 25, 33, 42, 50, 59, 67, 76, 85, 94, 102, 111, 120, 129, 138, 147, 156, 165, 174, 183, 192],
        "25": [10, 18, 27, 35, 44, 53, 62, 71, 80, 89, 98, 107, 117, 126, 135, 145, 154, 163, 173, 182, 192, 201, 211],
        "26": [11, 19, 28, 37, 46, 55, 64, 74, 83, 93, 102, 112, 122, 132, 141, 151, 161, 171, 181, 191, 200, 210, 220, 230],
        "27": [11, 20, 29, 38, 48, 57, 67, 77, 87, 97, 107, 118, 125, 138, 147, 158, 168, 178, 188, 199, 209, 219, 230, 240, 250],
        "28": [12, 21, 30, 40, 50, 60, 70, 80, 90, 101, 111, 122, 132, 143, 154, 164, 175, 186, 196, 207, 218, 228, 239, 250, 261, 272],
        "29": [13, 22, 32, 42, 52, 62, 73, 83, 94, 105, 116, 127, 138, 149, 160, 171, 182, 193, 204, 215, 226, 238, 249, 260, 271, 282, 294],
        "30": [13, 23, 33, 43, 54, 65, 76, 87, 98, 109, 120, 131, 143, 154, 166, 177, 189, 200, 212, 223, 235, 247, 258, 270, 282, 293, 305, 317]
      };
      function runInContext(context) {
        var _ = context && context._ || require2("lodash") || root._;
        if (!_) {
          Benchmark3.runInContext = runInContext;
          return Benchmark3;
        }
        context = context ? _.defaults(root.Object(), context, _.pick(root, contextProps)) : root;
        var Array2 = context.Array, Date2 = context.Date, Function = context.Function, Math2 = context.Math, Object2 = context.Object, RegExp2 = context.RegExp, String2 = context.String;
        var arrayRef = [], objectProto = Object2.prototype;
        var abs = Math2.abs, clearTimeout2 = context.clearTimeout, floor = Math2.floor, log = Math2.log, max = Math2.max, min = Math2.min, pow = Math2.pow, push = arrayRef.push, setTimeout2 = context.setTimeout, shift = arrayRef.shift, slice = arrayRef.slice, sqrt = Math2.sqrt, toString = objectProto.toString, unshift = arrayRef.unshift;
        var req = require2;
        var doc = isHostType(context, "document") && context.document;
        var microtimeObject = req("microtime");
        var processObject = isHostType(context, "process") && context.process;
        var trash = doc && doc.createElement("div");
        var uid = "uid" + _.now();
        var calledBy = {};
        var support = {};
        (function() {
          support.browser = doc && isHostType(context, "navigator") && !isHostType(context, "phantom");
          support.timeout = isHostType(context, "setTimeout") && isHostType(context, "clearTimeout");
          try {
            support.decompilation = Function(
              ("return (" + function(x) {
                return { "x": "" + (1 + x), "y": 0 };
              } + ")").replace(/__cov__[^;]+;/g, "")
            )()(0).x === "1";
          } catch (e) {
            support.decompilation = false;
          }
        })();
        var timer = {
          /**
           * The timer namespace object or constructor.
           *
           * @private
           * @memberOf timer
           * @type {Function|Object}
           */
          "ns": Date2,
          /**
           * Starts the deferred timer.
           *
           * @private
           * @memberOf timer
           * @param {Object} deferred The deferred instance.
           */
          "start": null,
          // Lazy defined in `clock()`.
          /**
           * Stops the deferred timer.
           *
           * @private
           * @memberOf timer
           * @param {Object} deferred The deferred instance.
           */
          "stop": null
          // Lazy defined in `clock()`.
        };
        function Benchmark3(name, fn, options) {
          var bench = this;
          if (!(bench instanceof Benchmark3)) {
            return new Benchmark3(name, fn, options);
          }
          if (_.isPlainObject(name)) {
            options = name;
          } else if (_.isFunction(name)) {
            options = fn;
            fn = name;
          } else if (_.isPlainObject(fn)) {
            options = fn;
            fn = null;
            bench.name = name;
          } else {
            bench.name = name;
          }
          setOptions(bench, options);
          bench.id || (bench.id = ++counter);
          bench.fn == null && (bench.fn = fn);
          bench.stats = cloneDeep(bench.stats);
          bench.times = cloneDeep(bench.times);
        }
        function Deferred(clone2) {
          var deferred = this;
          if (!(deferred instanceof Deferred)) {
            return new Deferred(clone2);
          }
          deferred.benchmark = clone2;
          clock(deferred);
        }
        function Event(type) {
          var event = this;
          if (type instanceof Event) {
            return type;
          }
          return event instanceof Event ? _.assign(event, { "timeStamp": _.now() }, typeof type == "string" ? { "type": type } : type) : new Event(type);
        }
        function Suite(name, options) {
          var suite = this;
          if (!(suite instanceof Suite)) {
            return new Suite(name, options);
          }
          if (_.isPlainObject(name)) {
            options = name;
          } else {
            suite.name = name;
          }
          setOptions(suite, options);
        }
        var cloneDeep = _.partial(_.cloneDeepWith, _, function(value) {
          if (!_.isArray(value) && !_.isPlainObject(value)) {
            return value;
          }
        });
        function createFunction() {
          createFunction = function(args, body) {
            var result, anchor = freeDefine ? freeDefine.amd : Benchmark3, prop = uid + "createFunction";
            runScript((freeDefine ? "define.amd." : "Benchmark.") + prop + "=function(" + args + "){" + body + "}");
            result = anchor[prop];
            delete anchor[prop];
            return result;
          };
          createFunction = support.browser && (createFunction("", 'return"' + uid + '"') || _.noop)() == uid ? createFunction : Function;
          return createFunction.apply(null, arguments);
        }
        function delay(bench, fn) {
          bench._timerId = _.delay(fn, bench.delay * 1e3);
        }
        function destroyElement(element) {
          trash.appendChild(element);
          trash.innerHTML = "";
        }
        function getFirstArgument(fn) {
          return !_.has(fn, "toString") && (/^[\s(]*function[^(]*\(([^\s,)]+)/.exec(fn) || 0)[1] || "";
        }
        function getMean(sample) {
          return _.reduce(sample, function(sum, x) {
            return sum + x;
          }) / sample.length || 0;
        }
        function getSource(fn) {
          var result = "";
          if (isStringable(fn)) {
            result = String2(fn);
          } else if (support.decompilation) {
            result = _.result(/^[^{]+\{([\s\S]*)\}\s*$/.exec(fn), 1);
          }
          result = (result || "").replace(/^\s+|\s+$/g, "");
          return /^(?:\/\*+[\w\W]*?\*\/|\/\/.*?[\n\r\u2028\u2029]|\s)*(["'])use strict\1;?$/.test(result) ? "" : result;
        }
        function isClassOf(value, name) {
          return value != null && toString.call(value) == "[object " + name + "]";
        }
        function isHostType(object, property) {
          if (object == null) {
            return false;
          }
          var type = typeof object[property];
          return !rePrimitive.test(type) && (type != "object" || !!object[property]);
        }
        function isStringable(value) {
          return _.isString(value) || _.has(value, "toString") && _.isFunction(value.toString);
        }
        function require2(id) {
          try {
            var result = freeExports && freeRequire(id);
          } catch (e) {
          }
          return result || null;
        }
        function runScript(code) {
          var anchor = freeDefine ? define.amd : Benchmark3, script = doc.createElement("script"), sibling = doc.getElementsByTagName("script")[0], parent = sibling.parentNode, prop = uid + "runScript", prefix = "(" + (freeDefine ? "define.amd." : "Benchmark.") + prop + "||function(){})();";
          try {
            script.appendChild(doc.createTextNode(prefix + code));
            anchor[prop] = function() {
              destroyElement(script);
            };
          } catch (e) {
            parent = parent.cloneNode(false);
            sibling = null;
            script.text = code;
          }
          parent.insertBefore(script, sibling);
          delete anchor[prop];
        }
        function setOptions(object, options) {
          options = object.options = _.assign({}, cloneDeep(object.constructor.options), cloneDeep(options));
          _.forOwn(options, function(value, key) {
            if (value != null) {
              if (/^on[A-Z]/.test(key)) {
                _.each(key.split(" "), function(key2) {
                  object.on(key2.slice(2).toLowerCase(), value);
                });
              } else if (!_.has(object, key)) {
                object[key] = cloneDeep(value);
              }
            }
          });
        }
        function resolve() {
          var deferred = this, clone2 = deferred.benchmark, bench = clone2._original;
          if (bench.aborted) {
            deferred.teardown();
            clone2.running = false;
            cycle(deferred);
          } else if (++deferred.cycles < clone2.count) {
            clone2.compiled.call(deferred, context, timer);
          } else {
            timer.stop(deferred);
            deferred.teardown();
            delay(clone2, function() {
              cycle(deferred);
            });
          }
        }
        function filter(array, callback) {
          if (callback === "successful") {
            callback = function(bench) {
              return bench.cycles && _.isFinite(bench.hz) && !bench.error;
            };
          } else if (callback === "fastest" || callback === "slowest") {
            var result = filter(array, "successful").sort(function(a, b) {
              a = a.stats;
              b = b.stats;
              return (a.mean + a.moe > b.mean + b.moe ? 1 : -1) * (callback === "fastest" ? 1 : -1);
            });
            return _.filter(result, function(bench) {
              return result[0].compare(bench) == 0;
            });
          }
          return _.filter(array, callback);
        }
        function formatNumber(number) {
          number = String2(number).split(".");
          return number[0].replace(/(?=(?:\d{3})+$)(?!\b)/g, ",") + (number[1] ? "." + number[1] : "");
        }
        function invoke(benches, name) {
          var args, bench, queued, index = -1, eventProps = { "currentTarget": benches }, options = { "onStart": _.noop, "onCycle": _.noop, "onComplete": _.noop }, result = _.toArray(benches);
          function execute2() {
            var listeners2, async = isAsync(bench);
            if (async) {
              bench.on("complete", getNext);
              listeners2 = bench.events.complete;
              listeners2.splice(0, 0, listeners2.pop());
            }
            result[index] = _.isFunction(bench && bench[name]) ? bench[name].apply(bench, args) : undefined2;
            return !async && getNext();
          }
          function getNext(event) {
            var cycleEvent, last = bench, async = isAsync(last);
            if (async) {
              last.off("complete", getNext);
              last.emit("complete");
            }
            eventProps.type = "cycle";
            eventProps.target = last;
            cycleEvent = Event(eventProps);
            options.onCycle.call(benches, cycleEvent);
            if (!cycleEvent.aborted && raiseIndex() !== false) {
              bench = queued ? benches[0] : result[index];
              if (isAsync(bench)) {
                delay(bench, execute2);
              } else if (async) {
                while (execute2()) {
                }
              } else {
                return true;
              }
            } else {
              eventProps.type = "complete";
              options.onComplete.call(benches, Event(eventProps));
            }
            if (event) {
              event.aborted = true;
            } else {
              return false;
            }
          }
          function isAsync(object) {
            var async = args[0] && args[0].async;
            return name == "run" && object instanceof Benchmark3 && ((async == null ? object.options.async : async) && support.timeout || object.defer);
          }
          function raiseIndex() {
            index++;
            if (queued && index > 0) {
              shift.call(benches);
            }
            return (queued ? benches.length : index < result.length) ? index : index = false;
          }
          if (_.isString(name)) {
            args = slice.call(arguments, 2);
          } else {
            options = _.assign(options, name);
            name = options.name;
            args = _.isArray(args = "args" in options ? options.args : []) ? args : [args];
            queued = options.queued;
          }
          if (raiseIndex() !== false) {
            bench = result[index];
            eventProps.type = "start";
            eventProps.target = bench;
            options.onStart.call(benches, Event(eventProps));
            if (name == "run" && benches instanceof Suite && benches.aborted) {
              eventProps.type = "cycle";
              options.onCycle.call(benches, Event(eventProps));
              eventProps.type = "complete";
              options.onComplete.call(benches, Event(eventProps));
            } else {
              if (isAsync(bench)) {
                delay(bench, execute2);
              } else {
                while (execute2()) {
                }
              }
            }
          }
          return result;
        }
        function join(object, separator1, separator2) {
          var result = [], length = (object = Object2(object)).length, arrayLike = length === length >>> 0;
          separator2 || (separator2 = ": ");
          _.each(object, function(value, key) {
            result.push(arrayLike ? value : key + separator2 + value);
          });
          return result.join(separator1 || ",");
        }
        function abortSuite() {
          var event, suite = this, resetting = calledBy.resetSuite;
          if (suite.running) {
            event = Event("abort");
            suite.emit(event);
            if (!event.cancelled || resetting) {
              calledBy.abortSuite = true;
              suite.reset();
              delete calledBy.abortSuite;
              if (!resetting) {
                suite.aborted = true;
                invoke(suite, "abort");
              }
            }
          }
          return suite;
        }
        function add(name, fn, options) {
          var suite = this, bench = new Benchmark3(name, fn, options), event = Event({ "type": "add", "target": bench });
          if (suite.emit(event), !event.cancelled) {
            suite.push(bench);
          }
          return suite;
        }
        function cloneSuite(options) {
          var suite = this, result = new suite.constructor(_.assign({}, suite.options, options));
          _.forOwn(suite, function(value, key) {
            if (!_.has(result, key)) {
              result[key] = _.isFunction(_.get(value, "clone")) ? value.clone() : cloneDeep(value);
            }
          });
          return result;
        }
        function filterSuite(callback) {
          var suite = this, result = new suite.constructor(suite.options);
          result.push.apply(result, filter(suite, callback));
          return result;
        }
        function resetSuite() {
          var event, suite = this, aborting = calledBy.abortSuite;
          if (suite.running && !aborting) {
            calledBy.resetSuite = true;
            suite.abort();
            delete calledBy.resetSuite;
          } else if ((suite.aborted || suite.running) && (suite.emit(event = Event("reset")), !event.cancelled)) {
            suite.aborted = suite.running = false;
            if (!aborting) {
              invoke(suite, "reset");
            }
          }
          return suite;
        }
        function runSuite(options) {
          var suite = this;
          suite.reset();
          suite.running = true;
          options || (options = {});
          invoke(suite, {
            "name": "run",
            "args": options,
            "queued": options.queued,
            "onStart": function(event) {
              suite.emit(event);
            },
            "onCycle": function(event) {
              var bench = event.target;
              if (bench.error) {
                suite.emit({ "type": "error", "target": bench });
              }
              suite.emit(event);
              event.aborted = suite.aborted;
            },
            "onComplete": function(event) {
              suite.running = false;
              suite.emit(event);
            }
          });
          return suite;
        }
        function emit(type) {
          var listeners2, object = this, event = Event(type), events = object.events, args = (arguments[0] = event, arguments);
          event.currentTarget || (event.currentTarget = object);
          event.target || (event.target = object);
          delete event.result;
          if (events && (listeners2 = _.has(events, event.type) && events[event.type])) {
            _.each(listeners2.slice(), function(listener) {
              if ((event.result = listener.apply(object, args)) === false) {
                event.cancelled = true;
              }
              return !event.aborted;
            });
          }
          return event.result;
        }
        function listeners(type) {
          var object = this, events = object.events || (object.events = {});
          return _.has(events, type) ? events[type] : events[type] = [];
        }
        function off(type, listener) {
          var object = this, events = object.events;
          if (!events) {
            return object;
          }
          _.each(type ? type.split(" ") : events, function(listeners2, type2) {
            var index;
            if (typeof listeners2 == "string") {
              type2 = listeners2;
              listeners2 = _.has(events, type2) && events[type2];
            }
            if (listeners2) {
              if (listener) {
                index = _.indexOf(listeners2, listener);
                if (index > -1) {
                  listeners2.splice(index, 1);
                }
              } else {
                listeners2.length = 0;
              }
            }
          });
          return object;
        }
        function on(type, listener) {
          var object = this, events = object.events || (object.events = {});
          _.each(type.split(" "), function(type2) {
            (_.has(events, type2) ? events[type2] : events[type2] = []).push(listener);
          });
          return object;
        }
        function abort() {
          var event, bench = this, resetting = calledBy.reset;
          if (bench.running) {
            event = Event("abort");
            bench.emit(event);
            if (!event.cancelled || resetting) {
              calledBy.abort = true;
              bench.reset();
              delete calledBy.abort;
              if (support.timeout) {
                clearTimeout2(bench._timerId);
                delete bench._timerId;
              }
              if (!resetting) {
                bench.aborted = true;
                bench.running = false;
              }
            }
          }
          return bench;
        }
        function clone(options) {
          var bench = this, result = new bench.constructor(_.assign({}, bench, options));
          result.options = _.assign({}, cloneDeep(bench.options), cloneDeep(options));
          _.forOwn(bench, function(value, key) {
            if (!_.has(result, key)) {
              result[key] = cloneDeep(value);
            }
          });
          return result;
        }
        function compare(other) {
          var bench = this;
          if (bench == other) {
            return 0;
          }
          var critical, zStat, sample1 = bench.stats.sample, sample2 = other.stats.sample, size1 = sample1.length, size2 = sample2.length, maxSize = max(size1, size2), minSize = min(size1, size2), u1 = getU(sample1, sample2), u2 = getU(sample2, sample1), u = min(u1, u2);
          function getScore(xA, sampleB) {
            return _.reduce(sampleB, function(total, xB) {
              return total + (xB > xA ? 0 : xB < xA ? 1 : 0.5);
            }, 0);
          }
          function getU(sampleA, sampleB) {
            return _.reduce(sampleA, function(total, xA) {
              return total + getScore(xA, sampleB);
            }, 0);
          }
          function getZ(u3) {
            return (u3 - size1 * size2 / 2) / sqrt(size1 * size2 * (size1 + size2 + 1) / 12);
          }
          if (size1 + size2 > 30) {
            zStat = getZ(u);
            return abs(zStat) > 1.96 ? u == u1 ? 1 : -1 : 0;
          }
          critical = maxSize < 5 || minSize < 3 ? 0 : uTable[maxSize][minSize - 3];
          return u <= critical ? u == u1 ? 1 : -1 : 0;
        }
        function reset() {
          var bench = this;
          if (bench.running && !calledBy.abort) {
            calledBy.reset = true;
            bench.abort();
            delete calledBy.reset;
            return bench;
          }
          var event, index = 0, changes = [], queue = [];
          var data = {
            "destination": bench,
            "source": _.assign({}, cloneDeep(bench.constructor.prototype), cloneDeep(bench.options))
          };
          do {
            _.forOwn(data.source, function(value, key) {
              var changed, destination = data.destination, currValue = destination[key];
              if (/^_|^events$|^on[A-Z]/.test(key)) {
                return;
              }
              if (_.isObjectLike(value)) {
                if (_.isArray(value)) {
                  if (!_.isArray(currValue)) {
                    changed = true;
                    currValue = [];
                  }
                  if (currValue.length != value.length) {
                    changed = true;
                    currValue = currValue.slice(0, value.length);
                    currValue.length = value.length;
                  }
                } else if (!_.isObjectLike(currValue)) {
                  changed = true;
                  currValue = {};
                }
                if (changed) {
                  changes.push({ "destination": destination, "key": key, "value": currValue });
                }
                queue.push({ "destination": currValue, "source": value });
              } else if (!_.eq(currValue, value) && value !== undefined2) {
                changes.push({ "destination": destination, "key": key, "value": value });
              }
            });
          } while (data = queue[index++]);
          if (changes.length && (bench.emit(event = Event("reset")), !event.cancelled)) {
            _.each(changes, function(data2) {
              data2.destination[data2.key] = data2.value;
            });
          }
          return bench;
        }
        function toStringBench() {
          var bench = this, error = bench.error, hz = bench.hz, id = bench.id, stats = bench.stats, size = stats.sample.length, pm = "\xB1", result = bench.name || (_.isNaN(id) ? id : "<Test #" + id + ">");
          if (error) {
            var errorStr;
            if (!_.isObject(error)) {
              errorStr = String2(error);
            } else if (!_.isError(Error)) {
              errorStr = join(error);
            } else {
              errorStr = join(_.assign({ "name": error.name, "message": error.message }, error));
            }
            result += ": " + errorStr;
          } else {
            result += " x " + formatNumber(hz.toFixed(hz < 100 ? 2 : 0)) + " ops/sec " + pm + stats.rme.toFixed(2) + "% (" + size + " run" + (size == 1 ? "" : "s") + " sampled)";
          }
          return result;
        }
        function clock() {
          var options = Benchmark3.options, templateData = {}, timers = [{ "ns": timer.ns, "res": max(15e-4, getRes("ms")), "unit": "ms" }];
          clock = function(clone2) {
            var deferred;
            if (clone2 instanceof Deferred) {
              deferred = clone2;
              clone2 = deferred.benchmark;
            }
            var bench = clone2._original, stringable = isStringable(bench.fn), count = bench.count = clone2.count, decompilable = stringable || support.decompilation && (clone2.setup !== _.noop || clone2.teardown !== _.noop), id = bench.id, name = bench.name || (typeof id == "number" ? "<Test #" + id + ">" : id), result = 0;
            clone2.minTime = bench.minTime || (bench.minTime = bench.options.minTime = options.minTime);
            var funcBody = deferred ? 'var d#=this,${fnArg}=d#,m#=d#.benchmark._original,f#=m#.fn,su#=m#.setup,td#=m#.teardown;if(!d#.cycles){d#.fn=function(){var ${fnArg}=d#;if(typeof f#=="function"){try{${fn}\n}catch(e#){f#(d#)}}else{${fn}\n}};d#.teardown=function(){d#.cycles=0;if(typeof td#=="function"){try{${teardown}\n}catch(e#){td#()}}else{${teardown}\n}};if(typeof su#=="function"){try{${setup}\n}catch(e#){su#()}}else{${setup}\n};t#.start(d#);}d#.fn();return{uid:"${uid}"}' : 'var r#,s#,m#=this,f#=m#.fn,i#=m#.count,n#=t#.ns;${setup}\n${begin};while(i#--){${fn}\n}${end};${teardown}\nreturn{elapsed:r#,uid:"${uid}"}';
            var compiled = bench.compiled = clone2.compiled = createCompiled(bench, decompilable, deferred, funcBody), isEmpty = !(templateData.fn || stringable);
            try {
              if (isEmpty) {
                throw new Error('The test "' + name + '" is empty. This may be the result of dead code removal.');
              } else if (!deferred) {
                bench.count = 1;
                compiled = decompilable && (compiled.call(bench, context, timer) || {}).uid == templateData.uid && compiled;
                bench.count = count;
              }
            } catch (e) {
              compiled = null;
              clone2.error = e || new Error(String2(e));
              bench.count = count;
            }
            if (!compiled && !deferred && !isEmpty) {
              funcBody = (stringable || decompilable && !clone2.error ? "function f#(){${fn}\n}var r#,s#,m#=this,i#=m#.count" : "var r#,s#,m#=this,f#=m#.fn,i#=m#.count") + ",n#=t#.ns;${setup}\n${begin};m#.f#=f#;while(i#--){m#.f#()}${end};delete m#.f#;${teardown}\nreturn{elapsed:r#}";
              compiled = createCompiled(bench, decompilable, deferred, funcBody);
              try {
                bench.count = 1;
                compiled.call(bench, context, timer);
                bench.count = count;
                delete clone2.error;
              } catch (e) {
                bench.count = count;
                if (!clone2.error) {
                  clone2.error = e || new Error(String2(e));
                }
              }
            }
            if (!clone2.error) {
              compiled = bench.compiled = clone2.compiled = createCompiled(bench, decompilable, deferred, funcBody);
              result = compiled.call(deferred || bench, context, timer).elapsed;
            }
            return result;
          };
          function createCompiled(bench, decompilable, deferred, body) {
            var fn = bench.fn, fnArg = deferred ? getFirstArgument(fn) || "deferred" : "";
            templateData.uid = uid + uidCounter++;
            _.assign(templateData, {
              "setup": decompilable ? getSource(bench.setup) : interpolate("m#.setup()"),
              "fn": decompilable ? getSource(fn) : interpolate("m#.fn(" + fnArg + ")"),
              "fnArg": fnArg,
              "teardown": decompilable ? getSource(bench.teardown) : interpolate("m#.teardown()")
            });
            if (timer.unit == "ns") {
              _.assign(templateData, {
                "begin": interpolate("s#=n#()"),
                "end": interpolate("r#=n#(s#);r#=r#[0]+(r#[1]/1e9)")
              });
            } else if (timer.unit == "us") {
              if (timer.ns.stop) {
                _.assign(templateData, {
                  "begin": interpolate("s#=n#.start()"),
                  "end": interpolate("r#=n#.microseconds()/1e6")
                });
              } else {
                _.assign(templateData, {
                  "begin": interpolate("s#=n#()"),
                  "end": interpolate("r#=(n#()-s#)/1e6")
                });
              }
            } else if (timer.ns.now) {
              _.assign(templateData, {
                "begin": interpolate("s#=n#.now()"),
                "end": interpolate("r#=(n#.now()-s#)/1e3")
              });
            } else {
              _.assign(templateData, {
                "begin": interpolate("s#=new n#().getTime()"),
                "end": interpolate("r#=(new n#().getTime()-s#)/1e3")
              });
            }
            timer.start = createFunction(
              interpolate("o#"),
              interpolate("var n#=this.ns,${begin};o#.elapsed=0;o#.timeStamp=s#")
            );
            timer.stop = createFunction(
              interpolate("o#"),
              interpolate("var n#=this.ns,s#=o#.timeStamp,${end};o#.elapsed=r#")
            );
            return createFunction(
              interpolate("window,t#"),
              "var global = window, clearTimeout = global.clearTimeout, setTimeout = global.setTimeout;\n" + interpolate(body)
            );
          }
          function getRes(unit) {
            var measured, begin, count = 30, divisor = 1e3, ns = timer.ns, sample = [];
            while (count--) {
              if (unit == "us") {
                divisor = 1e6;
                if (ns.stop) {
                  ns.start();
                  while (!(measured = ns.microseconds())) {
                  }
                } else {
                  begin = ns();
                  while (!(measured = ns() - begin)) {
                  }
                }
              } else if (unit == "ns") {
                divisor = 1e9;
                begin = (begin = ns())[0] + begin[1] / divisor;
                while (!(measured = (measured = ns())[0] + measured[1] / divisor - begin)) {
                }
                divisor = 1;
              } else if (ns.now) {
                begin = ns.now();
                while (!(measured = ns.now() - begin)) {
                }
              } else {
                begin = new ns().getTime();
                while (!(measured = new ns().getTime() - begin)) {
                }
              }
              if (measured > 0) {
                sample.push(measured);
              } else {
                sample.push(Infinity);
                break;
              }
            }
            return getMean(sample) / divisor;
          }
          function interpolate(string) {
            return _.template(string.replace(/\#/g, /\d+/.exec(templateData.uid)))(templateData);
          }
          try {
            if (timer.ns = new (context.chrome || context.chromium).Interval()) {
              timers.push({ "ns": timer.ns, "res": getRes("us"), "unit": "us" });
            }
          } catch (e) {
          }
          if (processObject && typeof (timer.ns = processObject.hrtime) == "function") {
            timers.push({ "ns": timer.ns, "res": getRes("ns"), "unit": "ns" });
          }
          if (microtimeObject && typeof (timer.ns = microtimeObject.now) == "function") {
            timers.push({ "ns": timer.ns, "res": getRes("us"), "unit": "us" });
          }
          timer = _.minBy(timers, "res");
          if (timer.res == Infinity) {
            throw new Error("Benchmark.js was unable to find a working timer.");
          }
          options.minTime || (options.minTime = max(timer.res / 2 / 0.01, 0.05));
          return clock.apply(null, arguments);
        }
        function compute(bench, options) {
          options || (options = {});
          var async = options.async, elapsed = 0, initCount = bench.initCount, minSamples = bench.minSamples, queue = [], sample = bench.stats.sample;
          function enqueue() {
            queue.push(_.assign(bench.clone(), {
              "_original": bench,
              "events": {
                "abort": [update],
                "cycle": [update],
                "error": [update],
                "start": [update]
              }
            }));
          }
          function update(event) {
            var clone2 = this, type = event.type;
            if (bench.running) {
              if (type == "start") {
                clone2.count = bench.initCount;
              } else {
                if (type == "error") {
                  bench.error = clone2.error;
                }
                if (type == "abort") {
                  bench.abort();
                  bench.emit("cycle");
                } else {
                  event.currentTarget = event.target = bench;
                  bench.emit(event);
                }
              }
            } else if (bench.aborted) {
              clone2.events.abort.length = 0;
              clone2.abort();
            }
          }
          function evaluate(event) {
            var critical, df, mean, moe, rme, sd, sem, variance, clone2 = event.target, done = bench.aborted, now = _.now(), size = sample.push(clone2.times.period), maxedOut = size >= minSamples && (elapsed += now - clone2.times.timeStamp) / 1e3 > bench.maxTime, times = bench.times, varOf = function(sum, x) {
              return sum + pow(x - mean, 2);
            };
            if (done || clone2.hz == Infinity) {
              maxedOut = !(size = sample.length = queue.length = 0);
            }
            if (!done) {
              mean = getMean(sample);
              variance = _.reduce(sample, varOf, 0) / (size - 1) || 0;
              sd = sqrt(variance);
              sem = sd / sqrt(size);
              df = size - 1;
              critical = tTable[Math2.round(df) || 1] || tTable.infinity;
              moe = sem * critical;
              rme = moe / mean * 100 || 0;
              _.assign(bench.stats, {
                "deviation": sd,
                "mean": mean,
                "moe": moe,
                "rme": rme,
                "sem": sem,
                "variance": variance
              });
              if (maxedOut) {
                bench.initCount = initCount;
                bench.running = false;
                done = true;
                times.elapsed = (now - times.timeStamp) / 1e3;
              }
              if (bench.hz != Infinity) {
                bench.hz = 1 / mean;
                times.cycle = mean * bench.count;
                times.period = mean;
              }
            }
            if (queue.length < 2 && !maxedOut) {
              enqueue();
            }
            event.aborted = done;
          }
          enqueue();
          invoke(queue, {
            "name": "run",
            "args": { "async": async },
            "queued": true,
            "onCycle": evaluate,
            "onComplete": function() {
              bench.emit("complete");
            }
          });
        }
        function cycle(clone2, options) {
          options || (options = {});
          var deferred;
          if (clone2 instanceof Deferred) {
            deferred = clone2;
            clone2 = clone2.benchmark;
          }
          var clocked, cycles, divisor, event, minTime, period, async = options.async, bench = clone2._original, count = clone2.count, times = clone2.times;
          if (clone2.running) {
            cycles = ++clone2.cycles;
            clocked = deferred ? deferred.elapsed : clock(clone2);
            minTime = clone2.minTime;
            if (cycles > bench.cycles) {
              bench.cycles = cycles;
            }
            if (clone2.error) {
              event = Event("error");
              event.message = clone2.error;
              clone2.emit(event);
              if (!event.cancelled) {
                clone2.abort();
              }
            }
          }
          if (clone2.running) {
            bench.times.cycle = times.cycle = clocked;
            period = bench.times.period = times.period = clocked / count;
            bench.hz = clone2.hz = 1 / period;
            bench.initCount = clone2.initCount = count;
            clone2.running = clocked < minTime;
            if (clone2.running) {
              if (!clocked && (divisor = divisors[clone2.cycles]) != null) {
                count = floor(4e6 / divisor);
              }
              if (count <= clone2.count) {
                count += Math2.ceil((minTime - clocked) / period);
              }
              clone2.running = count != Infinity;
            }
          }
          event = Event("cycle");
          clone2.emit(event);
          if (event.aborted) {
            clone2.abort();
          }
          if (clone2.running) {
            clone2.count = count;
            if (deferred) {
              clone2.compiled.call(deferred, context, timer);
            } else if (async) {
              delay(clone2, function() {
                cycle(clone2, options);
              });
            } else {
              cycle(clone2);
            }
          } else {
            if (support.browser) {
              runScript(uid + "=1;delete " + uid);
            }
            clone2.emit("complete");
          }
        }
        function run(options) {
          var bench = this, event = Event("start");
          bench.running = false;
          bench.reset();
          bench.running = true;
          bench.count = bench.initCount;
          bench.times.timeStamp = _.now();
          bench.emit(event);
          if (!event.cancelled) {
            options = { "async": ((options = options && options.async) == null ? bench.async : options) && support.timeout };
            if (bench._original) {
              if (bench.defer) {
                Deferred(bench);
              } else {
                cycle(bench, options);
              }
            } else {
              compute(bench, options);
            }
          }
          return bench;
        }
        _.assign(Benchmark3, {
          /**
           * The default options copied by benchmark instances.
           *
           * @static
           * @memberOf Benchmark
           * @type Object
           */
          "options": {
            /**
             * A flag to indicate that benchmark cycles will execute asynchronously
             * by default.
             *
             * @memberOf Benchmark.options
             * @type boolean
             */
            "async": false,
            /**
             * A flag to indicate that the benchmark clock is deferred.
             *
             * @memberOf Benchmark.options
             * @type boolean
             */
            "defer": false,
            /**
             * The delay between test cycles (secs).
             * @memberOf Benchmark.options
             * @type number
             */
            "delay": 5e-3,
            /**
             * Displayed by `Benchmark#toString` when a `name` is not available
             * (auto-generated if absent).
             *
             * @memberOf Benchmark.options
             * @type string
             */
            "id": undefined2,
            /**
             * The default number of times to execute a test on a benchmark's first cycle.
             *
             * @memberOf Benchmark.options
             * @type number
             */
            "initCount": 1,
            /**
             * The maximum time a benchmark is allowed to run before finishing (secs).
             *
             * Note: Cycle delays aren't counted toward the maximum time.
             *
             * @memberOf Benchmark.options
             * @type number
             */
            "maxTime": 5,
            /**
             * The minimum sample size required to perform statistical analysis.
             *
             * @memberOf Benchmark.options
             * @type number
             */
            "minSamples": 5,
            /**
             * The time needed to reduce the percent uncertainty of measurement to 1% (secs).
             *
             * @memberOf Benchmark.options
             * @type number
             */
            "minTime": 0,
            /**
             * The name of the benchmark.
             *
             * @memberOf Benchmark.options
             * @type string
             */
            "name": undefined2,
            /**
             * An event listener called when the benchmark is aborted.
             *
             * @memberOf Benchmark.options
             * @type Function
             */
            "onAbort": undefined2,
            /**
             * An event listener called when the benchmark completes running.
             *
             * @memberOf Benchmark.options
             * @type Function
             */
            "onComplete": undefined2,
            /**
             * An event listener called after each run cycle.
             *
             * @memberOf Benchmark.options
             * @type Function
             */
            "onCycle": undefined2,
            /**
             * An event listener called when a test errors.
             *
             * @memberOf Benchmark.options
             * @type Function
             */
            "onError": undefined2,
            /**
             * An event listener called when the benchmark is reset.
             *
             * @memberOf Benchmark.options
             * @type Function
             */
            "onReset": undefined2,
            /**
             * An event listener called when the benchmark starts running.
             *
             * @memberOf Benchmark.options
             * @type Function
             */
            "onStart": undefined2
          },
          /**
           * Platform object with properties describing things like browser name,
           * version, and operating system. See [`platform.js`](https://mths.be/platform).
           *
           * @static
           * @memberOf Benchmark
           * @type Object
           */
          "platform": context.platform || require2("platform") || {
            "description": context.navigator && context.navigator.userAgent || null,
            "layout": null,
            "product": null,
            "name": null,
            "manufacturer": null,
            "os": null,
            "prerelease": null,
            "version": null,
            "toString": function() {
              return this.description || "";
            }
          },
          /**
           * The semantic version number.
           *
           * @static
           * @memberOf Benchmark
           * @type string
           */
          "version": "2.1.4"
        });
        _.assign(Benchmark3, {
          "filter": filter,
          "formatNumber": formatNumber,
          "invoke": invoke,
          "join": join,
          "runInContext": runInContext,
          "support": support
        });
        _.each(["each", "forEach", "forOwn", "has", "indexOf", "map", "reduce"], function(methodName) {
          Benchmark3[methodName] = _[methodName];
        });
        _.assign(Benchmark3.prototype, {
          /**
           * The number of times a test was executed.
           *
           * @memberOf Benchmark
           * @type number
           */
          "count": 0,
          /**
           * The number of cycles performed while benchmarking.
           *
           * @memberOf Benchmark
           * @type number
           */
          "cycles": 0,
          /**
           * The number of executions per second.
           *
           * @memberOf Benchmark
           * @type number
           */
          "hz": 0,
          /**
           * The compiled test function.
           *
           * @memberOf Benchmark
           * @type {Function|string}
           */
          "compiled": undefined2,
          /**
           * The error object if the test failed.
           *
           * @memberOf Benchmark
           * @type Object
           */
          "error": undefined2,
          /**
           * The test to benchmark.
           *
           * @memberOf Benchmark
           * @type {Function|string}
           */
          "fn": undefined2,
          /**
           * A flag to indicate if the benchmark is aborted.
           *
           * @memberOf Benchmark
           * @type boolean
           */
          "aborted": false,
          /**
           * A flag to indicate if the benchmark is running.
           *
           * @memberOf Benchmark
           * @type boolean
           */
          "running": false,
          /**
           * Compiled into the test and executed immediately **before** the test loop.
           *
           * @memberOf Benchmark
           * @type {Function|string}
           * @example
           *
           * // basic usage
           * var bench = Benchmark({
           *   'setup': function() {
           *     var c = this.count,
           *         element = document.getElementById('container');
           *     while (c--) {
           *       element.appendChild(document.createElement('div'));
           *     }
           *   },
           *   'fn': function() {
           *     element.removeChild(element.lastChild);
           *   }
           * });
           *
           * // compiles to something like:
           * var c = this.count,
           *     element = document.getElementById('container');
           * while (c--) {
           *   element.appendChild(document.createElement('div'));
           * }
           * var start = new Date;
           * while (count--) {
           *   element.removeChild(element.lastChild);
           * }
           * var end = new Date - start;
           *
           * // or using strings
           * var bench = Benchmark({
           *   'setup': '\
           *     var a = 0;\n\
           *     (function() {\n\
           *       (function() {\n\
           *         (function() {',
           *   'fn': 'a += 1;',
           *   'teardown': '\
           *          }())\n\
           *        }())\n\
           *      }())'
           * });
           *
           * // compiles to something like:
           * var a = 0;
           * (function() {
           *   (function() {
           *     (function() {
           *       var start = new Date;
           *       while (count--) {
           *         a += 1;
           *       }
           *       var end = new Date - start;
           *     }())
           *   }())
           * }())
           */
          "setup": _.noop,
          /**
           * Compiled into the test and executed immediately **after** the test loop.
           *
           * @memberOf Benchmark
           * @type {Function|string}
           */
          "teardown": _.noop,
          /**
           * An object of stats including mean, margin or error, and standard deviation.
           *
           * @memberOf Benchmark
           * @type Object
           */
          "stats": {
            /**
             * The margin of error.
             *
             * @memberOf Benchmark#stats
             * @type number
             */
            "moe": 0,
            /**
             * The relative margin of error (expressed as a percentage of the mean).
             *
             * @memberOf Benchmark#stats
             * @type number
             */
            "rme": 0,
            /**
             * The standard error of the mean.
             *
             * @memberOf Benchmark#stats
             * @type number
             */
            "sem": 0,
            /**
             * The sample standard deviation.
             *
             * @memberOf Benchmark#stats
             * @type number
             */
            "deviation": 0,
            /**
             * The sample arithmetic mean (secs).
             *
             * @memberOf Benchmark#stats
             * @type number
             */
            "mean": 0,
            /**
             * The array of sampled periods.
             *
             * @memberOf Benchmark#stats
             * @type Array
             */
            "sample": [],
            /**
             * The sample variance.
             *
             * @memberOf Benchmark#stats
             * @type number
             */
            "variance": 0
          },
          /**
           * An object of timing data including cycle, elapsed, period, start, and stop.
           *
           * @memberOf Benchmark
           * @type Object
           */
          "times": {
            /**
             * The time taken to complete the last cycle (secs).
             *
             * @memberOf Benchmark#times
             * @type number
             */
            "cycle": 0,
            /**
             * The time taken to complete the benchmark (secs).
             *
             * @memberOf Benchmark#times
             * @type number
             */
            "elapsed": 0,
            /**
             * The time taken to execute the test once (secs).
             *
             * @memberOf Benchmark#times
             * @type number
             */
            "period": 0,
            /**
             * A timestamp of when the benchmark started (ms).
             *
             * @memberOf Benchmark#times
             * @type number
             */
            "timeStamp": 0
          }
        });
        _.assign(Benchmark3.prototype, {
          "abort": abort,
          "clone": clone,
          "compare": compare,
          "emit": emit,
          "listeners": listeners,
          "off": off,
          "on": on,
          "reset": reset,
          "run": run,
          "toString": toStringBench
        });
        _.assign(Deferred.prototype, {
          /**
           * The deferred benchmark instance.
           *
           * @memberOf Benchmark.Deferred
           * @type Object
           */
          "benchmark": null,
          /**
           * The number of deferred cycles performed while benchmarking.
           *
           * @memberOf Benchmark.Deferred
           * @type number
           */
          "cycles": 0,
          /**
           * The time taken to complete the deferred benchmark (secs).
           *
           * @memberOf Benchmark.Deferred
           * @type number
           */
          "elapsed": 0,
          /**
           * A timestamp of when the deferred benchmark started (ms).
           *
           * @memberOf Benchmark.Deferred
           * @type number
           */
          "timeStamp": 0
        });
        _.assign(Deferred.prototype, {
          "resolve": resolve
        });
        _.assign(Event.prototype, {
          /**
           * A flag to indicate if the emitters listener iteration is aborted.
           *
           * @memberOf Benchmark.Event
           * @type boolean
           */
          "aborted": false,
          /**
           * A flag to indicate if the default action is cancelled.
           *
           * @memberOf Benchmark.Event
           * @type boolean
           */
          "cancelled": false,
          /**
           * The object whose listeners are currently being processed.
           *
           * @memberOf Benchmark.Event
           * @type Object
           */
          "currentTarget": undefined2,
          /**
           * The return value of the last executed listener.
           *
           * @memberOf Benchmark.Event
           * @type Mixed
           */
          "result": undefined2,
          /**
           * The object to which the event was originally emitted.
           *
           * @memberOf Benchmark.Event
           * @type Object
           */
          "target": undefined2,
          /**
           * A timestamp of when the event was created (ms).
           *
           * @memberOf Benchmark.Event
           * @type number
           */
          "timeStamp": 0,
          /**
           * The event type.
           *
           * @memberOf Benchmark.Event
           * @type string
           */
          "type": ""
        });
        Suite.options = {
          /**
           * The name of the suite.
           *
           * @memberOf Benchmark.Suite.options
           * @type string
           */
          "name": undefined2
        };
        _.assign(Suite.prototype, {
          /**
           * The number of benchmarks in the suite.
           *
           * @memberOf Benchmark.Suite
           * @type number
           */
          "length": 0,
          /**
           * A flag to indicate if the suite is aborted.
           *
           * @memberOf Benchmark.Suite
           * @type boolean
           */
          "aborted": false,
          /**
           * A flag to indicate if the suite is running.
           *
           * @memberOf Benchmark.Suite
           * @type boolean
           */
          "running": false
        });
        _.assign(Suite.prototype, {
          "abort": abortSuite,
          "add": add,
          "clone": cloneSuite,
          "emit": emit,
          "filter": filterSuite,
          "join": arrayRef.join,
          "listeners": listeners,
          "off": off,
          "on": on,
          "pop": arrayRef.pop,
          "push": push,
          "reset": resetSuite,
          "run": runSuite,
          "reverse": arrayRef.reverse,
          "shift": shift,
          "slice": slice,
          "sort": arrayRef.sort,
          "splice": arrayRef.splice,
          "unshift": unshift
        });
        _.assign(Benchmark3, {
          "Deferred": Deferred,
          "Event": Event,
          "Suite": Suite
        });
        _.each(["each", "forEach", "indexOf", "map", "reduce"], function(methodName) {
          var func = _[methodName];
          Suite.prototype[methodName] = function() {
            var args = [this];
            push.apply(args, arguments);
            return func.apply(_, args);
          };
        });
        _.each(["pop", "shift", "splice"], function(methodName) {
          var func = arrayRef[methodName];
          Suite.prototype[methodName] = function() {
            var value = this, result = func.apply(value, arguments);
            if (value.length === 0) {
              delete value[0];
            }
            return result;
          };
        });
        Suite.prototype.unshift = function() {
          var value = this;
          unshift.apply(value, arguments);
          return value.length;
        };
        return Benchmark3;
      }
      if (typeof define == "function" && typeof define.amd == "object" && define.amd) {
        define(["lodash", "platform"], function(_, platform) {
          return runInContext({
            "_": _,
            "platform": platform
          });
        });
      } else {
        var Benchmark2 = runInContext();
        if (freeExports && freeModule) {
          if (moduleExports) {
            (freeModule.exports = Benchmark2).Benchmark = Benchmark2;
          }
          freeExports.Benchmark = Benchmark2;
        } else {
          root.Benchmark = Benchmark2;
        }
      }
    }).call(exports);
  }
});

// app/db-store.ts
import net from "net";
import crypto from "crypto";

// app/utils/parser.ts
import fs from "fs";

// app/utils/get-bytes.ts
function getBytes(txt) {
  return Buffer.from(txt).length;
}

// app/utils/stream-time.ts
function streamTime(id, item) {
  if (!id.includes("*")) return id;
  if (id === "*") return autoStreamId(item);
  let [a, b] = id.split("-");
  if (a === "*") {
    const [c, d] = streamBiggestIdByA(item).split("-");
    a = String(parseInt(c) + 1);
  }
  if (b === "*") {
    const [c, d] = streamBiggestIdByB(item, parseInt(a)).split("-");
    if (`${c}-${d}` === "0-0") {
      b = d;
    } else {
      b = String(parseInt(d) + 1);
    }
  }
  const newId = `${a}-${b}`;
  if (newId === "0-0") return "0-1";
  return newId;
}
function autoStreamId(item) {
  const now = Date.now().toString();
  const biggestId = streamBiggestIdByB(item, parseInt(now));
  const [a, b] = biggestId.split("-");
  if (biggestId === "0-0") {
    return `${now}-0`;
  }
  const newId = `${now}-${String(parseInt(b) + 1)}`;
  return newId;
}
function compareStreamTime(a, b) {
  const aTime = a.split("-").map((i) => parseInt(i));
  const bTime = b.split("-").map((i) => parseInt(i));
  if (aTime[0] > bTime[0]) return false;
  if (aTime[0] === bTime[0] && aTime[1] >= bTime[1]) return false;
  return true;
}
function streamBiggestId(item) {
  if (!item) return "0-0";
  const existValues = Object.keys(item.value).map((i) => item.value[i]);
  const biggest = existValues.reduce((a, b) => {
    const aTime = a.id.split("-").map((i) => parseInt(i));
    const bTime = b.id.split("-").map((i) => parseInt(i));
    const aTotal = aTime.reduce((a2, b2) => a2 + b2, 0);
    const bTotal = bTime.reduce((a2, b2) => a2 + b2, 0);
    return aTotal > bTotal ? a : b;
  });
  return biggest.id;
}
function streamBiggestIdByA(item) {
  if (!item) return "0-0";
  const existValues = Object.keys(item.value).map((i) => item.value[i]);
  const biggest = existValues.reduce((a, b) => {
    const aTime = parseInt(a.id.split("-")[0]);
    const bTime = parseInt(b.id.split("-")[0]);
    const aTotal = aTime;
    const bTotal = bTime;
    return aTotal > bTotal ? a : b;
  });
  return biggest.id;
}
function streamBiggestIdByB(item, a) {
  if (!item) return "0-0";
  let existValues = Object.keys(item.value).map((i) => item.value[i]);
  existValues = existValues.filter((v) => v.id.split("-")[0] === a.toString());
  if (existValues.length === 0) return "0-0";
  const biggest = existValues.reduce((a2, b) => {
    const aTime = parseInt(a2.id.split("-")[1]);
    const bTime = parseInt(b.id.split("-")[1]);
    const aTotal = aTime;
    const bTotal = bTime;
    return aTotal > bTotal ? a2 : b;
  });
  return biggest.id;
}

// app/utils/sleep.ts
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// app/utils/commands.ts
var EMPTY_RDB = Buffer.from(
  "524544495330303131fa0972656469732d76657205372e322e30fa0a72656469732d62697473c040fa056374696d65c26d08bc65fa08757365642d6d656dc2b0c41000fa08616f662d62617365c000fff06e3bfec0ff5aa2",
  "hex"
);
var availableCommands = [
  "PING",
  "ECHO",
  "SET",
  "GET",
  "DEL",
  "CONFIG",
  "KEYS",
  "INFO",
  "REPLCONF",
  "PSYNC",
  "WAIT",
  "TYPE",
  "XADD",
  "XRANGE",
  "XREAD",
  "INCR",
  "MULTI",
  "EXEC"
];
var Commands = class _Commands {
  static PING(c, _params, store2) {
    if (store2.role === "master") {
      c.queueWrite(c, Parser.simpleResponse("PONG"));
    }
  }
  static ECHO(c, params) {
    const value = Parser.stringResponse(params[0][1]);
    c.queueWrite(c, value);
  }
  static SET(c, args, store2) {
    const [key, value] = [args[0][1], args[1][1]];
    let px = void 0;
    if (args[2] && args[2][1] == "--PX--") {
      px = args[2][0];
    }
    store2.set(key, value, px);
    if (store2.role === "master") {
      const replicasCommand = ["SET", key, value];
      if (px) {
        replicasCommand.push("px", px.toString());
      }
      store2.pushToReplicas(Parser.listResponse(replicasCommand));
      c.queueWrite(c, Parser.okResponse());
    }
  }
  static GET(c, args, store2) {
    const key = args[0][1];
    const value = store2.get(key);
    if (!value) {
      c.queueWrite(c, Parser.nilResponse());
      return;
    }
    if (value.itemType === "stream") {
      c.queueWrite(
        c,
        Parser.listResponse(
          Object.keys(value.value).map((k) => `${value.value[k].value}`)
        )
      );
      return;
    }
    c.queueWrite(c, Parser.dynamicResponse(value.value));
  }
  static GET_CONFIG(c, args, store2) {
    const res = [];
    for (const a of args) {
      if (Parser.matchInsensetive(a[1], "dir")) {
        res.push("dir");
        res.push(store2.dir);
        continue;
      }
      if (Parser.matchInsensetive(a[1], "dbfilename")) {
        res.push("dbfilename");
        res.push(store2.dbfilename);
      }
    }
    c.queueWrite(c, Parser.listResponse(res));
  }
  static DEL(c, args, store2) {
    const key = args[0][1];
    store2.delete(key);
    if (store2.role === "master") {
      store2.pushToReplicas(Parser.listResponse(["DEL", key]));
      c.queueWrite(c, Parser.okResponse());
    }
  }
  static CONFIG(c, args, store2) {
    const cmdType = args[0][1];
    if (Parser.matchInsensetive(cmdType, "get")) {
      _Commands.GET_CONFIG(c, args.slice(1), store2);
    }
  }
  static KEYS(c, args, store2) {
    const regex = args[0][1];
    const keys = store2.keys(regex);
    c.queueWrite(c, Parser.listResponse(keys));
  }
  static INFO(c, _args, store2) {
    const res = [];
    res.push(`role:${store2.role}`);
    res.push(`master_replid:${store2.id}`);
    res.push(`master_repl_offset:${store2.offset}`);
    c.queueWrite(c, Parser.stringResponse(res.join("\n")));
  }
  static REPLCONF(c, args, store2) {
    const cmdType = args[0][1];
    if (cmdType === "GETACK") {
      c.queueWrite(
        c,
        Parser.listResponse(["REPLCONF", "ACK", `${store2.offset}`])
      );
      if (args.length < 3) {
        store2.offset += getBytes("*\r\n");
      }
      return;
    }
    if (cmdType === "ACK") return;
    if (store2.role === "master") {
      c.queueWrite(c, Parser.okResponse());
    }
  }
  static PSYNC(c, args, store2) {
    const [replid, offset] = [args[0][1], args[1][1]];
    c.queueWrite(
      c,
      Parser.simpleResponse(`FULLRESYNC ${store2.id} ${store2.offset}`)
    );
    c.queueWrite(
      c,
      Buffer.concat([
        Buffer.from(`$${EMPTY_RDB.length}\r
`, "utf8"),
        EMPTY_RDB
      ])
    );
    store2.addReplica(c);
  }
  static WAIT(c, args, store2) {
    const [repls, timeout] = [args[0][0], args[1][0]];
    let neededRepls = Math.min(store2.replicas.length, repls);
    if (neededRepls === 0) {
      return c.queueWrite(c, Parser.numberResponse(store2.replicas.length));
    }
    if (neededRepls > store2.replicas.length) {
      neededRepls = store2.replicas.length;
    }
    let timeoutHandler;
    let passed = false;
    const acks = [];
    const listener = (data) => {
      const parsed = Parser.parse(data);
      if (!parsed) return;
      const { command, params } = parsed;
      if (Parser.matchInsensetive(command, "REPLCONF") && Parser.matchInsensetive(params[0][1], "ACK")) {
        acks.push(1);
      }
      if (acks.length >= neededRepls) {
        clearTimeout(timeoutHandler);
        if (passed) return;
        passed = true;
        store2.replicas.forEach((r) => r[1].off("data", listener));
        c.queueWrite(c, Parser.numberResponse(acks.length));
      }
    };
    store2.replicas.forEach((r) => {
      r[1].on("data", listener);
      r[1].write(Parser.listResponse(["REPLCONF", "GETACK", "*"]));
    });
    timeoutHandler = setTimeout(() => {
      if (passed) return;
      passed = true;
      store2.replicas.forEach((r) => r[1].off("data", listener));
      c.queueWrite(
        c,
        Parser.numberResponse(
          acks.length === 0 ? store2.replicas.length : acks.length
        )
      );
    }, timeout);
  }
  static TYPE(c, args, store2) {
    const key = args[0][1];
    const value = store2.get(key);
    if (!value) {
      c.queueWrite(c, Parser.stringResponse("none"));
      return;
    }
    c.queueWrite(c, Parser.stringResponse(value.type));
  }
  static XADD(c, args, store2) {
    const streamKey = args[0][1];
    const entries = {};
    const exist = store2.get(streamKey);
    const id = streamTime(args[1][1], exist);
    let latestEntryId = "0-0";
    const tooSmallMsg = "ERR The ID specified in XADD must be greater than 0-0";
    const errMsg = "ERR The ID specified in XADD is equal or smaller than the target stream top item";
    for (let i = 1; i < args.length; i += 3) {
      const key = args[i + 1][1];
      const value = args[i + 2][1];
      const item = {
        value,
        type: "string",
        itemType: "base",
        id
      };
      const time = id;
      const itemTime = time.split("-").map((i2) => parseInt(i2));
      const totalTime = itemTime.reduce((a, b) => a + b, 0);
      if (totalTime < 1) {
        return c.queueWrite(c, Parser.errorResponse(tooSmallMsg));
      }
      if (!compareStreamTime(latestEntryId, time)) {
        return c.queueWrite(c, Parser.errorResponse(errMsg));
      }
      if (exist) {
        const biggestID = streamBiggestId(exist);
        if (biggestID === time) {
          return c.queueWrite(c, Parser.errorResponse(errMsg));
        }
        if (!compareStreamTime(biggestID, time)) {
          return c.queueWrite(c, Parser.errorResponse(errMsg));
        }
      }
      latestEntryId = time;
      entries[key] = item;
      c.queueWrite(c, Parser.stringResponse(time));
    }
    store2.setStream(streamKey, entries, "stream");
  }
  static XRANGE(c, args, store2) {
    const key = args[0][1];
    const start = args[1][1];
    const end = args[2][1];
    const stream = store2.get(key);
    if (!stream) {
      return c.queueWrite(c, Parser.listResponse([]));
    }
    const ids = stream.entries.map((e) => e[0]);
    const startId = start === "-" ? 0 : ids.indexOf(start);
    const endId = end === "+" ? ids.length - 1 : ids.indexOf(end);
    if (startId === -1 || endId === -1) {
      return c.queueWrite(c, Parser.listResponse([]));
    }
    if (startId > endId) {
      return c.queueWrite(c, Parser.listResponse([]));
    }
    const data = stream.entries.slice(startId, endId + 1);
    stream.entries = data;
    c.queueWrite(c, Parser.streamItemResponse(stream));
  }
  static async XREAD(c, args, store2) {
    console.log(args);
    const reads = [];
    let block = -1;
    let closed = false;
    c.addListener("close", () => closed = true);
    if (args[0][1] === "--BLOCK--") {
      block = args[0][0];
      args.shift();
    }
    async function readOne(streamKey, id) {
      if (block > -1) {
        let didread = false;
        const listener = (data) => {
          didread = true;
          if (block > 0) {
            reads.push(data);
            return;
          }
          c.queueWrite(c, Parser.streamXResponse(data));
        };
        store2.addStreamListener(streamKey, block, listener);
        c.addListener("close", () => {
          store2.deleteStreamListener(streamKey, listener);
        });
        if (closed || block === 0) return;
        setTimeout(() => {
          if (closed) return;
          if (!didread) {
            c.queueWrite(c, Parser.nilResponse());
          }
        }, block);
        await sleep(block);
        if (!didread) {
          c.queueWrite(c, Parser.nilResponse());
        }
        return;
      }
      const stream = store2.get(streamKey);
      if (!stream) return;
      const ids2 = stream.entries.map((e) => e[0]);
      const startId = ids2.indexOf(id);
      if (startId !== -1) {
        const data = stream.entries.slice(startId);
        stream.entries = data;
      }
      return reads.push(stream);
    }
    if (args.length === 2) {
      const streamKey = args[0][1];
      const id = args[1][1];
      await readOne(streamKey, id);
      if (reads.length > 0 && !closed)
        c.queueWrite(c, Parser.streamXResponse(reads[0]));
      return;
    }
    if (args.length < 2) return;
    const nStrams = Math.round(args.length / 2);
    const keys = args.slice(0, nStrams);
    const ids = args.slice(nStrams);
    const streams = keys.map((k) => k[1]);
    const streamIds = ids.map((i) => i[1]);
    for (let i = 0; i < streams.length; i++) {
      await readOne(streams[i], streamIds[i]);
    }
    if (reads.length < 1 || closed) return;
    const res = Parser.streamMultiXResponse(streams, reads);
    c.queueWrite(c, res);
  }
  static INCR(c, args, store2) {
    const key = args[0][1];
    const value = store2.increment(key);
    if (value === null) {
      return c.queueWrite(
        c,
        Parser.errorResponse("ERR value is not an integer or out of range")
      );
    }
    c.queueWrite(c, Parser.numberResponse(value));
  }
  static MULTI(c, args, store2) {
    c.queue.lock();
    c.write(Parser.okResponse());
  }
  static EXEC(c, args, store2) {
    if (!c.queue.locked) {
      return c.write(Parser.errorResponse("ERR EXEC without MULTI"));
    }
    c.executeQueued(c);
  }
  static DISCARD(c, args, store2) {
    if (!c.queue.locked) {
      return c.write(Parser.errorResponse("ERR DISCARD without MULTI"));
    }
    c.queue.discard();
    c.write(Parser.okResponse());
  }
  // ---- KEDIS COMMANDS
  static KSET(c, args, store2) {
    const collection = args[0][1];
    const key = args[1][1];
    const data = args[2][1];
    const res = store2.set(
      key,
      data,
      void 0,
      "string",
      void 0,
      collection
    );
    if (res === true) return c.queueWrite(c, Parser.okResponse());
    c.queueWrite(c, Parser.errorResponse(res));
  }
  static KGET(c, args, store2) {
    const collection = args[0][1];
    const key = args[1][1];
    const value = store2.get(key, collection);
    if (!value) {
      c.queueWrite(c, Parser.nilResponse());
      return;
    }
    c.queueWrite(c, Parser.dynamicResponse(value.value));
  }
  static KDEL(c, args, store2) {
    const collection = args[0][1];
    const key = args[1][1];
    store2.delete(key, collection);
    c.queueWrite(c, Parser.okResponse());
  }
  static KCSET(c, args, store2) {
    const collection = args[0][1];
    const payload = args[1][1];
    const parsed = Parser.readKDBJson(payload);
    if (!parsed || !Array.isArray(parsed.schema)) {
      return c.queueWrite(
        c,
        Parser.errorResponse("Invalid collection payload")
      );
    }
    store2.setCollection({
      id: collection,
      version: 0,
      schema: parsed.schema,
      index: parsed.index || []
    });
    c.queueWrite(c, Parser.okResponse());
  }
  static KCDEL(c, args, store2) {
    const collection = args[0][1];
    store2.deleteCollection(collection);
    c.queueWrite(c, Parser.okResponse());
  }
};
var commands = {
  PING: Commands.PING,
  ECHO: Commands.ECHO,
  SET: Commands.SET,
  GET: Commands.GET,
  DEL: Commands.DEL,
  CONFIG: Commands.CONFIG,
  KEYS: Commands.KEYS,
  INFO: Commands.INFO,
  REPLCONF: Commands.REPLCONF,
  PSYNC: Commands.PSYNC,
  WAIT: Commands.WAIT,
  TYPE: Commands.TYPE,
  XADD: Commands.XADD,
  XRANGE: Commands.XRANGE,
  XREAD: Commands.XREAD,
  INCR: Commands.INCR,
  MULTI: Commands.MULTI,
  EXEC: Commands.EXEC,
  DISCARD: Commands.DISCARD,
  KSET: Commands.KSET,
  KGET: Commands.KGET,
  KDEL: Commands.KDEL,
  KCSET: Commands.KCSET,
  KCDEL: Commands.KCDEL
};

// app/utils/parser.ts
function XRangeResponse(data) {
  let response = `*${data.length}\r
`;
  data.forEach(([id, entry]) => {
    response += `*2\r
$${id.length}\r
${id}\r
`;
    const entryArray = entry[0];
    response += `*${entryArray.length}\r
`;
    for (const item of entryArray) {
      response += `$${item.length}\r
${item}\r
`;
    }
  });
  return response;
}
function xReadResponse(streamKey, data, n) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return Parser.nilResponse();
  }
  const encodedEntries = data.map(([id, fields]) => {
    const fieldEntries = fields.map(([key, value]) => {
      return `$${key.length}\r
${key}\r
$${value.length}\r
${value}\r
`;
    }).join("");
    return `*2\r
$${id.length}\r
${id}\r
*${fields.length * 2}\r
${fieldEntries}`;
  }).join("");
  let res = `*2\r
$${streamKey.length}\r
${streamKey}\r
*${data.length}\r
${encodedEntries}`;
  if (n === 0) {
    res = `*1\r
${res}`;
  }
  return res;
}
function xReadMultiResponse(streamKeys, data) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return Parser.nilResponse();
  }
  let response = `*${data.length}\r
`;
  data.forEach((entries, index) => {
    response += xReadResponse(streamKeys[index], entries, streamKeys.length);
  });
  return response;
}
var _Parser = class _Parser {
  static getArgs(data) {
    const txt = typeof data === "string" ? data : data.toString();
    const args = txt.split(`\r
`);
    return args;
  }
  static readNumber(value) {
    if (value.startsWith("$")) {
      return parseInt(value.substring(1));
    } else {
      return parseInt(value);
    }
  }
  static stringResponse(txt) {
    return `$${txt.length}\r
${txt}\r
`;
  }
  static simpleResponse(txt) {
    return `+${txt}\r
`;
  }
  static fileResponse(path3) {
    const contents = fs.readFileSync(path3).toString();
    return `$${contents.length}\r
${contents}`;
  }
  static numberResponse(num) {
    return `:${num}\r
`;
  }
  static dynamicResponse(value) {
    return _Parser.stringResponse(String(value));
  }
  static streamItemResponse(item) {
    const res = XRangeResponse(item.entries);
    return res;
  }
  static streamXResponse(item) {
    const res = xReadResponse(item.streamKey, item.entries, 0);
    return res;
  }
  static streamMultiXResponse(streamKeys, items) {
    const res = xReadMultiResponse(
      streamKeys,
      items.map((i) => i.entries)
    );
    return res;
  }
  static errorResponse(txt) {
    return `-${txt}\r
`;
  }
  static listResponse(list, encodeString = true) {
    if (list.length < 1) {
      return "*0\r\n";
    }
    let res = `*${list.length}\r
`;
    for (const item of list) {
      if (Array.isArray(item)) {
        res += _Parser.listResponse(item);
      } else {
        res += !encodeString ? item : _Parser.stringResponse(String(item));
      }
    }
    return res;
  }
  static okResponse() {
    return "+OK\r\n";
  }
  static nilResponse() {
    return "$-1\r\n";
  }
  static readBulkString(value) {
    const args = _Parser.getArgs(value);
    return args[1];
  }
  // KDB stuff
  static toKDBJson(data) {
    const txt = JSON.stringify(data);
    return _Parser.stringResponse(`--KJ--${txt}`);
  }
  static readKDBJson(data) {
    if (data.startsWith("$")) {
      data = _Parser.readBulkString(data);
    }
    if (!data.startsWith("--KJ--")) return void 0;
    try {
      const json = JSON.parse(data.slice("--KJ--".length));
      return json;
    } catch (e) {
      return void 0;
    }
  }
  static commandKey(key, collection) {
    return `KK:${key}--KC:${collection}`;
  }
  static readCommandKey(value) {
    if (!value.startsWith("KK:")) return void 0;
    const parts = value.split("--KC:");
    const collection = parts[1];
    const key = parts[0].substring(3);
    return { collection, key };
  }
  static commandString(key, value, collection) {
    return `KK:${key}--KC:${collection}<-KC->${value}`;
  }
  static eventResponse(type, value) {
    return `KEVENT-${type}::${value}`;
  }
  static readCommandString(command) {
    if (!command.startsWith("KK:")) return void 0;
    const kcIndex = command.indexOf("<-KC->");
    if (kcIndex === -1) return void 0;
    const keyCollectionPart = command.substring(3, kcIndex);
    const value = command.substring(kcIndex + 6);
    const kcSeparatorIndex = keyCollectionPart.indexOf("--KC:");
    if (kcSeparatorIndex === -1) return void 0;
    const key = keyCollectionPart.substring(0, kcSeparatorIndex);
    const collection = keyCollectionPart.substring(kcSeparatorIndex + 5);
    return { key, value, collection };
  }
  // parsing stuff
  static matchInsensetive(str, target) {
    return str.toLowerCase() === target.toLowerCase();
  }
  static parseBatch(data) {
    const txt = data.toString();
    const commands2 = txt.split(/\*/);
    return commands2.filter((c) => c.length > 0).map((c) => _Parser.parse(Buffer.from("*" + c))).filter((c) => c !== void 0);
  }
  static readRdbFile(data) {
    const txt = data.toString();
    if (!txt.startsWith("*")) return void 0;
    const parts = txt.substring(1).split(/\*/);
    parts[0] = "*" + parts[0];
    const wanted = parts.filter(
      (p) => p.startsWith("*") && p.includes("redis-ver")
    );
    if (wanted.length > 0) return wanted[0];
  }
  static parseTypeA(params, slicedParams) {
    let tempLength = 0;
    let lastUnique = false;
    for (const p of params) {
      if (p.startsWith("$") && lastUnique) continue;
      if (p.startsWith("$") && !lastUnique) {
        tempLength = _Parser.readNumber(p);
        lastUnique = false;
        continue;
      }
      if (!lastUnique && slicedParams.length < 2 && tempLength > 0) {
        slicedParams.push([tempLength, p]);
        tempLength = 0;
        lastUnique = false;
        continue;
      }
      if (p.toLowerCase() === "px") {
        lastUnique = p;
        continue;
      }
      if ((lastUnique || "").toLowerCase() === "px" && !isNaN(_Parser.readNumber(p))) {
        slicedParams.push([_Parser.readNumber(p), "--PX--"]);
        lastUnique = false;
      }
    }
  }
  static parseTypeB(params, slicedParams) {
    for (const p of params) {
      if (!p.startsWith("$")) {
        slicedParams.push([0, p]);
      }
    }
  }
  static parseWAIT(params, slicedParams) {
    slicedParams.push([parseInt(params[1]), "WAIT"], [parseInt(params[3]), ""]);
  }
  static parseXADD(params, slicedParams) {
    params.forEach((p, index) => {
      if (p.startsWith("$") || p.length < 1) return;
      if (index % 2 === 1) {
        slicedParams.push([0, p]);
      }
    });
  }
  static parseXREAD(params, slicedParams) {
    let latestIsBlock = false;
    params.forEach((p, index) => {
      if (p.startsWith("$") && p !== "$" || p.length < 1 || p === "streams")
        return;
      if (latestIsBlock) {
        latestIsBlock = false;
        slicedParams.unshift([parseInt(p), "--BLOCK--"]);
        return;
      }
      if (p === "block" && !isNaN(parseInt(params[index + 2]))) {
        latestIsBlock = true;
        return;
      }
      latestIsBlock = false;
      slicedParams.push([0, p]);
    });
  }
  static parse(data) {
    const txt = data.toString();
    const args = _Parser.getArgs(txt);
    const slicedParams = [];
    const [numOfArgs, commandLength, cmd, ...params] = args;
    let command = cmd;
    if (!command) return void 0;
    command = command.toUpperCase();
    if (command === "PING") {
      return {
        numOfArgs,
        commandLength,
        command,
        params: slicedParams,
        txt
      };
    }
    if (availableCommands.indexOf(command) === -1 && !commands[command]) {
      return void 0;
    }
    const commandParser = _Parser.commandsParse[command];
    if (commandParser) {
      commandParser(params, slicedParams);
    }
    return {
      numOfArgs,
      commandLength,
      command,
      params: slicedParams,
      txt
    };
  }
};
_Parser.commandsParse = {
  GET: _Parser.parseTypeA,
  SET: _Parser.parseTypeA,
  ECHO: _Parser.parseTypeA,
  TYPE: _Parser.parseTypeA,
  PING: () => {
  },
  CONFIG: _Parser.parseTypeB,
  KEYS: _Parser.parseTypeB,
  INFO: _Parser.parseTypeB,
  PSYNC: _Parser.parseTypeB,
  DEL: _Parser.parseTypeB,
  REPLCONF: _Parser.parseTypeB,
  XRANGE: _Parser.parseTypeB,
  INCR: _Parser.parseTypeB,
  MULTI: _Parser.parseTypeB,
  EXEC: _Parser.parseTypeB,
  DISCARD: _Parser.parseTypeB,
  WAIT: _Parser.parseWAIT,
  XADD: _Parser.parseXADD,
  XREAD: _Parser.parseXREAD,
  KSET: _Parser.parseTypeB,
  KGET: _Parser.parseTypeB,
  KDEL: _Parser.parseTypeB,
  KCSET: _Parser.parseTypeB,
  KCDEL: _Parser.parseTypeB
};
var Parser = _Parser;

// app/db-store.ts
import path from "path";
import fs2 from "fs";

// app/queue.ts
var Queue = class {
  constructor(connection) {
    this.locked = false;
    this.queue = [];
    this.results = [];
    this.connection = connection;
  }
  lock() {
    this.locked = true;
  }
  unlock() {
    this.locked = false;
  }
  add(data) {
    this.queue.push(data);
  }
  flush() {
    this.queue = [];
    this.results = [];
    this.locked = false;
  }
  discard() {
    this.queue = [];
    this.results = [];
    this.locked = false;
  }
  addResult(data) {
    this.results.push(data);
  }
  getResults() {
    return this.results;
  }
};

// app/utils/execute-command.ts
var execute = async (kserver, data, store2, auth2, headers) => {
  const parsed = Parser.parse(data);
  if (!parsed) return false;
  const allow = await auth2.applyAuth(parsed.command, headers);
  if (!allow) {
    kserver.queueWrite(kserver, Parser.errorResponse("Unauthorized"));
    return true;
  }
  if (kserver.queue.locked && !["EXEC", "DISCARD"].includes(parsed.command)) {
    kserver.queueCommand(kserver, data);
    return true;
  }
  const { command, params } = parsed;
  const func = commands[command];
  if (!func) return false;
  await func(kserver, params, store2);
  return true;
};
var execute_command_default = execute;

// kdb-config.ts
var config = {
  port: 8080,
  realtimeport: 9090,
  dbfilename: "test3.kdb",
  dir: "/home/user/kedis/data",
  saveperiod: 1e4,
  auth: [
    [
      ["KCSET"],
      (headers) => {
        const token = headers.authorization;
        if (!token) return false;
        return true;
      }
    ]
  ]
};
var kdb_config_default = config;

// app/utils/logger.ts
import winston from "winston";
var logger = winston.createLogger({
  level: "info",
  // Log levels: error, warn, info, http, verbose, debug, silly
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
      if (Object.keys(meta).length) {
        log += ` ${JSON.stringify(meta)}`;
      }
      return log;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "server.log" })
  ]
});
var logger_default = logger;

// app/utils/auth.ts
var Auth = class {
  constructor() {
    this.auth = /* @__PURE__ */ new Map();
    const authConfig = kdb_config_default.auth;
    if (!authConfig) return;
    for (const ac of authConfig) {
      ac[0].forEach((a) => {
        this.addAuth(a, ac[1]);
      });
    }
  }
  addAuth(command, func) {
    var _a;
    command = command.toUpperCase();
    logger_default.info(`adding auth for ${command}`);
    if (!this.auth.has(command)) {
      this.auth.set(command, []);
    }
    (_a = this.auth.get(command)) == null ? void 0 : _a.push(func);
  }
  async applyAuth(command, headers) {
    const auth2 = this.auth.get(command.toUpperCase());
    if (!auth2 || auth2.length < 1) return true;
    for (const aFunc of auth2) {
      const res = await aFunc(headers);
      if (!res) return false;
    }
    return true;
  }
};
var auth_default = Auth;

// app/utils/build-kserver.ts
function buildKServer(c, store2) {
  const kserver = c;
  const queue = new Queue(kserver);
  kserver.queue = queue;
  kserver.queueWrite = (c2, data) => {
    if (!c2.queue.locked) {
      c2.write(data);
      return;
    }
    c2.queue.addResult(data);
  };
  kserver.queueCommand = (c2, data) => {
    c2.queue.add(data);
    c2.write(Parser.simpleResponse("QUEUED"));
  };
  kserver.executeQueued = async (c2) => {
    for (const command of c2.queue.queue) {
      await execute_command_default(kserver, command, store2, new auth_default(), {});
    }
    const results = c2.queue.getResults();
    console.log("results", results);
    c2.write(Parser.listResponse(results, false));
    c2.queue.flush();
  };
  return kserver;
}

// app/utils/validator.ts
var Validator = class {
  constructor(collection) {
    this.collection = collection;
    this.keySchemaMap = /* @__PURE__ */ new Map();
    this.requiredKeys = /* @__PURE__ */ new Set();
    for (const schema of collection.schema) {
      this.keySchemaMap.set(schema.key, schema);
      if (schema.required) {
        this.requiredKeys.add(schema.key);
      }
    }
  }
  validate(value) {
    const data = this.readData(value);
    if (!data) {
      console.error("Invalid data");
      return false;
    }
    const keys = Object.keys(data);
    for (const [key, schema] of this.keySchemaMap) {
      if (!keys.includes(key)) {
        if (schema.default !== void 0) {
          data[key] = schema.default;
        }
      }
      if (this.requiredKeys.has(key) && data[key] === void 0) {
        return false;
      }
      const item = data[key];
      if (item === void 0) continue;
      const itemType = typeof item;
      if (schema.type !== itemType) {
        return false;
      }
      switch (itemType) {
        case "string":
          if (!this.validateString(schema, item)) return false;
          break;
        case "number":
          if (!this.validateNumber(schema, item)) return false;
          break;
        case "boolean":
          if (!this.validateBoolean(schema, item)) return false;
          break;
      }
    }
    return true;
  }
  validateString(schema, value) {
    return schema.required ? value && typeof value === "string" : typeof value === "string";
  }
  validateNumber(schema, value) {
    if (schema.required && (value === void 0 || value === null))
      return false;
    if (typeof value !== "number") return false;
    if (schema.min !== void 0 && value < schema.min) return false;
    if (schema.max !== void 0 && value > schema.max) return false;
    return true;
  }
  validateBoolean(schema, value) {
    return typeof value === "boolean";
  }
  readData(value) {
    return Parser.readKDBJson(value) || null;
  }
};

// app/utils/realtime.ts
var RealtimePool = class {
  constructor() {
    this.listeners = /* @__PURE__ */ new Map();
    this.connections = /* @__PURE__ */ new Map();
  }
  add(ws) {
    this.connections.set(ws, []);
  }
  remove(ws) {
    const subscribed = this.connections.get(ws);
    if (!subscribed) {
      return;
    }
    for (const sub of subscribed) {
      const parsed = Parser.readCommandKey(sub);
      if (!parsed) continue;
      this.unsubscribe(ws, parsed.collection, parsed.key);
    }
    this.connections.delete(ws);
  }
  subscribe(ws, collection, key) {
    const commandKey = Parser.commandKey(key, collection);
    if (!this.listeners.has(commandKey)) {
      this.listeners.set(commandKey, []);
    }
    if (!this.listeners.get(commandKey).includes(ws)) {
      this.listeners.get(commandKey).push(ws);
    }
    const con = this.connections.get(ws);
    con.push(commandKey);
    this.connections.set(ws, con);
  }
  unsubscribe(ws, collection, key) {
    const commandKey = Parser.commandKey(key, collection);
    if (!this.listeners.has(commandKey)) {
      logger_default.error(`no listeners for ${commandKey} to unsubscribe`);
      return;
    }
    const listeners = this.listeners.get(commandKey);
    const index = listeners.indexOf(ws);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
    const connections = this.connections.get(ws);
    const index2 = connections.indexOf(commandKey);
    if (index2 !== -1) {
      connections.splice(index2, 1);
    }
    this.connections.set(ws, connections);
  }
  push(collection, key, type, value) {
    const commandKey = Parser.commandKey(key, collection);
    if (!this.listeners.has(commandKey)) {
      return;
    }
    const listeners = this.listeners.get(commandKey);
    for (const listener of listeners) {
      listener.send(Parser.eventResponse(type, value));
    }
  }
};

// app/db-store.ts
var DBStore = class {
  constructor({
    role,
    port,
    dir,
    dbfilename,
    master,
    masterId,
    colllections,
    kdb: kdb2
  }) {
    this.data = { default: /* @__PURE__ */ new Map() };
    this.collectionsValidators = /* @__PURE__ */ new Map();
    this.id = crypto.randomBytes(16).toString("hex");
    this.offset = 0;
    this.replicas = [];
    this.streamListeners = {};
    this.commands = [];
    this.commandsKeys = [];
    this.commandsLookup = /* @__PURE__ */ new Map();
    this.ready = false;
    this.role = role;
    this.dir = dir;
    this.dbfilename = dbfilename;
    this.port = port;
    this.collections = colllections;
    this.realtime = new RealtimePool();
    this.collectionsIds = colllections.map((c) => c.id);
    this.collectionsValidators = new Map(
      colllections.map((c) => [c.id, new Validator(c)])
    );
    const filePath = path.join(dir, dbfilename);
    this.path = filePath;
    if (role === "slave" && master && masterId) {
      const [host, port2] = master.split(" ");
      this.master = { host, port: parseInt(port2), id: masterId };
    }
    if (this.role === "slave") {
      this.connectMaster();
      this.ready = true;
      return;
    }
    const getStore = () => this;
    getStore.bind(this);
    const markRead = () => this.ready = true;
    markRead.bind(this);
    kdb2.load(this, () => {
      kdb2.writeLoop(getStore);
      markRead();
    });
  }
  connectMaster() {
    const master = this.master;
    const socket = new net.Socket();
    const kserver = buildKServer(socket, this);
    kserver.queueWrite = (c, data) => {
      c.write(data);
    };
    socket.connect(master.port, master.host);
    let step = 0;
    let loadedFile = false;
    const steps = [
      () => socket.write(Parser.listResponse(["PING"])),
      () => socket.write(
        Parser.listResponse([
          "REPLCONF",
          "listening-port",
          this.port.toString()
        ])
      ),
      () => socket.write(Parser.listResponse(["REPLCONF", "capa", "psync2"])),
      () => socket.write(Parser.listResponse(["PSYNC", "?", "-1"]))
    ];
    socket.on("data", (data) => {
      const file = `/tmp/${Date.now()}.rdb`;
      const contents = Parser.readRdbFile(data);
      if (!loadedFile && contents) {
        fs2.writeFileSync(file, contents);
        fs2.unlinkSync(file);
        loadedFile = true;
      }
      const parsed = Parser.parseBatch(data);
      for (const c of parsed) {
        if (!c) continue;
        const { command, params, txt } = c;
        const func = commands[command];
        if (func) {
          func(kserver, params, this);
          this.offset += getBytes(txt);
        }
      }
      step += 1;
      if (step <= steps.length - 1) {
        steps[step]();
      }
    });
    steps[0]();
  }
  addReplica(c) {
    const id = `${crypto.randomUUID()}`;
    this.replicas.push([id, c]);
    c.on("close", () => {
      this.replicas = this.replicas.filter((r) => r[0] !== id);
    });
  }
  pushToReplicas(txt) {
    this.replicas.forEach((r) => r[1].write(txt));
  }
  set(key, value, px = void 0, type = "string", id, collection = "default") {
    const expiration = px ? new Date(Date.now() + px) : void 0;
    const typedValue = !isNaN(parseInt(value)) ? Number(value) : value;
    const item = {
      value: typedValue,
      px: expiration,
      type,
      itemType: "base",
      id: id || crypto.randomUUID()
    };
    if (collection === "default") {
      this.data[collection].set(key, item);
      this.addSetCommand(key, value, collection);
      this.realtime.push(
        collection,
        key,
        "SET",
        Parser.commandString(key, value, collection)
      );
      return true;
    }
    if (!this.collectionsIds.includes(collection)) {
      const err = `collection ${collection} not found`;
      logger_default.error(err);
      return err;
    }
    const isValid = this.validateSet(collection, value);
    if (!isValid) {
      const err = `invalid value for collection ${collection}`;
      logger_default.error(err);
      return err;
    }
    if (!this.data[collection]) {
      this.data[collection] = /* @__PURE__ */ new Map();
    }
    this.data[collection].set(key, item);
    this.addSetCommand(key, value, collection);
    this.realtime.push(
      collection,
      key,
      "SET",
      Parser.commandString(key, value, collection)
    );
    return true;
  }
  validateSet(collection, data) {
    const validator = this.collectionsValidators.get(collection);
    if (!validator) {
      logger_default.error(`collection ${collection} not found`);
      return false;
    }
    return validator.validate(data);
  }
  addSetCommand(key, value, collection = "default") {
    const command = Parser.commandString(key, value, collection);
    this.commandsLookup.set(command.split("<-KC->")[0], command);
  }
  loadSetCommand(key, collection) {
    const commandKey = Parser.commandKey(key, collection);
    const exist = this.commandsLookup.get(commandKey);
    if (!exist) {
      logger_default.error(`set command doesn't exist: ${commandKey}`);
      return;
    }
    const parsed = Parser.readCommandString(exist);
    if (!parsed) return;
    this.set(
      parsed.key,
      parsed.value,
      void 0,
      "string",
      void 0,
      parsed.collection
    );
  }
  get(key, collection = "default", turn = false) {
    var _a, _b, _c;
    const data = (_c = (_b = (_a = this.data) == null ? void 0 : _a[collection]) == null ? void 0 : _b.get) == null ? void 0 : _c.call(_b, key);
    if (!data && turn) return null;
    if (!data) {
      this.loadSetCommand(key, collection);
      return this.get(key, collection, true);
    }
    if (!data.px) return data;
    const now = /* @__PURE__ */ new Date();
    if (data.px < now) {
      delete this.data[key];
      return null;
    }
    return data;
  }
  delete(key, collection = "default") {
    this.data[collection].delete(key);
    this.commandsLookup.delete(key);
    this.realtime.push(
      collection,
      key,
      "DEL",
      Parser.commandString(key, Parser.nilResponse(), collection)
    );
  }
  exists(key, collection = "default", turn = false) {
    var _a, _b;
    const exist = (_b = (_a = this.data[collection]) == null ? void 0 : _a.get) == null ? void 0 : _b.call(_a, key);
    if (!exist && turn) return false;
    if (!exist) {
      this.loadSetCommand(key, collection);
      return this.exists(key, collection, true);
    }
    return true;
  }
  increment(key, value = 1, collection = "default", turn = false) {
    const item = this.get(key, collection);
    if (!item && turn) {
      this.set(key, value.toString());
      return value;
    }
    if (!item) {
      this.loadSetCommand(key, collection);
      return this.increment(key, value, collection, true);
    }
    if (typeof item.value !== "number") {
      return null;
    }
    this.set(key, (item.value + value).toString());
    return item.value + value;
  }
  setStream(key, value, type = "stream") {
    const existItem = this.data["default"].get(key);
    const entries = [];
    const keyValue = [];
    for (const key2 of Object.keys(value)) {
      keyValue.push([key2, value[key2].value]);
    }
    if (existItem) {
      Object.keys(value).forEach((element) => {
        existItem.value[element] = value[element];
        existItem.entries.push([value[element].id, keyValue]);
        entries.push([value[element].id, keyValue]);
      });
      this.data["default"].set(key, existItem);
      this.executeListeners(key, { ...existItem, entries });
      return;
    } else {
      Object.keys(value).forEach((element) => {
        entries.push([value[element].id, keyValue]);
      });
    }
    const item = {
      value,
      type,
      itemType: "stream",
      streamKey: key,
      entries
    };
    this.data["default"].set(key, item);
    this.executeListeners(key, item);
  }
  addStreamListener(key, time, listener) {
    if (!this.streamListeners[key]) {
      this.streamListeners[key] = [];
    }
    this.streamListeners[key].push([time, listener]);
    if (time === 0) return;
    setTimeout(() => {
      this.streamListeners[key] = this.streamListeners[key].filter(
        (l) => l[0] !== time
      );
    }, time);
  }
  executeListeners(streamKey, data) {
    const listeners = this.streamListeners[streamKey];
    if (!listeners) return;
    listeners.forEach((l) => {
      l[1](data);
    });
  }
  getStreamListener(key) {
    return this.streamListeners[key];
  }
  deleteStreamListener(key, listener) {
    this.streamListeners[key] = this.streamListeners[key].filter(
      (l) => l[1] !== listener
    );
  }
  deleteStreamListeners(key) {
    delete this.streamListeners[key];
  }
  getStream(key) {
    return this.data["default"].get(key);
  }
  keys(regexString, collection = "default") {
    const keys = Object.keys(this.data[collection]);
    if (regexString === "" || regexString === "*") {
      return keys;
    }
    const regex = new RegExp(regexString);
    return keys.filter((key) => regex.test(key));
  }
  async isReady() {
    if (this.ready) return true;
    while (!this.ready) {
      await sleep(10);
    }
    return true;
  }
  // realtime
  subscribe(ws, collection, key) {
    this.realtime.subscribe(ws, collection, key);
  }
  unsubscribe(ws, collection, key) {
    this.realtime.unsubscribe(ws, collection, key);
  }
  // collections
  setCollection(collection) {
    if (this.collectionsIds.includes(collection.id)) {
      return this.updateCollection(collection.id, collection);
    }
    this.collections.push(collection);
    this.collectionsIds.push(collection.id);
    this.collectionsValidators.set(collection.id, new Validator(collection));
    this.data[collection.id] = /* @__PURE__ */ new Map();
  }
  updateCollection(id, collection) {
    this.collections = this.collections.map((c) => {
      if (c.id === id) {
        return collection;
      }
      return c;
    });
    this.collectionsValidators.set(id, new Validator(collection));
  }
  deleteCollection(id) {
    if (!this.collectionsIds.includes(id)) return;
    this.collections = this.collections.filter((c) => c.id !== id);
    this.collectionsIds = this.collectionsIds.filter((c) => c !== id);
    this.collectionsValidators.delete(id);
    delete this.data[id];
  }
  resetCollection(id) {
    this.data[id] = /* @__PURE__ */ new Map();
  }
};

// app/utils/read-config.ts
function readConfig() {
  const args = process.argv.slice(2);
  const config3 = parseArgs(args);
  return config3;
}
function parseArgs(args) {
  const config3 = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];
    config3[key.replace("--", "")] = value;
  }
  return validateConfig(config3);
}
function validateConfig(args) {
  let dir = args["dir"] || kdb_config_default.dir;
  let dbfilename = args["dbfilename"] || kdb_config_default.dbfilename;
  const port = parseInt(args["port"] || String(kdb_config_default.port));
  const realtimeport = parseInt(
    args["realtimeport"] || String(kdb_config_default.realtimeport)
  );
  const replicaof = args["replicaof"] || kdb_config_default.replicaof;
  const saveperiod = parseInt(
    args["saveperiod"] || String(kdb_config_default.saveperiod || "3600000")
  );
  if (!dir || !dbfilename) {
    dir = "/tmp";
    dbfilename = "db.kdb";
    console.log(
      `dir or dbfilename not defined, falling back to default values: ${dir}, ${dbfilename}`
    );
  }
  return {
    dir,
    dbfilename,
    port,
    replicaof,
    saveperiod,
    realtimeport
  };
}

// app/main.ts
import http from "http";
var import_benchmark = __toESM(require_benchmark(), 1);

// app/utils/kdb.ts
import fs3 from "fs";
var KDB = class {
  constructor(path3, saveperiod) {
    this.loopStrated = false;
    this.writing = false;
    this.loading = false;
    this.path = path3;
    this.saveperiod = saveperiod;
  }
  async load(store2, onFinish) {
    this.loading = true;
    try {
      logger_default.info(`loading snapshot from ${this.path}`);
      const file = fs3.readFileSync(this.path);
      const content = file.toString();
      logger_default.info(`loaded kdb file to memory`);
      const [info, data, collections] = await Promise.all([
        this.grapInfo(content),
        this.grapData(content),
        this.grapCollections(content)
      ]);
      for (const key in info) {
        logger_default.info(`[snapshot-info] ${key}: ${info[key]}`);
      }
      store2.commands = data;
      store2.collections = collections;
      store2.collectionsIds = collections.map((c) => c.id);
      store2.collectionsValidators = new Map(
        collections.map((c) => [c.id, new Validator(c)])
      );
      logger_default.info("loading commands lookup table... (this may take a while)");
      let now = Date.now();
      store2.commandsLookup = new Map(
        data.map((d) => [d.split("<-KC->")[0], d])
      );
      logger_default.info(`loaded snapshot from ${this.path} in ${Date.now() - now}ms`);
      onFinish == null ? void 0 : onFinish();
    } catch (err) {
      if (err.code === "ENOENT") {
        logger_default.warn(`snapshot file ${this.path} not found. will create it`);
        await this.write(store2);
        onFinish == null ? void 0 : onFinish();
        return;
      }
      logger_default.error(`error loading snapshot: ${err.message || err}`);
    } finally {
      this.loading = false;
    }
  }
  async grapInfo(content) {
    const start = content.indexOf("--KDB-INFO-START--\r\n") + "--KDB-INFO-START--\r\n".length;
    const end = content.indexOf("--KDB-INFO-END--\r\n");
    const info = content.slice(start, end);
    const json = Parser.readKDBJson(info);
    return json;
  }
  async grapData(content) {
    const start = content.indexOf("--KDB-DATA-START--\r\n") + "--KDB-DATA-START--\r\n".length;
    const end = content.indexOf("--KDB-DATA-END--");
    const data = content.slice(start, end);
    const d = data.split("<-KCOMMAND->");
    return d;
  }
  async grapCollections(content) {
    const start = content.indexOf("--KDB-COLLECTIONS-START--\r\n") + "--KDB-COLLECTIONS-START--\r\n".length;
    const end = content.indexOf("--KDB-COLLECTIONS-END--");
    const data = content.slice(start, end);
    const json = Parser.readKDBJson(data);
    return json;
  }
  async write(store2) {
    if (this.writing || this.loading) return;
    logger_default.info("writing snapshot to disk...");
    try {
      this.writing = true;
      const now = Date.now();
      const [data] = this.stringData(store2);
      const id = `${store2.id}-${store2.role}-${now}`;
      const infoPromise = new Promise((resolve) => {
        const info = this.buildInfo(id, store2, data);
        resolve(Parser.toKDBJson(info));
      });
      const collectionsPromise = new Promise((resolve) => {
        resolve(Parser.toKDBJson(store2.collections));
      });
      const [infoJson, collectionsJson] = await Promise.all([
        infoPromise,
        collectionsPromise
      ]);
      let content = "";
      content += `--KDB-INFO-START--\r
${infoJson}--KDB-INFO-END--\r
`;
      content += `--KDB-DATA-START--\r
${data}--KDB-DATA-END--\r
`;
      content += `--KDB-COLLECTIONS-START--\r
${collectionsJson}--KDB-COLLECTIONS-END--\r
`;
      logger_default.info(`built snapshot in ${Date.now() - now}ms`);
      const writeStartTime = Date.now();
      fs3.writeFileSync(this.path, content, "utf8");
      logger_default.info(
        `wrote ${store2.commandsLookup.size} points to ${this.path} in ${Date.now() - writeStartTime}ms`
      );
    } catch (err) {
      logger_default.error(`error writing snapshot: ${err}`);
    } finally {
      this.writing = false;
    }
  }
  stringData(store2) {
    let commandsContent = "";
    const delimiter = "<-KCOMMAND->";
    const iterator = store2.commandsLookup.values();
    for (const command of iterator) {
      commandsContent += command;
      commandsContent += delimiter;
    }
    return [commandsContent];
  }
  buildInfo(id, store2, data) {
    const snapshottime = Date.now();
    const path3 = this.path;
    const csum = store2.collections.length;
    const size = Buffer.byteLength(data);
    return {
      id,
      "kdb-version": "1.0.0",
      path: path3,
      "snapshot-time": snapshottime.toString(),
      collections: csum,
      points: store2.commandsLookup.size,
      size
    };
  }
  writeLoop(getStore) {
    if (this.loopStrated) {
      logger_default.error("write loop already started");
      return;
    }
    this.loopStrated = true;
    setInterval(() => {
      const store2 = getStore();
      this.write(store2);
    }, this.saveperiod);
    process.on("SIGINT", async () => {
      logger_default.info("SIGINT signal received. making sure to persist data");
      if (this.loading) return;
      while (this.writing) {
        await sleep(10);
      }
      await this.write(getStore());
      process.exit();
    });
    logger_default.info(`snapshot will be saved every ${this.saveperiod}ms`);
  }
};

// app/main.ts
import path2 from "path";
import WebSockets from "ws";
var config2 = readConfig();
logger_default.info("kdb-path: " + path2.join(config2.dir, config2.dbfilename));
logger_default.info("kedis-port: " + config2.port);
var kdbPath = path2.join(config2.dir, config2.dbfilename);
var kdb = new KDB(kdbPath, config2.saveperiod);
var auth = new auth_default();
var storeReady = false;
var store = new DBStore({
  role: config2.replicaof ? "slave" : "master",
  port: config2.port,
  dir: config2.dir,
  dbfilename: config2.dbfilename,
  master: config2.replicaof,
  masterId: config2.replicaof ? config2.replicaof.split(" ")[0] : void 0,
  colllections: [],
  kdb
});
var realtimeServer = new WebSockets.Server({ port: config2.realtimeport });
realtimeServer.on("connection", (ws) => {
  store.realtime.add(ws);
  ws.on("close", () => {
    store.realtime.remove(ws);
  });
  ws.on("message", (msg) => {
    var _a, _b, _c, _d;
    const content = typeof msg === "string" ? msg : msg.toString();
    const json = JSON.parse(content);
    if (((_b = (_a = json.type) == null ? void 0 : _a.toLowerCase) == null ? void 0 : _b.call(_a)) === "subscribe") {
      store.subscribe(ws, json.collection, json.key);
      logger_default.info(`subscribed to ${json.collection}:${json.key}`);
      ws.send(`${json.id}: ${Parser.okResponse()}`);
      return;
    }
    if (((_d = (_c = json.type) == null ? void 0 : _c.toLowerCase) == null ? void 0 : _d.call(_c)) === "unsubscribe") {
      store.unsubscribe(ws, json.collection, json.key);
      ws.send(`${json.id}: ${Parser.okResponse()}`);
      return;
    }
    ws.send(`${json.id}: ${Parser.nilResponse()}`);
  });
});
var httpserver = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  const headers = req.headers;
  let body = Buffer.alloc(0);
  req.on("data", (chunk) => {
    body = Buffer.concat([body, chunk]);
  });
  req.on("end", async () => {
    try {
      if (!storeReady) {
        await store.isReady();
        storeReady = true;
      }
      const kserver = buildKServer(res, store);
      const e = await execute_command_default(kserver, body, store, auth, headers);
      if (!e) {
        res.statusCode = 400;
        res.end(Parser.errorResponse("Invalid request"));
        return;
      }
      res.end();
    } catch (err) {
      logger_default.error("error: " + err);
      res.statusCode = 500;
      res.end(Parser.errorResponse("Internal server error"));
    }
  });
  req.on("error", (err) => {
    logger_default.error("error: " + err.message);
    res.statusCode = 500;
    res.end(Parser.errorResponse(err.message));
    logger_default.info(
      `connection with ${req.socket.remoteAddress} closed due to error: ${err.message}`
    );
  });
});
httpserver.listen(config2.port);
/*! Bundled license information:

benchmark/benchmark.js:
  (*!
   * Benchmark.js <https://benchmarkjs.com/>
   * Copyright 2010-2016 Mathias Bynens <https://mths.be/>
   * Based on JSLitmus.js, copyright Robert Kieffer <http://broofa.com/>
   * Modified by John-David Dalton <http://allyoucanleet.com/>
   * Available under MIT license <https://mths.be/mit>
   *)
*/
