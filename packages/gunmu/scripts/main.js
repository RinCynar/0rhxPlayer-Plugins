/**
 * 0rhxPlayer Gunmu Reference Plugin
 * Package ID: top.rincynar.plugin.gunmu
 * Official full-capability reference implementation for 0rhxPlayer developers.
 */

(function(global) {
    'use strict';

    const Gunmu = {
        id: 'top.rincynar.plugin.gunmu',
        name: 'Gunmu',
        version: '1.0.0',
        state: {
            loaded: false,
            lastEvent: null,
            logs: []
        },

        // 1. Lifecycle: On Plugin Load
        onPluginLoad: function(context) {
            this.state.loaded = true;
            this.log('[Gunmu] Initializing Gunmu Reference Plugin v1.0.0');
            this.bindLifecycleSignals();
            this.log('[Gunmu] All lifecycle signal listeners successfully bound.');
        },

        // 2. Lifecycle: On Plugin Unload
        onPluginUnload: function() {
            this.log('[Gunmu] Unloading Gunmu Reference Plugin');
            this.unbindLifecycleSignals();
            this.state.loaded = false;
        },

        // 3. Logger helper
        log: function(msg, payload) {
            const entry = {
                timestamp: new Date().toISOString(),
                message: msg,
                payload: payload || null
            };
            this.state.logs.push(entry);
            this.state.lastEvent = entry;
            if (typeof console !== 'undefined' && console.log) {
                console.log(msg, payload ? JSON.stringify(payload) : '');
            }
        },

        // 4. Bind Host Event Bus Signals
        bindLifecycleSignals: function() {
            if (typeof PluginManager === 'undefined') return;

            // Playback state changes (0: Stopped, 1: Playing, 2: Paused)
            this._onPlaybackStateChanged = function(state) {
                const stateNames = ['Stopped', 'Playing', 'Paused'];
                Gunmu.log(`[EventBus] playbackStateChanged: ${stateNames[state] || state}`);
            };
            PluginManager.playbackStateChanged.connect(this._onPlaybackStateChanged);

            // Playback position changes (positionMs, durationMs)
            this._onPositionChanged = function(positionMs, durationMs) {
                Gunmu.state.lastPosition = { positionMs: positionMs, durationMs: durationMs };
            };
            PluginManager.positionChanged.connect(this._onPositionChanged);

            // Active track changes
            this._onTrackChanged = function(trackInfo) {
                Gunmu.log(`[EventBus] trackChanged: ${trackInfo ? (trackInfo.title || trackInfo.filePath) : 'None'}`, trackInfo);
            };
            PluginManager.trackChanged.connect(this._onTrackChanged);

            // Volume changes
            this._onVolumeChanged = function(volume) {
                Gunmu.log(`[EventBus] volumeChanged: ${(volume * 100).toFixed(0)}%`);
            };
            PluginManager.volumeChanged.connect(this._onVolumeChanged);

            // Play mode changes (0: RepeatAll, 1: RepeatOne, 2: Shuffle, 3: Sequential)
            this._onPlayModeChanged = function(mode) {
                const modeNames = ['RepeatAll', 'RepeatOne', 'Shuffle', 'Sequential'];
                Gunmu.log(`[EventBus] playModeChanged: ${modeNames[mode] || mode}`);
            };
            PluginManager.playModeChanged.connect(this._onPlayModeChanged);

            // Equalizer state changes
            this._onEqChanged = function() {
                Gunmu.log('[EventBus] eqChanged: Equalizer DSP configuration updated');
            };
            PluginManager.eqChanged.connect(this._onEqChanged);

            // Queue changes
            this._onQueueChanged = function() {
                Gunmu.log('[EventBus] queueChanged: Playback queue structure updated');
            };
            PluginManager.queueChanged.connect(this._onQueueChanged);

            // Media library changes
            this._onLibraryChanged = function() {
                Gunmu.log('[EventBus] libraryChanged: Local media library updated');
            };
            PluginManager.libraryChanged.connect(this._onLibraryChanged);

            // Favorite toggled
            this._onFavoritesChanged = function(trackPath, isFavorite) {
                Gunmu.log(`[EventBus] favoritesChanged: ${trackPath} -> ${isFavorite ? 'Favorited' : 'Unfavorited'}`);
            };
            PluginManager.favoritesChanged.connect(this._onFavoritesChanged);

            // Playlists updated
            this._onPlaylistsChanged = function() {
                Gunmu.log('[EventBus] playlistsChanged: User playlists collection updated');
            };
            PluginManager.playlistsChanged.connect(this._onPlaylistsChanged);

            // Lyrics updated
            this._onLyricsChanged = function() {
                Gunmu.log('[EventBus] lyricsChanged: Lyrics model or line index updated');
            };
            PluginManager.lyricsChanged.connect(this._onLyricsChanged);

            // Injected Action Triggered (Right click menus / Bottom player bar)
            this._onPluginActionTriggered = function(pluginId, actionId, slotType, data) {
                if (pluginId === Gunmu.id) {
                    Gunmu.onAction(actionId, slotType, data);
                }
            };
            PluginManager.pluginActionTriggered.connect(this._onPluginActionTriggered);
        },

        // Unbind signals
        unbindLifecycleSignals: function() {
            if (typeof PluginManager === 'undefined') return;
            try {
                if (this._onPlaybackStateChanged) PluginManager.playbackStateChanged.disconnect(this._onPlaybackStateChanged);
                if (this._onPositionChanged) PluginManager.positionChanged.disconnect(this._onPositionChanged);
                if (this._onTrackChanged) PluginManager.trackChanged.disconnect(this._onTrackChanged);
                if (this._onVolumeChanged) PluginManager.volumeChanged.disconnect(this._onVolumeChanged);
                if (this._onPlayModeChanged) PluginManager.playModeChanged.disconnect(this._onPlayModeChanged);
                if (this._onEqChanged) PluginManager.eqChanged.disconnect(this._onEqChanged);
                if (this._onQueueChanged) PluginManager.queueChanged.disconnect(this._onQueueChanged);
                if (this._onLibraryChanged) PluginManager.libraryChanged.disconnect(this._onLibraryChanged);
                if (this._onFavoritesChanged) PluginManager.favoritesChanged.disconnect(this._onFavoritesChanged);
                if (this._onPlaylistsChanged) PluginManager.playlistsChanged.disconnect(this._onPlaylistsChanged);
                if (this._onLyricsChanged) PluginManager.lyricsChanged.disconnect(this._onLyricsChanged);
                if (this._onPluginActionTriggered) PluginManager.pluginActionTriggered.disconnect(this._onPluginActionTriggered);
            } catch (e) {
                // Ignore disconnect errors during teardown
            }
        },

        // 5. Injected Action Handler
        onAction: function(actionId, slotType, payload) {
            this.log(`[Gunmu Action] Triggered action '${actionId}' from slot '${slotType}'`, payload);
            const targetName = (payload && (payload.title || payload.filePath || payload.albumName || payload.playlistId)) || actionId;
            const message = `[Gunmu] Verified action: ${actionId} (Slot: ${slotType}) - ${targetName}`;
            this.showToast(message);
        },

        // Show Toast feedback via host UI or console
        showToast: function(message) {
            if (typeof toastBanner !== 'undefined' && toastBanner && toastBanner.show) {
                toastBanner.show(message);
            } else if (typeof window !== 'undefined' && window.toastBanner && window.toastBanner.show) {
                window.toastBanner.show(message);
            } else {
                console.log('[Gunmu Toast]', message);
            }
        },

        // 6. Capability Demonstrators: Audio Playback & Transport Control
        audio: {
            play: function(path) { PluginManager.play(path || ''); },
            pause: function() { PluginManager.pause(); },
            resume: function() { PluginManager.resume(); },
            stop: function() { PluginManager.stop(); },
            seek: function(posMs) { PluginManager.seek(posMs); },
            setVolume: function(vol) { PluginManager.setVolume(vol); },
            getVolume: function() { return PluginManager.getVolume(); },
            getPlaybackState: function() { return PluginManager.getPlaybackState(); },
            getPositionMs: function() { return PluginManager.getPositionMs(); },
            getDurationMs: function() { return PluginManager.getDurationMs(); },
            getCurrentTrack: function() { return PluginManager.getCurrentTrack(); },
            getCurrentMetadata: function() { return PluginManager.getCurrentMetadata(); },
            setPlayMode: function(mode) { PluginManager.setPlayMode(mode); },
            playNext: function() { PluginManager.playNext(); },
            playPrevious: function() { PluginManager.playPrevious(); }
        },

        // 7. Capability Demonstrators: Equalizer & DSP Control
        eq: {
            setEnabled: function(en) { PluginManager.setEqEnabled(en); },
            isEnabled: function() { return PluginManager.isEqEnabled(); },
            setPreamp: function(gainDb) { PluginManager.setEqPreamp(gainDb); },
            getPreamp: function() { return PluginManager.getEqPreamp(); },
            setBand: function(idx, gainDb) { PluginManager.setEqBand(idx, gainDb); },
            getBands: function() { return PluginManager.getEqBands(); },
            applyPreset: function(name) { PluginManager.applyEqPreset(name); },
            reset: function() { PluginManager.resetEq(); },
            getPresetNames: function() { return PluginManager.getEqPresetNames(); }
        },

        // 8. Capability Demonstrators: Playback Queue
        queue: {
            getQueue: function() { return PluginManager.getQueue(); },
            getQueueCount: function() { return PluginManager.getQueueCount(); },
            add: function(path) { PluginManager.addToQueue(path); },
            clear: function(keepCurrent) { PluginManager.clearQueue(Boolean(keepCurrent)); },
            shuffle: function() { PluginManager.shuffleQueue(); }
        },

        // 9. Capability Demonstrators: Media Library
        library: {
            getTrackCount: function() { return PluginManager.getLibraryTrackCount(); },
            getAllTracks: function(limit, offset) { return PluginManager.getAllTracks(limit || 50, offset || 0); },
            getAllAlbums: function() { return PluginManager.getAllAlbums(); },
            getAllArtists: function() { return PluginManager.getAllArtists(); },
            search: function(keyword) { return PluginManager.searchLibrary(keyword); },
            rescan: function() { PluginManager.rescanLibrary(); }
        },

        // 10. Capability Demonstrators: Playlists & Favorites
        playlists: {
            getAll: function() { return PluginManager.getAllPlaylists(); },
            create: function(name, tracks) { return PluginManager.createPlaylist(name, tracks || []); },
            delete: function(id) { return PluginManager.deletePlaylist(id); },
            rename: function(id, name) { return PluginManager.renamePlaylist(id, name); },
            toggleFavorite: function(path) { PluginManager.toggleFavorite(path); },
            isFavorite: function(path) { return PluginManager.isFavorite(path); },
            getFavorites: function() { return PluginManager.getFavoriteTracks(); }
        },

        // 11. Capability Demonstrators: Synchronized Lyrics
        lyrics: {
            hasLyrics: function() { return PluginManager.hasLyrics(); },
            getLyricCount: function() { return PluginManager.getLyricCount(); },
            getCurrentLyricIndex: function() { return PluginManager.getCurrentLyricIndex(); },
            getAllLyrics: function() { return PluginManager.getAllLyrics(); },
            loadSampleLrc: function() {
                const sampleLrc = [
                    '[00:00.00]0rhxPlayer Gunmu Reference Lyrics Test',
                    '[00:02.00]Testing synchronized lyrics injection API',
                    '[00:05.00]Native Material 3 synchronized playback display',
                    '[00:09.00]Plugin system verified successfully',
                    '[00:15.00]0rhxPlayer Core Audio Engine'
                ].join('\n');
                return PluginManager.loadLrcContent(sampleLrc);
            },
            clear: function() { PluginManager.clearLyrics(); }
        },

        // 12. Hook Execution Handler
        onHook: function(hookType, params) {
            Gunmu.log(`[Gunmu Hook] Executing hook: ${hookType}`, params);
            if (hookType === 'search') {
                return PluginManager.executePluginHook('search', params);
            }
            return null;
        }
    };

    // Export to global scope
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Gunmu;
    } else {
        global.GunmuPlugin = Gunmu;
    }

    // Auto initialize if context available
    if (typeof PluginManager !== 'undefined') {
        Gunmu.onPluginLoad();
    }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
