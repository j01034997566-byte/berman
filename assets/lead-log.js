/* 신청 기록 보내기 (이름·연락처 등 입력값은 보내지 않음)
   1) 아래 WEBAPP_URL에 내 웹 앱 주소(…/exec)를 넣는다.
   2) 신청 완료 순간에 window.sendLeadLog() 를 한 번 부른다.
      (privacy.js 라면 gtag('event','generate_lead') 줄 바로 위) */
(function () {
  var WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbwPlKpw5UW9lpopPbHaAa4Wm0w9KSvnxZDO_6ONRs98FzwmH75MqnpMhzHvUsM5QwMl/exec';
  var KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];

  // 광고로 들어온 첫 화면의 UTM을 기억해 둔다 (#apply 로 이동해도 유지)
  try {
    var q = new URLSearchParams(location.search);
    if (KEYS.some(function (k) { return q.get(k); })) sessionStorage.setItem('lead_utm', q.toString());
  } catch (e) {}

  window.sendLeadLog = function () {
    try {
      var saved = new URLSearchParams(sessionStorage.getItem('lead_utm') || location.search);
      var p = new URLSearchParams();
      p.set('page', location.pathname);
      KEYS.forEach(function (k) { p.set(k, saved.get(k) || ''); });
      p.set('ref', (document.referrer || '').slice(0, 200));
      var url = WEBAPP_URL + '?' + p.toString();
      // 페이지가 바로 넘어가도 끊기지 않게 sendBeacon 사용
      if (!(navigator.sendBeacon && navigator.sendBeacon(url))) {
        fetch(url, { method: 'POST', mode: 'no-cors', keepalive: true });
      }
    } catch (e) {}
  };
})();
