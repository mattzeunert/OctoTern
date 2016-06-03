var $ = require("jquery")

function getCodeParts(containerEl){
    var lineElements = $(containerEl).find(".js-file-line");

    var codeParts = []
    lineElements.each(function(i, lineElement){
        lineElement = $(lineElement)
        processContent(lineElement)

        codeParts.push({
            el: null,
            lineElement: lineElement,
            content: "\n"
        })

        function processContent(el){
            el.contents().each(function(i, contentEl){
                contentEl = $(contentEl)
                var contents = contentEl.contents()
                if (contents.length > 1) {
                    processContent(contentEl)
                } else {
                    codeParts.push({
                        el: contentEl[0],
                        lineElement: lineElement,
                        content: contentEl.text()
                    })
                }
            })
        }
    })

    var pos = 0;
    codeParts.forEach(function(codePart){
        codePart.start = pos;
        pos += codePart.content.length;
        codePart.end = pos;
        $(codePart.el).css("border", "1px solid red")
    })

    return codeParts
}

function getCodeFromCodeParts(codeParts){
    var code = "";
    codeParts.forEach(function(codePart){
        code += codePart.content
    })
    return code;
}

function getCodePartsBetween(codeParts, startPos, endPos){
    return codeParts.filter(function(codePart){
        return codePart.end >= startPos
            &&
            codePart.start <= endPos
    })
}

function readCodeBlock(el){
    var codeParts = getCodeParts(el);
    return {
        codeParts: codeParts,
        code: getCodeFromCodeParts(codeParts),
        getCodePartsBetween: function(startPos, endPos){
            return getCodePartsBetween(codeParts, startPos, endPos)
        }
    }
}

module.exports = readCodeBlock
