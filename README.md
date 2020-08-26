# Loopback JSON Schema [![Build Status](https://travis-ci.org/backstage/loopback-jsonschema.png?branch=master)](https://travis-ci.org/backstage/loopback-jsonschema)

DEPRECATED. This project does not receive active maintenance.


## Installing

```
npm install @globocom/loopback-jsonschema
```

## Setup

### Initializing

Add the following code after calling `app.boot();`

```js
var loopbackJsonSchema = require('loopback-jsonschema');
loopbackJsonSchema.init(app);
loopbackJsonSchema.enableJsonSchemaMiddleware(app);
```

### Configuring a DataSource

Add a `loopbackJsonSchemaDb` entry to the `datasources.json` file with your data source configuration. If no `loopbackJsonSchemaDb` entry is found, we fallback to using the default memory data source.

### Overriding the default base model

By default, Loopback's `Model` is used as the base for dynamically defined models. It is possible to override this by passing a custom implementation to the `init` function:

```js
loopbackJsonSchema.init(app, { Model: MyCustomModel });
```

### Hook: beforeRegisterLoopbackModel

Immediately before registering a Loopback model from an item schema, the method `ItemSchema#beforeRegisterLoopbackModel(app, JsonSchemaModel, callback)` is called. This hook can be used for any customizations that are needed before a model is registered.

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

```json
# person.json
{
  "type": "object",
  "title": "Person",
  "collectionTitle": "People",
  "collectionName": "people",
  "properties": {
    ...
  }
}
```

```bash
# Create a Person model from a JSON Schema
curl -i -XPOST -H "Content-Type: application/json" http://example.org/api/item-schemas -T person.json
```

The people collection will then be available at `http://example.org/api/people`.

### Item and Collection schemas

Once a Loopback model has been defined, Item and Collection schemas describing a single item and a collection of items, respectively, are automatically available.

#### Item Schema example

```bash
$ curl -i http://example.org/api/item-schemas/people
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

```bash
$ curl -i http://example.org/api/collection-schemas/people
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
    "$ref": "http://example.org/api/item-schemas/people"
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
        "$ref": "http://example.org/api/item-schemas/people"
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

### Default values and read-only properties

It's possible to use `readOnly` property to indicate that the instance property should not be changed (if it has a value of boolean true).

It's possible to use `default` property to indicate that when the instance property is not passed the default value will be used.

If the schema indicates that the property has both `readOnly: true` and `default` values defined, the default value will be used.

For example:

```json
{
    "title": "Bikes Rules",
    "type": "object",
    "$schema": "http://json-schema.org/draft-04/hyper-schema#",
    "collectionName": "bikes",
    "name": "My Awesome Bikes!",
    "properties": {
        "brand": {
            "description": "Brand of the bike",
            "default": "kawasaki",
            "type": "string"
        },
        "cc": {
            "description": "Cubic Centimeters",
            "default": "120",
            "readOnly": true,
            "type": "integer"
        },
        "name": {
            "description": "Name of the bike",
            "readOnly": false,
            "type": "string"
        }
    }
}
```

```bash
curl -XPOST -H "Content-Type: application/json" http://example.org/api/bikes -d'
{
    "cc": 350,
    "name": "Ninja"
}'
```

The output will be:
```json
{
    id: "5460b29652fe613c00f23f75",
    created: "2014-11-10T12:41:58.344Z",
    modified: "2014-11-10T12:41:58.344Z",
    name: "Ninja",
    brand: "kawasaki",
    cc: 120
}
```


### Default links

Item and collection schemas have a default set of links which correspond to the basic CRUD operations supported by Loopback.

### Including custom links in an item schema

It is possible to include custom links in an item schema. To do so, just include them in the `links` property of the **item schema** used to define a Loopback model:

```json
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

```json
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

```json
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

### Indexes

It's possible to create indexes by adding a key called `indexes`.

See [Indexes](http://docs.strongloop.com/display/LB/Model+definition+JSON+file#ModeldefinitionJSONfile-Indexes) in Loopback documentation for more information.

```json
{
    "type": "object",
    "title": "Task",
    "collectionTitle": "To-Do List",
    "collectionName": "tasks",
    "properties": {
        "title": {
          "title": "Title",
          "type": "string"
        },
        "slug": {
          "title": "Slug",
          "type": "string"
        },
        "value": {
          "title": "Value",
          "type": "integer"
        }
    },
    "indexes": {
        "title_value_index": {
            "keys": {"title": 1, "value": -1}
        },
        "title_index": {"title": 1},
        "slug_index": {
            "keys": {"slug": 1},
            "options": {"unique": true}
        }
    }
}

```




## Sample App

An example running LoopBack with this module: https://github.com/globocom/loopback-jsonschema-example

## Disclaimer

This project is very much in an alpha stage at the moment. But it is being actively developed. Contributions (code, documentation, issues, etc.) are very welcome.

## References

http://json-schema.org/
