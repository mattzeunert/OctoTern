var $ = require("jquery")
var readCodeBlock = require("./read-code-block")

var codeBlock = readCodeBlock($(".blob-wrapper").first(0))

console.log(codeBlock)

//
// var tern = require("tern")
// var estraverse = require("estraverse")
//
// var srv = new tern.Server({});
// var identifiers = []
// srv.on("postParse", function(ast){
//     estraverse.traverse(ast, {
//         enter: function (node, parent) {
//             if (node.type === "Identifier" && parent.type==="VariableDeclarator") {
//                 identifiers.push(node.start)
//             }
//         }
//     });
// })
//
// srv.addFile("test.js", "var a = 5;   \na=10;\n a=44;")
//                      // 01234567890123456789
// srv.flush(function(){});
//
// var doc = {
//     query: {
//         type: "refs",
//         file: "test.js",
//         end: identifiers[0]
//     }
// }
// srv.request(doc, function(){
//     console.log(arguments[1].refs)
// })
