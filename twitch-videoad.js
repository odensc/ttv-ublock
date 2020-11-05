/// twitch-videoad.js
const origFetch = window.fetch;
window.fetch = (url, init, ...args) => {
	if (typeof url === "string") {
		if (url.includes("/access_token")) {
			url = url.replace("player_type=site", "player_type=animated_thumbnails");
		} else if (
			url.includes("/gql") &&
			init &&
			typeof init.body === "string" &&
			init.body.includes("PlaybackAccessToken")
		) {
			const newBody = JSON.parse(init.body);
			newBody.variables.playerType = "animated_thumbnails";
			init.body = JSON.stringify(newBody);
		}
	}
	return origFetch(url, init, ...args);
};
