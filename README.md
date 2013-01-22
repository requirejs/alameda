#alameda

An AMD loader, like [requirejs](http://requirejs.org), but with the following
implementation changes:

* Uses promises underneath, via [prim](https://github.com/requirejs/prim).
* Targets "modern" web browsers that implement script.onload standardized behavior.
* Assumes browser support for Array.isArray, array extras, ES5 features.
* Does not support a couple of less-used APIs (see tests section below)

These changes means alameda is around 30% smaller than requirejs, 4148 bytes vs 6036 bytes, minified+gzipped sizes. If you need a basic promise module, alameda comes with
one that can be [injected as a module](#api), so in that case you also save some over
size for your project.

Browser support:

* Firefox
* Chrome
* Safari, WebKits in iOS and Android
* IE 10+

So, no IE 6-9, and probably not NetFront browsers, like the PS3. IE 9 had
[a bug](http://connect.microsoft.com/IE/feedback/details/648057/script-onload-event-is-not-fired-immediately-after-script-execution)
where onload did not follow script execution. That bug was fixed in IE 10. If that fix was backported to IE 9, then alameda would work in IE 9.

You can continue to use requirejs and the r.js optimizer for other scenarios.
The r.js optimizer works well with alameda-based projects.

## API

alameda supports [the requirejs API](http://requirejs.org/docs/api.html). It even
declares `requirejs`, to make passing the requirejs tests easier. alameda also
has a good chance of becoming requirejs in a far-future requirejs version.

One config option alameda exposes that is not part of the requirejs API is the
`primId` config option. You have the option to inject alameda's private
[prim](https://github.com/requirejs/prim) implementation as a module with the
ID given in `primId`:

```javascript
require.config({
    primId: 'prim'
});

require(['prim'], function (prim) {
    // prim here is the prim version built
    // in to alameda.js, no need to deliver
    // a separate prim module.
})
```

With prim, you get a basic [promises a+plus compliant](https://github.com/promises-aplus/promises-tests) implementation with .then() chaining.

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
module loading. Use the [r.js optimizer](http://requirejs.org/docs/optimization.html)
for tools that need this API.

## How to get help

* Contact the [requirejs list](https://groups.google.com/group/requirejs).
* Open issues in the [issue tracker](https://github.com/requirejs/alameda/issues).
