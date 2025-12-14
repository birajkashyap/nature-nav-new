import { useEffect, useState } from 'react';

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    console.log('🗺️ Google Maps API Key:', apiKey ? 'Found' : 'NOT FOUND');
    
    if (!apiKey) {
      const error = new Error('Google Maps API key not found');
      setLoadError(error);
      console.error('❌ Google Maps Error:', error);
      return;
    }

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      console.log('✅ Google Maps already loaded!');
      setIsLoaded(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      console.log('🔄 Google Maps script already loading...');
      // Wait for it to load
      existingScript.addEventListener('load', () => {
        console.log('✅ Google Maps loaded successfully!');
        setIsLoaded(true);
      });
      return;
    }

    console.log('🔄 Loading Google Maps Places library...');

    // Load the Google Maps script dynamically
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;

    // Define the callback
    (window as any).initMap = () => {
      console.log('✅ Google Maps loaded successfully!');
      setIsLoaded(true);
    };

    script.onerror = () => {
      const error = new Error('Failed to load Google Maps script');
      console.error('❌ Google Maps loading failed:', error);
      setLoadError(error);
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      const existingScript = document.querySelector(`script[src^="https://maps.googleapis.com/maps/api/js"]`);
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
      delete (window as any).initMap;
    };
  }, []);

  return { isLoaded, loadError };
}
