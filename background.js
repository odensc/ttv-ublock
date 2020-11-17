let userAgent = "";

chrome.storage.onChanged.addListener((changes) => {
	if (changes.userAgent) userAgent = changes.userAgent.newValue;
});

chrome.storage.local.get(
	{ userAgent: "Mediapartners-Google" },
	({ userAgent: storageUserAgent }) => {
		userAgent = storageUserAgent;

		chrome.webRequest.onBeforeSendHeaders.addListener(
			({ requestHeaders }) => {
				for (const header of requestHeaders) {
					if (header.name.toLowerCase() === "user-agent")
						header.value = userAgent;
				}

				return { requestHeaders };
			},
			{ urls: ["*://*.ttvnw.net/*"] },
			["blocking", "requestHeaders"]
		);
	}
);
