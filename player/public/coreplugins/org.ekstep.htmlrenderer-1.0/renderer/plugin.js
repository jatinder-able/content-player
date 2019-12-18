 org.ekstep.contentrenderer.baseLauncher.extend({
     s3_folders: {
         'application/vnd.ekstep.html-archive': "html/",
         'application/vnd.ekstep.h5p-archive': 'h5p/'
     },
     heartBeatData: {},
     currentIndex: 50,
     totalIndex: 100,
     enableHeartBeatEvent: true,
     _constants: {
         mimeType: ["application/vnd.ekstep.html-archive", "application/vnd.ekstep.h5p-archive"],
         events: {
             launchEvent: "renderer:launch:html"
         }
     },
     initLauncher: function() {
         EkstepRendererAPI.addEventListener(this._constants.events.launchEvent, this.start, this);
     },
     start: function() {
         this._super();
         data = content;
         this.reset();
         var isMobile = window.cordova ? true : false;
         var envHTML = isMobile ? "app" : "portal";
         var launchData = { "env": envHTML, "envpath": 'dev' };
         var globalConfigObj = EkstepRendererAPI.getGlobalConfig();
         var prefix_url = isbrowserpreview ? this.getAsseturl(data) : globalConfigObj.basepath;
         var path = prefix_url + '/index.html?contentId=' + data.identifier + '&launchData=' + JSON.stringify(launchData) + "&appInfo=" + JSON.stringify(GlobalContext.config.appInfo);
         if (isbrowserpreview) {
             path += "&flavor=" + "t=" + getTime();
         }
         jQuery(this.manifest.id).remove();
         var iframe = document.createElement('iframe');
         iframe.src = path;
         iframe.id = "able-html-renderer";
         $('#able-html-renderer').contents().find('body').append('<div id="pdf-fullscreen-container">'+
                                                                     '<span title="Full Screen" id="able-fullscreen">' +
                                                                            '<img src="./assets/fullscreen.png">' +
                                                                        '</span>' +
                                                                        '<span title="Exit Full Screen" id="able-exit-fullscreen">' +
                                                                            '<img src="./assets/exit-fullscreen.png">' +
                                                                        '</span>'+
                                                                 '</div>');
        var elem = document.documentElement;
        console.log("Full Screen for html zip");
        console.log($('#able-html-renderer').contents());
        console.log($('#able-html-renderer').contents());
        console.log($('#able-html-renderer').contents().find('#pdf-fullscreen-container'));
        $('#able-html-renderer').contents().find('#pdf-fullscreen-container').on('click','#able-fullscreen',function() {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.mozRequestFullScreen) { /* Firefox */
                elem.mozRequestFullScreen();
            } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) { /* IE/Edge */
                elem.msRequestFullscreen();
            }
            $(this).hide().next('span').show();
        });
        $('#able-html-renderer').contents().find('#pdf-fullscreen-container').on('click','#able-exit-fullscreen',function() {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            $(this).hide().prev('span').show();
        });

         this.validateSrc(path, iframe);
     },
     validateSrc: function(path, iframe) {
         var instance = this;
         org.ekstep.pluginframework.resourceManager.loadResource(path, 'TEXT', function(err, data) {
             if (err) {
                 showToaster("error", "Sorry!!.. Unable to open the Game!", { timeOut: 200000 });
                 EkstepRendererAPI.logErrorEvent('index.html file not found.', { 'type': 'content', 'action': 'play', 'severity': 'fatal' });
             } else {
                 EkstepRendererAPI.dispatchEvent("renderer:splash:hide");
                 instance.configOverlay();
                 instance.addToGameArea(iframe);

             }
         });
     },
     configOverlay: function() {
         setTimeout(function() {
             EkstepRendererAPI.dispatchEvent("renderer:overlay:show");
             EkstepRendererAPI.dispatchEvent('renderer:stagereload:hide');
             EkstepRendererAPI.dispatchEvent('renderer:next:hide');
             EkstepRendererAPI.dispatchEvent('renderer:previous:hide');
         }, 100)

     },

     getAsseturl: function(content) {
         var globalConfigObj = EkstepRendererAPI.getGlobalConfig();
         var path = globalConfigObj.host + globalConfigObj.s3ContentHost + this.s3_folders[content.mimeType];
         path += content.status == "Live" ? content.identifier + "-latest" : content.identifier + "-snapshot";
         return path;
     },
     end: function() {
         this.currentIndex = 100;
         this.totalIndex = 100;
         this._super();
     },
     contentProgress: function() {
         return this.progres(this.currentIndex, this.totalIndex);
     },
     reset: function() {
         this.currentIndex = 50;
         this.totalIndex = 100;
     },
     cleanUp: function() {
         this._super();
         EkstepRendererAPI.dispatchEvent('renderer:next:show')
         EkstepRendererAPI.dispatchEvent('renderer:previous:show')
     }
 });
 //# sourceURL=HTMLRendererePlugin.js