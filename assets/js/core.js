(function (root) {
  'use strict';
  const businessTypes = ['', 'Café or food business', 'Retail', 'Hair or beauty', 'Health or fitness', 'Professional service', 'Other'];
  function normaliseRequest(input) {
    const clean = value => String(value ?? '').trim().replace(/[\r\n\t]+/g, ' ');
    return {
      businessName: clean(input.businessName),
      email: clean(input.email).toLowerCase(),
      contactName: clean(input.contactName),
      businessType: clean(input.businessType),
      privacyAccepted: input.privacyAccepted === true,
      updatesConsent: input.updatesConsent === true
    };
  }
  function validateRequest(data) {
    if (!data.businessName || data.businessName.length > 120) return 'Enter a business name of up to 120 characters.';
    if (data.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return 'Enter a valid contact email address.';
    if (data.contactName.length > 120) return 'Keep your name to 120 characters or fewer.';
    if (!businessTypes.includes(data.businessType)) return 'Choose a business type from the list.';
    if (!data.privacyAccepted) return 'Please read and acknowledge the privacy notice.';
    return '';
  }
  function buildRequestText(data, privacyVersion) {
    return [
      'Hello De-Omega-Point,', '',
      'I would like to register interest in the Loyalty-4-All merchant pilot.', '',
      `Business: ${data.businessName}`,
      `Contact email: ${data.email}`,
      `Contact name: ${data.contactName || 'Not provided'}`,
      `Business type: ${data.businessType || 'Not provided'}`, '',
      'Please reply about this pilot request.',
      `Optional product / AI marketing / industry updates: ${data.updatesConsent ? 'YES, I opt in. I can ask to stop at any time.' : 'NO, I have not opted in.'}`,
      `Privacy notice acknowledged: ${privacyVersion}`, '',
      'This is an interest request, not a purchase or an app-access confirmation.'
    ].join('\n');
  }
  function buildMailto(recipient, body) {
    if (!/^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(recipient)) throw new Error('Invalid contact address.');
    return `mailto:${recipient}?subject=${encodeURIComponent('Loyalty-4-All merchant pilot interest')}&body=${encodeURIComponent(body)}`;
  }
  function forgetLegacyData(storage) {
    // Never call clear(): this origin may host other products.
    storage.removeItem('l4a_orders');
    storage.removeItem('l4a_current_order');
  }
  root.L4A = Object.freeze({ normaliseRequest, validateRequest, buildRequestText, buildMailto, forgetLegacyData });
  if (typeof document !== 'undefined') {
    const button = document.querySelector('[data-clear-legacy]');
    button?.addEventListener('click', () => {
      const status = document.querySelector('[data-legacy-status]');
      try {
        forgetLegacyData(root.localStorage);
        status.textContent = 'Old prototype order data removed from this website. App records and email are unchanged.';
      } catch {
        status.textContent = 'Browser storage is unavailable. You can manage this website’s data in browser settings.';
      }
    });
  }
})(typeof window !== 'undefined' ? window : globalThis);
