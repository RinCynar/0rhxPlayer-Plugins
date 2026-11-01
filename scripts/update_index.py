#!/usr/bin/env python3
import os
import json
import zipfile
import hashlib

EXCLUDE_DIRS = {'.git', '.github', 'doc', 'docs', 'assets', 'packages', 'scripts'}
plugins_by_category = {}

for root, dirs, files in os.walk('.'):
    # 剪枝忽略目录
    dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS and not d.startswith('.')]
    for file in files:
        if file.endswith('.0px'):
            rel_path = os.path.relpath(os.path.join(root, file), '.')
            category = os.path.dirname(rel_path)
            if not category or category == '.':
                category = 'Uncategorized'
            
            file_size = os.path.getsize(rel_path)
            with open(rel_path, 'rb') as f:
                sha256 = hashlib.sha256(f.read()).hexdigest()

            meta = {
                "id": os.path.splitext(file)[0],
                "name": os.path.splitext(file)[0],
                "version": "1.0.0",
                "author": "Unknown",
                "description": "No description provided.",
                "category": category,
                "path": rel_path.replace('\\', '/'),
                "size": file_size,
                "sha256": sha256
            }

            # 尝试提取 zip 包内的 plugin.json
            try:
                with zipfile.ZipFile(rel_path, 'r') as z:
                    if 'plugin.json' in z.namelist():
                        with z.open('plugin.json') as jf:
                            jdata = json.loads(jf.read().decode('utf-8'))
                            meta.update(jdata)
                            meta['path'] = rel_path.replace('\\', '/')
                            meta['size'] = file_size
                            meta['sha256'] = sha256
                            meta['category'] = category
            except Exception as e:
                print(f"Warning: Failed to read plugin.json from {rel_path}: {e}")

            plugins_by_category.setdefault(category, []).append(meta)

# 写入 index.md 前置 YAML 元数据块 方便 0P 解析
all_plugins = []
for cat in sorted(plugins_by_category.keys()):
    all_plugins.extend(plugins_by_category[cat])

with open('index.md', 'w', encoding='utf-8') as f:
    f.write('---\n')
    f.write(json.dumps({"version": 1, "plugins": all_plugins}, ensure_ascii=False, indent=2))
    f.write('\n---\n\n')
    f.write('# 0rhxPlayer Plugin Index\n\n')
    f.write('> 自动维护的 0rhxPlayer 插件官方源索引，请勿手动编辑此文件。\n\n')
    for cat in sorted(plugins_by_category.keys()):
        f.write(f'## {cat}\n\n')
        f.write('| 插件名称 | ID | 版本 | 作者 | 描述 | 下载 |\n')
        f.write('| :--- | :--- | :--- | :--- | :--- | :--- |\n')
        for p in plugins_by_category[cat]:
            f.write(f"| **{p.get('name')}** | `{p.get('id')}` | `{p.get('version')}` | {p.get('author')} | {p.get('description')} | [下载]({p.get('path')}) |\n")
        f.write('\n')

print(f"Generated index.md with {len(all_plugins)} plugins.")
