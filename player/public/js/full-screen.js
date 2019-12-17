$("#pdf-fullscreen-container").html("<span title=\"Full Screen\" id=\"able-fullscreen\">" +
    "<img src=\"./assets/fullscreen.png\">" +
    "</span>" +
    "<span title=\"Exit Full Screen\" id=\"able-exit-fullscreen\">" +
    "<img src=\"./assets/exit-fullscreen.png\">" +
    "</span>")
var elem = document.documentElement
$("#pdf-fullscreen-container").on("click", "#able-fullscreen", function () {
	if (elem.requestFullscreen) {
		elem.requestFullscreen()
	} else if (elem.mozRequestFullScreen) { /* Firefox */
		elem.mozRequestFullScreen()
	} else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
		elem.webkitRequestFullscreen()
	} else if (elem.msRequestFullscreen) { /* IE/Edge */
		elem.msRequestFullscreen()
	}
	$(this).hide().next("span").show()
})
$("#pdf-fullscreen-container").on("click", "#able-exit-fullscreen", function () {
	if (document.exitFullscreen) {
		document.exitFullscreen()
	} else if (document.mozCancelFullScreen) {
		document.mozCancelFullScreen()
	} else if (document.webkitExitFullscreen) {
		document.webkitExitFullscreen()
	} else if (document.msExitFullscreen) {
		document.msExitFullscreen()
	}
	$(this).hide().prev("span").show()
})
document.addEventListener("keydown", closeFullScreen, false)
function closeFullScreen (e) {
	console.log("Escape Button")
	console.log(e)
	if (e.keyCode === 27) {
		$("#pdf-fullscreen-container").find("#able-exit-fullscreen").click()
	}
}
