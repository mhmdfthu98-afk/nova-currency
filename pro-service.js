// =============================================
// PRO SERVICE - NOVA PRO CENTRAL SYSTEM
// =============================================

import { auth, db, doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp } from './firebase.js';

// =============================================
// FEATURES MATRIX
// =============================================
export const PRO_FEATURES = {
    remove_ads: {
        id: 'remove_ads',
        name: 'إزالة الإعلانات',
        nameEn: 'Remove Ads',
        icon: '🚫',
        description: 'تصفح بدون إعلانات مزعجة',
        descriptionEn: 'Browse without annoying ads'
    },
    advanced_alerts: {
        id: 'advanced_alerts',
        name: 'تنبيهات متقدمة',
        nameEn: 'Advanced Alerts',
        icon: '🔔',
        description: 'تنبيهات غير محدودة للأسعار',
        descriptionEn: 'Unlimited price alerts'
    },
    advanced_charts: {
        id: 'advanced_charts',
        name: 'رسوم بيانية متقدمة',
        nameEn: 'Advanced Charts',
        icon: '📊',
        description: 'تحليل متقدم للأسعار',
        descriptionEn: 'Advanced price analysis'
    },
    long_history: {
        id: 'long_history',
        name: 'تاريخ طويل',
        nameEn: 'Long History',
        icon: '📅',
        description: 'سجل أسعار لأشهر سابقة',
        descriptionEn: 'Price history for months'
    },
    advanced_comparison: {
        id: 'advanced_comparison',
        name: 'مقارنات متقدمة',
        nameEn: 'Advanced Comparison',
        icon: '⚖️',
        description: 'مقارنة عدة عملات معاً',
        descriptionEn: 'Compare multiple currencies'
    },
    premium_themes: {
        id: 'premium_themes',
        name: 'ثيمات مميزة',
        nameEn: 'Premium Themes',
        icon: '🎨',
        description: 'ألوان وتصاميم حصرية',
        descriptionEn: 'Exclusive colors and designs'
    },
    future_features: {
        id: 'future_features',
        name: 'ميزات مستقبلية',
        nameEn: 'Future Features',
        icon: '🚀',
        description: 'ميزات حصرية قادمة',
        descriptionEn: 'Exclusive upcoming features'
    }
};

// =============================================
// PLANS
// =============================================
export const DEFAULT_PLANS = {
    monthly: {
        id: 'monthly',
        name: 'شهري',
        nameEn: 'Monthly',
        price: 500,
        currency: 'SDG',
        billingPeriod: 'monthly',
        features: ['remove_ads', 'advanced_alerts', 'advanced_charts', 'long_history'],
        active: true,
        displayOrder: 1,
        trialDays: 0
    },
    yearly: {
        id: 'yearly',
        name: 'سنوي',
        nameEn: 'Yearly',
        price: 4500,
        currency: 'SDG',
        billingPeriod: 'yearly',
        features: ['remove_ads', 'advanced_alerts', 'advanced_charts', 'long_history', 'advanced_comparison', 'premium_themes'],
        active: true,
        displayOrder: 2,
        trialDays: 0
    }
};

// =============================================
// SUBSCRIPTION STATUS
// =============================================
export const SUBSCRIPTION_STATUS = {
    FREE: 'free',
    TRIAL: 'trial',
    ACTIVE: 'active',
    EXPIRED: 'expired',
    CANCELLED: 'cancelled',
    PAST_DUE: 'past_due',
    UNKNOWN: 'unknown'
};

// =============================================
// PRO SERVICE CLASS
// =============================================
class ProService {
    constructor() {
        this.currentUser = null;
        this.subscription = null;
        this.plan = null;
        this.isPro = false;
        this.isLoading = true;
        this.listeners = [];
        this.unsubscribe = null;
    }

