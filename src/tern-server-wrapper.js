
var tern = require("tern")
var estraverse = require("estraverse")

function TernServerWrapper(){
    this._srv = new tern.Server({});
}
TernServerWrapper.prototype.loadCode = function(code, callback){
    var _this = this;
    this._srv.on("postInfer", function(ast, scope){
        _this._findIdentifierPositions(ast, scope, function(identifierPositions){
            callback(identifierPositions)
        });
    })

    this._srv.addFile("test.js", code)
    this._srv.flush(function(){});
}

TernServerWrapper.prototype._findIdentifierPositions = function(ast, scope, callback){
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
TernServerWrapper.prototype.lookUpIdentifier = function(start, end, callback){
    var _this = this;

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

    _this._srv.request(definitionQuery, function onTernDefinitionRequestResponse(error, definitionResponse){
        _this._srv.request(refQuery, function onTernRequestRequestResponse(error, refResponse){
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

module.exports = TernServerWrapper;
