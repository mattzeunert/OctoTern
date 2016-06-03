var $ = require("jquery")
var readCodeBlock = require("./read-code-block")
var getLinksFromTern = require("./get-links-from-tern")

var codeBlock = readCodeBlock($(".blob-wrapper").first(0))
var ternLinks = getLinksFromTern(codeBlock.code, function(ternLinks){
    console.log(ternLinks)
})
