/**
 * almond 0.2.1 Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true, nomen: true */
/*global setTimeout, process, document */

var requirejs, require, define;
(function (undef) {

    var prim, main, req, makeMap, handlers, waitingDefine,
        defined = {},
        waiting = {},
        config = {},
        requireDeferreds = [],
        deferreds = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    //START prim
    /**
     * Changes from baseline prim
     * - no hasProp or hasOwn (already defined in this file)
     * - no hideResolutionConflict, want early errors, trusted code.
     * - each() changed to Array.forEach
     * - removed UMD registration
     * - added prim.all
     */

    /**
     * prim 0.0.0 Copyright (c) 2012, The Dojo Foundation All Rights Reserved.
     * Available via the MIT or new BSD license.
     * see: http://github.com/requirejs/prim for details
     */
    (function () {
        function check(p) {
            if (hasProp(p, 'e') || hasProp(p, 'v')) {
                throw new Error('nope');
            }
            return true;
        }

        function notify(ary, value) {
            prim.nextTick(function () {
                ary.forEach(function (item) {
                    item(value);
                });
            });
        }

        prim = function prim() {
            var p,
                ok = [],
                fail = [];

            return (p = {
                callback: function (yes, no) {
                    if (no) {
                        p.errback(no);
                    }

                    if (hasProp(p, 'v')) {
                        prim.nextTick(function () {
                            yes(p.v);
                        });
                    } else {
                        ok.push(yes);
                    }
                },

                errback: function (no) {
                    if (hasProp(p, 'e')) {
                        prim.nextTick(function () {
                            no(p.e);
                        });
                    } else {
                        fail.push(no);
                    }
                },

                resolve: function (v) {
                    if (check(p)) {
                        p.v = v;
                        notify(ok, v);
                    }
                    return p;
                },
                reject: function (e) {
                    if (check(p)) {
                        p.e = e;
                        notify(fail, e);
                    }
                    return p;
                },

                start: function (fn) {
                    p.resolve();
                    return p.promise.then(fn);
                },

                promise: {
                    then: function (yes, no) {
                        var next = prim();

                        p.callback(function (v) {
                            try {
                                v = yes ? yes(v) : v;

                                if (v && v.then) {
                                    v.then(next.resolve, next.reject);
                                } else {
                                    next.resolve(v);
                                }
                            } catch (e) {
                                next.reject(e);
                            }
                        }, function (e) {
                            var err;

                            try {
                                if (!no) {
                                    next.reject(e);
                                } else {
                                    err = no(e);

                                    if (err instanceof Error) {
                                        next.reject(err);
                                    } else {
                                        if (err && err.then) {
                                            err.then(next.resolve, next.reject);
                                        } else {
                                            next.resolve(err);
                                        }
                                    }
                                }
                            } catch (e2) {
                                next.reject(e2);
                            }
                        });

                        return next.promise;
                    },

                    fail: function (no) {
                        return p.promise.then(null, no);
                    },

                    end: function () {
                        p.errback(function (e) {
                            throw e;
                        });
                    }
                }
            });
        };

        prim.serial = function (ary) {
            var result = prim().resolve().promise;
            ary.forEach(function (item) {
                result = result.then(function () {
                    return item();
                });
            });
            return result;
        };

        prim.all = function (ary) {
            var hasErr,
                count = 0,
                result = [],
                d = prim();

            if (!ary || !ary.length) {
                d.resolve(result);
            } else {
                ary.forEach(function (p, i) {
                    p.then(function (val) {
                        if (!hasErr) {
                            count += 1;
                            result[i] = val;
                            if (count === ary.length) {
                                d.resolve(result);
                            }
                        }
                    }, function (err) {
                        if (!hasErr) {
                            d.reject(err);
                            hasErr = true;
                        }
                    });
                });
            }

            return d.promise;
        };

        prim.nextTick = typeof process !== 'undefined' && process.nextTick ?
                process.nextTick : (typeof setTimeout !== 'undefined' ?
                    function (fn) {
                    setTimeout(fn, 0);
                } : function (fn) {
            fn();
        });
    }());
    //END prim

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);

                name = baseParts.concat(name.split("/"));

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function getDefer(name) {
        var d;
        if (name) {
            d = deferreds[name];
            if (!d) {
                d = deferreds[name] = prim();
            }
        } else {
            d = prim();
            requireDeferreds.push(d);
        }
        return d;
    }

    function resolve(name, d, value) {
        if (name) {
            defined[name] = value;
        }
        d.resolve(value);
    }

    function load(name) {
        var url = config.baseUrl + 'name' + '.js',
            script = document.createElement('script');
        script.src = url;

        script.addEventListener('load', function (evt) {
            if (waitingDefine) {
                waitingDefine.unshift(name);
                define.apply(null, waitingDefine);
            }
        }, false);
        script.addEventListener('error', function (evt) {
            getDefer(name).reject(evt);
        }, false);

        document.head.appendChild(script);
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        } else if (!hasProp(deferreds, name)) {
            load(name);
        }

        return getDefer(name).promise;
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            d = getDefer(name),
            args = [],
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            deps.forEach(function (depName, i) {
                map = makeMap(depName, relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = prim().resolve(handlers.require(name)).promise;
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = prim().resolve(handlers.exports(name)).promise;
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = handlers.module(name);
                    args[i] = prim().resolve(cjsModule).promise;
                } else {
                    args[i] = callDep(depName);

                    //TODO figure out plugin dependencies.
                    //if (map.p) {
                    //    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    //    args[i] = defined[depName];
                    //}
                }
            });

            prim.all(args).then(function (values) {
                ret = callback.apply(defined[name], values);

                if (name) {
                    //If setting exports via "module" is in play,
                    //favor that over return value and exports. After that,
                    //favor a non-undefined return value over exports use.
                    if (cjsModule && cjsModule.exports !== undef &&
                            cjsModule.exports !== defined[name]) {
                        resolve(name, d, cjsModule.exports);
                    } else if (ret !== undef || !usingExports) {
                        //Use the return value from the function.
                        resolve(name, d, ret);
                    } else {
                        resolve(name, d, defined[name]);
                    }
                }
            });
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            resolve(name, d, callback);
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            var name = makeMap(deps, callback).f;
            if (!hasProp(defined, name)) {
                throw new Error('Not loaded: ' + name);
            }
            return defined[name];
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 15);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        config = cfg;
        return req;
    };

    req._d = {
        defined: defined,
        waiting: waiting,
        config: config,
        deferreds: deferreds,
        defining: defining
    };

    define = function (name, deps, callback) {
        if (typeof name !== 'string') {
            waitingDefine = arguments;
            return;
        }

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());
