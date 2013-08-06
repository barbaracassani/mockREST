mockREST
===========


Utility to fake the existence of a RESTful service, for development purposes (a bit like CANjs fixtures).
Place some files with json object into the data folder and the service will respond to RESTful calls for POST, PUT, DELETE and GET.

It's stateful, so you can save data during a session. The data are not really written but only kept in a internal object,
and each time you restart the application, it resets itself to the original data.
