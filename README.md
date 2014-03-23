express-summon-route
====================

A utility to call an express route from within another route


##Usage

Right now the utility supports routes registered through the get, post, put, and delete http verbs as well as any middleware registered through the app.use function. summon.route returns an instance of a request to be piped through the express/connect request cycle that can be executed by calling .execute(callback).

### Basic Usage

Invoke a get request, and run through middleware

```
var express = require('expresss');
var summon = require('express-summon-route');
var app = new express();

summon.use(app); // need to pass an instance of app to summon
app.use(function(req, res, next) {
    res.set('x-header-mine','test-header'); // middleware
    next();
})

app.get('/test-route', function(req, res) {
    res.send(200, "Hello World!"); 
});

summon.route('/test-route','GET').execute(function(code, result, response) {
    console.log(result); // outputs Hello World!
    console.log(response.get('x-header-mine')); // outputs test-header
    console.log(code); // 200 
});
```

##Caveats

This library might not work with all middleware because it sends a modified request and response object through express. I will continue to test and find situations where the library may not perform as expected. File and Cookie support are next on the list for compatability. 