    // =============================================
    // INITIALIZATION
    // =============================================
    async init() {
        return new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                unsubscribe();
                this.currentUser = user;
                if (user) {
                    await this.loadSubscription(user.uid);
                } else {
                    this.subscription = null;
                    this.isPro = false;
                    this.isLoading = false;
                }
                this.notifyListeners('ready', { isPro: this.isPro });
                resolve();
            });
        });
    }

    // =============================================
    // LOAD SUBSCRIPTION
    // =============================================
    async loadSubscription(userId) {
        try {
            const subRef = doc(db, 'subscriptions', userId);
            const subSnap = await getDoc(subRef);

            if (subSnap.exists()) {
                const data = subSnap.data();
                this.subscription = {
                    ...data,
                    id: subSnap.id,
                    startDate: data.startDate?.toDate?.() || null,
                    endDate: data.endDate?.toDate?.() || null,
                    createdAt: data.createdAt?.toDate?.() || null,
                    updatedAt: data.updatedAt?.toDate?.() || null
                };

                // التحقق من انتهاء الصلاحية
                if (this.subscription.status === 'active' && this.subscription.endDate) {
                    const now = new Date();
                    if (this.subscription.endDate < now) {
                        this.subscription.status = 'expired';
                        await updateDoc(subRef, { status: 'expired' });
                    }
                }

                // تحميل الخطة
                if (this.subscription.planId) {
                    this.plan = await this.getPlan(this.subscription.planId);
                }

                this.isPro = this.subscription.status === 'active' || this.subscription.status === 'trial';
            } else {
                this.subscription = {
                    status: 'free',
                    planId: null,
                    features: []
                };
                this.isPro = false;
            }

            this.isLoading = false;
            this.notifyListeners('subscription_loaded', { subscription: this.subscription });

        } catch (error) {
            console.error('❌ Error loading subscription:', error);
            this.subscription = { status: 'free', features: [] };
            this.isPro = false;
            this.isLoading = false;
        }
    }

    // =============================================
    // GET PLAN
    // =============================================
    async getPlan(planId) {
        try {
            const planRef = doc(db, 'plans', planId);
            const planSnap = await getDoc(planRef);
            if (planSnap.exists()) {
                return { ...planSnap.data(), id: planSnap.id };
            }
            return null;
        } catch (error) {
            console.error('❌ Error loading plan:', error);
            return null;
        }
    }

    // =============================================
    // GET ALL PLANS
    // =============================================
    async getPlans() {
        try {
            const plansRef = collection(db, 'plans');
            const plansSnap = await getDocs(plansRef);
            const plans = [];
            plansSnap.forEach(doc => {
                const data = doc.data();
                if (data.active !== false) {
                    plans.push({ ...data, id: doc.id });
                }
            });
            return plans.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        } catch (error) {
            console.error('❌ Error loading plans:', error);
            return Object.values(DEFAULT_PLANS);
        }
    }

    // =============================================
    // CHECK FEATURE
    // =============================================
    hasFeature(featureId) {
        if (!this.isPro) return false;
        if (!this.plan) return false;
        return this.plan.features && this.plan.features.includes(featureId);
    }

    // =============================================
    // GET FEATURE STATUS
    // =============================================
    getFeatureStatus(featureId) {
        return {
            available: this.hasFeature(featureId),
            proRequired: true,
            feature: PRO_FEATURES[featureId] || null
        };
    }

    // =============================================
    // CHECK IF PRO
    // =============================================
    isProUser() {
        return this.isPro;
    }

    // =============================================
    // CHECK IF SUBSCRIPTION ACTIVE
    // =============================================
    isSubscriptionActive() {
        return this.subscription?.status === 'active' || this.subscription?.status === 'trial';
    }

    // =============================================
    // GET SUBSCRIPTION
    // =============================================
    getSubscription() {
        return this.subscription;
    }

    // =============================================
    // GET PLAN
    // =============================================
    getPlan() {
        return this.plan;
    }

    // =============================================
    // GET REMAINING DAYS
    // =============================================
    getRemainingDays() {
        if (!this.subscription?.endDate) return 0;
        const now = new Date();
        const diff = this.subscription.endDate - now;
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    // =============================================
    // GRANT PRO (ADMIN ONLY)
    // =============================================
    async grantPro(userId, planId, durationDays, reason = 'Admin grant') {
        try {
            const plan = await this.getPlan(planId);
            if (!plan) throw new Error('Plan not found');

            const startDate = new Date();
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + durationDays);

            const subRef = doc(db, 'subscriptions', userId);
            await setDoc(subRef, {
                userId: userId,
                planId: planId,
                status: 'active',
                startDate: serverTimestamp(),
                endDate: endDate,
                autoRenew: false,
                provider: 'admin',
                features: plan.features || [],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                grantReason: reason,
                grantedBy: this.currentUser?.email || 'admin'
            });

            // تسجيل في Audit Logs
            await this.logEvent(userId, 'PRO_GRANTED', { planId, durationDays, reason });

            return true;
        } catch (error) {
            console.error('❌ Error granting Pro:', error);
            return false;
        }
    }

    // =============================================
    // REVOKE PRO (ADMIN ONLY)
    // =============================================
    async revokePro(userId, reason = 'Admin revoke') {
        try {
            const subRef = doc(db, 'subscriptions', userId);
            await updateDoc(subRef, {
                status: 'expired',
                updatedAt: serverTimestamp(),
                revokeReason: reason,
                revokedBy: this.currentUser?.email || 'admin'
            });

            await this.logEvent(userId, 'PRO_REVOKED', { reason });

            return true;
        } catch (error) {
            console.error('❌ Error revoking Pro:', error);
            return false;
        }
    }

    // =============================================
    // LOG EVENT
    // =============================================
    async logEvent(userId, event, metadata = {}) {
        try {
            const eventsRef = collection(db, 'subscriptionEvents');
            await addDoc(eventsRef, {
                userId,
                event,
                timestamp: serverTimestamp(),
                metadata,
                adminEmail: this.currentUser?.email || 'system'
            });
        } catch (error) {
            console.error('❌ Error logging event:', error);
        }
    }

    // =============================================
    // EVENTS
    // =============================================
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
}

// Singleton
const proService = new ProService();
export default proService;