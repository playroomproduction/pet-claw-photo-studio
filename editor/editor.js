(() => {
  "use strict";

  const PHOTO_COUNT = 4;
  const MAX_FILE_BYTES = 10 * 1024 * 1024;
  const MAX_NAME_CHARS = 24;
  const studio = window.PetClawStudio;
  const previewFrame = document.getElementById("wallpaper-preview");
  const previewShell = document.getElementById("preview-shell");
  const previewEmpty = document.getElementById("preview-empty");
  const previewStatus = document.getElementById("preview-status");
  const motionToggle = document.getElementById("motion-toggle");
  const motionLabel = document.getElementById("motion-label");
  const exportStatus = document.getElementById("export-status");
  const exportButtons = Array.from(document.querySelectorAll("[data-export]"));
  const cards = Array.from(document.querySelectorAll("[data-photo-index]"));

  const fallbackDefaults = {
    names: ["Pet 1", "Pet 2", "Pet 3", "Pet 4"],
    photos: Array.from({ length: PHOTO_COUNT }, () => ({ src: "", zoom: 1, x: 0, y: 0, circle: false }))
  };

  function finiteOr(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function cleanName(value, index) {
    const candidate = typeof value === "string" ? value : `Pet ${index + 1}`;
    let result = "";
    let units = 0;
    for (const character of candidate) {
      if (units + character.length > MAX_NAME_CHARS) break;
      result += character;
      units += character.length;
    }
    return result;
  }

  function clonePhoto(photo) {
    return {
      src: typeof photo?.src === "string" ? photo.src : "",
      zoom: clamp(finiteOr(photo?.zoom, 1), 0.5, 3),
      x: clamp(finiteOr(photo?.x, 0), -1, 1),
      y: clamp(finiteOr(photo?.y, 0), -1, 1),
      circle: Boolean(photo?.circle)
    };
  }

  const suppliedDefaults = studio && studio.defaults ? studio.defaults : fallbackDefaults;
  const names = Array.from({ length: PHOTO_COUNT }, (_, index) => cleanName(suppliedDefaults.names?.[index], index));
  const photos = Array.from({ length: PHOTO_COUNT }, (_, index) => clonePhoto(suppliedDefaults.photos?.[index]));
  const drawTokens = Array(PHOTO_COUNT).fill(0);
  const fileTokens = Array(PHOTO_COUNT).fill(0);
  let previewToken = 0;
  let previewTimer = 0;
  let paused = false;
  let busyExport = false;

  function setMessage(element, message, isError = false) {
    element.textContent = message;
    element.classList.toggle("is-error", isError);
  }

  function updatePhotoControls(index) {
    const card = cards[index];
    const photo = photos[index];
    if (!card) return;

    const zoom = card.querySelector('[data-photo-setting="zoom"]');
    const horizontal = card.querySelector('[data-photo-setting="x"]');
    const vertical = card.querySelector('[data-photo-setting="y"]');
    const circle = card.querySelector('[data-photo-setting="circle"]');
    if (zoom) zoom.value = String(photo.zoom);
    if (horizontal) horizontal.value = String(photo.x);
    if (vertical) vertical.value = String(photo.y);
    if (circle) circle.checked = photo.circle;
    updateRangeOutputs(card, photo);
  }

  function updateRangeOutputs(card, photo) {
    const zoomOutput = card.querySelector('[data-range-output="zoom"]');
    const xOutput = card.querySelector('[data-range-output="x"]');
    const yOutput = card.querySelector('[data-range-output="y"]');
    if (zoomOutput) zoomOutput.textContent = `${Math.round(photo.zoom * 100)}%`;
    if (xOutput) xOutput.textContent = `${photo.x > 0 ? "+" : ""}${Math.round(photo.x * 100)}%`;
    if (yOutput) yOutput.textContent = `${photo.y > 0 ? "+" : ""}${Math.round(photo.y * 100)}%`;
  }

  async function drawPhotoPreview(index) {
    const card = cards[index];
    const canvas = card?.querySelector("[data-photo-canvas]");
    if (!canvas) return;
    const token = ++drawTokens[index];
    const stage = document.createElement("canvas");
    stage.width = canvas.width || 256;
    stage.height = canvas.height || 256;

    try {
      if (studio && typeof studio.drawPhoto === "function" && photos[index].src) {
        await studio.drawPhoto(stage, clonePhoto(photos[index]));
      } else {
        const context = stage.getContext("2d");
        if (context) {
          context.fillStyle = "#302735";
          context.fillRect(0, 0, stage.width, stage.height);
          context.fillStyle = "#caa6a2";
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.font = "48px -apple-system, BlinkMacSystemFont, sans-serif";
          context.fillText("✳", stage.width / 2, stage.height / 2);
        }
      }
      if (token !== drawTokens[index]) return;
      const context = canvas.getContext("2d");
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(stage, 0, 0, canvas.width, canvas.height);
      }
    } catch (_) {
      if (token !== drawTokens[index]) return;
      const context = canvas.getContext("2d");
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "#302735";
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
      setMessage(card.querySelector("[data-photo-status]"), "This photo could not be previewed. Try another image.", true);
    }
  }

  function makePayload() {
    return { names: [...names], photos: photos.map(clonePhoto) };
  }

  function syncExportAvailability() {
    exportButtons.forEach((button) => {
      const method = button.dataset.export === "html" ? studio?.makeDocument : studio?.makeThemeZip;
      button.disabled = typeof method !== "function";
    });
  }

  function syncPause() {
    if (!previewFrame.contentWindow) return;
    previewFrame.contentWindow.postMessage({ type: "pet-claw-preview", paused }, "*");
  }

  async function renderWallpaper(token) {
    if (!studio || typeof studio.makeDocument !== "function") {
      previewEmpty.hidden = false;
      previewFrame.hidden = true;
      motionToggle.disabled = true;
      exportButtons.forEach((button) => { button.disabled = true; });
      setMessage(previewStatus, "Wallpaper tools are unavailable in this build.", true);
      return;
    }

    setMessage(previewStatus, "Updating preview…");
    try {
      // The factory must insert names into the wallpaper as text, never as raw HTML.
      const documentHtml = await studio.makeDocument(makePayload());
      if (token !== previewToken) return;
      if (typeof documentHtml !== "string" || !documentHtml) throw new Error("No wallpaper document was returned.");
      previewFrame.hidden = false;
      previewEmpty.hidden = true;
      previewFrame.srcdoc = documentHtml;
      motionToggle.disabled = false;
      syncExportAvailability();
      setMessage(previewStatus, "Preview ready · edits stay in this tab.");
    } catch (_) {
      if (token !== previewToken) return;
      previewEmpty.hidden = false;
      setMessage(previewStatus, "The preview could not be refreshed. Your edits are still here.", true);
    }
  }

  function schedulePreview(immediate = false) {
    previewToken += 1;
    const token = previewToken;
    window.clearTimeout(previewTimer);
    if (immediate) {
      void renderWallpaper(token);
    } else {
      previewTimer = window.setTimeout(() => { void renderWallpaper(token); }, 260);
    }
  }

  function resizePreview() {
    if (!previewShell || !previewFrame) return;
    const scale = previewShell.clientWidth / 1920;
    previewFrame.style.transform = `scale(${scale})`;
  }

  function allowedImageFile(file) {
    const allowedMime = ["image/png", "image/jpeg", "image/webp"];
    const mime = (file.type || "").toLowerCase();
    if (mime) return allowedMime.includes(mime);
    return /\.(png|jpe?g|webp)$/i.test(file.name || "");
  }

  function isJpeg(file) {
    const mime = (file.type || "").toLowerCase();
    return mime === "image/jpeg" || (!mime && /\.jpe?g$/i.test(file.name || ""));
  }

  function readAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
      reader.onerror = () => reject(new Error("The selected photo could not be read."));
      reader.onabort = () => reject(new Error("Photo reading was cancelled."));
      reader.readAsDataURL(file);
    });
  }

  function verifyImage(dataUrl) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => (image.naturalWidth > 0 && image.naturalHeight > 0 ? resolve() : reject(new Error("This file does not contain a usable image.")));
      image.onerror = () => reject(new Error("This file does not contain a usable image."));
      image.src = dataUrl;
    });
  }

  async function onPhotoSelected(index, input) {
    const file = input.files && input.files[0];
    if (!file) return;
    const token = ++fileTokens[index];
    const card = cards[index];
    const status = card.querySelector("[data-photo-status]");
    const badge = card.querySelector("[data-photo-badge]");

    if (file.size > MAX_FILE_BYTES) {
      setMessage(status, "Choose a photo smaller than 10 MB.", true);
      input.value = "";
      return;
    }
    if (!allowedImageFile(file)) {
      setMessage(status, "Choose a PNG, JPG or WebP image.", true);
      input.value = "";
      return;
    }

    setMessage(status, "Reading photo locally…");
    try {
      const src = await readAsDataUrl(file);
      await verifyImage(src);
      if (token !== fileTokens[index]) return;
      photos[index] = { ...photos[index], src, zoom: 1, x: 0, y: 0, circle: isJpeg(file) };
      if (badge) badge.textContent = "Your photo";
      setMessage(status, "Photo ready · kept on this device.");
      updatePhotoControls(index);
      void drawPhotoPreview(index);
      schedulePreview();
    } catch (_) {
      if (token === fileTokens[index]) setMessage(status, "This photo could not be opened. Try a different image.", true);
    } finally {
      if (token === fileTokens[index]) input.value = "";
    }
  }

  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.rel = "noopener";
    link.style.display = "none";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  async function exportFile(kind, clickedButton) {
    if (busyExport || !studio) return;
    const method = kind === "html" ? studio.makeDocument : studio.makeThemeZip;
    if (typeof method !== "function") {
      setMessage(exportStatus, "This download is not available in the current build.", true);
      return;
    }

    busyExport = true;
    exportButtons.forEach((button) => {
      button.disabled = true;
      const label = button.querySelector("[data-button-label]");
      if (label) {
        button.dataset.idleLabel = label.textContent;
        if (kind === button.dataset.export) label.textContent = "Preparing download…";
      }
    });
    setMessage(exportStatus, kind === "html" ? "Preparing your wallpaper…" : "Preparing your theme ZIP…");

    try {
      const result = await method.call(studio, makePayload());
      if (kind === "html") {
        if (typeof result !== "string" || !result) throw new Error("No wallpaper document was returned.");
        triggerDownload(new Blob([result], { type: "text/html;charset=utf-8" }), "pet-claw-wallpaper.html");
      } else {
        if (!(result instanceof Blob)) throw new Error("No theme archive was returned.");
        triggerDownload(result, "pet-claw-cleanyourtv-theme.zip");
      }
      setMessage(exportStatus, kind === "html" ? "Wallpaper HTML downloaded." : "CleanYourTV theme ZIP downloaded.");
    } catch (_) {
      setMessage(exportStatus, "The download could not be prepared. Your edits are still here.", true);
    } finally {
      busyExport = false;
      exportButtons.forEach((button) => {
        const label = button.querySelector("[data-button-label]");
        if (label && button.dataset.idleLabel) label.textContent = button.dataset.idleLabel;
        delete button.dataset.idleLabel;
      });
      syncExportAvailability();
      clickedButton.blur();
    }
  }

  cards.forEach((card, index) => {
    const nameInput = card.querySelector("[data-pet-name]");
    const count = card.querySelector("[data-name-count]");
    const fileInput = card.querySelector("[data-photo-file]");

    nameInput.value = names[index];
    if (count) count.textContent = `${Array.from(names[index]).length}/${MAX_NAME_CHARS}`;
    nameInput.addEventListener("input", () => {
      const nextName = cleanName(nameInput.value, index);
      if (nextName !== nameInput.value) nameInput.value = nextName;
      names[index] = nextName;
      if (count) count.textContent = `${Array.from(nextName).length}/${MAX_NAME_CHARS}`;
      schedulePreview();
    });

    fileInput.addEventListener("change", () => { void onPhotoSelected(index, fileInput); });
    card.querySelectorAll("[data-photo-setting]").forEach((control) => {
      control.addEventListener("input", () => updatePhotoSetting(index, control));
      control.addEventListener("change", () => updatePhotoSetting(index, control));
    });

    function updatePhotoSetting(photoIndex, control) {
      const key = control.dataset.photoSetting;
      if (key === "circle") photos[photoIndex].circle = control.checked;
      else if (key === "zoom") photos[photoIndex].zoom = clamp(finiteOr(control.value, 1), 0.5, 3);
      else if (key === "x" || key === "y") photos[photoIndex][key] = clamp(finiteOr(control.value, 0), -1, 1);
      updateRangeOutputs(card, photos[photoIndex]);
      void drawPhotoPreview(photoIndex);
      schedulePreview();
    }

    updatePhotoControls(index);
    void drawPhotoPreview(index);
  });

  previewFrame.addEventListener("load", syncPause);
  motionToggle.addEventListener("click", () => {
    paused = !paused;
    motionToggle.setAttribute("aria-pressed", String(paused));
    motionLabel.textContent = paused ? "Resume motion" : "Pause motion";
    syncPause();
  });

  exportButtons.forEach((button) => {
    button.addEventListener("click", () => { void exportFile(button.dataset.export, button); });
  });

  if (typeof ResizeObserver === "function") {
    new ResizeObserver(resizePreview).observe(previewShell);
  } else {
    window.addEventListener("resize", resizePreview, { passive: true });
  }
  resizePreview();
  schedulePreview(true);
})();
