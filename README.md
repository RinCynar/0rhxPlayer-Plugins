# 0rhxPlayer Plugins Repository

[English](README.md) | [日本語](README.ja.md) | [简体中文](README.zh-CN.md)

Official plugin repository and catalog for **0rhxPlayer (0P)**.

This repository automatically maintains an `index.md` catalog via GitHub Actions. The built-in **Plugins** marketplace inside the 0rhxPlayer desktop application parses this index to deliver live search, categorized browsing, and one-click installation.

---

## Repository Structure

Plugins are organized into functional category directories:

---

0rhxPlayer-Plugin/
├── .github/workflows/
│   └── update-index.yml       # Automated catalog indexing workflow
├── NetService/                # Cloud music & online media sources (Netease, Subsonic, WebDAV, etc.)
├── Lyrics/                    # Online synced/word-by-word lyrics providers
├── Metadata/                  # Cover art fetching and tag enrichment
├── DSP/                       # Native DSP effects (reverb, dynamic range compression)
├── Test/                      # Placeholder & debugging verification plugins
│   └── gunmu.0px              # Minimal functional verification package
├── doc/                       # Developer guidelines & API reference (ignored by CI catalog)
├── index.md                   # Auto-generated aggregated index manifest
└── README.md

---

## Plugin Architecture & Philosophy

0rhxPlayer adheres strictly to a **Native Material 3 UI / Zero-WebView** design principle:

1. **Host-Rendered UI**: Plugins must never embed WebViews or perform arbitrary canvas drawing. Plugins provide pure structured data schemas; all views are rendered natively by 0rhxPlayer's Qt/QML Material 3 engine.
2. **Sidebar Slot Constraint**: A plugin may declare at most **one** dedicated sidebar entry. This entry is fully managed by 0P's native sidebar layout, sorting, and visibility settings.
3. **Global Hooking**: Plugins can hook into global search, recommendations, and playback pipelines without requiring a sidebar item (e.g., transforming 0P into a cloud-streamed player with zero local music files).
4. **Package Format (`.0px`)**: A standard ZIP archive containing at least `plugin.json` (metadata manifest) and `main.js` (execution entry) in its root directory.

---

## Developing a Plugin

For detailed API specifications, supported permission scopes, data schemas, and lifecycle hooks, please refer to the [Developer Guide & API Documentation](doc/DEVELOPER_GUIDE.md).

---

## Submitting a Plugin to the Official Index

1. Fork this repository.
2. Place your packaged `.0px` file into its appropriate category directory (e.g., `NetService/CloudNetease_1.0.0.0px`).
3. Open a Pull Request. GitHub Actions will automatically validate the package manifest and compute SHA256 checksums.
4. Once merged, the plugin will become discoverable in all 0rhxPlayer clients within minutes.

---

## License

Unless otherwise stated within individual plugin manifests, the repository infrastructure, documentation, and indexing scripts are licensed under the MIT License.---

## Plugin Architecture & Philosophy

0rhxPlayer adheres strictly to a **Native Material 3 UI / Zero-WebView** design principle:

1. **Host-Rendered UI**: Plugins must never embed WebViews or perform arbitrary canvas drawing. Plugins provide pure structured data schemas; all views are rendered natively by 0rhxPlayer's Qt/QML Material 3 engine.
2. **Sidebar Slot Constraint**: A plugin may declare at most **one** dedicated sidebar entry. This entry is fully managed by 0P's native sidebar layout, sorting, and visibility settings.
3. **Global Hooking**: Plugins can hook into global search, recommendations, and playback pipelines without requiring a sidebar item (e.g., transforming 0P into a cloud-streamed player with zero local music files).
4. **Package Format (`.0px`)**: A standard ZIP archive containing at least `plugin.json` (metadata manifest) and `main.js` (execution entry) in its root directory.

---

## Developing a Plugin

For detailed API specifications, supported permission scopes, data schemas, and lifecycle hooks, please refer to the [Developer Guide & API Documentation](doc/DEVELOPER_GUIDE.md).

---

## Submitting a Plugin to the Official Index

1. Fork this repository.
2. Place your packaged `.0px` file into its appropriate category directory (e.g., `NetService/CloudNetease_1.0.0.0px`).
3. Open a Pull Request. GitHub Actions will automatically validate the package manifest and compute SHA256 checksums.
4. Once merged, the plugin will become discoverable in all 0rhxPlayer clients within minutes.

---

## License

Unless otherwise stated within individual plugin manifests, the repository infrastructure, documentation, and indexing scripts are licensed under the MIT License.