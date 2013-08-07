mock-restful
===========


Utility to fake the existence of a RESTful service, for development purposes (a bit like CANjs fixtures).
Place some files with json object into the data folder and the service will respond to RESTful calls for POST, PUT, DELETE and GET.

It's stateful, so you can save data during a session. The data are not really written but only kept in a internal object, and each time you restart the application, it resets itself to the original data.

It's very simple - very. In the current version it needs the id of the single objects to be called id, and it listens on port 8888.
In future versions, these and other settings might be configurable. I've made it because I needed it, so it doesn't contain anything fancy.

Usage: put some json file(s) into the data folder. Change the port in app.js if needed. That's it - the app file will create a server and respond to restful calls, as long as they follow the object nesting on the json.

Install
-------

    node install mock-restful