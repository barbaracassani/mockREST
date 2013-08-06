var app = require('../app');

var http = require('http'),
    url     = 'http://localhost:8888/';

describe("get requests", function() {
    it("should respond with the correct data on a main end point", function(done) {
        http.get(url + "products", function(response){
            expect(response.statusCode).toBe(200);
            response.on('data', function(json) {
                var parsedData = JSON.parse(json);
                expect(parsedData[0].id).toEqual(1);
                expect(parsedData[1].id).toEqual(88);
                expect(parsedData[1].packages.single.id).toBeDefined();
                expect(parsedData[1].packages.single.id).toEqual(11);
                expect(parsedData.length).toEqual(5);
                done();
            });
        });
    }, 5000);
    it("should respond with the correct data on a detail page", function(done) {
        http.get(url + "products/4", function(response){
            expect(response.statusCode).toBe(200);
            response.on('data', function(json) {
                var parsedData = JSON.parse(json);
                expect(parsedData.id).toEqual(4);
                expect(parsedData.obj).toEqual("fish");
                expect(parsedData.packages).toBeDefined();
                done();
            });
        });
    }, 5000);
    it("should respond with the correct data on a packages page", function(done) {
        http.get(url + "products/3/packages", function(response){
            expect(response.statusCode).toBe(200);
            response.on('data', function(json) {
                var parsedData = JSON.parse(json);
                expect(parsedData.single.id).toEqual(15);
                expect(parsedData.kilo.id).toEqual(16);
                expect(parsedData.kilo.price).toEqual(2);
                done();
            });
        });
    }, 5000);
});
describe('delete requests', function() {
    var options = {
        host: 'localhost',
        path : "/products/3",
        port : 8888,
        method : "DELETE",
        headers: {
            accept: 'application/json',
            'Content-Length': 3495
        }
    };
    var request;

    it("deletes correctly a single element", function(done) {
        request = http.request(options, function(response){
            response.on('data', function (rp) {
                var r = JSON.parse(rp);
                expect(r.id).toBe(3);
                describe('state', function(){
                    it('it\'s stateful', function(done){
                        http.get(url + "products", function(response){
                            expect(response.statusCode).toBe(200);
                            response.on('data', function(json) {
                                var parsedData = JSON.parse(json);
                                expect(parsedData.length).toBe(4);
                                done();
                            });
                        });
                    }, 5000);
                });
            });
            done();
        });
        request.end();
    }, 5000);

    it("deletes correctly a collection", function(done) {
        options.path = "/products/2/packages";
        request = http.request(options, function(response){
            response.on('data', function (rp) {
                var r = JSON.parse(rp);
                expect(r.length).toBe(0);
                describe('state', function(){
                    it('it\'s stateful', function(done){
                        http.get(url + "products/2", function(response){
                            expect(response.statusCode).toBe(200);
                            response.on('data', function(json) {
                                var parsedData = JSON.parse(json);
                                expect(parsedData.packages).toBeUndefined();
                                done();
                            });
                        });
                    }, 5000);
                });
            });
            done();
        });
        request.end();
    }, 5000);
});
describe('put requests', function() {
    var message = JSON.stringify({
            "id" : 35,
            "address" : "Via de Condotti, Roma",
            "products" : ["bananas", "pears", "lemons", "apples"]
        }),
        options = {
            host: 'localhost',
            path : "/stores/35",
            port : 8888,
            method : "PUT",
            headers: {
                accept: 'application/json',
                'Content-Length': message.length
            }
        };
    var request;
    it("modifies correctly a single element", function(done) {
        request = http.request(options, function(response){
            response.on('data', function (rp) {
                var r = JSON.parse(rp);
                expect(r.address).toBe("Via de Condotti, Roma");
                expect(r.products.length).toBe(4);
                describe('state', function(){
                    it('it\'s stateful', function(done){
                        http.get(url + "stores", function(response){
                            expect(response.statusCode).toBe(200);
                            response.on('data', function(json) {
                                var parsedData = JSON.parse(json);
                                expect(parsedData.length).toBe(3);
                                done();
                            });
                        });
                    }, 5000);
                });
            });
            done();
        });
        request.write(message);
        request.end();
    }, 5000);
});
describe('post requests', function() {
    var message = JSON.stringify({
            "address" : "Streitstrasse, Zurich",
            "products" : ["pears", "lemons", "apples"]
        }),
        options = {
        host: 'localhost',
        path : "/stores",
        port : 8888,
        method : "POST",
        headers: {
            accept: 'application/json',
            'Content-Length': message.length
        }
    };
    var request;
    it("adds correctly a single element", function(done) {
        request = http.request(options, function(response){
            response.on('data', function (rp) {
                var r = JSON.parse(rp);
                expect(r.address).toBe("Streitstrasse, Zurich");
                describe('state', function(){
                    it('it\'s stateful', function(done){
                        http.get(url + "stores", function(response){
                            expect(response.statusCode).toBe(200);
                            response.on('data', function(json) {
                                var parsedData = JSON.parse(json);
                                expect(parsedData.length).toBe(3);
                                done();
                            });
                        });
                    }, 5000);
                });
            });
            done();
        });
        request.write(message);
        request.end();
    }, 5000);
});