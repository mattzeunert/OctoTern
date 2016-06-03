var $ = require("jquery")
var GithubCodeBlock = require("./github-code-block")
var getLinksFromTern = require("./get-links-from-tern")

var codeBlock = new GithubCodeBlock($(".blob-wrapper").first(0))
var ternLinks = getLinksFromTern(codeBlock.getCode(), function(ternLinks){
    window.ternLinks = ternLinks
    window.codeBlock = codeBlock

    ternLinks.map(function(link){
        codeBlock.enforceCleanDomSplitBetween(link.fromStart, link.fromEnd)
        codeBlock.enforceCleanDomSplitBetween(link.toStart, link.toEnd)

        var fromCodeParts = codeBlock.getCodePartsBetween(link.fromStart, link.fromEnd)
        var toCodeParts = codeBlock.getCodePartsBetween(link.toStart, link.toEnd)


        fromCodeParts.forEach(function(codePart){
            $(codePart.el).css("border", "1px solid green")

            // if (codePart.content === "debugFunctions") debugger;

            if (codePart.el !== null && codePart.el.nodeName === "#text"){
                var newEl = $("<span>" + codePart.el.textContent + "</span>")
                newEl.attr("debug-start", codePart.start)
                newEl.attr("debug-end", codePart.end)
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
