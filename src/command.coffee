debug = require('debug')('app:test:rest_walker')
PathComponent = require('./path_component')

class Command
  constructor: (@runner, @path, @alias, @payloadProperty, @expectedStatusCode) ->
    @pathComponents = @path.split('.').map((c) -> new PathComponent(c))

  execute: (context) =>
    current = null
    setNextValue = (value) ->
      current = value
      value

    # Walk down the rel path
    promise = @getInitialServiceObject(context).then(setNextValue)
    if @pathComponents.length > 1 then for i in [1..@pathComponents.length-1]
      next = (j) => promise.then( => @handleComponent(j, current, context)).then(setNextValue)
      promise = next(i)
    promise

  getInitialServiceObject: (context) =>
    component = @pathComponents[0]
    relName = component.relName
    current = context[relName]

    if relName is 'root' and (not current? or component.force)
      @getRoot().then (root) ->
        context.root = root
        root
    else if not current? then throw new Error("Could not find initial context value '#{relName}' in context")
    else return Promise.cast(current)

  handleComponent: (i, current, context) =>
    component = @pathComponents[i]
    isLast = i is @pathComponents.length - 1
    if not component? then throw new Error("Component #{i} is not valid for #{@path} #{@pathComponents.length}")
    Promise.cast(true)
    .then => @walk(current, component, context, isLast)
    .then (result) =>
      @checkStatusCode(result, isLast)
      entity = result.entity
      if isLast then @handleLastComponent(component, entity, context)
      entity

  getRoot: =>
    @runner.get('').then (entity) ->
      statusCode = entity[0].statusCode
      if statusCode >= 400 then throw new Error("Service Root Status Code: #{statusCode}")
      entity[1]

  walk: (current, target, context, isLast) =>
# TODO: add customizable link href and method extraction
    followLink = @getLinkToFollow(current, target)
    uri = followLink.href + target.queryArgument
    method = followLink.method
    payload = @getHttpPayload(target, isLast, context)

    @invokeHttpMethod(method, uri, payload).then (payload) =>
      statusCode = payload[0].statusCode
      responseText = JSON.stringify(payload[0].body)
      debug "#{method} #{uri} => #{statusCode} #{if statusCode >= 400 then responseText else ''}"
      response: payload[0]
      statusCode: payload[0].statusCode
      entity: @extractResponseEntity(payload[1], target.collectionIndex)

  getLinkToFollow: (current, target) =>
    if not current? then throw new Error("Current is invalid, cannot follow target #{target}")
    if not target? then throw new Error("Target is invalid, #{JSON.stringify(current,null,4)}")
    followLink = current.links[target.relName]
    if not followLink? then throw new Error("No link '#{target.relName}' present, path=#{@path} #{JSON.stringify(current, null, 4)}")
    followLink

  getHttpPayload: (component, isLast, context) ->
    payloadProperty = if isLast and @payloadProperty? then @payloadProperty else component.payloadProperty
    context[payloadProperty] || {}

  invokeHttpMethod: (method, uri, payload={}) =>
    if method is 'GET' then @runner.get(uri)
    else if method is 'POST' then @runner.post(uri, payload)
    else if method is 'PUT' then @runner.put(uri, payload)
    else if method is 'DELETE' then @runner.delete(uri)

  extractResponseEntity: (entity, collectionIndex) ->
# A null entity could be valid (e.g. 204 No Content)
    if not entity? or not collectionIndex? then return entity
    if not entity.items then throw new Error("Entity has no item collection #{JSON.stringify(entity,null,4)}")
    if entity.items.length <= collectionIndex then throw new Error("Entity items only has #{entity.items.length} entries, cannot get item at index #{collectionIndex}")
    result = entity.items[collectionIndex]
    if not result? then throw new Error("Entity at index #{collectionIndex} is not valid")
    result

  checkStatusCode: (result, isLast) =>
    code = result.statusCode
    if isLast and @expectedStatusCode?
      if code != @expectedStatusCode
        throw new Error("Expected Response Code #{@expectedStatusCode} on path #{@path}, got #{code}. \n#{JSON.stringify(result.response.body, null, 4)}")
    else
      if code >= 400 then throw new Error("Received error on path #{@path}, #{code}")

  handleLastComponent: (component, entity, context) =>
    propertyName = @alias || component.relName
    context[propertyName] = entity

module.exports = Command