
var tern = require("tern")
var estraverse = require("estraverse")

module.exports = function(code, callback){
    var srv = new tern.Server({});
    var identifierPositions = []
    srv.on("postInfer", function(ast, scope){
        findIdentifierPositions(srv, ast, scope, function handleIdentifierPositions(identifierPositions){
            getLinksFromPositions(srv, identifierPositions, callback)
        });
    })

    srv.addFile("test.js", code)
    srv.flush(function(){});
}

function findIdentifierPositions(srv, ast, scope, callback){
    var identifierPositions = [];
    estraverse.traverse(ast, {
        enter: function (node, parent) {
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
