// =============================================
// AD PROVIDER - AdMob Integration
// =============================================

import { ADS_CONFIG, CURRENT_ENV, ENV } from './ads-config.js';

class AdProvider {
    constructor() {
        this.isInitialized = false;
        this.config = ADS_CONFIG[CURRENT_ENV];
        this.testMode = this.config.testMode;
        this.adUnits = {
            banner: this.config.banner,
            interstitial: this.config.interstitial,
            rewarded: this.config.rewarded,
            native: this.config.native
        };
    }

    // =========================================
    // INITIALIZATION
    // =========================================

    async init() {
        try {
            // تهيئة AdMob (في الـ Web نستخدم الإعلانات التجريبية)
            if (typeof window !== 'undefined') {
                // تهيئة AdMob SDK إذا كان متاحاً
                if (window.AdMob) {
                    await window.AdMob.initialize();
                }
                console.log('✅ Ad Provider initialized');
            }
            this.isInitialized = true;
            return true;
        } catch (error) {
            console.warn('⚠️ Ad Provider init failed:', error);
            this.isInitialized = true;
            return false;
        }
    }

    // =========================================
    // BANNER
    // =========================================

    showBanner(placement = 'home') {
        try {
            console.log(`📢 Showing banner ad at: ${placement}`);
            // في الـ Web، نستخدم إعلانات تجريبية
            if (typeof window !== 'undefined') {
                // محاكاة عرض إعلان
                const event = new CustomEvent('ad_banner_shown', { 
                    detail: { placement, unitId: this.adUnits.banner }
                });
                window.dispatchEvent(event);
            }
            return true;
        } catch (error) {
            console.error('❌ Failed to show banner:', error);
            return false;
        }
    }

    hideBanner() {
        try {
            console.log('📢 Hiding banner ad');
            if (typeof window !== 'undefined') {
                const event = new CustomEvent('ad_banner_hidden', {});
                window.dispatchEvent(event);
            }
            return true;
        } catch (error) {
            console.error('❌ Failed to hide banner:', error);
            return false;
        }
    }

    // =========================================
    // INTERSTITIAL
    // =========================================

    showInterstitial(placement = 'general') {
        try {
            console.log(`📢 Showing interstitial ad at: ${placement}`);
            
            // محاكاة ظهور إعلان
            if (typeof window !== 'undefined') {
                const event = new CustomEvent('ad_interstitial_shown', { 
                    detail: { placement, unitId: this.adUnits.interstitial }
                });
                window.dispatchEvent(event);
                
                // محاكاة إغلاق الإعلان بعد 3 ثواني
                setTimeout(() => {
                    const closeEvent = new CustomEvent('ad_interstitial_closed', {});
                    window.dispatchEvent(closeEvent);
                }, 3000);
            }
            return true;
        } catch (error) {
            console.error('❌ Failed to show interstitial:', error);
            return false;
        }
    }

    // =========================================
    // REWARDED
    // =========================================

    showRewarded() {
        return new Promise((resolve) => {
            try {
                console.log('📢 Showing rewarded ad');
                
                // محاكاة إعلان المكافأة
                if (typeof window !== 'undefined') {
                    const event = new CustomEvent('ad_rewarded_started', {});
                    window.dispatchEvent(event);
                    
                    // محاكاة إكمال الإعلان بعد 5 ثواني
                    setTimeout(() => {
                        const reward = Math.random() > 0.1; // 90% نجاح
                        if (reward) {
                            const completeEvent = new CustomEvent('ad_rewarded_completed', {});
                            window.dispatchEvent(completeEvent);
                            resolve(true);
                        } else {
                            const failEvent = new CustomEvent('ad_rewarded_failed', {});
                            window.dispatchEvent(failEvent);
                            resolve(false);
                        }
                    }, 5000);
                } else {
                    resolve(false);
                }
            } catch (error) {
                console.error('❌ Failed to show rewarded ad:', error);
                resolve(false);
            }
        });
    }

    // =========================================
    // NATIVE
    // =========================================

    showNative(containerId) {
        try {
            console.log(`📢 Showing native ad in: ${containerId}`);
            // محاكاة عرض إعلان Native
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = `
                    <div style="background: var(--card-bg); border-radius: 12px; padding: 16px; 
                         border: 1px solid var(--bg); text-align: center;">
                        <div style="font-size: 14px; color: var(--text-secondary);">إعلان</div>
                        <div style="font-size: 18px; font-weight: 600; color: var(--primary);">
                            NOVA Currency
                        </div>
                        <div style="font-size: 13px; color: var(--text-secondary);">
                            تابع أسعار العملات لحظة بلحظة
                        </div>
                        <button style="margin-top: 8px; padding: 6px 24px; background: var(--primary); 
                                color: white; border: none; border-radius: 8px; cursor: pointer;">
                            تحميل التطبيق
                        </button>
                    </div>
                `;
            }
            return true;
        } catch (error) {
            console.error('❌ Failed to show native ad:', error);
            return false;
        }
    }

    // =========================================
    // UTILITY
    // =========================================

    isTestMode() {
        return this.testMode;
    }

    getAdUnitId(type) {
        return this.adUnits[type] || null;
    }
}

// Singleton
const adProvider = new AdProvider();
export default adProvider;