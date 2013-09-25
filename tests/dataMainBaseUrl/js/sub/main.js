require(['other'], function(other){
    doh.register(
        'dataMainBaseUrl',
        [
            function dataMainBaseUrl(t){
                t.is('other', other.name);
            }
        ]
    );
    doh.run();
});