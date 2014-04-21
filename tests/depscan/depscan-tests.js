require([
    'a',
    'b'
], function() {

    var depScans = requirejs.contexts._._depScans;


    doh.register(
        "depscan",
        [
            function depscan(t) {
                var aDeps = depScans.a;

                t.is("alpha", aDeps[0]);
                t.is("beta", aDeps[1]);


            }
        ]
    );
    doh.run();
});
