org.ekstep.contentrenderer.baseLauncher.extend({
    heartBeatData: {},
    enableHeartBeatEvent: true,
    _constants: {
        mimeType: ["application/pdf"],
        events: {
            launchEvent: "renderer:launch:pdf"
        }
    },
    initLauncher: function() {
        EkstepRendererAPI.addEventListener(this._constants.events.launchEvent, this.start, this);
    },
    start: function() {
        this._super();
        context = this;
        var data = _.clone(content);
        // this.initContentProgress();
        var path = './coreplugins/org.ekstep.pdfrenderer-1.0/renderer/libs/viewer/web/viewer.html';
        var iframe = document.createElement('iframe');
        iframe.src = path;
        instance.addToGameArea(iframe);
        // this.validateSrc(path, iframe);
    },

    // contentProgress: function() {
    //     return this.progres(this.currentIndex, this.totalIndex);
    // },
    // cleanUp: function() {
    //     this._super();
    //     EkstepRendererAPI.dispatchEvent('renderer:next:show')
    //     EkstepRendererAPI.dispatchEvent('renderer:previous:show')
    // }
});
//# sourceURL=PDFRenderer.js