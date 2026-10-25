# Privacy

Pet Claw Photo Studio is designed to run as a downloaded, self-contained `index.html` file in your browser. No account, API key, payment or AI service is required.

## Your photos

When you choose one of the four image files, the editor reads that file into browser memory to show a preview and create your export. It is designed not to upload photos or names, send analytics, contact an image service, or store your photos in localStorage, IndexedDB or a service worker. Reloading or closing the editor discards the in-editor work; save an export if you want to keep the result.

Your source files are not edited. Cropping, zooming and the optional circle mask prepare the displayed portrait. The editor does not perform AI background removal, identify people, or train a model on your photos. An existing transparent PNG can preserve its cutout; ordinary photos can use the circle crop.

## Exported files contain your images

The wallpaper HTML and CleanYourTV theme ZIP contain the portraits you selected, including any names included by the export. They are saved through your browser's normal download flow. Anyone receiving an exported file can access its embedded images. Review the result before sharing it and use images you own or have permission to use.

The project does not promise secure deletion from your browser, operating system, downloads, backups or extensions. Do not rely on this editor to remove identifying visual information. No metadata-removal guarantee is made without an export-specific test.

## Download hosting and sample media

GitHub hosts the public source, release downloads and demonstration media. Visiting or downloading through GitHub is governed by [GitHub's privacy statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement) and terms; that is separate from local photo processing. Public source/sample media may be copied, forked or processed under the hosting service's terms. Do not upload your personal photo exports in public issues or pull requests.

The default sample illustrations were previously generated using OpenAI from an owner-provided reference. That earlier generation used a hosted service and is separate from this local editor. This privacy description makes no zero-retention or no-training claim about that historical generation or publicly hosted sample media. See [MEDIA.md](MEDIA.md).

## Verification status

The 25 October 2026 desktop browser check replaced four images, exercised both downloads, confirmed the downloaded HTML matched the rendered preview, and confirmed reload returned to the default samples. Source review found no upload/network or persistent-storage APIs in the editor/runtime; CSP disallows outbound connections. No console errors appeared in those tests. This is not a packet capture or a browser/OS secure-deletion guarantee. Direct file-URL reopening and mobile-device acceptance were not completed in the automated environment; see the README for the exact verification limits.
