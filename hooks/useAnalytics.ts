type AnalyticsCategory = 
  | 'authentication'
  | 'image_processing'
  | 'subscription'
  | 'user_interaction'
  | 'error';

type AnalyticsAction = {
  // Authentication events
  'user_signup': { method: string };
  'user_login': { method: string };
  'user_logout': {};
  
  // Image processing events
  'image_upload': { fileType: string; fileSize: number };
  'processing_started': { imageCount: number };
  'processing_completed': { imageCount: number; duration: number };
  'processing_failed': { error: string };
  
  // Subscription events
  'subscription_viewed': { plan: string };
  'subscription_started': { plan: string; price: number };
  'subscription_completed': { plan: string; price: number };
  'subscription_cancelled': { plan: string; reason?: string };
  
  // User interaction events
  'feature_used': { name: string; successful: boolean };
  'download_started': { format: string; fileCount: number };
  'download_completed': { format: string; fileCount: number };
  
  // Error events
  'api_error': { endpoint: string; error: string };
  'client_error': { type: string; message: string };
};

export const useAnalytics = () => {
  const trackEvent = <T extends keyof AnalyticsAction>(
    category: AnalyticsCategory,
    action: T,
    properties: AnalyticsAction[T]
  ) => {
    if (typeof window === 'undefined' || !(window as any).gtag) return;

    (window as any).gtag('event', action, {
      event_category: category,
      ...properties,
    });
  };

  const analytics = {
    // Authentication tracking
    trackSignup: (method: string) => 
      trackEvent('authentication', 'user_signup', { method }),
    
    trackLogin: (method: string) =>
      trackEvent('authentication', 'user_login', { method }),
    
    trackLogout: () =>
      trackEvent('authentication', 'user_logout', {}),

    // Image processing tracking
    trackImageUpload: (fileType: string, fileSize: number) =>
      trackEvent('image_processing', 'image_upload', { fileType, fileSize }),
    
    trackProcessingStart: (imageCount: number) =>
      trackEvent('image_processing', 'processing_started', { imageCount }),
    
    trackProcessingComplete: (imageCount: number, duration: number) =>
      trackEvent('image_processing', 'processing_completed', { imageCount, duration }),
    
    trackProcessingError: (error: string) =>
      trackEvent('image_processing', 'processing_failed', { error }),

    // Subscription tracking
    trackSubscriptionView: (plan: string) =>
      trackEvent('subscription', 'subscription_viewed', { plan }),
    
    trackSubscriptionStart: (plan: string, price: number) =>
      trackEvent('subscription', 'subscription_started', { plan, price }),
    
    trackSubscriptionComplete: (plan: string, price: number) =>
      trackEvent('subscription', 'subscription_completed', { plan, price }),
    
    trackSubscriptionCancel: (plan: string, reason?: string) =>
      trackEvent('subscription', 'subscription_cancelled', { plan, reason }),

    // Feature usage tracking
    trackFeatureUsage: (name: string, successful: boolean) =>
      trackEvent('user_interaction', 'feature_used', { name, successful }),
    
    trackDownloadStart: (format: string, fileCount: number) =>
      trackEvent('user_interaction', 'download_started', { format, fileCount }),
    
    trackDownloadComplete: (format: string, fileCount: number) =>
      trackEvent('user_interaction', 'download_completed', { format, fileCount }),

    // Error tracking
    trackApiError: (endpoint: string, error: string) =>
      trackEvent('error', 'api_error', { endpoint, error }),
    
    trackClientError: (type: string, message: string) =>
      trackEvent('error', 'client_error', { type, message }),
  };

  return analytics;
}; 