// Download tracking system
function trackDownload(fileName) {
    // Get current download counts from localStorage
    let downloads = JSON.parse(localStorage.getItem('pandaDownloads')) || {};
    
    // Increment the count for this file
    downloads[fileName] = (downloads[fileName] || 0) + 1;
    
    // Save back to localStorage
    localStorage.setItem('pandaDownloads', JSON.stringify(downloads));
    
    // Update the display
    updateAllCounts();
    
    // Show a thank you message
    showDownloadMessage(fileName);
}

// Update all download counts on the page
function updateAllCounts() {
    let downloads = JSON.parse(localStorage.getItem('pandaDownloads')) || {};
    
    // Update each counter
    const countElements = {
        'Security Guide': 'count-1',
        'Security Scripts': 'count-2',
        'Malware Tool': 'count-3',
        'Training Materials': 'count-4',
        'Password Manager': 'count-5',
        'Network Scanner': 'count-6'
    };
    
    for (let [fileName, elementId] of Object.entries(countElements)) {
        let count = downloads[fileName] || 0;
        let element = document.getElementById(elementId);
        if (element) {
            element.textContent = `${count} download${count !== 1 ? 's' : ''}`;
        }
    }
}

// Show download confirmation message
function showDownloadMessage(fileName) {
    // Create message element
    const message = document.createElement('div');
    message.className = 'download-message';
    message.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>Downloading ${fileName}...</span>
    `;
    
    // Add styles
    message.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: #1a2332;
        color: white;
        padding: 20px 30px;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 15px;
        animation: slideIn 0.3s ease;
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(message);
    
    // Remove message after 3 seconds
    setTimeout(() => {
        message.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(message);
        }, 300);
    }, 3000);
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Update counts when page loads
window.addEventListener('load', updateAllCounts);

// Add scroll effect to navbar
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 5px 20px rgba(0,0,0,0.2)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    }
});