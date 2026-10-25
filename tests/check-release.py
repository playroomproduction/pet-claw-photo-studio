#!/usr/bin/env python3
"""Check the Pet Claw public source tree and an optional CleanYourTV theme ZIP.

This is a local, standard-library-only release hygiene check. It does not prove
copyright clearance, inspect image pixels for logos, or replace browser review.
"""

from __future__ import annotations

import argparse
import ipaddress
import re
import stat
import sys
import zipfile
from pathlib import Path, PurePosixPath


ROOT = Path(__file__).resolve().parents[1]

# Exact public paths. New distributable files must be reviewed and added here.
REQUIRED_FILES = {
    "LICENSE",
    "MEDIA.md",
    "PRIVACY.md",
    "README.md",
    "THIRD_PARTY_NOTICES.md",
    "editor/editor.css",
    "editor/editor.js",
    "editor/factory.js",
    "editor/index.src.html",
    "index.html",
    "licenses/Outfit-OFL.txt",
    "demo/pet-claw-demo.mp4",
    "demo/poster.png",
    "runtime/INTEGRATION.md",
    "runtime/claw.css",
    "runtime/claw.js",
    "runtime/outfit.ttf",
    "samples/pet-heads.png",
    "scripts/build.py",
    "tests/check-release.py",
    "tests/fixtures/pet-1.png",
    "tests/fixtures/pet-2.png",
    "tests/fixtures/pet-3.png",
    "tests/fixtures/pet-4.png",
}

# Optional source files are permitted only at these reviewed paths. The demo
# paths are deliberately limited to a sanitized preview and demo recording.
OPTIONAL_FILES = {
    "editor/factory-data.js",
}

THEME_MEMBERS = {
    "claw.css",
    "claw.js",
    "pet-theme-config.js",
    "pet-heads.png",
    "README.md",
    "LICENSE",
    "THIRD_PARTY_NOTICES.md",
    "MEDIA.md",
    "licenses/Outfit-OFL.txt",
}

COPY_FROM_SOURCE = {
    "LICENSE": "LICENSE",
    "THIRD_PARTY_NOTICES.md": "THIRD_PARTY_NOTICES.md",
    "MEDIA.md": "MEDIA.md",
    "licenses/Outfit-OFL.txt": "licenses/Outfit-OFL.txt",
}

PRIVATE_NETWORKS = tuple(
    ipaddress.ip_network(value)
    for value in (
        "10." + "0.0.0/8",
        "172.16." + "0.0/12",
        "192.168." + "0.0/16",
        "169.254." + "0.0/16",
        "127." + "0.0.0/8",
        "100.64." + "0.0/10",
        "fc00" + ":" + ":/7",
        "fe80" + ":" + ":/10",
        ":" + ":1/128",
        ":" + ":/128",
    )
)

IP_CANDIDATE = re.compile(
    r"(?<![\w.])(?:\d{1,3}\.){3}\d{1,3}(?![\w.])"
    r"|(?<![\w:])(?:[0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}(?![\w:])"
)

SECRET_PATTERNS = (
    ("private key material", re.compile(rb"-----BEGIN (?:OPENSSH |RSA |EC |DSA )?PRIVATE KEY-----", re.I)),
    ("PGP private key material", re.compile(rb"-----BEGIN PGP PRIVATE KEY " rb"BLOCK-----", re.I)),
    ("AWS access key", re.compile(rb"\bAKIA[0-9A-Z]{16}\b")),
    ("GitHub token", re.compile(rb"\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b")),
    ("OpenAI or Stripe secret key", re.compile(rb"\b(?:sk-(?:proj-)?[A-Za-z0-9_-]{20,}|sk_(?:live|test)_[A-Za-z0-9]{16,})\b")),
    ("Slack token", re.compile(rb"\bxox[baprs]-[A-Za-z0-9-]{20,}\b")),
    ("Google API key", re.compile(rb"\bAIza[0-9A-Za-z_-]{35}\b")),
    ("bearer credential", re.compile(rb"(?i)\bBearer\s+[A-Za-z0-9._~+/=-]{24,}")),
    (
        "credential assignment",
        re.compile(
            rb"(?i)\b(?:api[_-]?key|access[_-]?token|refresh[_-]?token|client[_-]?secret|password)"
            rb"\s*[:=]\s*[\"']?[A-Za-z0-9._~+/=-]{12,}"
        ),
    ),
    ("URL credentials", re.compile(rb"(?i)https?://[^/\s:@]+:[^/\s@]{4,}@")),
    ("JWT-like token", re.compile(rb"\beyJ[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{8,}\b")),
)

