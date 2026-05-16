document.addEventListener('DOMContentLoaded', () => {
  const planKey = window.L4A.getQueryParam('plan') || 'driver';
  const plan = window.L4A.getPlan(planKey);
  const selectedPlan = document.querySelector('[data-selected-plan]');
  const selectedPrice = document.querySelector('[data-selected-price]');
  const form = document.querySelector('[data-checkout-form]');
  const paypalBox = document.querySelector('[data-paypal-box]');
  const fallbackButton = document.querySelector('[data-demo-pay]');

  if (selectedPlan) selectedPlan.textContent = plan.label;
  if (selectedPrice) selectedPrice.textContent = `$${plan.price} AUD / ${plan.billing === 'once' ? 'one time' : plan.billing}`;

  const renderPayPalButtons = order => {
    if (!window.paypal || !paypalBox) return false;
    paypalBox.innerHTML = '';
    window.paypal.Buttons({
      style: { layout: 'vertical', shape: 'pill', label: 'paypal' },
      createOrder: (data, actions) => {
        // TODO: Replace this frontend demo order with a backend-created PayPal Orders API order.
        return actions.order.create({
          purchase_units: [{
            description: `${window.L4A_CONFIG.appName} ${plan.label}`,
            amount: { currency_code: window.L4A_CONFIG.currency, value: String(plan.price) }
          }]
        });
      },
      onApprove: async (data, actions) => {
        // TODO: Capture and verify payment on the backend. This static capture is a prototype only.
        await actions.order.capture();
        const confirmed = await window.L4A.confirmPaymentWithBackend({ ...order, paypalOrderId: data.orderID });
        window.location.href = `success.html?order=${encodeURIComponent(confirmed.id)}`;
      },
      onError: error => {
        paypalBox.insertAdjacentHTML('beforeend', `<p class="notice">PayPal could not complete the payment. Please try again or contact support.</p>`);
        console.error(error);
      }
    }).render(paypalBox);
    return true;
  };

  form?.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const email = String(data.get('email') || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      form.querySelector('[data-form-message]').textContent = 'Please enter a valid email address.';
      return;
    }
    const order = window.L4A.saveOrder(window.L4A.createOrder({ email, planKey }));
    form.querySelector('[data-form-message]').textContent = 'Order started. Use PayPal below to confirm access.';
    paypalBox?.classList.remove('hidden');
    fallbackButton?.classList.remove('hidden');
    fallbackButton.dataset.orderId = order.id;
    renderPayPalButtons(order);
  });

  fallbackButton?.addEventListener('click', async () => {
    const order = window.L4A.findOrder(fallbackButton.dataset.orderId);
    if (!order) return;
    const confirmed = await window.L4A.confirmPaymentWithBackend(order);
    window.location.href = `success.html?order=${encodeURIComponent(confirmed.id)}`;
  });
});
