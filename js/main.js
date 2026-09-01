/**
 * Karthika Silks - Core Interactive JS Functions
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Navigation Active State & Hamburger Menu ---
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinksContainer = document.querySelector('.nav-links');
  
  if (mobileMenuBtn && navLinksContainer) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenuBtn.classList.toggle('active');
      navLinksContainer.classList.toggle('active');
      document.body.classList.toggle('lightbox-open'); // prevents scroll when menu is active
    });
    
    // Close menu when clicking navigation links
    navLinksContainer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('active');
        navLinksContainer.classList.remove('active');
        document.body.classList.remove('lightbox-open');
      });
    });
  }

  // Set current page navigation link as active
  const currentPath = window.location.pathname;
  const pageName = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';
  
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === pageName || (pageName === 'index.html' && href === './') || (pageName === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });


  // --- 2. Live Store Hours Status Checker ---
  const storeStatusElement = document.getElementById('store-status-container');
  if (storeStatusElement) {
    function updateStoreStatus() {
      // 9:00 AM - 9:30 PM (Asia/Kolkata timezone)
      try {
        const timeFormatter = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: 'numeric',
          minute: 'numeric',
          hour12: false,
          weekday: 'short'
        });
        
        const formattedParts = timeFormatter.formatToParts(new Date());
        const weekday = formattedParts.find(p => p.type === 'weekday').value; // e.g. "Mon"
        const hour = parseInt(formattedParts.find(p => p.type === 'hour').value, 10);
        const minute = parseInt(formattedParts.find(p => p.type === 'minute').value, 10);
        
        const currentTimeInMinutes = hour * 60 + minute;
        const openTimeInMinutes = 9 * 60; // 09:00
        const closeTimeInMinutes = 21 * 60 + 30; // 21:30 (9:30 PM)
        
        const isOpen = currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes;
        
        if (isOpen) {
          storeStatusElement.innerHTML = `
            <div class="store-status-badge open">
              <span class="status-dot"></span>
              Open Now (Closes at 9:30 PM)
            </div>
          `;
        } else {
          storeStatusElement.innerHTML = `
            <div class="store-status-badge closed">
              <span class="status-dot"></span>
              Closed Now (Opens at 9:00 AM)
            </div>
          `;
        }
      } catch (e) {
        console.error("Error computing store timezone status:", e);
        // Fallback to simple local time check if timezone formatting fails
        const localHour = new Date().getHours();
        const localMinute = new Date().getMinutes();
        const localTimeMinutes = localHour * 60 + localMinute;
        const isOpen = localTimeMinutes >= (9*60) && localTimeMinutes < (21*60+30);
        
        storeStatusElement.innerHTML = isOpen 
          ? `<div class="store-status-badge open"><span class="status-dot"></span>Open Now</div>`
          : `<div class="store-status-badge closed"><span class="status-dot"></span>Closed Now</div>`;
      }
    }
    
    updateStoreStatus();
    setInterval(updateStoreStatus, 60000); // Check status every minute
  }


  // --- 3. Scroll Reveal Animations ---
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length > 0) {
    const revealOnScroll = () => {
      const windowHeight = window.innerHeight;
      reveals.forEach(el => {
        const elementTop = el.getBoundingClientRect().top;
        const elementVisible = 120; // threshold
        
        if (elementTop < windowHeight - elementVisible) {
          el.classList.add('active');
        }
      });
    };
    
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check on load
  }


  // --- 4. Lightbox Viewer Logic ---
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCounter = document.getElementById('lightbox-counter');
  
  const closeBtn = document.querySelector('.lightbox-close');
  const prevBtn = document.querySelector('.lightbox-prev');
  const nextBtn = document.querySelector('.lightbox-next');
  
  // Collect gallery items
  const galleryItems = Array.from(document.querySelectorAll('[data-lightbox-src]'));
  let activeIndex = -1;
  
  if (lightbox && lightboxImg && galleryItems.length > 0) {
    
    const openLightbox = (index) => {
      activeIndex = index;
      const targetItem = galleryItems[activeIndex];
      const src = targetItem.getAttribute('data-lightbox-src');
      const caption = targetItem.getAttribute('data-lightbox-caption') || '';
      
      lightboxImg.src = src;
      lightboxCaption.textContent = caption;
      lightboxCounter.textContent = `${activeIndex + 1} of ${galleryItems.length}`;
      
      lightbox.classList.add('active');
      document.body.classList.add('lightbox-open');
    };
    
    const closeLightbox = () => {
      lightbox.classList.remove('active');
      document.body.classList.remove('lightbox-open');
      lightboxImg.src = '';
    };
    
    const showNext = () => {
      if (activeIndex === -1) return;
      activeIndex = (activeIndex + 1) % galleryItems.length;
      openLightbox(activeIndex);
    };
    
    const showPrev = () => {
      if (activeIndex === -1) return;
      activeIndex = (activeIndex - 1 + galleryItems.length) % galleryItems.length;
      openLightbox(activeIndex);
    };
    
    // Bind click events to items
    galleryItems.forEach((item, index) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        openLightbox(index);
      });
    });
    
    // Control bindings
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (nextBtn) nextBtn.addEventListener('click', showNext);
    if (prevBtn) prevBtn.addEventListener('click', showPrev);
    
    // Close on overlay background click
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-content') || e.target.classList.contains('lightbox-image-container')) {
        closeLightbox();
      }
    });
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    });

    // Touch swiping support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    lightbox.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    lightbox.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
    
    const handleSwipe = () => {
      const swipeDistance = touchEndX - touchStartX;
      const threshold = 50; // pixels
      
      if (swipeDistance > threshold) {
        showPrev(); // Swiped right -> previous image
      } else if (swipeDistance < -threshold) {
        showNext(); // Swiped left -> next image
      }
    };
  }


  // --- 5. Product Category Filters ---
  const filterButtons = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card-wrapper');
  
  if (filterButtons.length > 0 && productCards.length > 0) {
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove active class from other buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        button.classList.add('active');
        
        const filterValue = button.getAttribute('data-filter');
        
        productCards.forEach(card => {
          const cardCategories = card.getAttribute('data-category').split(' ');
          
          if (filterValue === 'all' || cardCategories.includes(filterValue)) {
            card.style.display = 'block';
            // Subtle fade-in animation
            card.style.opacity = '0';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transition = 'opacity 0.4s ease';
            }, 50);
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // --- 6. Home Hero Banner Slider Logic ---
  const heroSlides = document.querySelectorAll('.hero-slide');
  const sliderDots = document.querySelectorAll('.slider-dot');
  const nextSlideBtn = document.querySelector('.slider-next-btn');
  const prevSlideBtn = document.querySelector('.slider-prev-btn');
  
  if (heroSlides.length > 0) {
    let currentSlideIndex = 0;
    let slideInterval;

    const showSlide = (index) => {
      heroSlides.forEach((slide, i) => {
        if (i === index) {
          slide.classList.add('active');
          if (sliderDots[i]) sliderDots[i].classList.add('active');
        } else {
          slide.classList.remove('active');
          if (sliderDots[i]) sliderDots[i].classList.remove('active');
        }
      });
      currentSlideIndex = index;
    };

    const nextSlide = () => {
      let nextIndex = (currentSlideIndex + 1) % heroSlides.length;
      showSlide(nextIndex);
    };

    const prevSlide = () => {
      let prevIndex = (currentSlideIndex - 1 + heroSlides.length) % heroSlides.length;
      showSlide(prevIndex);
    };

    const startSlideShow = () => {
      slideInterval = setInterval(nextSlide, 5000);
    };

    const stopSlideShow = () => {
      clearInterval(slideInterval);
    };

    if (nextSlideBtn) {
      nextSlideBtn.addEventListener('click', () => {
        stopSlideShow();
        nextSlide();
        startSlideShow();
      });
    }

    if (prevSlideBtn) {
      prevSlideBtn.addEventListener('click', () => {
        stopSlideShow();
        prevSlide();
        startSlideShow();
      });
    }

    sliderDots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        stopSlideShow();
        showSlide(index);
        startSlideShow();
      });
    });

    startSlideShow();
  }

  // --- 7. Product Horizontal Scroll Row Logic ---
  const scrollContainer = document.getElementById('product-row-scroll-container');
  const scrollPrevBtn = document.querySelector('.product-slider-arrow-prev');
  const scrollNextBtn = document.querySelector('.product-slider-arrow-next');

  if (scrollContainer) {
    const scrollAmount = 250;

    if (scrollPrevBtn) {
      scrollPrevBtn.addEventListener('click', () => {
        scrollContainer.scrollBy({
          left: -scrollAmount,
          behavior: 'smooth'
        });
      });
    }

    if (scrollNextBtn) {
      scrollNextBtn.addEventListener('click', () => {
        scrollContainer.scrollBy({
          left: scrollAmount,
          behavior: 'smooth'
        });
      });
    }
  }
});
