document.addEventListener('DOMContentLoaded', () => {
  const order = window.L4A.getCurrentOrder();
  const target = document.querySelector('[data-success-summary]');
  const downloadLink = document.querySelector('[data-download-link]');
  if (!order || !target) {
    target.innerHTML = '<p class="notice">We could not find this order on this device. Please contact support with your PayPal receipt.</p>';
    downloadLink?.classList.add('hidden');
    return;
  }
  target.innerHTML = `
    <dl class="kv">
      <div><dt>Email</dt><dd>${order.email}</dd></div>
      <div><dt>Plan</dt><dd>${order.planLabel}</dd></div>
      <div><dt>Payment</dt><dd><span class="status ${order.paymentStatus}">${order.paymentStatus}</span></dd></div>
      <div><dt>Serial</dt><dd>${order.serialNumber}</dd></div>
    </dl>`;
  if (downloadLink) downloadLink.href = `download.html?order=${encodeURIComponent(order.id)}`;
});
