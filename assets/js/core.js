const L4A_STORAGE_KEYS = {
  orders: 'l4a_orders',
  currentOrder: 'l4a_current_order'
};

function getPlans() {
  return window.L4A_CONFIG.plans;
}

function getPlan(planKey) {
  return getPlans()[planKey] || getPlans().driver;
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function readOrders() {
  try {
    return JSON.parse(localStorage.getItem(L4A_STORAGE_KEYS.orders)) || [];
  } catch (error) {
    console.warn('Could not read local Loyalty4All orders.', error);
    return [];
  }
}

function writeOrders(orders) {
  localStorage.setItem(L4A_STORAGE_KEYS.orders, JSON.stringify(orders));
}

function randomCode(length = 6) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  return Array.from(values, value => alphabet[value % alphabet.length]).join('');
}

function generateSerialNumber(planKey) {
  const plan = getPlan(planKey);
  return `L4A-${plan.code}-${new Date().getFullYear()}-${randomCode(6)}`;
}

function createOrder({ email, planKey, paymentStatus = 'pending', accessStatus = 'pending', paypalOrderId = '' }) {
  const plan = getPlan(planKey);
  const now = new Date().toISOString();
  return {
    id: `order_${Date.now()}_${randomCode(4)}`,
    createdAt: now,
    updatedAt: now,
    email,
    planKey,
    planLabel: plan.label,
    amount: plan.price,
    billing: plan.billing,
    paymentStatus,
    accessStatus,
    serialNumber: generateSerialNumber(planKey),
    appVersion: window.L4A_CONFIG.appVersion,
    paypalOrderId
  };
}

function saveOrder(order) {
  const orders = readOrders();
  const index = orders.findIndex(existing => existing.id === order.id);
  const updatedOrder = { ...order, updatedAt: new Date().toISOString() };
  if (index >= 0) {
    orders[index] = updatedOrder;
  } else {
    orders.unshift(updatedOrder);
  }
  writeOrders(orders);
  localStorage.setItem(L4A_STORAGE_KEYS.currentOrder, JSON.stringify(updatedOrder));
  return updatedOrder;
}

function findOrder(orderId) {
  return readOrders().find(order => order.id === orderId);
}

function getCurrentOrder() {
  const orderId = getQueryParam('order');
  if (orderId) return findOrder(orderId);
  try {
    return JSON.parse(localStorage.getItem(L4A_STORAGE_KEYS.currentOrder));
  } catch {
    return null;
  }
}

function updateOrder(orderId, updates) {
  const orders = readOrders();
  const index = orders.findIndex(order => order.id === orderId);
  if (index === -1) return null;
  orders[index] = { ...orders[index], ...updates, updatedAt: new Date().toISOString() };
  writeOrders(orders);
  localStorage.setItem(L4A_STORAGE_KEYS.currentOrder, JSON.stringify(orders[index]));
  return orders[index];
}

function seedDemoOrders() {
  if (readOrders().length) return;
  const demo = [
    createOrder({ email: 'owner@examplecafe.com.au', planKey: 'resto', paymentStatus: 'paid', accessStatus: 'active', paypalOrderId: 'DEMO-RESTO-001' }),
    createOrder({ email: 'driver@example.com.au', planKey: 'driver', paymentStatus: 'pending', accessStatus: 'pending', paypalOrderId: 'DEMO-DRIVER-001' })
  ];
  writeOrders(demo);
}

function toCsvValue(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

function exportOrdersCsv() {
  const orders = readOrders();
  const fields = ['id', 'createdAt', 'email', 'planLabel', 'amount', 'billing', 'paymentStatus', 'accessStatus', 'serialNumber', 'appVersion', 'paypalOrderId'];
  const csv = [fields.join(','), ...orders.map(order => fields.map(field => toCsvValue(order[field])).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `loyalty4all-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

// Backend integration placeholders. Keep this static prototype honest: browser-side payment status is not authoritative.
async function confirmPaymentWithBackend(order) {
  // TODO: Call PayPal Orders API from a backend only. Never expose PayPal secrets in frontend JavaScript.
  // TODO: Verify PayPal payment capture status, amount, currency, payer email, and order/subscription ID server-side.
  // TODO: Handle PayPal webhook events for PAYMENT.CAPTURE.COMPLETED, BILLING.SUBSCRIPTION.ACTIVATED, and failed payments.
  // TODO: Check active subscription status before issuing or reissuing any Google Drive download link.
  // TODO: Persist verified orders to Google Sheets through Google Apps Script or a proper database.
  return saveOrder({ ...order, paymentStatus: 'paid', accessStatus: 'active', paypalOrderId: order.paypalOrderId || `STATIC-${randomCode(8)}` });
}

window.L4A = {
  getPlan,
  getPlans,
  getQueryParam,
  readOrders,
  writeOrders,
  createOrder,
  saveOrder,
  findOrder,
  updateOrder,
  getCurrentOrder,
  generateSerialNumber,
  seedDemoOrders,
  exportOrdersCsv,
  confirmPaymentWithBackend
};
