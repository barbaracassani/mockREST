mock-restful
===========

[![NPM version](https://badge.fury.io/js/mock-restful.png)](http://badge.fury.io/js/mock-restful)

Utility to fake the existence of a RESTful service, for development purposes (a bit like CANjs fixtures).
Place some files with json object into the data folder and the service will respond to RESTful calls for POST, PUT, DELETE and GET.

It's stateful, so you can save data during a session. The data are not really written but only kept in a internal object, and each time you restart the application, it resets itself to the original data.

It's very simple - very. I've made it because I needed it, so it doesn't contain anything fancy.
Now you can call the id anything you want (but it must be the same for every data file you use, and you must specify it in app.js).

Every file you add to the data folder creates its own route. I have provided two example files. If you launch the app,
you will find that with the example files and default settings, the app will respond to calls to

[yourserver]:8888/stores  // GET
[yourserver]:8888/products  // GET

And the various calls:

[yourserver]:8888/products/88  // GET, DELETE, etc...

I've used the conventions currently outlined in http://en.wikipedia.org/wiki/Representational_state_transfer


Current version: 0.0.3

Usage: put some json file(s) into the data folder. Change the port in app.js if needed. That's it - the app file will create a server and respond to restful calls, as long as they follow the object nesting on the json.

Install
-------

    npm install mock-restful