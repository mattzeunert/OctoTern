var $ = require("jquery")
var readCodeBlock = require("./read-code-block")
var getLinksFromTern = require("./get-links-from-tern")

var codeBlock = readCodeBlock($(".blob-wrapper").first(0))
var ternLinks = getLinksFromTern(codeBlock.code, function(ternLinks){
    window.ternLinks = ternLinks
    window.codeBlock = codeBlock

    ternLinks.map(function(link){
        var fromCodeParts = codeBlock.getCodePartsBetween(link.fromStart, link.fromEnd)
        console.log("fromCodeParts", fromCodeParts)
        var toCodeParts = codeBlock.getCodePartsBetween(link.toStart, link.toEnd)
        console.log("toCodeParts", toCodeParts)

        fromCodeParts.forEach(function(codePart){
            $(codePart.el).css("border", "1px solid green")

            if (codePart.el !== null && codePart.el.nodeName === "#text"){
                var newEl = $("<span>" + codePart.el.textContent + "</span>")
                $(codePart.el).replaceWith(newEl)
                codePart.el = newEl;
                $(codePart.el).css("border", "1px solid lime")
            }

            $(codePart.el).click(function(){
                console.log("toCodeParts", toCodeParts, "link", link)
                var firstToCodePart = toCodeParts[0]
                // Don't go to el directly because it could be a
                // text DOM node where .offset won't work
                var lineEl = $(firstToCodePart.el).parents(".js-file-line")

                document.body.scrollTop = lineEl.offset().top
            })
        })
    })

    console.log(ternLinks)
})
