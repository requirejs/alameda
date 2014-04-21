/*jshint browser: true */
/*global requirejs */
(function() {
    var oldLoad = requirejs.load,
        slice = Array.prototype.slice,
        hasOwn = Object.prototype.hasOwnProperty,
        commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,
        cjsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g,
        apiRegExp = /([^\.]|^)define\s*\(\s*(['"][^"']+["']\s*,)?\s*function\s*\(\s*require/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    function fetchText(url, callback, errback) {
        var xhr = new XMLHttpRequest();

        xhr.open('GET', url, true);
        xhr.onreadystatechange = function(evt) {
            var status, err;
            if (xhr.readyState === 4) {
                status = xhr.status;
                if (status > 399 && status < 600) {
                    //An http 4xx or 5xx error. Signal an error.
                    err = new Error(url + ' HTTP status: ' + status);
                    err.xhr = xhr;
                    errback(err);
                } else {
                    callback(xhr.responseText);
                }
            }
        };
        xhr.responseType = 'text';
        xhr.send(null);
    }


    requirejs._findDepsFromFactory = function(context, name, deps, factory) {
        if (hasProp(context._depScans, name)) {
            var foundDeps = context._depScans[name];
            if (foundDeps) {
                foundDeps.forEach(function(foundDep) {
                    deps.push(foundDep);
                });
            }
        }
    };

    function findDeps(context, id, text) {
        var deps = [];
        text =  text.replace(commentRegExp, '');

        var match = apiRegExp.exec(text);
        if (match) {
            text = text.substring(match.index + match[0].length);
            text.replace(cjsRequireRegExp, function (match, dep) {
                deps.push(dep);
            });

            if (deps.length) {
                if (!hasProp(context, '_depScans')) {
                    context._depScans = {};
                }
                context._depScans[id] = deps;
            }
        }
    }

    requirejs.load = function(map, context) {
        var args = slice.call(arguments);

        fetchText(map.url, function(text) {
            findDeps(context, map.id, text);
            oldLoad.apply(requirejs, args);
        }, function(e) {
          var err = new Error('Load failed: ' + map.id + ': ' + map.url +
                              ': ' + e);
          err.requireModules = [map.id];
          context.deferreds[map.id].reject(err);
        });
    };
}());

