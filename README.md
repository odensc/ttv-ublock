# TTV ad-block

Chrome/Firefox extension that _should?_ block ads on Twitch.

For security, this extension uses the minimum amount of permissions possible, and [the code](https://github.com/odensc/ttv-ublock/blob/extension/background.js) is as simple as possible.

* [Chrome installation](#chrome-installation)
* [Firefox installation](#firefox-installation)
* [Notes and troubleshooting](#notes-and-troubleshooting)

## Chrome installation

1. Download the ZIP file of the extension code: https://github.com/odensc/ttv-ublock/archive/extension.zip
2. Unzip it into a new folder.
3. Open the Extensions page. 

![**Image example**](https://i.imgur.com/ErYvch2.png)

4. In the top right, enable "Developer mode". 

![**Image example**](https://i.imgur.com/lhgY8KB.png)

5. In the top left, click "Load unpacked". 

![**Image example**](https://i.imgur.com/kjXCaFV.png)

6. A file dialog will open. Navigate to the folder with the code in it and select it. 

![**Image example**](https://i.imgur.com/I8ICXTD.png)

The extension should install! Enjoy. Don't delete the extension folder or it will be uninstalled.

*Chrome extension is pending approval for the Chrome extensions site*

## Firefox installation

Download the extension on the Firefox addons site: https://addons.mozilla.org/en-US/firefox/addon/ttv-adblock/

If you previously did a manual installation, remove that extension and install this one for automatic updates.

## Notes and troubleshooting

* If you previously did the `userResourcesLocation` trick in uBlock, remove that script and purge the cache, as it will conflict.
* If you have "Alternate Player for Twitch.tv" installed, disable it.
