# alameda

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

## Install

[Latest release information](https://github.com/requirejs/alameda/releases)

If using a package manager:

```
npm install alameda

# or

[npm | bower | volo] install requirejs/alameda
```

## API

alameda supports [the requirejs API](http://requirejs.org/docs/api.html). It even
declares `requirejs`, to make passing the requirejs tests easier. alameda also
has a good chance of becoming requirejs in a far-future requirejs version.

There are some differences with requirejs though:

### require promise

`require([])` will return a promise. The success callback passed to `require([])` should return a value if you want a value to be passed to the next .then() in the promise chain.

```javascript
require(['a', 'b'], function(a, b) {
  // succes callback. Return a value for the next part in the promise chain.
  return [a, b];
}).then(function(mods) {
  //mods[0] is the 'a' module, mods[1] is the 'b' module in this case.
});
```

### config.defaultErrback

In requirejs and alameda, with this sort of call, the errback will be called if there is an error in either loading `['a', 'b']` or if the success callback throws an error.

```javascript
require(['a', 'b'], function(a, b) {
  // succes callback
}, function(err) {
  // errback, called if 'a', 'b' do not load, or
  // if the success callback is called.
});
```

So, the errback operates like:

```javascript
require([], function() {}).catch(function(err) {})`;
````

If you do not pass an errback into the require() call, and instead use a .then() or .catch() to deal with the error, you still may see the error surface outside. This is done because browsers do not all show unhandled errors in a promise chain, and the require() call itself does not know if an error handler was chained on the end, so it generates an error to make debugging and development easier.

However, if you are properly chaining error handlers but do not pass an errback as the third arg to the require([]) call, then you can turn off this extra error surfacing by doing:

```javascript
requirejs.config({
  defaultErrback: null
});
```

If you pass a function for the `defaultErrback` value, then that will be used instead of the default "delayedError" handler used by alameda to surface the error.

## License

MIT

## Code of Conduct

[jQuery Foundation Code of Conduct](https://jquery.org/conduct/).

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

* https://github.com/requirejs/requirejs
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
