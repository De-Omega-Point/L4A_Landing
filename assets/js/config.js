window.L4A_CONFIG = {
  appName: 'Loyalty4All',
  appVersion: '0.1.0-beta',
  supportEmail: 'support@loyalty4all.com.au',
  paypalClientId: 'YOUR_PAYPAL_CLIENT_ID',
  currency: 'AUD',
  plans: {
    driver: {
      code: 'DRIVER',
      label: 'Driver plan',
      price: 10,
      billing: 'month',
      paypalPlanId: 'TODO_PAYPAL_DRIVER_SUBSCRIPTION_PLAN_ID'
    },
    resto: {
      code: 'RESTO',
      label: 'Restaurant plan',
      price: 20,
      billing: 'month',
      paypalPlanId: 'TODO_PAYPAL_RESTAURANT_SUBSCRIPTION_PLAN_ID'
    },
    beta: {
      code: 'BETA',
      label: 'Private beta access',
      price: 49,
      billing: 'once',
      paypalPlanId: 'TODO_PAYPAL_BETA_ORDER_ID'
    }
  },
  downloads: {
    // Google Drive files should remain private. A backend should mint short-lived links after access verification.
    placeholderUrl: '#request-secure-download-link',
    googleDriveFileIds: {
      pwa: 'TODO_GOOGLE_DRIVE_PWA_PACKAGE_ID',
      zip: 'TODO_GOOGLE_DRIVE_ZIP_FILE_ID',
      apk: 'TODO_GOOGLE_DRIVE_ANDROID_APK_ID'
    }
  },
  backend: {
    googleAppsScriptEndpoint: 'TODO_GOOGLE_APPS_SCRIPT_WEB_APP_URL'
  }
};
