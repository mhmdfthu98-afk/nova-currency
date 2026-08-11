// =============================================
// ADS MANAGER - CORE SYSTEM
// =============================================

import { ADS_CONFIG, CURRENT_ENV, ENV, DEFAULT_ADS_SETTINGS } from './ads-config.js';

class AdsManager {
    constructor() {
        this.settings = { ...DEFAULT_ADS_SETTINGS };
        this.sessionData = {
            adsShown: 0,
            lastInterstitialTime: null,
            lastBannerTime: null,
            sessionStartedAt: Date.now(),
            dailyAds: this.getDailyCount()
        };
        this.isPro = false;
        this.isLoaded = false;
        this.listeners = [];
        this.adProviders = [];
    }

    // =========================================
    // INITIALIZATION
    // =========================================

    async init() {
        try {
            // تحميل الإعدادات من Firebase
            await this.loadSettingsFromFirebase();
            
            // تحميل حالة المستخدم
            await this.loadUserStatus();
            
            // تهيئة مزودي الإعلانات
            await this.initProviders();
            
            this.isLoaded = true;
            this.notifyListeners('ready', { settings: this.settings });
            
            console.log('✅ Ads Manager initialized');
            return true;
        } catch (error) {
            console.error('❌ Ads Manager init failed:', error);
            // استخدام الإعدادات الآمنة
            this.settings = { ...DEFAULT_ADS_SETTINGS, enabled: false };
            this.isLoaded = true;
            return false;
        }
    }

    // =========================================
    // SETTINGS
    // =========================================

