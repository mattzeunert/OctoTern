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

    var beforeEl = codePart.el.cloneNode(true)
    setElementText(beforeEl, beforeRangeContent);

    var insideEl = codePart.el.cloneNode(true)
    setElementText(insideEl, insideRangeContent);

    codePart.$el.replaceWith([beforeEl, insideEl])
    this.replaceCodePart(codePart, [
        {
            el: beforeEl,
            $el: $(beforeEl),
            start: codePart.start,
            end: index,
            content: beforeRangeContent
        },
        {
            el: insideEl,
            $el: $(insideEl),
            start: index,
            end: codePart.end,
            content: insideRangeContent
        }
    ]);
}
GithubCodeBlock.prototype.getCodePartAt = function(index){
    var firstItemIndex = _.sortedIndex(this._sortedCodeParts, index, function(objOrIndex){
        if(typeof objOrIndex === "number"){
             return objOrIndex
        } else {
            return objOrIndex.start
        }
    })

    var codeParts = this._sortedCodeParts.slice(firstItemIndex - 1, this._sortedCodeParts.length)

    for (var i=0; i<codeParts.length; i++) {
        var codePart = codeParts[i];
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
        codePart.$el.replaceWith(newEl)
        codePart.el = newEl[0];
        codePart.$el = newEl;
    }
}
GithubCodeBlock.prototype.replaceCodePart = function(codePartToReplace, replacements){
    var codePartToReplaceIndex = this._sortedCodeParts.indexOf(codePartToReplace);
    var before = this._sortedCodeParts.slice(0, codePartToReplaceIndex);
    var after = this._sortedCodeParts.slice(codePartToReplaceIndex + 1);

    this._sortedCodeParts = before.concat(replacements).concat(after);
}
GithubCodeBlock.prototype.getCodePartsBetween = function(startPos, endPos){
    var firstItemIndex = _.sortedIndex(this._sortedCodeParts, startPos, function(objOrIndex){
        if(typeof objOrIndex === "number"){
             return objOrIndex
        } else {
            return objOrIndex.start
        }
    })
    var lastItemIndex = _.sortedIndex(this._sortedCodeParts, endPos, function(objOrIndex){
        if(typeof objOrIndex === "number"){
             return objOrIndex
        } else {
            return objOrIndex.end
        }
    })
    return this._sortedCodeParts.slice(firstItemIndex, lastItemIndex + 1).filter(function(codePart){
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
            $el: null,
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
                            $el: contentEl,
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
