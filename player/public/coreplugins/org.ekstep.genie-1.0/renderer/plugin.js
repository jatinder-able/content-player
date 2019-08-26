/**
 * Plugin to create repo instance and to register repo instance
 * @extends EkstepRenderer.Plugin
 * @author Manjunath Davanam <manjunathd@ilimi.in>
 */
Plugin.extend({
    initialize: function() {
        app.compileProvider.directive("genie", ["$rootScope", function($rootScope) {
            return {
                restrict: "E",
                template: '<div ng-class="enableGenie ? \'genie-home\' : \'icon-opacity genie-home\'" ng-click="goToGenie()"><img ng-src="{{imageBasePath}}icn_home.png"/><span> {{AppLables.exit}} </span></div>',
                link: function(scope) {
                    scope.AppLables = AppLables
                    scope.enableGenie = true;
                    if (scope.enableGenie) {
                        scope.goToGenie = function() {
                            EkstepRendererAPI.hideEndPage()
                            var stageId = !_.isUndefined(Renderer) ? Renderer.theme._currentStage : " "
                            TelemetryService.interact("TOUCH", "gc_genie", "TOUCH", { stageId: stageId })
                            //exitApp()
                            alert("exit-clicked")
                            alert(window.parent)
                            var renderer = window.parent.document.getElementById("app-player-collection-renderer")
                            alert(renderer)
                            var renderer_btn = renderer.getElementsByTagName("h5")
                            alert(renderer_btn)
                            renderer_btn[0].style.setProperty("background-color", "red", "important")
                            renderer_btn[0].style.fontSize = "large"
                            setTimeout(function() {
                                renderer_btn[0].click()
                            }, 2000)
                        }
                    }
                }
            }
        }])
    }
})