    async loadSettingsFromFirebase() {
        try {
            // استخدام import ديناميكي لتجنب مشاكل الدورة
            const { db, doc, getDoc } = await import('./firebase.js');
            
            const docRef = doc(db, 'settings', 'ads');
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                this.settings = { ...this.settings, ...docSnap.data() };
                console.log('✅ Ads settings loaded from Firebase');
            } else {
                // إنشاء إعدادات افتراضية في Firebase
                await this.saveSettingsToFirebase(this.settings);
            }
        } catch (error) {
            console.warn('⚠️ Could not load ads settings from Firebase, using defaults', error);
        }
    }

    async saveSettingsToFirebase(settings) {
        try {
            const { db, doc, setDoc } = await import('./firebase.js');
            await setDoc(doc(db, 'settings', 'ads'), settings);
            console.log('✅ Ads settings saved to Firebase');
        } catch (error) {
            console.error('❌ Failed to save ads settings:', error);
        }
    }

    async loadUserStatus() {
        try {
            const { auth, onAuthStateChanged } = await import('./firebase.js');
            
            return new Promise((resolve) => {
                const unsubscribe = onAuthStateChanged(auth, async (user) => {
                    unsubscribe();
                    if (user) {
                        // التحقق من حالة Pro
                        const { db, doc, getDoc } = await import('./firebase.js');
                        const userRef = doc(db, 'users', user.uid);
                        const userSnap = await getDoc(userRef);
                        
                        if (userSnap.exists()) {
                            this.isPro = userSnap.data().isPro || false;
                        }
                    }
                    resolve();
                });
            });
        } catch (error) {
            console.warn('⚠️ Could not load user status:', error);
            this.isPro = false;
        }
    }

    async initProviders() {
        // تهيئة مزودي الإعلانات (سيتم إضافتهم لاحقاً)
        // يمكن إضافة AdMob, Google Ads, إلخ
        this.adProviders = [];
    }

    // =========================================
    // AD CHECKING
    // =========================================

    canShowAd(type = 'interstitial') {
        // التحقق من Pro
        if (this.isPro) return false;
        
        // التحقق من التفعيل العام
        if (!this.settings.enabled) return false;
        
        // التحقق من تفعيل نوع الإعلان
        if (type === 'banner' && !this.settings.bannerEnabled) return false;
        if (type === 'interstitial' && !this.settings.interstitialEnabled) return false;
        if (type === 'rewarded' && !this.settings.rewardedEnabled) return false;
        if (type === 'native' && !this.settings.nativeEnabled) return false;

        // التحقق من Cooldown (للـ Interstitial)
        if (type === 'interstitial') {
            const cooldown = this.settings.cooldownSeconds || 60;
            const lastTime = this.sessionData.lastInterstitialTime;
            if (lastTime && (Date.now() - lastTime) < cooldown * 1000) {
                return false;
            }
        }

        // التحقق من الحد اليومي
        if (this.sessionData.dailyAds >= (this.settings.dailyLimit || 5)) {
            return false;
        }

        // التحقق من حد الجلسة
        if (this.sessionData.adsShown >= (this.settings.sessionLimit || 3)) {
            return false;
        }

        return true;
    }

    // =========================================
    // SHOW ADS
    // =========================================

    showBanner(placement = 'home') {
        if (!this.canShowAd('banner')) {
            this.hideBanner();
            return false;
        }

        // التحقق من التفعيل للمكان
        if (!this.settings.placements?.[placement]) {
            return false;
        }

        this.notifyListeners('banner_show', { placement });
        this.sessionData.lastBannerTime = Date.now();
        return true;
    }

    hideBanner() {
        this.notifyListeners('banner_hide', {});
        return true;
    }

    showInterstitial(placement = 'general') {
        if (!this.canShowAd('interstitial')) {
            return false;
        }

        // التحقق من أن المستخدم ليس في عملية مهمة
        if (this.isCriticalAction()) {
            return false;
        }

        this.notifyListeners('interstitial_show', { placement });
        this.sessionData.adsShown++;
        this.sessionData.dailyAds++;
        this.sessionData.lastInterstitialTime = Date.now();
        this.saveDailyCount(this.sessionData.dailyAds);
        
        return true;
    }

    showRewarded(callback) {
        if (!this.canShowAd('rewarded')) {
            if (callback) callback(false);
            return false;
        }

        this.notifyListeners('rewarded_show', {});
        
        // محاكاة نجاح الإعلان (في الحقيقة سيتم استدعاؤها من الـ SDK)
        // هذه محاكاة للتطوير
        setTimeout(() => {
            if (callback) callback(true);
            this.notifyListeners('rewarded_complete', {});
        }, 3000);

        return true;
    }

    // =========================================
    // CRITICAL ACTION CHECK
    // =========================================

    isCriticalAction() {
        // التحقق من أن المستخدم ليس في عملية مهمة
        const converterActive = document.querySelector('.converter-section')?.classList?.contains('active');
        const isConverting = document.querySelector('#converterAmount')?.value?.length > 0;
        const isLogin = document.querySelector('#authModal')?.style?.display === 'flex';
        
        return converterActive || isConverting || isLogin;
    }

    // =========================================
    // DAILY COUNT
    // =========================================

    getDailyCount() {
        const today = new Date().toDateString();
        const stored = localStorage.getItem('nova_ads_daily');
        if (stored) {
            const data = JSON.parse(stored);
            if (data.date === today) {
                return data.count || 0;
            }
        }
        return 0;
    }

    saveDailyCount(count) {
        const today = new Date().toDateString();
        localStorage.setItem('nova_ads_daily', JSON.stringify({
            date: today,
            count: count
        }));
    }

    // =========================================
    // PRO STATUS
    // =========================================

    setProStatus(isPro) {
        this.isPro = isPro;
        this.notifyListeners('pro_status_change', { isPro });
        if (isPro) {
            this.hideBanner();
        }
    }

    // =========================================
    // EVENTS
    // =========================================

    on(event, callback) {
        this.listeners.push({ event, callback });
    }

    off(event, callback) {
        this.listeners = this.listeners.filter(l => 
            !(l.event === event && l.callback === callback)
        );
    }

    notifyListeners(event, data) {
        this.listeners.forEach(listener => {
            if (listener.event === event) {
                try {
                    listener.callback(data);
                } catch (e) {
                    console.error('Error in listener:', e);
                }
            }
        });
    }

    // =========================================
    // RESET
    // =========================================

    resetSession() {
        this.sessionData.adsShown = 0;
        this.sessionData.lastInterstitialTime = null;
        this.sessionData.lastBannerTime = null;
        this.sessionData.sessionStartedAt = Date.now();
    }
}

// Singleton
const adsManager = new AdsManager();
export default adsManager;