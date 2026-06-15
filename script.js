document.addEventListener('DOMContentLoaded', () => {
    // Splash Screen Logic
    const splashScreen = document.getElementById('splashScreen');
    if (splashScreen) {
        if (sessionStorage.getItem('hasSeenSplash')) {
            // If they've already seen it, remove it immediately
            splashScreen.remove();
        } else {
            // Set the flag so it doesn't show again
            sessionStorage.setItem('hasSeenSplash', 'true');
            
            // Prevent scrolling while splash screen is active
            document.body.style.overflow = 'hidden';
            
            setTimeout(() => {
                splashScreen.classList.add('hidden');
                document.body.style.overflow = '';
                
                // Optional: Remove from DOM after transition completes (1s)
                setTimeout(() => {
                    splashScreen.remove();
                }, 1000);
            }, 3500); // Wait 3.5 seconds for the animation to play before fading out
        }
    }

    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Intersection Observer for scroll animations (fade-in)
    const fadeElements = document.querySelectorAll('.fade-in');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Trigger stats counter animations if this is the stats section
                if (entry.target.classList.contains('stats-section')) {
                    animateStats();
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(element => {
        observer.observe(element);
    });

    // Portfolio Filtering Logic
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (filterButtons.length > 0 && galleryItems.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Toggle active class on buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const filterValue = button.getAttribute('data-filter');

                galleryItems.forEach(item => {
                    const itemCategory = item.getAttribute('data-category');
                    if (filterValue === 'all' || itemCategory === filterValue) {
                        item.style.display = 'inline-block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }

    // --- NEW: Stats Counter Animation ---
    function animateStats() {
        const statCounters = document.querySelectorAll('.stat-number');
        statCounters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'), 10);
            const duration = 1500; // milliseconds
            const startTime = performance.now();
            
            function updateCounter(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out cubic
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                const currentValue = Math.floor(easeProgress * target);
                
                counter.textContent = currentValue + (counter.getAttribute('data-suffix') || '');
                
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target + (counter.getAttribute('data-suffix') || '');
                }
            }
            requestAnimationFrame(updateCounter);
        });
    }

    // --- NEW: Lightbox Modal Logic ---
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        const lightboxImg = lightbox.querySelector('.lightbox-img');
        const lightboxCaption = lightbox.querySelector('.lightbox-caption');
        const lightboxClose = lightbox.querySelector('.lightbox-close');
        const lightboxPrev = lightbox.querySelector('.lightbox-prev');
        const lightboxNext = lightbox.querySelector('.lightbox-next');
        
        let currentGalleryIndex = 0;
        let visibleGalleryItems = [];

        // Build list of active visible gallery items
        function updateVisibleItems() {
            visibleGalleryItems = Array.from(document.querySelectorAll('.gallery-item')).filter(
                item => item.style.display !== 'none'
            );
        }

        // Open Lightbox
        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                updateVisibleItems();
                currentGalleryIndex = visibleGalleryItems.indexOf(item);
                if (currentGalleryIndex === -1) return; // Fallback
                
                showLightboxImage();
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden'; // Lock scrolling
            });
        });

        function showLightboxImage() {
            const item = visibleGalleryItems[currentGalleryIndex];
            if (!item) return;
            const img = item.querySelector('img');
            const captionText = img.getAttribute('alt') || 'Dream Capture Studio';
            
            lightboxImg.style.transform = 'scale(0.9)';
            lightboxImg.style.opacity = '0';
            
            setTimeout(() => {
                lightboxImg.src = img.src;
                lightboxCaption.textContent = captionText;
                lightboxImg.style.opacity = '1';
                lightboxImg.style.transform = 'scale(1)';
            }, 100);
        }

        // Close Lightbox
        function closeLightbox() {
            lightbox.classList.remove('active');
            document.body.style.overflow = ''; // Unlock scrolling
        }

        lightboxClose.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target === lightbox.querySelector('.lightbox-content-wrapper')) {
                closeLightbox();
            }
        });

        // Navigation
        function navigateLightbox(direction) {
            updateVisibleItems();
            if (visibleGalleryItems.length <= 1) return;
            
            currentGalleryIndex += direction;
            if (currentGalleryIndex < 0) {
                currentGalleryIndex = visibleGalleryItems.length - 1;
            } else if (currentGalleryIndex >= visibleGalleryItems.length) {
                currentGalleryIndex = 0;
            }
            showLightboxImage();
        }

        lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
        lightboxNext.addEventListener('click', () => navigateLightbox(1));

        // Keyboard Controls
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') navigateLightbox(1);
            if (e.key === 'ArrowLeft') navigateLightbox(-1);
        });
    }

    // --- NEW: FAQ Accordion Logic ---
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const content = item.querySelector('.accordion-content');
            const isActive = item.classList.contains('active');
            
            // Close all items
            document.querySelectorAll('.accordion-item').forEach(accItem => {
                accItem.classList.remove('active');
                accItem.querySelector('.accordion-content').style.maxHeight = null;
            });
            
            // Toggle clicked item
            if (!isActive) {
                item.classList.add('active');
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });

    // --- NEW: Interactive Pricing Calculator ---
    const calcType = document.getElementById('calc-type');
    const calcHours = document.getElementById('calc-hours');
    const hoursVal = document.getElementById('hours-val');
    const calcAddons = document.querySelectorAll('.calc-addon');
    const calcPriceText = document.getElementById('calc-price-text');
    const calcBookBtn = document.getElementById('calc-book-btn');

    if (calcType && calcHours && calcPriceText) {
        // Hourly rates per session type
        const baseRates = {
            birthday: 15000,   // Base package includes 1 hour
            wedding: 50000,    // Base package includes 8 hours (matching services.html package details)
            fashion: 25000,    // Base package includes 2 hours
            babyshoot: 40000  // Base package includes 4 hours
        };

        const baseHours = {
            birthday: 1,
            wedding: 8,
            fashion: 2,
            babyshoot: 4
        };

        const hourlyRates = {
            birthday: 8000,
            wedding: 12000,
            fashion: 10000,
            babyshoot: 15000
        };

        function calculatePrice() {
            const type = calcType.value;
            const hours = parseInt(calcHours.value, 10);
            
            // Set slider label
            hoursVal.textContent = hours + (hours === 1 ? ' Hour' : ' Hours');
            
            let price = baseRates[type] || 15000;
            const baseH = baseHours[type] || 1;
            
            // Calculate extra hours
            if (hours > baseH) {
                price += (hours - baseH) * hourlyRates[type];
            }
            
            // Add custom add-ons
            calcAddons.forEach(addon => {
                if (addon.checked) {
                    price += parseInt(addon.getAttribute('data-price'), 10);
                }
            });
            
            // Format price with comma separation
            calcPriceText.textContent = '₹' + price.toLocaleString('en-IN');
        }

        // Event listeners
        calcType.addEventListener('change', calculatePrice);
        calcHours.addEventListener('input', calculatePrice);
        calcAddons.forEach(addon => addon.addEventListener('change', calculatePrice));
        
        // Initial run
        calculatePrice();

        // Save selection and redirect to contact
        if (calcBookBtn) {
            calcBookBtn.addEventListener('click', () => {
                const packageDetails = {
                    type: calcType.value,
                    hours: calcHours.value,
                    addons: Array.from(calcAddons).filter(a => a.checked).map(a => a.name).join(', '),
                    price: calcPriceText.textContent
                };
                sessionStorage.setItem('pendingBooking', JSON.stringify(packageDetails));
                window.location.href = 'contact.html';
            });
        }
    }

    // --- NEW: Contact Form Booking Prefill & Success Modal ---
    const contactForm = document.querySelector('form');
    const successOverlay = document.getElementById('successOverlay');
    
    if (contactForm) {
        // Prefill logic
        const pendingBookingStr = sessionStorage.getItem('pendingBooking');
        if (pendingBookingStr) {
            try {
                const booking = JSON.parse(pendingBookingStr);
                
                // Select matching session type drop-down
                const formTypeSelect = contactForm.querySelector('select');
                if (formTypeSelect) {
                    formTypeSelect.value = booking.type;
                }
                
                // Prefill detail in message body
                const formMessage = contactForm.querySelector('textarea');
                if (formMessage) {
                    let text = `Hi, I am interested in booking a ${booking.type.toUpperCase()} session.\n`;
                    text += `- Duration: ${booking.hours} hours\n`;
                    if (booking.addons) {
                        text += `- Add-ons: ${booking.addons}\n`;
                    }
                    text += `- Estimated Price: ${booking.price}\n`;
                    text += `Please check availability for the requested date. Thank you!`;
                    formMessage.value = text;
                }
                
                // Clear session storage so it doesn't repeat
                sessionStorage.removeItem('pendingBooking');
            } catch (e) {
                console.error("Error reading booking details:", e);
            }
        }

        // Form Submission Interceptor
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Do not submit to server/reload page
            
            const nameInput = contactForm.querySelector('input[placeholder="Your Name"]');
            const clientName = nameInput ? nameInput.value : 'friend';
            
            // Set name in success modal
            const successNameSpan = document.getElementById('success-client-name');
            if (successNameSpan) {
                successNameSpan.textContent = clientName;
            }
            
            // Show loading style on button
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending Inquiry...';
            
            // Simulate API request delay
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                
                // Clear form
                contactForm.reset();
                
                // Show Success Modal
                if (successOverlay) {
                    successOverlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            }, 1200);
        });
    }

    // Success Modal Close
    const successCloseBtn = document.getElementById('successCloseBtn');
    if (successCloseBtn && successOverlay) {
        successCloseBtn.addEventListener('click', () => {
            successOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // --- NEW: Blog search and filter ---
    const blogSearch = document.getElementById('blog-search');
    const blogCatBtns = document.querySelectorAll('.blog-cat-btn');
    const blogCards = document.querySelectorAll('.blog-card');

    if (blogCards.length > 0 && (blogSearch || blogCatBtns.length > 0)) {
        let activeCategory = 'all';
        let searchQuery = '';

        function filterBlogPosts() {
            blogCards.forEach(card => {
                const categorySpan = card.querySelector('.blog-category');
                const category = categorySpan ? categorySpan.textContent.toLowerCase() : '';
                
                const titleLink = card.querySelector('.blog-title a');
                const title = titleLink ? titleLink.textContent.toLowerCase() : '';
                
                const excerptP = card.querySelector('.blog-excerpt');
                const excerpt = excerptP ? excerptP.textContent.toLowerCase() : '';

                // Category filter check
                let categoryMatch = false;
                if (activeCategory === 'all') {
                    categoryMatch = true;
                } else if (activeCategory === 'wedding' && category.includes('wedding')) {
                    categoryMatch = true;
                } else if (activeCategory === 'birthday' && category.includes('birthday')) {
                    categoryMatch = true;
                } else if (activeCategory === 'baby' && (category.includes('baby') || category.includes('newborn'))) {
                    categoryMatch = true;
                } else if (activeCategory === 'fashion' && category.includes('fashion')) {
                    categoryMatch = true;
                }

                // Text search query check
                const queryMatch = title.includes(searchQuery) || excerpt.includes(searchQuery) || category.includes(searchQuery);

                if (categoryMatch && queryMatch) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }

        if (blogSearch) {
            blogSearch.addEventListener('input', (e) => {
                searchQuery = e.target.value.toLowerCase().trim();
                filterBlogPosts();
            });
        }

        if (blogCatBtns.length > 0) {
            blogCatBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    blogCatBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    activeCategory = btn.getAttribute('data-cat');
                    filterBlogPosts();
                });
            });
        }
    }

    // --- NEW: Interactive 35mm Film Strip ---
    const filmFrames = document.querySelectorAll('.film-frame');
    const heroImage = document.querySelector('.hero-image');

    if (filmFrames.length > 0 && heroImage) {
        filmFrames.forEach(frame => {
            const handleFrameInteraction = () => {
                // Remove active class from all
                filmFrames.forEach(f => f.classList.remove('active'));
                
                // Add active class to hovered/tapped
                frame.classList.add('active');
                
                // Change main image with a fade effect
                const newBg = frame.getAttribute('data-bg');
                
                heroImage.style.opacity = '0.4'; // slight fade
                
                setTimeout(() => {
                    heroImage.src = newBg;
                    
                    // Apply grayscale if specified in inline style
                    if (frame.style.filter) {
                        heroImage.style.filter = frame.style.filter;
                    } else {
                        heroImage.style.filter = 'none';
                    }
                    
                    heroImage.style.opacity = '1';
                }, 150); 
            };

            frame.addEventListener('mouseenter', handleFrameInteraction);
            frame.addEventListener('click', handleFrameInteraction);
        });
    }
});
