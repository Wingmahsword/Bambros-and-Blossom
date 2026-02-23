// script.js
document.addEventListener('DOMContentLoaded', () => {

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');

    // Interactive Bamboo Scroll Animation elements
    const stalkPath = document.querySelector('.stalk-path');
    const leafPaths = document.querySelectorAll('.leaf-path');
    const visionSection = document.querySelector('.vision');

    // Setup initial SVG lengths
    if (stalkPath) {
        const stalkLength = stalkPath.getTotalLength();
        stalkPath.style.strokeDasharray = stalkLength;
        stalkPath.style.strokeDashoffset = stalkLength;

        leafPaths.forEach(leaf => {
            const leafLength = leaf.getTotalLength();
            leaf.style.strokeDasharray = leafLength;
            leaf.style.strokeDashoffset = leafLength;
        });
    }

    window.addEventListener('scroll', () => {
        // Navbar
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Interactive Bamboo Drawing
        if (stalkPath && visionSection) {
            // Calculate scroll percentage through the vision section
            const sectionRect = visionSection.getBoundingClientRect();
            // Start animating when the top of the section comes into the lower third of the viewport
            const triggerPoint = window.innerHeight * 0.8;

            // Total scroll distance we want to animate over (height of the section)
            const scrollDistance = sectionRect.height;

            // How far into the section we've scrolled
            let scrollProgress = (triggerPoint - sectionRect.top) / scrollDistance;

            // Clamp progress between 0 and 1
            scrollProgress = Math.max(0, Math.min(1, scrollProgress));

            // Draw Main Stalk
            const stalkLength = stalkPath.getTotalLength();
            const stalkDrawProgress = stalkLength - (scrollProgress * stalkLength);
            stalkPath.style.strokeDashoffset = stalkDrawProgress;

            // Draw Leaves with slight delays (they appear as the stalk reaches them)
            // Leaf 1 is closest to bottom, Leaf 4 is closest to top
            leafPaths.forEach((leaf, index) => {
                const leafLength = leaf.getTotalLength();
                // Sequence them: 0.2, 0.4, 0.6, 0.8 thresholds roughly
                const threshold = 0.2 + (index * 0.15);

                if (scrollProgress > threshold) {
                    // Map the remaining scroll progress (threshold -> 1) into (0 -> 1) for this leaf
                    let localProgress = (scrollProgress - threshold) / (1 - threshold);
                    // accelerate the local progress so leaf draws faster than stalk
                    localProgress = Math.min(1, localProgress * 2);
                    leaf.style.strokeDashoffset = leafLength - (localProgress * leafLength);
                } else {
                    leaf.style.strokeDashoffset = leafLength;
                }
            });
        }
    });

    // Intersection Observer for scroll animations (other elements)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.2
    };

    const co2Svg = document.querySelector('.co2-svg');
    let bubbleInterval;

    function createBubble(type) {
        if (!co2Svg) return;
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        const radius = Math.random() * 4 + 4;
        const yDrift = (Math.random() - 0.5) * 40; // Random vertical drift

        circle.setAttribute("r", radius);
        circle.setAttribute("cy", "150");
        circle.setAttribute("cx", type === 'co2' ? "0" : "120");
        circle.classList.add(type === 'co2' ? 'bubble' : 'bubble-o2');
        circle.style.setProperty('--y-drift', `${yDrift}px`);
        // Randomize animation duration slightly
        circle.style.animationDuration = `${2 + Math.random() * 1.5}s`;

        co2Svg.appendChild(circle);

        // Remove after animation completes
        setTimeout(() => {
            circle.remove();
        }, 3500);
    }

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');

                // Start bubble animation if it's the CO2 section
                if (entry.target.querySelector('.co2-animation-container')) {
                    if (!bubbleInterval) {
                        bubbleInterval = setInterval(() => {
                            createBubble('co2');
                            // Delay O2 slightly so it looks like it's converted
                            setTimeout(() => createBubble('o2'), 1500);
                        }, 800);
                    }
                }
            } else {
                // Pause bubbles if out of view
                if (entry.target.querySelector('.co2-animation-container')) {
                    clearInterval(bubbleInterval);
                    bubbleInterval = null;
                }
            }
        });
    }, observerOptions);

    // Elements to observe (excluding bamboo container since we do that with scroll now)
    const animatedElements = document.querySelectorAll(
        '.column-reveal, .stat-circle, .split-visual'
    );

    animatedElements.forEach(el => observer.observe(el));

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navHeight = navbar.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});
