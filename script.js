// Initialize AOS - hemen başlat
/*
function initializeAOS() {
	if (typeof AOS !== "undefined") {
		AOS.init({
			duration: 400,
			easing: "ease-out",
			once: true,
			offset: 10,
			anchorPlacement: "top-bottom",
			delay: 0,
			disable: false,
		});
		// AOS'u hemen refresh et (tüm elementler için)
		AOS.refresh();
	} else {
		// AOS yüklenene kadar bekle (daha kısa süre)
		setTimeout(initializeAOS, 50);
	}
}

// AOS'u sayfa yüklendiğinde hemen başlat
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initializeAOS);
} else {
	initializeAOS();
}
*/
// Smooth scroll for navigation links - include'lardan sonra çağrılacak
function initializeSmoothScroll() {
	document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
		anchor.addEventListener("click", function (e) {
			e.preventDefault();
			const target = document.querySelector(this.getAttribute("href"));
			if (target) {
				const targetPosition = target.offsetTop - 80;
				window.scrollTo({
					top: targetPosition,
					behavior: "smooth",
				});
			}
		});
	});
}

// Navbar scroll behavior
function initializeNavbar() {
	const navbar = document.getElementById("navbar");
	const navbarLogo = document.getElementById("navbar-logo");
	const heroSection = document.getElementById("hero");

	let lastScrollTop = 0;
	let scrollTimeout;

	function updateNavbar() {
		const currentScroll =
			window.pageYOffset || document.documentElement.scrollTop;
		const heroBottom = heroSection
			? heroSection.offsetTop + heroSection.offsetHeight
			: 0;

		// Hero section içindeyken
		if (currentScroll < heroBottom - 100) {
			navbar.classList.remove("hidden", "scrolled");
			navbarLogo.classList.remove("colored");
			navbarLogo.classList.add("white");
		} else {
			// Hero section'dan sonra
			navbar.classList.add("scrolled");
			navbarLogo.classList.remove("white");
			navbarLogo.classList.add("colored");

			// Scroll yönüne göre göster/gizle
			if (currentScroll > lastScrollTop && currentScroll > 100) {
				// Aşağı scroll - gizle
				navbar.classList.add("hidden");
			} else {
				// Yukarı scroll - göster
				navbar.classList.remove("hidden");
			}
		}

		lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
	}

	// Scroll event listener
	window.addEventListener(
		"scroll",
		() => {
			clearTimeout(scrollTimeout);
			scrollTimeout = setTimeout(updateNavbar, 10);
		},
		{ passive: true }
	);

	// Initial check
	updateNavbar();
}

