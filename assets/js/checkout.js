(function () {
  'use strict';
  const form = document.querySelector('[data-registration-form]');
  if (!form) return;
  const fields = document.querySelector('[data-registration-fields]');
  const review = document.querySelector('[data-request-review]');
  const message = document.querySelector('[data-form-message]');
  const preview = document.querySelector('[data-request-text]');
  const compose = document.querySelector('[data-compose-email]');
  const copyStatus = document.querySelector('[data-copy-status]');
  let requestText = '';
  fields.disabled = false;
  form.setAttribute('aria-describedby', 'form-help');
  message.textContent = 'Nothing is sent automatically. Review your request before opening your email app.';

  function clearReview() {
    requestText = '';
    preview.textContent = '';
    compose.removeAttribute('href');
    copyStatus.textContent = '';
    review.hidden = true;
    form.hidden = false;
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const input = new FormData(form);
    const data = window.L4A.normaliseRequest({
      businessName: input.get('businessName'), email: input.get('email'),
      contactName: input.get('contactName'), businessType: input.get('businessType'),
      privacyAccepted: input.get('privacyAccepted') === 'on',
      updatesConsent: input.get('updatesConsent') === 'on'
    });
    const error = window.L4A.validateRequest(data);
    if (error) { message.textContent = error; return; }
    requestText = window.L4A.buildRequestText(data, window.L4A_CONFIG.privacyVersion);
    preview.textContent = requestText;
    compose.href = window.L4A.buildMailto(window.L4A_CONFIG.supportEmail, requestText);
    form.hidden = true;
    review.hidden = false;
    document.getElementById('review-title').focus();
  });
  compose.addEventListener('click', () => {
    copyStatus.textContent = 'Your email app may open. Review the message and press Send there. This website cannot verify delivery.';
  });
  document.querySelector('[data-edit-request]').addEventListener('click', () => {
    clearReview();
    document.getElementById('businessName').focus();
  });
  document.querySelector('[data-clear-request]').addEventListener('click', () => {
    form.reset();
    clearReview();
    message.textContent = 'Request cleared from this page. Any copies in email, clipboard or files must be removed separately.';
    document.getElementById('businessName').focus();
  });
  document.querySelector('[data-copy-request]').addEventListener('click', async () => {
    if (!requestText) return;
    try {
      await navigator.clipboard.writeText(requestText);
      copyStatus.textContent = 'Copied. Paste into an email to ' + window.L4A_CONFIG.supportEmail + ' and send it yourself.';
    } catch {
      copyStatus.textContent = 'Clipboard access is unavailable. Select and copy the request text above, or save it as a text file.';
    }
  });
  document.querySelector('[data-save-request]').addEventListener('click', () => {
    if (!requestText) return;
    const blob = new Blob([requestText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'loyalty-4-all-pilot-request.txt';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    copyStatus.textContent = 'A text-file download was requested. This does not submit your registration.';
  });
})();
