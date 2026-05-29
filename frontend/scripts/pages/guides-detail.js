document.addEventListener("DOMContentLoaded", () => {
    const detailContent = document.getElementById("guide-detail-content");

    
    const getQueryParam = (param) => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    };

    const guideId = getQueryParam("id");

    if (!guideId) {
        if (detailContent) {
            detailContent.innerHTML = `<div class="text-center p-md text-muted fs-md">Không tìm thấy bài viết hợp lệ!</div>`;
        }
        return;
    }

    
    const loadGuideDetail = () => {
        fetch(`http://127.0.0.1:5600/api/guides/${guideId}`)
            .then(res => {
                if (!res.ok) throw new Error("Bài viết không tồn tại!");
                return res.json();
            })
            .then(guide => {
                renderGuideDetail(guide);
            })
            .catch(err => {
                console.error(err);
                if (detailContent) {
                    detailContent.innerHTML = `
                        <div class="text-center py-md guides-detail-error">
                            <i class="fa-solid fa-triangle-exclamation text-yellow mb-10"></i>
                            <p class="text-muted fs-md">Đã xảy ra lỗi khi tải bài viết hoặc bài viết không tồn tại.</p>
                        </div>
                    `;
                }
            });
    };

    
    const renderGuideDetail = (guide) => {
        if (!detailContent) return;

        
        document.title = `${guide.title} | AnPV Cẩm nang du lịch`;

        
        const formattedContent = guide.content.split('\n').map(p => {
            if (!p.trim()) return '';
            return `<p class="guide-detail-paragraph">${p}</p>`;
        }).join('');

        detailContent.innerHTML = `
            <div class="guide-detail-hero">
                <img src="${guide.img}" alt="${guide.title}">
                <span class="guide-detail-category">${guide.category}</span>
            </div>
            <div class="guide-detail-body">
                <div class="guide-detail-meta">
                    <span><i class="fa-regular fa-user"></i> Ban biên tập AnPV</span>
                    <span><i class="fa-regular fa-calendar"></i> ${guide.created_at || 'Mới cập nhật'}</span>
                </div>
                <h1 class="guide-detail-title">${guide.title}</h1>
                <div class="guide-detail-quote">
                    ${guide.summary}
                </div>
                <div class="guide-detail-full-text">
                    ${formattedContent}
                </div>
            </div>
        `;
    };

    loadGuideDetail();
});
