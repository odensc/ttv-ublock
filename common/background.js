const options = ["blocking", "requestHeaders"]
if (chrome.app) options.push("extraHeaders")

chrome.webRequest.onBeforeSendHeaders.addListener(
	({ requestHeaders }) => {
		for (const header of requestHeaders) {
			if (header.name.toLowerCase() === "origin")
				header.value = "https://player.twitch.tv";

			if (header.name.toLowerCase() === "referer")
				header.value = "https://player.twitch.tv/";
		}
		return { requestHeaders };
	},
	{ urls: ["*://*.hls.ttvnw.net/*"] }, options
);