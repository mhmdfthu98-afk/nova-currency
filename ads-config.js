// =============================================
// ADS CONFIGURATION
// =============================================

// بيئة التشغيل
export const ENV = {
    DEVELOPMENT: 'development',
    STAGING: 'staging',
    PRODUCTION: 'production'
};

// الإعدادات الحالية
export const CURRENT_ENV = 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' 
    ? ENV.DEVELOPMENT 
    : ENV.PRODUCTION;

// إعدادات الإعلانات حسب البيئة
export const ADS_CONFIG = {
    [ENV.DEVELOPMENT]: {
        // Test Ad Unit IDs (Google Test IDs)
        banner: 'ca-app-pub-3940256099942544/6300978111',
        interstitial: 'ca-app-pub-3940256099942544/1033173712',
        rewarded: 'ca-app-pub-3940256099942544/5224354917',
        native: 'ca-app-pub-3940256099942544/2247696110',
        testMode: true
    },
    [ENV.STAGING]: {
        // Staging Ad Unit IDs (استبدلها بـ IDs حقيقية للـ Staging)
        banner: 'ca-app-pub-3940256099942544/6300978111',
        interstitial: 'ca-app-pub-3940256099942544/1033173712',
        rewarded: 'ca-app-pub-3940256099942544/5224354917',
        native: 'ca-app-pub-3940256099942544/2247696110',
        testMode: true
    },
    [ENV.PRODUCTION]: {
        // Production Ad Unit IDs (استبدلها بـ IDs حقيقية من AdMob)
        banner: 'YOUR_PRODUCTION_BANNER_ID',
        interstitial: 'YOUR_PRODUCTION_INTERSTITIAL_ID',
        rewarded: 'YOUR_PRODUCTION_REWARDED_ID',
        native: 'YOUR_PRODUCTION_NATIVE_ID',
        testMode: false
    }
};

// الإعدادات الافتراضية الآمنة
export const DEFAULT_ADS_SETTINGS = {
    enabled: false,
    bannerEnabled: true,
    interstitialEnabled: true,
    rewardedEnabled: false,
    nativeEnabled: false,
    cooldownSeconds: 60,
    dailyLimit: 5,
    sessionLimit: 3,
    placements: {
        home: true,
        rates: true,
        converter: false,
        currencyDetails: true,
        news: true
    },
    frequencyCap: {
        impressionsPerHour: 10,
        impressionsPerDay: 20
    }
};

// أزرار الكميات السريعة للمحول
export const QUICK_AMOUNTS = [100, 500, 1000, 5000, 10000, 50000, 100000];

// العملات السريعة للمحول
export const QUICK_CURRENCIES = ['USD', 'EUR', 'SAR', 'AED', 'EGP', 'GBP', 'ETB'];