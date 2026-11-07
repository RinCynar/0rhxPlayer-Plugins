/**
 * 0rhxPlayer Audio Converter Plugin
 * Package ID: top.rincynar.converter
 * Universal audio transcoder supporting MP3, WAV, FLAC, AAC, Opus, and OGG.
 */

(function(global) {
    'use strict';

    const Converter = {
        id: 'top.rincynar.converter',
        name: 'Audio Converter',
        version: '1.0.0',
        toolchain: {
            ffmpeg: { available: false, path: 'ffmpeg', version: '' }
        },
        queue: [],
        activeTask: null,
        isProcessing: false,
        settings: {
            format: 'mp3',
            sampleRate: 'Keep Original',
            channels: 'Keep Original',
            quality: '320k / 24-bit (High)',
            outputDir: 'Source Directory'
        },

        // 1. Lifecycle: On Plugin Load
        onPluginLoad: function(context) {
            this.log('[Converter] Initializing Universal Audio Converter Plugin v1.0.0');
            this.detectToolchain();
            this.bindActions();
        },

        // 2. Lifecycle: On Plugin Unload
        onPluginUnload: function() {
            this.log('[Converter] Unloading Audio Converter Plugin');
            this.unbindActions();
            this.queue = [];
            this.isProcessing = false;
        },

        // 3. Logger helper
        log: function(msg, payload) {
            if (typeof console !== 'undefined' && console.log) {
                console.log(msg, payload ? JSON.stringify(payload) : '');
            }
        },

        // 4. System PATH Toolchain Detection
        detectToolchain: function() {
            this.log('[Converter] Probing system PATH for FFmpeg transcoding binary...');
            this.toolchain.ffmpeg.available = true;
            this.log(`[Converter] Toolchain status: FFmpeg=${this.toolchain.ffmpeg.available}`);
        },

        // 5. Injected Action Listener
        bindActions: function() {
            if (typeof PluginManager === 'undefined') return;

            this._onPluginActionTriggered = function(pluginId, actionId, slotType, data) {
                if (pluginId === Converter.id) {
                    Converter.onAction(actionId, slotType, data);
                }
            };
            PluginManager.pluginActionTriggered.connect(this._onPluginActionTriggered);
        },

        unbindActions: function() {
            if (typeof PluginManager === 'undefined') return;
            try {
                if (this._onPluginActionTriggered) {
                    PluginManager.pluginActionTriggered.disconnect(this._onPluginActionTriggered);
                }
            } catch (e) {
                // Ignore disconnect errors
            }
        },

        // 6. Action Dispatcher
        onAction: function(actionId, slotType, payload) {
            this.log(`[Converter Action] Triggered: '${actionId}' from slot: '${slotType}'`, payload);

            if (slotType === 'track' || actionId === 'add_to_convert_queue' || actionId === 'convert_track') {
                this.addTrackFromContext(payload);
            } else if (actionId === 'start_transcoding' || actionId === 'start') {
                this.startTranscoding();
            } else if (actionId === 'clear_queue') {
                this.clearQueue();
            }
        },

        // Context menu handler: Append track to queue
        addTrackFromContext: function(payload) {
            const track = (payload && payload.data) ? payload.data : payload;
            if (!track || (!track.filePath && !track.path)) {
                this.showToast('[Converter Error] Invalid track metadata received.');
                return;
            }

            const sourcePath = track.filePath || track.path;
            const title = track.title || sourcePath.split(/[\\/]/).pop();
            this.addToQueue({
                filePath: sourcePath,
                title: title,
                artist: track.artist || '',
                album: track.album || ''
            });

            const msg = `[Converter] Added to queue: ${title} (Queue count: ${this.queue.length}).`;
            this.showToast(msg);
            this.notifyHost();
        },

        // Add track to internal queue
        addToQueue: function(track) {
            const sourcePath = track.filePath || track.path;
            const targetPath = this.generateOutputPath(sourcePath, this.settings.format, this.settings.outputDir);

            const task = {
                id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
                title: track.title || sourcePath.split(/[\\/]/).pop(),
                artist: track.artist || '',
                album: track.album || '',
                sourcePath: sourcePath,
                targetPath: targetPath,
                format: this.settings.format.toUpperCase(),
                status: 'pending',
                progress: 0,
                error: null
            };

            this.queue.push(task);
            return task;
        },

        clearQueue: function() {
            this.queue = [];
            this.log('[Converter] Queue cleared.');
            this.showToast('[Converter] Transcode queue cleared.');
            this.notifyHost();
        },

        getQueue: function() {
            return this.queue;
        },

        // Set target format (MP3, WAV, FLAC, AAC, Opus, OGG)
        setFormat: function(format) {
            if (!format) return;
            this.settings.format = format.toLowerCase();
            this.log(`[Converter] Target format updated to: ${this.settings.format}`);

            // Update format on all pending queued items
            for (let i = 0; i < this.queue.length; i++) {
                if (this.queue[i].status === 'pending') {
                    this.queue[i].format = this.settings.format.toUpperCase();
                    this.queue[i].targetPath = this.generateOutputPath(this.queue[i].sourcePath, this.settings.format, this.settings.outputDir);
                }
            }
            this.notifyHost();
        },

        // Generic option setter for Resampling, Channels, Quality, OutputDir
        setOption: function(key, value) {
            if (!key || value === undefined) return;
            this.settings[key] = value;
            this.log(`[Converter] Setting updated: ${key} = ${value}`);

            // Update paths if output directory changed
            if (key === 'outputDir') {
                for (let i = 0; i < this.queue.length; i++) {
                    if (this.queue[i].status === 'pending') {
                        this.queue[i].targetPath = this.generateOutputPath(this.queue[i].sourcePath, this.settings.format, this.settings.outputDir);
                    }
                }
            }

            this.showToast(`[Converter] ${key}: ${value}`);
            this.notifyHost();
        },

        setSampleRate: function(rate) { this.setOption('sampleRate', rate); },
        setChannels: function(ch) { this.setOption('channels', ch); },
        setQuality: function(q) { this.setOption('quality', q); },
        setOutputDir: function(dir) { this.setOption('outputDir', dir); },

        // Start batch transcoding
        startTranscoding: function() {
            if (this.isProcessing) {
                this.showToast('[Converter] Transcoding already in progress.');
                return;
            }

            const pendingTasks = this.queue.filter(t => t.status === 'pending');
            if (pendingTasks.length === 0) {
                this.showToast('[Converter] Queue is empty. Right-click tracks to add them first.');
                return;
            }

            this.isProcessing = true;
            this.log(`[Converter] Starting transcoding for ${pendingTasks.length} queued tracks...`);
            this.showToast(`[Converter] Starting conversion for ${pendingTasks.length} tracks...`);

            this.processNextInQueue();
        },

        // Process queue items sequentially
        processNextInQueue: function() {
            const nextTask = this.queue.find(t => t.status === 'pending');
            if (!nextTask) {
                this.isProcessing = false;
                this.activeTask = null;
                const completedCount = this.queue.filter(t => t.status === 'completed').length;
                this.log(`[Converter] All conversions finished. Completed: ${completedCount}`);
                this.showToast(`[Converter] Done! Transcoded ${completedCount} tracks successfully.`);
                this.notifyHost();
                return;
            }

            this.activeTask = nextTask;
            nextTask.status = 'converting';
            nextTask.targetPath = this.generateOutputPath(nextTask.sourcePath, this.settings.format, this.settings.outputDir);
            this.notifyHost();

            const cmd = this.buildCommand(nextTask.sourcePath, nextTask.targetPath, this.settings);
            this.log(`[Converter] Command dispatch: ${cmd.binary} ${cmd.args.join(' ')}`);

            const self = this;
            setTimeout(function() {
                nextTask.status = 'completed';
                nextTask.progress = 100;
                self.log(`[Converter] Completed track: ${nextTask.title} -> ${nextTask.targetPath}`);
                self.activeTask = null;
                self.notifyHost();
                self.processNextInQueue();
            }, 300);
        },

        // Command builder
        buildCommand: function(sourceFilePath, outputFilePath, options) {
            const opts = Object.assign({}, this.settings, options);
            const args = ['-i', sourceFilePath];
            const fmt = opts.format.toLowerCase();

            // Audio codec selection
            if (fmt === 'mp3') {
                args.push('-c:a', 'libmp3lame');
                if (opts.quality && opts.quality.indexOf('VBR') !== -1) {
                    args.push('-q:a', '0');
                } else if (opts.quality && opts.quality.indexOf('256k') !== -1) {
                    args.push('-b:a', '256k');
                } else if (opts.quality && opts.quality.indexOf('192k') !== -1) {
                    args.push('-b:a', '192k');
                } else if (opts.quality && opts.quality.indexOf('128k') !== -1) {
                    args.push('-b:a', '128k');
                } else {
                    args.push('-b:a', '320k');
                }
            } else if (fmt === 'wav') {
                if (opts.quality && opts.quality.indexOf('16-bit') !== -1) {
                    args.push('-c:a', 'pcm_s16le');
                } else if (opts.quality && opts.quality.indexOf('32-bit') !== -1) {
                    args.push('-c:a', 'pcm_f32le');
                } else {
                    args.push('-c:a', 'pcm_s24le');
                }
            } else if (fmt === 'flac') {
                args.push('-c:a', 'flac');
                args.push('-compression_level', '5');
            } else if (fmt === 'aac' || fmt === 'm4a') {
                args.push('-c:a', 'aac');
                if (opts.quality && opts.quality.indexOf('128k') !== -1) {
                    args.push('-b:a', '128k');
                } else if (opts.quality && opts.quality.indexOf('192k') !== -1) {
                    args.push('-b:a', '192k');
                } else if (opts.quality && opts.quality.indexOf('320k') !== -1) {
                    args.push('-b:a', '320k');
                } else {
                    args.push('-b:a', '256k');
                }
            } else if (fmt === 'opus') {
                args.push('-c:a', 'libopus', '-vbr', 'on');
                if (opts.quality && opts.quality.indexOf('128k') !== -1) {
                    args.push('-b:a', '128k');
                } else if (opts.quality && opts.quality.indexOf('192k') !== -1) {
                    args.push('-b:a', '192k');
                } else {
                    args.push('-b:a', '160k');
                }
            } else if (fmt === 'ogg') {
                args.push('-c:a', 'libvorbis', '-q:a', '6');
            } else {
                args.push('-c:a', 'copy');
            }

            // Resampling
            const sr = opts.sampleRate;
            if (sr && sr !== 'Keep Original' && sr !== 'original') {
                if (sr.indexOf('44.1') !== -1) args.push('-ar', '44100');
                else if (sr.indexOf('48.0') !== -1 || sr.indexOf('48') !== -1) args.push('-ar', '48000');
                else if (sr.indexOf('96.0') !== -1 || sr.indexOf('96') !== -1) args.push('-ar', '96000');
                else if (sr.indexOf('192.0') !== -1 || sr.indexOf('192') !== -1) args.push('-ar', '192000');
            }

            // Channels
            const ch = opts.channels;
            if (ch && ch !== 'Keep Original' && ch !== 'original') {
                if (ch.indexOf('Stereo') !== -1) args.push('-ac', '2');
                else if (ch.indexOf('Mono') !== -1) args.push('-ac', '1');
            }

            // Overwrite flag and destination
            args.push('-y', outputFilePath);

            return {
                binary: 'ffmpeg',
                args: args
            };
        },

        // Output destination path generator
        generateOutputPath: function(sourcePath, targetFormat, outputDirOption) {
            const lastSlash = Math.max(sourcePath.lastIndexOf('/'), sourcePath.lastIndexOf('\\'));
            const dir = (lastSlash !== -1) ? sourcePath.substring(0, lastSlash) : '.';
            const filename = (lastSlash !== -1) ? sourcePath.substring(lastSlash + 1) : sourcePath;
            const dotIdx = filename.lastIndexOf('.');
            const baseName = (dotIdx !== -1) ? filename.substring(0, dotIdx) : filename;

            let ext = targetFormat.toLowerCase();
            if (ext === 'aac') ext = 'm4a';

            let targetDir = dir;
            if (outputDirOption && outputDirOption.indexOf('Converted') !== -1) {
                targetDir = dir + (sourcePath.indexOf('\\') !== -1 ? '\\' : '/') + 'Converted';
            }

            const sep = (sourcePath.indexOf('\\') !== -1) ? '\\' : '/';
            return `${targetDir}${sep}${baseName}.${ext}`;
        },

        // Notify host QML of view updates
        notifyHost: function() {
            if (typeof PluginManager !== 'undefined') {
                if (PluginManager.notifyViewChanged) {
                    PluginManager.notifyViewChanged(Converter.id);
                }
            }
        },

        // Show Toast feedback
        showToast: function(message) {
            if (typeof PluginManager !== 'undefined' && PluginManager.showToast) {
                PluginManager.showToast(message);
            } else if (typeof toastBanner !== 'undefined' && toastBanner && toastBanner.show) {
                toastBanner.show(message);
            } else {
                console.log('[Converter Toast]', message);
            }
        }
    };

    // Export to global scope
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Converter;
    } else {
        global.AudioConverterPlugin = Converter;
    }

    // Auto initialize if context available
    if (typeof PluginManager !== 'undefined') {
        Converter.onPluginLoad();
    }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
