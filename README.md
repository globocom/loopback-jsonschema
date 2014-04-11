# Loopback JSON Schema [![Build Status](https://travis-ci.org/globocom/loopback-jsonschema.png?branch=master)](https://travis-ci.org/globocom/loopback-jsonschema)

Adds JSON Schema support to [LoopBack](https://github.com/strongloop/loopback).

## Installing

```
npm install loopback-jsonschema
```

## Setup

Basically add the following code before calling `app.boot();`

```js
var initLoopbackJsonSchema = require('loopback-jsonschema');
initLoopbackJsonSchema(app);
```

## Using

### Dynamically defining Loopback models from a JSON Schema

To dynamically define a new Loopback model just create a new instance of the JsonSchema model provided by loopback-jsonschema. Doing this via the REST interface is as simples as POSTing a valid JSON Schema, as follows:

```
# Create a Person model from a JSON Schema
curl -i -XPOST -H "Content-Type: application/json" http://example.org/api/json-schemas -d '{"title": "person"}'
```

## References

http://json-schema.org/
