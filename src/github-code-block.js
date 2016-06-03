var $ = require("jquery")
var _ = require("underscore")

function GithubCodeBlock(el){
    this.el = el
    this._sortedCodeParts = getCodeParts(el);
}
GithubCodeBlock.prototype.getCode = function(){
    var code = "";
    this._sortedCodeParts.forEach(function(codePart){
        code += codePart.content
    })
    return code;
}
GithubCodeBlock.prototype.enforceCleanDomSplitBetween = function(startPos, endPos){
    this.enforceCleanDomSplitAt(startPos)
    this.enforceCleanDomSplitAt(endPos)
}
GithubCodeBlock.prototype.enforceCleanDomSplitAt = function(index){
    var codePart = this.getCodePartAt(index);
    if (codePart.start === index){
        return
    }

    var content = codePart.content;
    var cutIndex = index -  codePart.start;

    var beforeRangeContent = codePart.content.substr(0, cutIndex)
    var insideRangeContent = codePart.content.substr(cutIndex)

    var beforeEl = $(codePart.el).clone();
    setElementText(beforeEl, beforeRangeContent);

    var insideEl = $(codePart.el).clone();
    setElementText(insideEl, insideRangeContent);

    $(codePart.el).replaceWith([beforeEl, insideEl])
    this.replaceCodePart(codePart, [
        {
            el: beforeEl[0],
            start: codePart.start,
            end: index,
            content: beforeRangeContent
        },
        {
            el: insideEl[0],
            start: index,
            end: codePart.end,
            content: insideRangeContent
        }
    ]);

}
GithubCodeBlock.prototype.getCodePartAt = function(index){
    for (var i=0; i<this._sortedCodeParts.length; i++) {
        var codePart = this._sortedCodeParts[i];
        if (codePart.start <= index && codePart.end > index){
            return codePart
        }
    }
    throw Error("Codepart not found")
}
GithubCodeBlock.prototype.enforceCodePartsUseElementNodes = function(codeParts){
    codeParts.forEach((codePart) => {
        this.enforceCodePartUsesElementNode(codePart)
    })
}
GithubCodeBlock.prototype.enforceCodePartUsesElementNode = function(codePart) {
    if (codePart.el === null) {
        return;
    }
    if (codePart.el.nodeName === "#text"){
        var newEl = $("<span>" + codePart.el.textContent + "</span>")
        // newEl.attr("debug-start", codePart.start)
        // newEl.attr("debug-end", codePart.end)
        $(codePart.el).replaceWith(newEl)
        codePart.el = newEl[0];
    }
}
GithubCodeBlock.prototype.replaceCodePart = function(codePartToReplace, replacements){
    var codePartToReplaceIndex = this._sortedCodeParts.indexOf(codePartToReplace);
    var before = this._sortedCodeParts.slice(0, codePartToReplaceIndex);
    var after = this._sortedCodeParts.slice(codePartToReplaceIndex + 1);

    this._sortedCodeParts = before.concat(replacements).concat(after);
}
GithubCodeBlock.prototype.getCodePartsBetween = function(startPos, endPos){
    return this._sortedCodeParts.filter(function(codePart){
        return codePart.end > startPos
            &&
            codePart.start < endPos
    })
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
                    var contentText = contentEl.text();
                    if (contentText !== "") {
                        codeParts.push({
                            el: contentEl[0],
                            lineElement: lineElement,
                            content: contentText
                        })
                    }
                }
            })
        }
    })

    var pos = 0;
    codeParts.forEach(function(codePart){
        codePart.start = pos;
        pos += codePart.content.length;
        codePart.end = pos;
        // $(codePart.el).attr("debug-start", codePart.start)
        // $(codePart.el).attr("debug-end", codePart.end)
    })

    return codeParts
}


module.exports = GithubCodeBlock

function setElementText(el, text){
    // use this because jQuery .text() doesn't seem to work with
    // Text Nodes
    if (el.jquery) {
        el = el[0]
    }

    if (el.nodeName === "#text"){
        el.textContent = text;
    } else {
        $(el).text(text); // not sure if this does anything different from text content
    }

}
