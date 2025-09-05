document.addEventListener('DOMContentLoaded', function() {

    // --- Custom Cursor Logic ---
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    window.addEventListener('mousemove', function(e) {
        const posX = e.clientX;
        const posY = e.clientY;

        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: "forwards" });
    });

    // --- NEW: Interactive Monitor Tilt Effect ---
    const monitor = document.querySelector('.monitor');
    const maxTilt = 10; // Max tilt in degrees

    document.addEventListener('mousemove', (e) => {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        // Get mouse position relative to center (-1 to 1)
        const mouseX = (e.clientX - centerX) / centerX;
        const mouseY = (e.clientY - centerY) / centerY;
        
        // Calculate tilt
        const tiltY = mouseX * maxTilt;
        const tiltX = -mouseY * maxTilt;

        // Apply a smooth transform
        requestAnimationFrame(() => {
            monitor.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        });
    });

    // Reset tilt when mouse leaves the window
    document.addEventListener('mouseleave', () => {
        monitor.style.transform = `rotateX(0deg) rotateY(0deg)`;
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
    if (slides.length > 1) {
       setInterval(nextSlide, slideInterval);
    }

    // --- Security Modal Logic (Unchanged) ---
    const createButton = document.getElementById('create-button');
    const securityModal = document.getElementById('security-modal');
    const submitKeyButton = document.getElementById('submit-key-button');
    const serialKeyInput = document.getElementById('serial-key-input');
    const modalMessage = document.getElementById('modal-message');

    createButton.addEventListener('click', () => {
        const accessGrantedUntil = localStorage.getItem('accessGrantedUntil');
        if (accessGrantedUntil && Date.now() < parseInt(accessGrantedUntil)) {
            window.location.href = 'Intangible.html';
        } else {
            securityModal.classList.remove('hidden');
        }
    });

    submitKeyButton.addEventListener('click', async () => {
        const enteredKey = serialKeyInput.value.trim();
        if (!enteredKey) {
            modalMessage.textContent = 'Please enter a key.';
            modalMessage.style.color = '#ffc107';
            return;
        }

        try {
            const response = await fetch('keys.txt');
            if (!response.ok) throw new Error('Could not load keys file.');
            const text = await response.text();
            const validKeys = text.split('\n').map(key => key.trim()).filter(Boolean);

            if (validKeys.includes(enteredKey)) {
                const oneMonthFromNow = Date.now() + (30 * 24 * 60 * 60 * 1000);
                localStorage.setItem('accessGrantedUntil', oneMonthFromNow.toString());
                modalMessage.textContent = 'Access Granted! Redirecting...';
                modalMessage.style.color = '#28a745';
                setTimeout(() => {
                    window.location.href = 'Intangible.html';
                }, 1500);
            } else {
                modalMessage.textContent = 'Invalid Serial Key. Access Denied.';
                modalMessage.style.color = '#dc3545';
                serialKeyInput.value = '';
            }
        } catch (error) {
            console.error('Error validating key:', error);
            modalMessage.textContent = 'Error: Could not verify key.';
            modalMessage.style.color = '#dc3545';
        }
    });
    
    securityModal.addEventListener('click', (e) => {
        if (e.target === securityModal) {
            securityModal.classList.add('hidden');
            modalMessage.textContent = '';
        }
    });
});
