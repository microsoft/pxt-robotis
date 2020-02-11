/// <reference path="../node_modules/pxt-core/built/pxteditor.d.ts" />
var pxt;
(function (pxt) {
    var editor;
    (function (editor) {
        editor.initExtensionsAsync = function (opts) {
            pxt.debug('loading pxt-maker target extensions...');
            var res = {
                showUploadInstructionsAsync: function (fn, url, confirmAsync) {
                    var resolve;
                    var reject;
                    var deferred = new Promise(function (res, rej) {
                        resolve = res;
                        reject = rej;
                    });
                    var boardName = pxt.appTarget.appTheme.boardName || "???";
                    var boardDriveName = pxt.appTarget.appTheme.driveDisplayName || pxt.appTarget.compile.driveName || "???";
                    // https://msdn.microsoft.com/en-us/library/cc848897.aspx
                    // "For security reasons, data URIs are restricted to downloaded resources. 
                    // Data URIs cannot be used for navigation, for scripting, or to populate frame or iframe elements"
                    var downloadAgain = !pxt.BrowserUtils.isIE() && !pxt.BrowserUtils.isEdge();
                    var docUrl = pxt.appTarget.appTheme.usbDocs;
                    var saveAs = pxt.BrowserUtils.hasSaveAs();
                    var htmlBody = "\n                <div class=\"ui three column grid stackable\">\n                    <div class=\"column\">\n                        <div class=\"ui\">\n                            <div class=\"content\">\n                                <div class=\"description\">\n                                    <span class=\"ui blue circular label\">1</span>\n                                    " + lf("Take the USB cable you connected to your computer. Plug it into your {0}.", boardName) + "\n                                </div>\n                            </div>\n                        </div>\n                    </div>\n                    <div class=\"column\">\n                        <div class=\"ui\">\n                            <div class=\"content\">\n                                <div class=\"description\">\n                                    <span class=\"ui blue circular label\">2</span>\n                                    " + lf("Press the RESET button to go into programming mode. When the lights turn green, you're ready to go.") + "\n                                </div>\n                            </div>\n                        </div>\n                    </div>\n                    <div class=\"column\">\n                        <div class=\"ui\">\n                            <div class=\"content\">\n                                <div class=\"description\">\n                                    <span class=\"ui blue circular label\">3</span>\n                                    " + lf("Click and drag the file you downloaded onto {0}.", boardDriveName) + "\n                                </div>\n                            </div>\n                        </div>\n                    </div>\n                </div>";
                    return confirmAsync({
                        header: lf("Download completed..."),
                        htmlBody: htmlBody,
                        hasCloseIcon: true,
                        hideCancel: true,
                        hideAgree: true,
                        size: 'large',
                        buttons: [downloadAgain ? {
                                label: fn,
                                icon: "download",
                                class: "lightgrey focused",
                                url: url,
                                fileName: fn
                            } : undefined, docUrl ? {
                                label: lf("Help"),
                                icon: "help",
                                class: "lightgrey focused",
                                url: docUrl
                            } : undefined]
                        //timeout: 20000
                    }).then(function () { });
                }
            };
            return Promise.resolve(res);
        };
    })(editor = pxt.editor || (pxt.editor = {}));
})(pxt || (pxt = {}));
