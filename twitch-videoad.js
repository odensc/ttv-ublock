/// twitch-videoad.js
const origFetch = window.fetch;
window.fetch = (url, init, ...args) => {
	if (typeof url === "string") {
		if (url.includes("/access_token")) {
			const newUrl = new URL(arguments[0]);
			newUrl.searchParams.set("player_type", "dashboard");
			url = url.href;
		} else if (
			url.includes("/gql") &&
			init &&
			typeof init.body === "string" &&
			init.body.includes("PlaybackAccessToken")
		) {
			const newBody = JSON.parse(init.body);
			newBody.variables.playerType = "dashboard";
			init.body = JSON.stringify(newBody);
		}
	}
	return origFetch(url, init, ...args);
};
