/**
 * mockREST - answers your RESTful calls, and keeps the state if you add or delete (until you restart the app)
 * Useful for development purposes
 * @author Barbara Cassani - barbara [at] kitsch-en [dot] net
 * @version 0.1.7
 * @type {exports|*}
 */
var args = process.argv.slice(2),
    http = require('http'),
    url = require('url'),
    fs = require('fs'),
    routes = {},
    data,
    tokens = {},
    server,
    port = args[0] ||  8888,
    idIdentifier = args[2] || 'id',
    dataFolder = args[1] || "./data",
    noDataMessage = 'No data for this request',
    MockREST = function(conf){
        if (conf) {
            if (conf.port) {
                port = conf.port;
            }
            if (conf.dataFolder) {
                dataFolder = conf.dataFolder;
            }
            if (conf.data) {
                data = conf.data;
            }
        }
    };


MockREST.prototype.grabDataFiles = function() {
    if (!data) {
        fs.readdir(dataFolder, function(err, files) {
            var l = files.length - 1, file, token;
            while (l >= 0) {
                file = files[l];
                if (file.match(/.*.json$/)) {
                    token = this.uuid();
                    tokens[token] = true;
                    this.grabFileContent(dataFolder, file, token);
                }
                l--;
            }
        }.bind(this));
    } else {
        for (var i in data) {
            routes[i] = data[i];
        }
        this.startServer();
    }
};

/**
 * Check if all the requests for files have returned. Will start the server on the last one
 */
MockREST.prototype.onFilesRead = function() {
    for (var i in tokens) {
        if (tokens.hasOwnProperty(i) && tokens[i]) {
            return;
        }
    }
    this.startServer();
};

/**
 * Read a configuration file
 * @param folder
 * @param filename
 * @param returnToken
 */
MockREST.prototype.grabFileContent = function(folder, filename, returnToken) {

    var path = folder + '/' + filename,
        that = this;

    fs.readFile(path, function(err, data){
        var obj = JSON.parse(data), l, method, p, tmp;
        if (!obj) {
            console.warn("File ", path, " is not a valid json file");
        } else {
            for (var i in obj) {
                routes[i] = obj[i];
            }

        }
        tokens[returnToken] = false;
        that.onFilesRead();
    });
};

MockREST.prototype.addEntry = function(data, lastKeyIsNumber, req) {
    if (lastKeyIsNumber) {
        return data;
    }
    if (!req[idIdentifier]) {
        req[idIdentifier] = this.uuid();
    }
    data.push(req);
    return req;
};

MockREST.prototype.modifyEntry = function(data, parObj, lastKey, lastKeyIsNumber, req) {
    var index;
    if (lastKeyIsNumber) {
        parObj.filter(function(val, key) {
            if (val[idIdentifier] === parseInt(lastKey, 10)) {
                index = key;
                return true;
            }
        });
        if (index) {
            parObj[index] = req;
        } else {
            if (!req[idIdentifier]) {
                req[idIdentifier] = this.uuid();
            }
            parObj.push(req);
        }
    } else {
        if (!(typeof req === 'object' && req.length)) {
            req = [req];
        }
        parObj[lastKey] = req;
    }
    return req;
};

MockREST.prototype.deleteEntry = function(data, parObj, lastKey, lastKeyIsNumber) {
    var index, deletedEl;
    if (lastKeyIsNumber) {
        if (parObj.length) {
            parObj.filter(function(val, key) {
                if (val[idIdentifier] === parseInt(lastKey, 10)) {
                    index = key;
                    return true;
                }
            });
            deletedEl = parObj.splice(index,1)[0];
        }

    } else {
        delete parObj[lastKey];
        deletedEl = [];
    }
    return deletedEl;
};

/**
 * Gets the desired route from an URL
 * @param path
 * @param method
 * @param req
 * @return {*}
 */
MockREST.prototype.getData = function(path, method, req) {
    var pathChunks = path.split('/'),
        lastKey, lastKeyIsNumber,
        parentObj,
        response,
        returnObj = routes;

    pathChunks.shift();

    if (pathChunks.length < 1) {
        return 'Please specify a valid RESTful request. Examples\r\n' +
            'http://127.0.0.1/stores';
    }

    for (var i = 0, iLen = pathChunks.length ; i<iLen ; i++) {
        parentObj = returnObj;
        if (pathChunks[i].match(/^[0-9]+$/)) {
            returnObj = returnObj.filter(function(val, key) {
                return val[idIdentifier] === parseInt(pathChunks[i], 10);
            })[0];
            lastKeyIsNumber = true;
        } else {
            returnObj = returnObj[pathChunks[i]];
            lastKeyIsNumber = false;
        }
        lastKey = pathChunks[i];
    }

    response = this.applySideEffects(returnObj, parentObj, method, lastKey, lastKeyIsNumber, req);

    return response !== undefined ? JSON.stringify(response) : noDataMessage;
};

MockREST.prototype.applySideEffects = function(data, parentObj, method, lastKey, lastKeyIsNumber, req) {
    switch(method) {
        case 'GET' :
            return data;
        case 'DELETE' :
            return this.deleteEntry(data, parentObj, lastKey, lastKeyIsNumber);
        case 'PUT':
            return this.modifyEntry(data, parentObj, lastKey, lastKeyIsNumber, req);
        case 'POST':
            return this.addEntry(data, lastKeyIsNumber, req);
    }
};

/**
 * Answers the server calls
 * @param req
 * @param res
 */
MockREST.prototype.createResponse = function(req, res) {

    var payload, status, fullBody = '', _self = this;


    if (req.method == 'POST' || req.method == 'PUT') {

        req.on('data', function(chunk) {
            // append the current chunk of data to the fullBody variable
            fullBody += chunk.toString();
        });

        req.on('end', function() {
            payload = _self.getData(url.parse(req.url).pathname.trim(), req.method, JSON.parse(fullBody));

            if (payload == noDataMessage) {
                status = 404;
            } else {
                status = 200;
            }

            res.writeHead(status, {"Content-Type": "application/json"});

            res.write(payload);
            res.end();
        });

    } else {
        payload = this.getData(url.parse(req.url).pathname.trim(), req.method, req.body);

        if (payload == noDataMessage) {
            status = 404;
        } else {
            status = 200;
        }

        res.writeHead(status, {"Content-Type": "application/json"});
        res.write(payload);
        res.end();

    }

};

/**
 * Generates an unique identifier
 * @return number
 */
MockREST.prototype.uuid =function() {
  return (parseInt((Math.random() * 1000), 10) + parseInt(new Date().valueOf(), 10));
};

/**
 * Starts the server
 */
MockREST.prototype.startServer = function() {
    server = http.createServer(this.createResponse.bind(this)).listen(port);
};

MockREST.prototype.start = function() {
    this.grabDataFiles();
};

MockREST.prototype.stop = function() {
    server.close();
};

if (!module.parent) {
    module.exports = new MockREST().start();
} else {
    module.exports = MockREST;
}
