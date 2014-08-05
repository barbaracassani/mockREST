var should = require('chai').should(),
    supertest = require('supertest'),
    app = require('../app.js'),
    api = supertest('http://localhost:8888');

describe('Base connection', function() {

    it('errors if no file corresponding to the route is found', function(done) {
        api.get('/hor33333ses')
            .expect(404, done)
    });

    it('responds with a 200 if the route is found', function(done) {
        api.get('/products')
            .expect(200, done)
    });

    it('responds correctly when getting an item', function(done) {
       api.get('/products/1')
           .expect(200, '{"id":1,"obj":"carrot","packages":{"single":{"id":9,"price":0.9},"kilo":{"id":10,"price":0.5}}}', done);
    });

    it('responds correctly when getting an item, redux', function(done) {
        api.get('/products/1/packages/single')
            .expect(200, '{"id":9,"price":0.9}', done);
    });

    it('responds correctly when getting a category', function(done) {
        api.get('/products/1/packages')
            .expect(200, '{"single":{"id":9,"price":0.9},"kilo":{"id":10,"price":0.5}}', done);
    });

    it('responds correctly when getting a category, redux', function(done) {
        api.get('/stores/34/products')
            .expect(200, '["pears","lemons"]', done);
    });


    it('responds correctly when deleting an item', function(done) {
        api.get('/stores')
            .expect(200, '[{"id":34,"address":"34, Rue Vaugirard, Paris","products":["pears","lemons"]},{"id":35,"address":"43, Rue Saint-Martin, Lyon","products":["pears","lemons","apples"]}]')
            .end(function() {
                api.del('/stores/34')
                    .expect(200, '{"id":34,"address":"34, Rue Vaugirard, Paris","products":["pears","lemons"]}')
                    .end(function() {
                        api.get('/stores')
                            .expect(200, '[{"id":35,"address":"43, Rue Saint-Martin, Lyon","products":["bananas","lemons","apples"]}]', done);

                    })
            })
    });


    it('responds correctly when posting an item', function(done) {
        api.post('/stores')
            .send({"id":60,"address":"16 High Road, Milton Keynes","products":["bananas"]})
            .end(function() {
                api.get('/stores/60')
                    .expect(200, '{"id":60,"address":"16 High Road, Milton Keynes","products":["bananas"]}', done);
            })
    });

    it('responds correctly when posting an item without id', function(done) {
        api.post('/stores')
            .send({"address":"89 Rue de la Mare aux Vaches","products":["pineapples"]})
            .expect(200, function(err, data) {
                var id = JSON.parse(data.res.text).id;
                api.get('/stores/' + id)
                    .expect(200, '{"address":"89 Rue de la Mare aux Vaches","products":["pineapples"],"id":' + id + '}', done);
            })
    });

    it('responds correctly when putting an item', function(done) {
        api.put('/products/1')
            .set('Content-Type', 'application/json')
            .send({"single":{"id":9,"price":0.9},"kilo":{"id":10,"price":0.5}, "ton":{"id":15,"price":0.1}})
            .end(function() {
                api.get('/products/1')
                    .expect(200, '{"id":1,"obj":"carrot","packages":{"single":{"id":9,"price":0.9},"kilo":{"id":10,"price":0.5}}}', done)
            })
    });

    it('responds correctly when putting a category', function(done) {
        api.put('/products/1/packages')
            .send({"single":{"id":9,"price":0.9},"kilo":{"id":10,"price":0.5}, "ton":{"id":15,"price":0.1}})
            .end(function() {
                api.get('/products/1')
                    .expect(200, '{"id":1,"obj":"carrot","packages":[{"single":{"id":9,"price":0.9},"kilo":{"id":10,"price":0.5},"ton":{"id":15,"price":0.1}}]}', done)
            })
    });

    it('responds correctly when deleting a category', function (done) {
        api.get('/stores')
            .expect(200, '[{"id":34,"address":"34, Rue Vaugirard, Paris","products":["pears","lemons"]},{"id":35,"address":"43, Rue Saint-Martin, Lyon","products":["pears","lemons","apples"]}]')
            .end(function() {
                api.del('/stores')
                    .expect(200, '{"id":34,"address":"34, Rue Vaugirard, Paris","products":["pears","lemons"]}')
                    .end(function() {
                        api.get('/stores')
                            .expect(404, done);

                    })
            })
    });



});