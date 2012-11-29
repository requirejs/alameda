#alameda

::still under construction::

TODO: almond + dynamic loading, and only for modern browsers. Specifically, latest WebKit, Firefox, Opera and IE10+.

Array.isArray, array extras, standards script loading, which for IE is IE10+

* Error reporting, but no error recovery

backport any prim changes

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


## How to get help

* Contact the [requirejs list](https://groups.google.com/group/requirejs).
* Open issues in the [issue tracker](https://github.com/requirejs/alameda/issues).
