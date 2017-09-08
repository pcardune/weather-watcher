export default function trackEvent(name, parameters) {
  const fbq = window.fbq;
  if (fbq) {
    fbq('track', name, parameters);
  }
  if (process.env.NODE_ENV !== 'production') {
    console.log('fb pixel track', name, parameters);
  }
}
