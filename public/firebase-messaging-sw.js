importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyDKCzk80RBsZ9yoTWKVL5ILYgH0ww5jfbE",
    authDomain: "fcm-driver-management.firebaseapp.com",
    projectId: "fcm-driver-management",
    storageBucket: "fcm-driver-management.appspot.com",
    messagingSenderId: "403802560323",
    appId: "1:403802560323:web:71f20afb4d178abf1c81f6",
    measurementId: "G-QC28PSJBZN"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        // Đính kèm toàn bộ payload để có thể gửi lại cho FE khi click
        data: payload,
        icon: '/images/logo.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);

    // Nếu có cửa sổ đang mở, gửi payload ngay lập tức
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
        clientList.forEach(function (client) {
            try {
                client.postMessage({ type: 'FCM_BACKGROUND_MESSAGE', payload: payload });
            } catch (e) {
                // ignore
            }
        });
    });
});

// Khi người dùng click vào thông báo, focus app và gửi payload sang FE
self.addEventListener('notificationclick', function (event) {
    const payload = (event.notification && event.notification.data) || null;
    event.notification.close();
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            if (clientList.length > 0) {
                const client = clientList[0];
                client.focus();
                try { client.postMessage({ type: 'FCM_NOTIFICATION_CLICK', payload: payload }); } catch (e) {}
                return;
            }
            return self.clients.openWindow('/notification');
        })
    );
});