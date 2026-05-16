document.addEventListener('DOMContentLoaded', () => {
  window.L4A.seedDemoOrders();
  const tbody = document.querySelector('[data-orders-body]');
  const exportButton = document.querySelector('[data-export-csv]');
  const clearButton = document.querySelector('[data-reset-demo]');

  const render = () => {
    const orders = window.L4A.readOrders();
    tbody.innerHTML = orders.map(order => `
      <tr>
        <td>${order.createdAt.slice(0, 10)}<br><span class="help">${order.id}</span></td>
        <td>${order.email}</td>
        <td>${order.planLabel}</td>
        <td><span class="status ${order.paymentStatus}">${order.paymentStatus}</span></td>
        <td>${order.serialNumber}</td>
        <td><span class="status ${order.accessStatus}">${order.accessStatus}</span></td>
        <td>${order.appVersion}</td>
        <td><div class="actions">
          <button class="btn small" data-action="activate" data-id="${order.id}">Activate</button>
          <button class="btn small danger" data-action="suspend" data-id="${order.id}">Suspend</button>
          <button class="btn small secondary" data-action="reissue" data-id="${order.id}">Reissue download</button>
        </div></td>
      </tr>`).join('');
  };

  tbody?.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const order = window.L4A.findOrder(button.dataset.id);
    if (!order) return;
    if (button.dataset.action === 'activate') {
      window.L4A.updateOrder(order.id, { paymentStatus: 'paid', accessStatus: 'active' });
    }
    if (button.dataset.action === 'suspend') {
      window.L4A.updateOrder(order.id, { accessStatus: 'suspended' });
    }
    if (button.dataset.action === 'reissue') {
      // TODO: Connect to Google Apps Script to verify status and mint a short-lived Google Drive download URL.
      window.L4A.updateOrder(order.id, { accessStatus: 'active', appVersion: window.L4A_CONFIG.appVersion });
      alert(`Prototype reissue recorded for ${order.email}.`);
    }
    render();
  });

  exportButton?.addEventListener('click', window.L4A.exportOrdersCsv);
  clearButton?.addEventListener('click', () => {
    localStorage.removeItem('l4a_orders');
    localStorage.removeItem('l4a_current_order');
    window.L4A.seedDemoOrders();
    render();
  });
  render();
});
