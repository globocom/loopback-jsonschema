# Loopback JSON Schema [![Build Status](https://travis-ci.org/globocom/loopback-jsonschema.png?branch=master)](https://travis-ci.org/globocom/loopback-jsonschema)

Adds JSON Schema support to [LoopBack](https://github.com/strongloop/loopback).

## Installing

```
npm install loopback-jsonschema
```

## Setup

### Initializing

Add the following code after calling `app.boot();`

```js
var loopbackJsonSchema = require('loopback-jsonschema');
loopbackJsonSchema.init(app);
```

### Configuring a DataSource

Add a `loopbackJsonSchemaDb` entry to the `datasources.json` file with your data source configuration. If no `loopbackJsonSchemaDb` entry is found, we fallback to using the default memory data source.

### Overriding the default base model

By default, Loopback's `Model` is used as the base for dynamically defined models. It is possible to override this by passing a custom implementation to the `init` function:

```js
loopbackJsonSchema.init(app, { Model: MyCustomModel });
```

### Overriding the default collection schema

It is possible to override the default collection schema by passing a custom `CollectionSchema` implementation to the `init` function:

```js
loopbackJsonSchema.init(app, { CollectionSchemaClass: MyCustomCollectionSchema });
```

```js
var util = require('util');
var CollectionSchema = require('loopback-jsonschema/lib/domain/collection-schema');

function MyCustomCollectionSchema() {
    CollectionSchema.apply(this, Array.prototype.slice.call(arguments));
};

util.inherits(MyCustomCollectionSchema, CollectionSchema);
// It's required to set the value of "pluralModelName". This value will be used on the headers. You can still use the default value (see below).
MyCustomCollectionSchema.pluralModelName = MyCustomCollectionSchema.super_.pluralModelName;

// Override functions to customize the default collection schema.
```

Have a look at https://github.com/globocom/loopback-jsonschema/blob/master/lib/domain/collection-schema.js for available functions to override.

## Using

### Dynamically defining Loopback models from a JSON Schema

To dynamically define a new Loopback model just create a new instance of the ItemSchema model provided by loopback-jsonschema. Doing this via the REST interface is as simples as POSTing a valid JSON Schema, as follows:

```
# person.json
{
  "type": "object",
  "title": "Person",
  "collectionTitle": "People",
  "modelName": "person",
  "collectionName": "people",
  "properties": {
    ...
  }
}
```

```
# Create a Person model from a JSON Schema
curl -i -XPOST -H "Content-Type: application/json" http://example.org/api/item-schemas -T person.json
```

The people collection will then be available at `http://example.org/api/people`.

### Item and Collection schemas

Once a Loopback model has been defined, Item and Collection schemas describing a single item and a collection of items, respectively, are automatically available.

#### Item Schema example

```
$ curl -i http://example.org/api/item-schemas/537530ea27f8870b63f2d886
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 577
ETag: "-912870715"
Date: Mon, 19 May 2014 19:07:14 GMT
Connection: keep-alive

{
  "id": "537530ea27f8870b63f2d886",
  "type": "object",
  "title": "Person",
  "collectionTitle": "People",
  "modelName": "person",
  "collectionName": "people",
  "links": [
    {
      "rel": "self",
      "href": "http://example.org/api/people/{id}"
    },
    {
      "rel": "item",
      "href": "http://example.org/api/people/{id}"
    },
    {
      "rel": "update",
      "method": "PUT",
      "href": "http://example.org/api/people/{id}"
    },
    {
      "rel": "delete",
      "method": "DELETE",
      "href": "http://example.org/api/people/{id}"
    }
  ],
  "$schema": "http://json-schema.org/draft-04/hyper-schema#"
}
```

#### Collection Schema example

```
$ curl -i http://example.org/api/collection-schemas/537530ea27f8870b63f2d886
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/schema+json; charset=utf-8
Content-Length: 373
ETag: "-833543453"
Date: Wed, 11 Jun 2014 20:10:41 GMT
Connection: keep-alive

{
  "$schema": "http://json-schema.org/draft-04/hyper-schema#",
  "title": "People",
  "type": "array",
  "items": {
    "$ref": "http://example.org/api/item-schemas/537530ea27f8870b63f2d886"
  },
  "links": [
    {
      "rel": "self",
      "href": "http://example.org/api/people"
    },
    {
      "rel": "add",
      "method": "POST",
      "href": "http://example.org/api/people",
      "schema": {
        "$ref": "http://example.org/api/item-schemas/537530ea27f8870b63f2d886"
      }
    },
    {
      "rel": "previous",
      "href": "http://example.org/api/people?filter[limit]={limit}&filter[offset]={previousOffset}{&paginateQs*}"
    },
    {
      "rel": "next",
      "href": "http://example.org/api/people?filter[limit]={limit}&filter[offset]={nextOffset}{&paginateQs*}"
    },
    {
      "rel": "page",
      "href": "http://example.org/api/people?filter[limit]={limit}&filter[offset]={offset}{&paginateQs*}"
    },
    {
      "rel": "order",
      "href": "http://example.org/api/people?filter[order]={orderAttribute} {orderDirection}{&orderQs*}"
    }
  ]
}
```

### Default links

Item and collection schemas have a default set of links which correspond to the basic CRUD operations supported by Loopback.

### Including custom links in an item schema

It is possible to include custom links in an item schema. To do so, just include them in the `links` property of the **item schema** used to define a Loopback model:

```
{
  "type": "object",
  ...
  "properties": {
    ...
  },
  "links": [
    {
      "rel": "my-custom-item-schema-link",
      "href": "http://example.org/my/custom/item-schema-link"
    }
  ]
}
```

### Including custom links in a collection schema

It is possible to include custom links in a collection schema. To do so, just include them in the `collectionLinks` property of the **item schema** used to define a Loopback model:

```
{
  "type": "object",
  ...
  "properties": {
    ...
  },
  "collectionLinks": [
    {
      "rel": "my-custom-collection-schema-link",
      "href": "http://example.org/my/custom/collection-schema-link"
    }
  ]
}
```

### Instance/Schema correlation

Every request for an instance is automatically correlated to its schema according to the [recommendation of the JSON Schema spec](http://json-schema.org/latest/json-schema-core.html#anchor33).

### Instance Validation

Once a Item Schema has been defined all instances created or updated will be validated according the schema. In case of validation error loopback-jsonschema will return an error message following loopback error message format.

This module supports both drafts: Draft-4(default) and Draft-3. The error messages and codes try to follow the messages/codes returned by the module [tv4](https://github.com/geraintluff/tv4).

If you want to use draft-3, you need to override the `$schema` property, for instance:

```
{
  "$schema": "http://json-schema.org/draft-03/hyper-schema#",
  "type": "object",
  ...
  "properties": {
    "name": {
      "type": "string",
      "title": "Full name"
     }
   ...
  }
}

```


## Sample App

An example running LoopBack with this module: https://github.com/globocom/loopback-jsonschema-example

## Disclaimer

This project is very much in an alpha stage at the moment. But it is being actively developed. Contributions (code, documentation, issues, etc.) are very welcome.

## References

http://json-schema.org/
