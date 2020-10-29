/// twitch-videoad.js
(() => {
    const version = 1;
    if (!location.hostname.match(/((^|\.)twitch\.tv$)|(^ttv-ublock.vercel.app$)/)) return;

    const origFetch = window.fetch;
    window.fetch = (rawUrl, ...args) => {
        if (rawUrl.includes("/access_token")) {
            const url = new URL(rawUrl);
            url.searchParams.set("player_type", "picture-by-picture");
            rawUrl = url.href;
        }

        return origFetch(rawUrl, ...args);
    };
})();
