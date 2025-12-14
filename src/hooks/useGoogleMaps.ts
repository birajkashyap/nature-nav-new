import { Loader } from '@googlemaps/js-api-loader';
import { useEffect, useState } from 'react';

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      setLoadError(new Error('Google Maps API key not found'));
      return;
    }

    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places'],
    });

    loader
      .load()
      .then(() => setIsLoaded(true))
      .catch((err: Error) => setLoadError(err));
  }, []);

  return { isLoaded, loadError };
}
