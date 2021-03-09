const origFetch = window.fetch;
window.fetch = (url, init, ...args) => {
	try {
		if (typeof url === "string") {
			if (url.includes("/access_token")) {
				url = url.replace("player_type=site", "player_type=embed");
			} else if (
				url.includes("/gql") &&
				init &&
				typeof init.body === "string" &&
				init.body.includes("PlaybackAccessToken")
			) {
				const newBody = JSON.parse(init.body);
				newBody.variables.playerType = "embed";
				init.body = JSON.stringify(newBody);
			}
		}
	} catch (e) {}
	return origFetch(url, init, ...args);
};
