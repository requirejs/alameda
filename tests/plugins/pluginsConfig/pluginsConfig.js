var expectedConfig;

define('plugin/plugin',{
    load: function (id, require, load, config) {
        expectedConfig = config;
        load(id);
    }
});


require({
    foo: 'bar',
    map: {
        '*': {
            'plugin': 'plugin/plugin'
        }
    }
}, ['plugin!foo'], function (value) {

    doh.register(
        'pluginsConfig',
        [
            function pluginsConfig(t){
                t.is('bar', expectedConfig.foo);
            }
        ]
    );
    doh.run();

});