IMAGE_SUFFIXES = {".avif", ".gif", ".jpeg", ".jpg", ".png", ".svg", ".webp"}
ALLOWED_IMAGE_FILES = {
    "samples/pet-heads.png",
    "demo/poster.png",
    "tests/fixtures/pet-1.png",
    "tests/fixtures/pet-2.png",
    "tests/fixtures/pet-3.png",
    "tests/fixtures/pet-4.png",
}
ICON_NAME = re.compile(
    r"(?i)(?:app[-_ ]?icon|logo|youtube|netflix|prime[-_ ]?video|apple[-_ ]?tv|disney|spotify|hulu)"
)
PLACEHOLDERS = (
    "<!--EDITOR_STYLE-->",
    "<!--FACTORY_DATA-->",
    "<!--FACTORY_SCRIPT-->",
    "<!--EDITOR_SCRIPT-->",
)


def source_allowlist(root: Path, theme_path: Path | None) -> tuple[set[str], set[str]]:
    allowed_files = REQUIRED_FILES | OPTIONAL_FILES
    if theme_path is not None:
        try:
            theme_relative = theme_path.absolute().relative_to(root.resolve()).as_posix()
        except ValueError:
            pass
        else:
            allowed_files.add(theme_relative)
    allowed_dirs = {"."}
    for relative in allowed_files:
        parent = PurePosixPath(relative).parent
        while parent.as_posix() not in (".", ""):
            allowed_dirs.add(parent.as_posix())
            parent = parent.parent
    return allowed_files, allowed_dirs


def is_private_ip(candidate: str) -> bool:
    try:
        address = ipaddress.ip_address(candidate)
    except ValueError:
        return False
    # The all-zero IPv6 unspecified address is a wildcard, not a household
    # device address; ignoring it avoids matching binary font/media padding.
    if address.version == 6 and address.is_unspecified:
        return False
    return any(address.version == network.version and address in network for network in PRIVATE_NETWORKS)


def user_path_patterns() -> tuple[re.Pattern[str], ...]:
    # Build the Unix prefixes from pieces so this checker does not flag its own
    # source when it scans every allowlisted public file.
    prefixes = (
        "/" + "Users" + "/",
        "/" + "home" + "/",
        "/" + "Volumes" + "/",
        "/" + "private" + "/",
    )
    patterns = [re.compile(re.escape(prefix) + r"[^/\s\"'<>]{3,}") for prefix in prefixes]
    patterns.append(re.compile(r"(?i)(?<![A-Za-z0-9])[A-Z]:\\Users\\[^\\\s\"'<>]{3,}"))
    patterns.append(re.compile(r"(?<!\w)~" + "/" + r"[^/\s\"'<>]{3,}/"))
    return tuple(patterns)


USER_PATH_PATTERNS = user_path_patterns()


def inspect_bytes(relative: str, payload: bytes, errors: list[str]) -> None:
    suffix = Path(relative).suffix.lower()
    if suffix in {".avif", ".gif", ".jpeg", ".jpg", ".mp4", ".png", ".ttf", ".webp"}:
        # Inspect readable strings in binary assets without treating compressed
        # media bytes as source text (which creates random IP/token matches).
        payload = b"\n".join(re.findall(rb"[\x20-\x7e]{4,}", payload))
    for label, pattern in SECRET_PATTERNS:
        if pattern.search(payload):
            errors.append(f"{relative}: possible {label} found")

    text = payload.decode("utf-8", errors="ignore")
    for match in IP_CANDIDATE.finditer(text):
        if is_private_ip(match.group(0)):
            errors.append(f"{relative}: household/private IP address found")
            break
    for pattern in USER_PATH_PATTERNS:
        if pattern.search(text):
            errors.append(f"{relative}: absolute user or mounted-volume path found")
            break


