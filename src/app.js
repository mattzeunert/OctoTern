var $ = require("jquery")
var GithubCodeBlock = require("./github-code-block")
var getLinksFromTern = require("./get-links-from-tern")

$("body").append("<style>" +
    ".octo-tern-definition { transition: 1s background }" +
    ".octo-tern-definition-selected { background: yellow}" +
    ".octo-tern-link { cursor: pointer } " +
    ".octo-tern-link:hover {text-decoration: underline} " +
"</style>")

console.time("OctoTern")
var codeBlock = new GithubCodeBlock($(".blob-wrapper").first(0))
var ternLinks = getLinksFromTern(codeBlock.getCode(), function(ternLinks){
    window.ternLinks = ternLinks
    window.codeBlock = codeBlock

    ternLinks.map(function(link){
        codeBlock.enforceCleanDomSplitBetween(link.fromStart, link.fromEnd)
        codeBlock.enforceCleanDomSplitBetween(link.toStart, link.toEnd)

        var fromCodeParts = codeBlock.getCodePartsBetween(link.fromStart, link.fromEnd)
        var toCodeParts = codeBlock.getCodePartsBetween(link.toStart, link.toEnd)

        codeBlock.enforceCodePartsUseElementNodes(fromCodeParts)
        codeBlock.enforceCodePartsUseElementNodes(toCodeParts)

        var declarationElements = $(toCodeParts.map((codePart) => codePart.el));

        if (link.isDeclaration) {
            declarationElements.addClass("octo-tern-definition")
        } else {
            fromCodeParts.forEach(function(codePart){
                $(codePart.el).addClass("octo-tern-link")

                $(codePart.el).click(function(){
                    console.log("toCodeParts", toCodeParts, "link", link)
                    var firstToCodePart = toCodeParts[0]

                    declarationElements.addClass("octo-tern-definition-selected")
                    setTimeout(function(){
                        declarationElements.removeClass("octo-tern-definition-selected")
                    }, 1000)

                    var heightOfTwoLines = 18 * 2;
                    document.body.scrollTop = $(firstToCodePart.el).offset().top - heightOfTwoLines
                })
            })
        }
    })

    console.timeEnd("OctoTern")
    console.log(ternLinks)
})
