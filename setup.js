requirejs.config({
  paths : {
    knockout : 'http://cdn.staticfile.org/knockout/3.4.0/knockout-min',
    d3 : 'http://cdn.staticfile.org/d3/3.5.10/d3'
  }
})

require(['./app'], function( app ){
    app.init();
})

