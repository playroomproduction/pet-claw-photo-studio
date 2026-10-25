# CleanYourTV theme integration

For the LG webOS port https://github.com/OmkarK97/webos-vibehack at commit 31a518aef23768067975f3ac2e464462a8046bab.

1. Back up your launcher source. Copy claw.css, claw.js, pet-theme-config.js and pet-heads.png to its app directory.
2. In app/index.html, add `<link rel="stylesheet" href="claw.css">` AFTER the launcher's existing CSS.
3. Before `</body>`, AFTER the launcher's existing scripts, add:

```
<script src="pet-theme-config.js"></script>
<script src="claw.js"></script>
```

4. Retain the ZIP's LICENSE, MEDIA.md, THIRD_PARTY_NOTICES.md and licenses/ alongside your distribution.
5. Build/package with LG's official webOS CLI and install using your own Developer Mode setup. This archive has no pairing tools, SDK, keys or IPK. Use LG's guide: https://webostv.developer.lge.com/develop/getting-started/developer-mode-app

The scene uses a 1920 x 1080 launcher canvas. Theme integration hides the launcher's two ambient app-color glows. It does not intercept Home, change the TV operating system, remove apps, or fix YouTube freezes. Developer Mode sessions can expire. Keep your rollback app package.

Animation layout was accepted on one LG webOS 11.2.0 device. The generalized image exports are browser-tested; each new TV/source variant needs its own test. Uploaded names are inserted as text. The atlas contains the four selected images. Review your exported ZIP before sharing it.
