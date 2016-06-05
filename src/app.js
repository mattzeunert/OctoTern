var $ = require("jquery")
var gitHubInjection = require("github-injection")
var processCodeOnPage = require("./process-code-on-page")

window.DEBUG = false;
init()

gitHubInjection(window, function(err) {
  if (err) {
    return console.error(err);
  }
  if (!currentPageIsJavaScriptFilePage()){
      return;
  }
  processCodeOnPage();
});

function currentPageIsJavaScriptFilePage(){
    var finalPath = $(".file-navigation .final-path");
    if (finalPath.length === 1 && /\.m?jsx?$/.test(finalPath.text())) {
        return true;
    }
    return false;
}

function init(){
    $("body").append("<style>" +
        ".octo-tern-definition { " + (window.DEBUG ? "background: red;" : "") + " transition: 1s all }" +
        ".octo-tern-definition-selected { background: yellow; box-shadow: 0px 0px 10px yellow;}" +
        ".octo-tern-definintion-hover { background: yellow }" + 
        ".octo-tern-link {" + (window.DEBUG ? "background: lime;" : "") + "cursor: pointer } " +
        ".octo-tern-link:hover {text-decoration: underline} " +
    "</style>")
}
