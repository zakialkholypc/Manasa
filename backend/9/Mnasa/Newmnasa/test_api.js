// API Service للتعامل مع الفيديوهات
class VideoAPIService {
    constructor(baseUrl = 'http://localhost:8000/api') {
        this.baseUrl = baseUrl;
        this.token = localStorage.getItem('token');
    }

    // تسجيل الدخول
    async login(username, password) {
        try {
            const response = await fetch(`${this.baseUrl}/auth/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                throw new Error('فشل تسجيل الدخول');
            }

            const data = await response.json();
            this.token = data.token;
            localStorage.setItem('token', data.token);
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    // الحصول على معلومات الفيديو
    async getVideo(lessonId) {
        try {
            const response = await fetch(`${this.baseUrl}/lessons/${lessonId}/video/`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                throw new Error('فشل في الحصول على الفيديو');
            }

            return await response.json();
        } catch (error) {
            console.error('Get video error:', error);
            throw error;
        }
    }

    // بدء تشغيل الفيديو
    async startVideo(lessonId) {
        try {
            const response = await fetch(`${this.baseUrl}/lessons/${lessonId}/start/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                throw new Error('فشل في بدء تشغيل الفيديو');
            }

            return await response.json();
        } catch (error) {
            console.error('Start video error:', error);
            throw error;
        }
    }

    // إرسال تقدم المشاهدة
    async updateProgress(lessonId, progress) {
        try {
            const response = await fetch(`${this.baseUrl}/lessons/${lessonId}/progress/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ progress })
            });

            if (!response.ok) {
                throw new Error('فشل في تحديث التقدم');
            }

            return await response.json();
        } catch (error) {
            console.error('Update progress error:', error);
            throw error;
        }
    }
}

// إنشاء نسخة من الـ API Service
const api = new VideoAPIService();

// مثال على الاستخدام
async function testAPI() {
    try {
        // تسجيل الدخول
        await api.login('username', 'password');

        // الحصول على الفيديو
        const videoData = await api.getVideo(1);
        console.log('Video data:', videoData);

        // بدء تشغيل الفيديو
        await api.startVideo(1);

        // تحديث التقدم كل 30 ثانية
        setInterval(async () => {
            const video = document.getElementById('lesson-video');
            if (video) {
                const progress = (video.currentTime / video.duration) * 100;
                await api.updateProgress(1, progress);
            }
        }, 30000);
    } catch (error) {
        console.error('API test error:', error);
    }
}

// تشغيل الاختبار عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', testAPI); 