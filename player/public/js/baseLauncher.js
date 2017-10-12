/**
 * @description 
 * Base Launcher to launch any type launcher i.e Ecml/Html/Pdf/Youtube/video/h5p launcher.
 * child launcher can overide the specific method to change the behavior.
 * To extend the functionality of the baseLauncher child Launcher should use this._super();
 * @class org.ekstep.contentrenderer.baseLauncher.
 * @extends Class
 * @author Manjunath Davanam <manjunathd@ilimi.in>
 */

org.ekstep.contentrenderer.baseLauncher = Class.extend({
    contentData: undefined,
    manifest: undefined,

    /**
     * init of the launcher with the given data.
     * @param data {object} return the manifest object data
     * @memberof org.ekstep.contentrenderer.baseLauncher
     */
    init: function(manifest) {
        try {
            EkstepRendererAPI.addEventListener("renderer:telemetry:end", this.endTelemetry, this);
            EkstepRendererAPI.addEventListener('renderer:content:end',this.end, this);
            EkstepRendererAPI.addEventListener('renderer:content:replay', this.replay, this);
            this.manifest = manifest;
            this.initLauncher(this.manifest);
        } catch (error) {
            this.throwError(error);
        }
    },

    initLauncher: function(){
    	console.info("Base launcher should constuct.");
    },

    /**
     * launch of the particular launcher based on the mimetype.
     * @memberof org.ekstep.contentrenderer.baseLauncher
     */
    start: function() {
        console.info('Base Launcher should construct');
        this.resetDomElement();
        this.startTelemetry();
    },

    /**
     * End of the content listen for the renderer:content:end event.
     * Any child launcher can extend/override this functionality.
     * @memberof org.ekstep.contentrenderer.baseLauncher
	 */	
    end:function(){
    	this.heartBeatEvent(false);
    	this.endTelemetry();
        EkstepRendererAPI.dispatchEvent("renderer:endpage:show");
    },

    /**
     * Replay of the particular launcher.
     * Any child launcher can extends/override this functionality.
     * @memberof org.ekstep.contentrenderer.baseLauncher
     */
    replay: function() {
    	this.endTelemetry();
    	this.start();
    },

    /**
     * Clearing of the Lancher instace
     * @memberof org.ekstep.contentrenderer.baseLauncher
     */
    clear: function() {
        console.info('Clearing the launcher instance')
    },

    /**
     * Calculates the content progress
     * @param currentIndex {int} Current stage number
     * @param totalIndex {int} Total number of stages in the content.
     */
    progres: function(currentIndex, totalIndex) {
        var totalProgress = (currentIndex / totalIndex) * 100;
        totalProgress = totalProgress > 100 ? 100 : totalProgress;
        return Math.round(totalProgress);
    },
    contentProgress: function() {
        console.warn("Child Launcher should calculate");
    },

    /**
     * Generation of the OE_START Telemetry event.
     */

    startTelemetry: function() {
        var data = {};
        data.stageid = EkstepRendererAPI.getCurrentStageId();
        data.mode = getPreviewMode();
        TelemetryService.start(GlobalContext.game.id, GlobalContext.game.ver, data);
    },

    /**
     * Generation of OE_END Telemetry event.
     */
    endTelemetry: function(event) {
        if (TelemetryService.instance && TelemetryService.instance.telemetryStartActive()) {
            var telemetryEndData = {};
            telemetryEndData.stageid = getCurrentStageId();
            telemetryEndData.progress = this.contentProgress();
            console.info("telemetryEndData", telemetryEndData);
            TelemetryService.end(telemetryEndData);
        } else {
            console.warn('Telemetry service end is already logged Please log start telemetry again');
        }
    },

    /**
     * It Generates the HEARTBEAT Telemetry event. 
     * Any child launcher can extends/overide this functionality.
     */
		
    heartBeatEvent: function(flag, data) {
        var instance = this;
        if (flag) {
            instance._time = setInterval(function() {
                EkstepRendererAPI.getTelemetryService().interact("HEARTBEAT", "", "", instance.heartBeatData || {});
            }, EkstepRendererAPI.getGlobalConfig().heartBeatTime);
        }
        if (!flag) {
            clearInterval(instance._time);
        }
    },

    /**
     * Provides an ability to add dom element to player gamearea.
     * Any child launcher can extends/override this functionality. 
     */
    addToGameArea: function(domElement) {
        domElement.id = this.manifest.id;
        jQuery('#' + this.manifest.id).insertBefore("#gameArea");
        var gameArea = document.getElementById('gameArea');
        gameArea.insertBefore(domElement, gameArea.childNodes[0]);
        jQuery('#gameArea').css({
            left: '0px',
            top: '0px',
            width: "100%",
            height: "100%"
        });
        var elementId = document.getElementById(this.manifest.id);
        elementId.style.position = 'absolute';
        elementId.style.display = 'block';
        elementId.style.width = '100%';
        elementId.style.height = '100%';
    },

    /**
     * Provides an ability to remove the dom element from player gamearea.
     * Any child launcher can extends/override this functionality.
     */
    resetDomElement: function() {
        console.info('Child Launcher should implement');
        jQuery('#' + this.manifest.id).remove();
        var chilElemtns = jQuery('#gameArea').children();
        jQuery(chilElemtns).each(function() {
            if ((this.id !== "overlay") && (this.id !== "gameCanvas")) {
                jQuery(this).remove();
            }
        });
    },

    /**
     * Provides an ability to throw an custom error message and it will generates an OE_ERROR events.
     * Any child launcher can extends/override this functionality.
     */
    throwError: function(errorInfo) {
        var errorMessage = 'Sorry!!.. Unable to open the Content';
        var errorStack = undefined;
        if (errorInfo) {
            errorStack = errorInfo.stack
        };
        EkstepRendererAPI.logErrorEvent(errorStack, {
            'severity': 'fatal',
            'type': 'content',
            'action': 'play'
        });
        showToaster("error", errorMessage, {
            timeOut: 200000
        });
    }

});