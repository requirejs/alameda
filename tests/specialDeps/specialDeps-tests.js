define('foo', function(require, exports, module) {
    require('exports').name = 'foo';
    require('require')('exports').related = require('module').config().related;
    require('require')('exports').uri = module.uri;
});

require.config({
    config: {
        foo: {
            related: 'bar'
        }
    }
});

require(["foo"], function (foo) {
    doh.register(
        "specialDeps",
        [
            function specialDeps(t) {
                t.is("foo", foo.name);
                t.is("bar", foo.related);
                t.is("./foo.js", foo.uri);
            }
        ]
    );
    doh.run();
});
