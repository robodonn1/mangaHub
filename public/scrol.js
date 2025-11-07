
 const scrollToTopBtn = document.getElementById('scrollToTop');

            window.addEventListener('scroll', () => {
                if (window.scrollY > 100) {
                    scrollToTopBtn.style.display = 'block';
                } else {
                    scrollToTopBtn.style.display = 'none';
                }
            });

            scrollToTopBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });