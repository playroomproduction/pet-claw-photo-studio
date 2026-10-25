# Install your pet theme with Claude or ChatGPT

This guide takes you from four photos to a themed **LG webOS CleanYourTV launcher**. Pet Claw Photo Studio supplies the photo editor and theme files. The launcher source comes separately from [OmkarK97's webOS port](https://github.com/OmkarK97/webos-vibehack), based on Gathin's CleanYourTV. The release does not contain a ready-to-install launcher/IPK.

## 1. Make your theme

1. Download `index.html` from the [latest release](https://github.com/playroomproduction/pet-claw-photo-studio/releases/latest). Open that downloaded file in a desktop browser. GitHub's source viewer does not run the editor.
2. Choose four PNG, JPG or WebP images, enter names and adjust Crop & framing. Transparent cutouts keep their transparency; ordinary photos can use Circle crop. There is no automatic background removal.
3. Click **CleanYourTV theme ZIP**. Keep the downloaded `pet-claw-cleanyourtv-theme.zip`.

Choose **wallpaper HTML** only if you want the animation in a browser. That file is not a TV installer. Neither the Photo Studio `index.html` nor `pet-claw-wallpaper.html` should replace the launcher's `app/index.html`.

## 2. Prepare your computer and TV

The reference launcher setup is for **LG webOS and macOS**, with a computer on the same local network as the TV. Its pinned setup uses Git, Node.js and Python 3. Ask your assistant to check these before installing anything. Windows/Linux command adaptation and other TV families are not validated by this guide; Samsung Tizen and Android TV need different launchers.

Use an assistant that can access your project folder and run local Terminal commands, such as Claude Code or Codex. A Claude/ChatGPT chat without local tools can explain the steps, but you must run the commands yourself. Give it the exported theme ZIP and this guide; there is no need to upload your original photos again. The ZIP still contains your selected portraits, so an upload to an AI chat shares those images with that provider.

On the TV, follow [LG's official Developer Mode guide](https://webostv.developer.lge.com/develop/getting-started/developer-mode-app): install Developer Mode, sign in yourself with an LG Developer account, enable Dev Mode Status, let the TV restart, then reopen it and enable Key Server. Note your own TV's local IP. Enter account passwords and the pairing passphrase yourself on the TV or the local interactive Terminal prompt; do not paste them into an AI chat.

## 3. Copy this prompt to your assistant

Attach or grant local access to `pet-claw-cleanyourtv-theme.zip`, then paste:

```text
Help me install my four-photo Pet Claw theme into CleanYourTV on my LG webOS TV.

Read this guide first:
https://github.com/playroomproduction/pet-claw-photo-studio/blob/main/INSTALL_WITH_AI.md

I have exported pet-claw-cleanyourtv-theme.zip. First ask for only the missing
information: computer OS, TV model/webOS version, the theme ZIP location, my own
TV's local IP, and whether I already have a CleanYourTV source checkout/install.
Check whether you actually have local file and Terminal access. If you only have
chat access, explain that limitation and give me commands to run one step at a time.
Do not claim you have installed or verified something you cannot access.

Use the LG webOS port https://github.com/OmkarK97/webos-vibehack at commit
31a518aef23768067975f3ac2e464462a8046bab as the reference. Read its README,
install.sh and relevant scripts before executing them. Check the current official
LG Developer Mode and webOS CLI docs too. The upstream setup is macOS-based;
do not assume those scripts work unchanged on another OS or TV platform.

If I already have a launcher, inspect it and make a separate working copy plus a
rollback backup. Do not reset my checkout or overwrite unrelated changes. If I
have no launcher, obtain that pinned upstream source in a new project folder.
Do not copy another household's app list, icons, IPs, device profile or keys.

Extract my theme ZIP and follow its README.md. Copy only claw.css, claw.js,
pet-theme-config.js and pet-heads.png into the launcher's app directory.
Load claw.css AFTER the existing launcher CSS. Load pet-theme-config.js then
claw.js AFTER the existing launcher scripts and before </body>. Add each tag
only once. Preserve the existing app/index.html, app.js and appinfo.json.
Do NOT replace the launcher's index.html with the photo editor or wallpaper HTML.
Keep the included license/media notices and upstream/font notices with the build.

Check dependencies and preview the combined launcher locally before TV install.
Use my own installed app IDs and icons, obtained locally through the upstream
sync procedure. Ask me to approve any connection prompt on the TV. Do not put
private pairing files or my generated inventory into a public repository.
Tell me the target app ID/version and whether installation replaces my existing
launcher. Keep the previous source/package before updating that app.

Guide me through LG Developer Mode and official local pairing. I will enter my
LG password and passphrase privately on the TV/local Terminal. Do not print them
or put them in chat, screenshots, shared logs or published files. Local device
profiles needed by LG's tools must stay private. Then package the combined app
as an IPK using the official webOS CLI, install it on the verified TV and launch it.
Do not factory-reset, root, modify firmware, remove system apps or install a Home
redirect/watch service. If Developer Mode or this setup is unsupported, report
that exact limitation rather than silently switching to another method.

Verify separately: (1) the IPK was built, (2) installation/version and running app
were read back, (3) I confirm the pet animation and remote navigation on the TV,
and (4) an installed app opens. Home returning to LG is expected. Report what
passed and what still needs my action. Do not call a browser preview a TV test.
Explain how to reopen the launcher, restore the previous build and extend my
Developer Mode session. Do not promise this fixes other apps freezing.
```

## 4. What you do yourself

Your assistant can prepare files and run a supported local build. You still operate the TV for LG sign-in, Dev Mode Status/reboot, Key Server, connection permission and the final visual/remote check. Ask it to explain the current step if a TV screen differs from the guide.

For manual integration, follow the exported ZIP's `README.md`, or [runtime/INTEGRATION.md](runtime/INTEGRATION.md). The official [LG CLI developer guide](https://webostv.developer.lge.com/develop/tools/cli-dev-guide) covers packaging, installation and launch.

After installation, open the launcher from the TV's Apps list. Where supported, LG Quick Access can provide a number-key shortcut. The stock Home button still opens LG Home; this guide does not install the optional upstream Home watcher. Watch Developer Mode's remaining time and use LG's Extend control before expiry. Developer Mode apps can be removed when the session expires or Developer Mode is disabled.

## If something does not work

| What you see | What to tell your assistant |
| --- | --- |
| GitHub shows HTML code | Download the Release `index.html`, then open the downloaded file. |
| Animation works, but there are no app tiles | You opened standalone wallpaper HTML. Integrate the theme ZIP into the launcher instead. |
| Generic or wrong app tiles | Sync **your own TV's** app inventory; inspect its actual app IDs. |
| No pairing prompt or SSH connection | Check TV IP, same network, Dev Mode after reboot and Key Server. Enter the passphrase locally. |
| Theme does not appear | Check file paths, CSS order and config-before-claw script order; avoid duplicate tags. |
| Home opens LG Home | Expected: the theme customizes a launcher app, not the TV's Home mapping. |
| App disappears after some time | Check Developer Mode/session status against LG's current guide. |

## 繁體中文：貼給 Claude／ChatGPT 的安裝指令

請先從 Release 下載 `index.html`，替換四張相片，再按 **CleanYourTV theme ZIP** 匯出主題。將 ZIP 放在 AI 已獲授權存取的本機專案資料夾中，然後貼上下方指令。若使用的 AI 僅提供聊天功能，無法存取本機檔案或終端機，您需要依照指示自行執行命令。ZIP 包含您選擇的圖片；將 ZIP 上傳至網路聊天服務，也會將這些圖片分享給該服務。

```text
請協助我將 Pet Claw 四張寵物相片主題，整合至 LG webOS 版 CleanYourTV 並安裝。
請先閱讀：
https://github.com/playroomproduction/pet-claw-photo-studio/blob/main/INSTALL_WITH_AI.md

我已匯出 pet-claw-cleanyourtv-theme.zip。請先確認您是否具備本機檔案及終端機
存取權限，再詢問缺少的資料：電腦作業系統、LG 電視型號與 webOS 版本、ZIP
所在位置、我的電視區域網路 IP，以及是否已有 CleanYourTV 原始碼或已安裝版本。
如果您只有聊天功能，請逐步提供命令讓我自行執行，不要聲稱已完成安裝。

請使用教學指定的 LG webOS 上游專案與固定 commit，先閱讀 README、install.sh
及相關腳本。macOS 以外的環境必須另行確認相容性，不要直接套用相同腳本。
若已有原始碼，請先備份並建立獨立工作副本；若沒有，請在新資料夾取得上游
原始碼。不要覆蓋我的既有檔案、重設工作目錄，或複製他人的電視裝置資料。

請依照 ZIP 內的 README 加入 claw.css、claw.js、pet-theme-config.js 與
pet-heads.png。將主題 CSS 放在原有 CSS 之後，並在原有腳本之後依序載入
pet-theme-config.js、claw.js；每個標籤只加入一次。請保留啟動器原有 HTML、
應用程式腳本、appinfo.json 與授權聲明，不要使用 Photo Studio 的 index.html
或獨立桌布 HTML 覆蓋啟動器的 app/index.html。

請先在本機預覽整合後的畫面，再使用從我自己的電視同步取得的應用程式 ID
與圖示。請保留回復用的原始碼及安裝包，並說明此次安裝的應用程式 ID、版本，
以及是否會更新既有啟動器。不要將配對金鑰、裝置設定或應用程式清單公開。

請使用 LG 官方 Developer Mode 與 webOS CLI 配對、打包 IPK 及安裝，僅更新
已確認的啟動器。LG 登入、啟用 Dev Mode、重新啟動電視、開啟 Key Server、
批准連線及輸入配對碼，由我親自處理。密碼與 passphrase 僅在電視或本機
互動式終端機輸入，不要貼回聊天、截圖、共用紀錄或公開設定檔。
請勿取得 root 權限、恢復原廠設定、修改韌體、移除系統應用程式，或自動
安裝 Home 轉向常駐服務。若環境不支援，請明確說明，不要自行改用其他方式。

完成後請分別驗證：IPK 打包、安裝版本及執行狀態讀回，以及我在電視上確認
動畫、遙控操作與應用程式啟動。按 Home 返回 LG 首頁屬預期行為。
請最後提供重新開啟啟動器、還原舊版及延長 Developer Mode 時間的方法，
清楚區分實測結果與仍需我操作的項目，不要將瀏覽器預覽視為電視驗收完成。
```

您需要在電視上安裝 Developer Mode、登入 LG、啟用 Dev Mode Status、重新啟動後開啟 Key Server，並批准連線及確認畫面。電腦與電視必須位於同一區域網路。主題不會自動取代 Home 按鈕的行為；Developer Mode 也有使用期限。

## Verification boundary

Guide checked against the pinned upstream README and current LG primary documentation on 25 October 2026. This documentation update does not establish a fresh installation on a new TV, support for every model, or automatic access from a plain AI chat. Existing editor/export verification is described in the project README.
