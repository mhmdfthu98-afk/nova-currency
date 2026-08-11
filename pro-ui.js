// =============================================
// PRO UI - NOVA PRO USER INTERFACE
// =============================================

import proService, { PRO_FEATURES, DEFAULT_PLANS } from './pro-service.js';

// =============================================
// RENDER PRO PAGE
// =============================================
export async function renderProPage() {
    const container = document.getElementById('proPageContainer');
    if (!container) return;

    const isPro = proService.isProUser();
    const subscription = proService.getSubscription();
    const plan = proService.getPlan();
    const plans = await proService.getPlans();
    const remainingDays = proService.getRemainingDays();

    if (isPro) {
        // عرض صفحة Pro الحالية
        container.innerHTML = renderProDashboard(plan, subscription, remainingDays);
    } else {
        // عرض صفحة الاشتراك
        container.innerHTML = renderProPricing(plans);
    }

    // إضافة الأحداث
    attachProEvents();
}

// =============================================
// RENDER PRO DASHBOARD
// =============================================
function renderProDashboard(plan, subscription, remainingDays) {
    const features = plan?.features || [];
    const featureIcons = features.map(id => {
        const feat = PRO_FEATURES[id];
        return feat ? `<span title="${feat.name}">${feat.icon}</span>` : '';
    }).join(' ');

    return `
        <div style="text-align:center; padding:20px 0;">
            <div style="font-size:64px; margin-bottom:12px;">⭐</div>
            <h2 style="font-size:28px; font-weight:900; color:var(--primary);">NOVA PRO</h2>
            <p style="color:var(--text-secondary);">اشتراكك نشط 🟢</p>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; max-width:500px; margin:0 auto;">
            <div style="background:var(--bg); padding:16px; border-radius:12px; text-align:center;">
                <div style="font-size:12px; color:var(--text-secondary);">الخطة</div>
                <div style="font-size:20px; font-weight:700;">${plan?.name || 'Pro'}</div>
            </div>
            <div style="background:var(--bg); padding:16px; border-radius:12px; text-align:center;">
                <div style="font-size:12px; color:var(--text-secondary);">متبقي</div>
                <div style="font-size:20px; font-weight:700; color:${remainingDays > 7 ? 'var(--success)' : 'var(--error)'}">
                    ${remainingDays} يوم
                </div>
            </div>
            <div style="background:var(--bg); padding:16px; border-radius:12px; text-align:center;">
                <div style="font-size:12px; color:var(--text-secondary);">المميزات</div>
                <div style="font-size:20px; font-weight:700;">${features.length} ميزة</div>
            </div>
            <div style="background:var(--bg); padding:16px; border-radius:12px; text-align:center;">
                <div style="font-size:12px; color:var(--text-secondary);">المزود</div>
                <div style="font-size:16px; font-weight:600;">${subscription?.provider || '—'}</div>
            </div>
        </div>

        <div style="margin-top:20px; padding:16px; background:var(--bg); border-radius:12px;">
            <h4 style="margin-bottom:12px;">📦 المميزات المتاحة</h4>
            <div style="display:flex; gap:12px; flex-wrap:wrap; justify-content:center;">
                ${features.map(id => {
                    const feat = PRO_FEATURES[id];
                    return feat ? `
                        <span style="background:var(--card-bg); padding:8px 16px; border-radius:20px; font-size:14px;">
                            ${feat.icon} ${feat.name}
                        </span>
                    ` : '';
                }).join('')}
            </div>
        </div>

        <div style="margin-top:20px; display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
            <button id="manageSubscriptionBtn" class="btn btn-primary" style="padding:12px 32px;">
                ⚙️ إدارة الاشتراك
            </button>
            <button id="restorePurchasesBtn" class="btn btn-secondary" style="padding:12px 32px; background:var(--bg); color:var(--text);">
                🔄 استعادة المشتريات
            </button>
        </div>
    `;
}

// =============================================
// RENDER PRO PRICING
// =============================================
function renderProPricing(plans) {
    const plansList = plans.length > 0 ? plans : Object.values(DEFAULT_PLANS);

    return `
        <div style="text-align:center; padding:20px 0;">
            <div style="font-size:48px; margin-bottom:12px;">⭐</div>
            <h2 style="font-size:28px; font-weight:900; color:var(--primary);">NOVA PRO</h2>
            <p style="color:var(--text-secondary); max-width:400px; margin:0 auto 20px;">
                طوّر تجربة NOVA مع المميزات الحصرية
            </p>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:20px; max-width:700px; margin:0 auto;">
            ${plansList.map(plan => `
                <div style="background:var(--card-bg); border-radius:var(--radius); padding:24px; box-shadow:var(--shadow); border:2px solid ${plan.id === 'monthly' ? 'var(--primary)' : 'transparent'}; position:relative;">
                    ${plan.id === 'monthly' ? '<div style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:var(--primary); color:white; padding:4px 16px; border-radius:20px; font-size:12px; font-weight:600;">الأكثر شيوعاً</div>' : ''}
                    <h3 style="font-size:20px; font-weight:800;">${plan.name}</h3>
                    <div style="font-size:32px; font-weight:900; color:var(--primary); margin:12px 0;">
                        ${plan.price} <span style="font-size:16px; font-weight:400; color:var(--text-secondary);">${plan.currency}</span>
                    </div>
                    <div style="font-size:13px; color:var(--text-secondary); margin-bottom:16px;">
                        ${plan.billingPeriod === 'monthly' ? 'شهرياً' : 'سنوياً'}
                        ${plan.id === 'yearly' ? '✨ وفر 25%' : ''}
                    </div>
                    <ul style="list-style:none; text-align:right; margin-bottom:20px;">
                        ${(plan.features || []).map(id => {
                            const feat = PRO_FEATURES[id];
                            return feat ? `<li style="padding:6px 0; border-bottom:1px solid var(--bg);">${feat.icon} ${feat.name}</li>` : '';
                        }).join('')}
                    </ul>
                    <button class="subscribe-btn btn btn-primary" data-plan="${plan.id}" style="width:100%; padding:14px;">
                        ${plan.id === 'monthly' ? '⭐ ابدأ NOVA PRO' : '📅 اشترك سنوياً'}
                    </button>
                </div>
            `).join('')}
        </div>

        <div style="text-align:center; margin-top:20px; color:var(--text-secondary); font-size:13px;">
            🔒 الدفع آمن · يمكنك الإلغاء في أي وقت
        </div>
    `;
}

