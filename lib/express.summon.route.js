/*jslint node: true,nomen: true, vars: true */
'use strict';

var router;
var app;
var summon = {};
var express = require('express');
var http = require('http');


/**
 * @class Socket
 * @description mock socket for response class to pipe through express
 */

function Socket() {
    // socket
}

/**
 * @memberOf Socket
 * @description mock destroy functionality, created to avoid errors in express
 */

Socket.prototype.destroy = function() {};

/**
 * @class Request
 * @description mock request class to pipe through express
 */

function Request() {
    this.socket = new Socket();
    this.headers = {};
}

Request.prototype = express.request; // add on the additional express tools each request inherits

/**
 * @class Response
 * @description mock response class to pipe through express
 */

function Response() {

}

Response.prototype = express.response; // add on the additional express tools each response inherits

/**
 * @memberOf Response
 * @description Mocks the send functionality, and executes the registered callback
 */

Response.prototype.send = function(code, response) {
    
    if(typeof code !== 'integer' && response === undefined) {
        response = code;
    };

    this.callback(code, response, this);

};

/**
 * @memberOf Response
 * @description Mocks the end functionality, excutues the registered callback with end msg
 *
 * @param {string} msg
 */

Response.prototype.end = function(msg) {
    this.callback(msg);
};

/**
 * @memberOf Response
 * @description set callback function if res.send or res.end is called
 *
 * @param {RequestCallback}
 */

Response.prototype.setCallback = function(cb) {
    this.callback = cb;
};

/**
 * @memberOf Response
 * @description Pass through functionality for the express set method
 *
 * @param {string} h header key
 * @param {string} v header value
 */

Response.prototype.setHeaders = function(h, v) {
    this.set(h, v);
};

/**
 * @class SummonRequest
 * @description Sets up request/response elements to run through express
 *
 * @param {string} path route path to call
 * @param {string} method HTTP VERB 
 */

function SummonRequest(path, method) {
    this.request = new Request();
    this.response = new Response();
    this.request.method = method;
    this.request.calledFromSummon = true;
    this.request.url = path;
    this.path = path;
    this.method = method;
    this.response.method = method;
    this.route = router.match(method, path);
}

/**
 * @memberOf SummonRequest
 * @description Attaches body object to the request, the bodyParser middleware should still work 
 *
 * @param {object} body an object containing the body element
 *
 * @return {SummonRequest}
 */

SummonRequest.prototype.addBody = function(body) {
    this.request.body = body || {};
    return this;
};

/**
 * @memberOf SummonRequest
 * @description Attaches a cookie object to the reqest, still needs work
 *
 * @return {SummonRequest}
 */

SummonRequest.prototype.addCookie = function(cookie) {
    return this;
};

/**
 * @memberOf SummonRequest
 * @description add files to the request, still needs work
 *
 * @return {SummonRequest}
 */

SummonRequest.prototype.addFiles = function(files) {
    this.request.files = files;
    return this;
};

/**
 * @memberOf SummonRequest
 * @description add headers to the request, still needs work
 *
 * @return {SummonRequest}
 */

SummonRequest.prototype.addHeaders = function(headers) {
    return this;
};

/**
 * @typedef RequestCallback
 *
 * @param {integer} code http status code
 * @param {string|object|array} response http response
 * @param {Response} response full response object
 */

/**
 * @memberOf SummonRequest
 * @description pass generated request/response to express/connects app.handle
 *
 * @param {function} cb callback function
 */

SummonRequest.prototype.execute = function(cb) {
    if (this.route) {
        this.response.setCallback(cb);
        app.handle(this.request, this.response);
    } else {
        cb(404, null, this.response); // no route found in the router map
    }
};

/**
 * @description pass in a reference of the express app, we need this to get the express, _router
 *
 * @param {object} expressApp an instance of an express app
 */


summon.use = function(expressApp) {
    router = expressApp._router;
    app = expressApp;
};

/**
 * @description Generates and returns a new instance of of {SummonRequest}
 *
 * @param {string} path
 * @param {string} method HTTP VERB
 * @param {string} domain domain to call from, use this if your middle ware is dependent on domains
 */

summon.route = function(path, method, domain) {
    path = domain !== undefined ? domain + path : path;
    return new SummonRequest(path, method);
};

module.exports = summon;