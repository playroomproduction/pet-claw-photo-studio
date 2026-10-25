# Install your pet theme with Claude or ChatGPT

This guide takes you from four photos to a themed **LG webOS CleanYourTV launcher**. Pet Claw Photo Studio supplies the photo editor and theme files. The launcher source comes separately from [OmkarK97's webOS port](https://github.com/OmkarK97/webos-vibehack), based on Gathin's CleanYourTV. The release does not contain a ready-to-install launcher/IPK.

## 1. Make your theme

1. Download `index.html` from the [latest release](https://github.com/bypinkland-mi/pet-claw-photo-studio/releases/latest). Open that downloaded file in a desktop browser. GitHub's source viewer does not run the editor.
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
https://github.com/bypinkland-mi/pet-claw-photo-studio/blob/main/INSTALL_WITH_AI.md

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

## 繁體中文：貼畀 Claude／ChatGPT

先下載 Release 嘅 `index.html`，換四張相，再按 **CleanYourTV theme ZIP**。將 ZIP 放喺 AI 有權讀取嘅本機 project folder，貼以下指令。純聊天版 AI 如果冇本機工具，只可以帶你逐步執行，唔會自動連到電視。ZIP 包含你揀嘅相，傳入網上聊天亦等於分享畀該服務。

```text
請幫我將 Pet Claw 四寵物主題裝入 LG webOS 版 CleanYourTV。
先讀：https://github.com/bypinkland-mi/pet-claw-photo-studio/blob/main/INSTALL_WITH_AI.md

我已有 pet-claw-cleanyourtv-theme.zip。先確認你有冇本機檔案／Terminal權限，
再問缺少嘅資料：我嘅電腦OS、LG型號／webOS版本、ZIP位置、我部TV嘅IP，
同埋有冇現有CleanYourTV。冇本機工具就逐步畀command我做，唔好話已安裝。

使用guide指定嘅LG webOS upstream及pinned commit，先讀README同install.sh；
macOS以外要核對支援，唔好直接照搬。已有source先備份並另開working copy，
冇就另開folder下載upstream，唔好覆蓋我原本啲檔。

按ZIP嘅README加入claw.css、claw.js、pet-theme-config.js、pet-heads.png，
保留launcher原有HTML、app scripts及appinfo，標籤只加一次。
唔好將Photo Studio index.html／wallpaper HTML覆蓋launcher嘅app/index.html。
先本機預覽整合後畫面，再用我自己TV同步出嚟嘅app IDs／icons，保留licenses。

用LG官方Developer Mode／CLI配對、打包IPK同安裝，只更新已核對嘅launcher。
LG登入、開Dev Mode、重開TV、Key Server、連線允許同配對碼由我親自處理；
密碼／passphrase只喺TV或本機互動Terminal輸入，唔好貼返chat或公開設定。
唔好root、reset、改firmware、移除原廠app，亦唔好自動裝Home watcher。

完成後分開驗證：打包、安裝版本／執行readback、我親眼確認動畫／遙控、開App。
Home仍返LG屬正常。最後畀我重開launcher、還原舊版同延長Developer Mode嘅方法，
清楚列出實測同仍待我操作嘅項目，唔好將browser preview當TV已驗收。
```

你需要自己喺電視安裝 Developer Mode、登入 LG、開兩個開關並重啟、批准連線同確認畫面。電腦要同 TV 喺同一網絡。主題唔會自動取代 Home，Developer Mode 有到期限制。

## Verification boundary

Guide checked against the pinned upstream README and current LG primary documentation on 25 October 2026. This documentation update does not establish a fresh installation on a new TV, support for every model, or automatic access from a plain AI chat. Existing editor/export verification is described in the project README.
