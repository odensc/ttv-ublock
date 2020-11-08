chrome.webRequest.onBeforeSendHeaders.addListener(
	({ requestHeaders }) => {
		for (const header of requestHeaders) {
			if (header.name.toLowerCase() === "user-agent")
				header.value = "Googlebot";
		}

		return { requestHeaders };
	},
	{ urls: ["*://*.ttvnw.net/*"] },
	["blocking", "requestHeaders"]
);
