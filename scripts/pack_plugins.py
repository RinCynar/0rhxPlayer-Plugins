#!/usr/bin/env python3
import os
import json
import zipfile
import hashlib
import sys

def pack_directory_to_0px(source_dir, output_0px):
    source_dir = os.path.abspath(source_dir)
    output_0px = os.path.abspath(output_0px)
    os.makedirs(os.path.dirname(output_0px), exist_ok=True)
    
    print(f"[Pack] Packing {source_dir} -> {output_0px}")
    with zipfile.ZipFile(output_0px, 'w', compression=zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(source_dir):
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, source_dir).replace('\\', '/')
                zf.write(full_path, arcname=rel_path)
                print(f"  + Added: {rel_path}")

    # Validation
    validate_0px(output_0px)

def validate_0px(archive_path):
    print(f"[Validate] Validating {archive_path}...")
    if not os.path.exists(archive_path):
        raise FileNotFoundError(f"Archive not found: {archive_path}")
    
    with zipfile.ZipFile(archive_path, 'r') as zf:
        names = zf.namelist()
        if 'plugin.json' not in names:
            raise ValueError(f"Root plugin.json missing from {archive_path}! Archive entries: {names}")
        
        # Read and parse plugin.json
        with zf.open('plugin.json') as f:
            meta = json.loads(f.read().decode('utf-8'))
        
        required_fields = ['id', 'name', 'version', 'author', 'permissions']
        for field in required_fields:
            if field not in meta:
                raise ValueError(f"Missing required field '{field}' in {archive_path} plugin.json")
        
        # Check official prefix if rincynar
        pid = meta['id']
        print(f"  - ID: {pid}")
        print(f"  - Name: {meta['name']}")
        print(f"  - Version: {meta['version']}")
        print(f"  - Permissions: {len(meta['permissions'])} scopes declared")
        
        # Check referenced schema & icon if present
        entries = meta.get('entries', {})
        if 'sidebar' in entries and entries['sidebar'].get('schema'):
            schema_rel = entries['sidebar']['schema']
            if schema_rel not in names:
                raise ValueError(f"Referenced sidebar schema '{schema_rel}' missing from {archive_path}")
        
        # Ensure Deflate compression was used
        for info in zf.infolist():
            if info.compress_type != zipfile.ZIP_DEFLATED and info.compress_type != zipfile.ZIP_STORED:
                raise ValueError(f"Unsupported compression type {info.compress_type} for {info.filename}")

    size = os.path.getsize(archive_path)
    with open(archive_path, 'rb') as f:
        sha256 = hashlib.sha256(f.read()).hexdigest()
    print(f"  [OK] Valid archive: size={size} bytes, sha256={sha256[:16]}...")

if __name__ == '__main__':
    target = sys.argv[1] if len(sys.argv) > 1 else 'all'
    
    if target in ('all', 'gunmu'):
        pack_directory_to_0px('packages/gunmu', 'Test/gunmu.0px')
    if target in ('all', 'converter'):
        pack_directory_to_0px('packages/converter', 'Tools/Converter.0px')
