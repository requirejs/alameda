define('localModule', function(){
  return 'xyz';
});

define('packageName', ['localModule'], function(localModule){
  return localModule;
});
