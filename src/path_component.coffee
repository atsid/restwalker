#
# Parses and represents a Rest Path Component
# e.g.
#      my-rel[0]           // Collection Index
#      my-rel[?query=arg]  // Apply Query Args
#      my-rel!             // Force-reload rel into context
#
class PathComponent
    constructor: (component) ->
        firstCommandIndex = component.indexOf('[')
        if firstCommandIndex is -1
            @relName = component
            remainder = []
        else
            @relName = component.substring(0, firstCommandIndex)
            remainder = component.substring(firstCommandIndex).trim().split(/[\[|\]]/)

        @force = false
        if @relName.charAt(@relName.length-1) is '!'
            @force = true
            @relName = @relName.substring(0, @relName.length-1)

        @queryArgument = ''
        @collectionIndex = null
        @payloadProperty = null
        for value in remainder
            if value.trim()
                if value.indexOf('?') is 0
                    @queryArgument = value
                else if value.indexOf('with') is not -1
                    @payloadProperty = value.substring(value.indexOf('with '))
                else
                    @collectionIndex = parseInt(value)

    toString: =>
        "RestPathComponent(relName=#{@relName}, force=#{@force}, @payloadProperty=#{@payloadProperty} queryArgument=#{@queryArgument}, collectionIndex=#{@collectionIndex})"

module.exports = PathComponent