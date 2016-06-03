var $ = require("jquery")

function GithubCodeBlock(el){
    this.el = el
    this.codeParts = getCodeParts(el);
}
GithubCodeBlock.prototype.getCode = function(){
    var code = "";
    this.codeParts.forEach(function(codePart){
        code += codePart.content
    })
    return code;
}
GithubCodeBlock.prototype.getCodePartsBetween = function(startPos, endPos){
    var codeParts = this.codeParts;
    return getExistingCodeParts(startPos, endPos)
    function getExistingCodeParts(startPos, endPos){
        return codeParts.filter(function(codePart){
            return codePart.end >= startPos
                &&
                codePart.start <= endPos
        })
    }
}

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
        $(codePart.el).attr("debug-start", codePart.start)
        $(codePart.el).attr("debug-end", codePart.end)
        $(codePart.el).css("border", "1px solid red")
    })

    return codeParts
}


module.exports = GithubCodeBlock
