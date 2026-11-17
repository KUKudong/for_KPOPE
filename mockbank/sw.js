/* 새싹뱅크 모의 앱: 오프라인에서도 열리도록 화면 파일과 글꼴을 저장한다 */
var CACHE = 'saessak-mockbank-cache-v3';
var SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var sameOrigin = new URL(e.request.url).origin === self.location.origin;
  if (sameOrigin) {
    /* 화면 파일: 새 버전을 먼저 받고, 인터넷이 없으면 저장본 사용 */
    e.respondWith(fetch(e.request).then(function (r) {
      var copy = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); }); return r;
    }).catch(function () { return caches.match(e.request, { ignoreSearch: true }); }));
  } else {
    /* 글꼴: 저장본 먼저, 없으면 받아서 저장 */
    e.respondWith(caches.match(e.request).then(function (hit) {
      return hit || fetch(e.request).then(function (r) {
        var copy = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); }); return r;
      });
    }));
  }
});
