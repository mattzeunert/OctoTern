
var tern = require("tern")
var estraverse = require("estraverse")

module.exports = function(code, callback){
    var srv = new tern.Server({});
    var identifierPositions = []
    srv.on("postInfer", function(ast){
        estraverse.traverse(ast, {
            enter: function (node, parent) {
                if (node.type === "Identifier" && parent.type==="VariableDeclarator") {
                    identifierPositions.push({
                        start: node.start,
                        end: node.end
                    })
                }
            }
        });
        console.log("identifierPositions", identifierPositions)
        getLinksFromPositions(srv, identifierPositions, callback)
    })

    srv.addFile("test.js", code)
    srv.flush(function(){});
}

function getLinksFromPositions(srv, positions, callback){
    var numberOfPositionsLinksHaveBeenRetrievedFor = 0;
    var allLinks = []

    if (positions.length === 0) {
        callback(allLinks)
        return;
    }

    positions.forEach(function(position){
        getLinksTo(position, function(links){
            allLinks = allLinks.concat(links)

            numberOfPositionsLinksHaveBeenRetrievedFor++
            if (numberOfPositionsLinksHaveBeenRetrievedFor == positions.length){
                callback(allLinks)
            }
        })
    })

    function getLinksTo(position, callback){
        var doc = {
            query: {
                type: "refs",
                file: "test.js",
                end: position.end
            }
        }
        srv.request(doc, function(error, response){
            var links = response.refs.map(function(ref){
                return {
                    toStart: position.start,
                    toEnd: position.end,
                    fromStart: ref.start,
                    fromEnd: ref.end
                }
            })
            callback(links)
        })
    }
}
