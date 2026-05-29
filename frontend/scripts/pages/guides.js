document.addEventListener("DOMContentLoaded", () => {
    const guidesContainer = document.getElementById("guides-container");
    const searchInput = document.getElementById("search-guide-input");
    const searchBtn = document.getElementById("btn-search-guide");
    let currentCategory = "all";
    let allGuides = [];

    
    const loadGuides = () => {
        fetch("http://127.0.0.1:5600/api/guides")
            .then(res => {
                if (!res.ok) throw new Error("Không thể tải danh sách cẩm nang!");
                return res.json();
            })
            .then(data => {
                allGuides = data;
                renderGuides(allGuides);
            })
            .catch(err => {
                console.error(err);
                if (guidesContainer) {
                    guidesContainer.innerHTML = `<div class="grid-col-all text-center text-muted p-md">Đã xảy ra lỗi khi tải danh sách cẩm nang.</div>`;
                }
            });
    };

    
    const renderGuides = (filteredData) => {
        if (!guidesContainer) return;
        guidesContainer.innerHTML = "";

        if (filteredData.length === 0) {
            guidesContainer.innerHTML = `
                <div class="no-guides text-center grid-col-all py-md">
                    <i class="fa-solid fa-folder-open"></i>
                    <p class="text-muted fs-md">Không tìm thấy bài viết cẩm nang nào khớp với từ khóa tìm kiếm.</p>
                </div>
            `;
            return;
        }

        guidesContainer.innerHTML = filteredData.map(guide => {
            const wordCount = guide.content ? guide.content.split(/\s+/).length : 0;
            const readTime = Math.max(1, Math.ceil(wordCount / 200));
            return `
            <article class="guide-card">
                <div class="guide-img-box">
                    <img src="${guide.img}" alt="${guide.title}">
                    <span class="guide-category-tag">${guide.category}</span>
                </div>
                <div class="guide-info-box">
                    <div class="guide-meta-top d-flex justify-between align-center">
                        <span class="guide-author"><i class="fa-regular fa-user"></i> Ban biên tập AnPV</span>
                        <span class="guide-date"><i class="fa-regular fa-calendar"></i> ${guide.created_at || 'Mới cập nhật'}</span>
                    </div>
                    <h3 class="guide-title">${guide.title}</h3>
                    <p class="guide-desc-short">${guide.summary}</p>
                    
                    <div class="guide-footer-row d-flex justify-between align-center">
                        <span class="guide-readtime"><i class="fa-regular fa-clock"></i> ${readTime} phút đọc</span>
                        <button class="btn-read-guide" data-id="${guide.id}">Đọc ngay <i class="fa-solid fa-arrow-right"></i></button>
                    </div>
                </div>
            </article>
            `;
        }).join('');

        
        guidesContainer.querySelectorAll(".guide-card").forEach(card => {
            card.addEventListener("click", () => {
                const btn = card.querySelector(".btn-read-guide");
                const guideId = btn.dataset.id;
                window.location.href = `detail.html?id=${guideId}`;
            });
        });
    };

    
    const filterAndSearch = () => {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
        let result = allGuides;

        
        if (currentCategory !== "all") {
            result = result.filter(g => {
                if (currentCategory === "explore") return g.category === "Khám phá";
                if (currentCategory === "food") return g.category === "Ẩm thực";
                if (currentCategory === "tips") return g.category === "Mẹo vặt";
                return true;
            });
        }

        
        if (query) {
            result = result.filter(g => 
                g.title.toLowerCase().includes(query) || 
                g.summary.toLowerCase().includes(query) || 
                g.content.toLowerCase().includes(query)
            );
        }

        renderGuides(result);
    };

    
    const tabs = document.querySelectorAll(".guide-tab");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            
            currentCategory = tab.dataset.category;
            filterAndSearch();
        });
    });

    
    if (searchBtn) {
        searchBtn.addEventListener("click", filterAndSearch);
    }
    if (searchInput) {
        searchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                filterAndSearch();
            }
        });
    }

    
    loadGuides();
});
