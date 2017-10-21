var gitHubInjection = require("github-injection")
var processCodeOnPage = require("./process-code-on-page")

window.DEBUG = false;
window.$ = $;
init();

gitHubInjection(() => {
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
        ".octo-tern-definition {  transition: 1s all }" +
        ".octo-tern-definition-selected { background: orange; box-shadow: 0px 0px 10px orange;}" +
        ".octo-tern-definition-hover { background: orange }" +
        ".octo-tern-link { cursor: pointer } " +
        ".octo-tern-link:hover {text-decoration: underline} " +
        ".octo-tern-reference-hover {background: lightblue}" +
    "</style>")
}
