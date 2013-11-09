/**
 * mockREST - answers your RESTful calls, and keeps the state if you add or delete (until you restart the app)
 * Useful for development purposes
 * @author Barbara Cassani - barbara [at] kitsch-en [dot] net
 * @version 0.0.3
 * Instructions:
 * - put one or more valid json files into the data folder
 * - [optional] change below the port to what you want (if you want)
 * - [optional] change the idIdentifier below if the id in your files is not called 'id'
 * - start the server with node app.js
 * - test the app by calling [whateverYourServerIsCalled]:[port]/stores/35 (admitting that you haven't changed the id
 * and that the example files are still in the data folder)
 * - enjoy.
 * @type {exports|*}
 */
var http = require('http'),
    url = require('url'),
    fs = require('fs'),
    routes = {},
    data,
    tokens = {},
    server,
    port = 8888,
    idIdentifier = 'id',
    dataFolder = "./data";

function grabDataFiles() {
    fs.readdir(dataFolder, function(err, files) {
        var l = files.length - 1, file, token;
        while (l >= 0) {
            file = files[l];
            if (file.match(/.*.json$/)) {
                token = uuid();
                tokens[token] = true;
                grabFileContent(dataFolder, file, token);
            }
            l--;
        }
    });
}

/**
 * Check if all the requests for files have returned. Will start the server on the last one
 */
function onFilesRead() {
    for (var i in tokens) {
        if (tokens.hasOwnProperty(i) && tokens[i]) {
            return;
        }
    }
    startServer();
}

/**
 * Read a configuration file
 * @param folder
 * @param filename
 * @param returnToken
 */
function grabFileContent(folder, filename, returnToken) {

    var path = folder + '/' + filename;

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
        onFilesRead();
    });
}
function addEntry(data, lastKeyIsNumber, req) {
    if (lastKeyIsNumber) {
        return data;
    }
    if (!req[idIdentifier]) {
        req[idIdentifier] = uuid();
    }
    data.push(req);
    return req;
}
function modifyEntry(data, parObj, lastKey, lastKeyIsNumber, req) {
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
                req[idIdentifier] = uuid();
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
}
function deleteEntry(data, parObj, lastKey, lastKeyIsNumber) {
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
}
/**
 * Gets the desired route from an URL
 * @param path
 * @param method
 * @param req
 * @return {*}
 */
function getData(path, method, req) {
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
        if (pathChunks[i].match(/(\d+)/)) {
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

    response = applySideEffects(returnObj, parentObj, method, lastKey, lastKeyIsNumber, req);

    return response !== undefined ? JSON.stringify(response) : 'No data for this request';
}

function applySideEffects(data, parentObj, method, lastKey, lastKeyIsNumber, req) {
    switch(method) {
        case 'GET' :
            return data;
        case 'DELETE' :
            return deleteEntry(data, parentObj, lastKey, lastKeyIsNumber);
        case 'PUT':
            return modifyEntry(data, parentObj, lastKey, lastKeyIsNumber, req);
        case 'POST':
            return addEntry(data, lastKeyIsNumber, req);
    }
}

/**
 * Answers the server calls
 * @param req
 * @param res
 */
function createResponse(req, res) {

    res.writeHead(200, {"Content-Type": "application/json"});

    if (req.method == 'POST' || req.method == 'PUT') {

        var fullBody = '';

        req.on('data', function(chunk) {
            // append the current chunk of data to the fullBody variable
            fullBody += chunk.toString();
        });

        req.on('end', function() {
            res.write(getData(url.parse(req.url).pathname.trim(), req.method, JSON.parse(fullBody)));
            res.end();
        });

    } else {
        var payload = getData(url.parse(req.url).pathname.trim(), req.method, req.body);
        res.write(payload);
        res.end();

    }

}

/**
 * Generates an unique identifier
 * @return number
 */
function uuid() {
  return (parseInt((Math.random() * 1000), 10) + parseInt(new Date().valueOf(), 10));
}

/**
 * Starts the server
 */
function startServer() {
    server = http.createServer(createResponse).listen(port);
}

grabDataFiles();