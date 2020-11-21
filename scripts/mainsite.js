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
    existingIframe?.remove();
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

  let observer = new MutationObserver(function (mutations, observer) {
    let logo = document.querySelector('[data-a-target="player-twitch-logo-button"]');
    let card = document.getElementsByClassName("tw-card")[0];
    let panel = document.getElementsByClassName("stream-info-social-panel")[0];
    let fullscreenButton = document.querySelector('[data-a-target="player-fullscreen-button"]');

    //If all the elements are loaded, we continue.
    if (!logo || !card || !panel || !fullscreenButton)
      return;
      
    //Once everything is loaded, we show the iframe
    existingIframe.style.visibility = "";

    //We have to make a function to get the real theater button since the element changes everytime you go in fullscreen mode
    let getRealTheaterButton = () => window.parent.document.querySelector('[data-a-target="player-theatre-mode-button"]');

    let realFullscreenButton = window.parent.document.querySelector('[data-a-target="player-fullscreen-button"]');

    //We copy the button from the real interface (so we have the title in the good language and the good look)
    let theaterButton = getRealTheaterButton().parentElement.cloneNode(true).getElementsByTagName("button")[0];


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


    //Add audio compressor (thanks @rmanky)
    //Mute button is just needed to grab parent for placement
    var muteButton = document.querySelector('[data-a-target="player-mute-unmute-button"]');
    var compressorButton = muteButton.parentElement.cloneNode(true);
    //On Chrome atleast, appending to end is fine and places it to right of volume slides
    muteButton.parentElement.parentElement.appendChild(compressorButton);

    //Formatting stuff
    compressorButton.querySelector(".tw-tooltip").innerText = "Audio Compressor";
    compressorButton.querySelector("svg").setAttribute("viewBox", "0 0 1000 1000");
    compressorButton.querySelector("g").innerHTML = `<path fill-rule="evenodd" d="${compressor_off}" clip-rule="evenodd"></path>`;
    compressorButton.setAttribute("data-active", "false");

    let video = document.querySelector("video");
    video.context = new AudioContext();
    video.source = video.context.createMediaElementSource(video);
    video.compressor = video.context.createDynamicsCompressor();

    //Default values from FFZ
    video.compressor.threshold.setValueAtTime(-50, video.context.currentTime);
    video.compressor.knee.setValueAtTime(40, video.context.currentTime);
    video.compressor.ratio.setValueAtTime(12, video.context.currentTime);
    video.compressor.attack.setValueAtTime(0, video.context.currentTime);
    video.compressor.release.setValueAtTime(0.25, video.context.currentTime);

    //Compressor is disabled by default, can prob store preference locally if needed
    video.source.connect(video.context.destination);

    compressorButton.onclick = () => toggleAudioCompressor(video, compressorButton, compressorButton.getAttribute("data-active"));
    
    //Set the last audiocompressor state choosen
    if(localStorage.getItem("audioCompressor") === "false")
        toggleAudioCompressor(video, compressorButton, "false");
  });

  //If an overlay like (are you +18) is here, we show the iframe
  if(document.querySelector(".content-overlay-gate")) {
    existingIframe.style.visibility = "";
    document.querySelector('[data-a-target="player-overlay-mature-accept"]').addEventListener("click", () => {
      window.parent.document.querySelector('[data-a-target="player-overlay-mature-accept"]').click();
    });
  }
  
  observer.observe(document.body, { attributes: false, childList: true, subtree: true });
}
const compressor_off = 'M850 202.3C877.7 202.3 900 224.6 900 252.3V745.5C900 773.2 877.7 795.5 850 795.5S800 773.2 800 745.5V252.3C800 224.6 822.3 202.3 850 202.3ZM570 167.8C597.7 167.8 620 190.1 620 217.8V780C620 807.7 597.7 830 570 830S520 807.7 520 780V217.8C520 190.1 542.3 167.8 570 167.8ZM710 264.4C737.7 264.4 760 286.7 760 314.4V683.3C760 711 737.7 733.3 710 733.3S660 711 660 683.3V314.4C660 286.7 682.3 264.4 710 264.4ZM430 98.1C457.7 98.1 480 120.4 480 148.1V849.6C480 877.3 457.7 899.6 430 899.6S380 877.3 380 849.6V148.1C380 120.4 402.3 98.1 430 98.1ZM290 217.2C317.7 217.2 340 239.5 340 267.2V730.5C340 758.2 317.7 780.5 290 780.5S240 758.2 240 730.5V267.2C240 239.5 262.3 217.2 290 217.2ZM150 299.6C177.7 299.6 200 321.9 200 349.6V648.1C200 675.8 177.7 698.1 150 698.1S100 675.8 100 648.1V349.6C100 321.9 122.3 299.6 150 299.6Z';
const compressor_on = 'M850 200C877.7 200 900 222.3 900 250V750C900 777.7 877.7 800 850 800S800 777.7 800 750V250C800 222.3 822.3 200 850 200ZM570 250C597.7 250 620 272.3 620 300V700C620 727.7 597.7 750 570 750S520 727.7 520 700V300C520 272.3 542.3 250 570 250ZM710 225C737.7 225 760 247.3 760 275V725C760 752.7 737.7 775 710 775S660 752.7 660 725V275C660 247.3 682.3 225 710 225ZM430 250C457.7 250 480 272.3 480 300V700C480 727.7 457.7 750 430 750S380 727.7 380 700V300C380 272.3 402.3 250 430 250ZM290 225C317.7 225 340 247.3 340 275V725C340 752.7 317.7 775 290 775S240 752.7 240 725V275C240 247.3 262.3 225 290 225ZM150 200C177.7 200 200 222.3 200 250V750C200 777.7 177.7 800 150 800S100 777.7 100 750V250C100 222.3 122.3 200 150 200Z';
/**
 * Implement FFZ Audio Compressor.
 * 
 * @param {HTMLVideoElement} video The video element playing the stream
 * @param {HTMLButtonElement} button The audio compressor toggle button
 * @param {"true" | "false"} notActive "false" if the audio compressor should be activated
 */
function toggleAudioCompressor(video, button, notActive) {
	if (notActive === "false") {
    button.querySelector(".tw-tooltip").innerText = "Disable Audio Compressor";
    button.querySelector("g").innerHTML = `<path fill-rule="evenodd" d="${compressor_on}" clip-rule="evenodd"></path>`;
    button.setAttribute("data-active", "true");
    video.source.disconnect(video.context.destination);
    video.source.connect(video.compressor);
    video.compressor.connect(video.context.destination);
	} else if (notActive === "true") {
    button.querySelector(".tw-tooltip").innerText = "Audio Compressor";
    button.querySelector("g").innerHTML = `<path fill-rule="evenodd" d="${compressor_off}" clip-rule="evenodd"></path>`;
    button.setAttribute("data-active", "false");
    video.compressor.disconnect(video.context.destination);
    video.source.disconnect(video.compressor);
    video.source.connect(video.context.destination);
  }
  //Remember last audiocompressor state
  localStorage.setItem("audioCompressor", notActive);
}
