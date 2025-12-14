import { useEffect, useState } from 'react';

// Global state to track Google Maps loading across all components
let isGoogleMapsLoaded = false;
let isGoogleMapsLoading = false;
let loadPromise: Promise<void> | null = null;

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

    // If already loaded globally, immediately set state
    if (isGoogleMapsLoaded && window.google?.maps) {
      console.log('✅ Google Maps already loaded globally!');
      setIsLoaded(true);
      return;
    }

    // If currently loading, wait for the existing promise
    if (isGoogleMapsLoading && loadPromise) {
      console.log('🔄 Google Maps already loading, waiting...');
      loadPromise
        .then(() => {
          console.log('✅ Google Maps loaded (from queue)!');
          setIsLoaded(true);
        })
        .catch((err) => {
          console.error('❌ Google Maps loading failed (from queue):', err);
          setLoadError(err);
        });
      return;
    }

    // Check if script already exists in DOM
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      console.log('✅ Google Maps script already in DOM, waiting for load...');
      
      if (window.google?.maps) {
        isGoogleMapsLoaded = true;
        setIsLoaded(true);
        return;
      }
      
      // Wait for script to load
      existingScript.addEventListener('load', () => {
        console.log('✅ Google Maps loaded successfully!');
        isGoogleMapsLoaded = true;
        setIsLoaded(true);
      });
      
      existingScript.addEventListener('error', () => {
        const error = new Error('Failed to load Google Maps script');
        console.error('❌ Google Maps loading failed:', error);
        setLoadError(error);
      });
      
      return;
    }

    console.log('🔄 Loading Google Maps Places library...');

    // Mark as loading
    isGoogleMapsLoading = true;

    // Load the Google Maps script dynamically
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;

    // Create loading promise for other components to wait on
    loadPromise = new Promise((resolve, reject) => {
      // Define the global callback
      (window as any).initGoogleMaps = () => {
        console.log('✅ Google Maps loaded successfully!');
        isGoogleMapsLoaded = true;
        isGoogleMapsLoading = false;
        setIsLoaded(true);
        resolve();
      };

      script.onerror = () => {
        const error = new Error('Failed to load Google Maps script');
        console.error('❌ Google Maps loading failed:', error);
        isGoogleMapsLoading = false;
        setLoadError(error);
        reject(error);
      };
    });

    document.head.appendChild(script);

    return () => {
      // Cleanup
      const existingScript = document.querySelector(`script[src^="https://maps.googleapis.com/maps/api/js"]`);
      if (existingScript) {
        // We don't remove the script here because it's a singleton and might be used by other components.
        // The script will persist across component unmounts.
        // If you truly need to remove it, you'd need a more sophisticated reference counting or global state management.
      }
      // We also don't delete the global callback as it's part of the singleton loading mechanism.
    };
  }, []);

  return { isLoaded, loadError };
}
