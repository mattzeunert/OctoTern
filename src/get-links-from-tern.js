
var tern = require("tern")
var estraverse = require("estraverse")

module.exports = {
    getIdentifiers: function(code, callback){
        var srv = new tern.Server({});
        var identifierPositions = []
        srv.on("postInfer", function(ast, scope){
            findIdentifierPositions(srv, ast, scope, function handleIdentifierPositions(identifierPositions){
                callback(identifierPositions)
                // getLinksFromPositions(srv, identifierPositions, callback)
            });
        })

        srv.addFile("test.js", code)
        srv.flush(function(){});
    },
    getLinks: function(code, start, end, callback){
        var srv = new tern.Server({});

        srv.addFile("test.js", code)
        srv.flush(function(){});

        var definitionQuery = {
            query: {
                type: "definition",
                file: "test.js",
                end: end
            }
        }
        var refQuery = {
            query: {
                type: "refs",
                file: "test.js",
                end: end
            }
        }
        srv.request(definitionQuery, function onTernDefinitionRequestResponse(error, definitionResponse){
            srv.request(refQuery, function onTernRequestRequestResponse(error, refResponse){
                handleTernData(definitionResponse, refResponse);
            })
        })

        function handleTernData(definitionResponse, refResponse){
            var definition = null;
            var isDefinition = false;
            var nonDefinitionReferences = null
            if (definitionResponse && refResponse && definitionResponse.start !== undefined){
                definition = {
                    start: definitionResponse.start,
                    end: definitionResponse.end
                }

                nonDefinitionReferences = refResponse.refs.filter(function(ref){
                    var isDefinition = ref.start === definition.start && ref.end === definition.end;
                    return !isDefinition;
                })
            }

            callback({
                definition: definition,
                nonDefinitionReferences: nonDefinitionReferences
            })
        }
    }
}

function findIdentifierPositions(srv, ast, scope, callback){
    var identifierPositions = [];
    estraverse.traverse(ast, {
        enter: function (node, parent) {
            // console.log(node.type, node.start, node.end)
            if (node.type === "Identifier") {
                identifierPositions.push({
                    start: node.start,
                    end: node.end
                })
            }
        }
    });
    callback(identifierPositions)
}

function getLinksFromPositions(srv, positions, callback){
    var numberOfPositionsLinksHaveBeenRetrievedFor = 0;
    var allLinks = []

    if (positions.length === 0) {
        callback(allLinks)
        return;
    }

    positions.forEach(function processIdentifierPosition(position){
        getDefinitionOf(position, function storeDefinition(definition){
            if (definition !== null) {
                allLinks.push(definition);
            }

            numberOfPositionsLinksHaveBeenRetrievedFor++
            if (numberOfPositionsLinksHaveBeenRetrievedFor == positions.length){
                callback(allLinks)
            }
        })
    })

    function getDefinitionOf(position, callback){
        var doc = {
            query: {
                type: "definition",
                file: "test.js",
                end: position.end
            }
        }
        srv.request(doc, function onTernRequestResponse(error, response){
            if (!error && response.start !== undefined){
                var isDeclaration = position.start === response.start &&
                        position.end === response.end;
                callback({
                    isDeclaration: isDeclaration,
                    toStart: response.start,
                    toEnd: response.end,
                    fromStart: position.start,
                    fromEnd: position.end
                })
            } else {
                callback(null)
            }
        })
    }
}
