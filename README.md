[![Build Status](https://travis-ci.org/atsid/restwalker.svg?branch=master)](https://travis-ci.org/atsid/restwalker)

# restwalker
HATEOAS Integration Testing

Restwalker is a tool for integration testing RESTFUL services with HATEOAS hyperlinking. It uses a DSL to describe the traversal of services via rel names.

# The Service Walker
The service walker accepts a series of commands, which may be strings, functions, or arrays, and interacts with a RESTful services using the commands.

## invoke - Invokes a RESTful interation sequence. 
`walker.invoke(commmands, context)`
* commands (**array** of **ScriptCommand**, **required**) - The integration testing commands to run in order.
   * **function** - When the item is a function, it is executed using `context` as the `this` context.
   * **string** - When the item is a string, a RESTful interaction is parsed using the DSL and executed.
   * **array** - When the item is an array of strings, RESTful interactions are executed in parallel.
* context (**object**, **optional**, **default**={}) - The context object to associate with the interaction script.

# The DSL
`<path> <commands>`

## path
The path describes a rel-based route to a specific invocation on a resource.

`<pathitem>.<pathitem>.<pathitem>...`
A path must start with the name of a proprety name (resolved on the context object), or `root`, which represents the service root. Path items are delimited by `.`. 

### pathitem
`<rel><qualifier>`
Each path item contains a rel-name to follow and any qualifiers to apply to the invocation. The following qualifiers are recognized:

* **query-argument qualifier** - Applies a Query Argument to the invocation. `${<query-argument>}`.
   e.g. `root.view_list${itemCount=100}`
* **array indexer qualifier** - Assumes the result of an invocation is a collection. The result of the traversal step is the item at the specified index. `[index]`
  e.g. `root.view_list[1]`

## commands
Commmands describe interactions with the result of service invocations.

## Command Types
* **with** - `with <propertyName>` These commands use the value of `propertyName` on the context object to invoke an endpoint that accepts a payload. e.g. `root.create_listing with listingData`
* **as** - `as <propertyName` These commands populate the value of `propertyName` on the context object as the result of the service invocation.  e.g. `root.view_profile as profile`
* **emits** - `emits <statusCode>` - Performs an assertion that the service emits a status code as the result of an invocation. e.g. `root.view_list[0].delete emits 204`


# examples
```js
var script = [
   'root.login with credentials as user'
   'user.view_profile as profile'
   function() { expect(profile.password).to.be.undefined; }
   'user.delete emits 204'
];
var context = { username: 'mr_test', password: 'derp' }
walker.invoke(script, context);
```
