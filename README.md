#alameda

::still under construction::

TODO: almond + dynamic loading, and only for modern browsers. Specifically, latest WebKit, Firefox, Opera and IE10+. So, PS3/NetFront probably out. Find the IE bug number.

Array.isArray, array extras, standards script loading, which for IE is IE10+

Not a complete thing, cannot be used by r.js for example, only runs
in browser, not node, etc...

* Error reporting, but no error recovery

* backport any prim changes
* Test in other browsers.

## requirejs tests that do not pass

* multiversion: not supported yet
* onResourceLoadNestedRequire: depends on implementing requirejs.onResourceLoad
hook used for builds/some third party tools.
and the plugin's load() method is not called.
* None of the error/retries, no require.undef()

Opted to also defined requirejs name to make passimg tests easier.

see copy script - > rename alameda to requirejs?
also assumes other projects in the requirejs github groups are checked
out as siblings:

* https://github.com/requirejs/domReady
* https://github.com/requirejs/text
* https://github.com/requirejs/i18n

## Things that could be considered optional

* loader plugins
* require.defined/specified
* shim support
* map support
* packages support?
* Web Worker support
* contexts?

No undef, onResourceLoad before contexts:
3997 min.gz
9270 min

After contexts:
4138 min.gz
9523 min

Remove prim (assume byoa promises)
3709 min.gz
8260 min

PLUS: prim, shim/getGlobal, map, web workers/isBrowser, require.defined/specified:
3298 min.gz
7130 min

PLUS: no plugins (map.pr, plugin, makeLoad)
2970 min.gz
6410



## How to get help

* Contact the [requirejs list](https://groups.google.com/group/requirejs).
* Open issues in the [issue tracker](https://github.com/requirejs/alameda/issues).