// Navigation buttons functionality
function initializeNavigationButtons() {
	const scrollUpBtn = document.getElementById("scrollUp");
	const scrollDownBtn = document.getElementById("scrollDown");

	function updateButtonVisibility() {
		const currentScroll =
			window.pageYOffset || document.documentElement.scrollTop;
		const windowHeight = window.innerHeight;
		const documentHeight = document.documentElement.scrollHeight;

		// Yukarı butonu: sayfanın en üstünde değilsek göster
		if (currentScroll > 100) {
			scrollUpBtn.classList.remove("hidden");
		} else {
			scrollUpBtn.classList.add("hidden");
		}

		// Aşağı butonu: sayfanın en altında değilsek göster
		if (currentScroll + windowHeight < documentHeight - 100) {
			scrollDownBtn.classList.remove("hidden");
		} else {
			scrollDownBtn.classList.add("hidden");
		}
	}

	// Scroll event listener
	let scrollTimeout;
	window.addEventListener(
		"scroll",
		() => {
			clearTimeout(scrollTimeout);
			scrollTimeout = setTimeout(updateButtonVisibility, 100);
		},
		{ passive: true }
	);

	// Initial check
	updateButtonVisibility();

	// Scroll up button
	scrollUpBtn.addEventListener("click", () => {
		const sections = document.querySelectorAll(
			"section[id], .fullscreen-section"
		);
		const currentScroll =
			window.pageYOffset || document.documentElement.scrollTop;
		// Ufak bir tolerans payı bırakıyoruz (örn. 10px) ki tam section başındaysak bir öncekini bulsun
		const threshold = 10;

		let prevSection = null;
		sections.forEach((section) => {
			const sectionTop = section.offsetTop;
			// Mevcut scroll pozisyonundan daha yukarıda olan sectionları kontrol et
			if (sectionTop < currentScroll - threshold) {
				// Bu sectionlardan en aşağıda olanını (bize en yakın olanı) seç
				if (!prevSection || sectionTop > prevSection.offsetTop) {
					prevSection = section;
				}
			}
		});

		if (prevSection) {
			window.scrollTo({
				top: prevSection.offsetTop,
				behavior: "smooth",
			});
		} else {
			// Eğer yukarıda section yoksa en başa git
			window.scrollTo({
				top: 0,
				behavior: "smooth",
			});
		}
	});

	// Scroll down button
	scrollDownBtn.addEventListener("click", () => {
		const sections = document.querySelectorAll(
			"section[id], .fullscreen-section"
		);
		const currentScroll =
			window.pageYOffset || document.documentElement.scrollTop;
		const windowHeight = window.innerHeight;

		let nextSection = null;
		sections.forEach((section) => {
			const sectionTop = section.offsetTop;
			if (sectionTop > currentScroll + windowHeight / 3) {
				if (!nextSection || sectionTop < nextSection.offsetTop) {
					nextSection = section;
				}
			}
		});

		if (nextSection) {
			const targetPosition = nextSection.offsetTop;
			window.scrollTo({
				top: targetPosition,
				behavior: "smooth",
			});
		} else {
			// Son section'a git
			window.scrollTo({
				top: document.documentElement.scrollHeight,
				behavior: "smooth",
			});
		}
	});
}

// Görsellerin gerçek aspect ratio'sunu hesapla ve uygula
function calculateImageAspectRatios() {
	const allImages = document.querySelectorAll(
		".slider-image, .image-wrapper img"
	);

	allImages.forEach((img) => {
		// Görsel yüklenmemişse yükleme event'i ekle
		if (!img.complete || img.naturalWidth === 0) {
			img.addEventListener(
				"load",
				function () {
					applyAspectRatio(this);
				},
				{ once: true }
			);
		} else {
			// Görsel zaten yüklenmişse direkt uygula
			applyAspectRatio(img);
		}
	});
}

// Görselin aspect ratio'sunu hesapla ve container'a uygula
function applyAspectRatio(img) {
	if (img.naturalWidth === 0 || img.naturalHeight === 0) return;

	const aspectRatio = img.naturalWidth / img.naturalHeight;

	// Container'ı bul (slider-image için image-container, normal img için image-wrapper)
	let container = img.closest(".image-container");
	if (!container) {
		container = img.closest(".image-wrapper");
	}

	if (container) {
		// Aspect ratio'yu CSS custom property olarak ekle
		container.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
	}
}

