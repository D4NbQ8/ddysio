const WatchProgress = {
    saveInterval: null,
    
    getKey(movieId, episodeIndex = null) {
        return episodeIndex !== null 
            ? `watch_progress_${movieId}_ep${episodeIndex}`
            : `watch_progress_${movieId}`;
    },
    
    save(movieId, currentTime, duration, episodeIndex = null) {
        const key = this.getKey(movieId, episodeIndex);
        const data = {
            movieId: movieId,
            currentTime: Math.floor(currentTime),
            duration: Math.floor(duration),
            progress: duration > 0 ? (currentTime / duration * 100).toFixed(2) : 0,
            lastWatch: Date.now(),
            episodeIndex: episodeIndex
        };
        
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error('Save progress failed:', e);
        }
    },
    
    load(movieId, episodeIndex = null) {
        const key = this.getKey(movieId, episodeIndex);
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    },
    
    remove(movieId, episodeIndex = null) {
        const key = this.getKey(movieId, episodeIndex);
        localStorage.removeItem(key);
    },
    
    removeAll() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('watch_progress_')) {
                localStorage.removeItem(key);
            }
        });
    },
    
    startAutoSave(player, movieId, episodeIndex = null) {
        this.stopAutoSave();
        
        this.saveInterval = setInterval(() => {
            if (player && player.video && !player.video.paused) {
                const currentTime = player.video.currentTime;
                const duration = player.video.duration;
                
                if (currentTime > 0 && duration > 0) {
                    this.save(movieId, currentTime, duration, episodeIndex);
                }
            }
        }, 10000);
    },
    
    stopAutoSave() {
        if (this.saveInterval) {
            clearInterval(this.saveInterval);
            this.saveInterval = null;
        }
    },
    
    showContinuePrompt(progress, onContinue, onRestart) {
        const minutes = Math.floor(progress.currentTime / 60);
        const seconds = Math.floor(progress.currentTime % 60);
        const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        const progressPercent = parseFloat(progress.progress);
        
        if (progressPercent < 5 || progressPercent > 95) {
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 max-w-sm mx-4 shadow-lg">
                <div class="text-center mb-4">
                    <svg class="w-16 h-16 mx-auto mb-3 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">检测到观看记录</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">上次观看到 ${timeStr}</p>
                    <div class="mt-3 bg-gray-200 dark:bg-gray-700 h-2 overflow-hidden">
                        <div class="bg-blue-500 dark:bg-blue-600 h-full transition-all" style="width: ${progressPercent}%"></div>
                    </div>
                </div>
                <div class="flex gap-3">
                    <button id="continueBtn" class="flex-1 px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors">
                        继续观看
                    </button>
                    <button id="restartBtn" class="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                        从头开始
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('continueBtn').onclick = () => {
            modal.remove();
            onContinue();
        };
        
        document.getElementById('restartBtn').onclick = () => {
            modal.remove();
            onRestart();
        };
    }
};

window.WatchProgress = WatchProgress;