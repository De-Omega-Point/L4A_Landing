document.addEventListener('DOMContentLoaded', () => {
  const order = window.L4A.getCurrentOrder();
  const summary = document.querySelector('[data-download-summary]');
  const button = document.querySelector('[data-download-button]');
  const support = document.querySelector('[data-support-email]');
  if (support) support.textContent = window.L4A_CONFIG.supportEmail;

  if (!order || order.accessStatus !== 'active' || order.paymentStatus !== 'paid') {
    summary.innerHTML = '<p class="notice">Download access is not active on this device. Complete payment first, or contact support with your PayPal receipt.</p>';
    button?.classList.add('hidden');
    return;
  }

  summary.innerHTML = `
    <dl class="kv">
      <div><dt>Buyer plan</dt><dd>${order.planLabel}</dd></div>
      <div><dt>Serial number</dt><dd>${order.serialNumber}</dd></div>
      <div><dt>App version</dt><dd>${order.appVersion}</dd></div>
      <div><dt>Access status</dt><dd><span class="status active">Active</span></dd></div>
    </dl>`;
  if (button) {
    button.href = window.L4A_CONFIG.downloads.placeholderUrl;
    button.addEventListener('click', event => {
      event.preventDefault();
      alert('Prototype only: a backend will verify your serial number and create a short-lived Google Drive download link.');
    });
  }
});
