import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import { useMemo, useCallback, useRef, useEffect } from 'react';
import { MapPin, ExternalLink, Loader2 } from 'lucide-react';

interface DeliveryMapProps {
  latitude: number;
  longitude: number;
  height?: string;
  className?: string;
  label?: string;
  showLink?: boolean;
  // Optional: Show route from store to delivery location
  showRoute?: boolean;
  storeLatitude?: number;
  storeLongitude?: number;
  storeLabel?: string;
}

const libraries: ('places' | 'routes')[] = ['places', 'routes'];

// Store coordinates (default)
const DEFAULT_STORE_LAT = -33.011664;
const DEFAULT_STORE_LNG = 27.866664;

// Uber-style map styling
const uberMapStyles: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#f6f6f6' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }, { weight: 2 }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#e0e0e0' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#6a6a6a' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', stylers: [{ visibility: 'on' }] },
  { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#e8f0e8' }] },
  { featureType: 'poi.park', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#e8e8e8' }, { weight: 1 }] },
  { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ color: '#c5d5e8' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#a8c0d8' }, { weight: 1.5 }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#5a7a9a' }] },
  { featureType: 'road.arterial', elementType: 'geometry.fill', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.arterial', elementType: 'geometry.stroke', stylers: [{ color: '#e0e0e0' }] },
  { featureType: 'road.local', elementType: 'geometry.fill', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.local', elementType: 'geometry.stroke', stylers: [{ color: '#eeeeee' }] },
  { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#9a9a9a' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry.fill', stylers: [{ color: '#d4e4f4' }] },
  { featureType: 'water', elementType: 'labels', stylers: [{ visibility: 'off' }] },
];

// Factory function to create LabelOverlay class after Google Maps is loaded
function createLabelOverlayClass() {
  return class LabelOverlay extends google.maps.OverlayView {
    private position: google.maps.LatLng;
    private label: string;
    private div: HTMLDivElement | null = null;
    private isStore: boolean;

    constructor(position: google.maps.LatLng, label: string, isStore = false) {
      super();
      this.position = position;
      this.label = label;
      this.isStore = isStore;
    }

    onAdd() {
      this.div = document.createElement('div');
      this.div.style.position = 'absolute';
      this.div.style.transform = 'translate(-50%, -100%)';
      this.div.style.marginTop = '-12px';
      this.div.style.zIndex = this.isStore ? '1' : '2';

      const bgColor = this.isStore ? '#000000' : 'white';
      const textColor = this.isStore ? 'white' : '#1a1a1a';
      const arrowColor = this.isStore ? '#000000' : 'white';

      this.div.innerHTML = `
        <div style="
          background: ${bgColor};
          padding: 8px 14px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: ${textColor};
          white-space: nowrap;
        ">${this.label}</div>
        <div style="
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 8px solid ${arrowColor};
          margin: 0 auto;
        "></div>
      `;
      const panes = this.getPanes();
      panes?.overlayMouseTarget.appendChild(this.div);
    }

    draw() {
      if (!this.div) return;
      const overlayProjection = this.getProjection();
      const pos = overlayProjection.fromLatLngToDivPixel(this.position);
      if (pos) {
        this.div.style.left = pos.x + 'px';
        this.div.style.top = pos.y + 'px';
      }
    }

    onRemove() {
      if (this.div && this.div.parentNode) {
        this.div.parentNode.removeChild(this.div);
        this.div = null;
      }
    }
  };
}

export function DeliveryMap({
  latitude,
  longitude,
  height = '200px',
  className = '',
  label = 'Delivery Location',
  showLink = true,
  showRoute = false,
  storeLatitude = DEFAULT_STORE_LAT,
  storeLongitude = DEFAULT_STORE_LNG,
  storeLabel = 'Store',
}: DeliveryMapProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapRef = useRef<google.maps.Map | null>(null);
  const deliveryMarkerRef = useRef<google.maps.Marker | null>(null);
  const storeMarkerRef = useRef<google.maps.Marker | null>(null);
  const deliveryLabelRef = useRef<google.maps.OverlayView | null>(null);
  const storeLabelRef = useRef<google.maps.OverlayView | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey || '',
    libraries,
  });

  const center = useMemo(() => {
    if (showRoute) {
      // Center between store and delivery
      return {
        lat: (latitude + storeLatitude) / 2,
        lng: (longitude + storeLongitude) / 2,
      };
    }
    return { lat: latitude, lng: longitude };
  }, [latitude, longitude, showRoute, storeLatitude, storeLongitude]);

  const mapContainerStyle = useMemo(
    () => ({
      width: '100%',
      height,
      borderRadius: '12px',
    }),
    [height]
  );

  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: true,
      zoomControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: uberMapStyles,
      clickableIcons: false,
      gestureHandling: 'cooperative' as const,
    }),
    []
  );

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    const LabelOverlay = createLabelOverlayClass();

    // Delivery location marker
    const deliveryPosition = new google.maps.LatLng(latitude, longitude);
    deliveryMarkerRef.current = new google.maps.Marker({
      position: deliveryPosition,
      map: map,
      title: label,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#1a1a1a',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
      zIndex: 2,
    });

    deliveryLabelRef.current = new LabelOverlay(deliveryPosition, label, false);
    deliveryLabelRef.current.setMap(map);

    if (showRoute) {
      // Store marker
      const storePosition = new google.maps.LatLng(storeLatitude, storeLongitude);
      storeMarkerRef.current = new google.maps.Marker({
        position: storePosition,
        map: map,
        title: storeLabel,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#000000',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
        zIndex: 1,
      });

      storeLabelRef.current = new LabelOverlay(storePosition, storeLabel, true);
      storeLabelRef.current.setMap(map);

      // Fit bounds to show both markers
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(deliveryPosition);
      bounds.extend(storePosition);
      map.fitBounds(bounds, { top: 60, right: 40, bottom: 40, left: 40 });

      // Get driving directions for actual road route
      const directionsService = new google.maps.DirectionsService();

      directionsService.route(
        {
          origin: storePosition,
          destination: deliveryPosition,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            // Draw the route with custom styling (black line following roads)
            directionsRendererRef.current = new google.maps.DirectionsRenderer({
              map: map,
              directions: result,
              suppressMarkers: true, // We're using our own custom markers
              preserveViewport: true, // Don't auto-zoom, we already fit bounds
              polylineOptions: {
                strokeColor: '#000000',
                strokeWeight: 5,
                strokeOpacity: 1,
              },
            });
          } else {
            // Directions API failed - log error for debugging
            // Route won't be shown, but markers will still display
            console.error('Directions API failed:', status,
              '- Make sure Directions API is enabled in Google Cloud Console');
          }
        }
      );
    }
  }, [latitude, longitude, label, showRoute, storeLatitude, storeLongitude, storeLabel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (deliveryMarkerRef.current) {
        deliveryMarkerRef.current.setMap(null);
      }
      if (storeMarkerRef.current) {
        storeMarkerRef.current.setMap(null);
      }
      if (deliveryLabelRef.current) {
        deliveryLabelRef.current.setMap(null);
      }
      if (storeLabelRef.current) {
        storeLabelRef.current.setMap(null);
      }
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
    };
  }, []);

  const googleMapsUrl = showRoute
    ? `https://www.google.com/maps/dir/${storeLatitude},${storeLongitude}/${latitude},${longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  if (loadError) {
    return (
      <div className={`bg-gray-100 rounded-xl p-4 ${className}`} style={{ height }}>
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <MapPin className="w-8 h-8 mb-2" />
          <p className="text-sm text-center">Map unavailable</p>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            Open in Google Maps
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`bg-gray-100 rounded-xl p-4 ${className}`} style={{ height }}>
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin mb-2" />
          <p className="text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={showRoute ? 14 : 16}
          options={mapOptions}
          onLoad={onMapLoad}
        />
      </div>
      {showLink && (
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
        >
          {showRoute ? 'Get Directions' : 'Open in Google Maps'}
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}