def check_source_tree(root: Path, theme_path: Path | None) -> tuple[list[str], int]:
    errors: list[str] = []
    allowed_files, allowed_dirs = source_allowlist(root, theme_path)
    seen_files: set[str] = set()

    if not root.is_dir():
        return [f"source root does not exist: {root}"], 0

    for path in sorted(root.rglob("*")):
        relative = path.relative_to(root).as_posix()
        # Working-copy Git metadata is never a distributable asset. Archives
        # are built from REQUIRED_FILES, not by copying the checkout directory.
        if relative == ".git" or relative.startswith(".git/"):
            continue
        if path.is_symlink():
            errors.append(f"{relative}: symlinks are not allowed in the public tree")
            continue
        if path.is_dir():
            if relative not in allowed_dirs:
                errors.append(f"{relative}/: directory is not allowlisted")
            continue
        if not path.is_file():
            errors.append(f"{relative}: unsupported filesystem entry")
            continue
        seen_files.add(relative)
        if relative not in allowed_files:
            errors.append(f"{relative}: file is not allowlisted")
            continue

        suffix = path.suffix.lower()
        if suffix in IMAGE_SUFFIXES:
            if relative not in ALLOWED_IMAGE_FILES:
                errors.append(f"{relative}: image asset is not an approved sample/demo path")
            if ICON_NAME.search(path.name):
                errors.append(f"{relative}: app or third-party logo/icon filename is not allowed")

        try:
            payload = path.read_bytes()
        except OSError as exc:
            errors.append(f"{relative}: could not read file ({exc})")
            continue
        if path.suffix.lower() == ".zip":
            # ZIP contents are inspected member-by-member by check_theme_zip.
            continue
        inspect_bytes(relative, payload, errors)

        if relative == "index.html":
            html = payload.decode("utf-8", errors="replace")
            if any(marker in html for marker in PLACEHOLDERS):
                errors.append("index.html: build placeholders remain in the release page")

    missing = REQUIRED_FILES - seen_files
    for relative in sorted(missing):
        errors.append(f"{relative}: required release file is missing")
    return errors, len(seen_files)


def check_theme_zip(archive_path: Path, root: Path) -> list[str]:
    errors: list[str] = []
    if not archive_path.is_file():
        return [f"theme ZIP does not exist: {archive_path}"]

    try:
        archive = zipfile.ZipFile(archive_path)
    except (OSError, zipfile.BadZipFile) as exc:
        return [f"theme ZIP could not be opened: {exc}"]

    with archive:
        infos = archive.infolist()
        names = [info.filename for info in infos]
        if len(names) != len(set(names)):
            errors.append("theme ZIP: duplicate member names found")

        actual = set(names)
        for name in sorted(THEME_MEMBERS - actual):
            errors.append(f"theme ZIP: required member {name!r} is missing")
        for name in sorted(actual - THEME_MEMBERS):
            errors.append(f"theme ZIP: unexpected member {name!r}; icons and unrelated files are not allowed")

        bad_member = archive.testzip()
        if bad_member is not None:
            errors.append(f"theme ZIP: CRC/integrity failure in {bad_member!r}")

        for info in infos:
            name = info.filename
            posix_name = PurePosixPath(name)
            if name.startswith("/") or "\\" in name or ".." in posix_name.parts:
                errors.append(f"theme ZIP: unsafe member path {name!r}")
            if name.endswith("/"):
                errors.append(f"theme ZIP: directory entries are not expected ({name!r})")
            mode = info.external_attr >> 16
            if stat.S_ISLNK(mode):
                errors.append(f"theme ZIP: symlink member is not allowed ({name!r})")
            if info.flag_bits & 0x1:
                errors.append(f"theme ZIP: encrypted member is not allowed ({name!r})")
            if ICON_NAME.search(PurePosixPath(name).name):
                errors.append(f"theme ZIP: icon/logo member name is not allowed ({name!r})")
            if name not in THEME_MEMBERS or name.endswith("/"):
                continue
            try:
                payload = archive.read(info)
            except (OSError, RuntimeError, zipfile.BadZipFile) as exc:
                errors.append(f"theme ZIP: could not read {name!r} ({exc})")
                continue
            inspect_bytes(f"theme ZIP:{name}", payload, errors)

            if name == "pet-heads.png" and not payload.startswith(b"\x89PNG\r\n\x1a\n"):
                errors.append("theme ZIP: pet-heads.png is not a PNG file")

            source_relative = COPY_FROM_SOURCE.get(name)
            if source_relative is not None:
                source_path = root / source_relative
                if source_path.is_file() and payload != source_path.read_bytes():
                    errors.append(f"theme ZIP: {name!r} differs from the public source notice")

    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT, help="public template root (defaults to this script's parent project)")
    parser.add_argument("--theme", type=Path, help="optional generated CleanYourTV theme ZIP to validate")
    args = parser.parse_args()

    root = args.root.resolve()
    theme_path = args.theme.expanduser().absolute() if args.theme is not None else None
    errors, file_count = check_source_tree(root, theme_path)
    if theme_path is not None:
        errors.extend(check_theme_zip(theme_path, root))

    if errors:
        for error in errors:
            print(f"FAIL {error}", file=sys.stderr)
        print(f"Release check failed: {len(errors)} issue(s), {file_count} public file(s) scanned.", file=sys.stderr)
        return 1

    print(f"PASS public source allowlist and hygiene checks ({file_count} files)")
    if theme_path is not None:
        print("PASS CleanYourTV theme ZIP manifest, notices, CRC and hygiene checks")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
