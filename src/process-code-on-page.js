var $ = require("jquery")
var GithubCodeBlock = require("./github-code-block")
var TernServerWrapper = require("./tern-server-wrapper")


function processCodeOnPage(){
    time("OctoTern Initialization")

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

    var serverWrapper = new TernServerWrapper();
    time("Load code into Tern and get identifiers")
    serverWrapper.loadCode(code, processIdentifierPositions)

    function processIdentifierPositions(identifierPositions){
        timeEnd("Load code into Tern and get identifiers")

        time("Enforce clean DOM splits between identifiers")
        identifierPositions.forEach(function(identifierPosition){
            codeBlock.enforceCleanDomSplitBetween(identifierPosition.start, identifierPosition.end);
        })
        timeEnd("Enforce clean DOM splits between identifiers")

        time("Make identifiers interactive")
        identifierPositions.forEach(function(identifierPosition){
            makeIdentifierInteractive(identifierPosition, codeBlock, serverWrapper)
        })
        timeEnd("Make identifiers interactive")

        timeEnd("OctoTern Initialization")
    };
}

function makeIdentifierInteractive(identifierPosition, codeBlock, serverWrapper){
    var identifierCodeParts = codeBlock.getCodePartsBetween(identifierPosition.start, identifierPosition.end);
    codeBlock.enforceCodePartsUseElementNodes(identifierCodeParts)
    identifierCodeParts.forEach(function(identifierCodePart){
        identifierCodePart.$el.addClass("octo-tern-definition")
        identifierCodePart.$el.on("mouseenter", function(){
            makeTernRequest(identifierCodePart, serverWrapper, codeBlock, function(response){
                if (!response) {return}
                response.definitionElements.addClass("octo-tern-definition-hover")
                response.referenceElements.addClass("octo-tern-reference-hover")
            })
        })
        identifierCodePart.$el.click(function(){
            makeTernRequest(identifierCodePart, serverWrapper, codeBlock, function(response){
                if (!response) { return }
                response.definitionElements.addClass("octo-tern-definition-selected")
                setTimeout(function(){
                    response.definitionElements.removeClass("octo-tern-definition-selected")
                }, 2000)

                var heightOfTwoLines = 18 * 2;
                $('html,body').animate({
                    scrollTop: response.definitionElements.first().offset().top - heightOfTwoLines
                });
            })
        })
        identifierCodePart.$el.on("mouseleave", function(){
            $(".octo-tern-definition-hover").removeClass("octo-tern-definition-hover")
            $(".octo-tern-reference-hover").removeClass("octo-tern-reference-hover")
        })
    })
}

function makeTernRequest(identifierCodePart, serverWrapper, codeBlock, callback){
    time("Make tern queries for identifier")
    serverWrapper.lookUpIdentifier(identifierCodePart.start, identifierCodePart.end, function(response){
        if (!response.definition) {
            timeEnd("Make tern queries for identifier")
            callback(null);
            return;
        }
        var definitionCodeParts = codeBlock.getCodePartsBetween(response.definition.start, response.definition.end);
        var definitionElements = $(definitionCodeParts.map((codePart) => codePart.el));

        var referenceCodeParts = [];
        response.nonDefinitionReferences.forEach(function(ref){
            referenceCodeParts = referenceCodeParts.concat(codeBlock.getCodePartsBetween(ref.start, ref.end))
        })
        var referenceElements = $(referenceCodeParts.map((codePart) => codePart.el));

        timeEnd("Make tern queries for identifier")

        callback({
            definitionCodeParts: definitionCodeParts,
            definitionElements: definitionElements,
            referenceCodeParts: referenceCodeParts,
            referenceElements: referenceElements
        })
    })
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
