var $ = require("jquery")
var readCodeBlock = require("./read-code-block")
var getLinksFromTern = require("./get-links-from-tern")

var codeBlock = readCodeBlock($(".blob-wrapper").first(0))
var ternLinks = getLinksFromTern(codeBlock.code, function(ternLinks){
    window.ternLinks = ternLinks
    window.codeBlock = codeBlock

    ternLinks.map(function(link){
        var fromCodeParts = codeBlock.codeParts.filter(function(codePart){
            return codePart.start === link.fromStart
        })
        var toCodeParts = codeBlock.codeParts.filter(function(codePart){
            return codePart.start === link.toStart
        })
        console.log("toCodeParts", toCodeParts)

        fromCodeParts.forEach(function(codePart){
            $(codePart.el).css("border", "1px solid green")
            $(codePart.el).click(function(){
                toCodeParts.forEach(function(toCodePart){
                    document.body.scrollTop = $(toCodePart.el).offset().top
                })
            })
        })
    })

    console.log(ternLinks)
})
