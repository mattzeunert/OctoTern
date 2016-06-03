
var tern = require("tern")
var estraverse = require("estraverse")

module.exports = function(code, callback){
    var srv = new tern.Server({});
    var identifierPositions = []
    srv.on("postInfer", function(ast, scope){
        findIdentifierPositions(srv, ast, scope, function(identifierPositions){
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
                if (parent.type==="VariableDeclarator" ||
                    parent.type === "FunctionExpression" ||
                    parent.type === "FunctionDeclaration") {
                    identifierPositions.push({
                        start: node.start,
                        end: node.end
                    })
                }
            }
        }
    });
    callback(identifierPositions)

    // BRUTE FORCE
    // var code = srv.files[0].text;
    // var charsFetched = 0;
    // var identifierPositions = []
    // for (let i = 0; i < code.length; i++) {
    //     srv.request({
    //         query: {
    //             type: "refs",
    //             file: "test.js",
    //             end: i
    //         }
    //     }, function(error, response){
    //         charsFetched++;
    //         if (response && response.refs.length > 0) {
    //             identifierPositions.push({
    //                 start: response.refs[0].start,
    //                 end: response.refs[0].end
    //             })
    //         }
    //         if (charsFetched === code.length){
    //             callback(identifierPositions)
    //         }
    //     })
    // }

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

            var links = [];
            if (!error){
                response.refs.forEach(function(ref){
                    var isDeclaration = position.start === ref.start &&
                        position.end === ref.end;
                    links.push({
                        isDeclaration: isDeclaration,
                        toStart: position.start,
                        toEnd: position.end,
                        fromStart: ref.start,
                        fromEnd: ref.end
                    });
                })
            }
            callback(links)
        })
    }
}
