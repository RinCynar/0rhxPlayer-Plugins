---
{
  "version": 1,
  "plugins": [
    {
      "id": "top.rincynar.plugin.gunmu",
      "name": "Gunmu",
      "version": "1.0.0",
      "author": "RinCynar",
      "description": "Official reference implementation demonstrating all host APIs, view slots, hooks, and event bus integrations.",
      "category": "Test",
      "path": "Test/gunmu.0px",
      "size": 7189,
      "sha256": "9e66b41884ab9e2ffe3ed24e166bc5d5a7ac1742a94fc1a7847a9fbbf7592593",
      "$schema": "https://raw.githubusercontent.com/RinCynar/0rhxPlayer-Plugins/main/schema/v1/plugin.schema.json",
      "homepage": "https://github.com/RinCynar/0rhxPlayer-Plugins",
      "minAppVersion": "1.1.1",
      "permissions": [
        "audio:control",
        "audio:state",
        "library:read",
        "library:write",
        "lyrics:read",
        "lyrics:write",
        "ui:slot:menu",
        "ui:slot:sidebar",
        "ui:slot:bottombar",
        "network:fetch"
      ],
      "entries": {
        "sidebar": {
          "enabled": true,
          "title": "Gunmu",
          "icon": "assets/icon.svg",
          "schema": "views/workbench.json"
        },
        "contextMenu": {
          "track": {
            "enabled": true,
            "id": "gunmu_track_action",
            "title": "Gunmu: Track Action",
            "icon": "assets/icon.svg"
          },
          "album": {
            "enabled": true,
            "id": "gunmu_album_action",
            "title": "Gunmu: Album Action",
            "icon": "assets/icon.svg"
          },
          "playlist": {
            "enabled": true,
            "id": "gunmu_playlist_action",
            "title": "Gunmu: Playlist Action",
            "icon": "assets/icon.svg"
          }
        },
        "playbackControl": {
          "enabled": true,
          "id": "gunmu_player_action",
          "title": "Gunmu Action",
          "icon": "assets/icon.svg"
        }
      },
      "hooks": {
        "search": true,
        "mediaSource": false,
        "lyricsProvider": true
      }
    },
    {
      "id": "top.rincynar.converter",
      "name": "Audio Converter",
      "version": "1.0.0",
      "author": "RinCynar",
      "description": "Universal high-fidelity audio transcoder supporting MP3, WAV, FLAC, AAC, Opus, and OGG with full parameter controls.",
      "category": "Tools",
      "path": "Tools/Converter.0px",
      "size": 7364,
      "sha256": "b7a73eecaacbfb5d03b6463e90b6b8e69c02e284f3c11c3722bdd2caff6430d0",
      "$schema": "https://raw.githubusercontent.com/RinCynar/0rhxPlayer-Plugins/main/schema/v1/plugin.schema.json",
      "homepage": "https://github.com/RinCynar/0rhxPlayer-Plugins",
      "minAppVersion": "1.1.1",
      "permissions": [
        "audio:state",
        "library:read",
        "ui:slot:menu",
        "ui:slot:sidebar"
      ],
      "entries": {
        "sidebar": {
          "enabled": true,
          "title": "Audio Converter",
          "icon": "assets/icon.svg",
          "schema": "views/workbench.json"
        },
        "contextMenu": {
          "track": {
            "enabled": true,
            "id": "add_to_convert_queue",
            "title": "Add to Convert Queue",
            "icon": "assets/icon.svg"
          }
        }
      },
      "hooks": {
        "search": false,
        "mediaSource": false,
        "lyricsProvider": false
      }
    }
  ]
}
---

# 0rhxPlayer Plugin Index

> 自动维护的 0rhxPlayer 插件官方源索引，请勿手动编辑此文件。

## Test

| 插件名称 | ID | 版本 | 作者 | 描述 | 下载 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Gunmu** | `top.rincynar.plugin.gunmu` | `1.0.0` | RinCynar | Official reference implementation demonstrating all host APIs, view slots, hooks, and event bus integrations. | [下载](Test/gunmu.0px) |

## Tools

| 插件名称 | ID | 版本 | 作者 | 描述 | 下载 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Audio Converter** | `top.rincynar.converter` | `1.0.0` | RinCynar | Universal high-fidelity audio transcoder supporting MP3, WAV, FLAC, AAC, Opus, and OGG with full parameter controls. | [下载](Tools/Converter.0px) |

