// Logo handling - SVG is preferred, with fallbacks
(function() {
    const logoExtensions = ['svg', 'png', 'jpg', 'jpeg'];
    let currentAttempt = 0;
    
    function tryNextLogo() {
        const logoImg = document.getElementById('logo-image');
        const logoText = document.getElementById('logo-text');
        
        if (!logoImg) return;
        
        if (currentAttempt < logoExtensions.length) {
            const extension = logoExtensions[currentAttempt];
            logoImg.src = `logo.${extension}`;
            currentAttempt++;
        } else {
            // All attempts failed, show text
            logoImg.style.display = 'none';
            if (logoText) {
                logoText.style.display = 'block';
            }
        }
    }
    
    // Set up error handler
    window.addEventListener('DOMContentLoaded', function() {
        const logoImg = document.getElementById('logo-image');
        if (logoImg) {
            // Logo is already set in HTML, just need error handler
            logoImg.onerror = tryNextLogo;
            // If src is empty or image fails, try fallbacks
            if (!logoImg.src || logoImg.complete && logoImg.naturalHeight === 0) {
                tryNextLogo();
            }
        }
    });
})();

// Contact form handling
document.getElementById('contact-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const form = this;
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Get form values
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const message = formData.get('message');
    
    // Validation
    if (!name || !email || !phone) {
        showMessage('Please fill in all required fields.', 'error');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('Please enter a valid email address.', 'error');
        return;
    }
    
    // Disable submit button
    submitButton.disabled = true;
    const originalButtonHTML = submitButton.innerHTML;
    submitButton.innerHTML = '<span>Sending...</span>';
    
    // Prepare form data
    const formSubmission = {
        name: name,
        email: email,
        phone: phone,
        message: message || '',
        timestamp: new Date().toISOString(),
        source: 'website_contact_form'
    };
    
    try {
        // Submit to Google Apps Script (Google Drive/Sheets)
        if (typeof GOOGLE_APPS_SCRIPT_URL !== 'undefined' && GOOGLE_APPS_SCRIPT_URL) {
            await fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Required for Google Apps Script (can't read response)
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formSubmission)
            });
        }
        
        // Track Reddit conversion via pixel (client-side)
        if (typeof trackRedditConversion !== 'undefined') {
            trackRedditConversion('Lead');
        }
        
        showMessage('Thank you for your message! We\'ll get back to you soon.', 'success');
        form.reset();
        
    } catch (error) {
        console.error('Form submission error:', error);
        showMessage('Something went wrong.', 'error');
    } finally {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonHTML;
    }
});

function showMessage(message, type) {
    const messageDiv = document.getElementById('form-message');
    messageDiv.textContent = message;
    messageDiv.className = `form-message ${type}`;
    
    // Scroll to message smoothly
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Hide message after 5 seconds for success, keep error visible
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.className = 'form-message';
        }, 5000);
    }
}

// Track if we're handling a click vs external navigation
let isInternalClick = false;

// Smooth scroll for anchor links (when clicking buttons on the page)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        isInternalClick = true;
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            
            // Update URL hash after smooth scroll starts
            window.history.pushState(null, null, this.getAttribute('href'));
        }
        // Reset flag after a short delay
        setTimeout(() => { isInternalClick = false; }, 1000);
    });
});

// Handle hash changes (browser back/forward, or direct URL changes)
// Only use instant scroll if it wasn't triggered by an internal click
window.addEventListener('hashchange', function() {
    if (!isInternalClick) {
        const hash = window.location.hash;
        const target = document.querySelector(hash);
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            // Jump instantly without animation for external hash changes
            window.scrollTo({
                top: offsetPosition,
                behavior: 'auto'
            });
        }
    }
});
