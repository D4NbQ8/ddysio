(function() {
    'use strict';

    function initDarkMode() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }

    function toggleDarkMode() {
        const html = document.documentElement;
        const isDark = html.classList.contains('dark');
        
        if (isDark) {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
        
        window.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme: isDark ? 'light' : 'dark' } 
        }));
    }

    function getCurrentTheme() {
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }

    function watchSystemTheme() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        mediaQuery.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                if (e.matches) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            }
        });
    }

    initDarkMode();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setupDarkModeToggle();
            watchSystemTheme();
        });
    } else {
        setupDarkModeToggle();
        watchSystemTheme();
    }

    function setupDarkModeToggle() {
        const toggleBtn = document.getElementById('darkModeToggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', toggleDarkMode);
            updateToggleButton(toggleBtn);
        }

        window.addEventListener('themeChanged', function() {
            if (toggleBtn) {
                updateToggleButton(toggleBtn);
            }
        });
    }

    function updateToggleButton(btn) {
        const isDark = getCurrentTheme() === 'dark';
        const sunIcon = btn.querySelector('.sun-icon');
        const moonIcon = btn.querySelector('.moon-icon');
        
        if (sunIcon && moonIcon) {
            if (isDark) {
                sunIcon.classList.remove('hidden');
                moonIcon.classList.add('hidden');
            } else {
                sunIcon.classList.add('hidden');
                moonIcon.classList.remove('hidden');
            }
        }
    }

    window.darkMode = {
        toggle: toggleDarkMode,
        getCurrentTheme: getCurrentTheme,
        setTheme: function(theme) {
            if (theme === 'dark') {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
        }
    };
})();