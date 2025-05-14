// حماية الفيديو من التحميل والنسخ
class VideoProtection {
    constructor(videoElement) {
        this.video = videoElement;
        this.init();
    }

    init() {
        // منع النقر بزر الماوس الأيمن
        this.video.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showMessage('لا يمكنك تحميل هذا الفيديو');
        });

        // منع فتح أدوات المطور
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.ctrlKey && e.shiftKey && e.key === 'J') ||
                (e.ctrlKey && e.key === 'U')) {
                e.preventDefault();
                this.showMessage('غير مسموح بفتح أدوات المطور');
            }
        });

        // منع نسخ النص
        document.addEventListener('copy', (e) => {
            e.preventDefault();
            this.showMessage('لا يمكنك نسخ محتوى هذه الصفحة');
        });

        // منع سحب وإفلات الفيديو
        this.video.addEventListener('dragstart', (e) => {
            e.preventDefault();
        });

        // منع التقاط لقطات الشاشة
        this.video.addEventListener('loadedmetadata', () => {
            this.video.style.userSelect = 'none';
            this.video.style.webkitUserSelect = 'none';
        });

        // إضافة علامة مائية ديناميكية
        this.addWatermark();
    }

    showMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 9999;
            font-family: Arial, sans-serif;
        `;
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        setTimeout(() => messageDiv.remove(), 3000);
    }

    addWatermark() {
        const watermark = document.createElement('div');
        watermark.style.cssText = `
            position: absolute;
            bottom: 10px;
            right: 10px;
            color: rgba(255,255,255,0.7);
            font-size: 14px;
            font-family: Arial, sans-serif;
            pointer-events: none;
            z-index: 100;
        `;
        watermark.textContent = `© ${document.querySelector('meta[name="username"]').content}`;
        this.video.parentElement.style.position = 'relative';
        this.video.parentElement.appendChild(watermark);
    }
}

// استخدام الحماية
document.addEventListener('DOMContentLoaded', () => {
    const videoElements = document.querySelectorAll('video');
    videoElements.forEach(video => {
        new VideoProtection(video);
    });
});