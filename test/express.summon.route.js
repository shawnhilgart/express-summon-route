/*jslint node: true,nomen: true, vars: true */
/*global describe, it, before, beforeEach, after, afterEach */
'use strict';

var summon = require('../lib/express.summon.route');
var Express = require('express');
var assert = require('assert');

function setupApp() {

    var app = new Express();

    // Add Some random middleware
    app.use(Express.bodyParser());

    app.use(function mWare(req, res, done) {
        req.qBits = true; // add variable to know middleware has been run
        done();
    });

    app.use(function mWareTwo(req, res, done) {
        res.set('x-test-header', 'qBit');
        done();
    });

    app.get('/test-route', function(req, res) {
        res.send(200, 'Hello World!');
    });

    app.get('/test-route/:id/:type', function(req, res) {
        res.sed(200, req.params.id + ':' + req.params.type);
    });

    app.post('/test-route', function(req, res) {
        res.send(200, req.body.qBit);
    });

    app.get('/test-route-missing', function(req, res) {
        res.send(404);
    });

    summon.use(app);

    return app;

}

var app = setupApp();


describe('express.summon.route', function() {

    describe('express.summon.route#route', function() {

        it('should return a response containing Hello World!', function(done) {
            
            summon.route('/test-route', 'GET').execute(function(code, result, response) {
                assert.equal(response.get('x-test-header'), 'qBit');
                assert.equal(result, 'Hello World!');
                done();
            });
        });

        it('should return a code of 404', function(done) {

            summon.route('/test-route-missing', 'GET').execute(function(code, result, response) {
                assert.equal(code, 404);
                done();
            });
        });
    });

});