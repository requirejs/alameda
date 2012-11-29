#dynamite

TODO: almond + dynamic loading, and only for modern browsers. Specifically,
latest WebKit, Firefox, Opera and IE10+.

Array.isArray, array extras, standards script loading, which for IE is IE10+

* Error reporting, but no error recovery


## requirejs tests that doe not pass

* multiversion: not supported yet
* onResourceLoadNestedRequire: depends on implementing requirejs.onResourceLoad
hook used for builds/some third party tools.
* requirePluginLoad: depends too much on requirejs sync resolution for that particular built case. Not technically a deficiency in the loader, the globals.main does get set correctly,
and the plugin's load() method is not called.
* definedSpecified: no require.defined() & require.specified.
* None of the error/retries, no require.undef()

## Things that could be considered optional

* loader plugins
* require.defined/specified
* shim support
* map support
* packages support?
* Web Worker support

## How to get help

* Contact the [requirejs list](https://groups.google.com/group/requirejs).
* Open issues in the [issue tracker](https://github.com/requirejs/dynamite/issues).