// =============================================
// FEATURE GATING
// =============================================
export function checkFeatureAccess(featureId, redirectToPro = true) {
    const isPro = proService.isProUser();
    const hasFeature = proService.hasFeature(featureId);

    if (isPro && hasFeature) {
        return true;
    }

    if (redirectToPro) {
        showProFeatureModal(featureId);
    }

    return false;
}

// =============================================
// SHOW PRO FEATURE MODAL
// =============================================
export function showProFeatureModal(featureId) {
    const feature = PRO_FEATURES[featureId];
    if (!feature) return;

    const modalHTML = `
        <div class="modal-overlay active" id="proFeatureModal">
            <div class="modal" style="max-width:400px; text-align:center;">
                <div class="modal-header">
                    <h3 style="font-size:20px;">⭐ NOVA PRO</h3>
                    <button class="modal-close" id="proFeatureModalClose">✕</button>
                </div>
                <div class="modal-body">
                    <div style="font-size:48px; margin-bottom:12px;">${feature.icon}</div>
                    <h3 style="font-size:20px; font-weight:800; margin-bottom:8px;">${feature.name}</h3>
                    <p style="color:var(--text-secondary); margin-bottom:16px;">${feature.description}</p>
                    <div style="background:var(--bg); padding:16px; border-radius:12px; margin-bottom:16px; text-align:right;">
                        <div style="font-weight:600; margin-bottom:8px;">📦 مميزات NOVA PRO:</div>
                        <ul style="list-style:none;">
                            <li style="padding:4px 0;">🚫 بدون إعلانات</li>
                            <li style="padding:4px 0;">🔔 تنبيهات غير محدودة</li>
                            <li style="padding:4px 0;">📊 رسوم بيانية متقدمة</li>
                            <li style="padding:4px 0;">📅 تاريخ أسعار طويل</li>
                        </ul>
                    </div>
                    <button id="upgradeFromModalBtn" class="btn btn-primary" style="width:100%; padding:14px;">
                        ⭐ ترقية إلى NOVA PRO
                    </button>
                    <button id="closeFeatureModalBtn" style="background:none; border:none; color:var(--text-secondary); cursor:pointer; margin-top:12px; font-size:14px;">
                        تذكر لاحقاً
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('proFeatureModalClose').addEventListener('click', () => {
        document.getElementById('proFeatureModal').remove();
    });

    document.getElementById('closeFeatureModalBtn').addEventListener('click', () => {
        document.getElementById('proFeatureModal').remove();
    });

    document.getElementById('upgradeFromModalBtn').addEventListener('click', () => {
        document.getElementById('proFeatureModal').remove();
        window.location.hash = '#pro';
    });
}

// =============================================
// ATTACH EVENTS
// =============================================
function attachProEvents() {
    // أزرار الاشتراك
    document.querySelectorAll('.subscribe-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const planId = btn.dataset.plan;
            handleSubscribe(planId);
        });
    });

    // إدارة الاشتراك
    document.getElementById('manageSubscriptionBtn')?.addEventListener('click', () => {
        showToast('🔄 جاري التوجيه إلى صفحة الإدارة...', 'info');
        // في الإنتاج، سيتم التوجيه إلى صفحة الدفع
    });

    // استعادة المشتريات
    document.getElementById('restorePurchasesBtn')?.addEventListener('click', () => {
        handleRestorePurchases();
    });
}

// =============================================
// HANDLE SUBSCRIBE
// =============================================
function handleSubscribe(planId) {
    const user = auth.currentUser;
    if (!user) {
        showToast('⚠️ الرجاء تسجيل الدخول أولاً', 'error');
        return;
    }

    if (!navigator.onLine) {
        showToast('⚠️ لا يوجد اتصال بالإنترنت', 'error');
        return;
    }

    // محاكاة عملية الدفع
    showToast('⏳ جاري معالجة الاشتراك...', 'info');

    setTimeout(() => {
        // في الإنتاج، سيتم التوجيه إلى Payment Provider
        showToast('📱 سيتم التوجيه إلى صفحة الدفع قريباً', 'info');
    }, 2000);
}

// =============================================
// HANDLE RESTORE PURCHASES
// =============================================
function handleRestorePurchases() {
    if (!navigator.onLine) {
        showToast('⚠️ لا يوجد اتصال بالإنترنت', 'error');
        return;
    }

    showToast('🔄 جاري استعادة المشتريات...', 'info');

    setTimeout(() => {
        // في الإنتاج، سيتم التحقق من المشتريات عبر Play Store/App Store
        showToast('✅ تم استعادة المشتريات بنجاح', 'success');
        // إعادة تحميل البيانات
        proService.init();
    }, 3000);
}