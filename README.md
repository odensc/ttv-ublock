# TTV ad-block

**Works best when paired with uBlock Origin**

Chrome/Firefox extension that _should?_ block ads on Twitch.

For security, this extension uses the minimum amount of permissions possible, and [the code](https://github.com/odensc/ttv-ublock/blob/extension/background.js) is as simple as possible.

- [Chrome installation](#chrome-installation)
- [Firefox installation](#firefox-installation)
- [Notes and troubleshooting](#notes-and-troubleshooting)

## Chrome installation

Download the extension from the Chrome extension site: https://chrome.google.com/webstore/detail/ttv-ad-block/kndhknfnihidhcfnaacnndbolonbimai/related

If you previously did a manual installation, remove that extension and install this one for automatic updates.

## Firefox installation

Download the extension on the Firefox addons site: https://addons.mozilla.org/en-US/firefox/addon/ttv-adblock/

If you previously did a manual installation, remove that extension and install this one for automatic updates.

## Notes and troubleshooting

- If you previously did the `userResourcesLocation` trick in uBlock, remove that script and purge the cache, as it will conflict.
- If you have "Alternate Player for Twitch.tv" installed, disable it.