// Görsel yüksekliğini metin içeriğine (sadece başlık + paragraf) göre ayarla
function adjustImageHeights() {
	// Önce görsellerin aspect ratio'larını hesapla
	calculateImageAspectRatios();

	// Tüm grid container'ları bul
	const grids = document.querySelectorAll(".grid.items-stretch");

	grids.forEach((grid) => {
		const textColumn = grid.querySelector(".flex.flex-col");
		const imageWrapper = grid.querySelector(".image-wrapper");

		if (textColumn && imageWrapper) {
			// Sadece başlık (h2, h3) ve paragraf (p) elementlerini bul
			// İlk paragrafı al (diğer içerikler değil)
			const heading = textColumn.querySelector("h2, h3");
			const paragraphs = textColumn.querySelectorAll("p");
			const firstParagraph = paragraphs[0]; // Sadece ilk paragraf

			if (heading && firstParagraph) {
				// Başlık ve paragrafın toplam yüksekliğini hesapla
				const headingRect = heading.getBoundingClientRect();
				const paragraphRect = firstParagraph.getBoundingClientRect();

				// Toplam yükseklik = başlık altından paragraf altına kadar
				const headingBottom = headingRect.bottom;
				const paragraphBottom = paragraphRect.bottom;
				const totalHeight = paragraphBottom - headingRect.top;

				// Görseli bul ve yüksekliğini ayarla (slider varsa active olanı al)
				const slider = imageWrapper.querySelector(".image-slider");
				let image = null;
				if (slider) {
					image = slider.querySelector(".slider-image.active");
					// Eğer active resim yoksa ilk resmi al
					if (
						!image &&
						slider.querySelectorAll(".slider-image").length > 0
					) {
						image = slider.querySelectorAll(".slider-image")[0];
					}
				} else {
					image = imageWrapper.querySelector("img");
				}
				if (image) {
					// Gerçek aspect ratio'yu kullan
					let aspectRatio = 1080 / 1920; // Varsayılan
					if (image.naturalWidth > 0 && image.naturalHeight > 0) {
						aspectRatio = image.naturalWidth / image.naturalHeight;
					}

					// Yüksekliği toplam yüksekliğe eşitle
					const targetHeight = totalHeight;
					const targetWidth = targetHeight * aspectRatio;

					// Max genişlik kontrolü - eğer çok genişse, genişliği sınırla
					let finalWidth = targetWidth;
					let finalHeight = targetHeight;

					if (finalWidth > 500) {
						finalWidth = 500;
						finalHeight = finalWidth / aspectRatio;
					}

					// Min genişlik kontrolü - çok küçük olmasın
					if (finalWidth < 250) {
						finalWidth = 250;
						finalHeight = finalWidth / aspectRatio;
					}

					// Görseli ayarla (slider varsa tüm resimleri ayarla)
					if (slider) {
						const container =
							slider.querySelector(".image-container");
						if (container) {
							container.style.height = finalHeight + "px";
							// Aspect ratio'yu da uygula
							if (
								image.naturalWidth > 0 &&
								image.naturalHeight > 0
							) {
								container.style.aspectRatio = `${image.naturalWidth} / ${image.naturalHeight}`;
							}
						}
						const allImages =
							slider.querySelectorAll(".slider-image");
						allImages.forEach((img) => {
							img.style.height = finalHeight + "px";
							img.style.width = finalWidth + "px";
							img.style.maxWidth = "none";
							img.style.maxHeight = "none";
						});
					} else {
						image.style.height = finalHeight + "px";
						image.style.width = finalWidth + "px";
						image.style.maxWidth = "none";
						image.style.maxHeight = "none";
					}
				}
			}
		}
	});

	// Layout değiştiği için AOS'u güncelle
	//if (typeof AOS !== "undefined") {
	//	AOS.refresh();
	//}
}

// Resize olduğunda image height'ı tekrar ayarla
window.addEventListener("resize", () => {
	setTimeout(adjustImageHeights, 100);
});

// Sayfa yüklendiğinde script'leri başlat
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initializeOnLoad);
} else {
	initializeOnLoad();
}

function initializeOnLoad() {
	initializeSmoothScroll();
	initializeNavbar();
	initializeNavigationButtons();
	// Görsellerin aspect ratio'larını hesapla (yüklenmelerini bekle)
	calculateImageAspectRatios();
	// Image height ayarlamayı görseller yüklendikten sonra çalıştır
	setTimeout(() => {
		adjustImageHeights();
	}, 500);
	// Image slider'ları başlat
	initializeImageSliders();
	// Horizontal scroll'u başlat - biraz gecikme ile (tüm DOM yüklensin)
	//setTimeout(initializeHorizontalScroll, 300);
	// AOS'u tekrar refresh et (DOM tam yüklendikten sonra)
	//if (typeof AOS !== "undefined") {
	//	setTimeout(() => {
	//		AOS.refresh();
	//	}, 600);
	//}
}

