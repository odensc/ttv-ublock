var lastStreamer, existingIframe;

window.addEventListener("message", (event) => {
	if (event.data.eventName == "UPDATE_STATE" && event.data.params.quality && !document.hidden)
		if (/^((?:160|360|480|720|900|960|1080)p(?:30|48|50|60)|chunked)$/.test(event.data.params.quality))
      localStorage.setItem("embAdbQuality", event.data.params.quality);
});

const untouchedPages = [(link) => link.endsWith("/directory"), (link) => link.includes("/clip/")];

var observer = new MutationObserver(function (mutations, observer) {
	var container = document.querySelector(".video-player .tw-absolute");

  //Optimization: We do not check everything when numbers like viewers or anything updates.
	if (mutations.length === 1 && (mutations[0].target.classList.contains("tw-animated-number--monospaced") || mutations[0].target.classList.contains("tw-animated-number")))
    return;
    
  //If there is no container, then the page is not fully loaded
  if (!container)
    return;
  
  let isOnMainPage = window.location.pathname.length <= 1;

  //Thses pages should not be modified because it breaks them
  if (untouchedPages.find(value => value(window.location.pathname) || (isOnMainPage && !lastStreamer))) {
    //We show the initial interface and hide our embeded stream
    existingIframe.remove();
    existingIframe = undefined;

    for (let el of container.children)
      el.hidden = false;
    return;
  } else if(isOnMainPage)//If the user is on the main page, we do not modify anything (and we do not revert our modifications (because of the little player at the bottom of the page))
    return;

	let streamerName = window.location.pathname.split("/")[1];

  //We save the latest stream quality choosen by the user so we use it there to tell the embeded iframe what quality to use
	let quality = localStorage["embAdbQuality"] || "chunked";
	let iframeUrl = `https://player.twitch.tv/?channel=${streamerName}&muted=false&parent=twitch.tv&quality=${quality}`;

  //We hide everything of the original player and kill the video stream of it
	for (let el of container.children) {
    if (el.tagName != "IFRAME")
      el.hidden = true;
    if (el.tagName == "VIDEO")
      el.src = "";
	}

	if (!existingIframe || streamerName != lastStreamer) {
		existingIframe ??= document.createElement("iframe");
    existingIframe.style = "width: 100%; height: 100%";
		existingIframe.src = iframeUrl;
		//Hide iframe when loading (to avoid white flashing screen)
    existingIframe.style.visibility = "hidden";
    existingIframe.onload = () => loadIframe(existingIframe);
		container.appendChild(existingIframe);
	}

	lastStreamer = streamerName;
});

observer.observe(document.body, {
  attributes: false,
  childList: true,
  subtree: true,
});

//Code modifying the iframe
function loadIframe(iframe) {
	let window = iframe.contentWindow;
	let document = window.document;
	//More optimized
  let observer = new MutationObserver(function (mutations, observer) {
    let logo = document.querySelector('[data-a-target="player-twitch-logo-button"]');
    let card = document.getElementsByClassName("tw-card")[0];
    let panel = document.getElementsByClassName("stream-info-social-panel")[0];
    let fullscreenButton = document.querySelector('[data-a-target="player-fullscreen-button"]');

    //We have to make a function to get the real theater button since the element changes everytime you go in fullscreen mode
    let getRealTheaterButton = () => window.parent.document.querySelector('[data-a-target="player-theatre-mode-button"]');

    let realFullscreenButton = window.parent.document.querySelector('[data-a-target="player-fullscreen-button"]');

    //We copy the button from the real interface (so we have the title in the good language and the good look)
    let theaterButton = getRealTheaterButton().parentElement.cloneNode(true).getElementsByTagName("button")[0];

    //If all the elements are loaded, we continue.
    if (!logo || !card || !panel || !fullscreenButton)
      return;

    //No need to listen for changes now
    observer.disconnect();

    //We don't care about these elements
    logo.remove();
    panel.remove();

    //When on fullscreen, we show the stream and streamer informations. Otherwise, we don't show them.
    card.style.display = "none";//We hide them
    window.parent.addEventListener("fullscreenchange", _ => {
      card.style.display = window.parent.document.fullscreenElement ? "" : "none";
      //We change the look of the fullscreen button when the fullscreen state change
      fullscreenButton.innerHTML = realFullscreenButton.innerHTML;
    });

    fullscreenButton.parentElement.parentElement.insertBefore(
      theaterButton.parentElement,
      fullscreenButton.parentElement
    );

    theaterButton.removeAttribute("disabled");
    fullscreenButton.removeAttribute("disabled");
    theaterButton.className = theaterButton.className.split("--disabled").join("");
    fullscreenButton.className = fullscreenButton.className.split("--disabled").join("");

    fullscreenButton.onclick = () => realFullscreenButton.click();
    theaterButton.onclick = () => {
      getRealTheaterButton().click();
      //We change the look of the button when clicked
      theaterButton.innerHTML = getRealTheaterButton().innerHTML;
    };

    //Double click
    document.querySelector(".click-handler").addEventListener("dblclick", () => fullscreenButton.click());

    //Once everything is loaded, we show the iframe
    existingIframe.style.visibility = "";
  });

  observer.observe(document.body, { attributes: false, childList: true, subtree: true });
}