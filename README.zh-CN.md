# 0rhxPlayer 插件官方仓库

[English](README.md) | [日本語](README.ja.md) | [简体中文](README.zh-CN.md)

[![开发者指南](https://img.shields.io/badge/开发文档-API%20全量规范-blue?style=flat-square&logo=gitbook)](doc/DEVELOPER_GUIDE.md)

**0rhxPlayer (0P)** 官方跨平台插件分发与索引仓库。

本仓库通过 GitHub Actions 自动化维护全部可用插件的 `index.md` 索引文件，供 0rhxPlayer 桌面客户端内置的「Plugins（插件）」市场实时解析、检索与一键安装。

---

## 插件分类目录结构

仓库内的插件按功能领域进行目录归类：

```
0rhxPlayer-Plugins/
├── .github/workflows/
│   └── update-index.yml       # 索引自动化维护工作流
├── NetService/                # 云音乐与在线流媒体协议源（网易云、Subsonic、WebDAV 等）
├── Lyrics/                    # 在线歌词与逐字时间戳抓取插件
├── Metadata/                  # 封面提取与音频标签元数据增强
├── DSP/                       # 原生音频音效处理（混响、动态压缩）
├── Tools/                     # 实用工具与音频转换插件
│   └── Converter.0px          # 专业高保真音频转码插件
├── Test/                      # 参考示例与调试验证插件
│   └── gunmu.0px              # 官方全能力参考示例插件
├── doc/                       # 开发者规范与 API 参考文档（CI 自动忽略）
│   └── DEVELOPER_GUIDE.md     # 三语完全等价的开发者规范手册
├── index.md                   # 自动生成的聚合索引清单（客户端拉取目标）
└── README.md
```

---

## 插件体系设计规范

0rhxPlayer 坚持**“原生无 WebView、渲染权归宿主”**的轻量化哲学：

1. **渲染权全归宿主**：严禁内嵌任何 WebView 或自行在底层绘图。插件仅向宿主提供标准结构化数据声明（Schema / Model），界面 100% 由 0P 原生 Material 3 QML 控件统一渲染呈现。
2. **侧边栏槽位严格受控**：一个插件最多声明 **1 个** 侧边栏专属页面，并完全接入 0P 原生侧边栏管理器的隐藏、排序与自定义系统。
3. **全局 Hook 能力**：插件可声明全局媒体源劫持（如云音乐模式），直接将云端流异步填入各个原生页面中，本机零本地文件也能饱满运行。
4. **包格式（`.0px`）**：标准 ZIP 归档格式，解压后根目录下必须包含 `plugin.json`（元数据清单）与 `main.js`（执行入口）。

---

## 插件开发指南

关于完整的 API 定义、可用权限列表、事件总线与数据交互协议，请查阅开发者规范手册：

[![打开开发者指南](https://img.shields.io/badge/📖%20查看-开发者指南与%20API%20规范文档-2ea44f?style=for-the-badge)](doc/DEVELOPER_GUIDE.md)

完整手册提供英文、日本語与简体中文三语 100% 等价对照，详见 [doc/DEVELOPER_GUIDE.md](doc/DEVELOPER_GUIDE.md)。

---

## 提交插件至官方源

1. Fork 本仓库；
2. 将打包好的 `.0px` 放入对应的功能分类目录下（如 `NetService/CloudNetease_1.0.0.0px`）；
3. 提交 Pull Request，CI 将自动进行元数据校验与 SHA256 哈希固化；
4. PR 合并后，全网 0rhxPlayer 客户端将在数分钟内自动同步刷新新插件。