// Image Slider Fonksiyonu
function initializeImageSliders() {
	const sliders = document.querySelectorAll(".image-slider");

	sliders.forEach((slider) => {
		const images = slider.querySelectorAll(".slider-image");
		const dots = slider.querySelectorAll(".slider-dot");
		let currentSlide = 0;
		let intervalId = null;

		// Slider'ı başlat
		function startSlider() {
			intervalId = setInterval(() => {
				currentSlide = (currentSlide + 1) % images.length;
				goToSlide(currentSlide);
			}, 4000); // 4 saniyede bir geçiş
		}

		// Belirli bir slide'a git
		function goToSlide(index) {
			// Tüm resimleri gizle
			images.forEach((img, i) => {
				img.classList.remove("active");
				if (i === index) {
					img.classList.add("active");
					// Aktif görseli yükle (eğer data-src varsa)
					if (img.dataset.src && !img.src) {
						img.src = img.dataset.src;
						img.removeAttribute("data-src");
					}
				}
			});

			// Tüm dot'ları güncelle
			dots.forEach((dot, i) => {
				dot.classList.remove("active");
				if (i === index) {
					dot.classList.add("active");
				}
			});

			currentSlide = index;

			// Aktif görselin aspect ratio'sunu uygula
			const activeImage = images[index];
			if (activeImage) {
				// Görsel yüklendikten sonra aspect ratio uygula
				if (activeImage.complete && activeImage.naturalWidth > 0) {
					applyAspectRatio(activeImage);
				} else {
					activeImage.addEventListener(
						"load",
						function () {
							applyAspectRatio(this);
						},
						{ once: true }
					);
				}
			}
		}

		// Dot'lara tıklama event'i
		dots.forEach((dot, index) => {
			dot.addEventListener("click", () => {
				// Slider'ı durdur
				if (intervalId) {
					clearInterval(intervalId);
				}
				goToSlide(index);
				// 3 saniye sonra tekrar başlat
				setTimeout(() => {
					startSlider();
				}, 3000);
			});
		});

		// Slider'ı başlat
		startSlider();

		// Hover'da durdur, çıkınca devam et
		slider.addEventListener("mouseenter", () => {
			if (intervalId) {
				clearInterval(intervalId);
			}
		});

		slider.addEventListener("mouseleave", () => {
			startSlider();
		});
	});
}
/*
// Section Horizontal Scroll with GSAP ScrollTrigger
function initializeHorizontalScroll() {
	// GSAP ve ScrollTrigger kontrolü
	if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
		console.error("GSAP or ScrollTrigger not loaded");
		setTimeout(initializeHorizontalScroll, 100);
		return;
	}

	gsap.registerPlugin(ScrollTrigger);

	const sections = document.querySelectorAll("section:not(footer section)");
	if (sections.length === 0) {
		console.error("No sections found");
		return;
	}

	console.log(`Found ${sections.length} sections`);

	// Section içinde yatay scroll için GSAP ScrollTrigger kullan
	const triggerSections = Array.from(sections).filter(
		(section, i) => i < sections.length - 1
	);

	// Her section için ScrollTrigger oluştur (son section hariç)
	triggerSections.forEach((section, i) => {
		const contentWrapper =
			section.querySelector(".max-w-7xl") ||
			section.querySelector("> div:first-child");
		if (!contentWrapper) return;

		const maxTranslateX = Math.min(400, window.innerWidth * 0.3); // Maksimum kaydırma miktarı

		// Her section için yatay scroll animasyonu
		gsap.fromTo(
			contentWrapper,
			{ xPercent: 0 },
			{
				xPercent: maxTranslateX,
				ease: "none",
				scrollTrigger: {
					trigger: section,
					id: `section-${i}`,
					start: "bottom bottom",
					end: () => `+=${window.innerWidth}`,
					scrub: true,
				},
			}
		);
	});
	
	// Initial setup - DOM tam yüklendikten sonra
	setTimeout(() => {
		ScrollTrigger.refresh();
		console.log(
			"Section horizontal scroll initialized with GSAP ScrollTrigger"
		);
	}, 300);

	// Event listeners
	window.addEventListener("resize", () => {
		ScrollTrigger.refresh();
	});

	// Load event'inde de güncelle

	window.addEventListener("load", () => {
		setTimeout(() => {
			ScrollTrigger.refresh();
			if (typeof AOS !== "undefined") {
				AOS.refresh();
			}
		}, 100);
	});
	
}
*/
