// =============================================
// SERVICE WORKER - الإصدار النهائي
// =============================================

const CACHE_NAME = 'nova-currency-v3';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './admin.html',
    './manifest.json',
    './firebase.js',
    './app.js',
    './ads-config.js',
    './ads-manager.js',
    './ads-provider.js',
    './pro-service.js',
    './pro-ui.js',
    './assets/icons/icon-192.png',
    './assets/icons/icon-512.png'
];

// =============================================
// INSTALL
// =============================================
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Caching assets...');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                console.log('✅ Service Worker installed successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('❌ Service Worker install failed:', error);
            })
    );
});

// =============================================
// ACTIVATE
// =============================================
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => {
                return Promise.all(
                    keys.map(key => {
                        if (key !== CACHE_NAME) {
                            console.log('🗑️ Removing old cache:', key);
                            return caches.delete(key);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker activated successfully');
                return self.clients.claim();
            })
    );
});

// =============================================
// FETCH - Network First with Cache Fallback
// =============================================
self.addEventListener('fetch', event => {
    // تجاهل طلبات Firebase و Analytics
    if (event.request.url.includes('firebase') || 
        event.request.url.includes('google') ||
        event.request.url.includes('analytics')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // تخزين النسخة الجديدة في الكاش
                if (response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseClone);
                        })
                        .catch(error => {
                            console.warn('⚠️ Could not cache:', error);
                        });
                }
                return response;
            })
            .catch(() => {
                // إذا فشل الشبكة، استخدم الكاش
                return caches.match(event.request)
                    .then(cachedResponse => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        // إذا لم يكن في الكاش، عرض صفحة Offline
                        if (event.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }
                        return new Response('Offline - لا يوجد اتصال بالإنترنت', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

// =============================================
// PUSH NOTIFICATIONS
// =============================================
self.addEventListener('push', event => {
    let data = {};
    try {
        data = event.data.json();
    } catch (e) {
        data = {
            title: 'NOVA Currency',
            body: '📊 تحديث جديد في أسعار العملات',
            icon: '/assets/icons/icon-192.png'
        };
    }

    const options = {
        body: data.body || '📊 تحديث جديد في أسعار العملات',
        icon: data.icon || '/assets/icons/icon-192.png',
        badge: data.badge || '/assets/icons/icon-192.png',
        vibrate: [200, 100, 200],
        data: {
            url: data.url || '/'
        },
        actions: [
            {
                action: 'open',
                title: '📊 عرض الأسعار'
            },
            {
                action: 'close',
                title: '❌ إغلاق'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'NOVA Currency', options)
    );
});

// =============================================
// NOTIFICATION CLICK
// =============================================
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'open' || !event.action) {
        const url = event.notification.data?.url || '/';
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true })
                .then(windowClients => {
                    for (let client of windowClients) {
                        if (client.url.includes(url) && 'focus' in client) {
                            return client.focus();
                        }
                    }
                    if (clients.openWindow) {
                        return clients.openWindow(url);
                    }
                })
        );
    }
});
