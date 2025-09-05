document.addEventListener('DOMContentLoaded', function() {

    // --- Custom Cursor Logic ---
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    window.addEventListener('mousemove', function(e) {
        const posX = e.clientX;
        const posY = e.clientY;

        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        requestAnimationFrame(() => {
            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 500, fill: 'forwards' });
        });
    });

    // --- Slideshow Logic ---
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;
    const slideInterval = 5000;

    function nextSlide() {
        if (slides.length === 0) return;
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');

        const currentElement = slides[currentSlide].children[0];
        if (currentElement.tagName === 'VIDEO') {
            currentElement.play();
        }
    }
    setInterval(nextSlide, slideInterval);

    // --- NEW: Security Modal Logic ---
    const createButton = document.getElementById('create-button');
    const securityModal = document.getElementById('security-modal');
    const submitKeyButton = document.getElementById('submit-key-button');
    const serialKeyInput = document.getElementById('serial-key-input');
    const modalMessage = document.getElementById('modal-message');

    // Check if user has access
    createButton.addEventListener('click', () => {
        const accessGrantedUntil = localStorage.getItem('accessGrantedUntil');
        // Check if an access key exists and is not expired
        if (accessGrantedUntil && Date.now() < parseInt(accessGrantedUntil)) {
            // If access is valid, go to the page
            window.location.href = 'Intangible.html';
        } else {
            // Otherwise, show the popup to enter a key
            securityModal.classList.remove('hidden');
        }
    });

    // Handle key submission
    submitKeyButton.addEventListener('click', async () => {
        const enteredKey = serialKeyInput.value.trim();
        if (!enteredKey) {
            modalMessage.textContent = 'Please enter a key.';
            modalMessage.style.color = '#ffc107'; // Yellow for warning
            return;
        }

        try {
            // Fetch the list of valid keys from your text file
            const response = await fetch('keys.txt');
            if (!response.ok) {
                throw new Error('Could not load keys file.');
            }
            const text = await response.text();
            const validKeys = text.split('\n').map(key => key.trim()).filter(Boolean);

            // Check if the entered key is in the list
            if (validKeys.includes(enteredKey)) {
                // Key is valid! Grant access for 1 month (30 days)
                const oneMonthFromNow = Date.now() + (30 * 24 * 60 * 60 * 1000);
                localStorage.setItem('accessGrantedUntil', oneMonthFromNow.toString());

                modalMessage.textContent = 'Access Granted! Redirecting...';
                modalMessage.style.color = '#28a745'; // Green for success

                // Redirect after a short delay
                setTimeout(() => {
                    window.location.href = 'Intangible.html';
                }, 1500);

            } else {
                // Key is invalid
                modalMessage.textContent = 'Invalid Serial Key. Access Denied.';
                modalMessage.style.color = '#dc3545'; // Red for error
                serialKeyInput.value = ''; // Clear the input
            }
        } catch (error) {
            console.error('Error validating key:', error);
            modalMessage.textContent = 'Error: Could not verify key. Please try again later.';
            modalMessage.style.color = '#dc3545';
        }
    });
    
    // Allow closing the modal by clicking the background overlay
    securityModal.addEventListener('click', (e) => {
        if (e.target === securityModal) {
            securityModal.classList.add('hidden');
            modalMessage.textContent = ''; // Clear any messages
        }
    });
});
