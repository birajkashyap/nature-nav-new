'use client';

import { useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';

export interface PlaceResult {
  address: string;
  placeId: string;
  lat: number;
  lng: number;
}

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (place: PlaceResult) => void;
  placeholder?: string;
  className?: string;
  name?: string;
  required?: boolean;
}

export function PlacesAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder = 'Enter location',
  className,
  name,
  required,
}: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!inputRef.current || !window.google) return;

    // Initialize Google Places Autocomplete
    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'ca' }, // Restrict to Canada
      fields: ['formatted_address', 'place_id', 'geometry', 'name'],
      types: ['geocode', 'establishment'], // Allow addresses and businesses
    });

    // Listen for place selection
    const listener = autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();

      if (!place || !place.geometry) {
        console.warn('No place details available');
        return;
      }

      const placeResult: PlaceResult = {
        address: place.formatted_address || place.name || '',
        placeId: place.place_id || '',
        lat: place.geometry.location!.lat(),
        lng: place.geometry.location!.lng(),
      };

      // Update parent with selected address
      onChange(placeResult.address);
      onPlaceSelect(placeResult);
    });

    return () => {
      if (listener) {
        google.maps.event.removeListener(listener);
      }
    };
  }, [onChange, onPlaceSelect]);

  return (
    <Input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
      name={name}
      required={required}
      autoComplete="off"
    />
  );
}
