/* A local-only guide selector. No storage, network requests or install interception. */
(function () {
  'use strict';
  function suggestDevice(ua, platform, touchPoints) {
    if (/iPhone|iPad|iPod/i.test(ua) || (platform === 'MacIntel' && touchPoints > 1)) return 'ios';
    if (/Android/i.test(ua)) return /Chrome/i.test(ua) ? 'android' : 'other';
    if (/Macintosh/i.test(ua) && /Safari/i.test(ua) && !/Chrome|Chromium|Edg|OPR/i.test(ua)) return 'safari';
    if (/Chrome|Chromium|Edg/i.test(ua)) return 'desktop';
    return 'other';
  }
  var picker = document.getElementById('device-picker');
  var select = document.getElementById('device');
  var status = document.getElementById('detected-device');
  var panels = document.querySelectorAll('[data-guide]');
  if (!picker || !select || !status || !panels.length) return;
  function showGuide() {
    panels.forEach(function (panel) { panel.hidden = panel.dataset.guide !== select.value; });
    status.textContent = 'Showing: ' + select.options[select.selectedIndex].text + '.';
  }
  select.value = suggestDevice(navigator.userAgent || '', navigator.platform || '', navigator.maxTouchPoints || 0);
  select.addEventListener('change', showGuide);
  showGuide();
  document.documentElement.classList.add('guides-enhanced');
  picker.hidden = false;
}());
