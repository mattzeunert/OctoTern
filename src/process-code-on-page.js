var $ = require("jquery")
var GithubCodeBlock = require("./github-code-block")
var getLinksFromTern = require("./get-links-from-tern")


function processCodeOnPage(){
    time("OctoTern")
    // console.profile()

    time("OctoTern Init GithubCodeBlock")
    var codeBlock = new GithubCodeBlock($(".blob-wrapper").first(0))
    timeEnd("OctoTern Init GithubCodeBlock")

    var code = codeBlock.getCode();
    if (code.length > 60000) {
        // Would be cool to speed it up or use
        // webworker for tern requests
        console.log("Not running OctoTern as processing code could freeze the page for a bit")
        return
    }

    time("OctoTern getLinksFromTern")
    getLinksFromTern(code, function(links){
        timeEnd("OctoTern getLinksFromTern")
        setTimeout(function(){
            processTernLinks(links, codeBlock)
            timeEnd("OctoTern")
            // console.profileEnd()
        })
    });
}

function processTernLinks(ternLinks, codeBlock){
    enforceCleanDomSplitForLinks(ternLinks, codeBlock)

    time("OctoTern Display links")

    ternLinks.forEach(function processTernLinkDom(link){
        var fromCodeParts = codeBlock.getCodePartsBetween(link.fromStart, link.fromEnd)
        var toCodeParts = codeBlock.getCodePartsBetween(link.toStart, link.toEnd)

        codeBlock.enforceCodePartsUseElementNodes(fromCodeParts)
        codeBlock.enforceCodePartsUseElementNodes(toCodeParts)

        var $declarationElements = $(toCodeParts.map((codePart) => codePart.el));

        if (link.isDeclaration) {
            $declarationElements.addClass("octo-tern-definition")
        } else {
            var $linkElements = $(fromCodeParts.map((codePart) => codePart.el));

            $linkElements.addClass("octo-tern-link")

            $linkElements.mouseenter(function(){
                $declarationElements.addClass("octo-tern-definintion-hover")
            })
            $linkElements.mouseleave(function(){
                $declarationElements.removeClass("octo-tern-definintion-hover")
            })

            $linkElements.click(function(){
                // console.log("toCodeParts", toCodeParts, "link", link)

                $declarationElements.addClass("octo-tern-definition-selected")
                setTimeout(function(){
                    $declarationElements.removeClass("octo-tern-definition-selected")
                }, 2000)

                var heightOfTwoLines = 18 * 2;
                $('html,body').animate({
                    scrollTop: $declarationElements.first().offset().top - heightOfTwoLines
                });
            })
        }
    })

    timeEnd("OctoTern Display links")
}

function enforceCleanDomSplitForLinks(ternLinks, codeBlock) {
    time("enforceCleanDomSplitForLinks")
    ternLinks.forEach(function enforceCleanDomSplitForLink(link){
        codeBlock.enforceCleanDomSplitBetween(link.fromStart, link.fromEnd)
        codeBlock.enforceCleanDomSplitBetween(link.toStart, link.toEnd)
    });
    timeEnd("enforceCleanDomSplitForLinks")
}

function time(label){
    if (!window.DEBUG) return
    console.time(label)
}
function timeEnd(label){
    if (!window.DEBUG) return
    console.timeEnd(label)
}

module.exports = processCodeOnPage
