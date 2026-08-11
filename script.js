/**
 * Street Panda Cyber - Download Center Logic v2 (Fixed)
 * - Secure XSS fix (textContent instead of innerHTML)
 * - No style tag leak, toast styles moved to CSS
 * - Robust localStorage handling
 * - Event delegation, no inline onclick
 * - Debounced scroll
 */

(function () {
    'use strict';

    const STORAGE_KEY = 'pandaDownloads';
    const COUNT_MAP = {
        'Security Guide': 'count-1',
        'Security Scripts': 'count-2',
        'Malware Tool': 'count-3',
        'Training Materials': 'count-4',
        'Password Manager': 'count-5',
        'Network Scanner': 'count-6'
    };

    /** Safe localStorage read */
    function getDownloads() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return {};
            const parsed = JSON.parse(raw);
            return (parsed && typeof parsed === 'object') ? parsed : {};
        } catch (e) {
            console.warn('Could not read download counts:', e);
            return {};
        }
    }

    /** Safe localStorage write */
    function setDownloads(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            console.warn('Could not save download counts (private mode/quota):', e);
            return false;
        }
    }

    /** Escape HTML helper for textContent path but kept for future use */
    function createToast(fileName) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const message = document.createElement('div');
        message.className = 'download-message';
        message.setAttribute('role', 'status');

        const icon = document.createElement('i');
        icon.className = 'fas fa-check-circle';
        icon.setAttribute('aria-hidden', 'true');

        const text = document.createElement('span');
        // Using textContent prevents XSS even if fileName is attacker-controlled
        text.textContent = `Downloading ${fileName} — check files/ folder and verify SHA256.`;

        message.appendChild(icon);
        message.appendChild(text);
        container.appendChild(message);

        // Auto-remove after 4s
        setTimeout(() => {
            message.classList.add('out');
            setTimeout(() => {
                if (message.parentNode) {
                    message.parentNode.removeChild(message);
                }
            }, 300);
        }, 4000);
    }

    /** Public: track download - exposed for backward compat but prefer data-attr */
    function trackDownload(fileName) {
        if (!fileName || typeof fileName !== 'string') return;
        // Sanitize: trim and limit length
        const cleanName = fileName.trim().slice(0, 100);

        const downloads = getDownloads();
        downloads[cleanName] = (downloads[cleanName] || 0) + 1;
        setDownloads(downloads);

        updateAllCounts();
        createToast(cleanName);
    }

    // Expose globally for any leftover inline handlers (and for console testing)
    window.trackDownload = trackDownload;

    /** Update all counter elements */
    function updateAllCounts() {
        const downloads = getDownloads();
        for (const [fileName, elementId] of Object.entries(COUNT_MAP)) {
            const el = document.getElementById(elementId);
            if (!el) continue;
            const count = downloads[fileName] || 0;
            el.textContent = `${count} download${count !== 1 ? 's' : ''} (local)`;
        }
    }

    /** Debounce utility */
    function debounce(fn, delay) {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    /** Init */
    function init() {
        // Year in footer
        const yearEl = document.getElementById('current-year');
        if (yearEl) {
            yearEl.textContent = new Date().getFullYear();
        }

        // Counts on load
        updateAllCounts();

        // Attach click listeners to all download buttons (event delegation alternative)
        document.querySelectorAll('.download-btn[data-filename]').forEach(btn => {
            btn.addEventListener('click', function () {
                const name = this.getAttribute('data-filename');
                trackDownload(name);
            });
        });

        // Smooth scrolling for nav anchors (CSS scroll-behavior handles most, this is fallback + offset)
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (!href || href === '#') return;
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    // Update focus for a11y
                    target.setAttribute('tabindex', '-1');
                    target.focus({ preventScroll: true });
                }
            });
        });

        // Navbar shadow on scroll - debounced
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            const onScroll = debounce(() => {
                navbar.style.boxShadow = window.scrollY > 50
                    ? '0 5px 20px rgba(0,0,0,0.2)'
                    : '0 2px 10px rgba(0,0,0,0.1)';
            }, 50);
            window.addEventListener('scroll', onScroll, { passive: true });
        }

        console.log('🐼 Street Panda Cyber ready - local download tracking active. Files in /files/');
    }

    // Run when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
