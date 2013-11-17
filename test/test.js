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
                            .expect(200, '[{"id":35,"address":"43, Rue Saint-Martin, Lyon","products":["pears","lemons","apples"]}]', done);

                    })
            })
    })

});