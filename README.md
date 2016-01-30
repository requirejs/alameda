#alameda

An AMD loader, like [requirejs](http://requirejs.org), but with the following
implementation changes:

* Assumes Promises are available in the JS environment.
* Targets "modern" web browsers that implement standardized script.onload behavior: execute load listener right after script execution, something IE9 and below did not do.
* Assumes browser support for Array.isArray, array extras, ES5 features.
* Does not support a couple of less-used APIs (see tests section below).

These changes means alameda is around 35% smaller than requirejs, 4.1 KB vs 6.4 KB, minified+gzipped sizes.

Browser support: browsers that [natively provide Promises](http://caniuse.com/#feat=promises). If you need to support IE 10 and 11, the [alameda-prim](https://github.com/requirejs/alameda-prim) project includes a private promise shim.

You can continue to use requirejs and the r.js optimizer for other scenarios.
The r.js optimizer works well with alameda-based projects.

## API

alameda supports [the requirejs API](http://requirejs.org/docs/api.html). It even
declares `requirejs`, to make passing the requirejs tests easier. alameda also
has a good chance of becoming requirejs in a far-future requirejs version.

There are some differences with requirejs though:

### require promise

`require([])` will return a promise.

### require errback

alameda differs from requirejs in this case:

```javascript
require(['something'], function(something) {
  throw new Error('oops');
}, function (err) {
  //requirejs will call this errback function if the callback to require([])
  //throws. However, alameda does not, to match behavior with promises and their
  //errbacks. If you want to catch this error in alameda:
  //require([], function() {}).catch(function(err) {});
});
```

## Running tests

The tests are pulled from almond and requirejs. All tests should be served
through a local web server, as the text loader plugin is used for some tests,
and some browsers restrict local XHR usage when the files are served from
a `file://` URL.

### Bundled tests

To run the tests that are just part of this repo, open `tests/index.html` in
a web browser.

### requirejs tests

To run the requirejs tests, first make sure the following projects have been cloned and are **siblings** to the the alameda repo:

* https://github.com/jrburke/requirejs
* https://github.com/requirejs/domReady
* https://github.com/requirejs/text
* https://github.com/requirejs/i18n

Then do the following:

* symlink alameda.js to require.js
* ./copyrequirejstests.sh

#### requirejs tests that do not pass

* require.undef()-related tests.
* onResourceLoadNestedRequire: depends on implementing requirejs.onResourceLoad
hook used for builds/some third party tools. This API is not required for normal
module loading.

## How to get help

* Open issues in the [issue tracker](https://github.com/requirejs/alameda/issues).
* Contact the [requirejs list](https://groups.google.com/group/requirejs).
