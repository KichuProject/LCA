import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Icon, LatLng, LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

// Fix Leaflet default icons
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Transport modes with emission factors and map styles
const TRANSPORT_MODES = {
  truck: {
    name: 'Truck 🚚',
    icon: '🚚',
    emissionFactor: 0.062,
    color: '#ef4444',
    description: 'Road transport - flexible but higher emissions',
    mapStyle: 'terrain',
    speed: 80, // km/h
    animationDuration: 8000, // ms
    tileUrl: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
  },
  train: {
    name: 'Train 🚆',
    icon: '🚆',
    emissionFactor: 0.022,
    color: '#22c55e',
    description: 'Rail transport - efficient for long distances',
    mapStyle: 'standard',
    speed: 120, // km/h
    animationDuration: 6000, // ms
    tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  ship: {
    name: 'Ship 🚢',
    icon: '🚢',
    emissionFactor: 0.015,
    color: '#3b82f6',
    description: 'Maritime transport - most efficient for bulk cargo',
    mapStyle: 'satellite',
    speed: 40, // km/h
    animationDuration: 12000, // ms
    tileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  },
  flight: {
    name: 'Flight ✈️',
    icon: '✈️',
    emissionFactor: 0.500,
    color: '#dc2626',
    description: 'Air transport - fastest but highest emissions',
    mapStyle: 'satellite',
    speed: 900, // km/h
    animationDuration: 4000, // ms
    tileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  }
};

// Predefined major locations with coordinates
const LOCATIONS = {
  'Mumbai, India': [19.0760, 72.8777],
  'Delhi, India': [28.6139, 77.2090],
  'Shanghai, China': [31.2304, 121.4737],
  'Singapore': [1.3521, 103.8198],
  'Dubai, UAE': [25.2048, 55.2708],
  'Rotterdam, Netherlands': [51.9244, 4.4777],
  'Hamburg, Germany': [53.5511, 9.9937],
  'Los Angeles, USA': [34.0522, -118.2437],
  'New York, USA': [40.7128, -74.0060],
  'Tokyo, Japan': [35.6762, 139.6503],
  'London, UK': [51.5074, -0.1278],
  'Antwerp, Belgium': [51.2194, 4.4025]
};

// Vehicle-specific marker icons for source and destination
const createVehicleMarkerIcon = (transportMode: keyof typeof TRANSPORT_MODES, isSource: boolean) => {
  const config = TRANSPORT_MODES[transportMode];
  const size = 45;
  const bgColor = isSource ? '#4CAF50' : '#FF5722'; // Green for source, Red for destination
  const labelColor = 'white';
  const label = isSource ? 'START' : 'END';
  
  // Enhanced vehicle shape representations
  const vehicleShapes = {
    truck: `<rect x="16" y="18" width="14" height="8" fill="#ffffff" stroke="#333" stroke-width="1"/>
            <rect x="14" y="20" width="3" height="4" fill="#333"/>
            <rect x="27" y="20" width="3" height="4" fill="#333"/>`,
    train: `<rect x="12" y="19" width="21" height="7" fill="#ffffff" stroke="#333" stroke-width="1"/>
            <circle cx="16" cy="28" r="2" fill="#333"/>
            <circle cx="29" cy="28" r="2" fill="#333"/>`,
    ship: `<path d="M14,23 L31,23 L29,28 L16,28 Z" fill="#ffffff" stroke="#333" stroke-width="1"/>
           <rect x="19" y="17" width="7" height="6" fill="#ffffff" stroke="#333" stroke-width="1"/>`,
    flight: `<path d="M22,19 L30,22 L22,25 L18,23 L14,22 L18,21 Z" fill="#ffffff" stroke="#333" stroke-width="1"/>
             <line x1="16" y1="21" x2="16" y2="23" stroke="#333" stroke-width="2"/>`
  };
  
  const vehicleShape = vehicleShapes[transportMode];
  
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="black" flood-opacity="0.3"/>
          </filter>
        </defs>
        <!-- Main circle background -->
        <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 3}" fill="${bgColor}" stroke="#ffffff" stroke-width="3" filter="url(#shadow)"/>
        
        <!-- Vehicle shape -->
        ${vehicleShape}
        
        <!-- Label -->
        <text x="${size/2}" y="12" text-anchor="middle" font-size="7" font-weight="bold" fill="${labelColor}">${label}</text>
        
        <!-- Pulse ring -->
        <circle cx="${size/2}" cy="${size/2}" r="${size/2 + 3}" fill="none" stroke="${bgColor}" stroke-width="2" opacity="0.6" stroke-dasharray="6,4">
          <animate attributeName="r" values="${size/2 + 3};${size/2 + 8};${size/2 + 3}" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite"/>
        </circle>
      </svg>
    `)}`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2]
  });
};

// Simplified 3D vehicle-specific animated icon for reliable rendering
const createMovingVehicleIcon = (transportMode: keyof typeof TRANSPORT_MODES, animProgress: number, isReversing: boolean, cycles: number) => {
  try {
    const config = TRANSPORT_MODES[transportMode];
    const size = 40; // Reduced size for better performance
    const directionArrow = isReversing ? '<' : '>';
    const borderColor = isReversing ? '#ff4757' : '#2ed573';
    
    // Simplified vehicle representations without complex filters
    const vehicleDetails = {
      truck: { bgColor: '#ff6b35', shape: `<rect x="15" y="18" width="10" height="6" fill="#ffffff" stroke="#333"/>` },
      train: { bgColor: '#26a0fc', shape: `<rect x="12" y="18" width="16" height="6" fill="#ffffff" stroke="#333"/>` },
      ship: { bgColor: '#006ba6', shape: `<path d="M14,20 L26,20 L24,24 L16,24 Z" fill="#ffffff" stroke="#333"/>` },
      flight: { bgColor: '#e74c3c', shape: `<path d="M20,18 L26,20 L20,22 L16,20 Z" fill="#ffffff" stroke="#333"/>` }
    };
    
    const vehicle = vehicleDetails[transportMode];
    
    // Simple SVG without complex animations to prevent encoding issues
    const svgContent = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 3}" fill="${vehicle.bgColor}" stroke="${borderColor}" stroke-width="2" opacity="0.9"/>
      ${vehicle.shape}
      <text x="${size/2}" y="10" text-anchor="middle" font-size="8" fill="${borderColor}" font-weight="bold">${directionArrow}</text>
      ${cycles > 0 ? `<circle cx="${size - 8}" cy="8" r="5" fill="#ffd700" stroke="#fff" stroke-width="1"/>
      <text x="${size - 8}" y="11" text-anchor="middle" font-size="6" font-weight="bold" fill="#000">${Math.min(cycles, 99)}</text>` : ''}
    </svg>`;

    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(svgContent)}`,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2],
      popupAnchor: [0, -size/2]
    });
  } catch (error) {
    console.error('Error creating moving vehicle icon:', error);
    // Fallback to a simple colored circle
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`<svg width="30" height="30" xmlns="http://www.w3.org/2000/svg"><circle cx="15" cy="15" r="12" fill="#3498db" stroke="#fff" stroke-width="2"/></svg>`)}`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  }
};

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Calculate CO₂ emissions
const calculateEmissions = (distance: number, weight: number, mode: keyof typeof TRANSPORT_MODES): number => {
  return distance * weight * TRANSPORT_MODES[mode].emissionFactor;
};

// Component to fit map bounds to route
const FitBounds: React.FC<{ bounds: LatLngBounds | null }> = ({ bounds }) => {
  const map = useMap();
  
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [bounds, map]);
  
  return null;
};

// Enhanced animated transport icon component with 3D movement physics
const AnimatedTransportIcon: React.FC<{
  route: LatLng[];
  mode: keyof typeof TRANSPORT_MODES;
  isAnimating: boolean;
  distance: number;
  onAnimationUpdate?: (progress: number, cycleCount: number) => void;
}> = ({ route, mode, isAnimating, distance, onAnimationUpdate }) => {
  const [position, setPosition] = useState<LatLng | null>(null);
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const [isReversing, setIsReversing] = useState(false);
  const [velocity, setVelocity] = useState(0);
  const [heading, setHeading] = useState(0);
  const [lastPosition, setLastPosition] = useState<LatLng | null>(null);
  
  const onAnimationUpdateRef = useRef(onAnimationUpdate);
  
  // Update ref when callback changes
  useEffect(() => {
    onAnimationUpdateRef.current = onAnimationUpdate;
  }, [onAnimationUpdate]);
  
  useEffect(() => {
    console.log('Animation effect triggered:', { isAnimating, routeLength: route.length, mode });
    
    if (!isAnimating || route.length < 2) {
      setPosition(route.length >= 2 ? route[0] : null);
      setIsVisible(false);
      setProgress(0);
      setCycleCount(0);
      setIsReversing(false);
      setVelocity(0);
      setHeading(0);
      setLastPosition(null);
      onAnimationUpdateRef.current?.(0, 0);
      console.log('Animation stopped or invalid route');
      return;
    }

    // Validate route coordinates
    try {
      for (const point of route) {
        if (!point || typeof point.lat !== 'number' || typeof point.lng !== 'number') {
          throw new Error('Invalid route coordinates detected');
        }
      }
    } catch (routeError) {
      console.error('Route validation failed:', routeError);
      setIsVisible(false);
      return;
    }
    
    // Start continuous looping animation with 3D physics
    console.log('Starting enhanced 3D animation for mode:', mode);
    setIsVisible(true);
    const startPosition = route[0];
    setPosition(startPosition);
    setLastPosition(startPosition);
    
    const { animationDuration, speed } = TRANSPORT_MODES[mode];
    // Calculate realistic duration with physics consideration
    const realisticDuration = Math.max(4000, (distance / speed) * 3600000 / 120); // Slightly longer for realism
    const duration = Math.min(realisticDuration, animationDuration * 1.2);
    
    console.log('Enhanced animation duration:', duration, 'ms for', distance, 'km at', speed, 'km/h');
    
    let startTime = Date.now();
    let animationFrameId: number;
    let currentCycle = 0;
    let previousTime = startTime;
    
    const animate = () => {
      if (!isAnimating) return;
      
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const deltaTime = currentTime - previousTime;
      previousTime = currentTime;
      
      let rawProgress = (elapsed % duration) / duration;
      
      // Enhanced easing with acceleration/deceleration for realism
      let actualProgress: number;
      let currentReversing: boolean;
      
      if (rawProgress < 0.5) {
        // Forward journey with smooth acceleration/deceleration
        const forwardProgress = rawProgress * 2;
        // Ease-in-out function for natural movement
        actualProgress = 0.5 * (1 - Math.cos(forwardProgress * Math.PI));
        currentReversing = false;
      } else {
        // Return journey with pause at endpoints
        const returnProgress = (rawProgress - 0.5) * 2;
        actualProgress = 1 - (0.5 * (1 - Math.cos(returnProgress * Math.PI)));
        currentReversing = true;
      }
      
      // Update cycle count with smooth transitions
      const newCycleCount = Math.floor(elapsed / duration);
      if (newCycleCount !== currentCycle) {
        currentCycle = newCycleCount;
        setCycleCount(currentCycle);
        console.log('Completed enhanced cycle:', currentCycle, 'with realistic physics');
      }
      
      setIsReversing(currentReversing);
      
      // Enhanced interpolation with 3D-like curvature
      const totalSegments = route.length - 1;
      const currentSegment = actualProgress * totalSegments;
      const segmentIndex = Math.floor(currentSegment);
      const segmentProgress = currentSegment - segmentIndex;
      
      if (segmentIndex < route.length - 1) {
        const start = route[segmentIndex];
        const end = route[segmentIndex + 1];
        
        // Enhanced interpolation with realistic physics curves
        const lat = start.lat + (end.lat - start.lat) * segmentProgress;
        const lng = start.lng + (end.lng - start.lng) * segmentProgress;
        
        // Add elevation-like curve effect for 3D appearance
        const elevationFactor = Math.sin(segmentProgress * Math.PI) * 0.03;
        const bankingFactor = mode === 'flight' ? elevationFactor * 2 : elevationFactor * 0.5;
        const curvedLat = lat + bankingFactor;
        
        const newPosition = new LatLng(curvedLat, lng);
        
        // Calculate realistic velocity and heading
        if (lastPosition) {
          const distanceMoved = newPosition.distanceTo(lastPosition);
          const timeElapsed = deltaTime / 1000; // Convert to seconds
          const currentVelocity = timeElapsed > 0 ? (distanceMoved * 111000) / timeElapsed : 0; // Convert to m/s
          setVelocity(currentVelocity * 3.6); // Convert to km/h for display
          
          // Calculate heading (bearing) for vehicle orientation
          const bearing = Math.atan2(
            end.lng - start.lng,
            end.lat - start.lat
          ) * (180 / Math.PI);
          
          // Adjust heading based on direction
          const adjustedHeading = currentReversing ? bearing + 180 : bearing;
          setHeading(adjustedHeading);
        }
        
        setPosition(newPosition);
        setLastPosition(newPosition);
      }
      
      setProgress(actualProgress);
      onAnimationUpdateRef.current?.(actualProgress, currentCycle);
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [route, isAnimating, mode, distance]);
  
  if (!position) return null;
  
  // Show enhanced 3D vehicle when animation is active
  if (!isVisible && !isAnimating) return null;
  
  return (
    <Marker
      position={position}
      icon={createMovingVehicleIcon(mode, progress, isReversing, cycleCount)}
    >
      <Popup>
        <div className="text-center">
          <div className="text-lg font-bold flex items-center justify-center gap-2">
            🚀 {TRANSPORT_MODES[mode].name} 3D
          </div>
          <div className="text-sm text-gray-600">Progress: {Math.round(progress * 100)}%</div>
          <div className="text-xs text-blue-600">
            Target Speed: {TRANSPORT_MODES[mode].speed} km/h
          </div>
          <div className="text-xs text-purple-600">
            Current Speed: {Math.round(velocity)} km/h
          </div>
          <div className="text-xs text-cyan-600">
            Heading: {Math.round(heading)}°
          </div>
          <div className="text-xs text-green-600">
            Distance: {Math.round(progress * distance)} km / {Math.round(distance)} km
          </div>
          <div className="text-xs font-bold px-2 py-1 rounded-full" style={{ 
            backgroundColor: isReversing ? '#ffe0e0' : '#e0ffe0',
            color: isReversing ? '#ff6b6b' : '#51cf66' 
          }}>
            {isReversing ? '🔙 Return Journey' : '🚀 Outbound Journey'}
          </div>
          {cycleCount > 0 && (
            <div className="text-xs text-orange-600 font-bold mt-1 px-2 py-1 bg-orange-100 rounded-full">
              🔄 Cycles: {cycleCount}
            </div>
          )}
          <div className="text-xs text-indigo-600 mt-2 font-bold">
            ✨ Enhanced 3D Vehicle Tracking
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

const GeoMapping: React.FC = () => {
  // Ensure Leaflet CSS is loaded
  useEffect(() => {
    // Add Leaflet CSS if not already loaded
    const existingLink = document.querySelector('link[href*="leaflet"]');
    if (!existingLink) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }
  }, []);

  // Add sound effects for better UX - Made more robust
  const playSound = (type: 'start' | 'complete' | 'switch') => {
    try {
      // Only try to create audio context if it's supported and user has interacted
      if (!window.AudioContext && !(window as any).webkitAudioContext) {
        return; // Audio not supported, silently return
      }
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Check if audio context is in suspended state (common in Chrome)
      if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
          // Try again after resuming
          playActualSound(audioContext, type);
        }).catch(() => {
          // Fail silently if can't resume
        });
      } else {
        playActualSound(audioContext, type);
      }
    } catch (error) {
      // Silently fail if audio context isn't supported or throws error
      console.log('Audio not available:', error.message);
    }
  };
  
  const playActualSound = (audioContext: AudioContext, type: 'start' | 'complete' | 'switch') => {
    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different frequencies for different actions
      const frequencies = {
        start: 440,    // A note
        complete: 660, // E note
        switch: 330    // C# note
      };
      
      oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      // Silently fail if audio creation fails
      console.log('Sound generation failed:', error.message);
    }
  };

  // State management
  const [sourceLocation, setSourceLocation] = useState<string>('Mumbai, India');
  const [destinationLocation, setDestinationLocation] = useState<string>('Shanghai, China');
  const [transportMode, setTransportMode] = useState<keyof typeof TRANSPORT_MODES>('ship');
  const [cargoWeight, setCargoWeight] = useState<number>(100);
  const [customSource, setCustomSource] = useState<string>('');
  const [customDestination, setCustomDestination] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [showAllRoutes, setShowAllRoutes] = useState<boolean>(false);
  const [animationProgress, setAnimationProgress] = useState<number>(0);
  const [journeyStats, setJourneyStats] = useState({
    distanceCovered: 0,
    totalDistanceCovered: 0,
    timeElapsed: 0,
    co2Generated: 0,
    totalCo2Generated: 0,
    estimatedTimeRemaining: 0,
    cycleCount: 0,
    isReversing: false
  });
  
  // Calculated values with error handling
  const sourceCoords = LOCATIONS[sourceLocation as keyof typeof LOCATIONS] || [19.0760, 72.8777];
  const destCoords = LOCATIONS[destinationLocation as keyof typeof LOCATIONS] || [31.2304, 121.4737];
  
  // Validate coordinates
  if (!sourceCoords || !destCoords || sourceCoords.length !== 2 || destCoords.length !== 2) {
    console.error('Invalid coordinates:', { sourceCoords, destCoords });
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-6 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-700">🚨 Configuration Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">Invalid location coordinates detected. Please refresh the page and try again.</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4 w-full"
              variant="destructive"
            >
              🔄 Reload Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const distance = calculateDistance(sourceCoords[0], sourceCoords[1], destCoords[0], destCoords[1]);
  const emissions = calculateEmissions(distance, cargoWeight, transportMode);
  
  // Create route line with validation
  let route: LatLng[], bounds: LatLngBounds;
  try {
    route = [new LatLng(sourceCoords[0], sourceCoords[1]), new LatLng(destCoords[0], destCoords[1])];
    bounds = new LatLngBounds(route);
  } catch (error) {
    console.error('Route creation failed:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-6 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-700">🗺️ Map Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">Failed to create route. Please check your network connection and try again.</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4 w-full"
              variant="destructive"
            >
              🔄 Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Calculate emissions for all modes for comparison
  const allEmissions = Object.keys(TRANSPORT_MODES).map(mode => ({
    mode: mode as keyof typeof TRANSPORT_MODES,
    emissions: calculateEmissions(distance, cargoWeight, mode as keyof typeof TRANSPORT_MODES),
    ...TRANSPORT_MODES[mode as keyof typeof TRANSPORT_MODES]
  })).sort((a, b) => a.emissions - b.emissions);
  
  // Get current transport mode configuration with validation
  const currentMode = TRANSPORT_MODES[transportMode];
  if (!currentMode) {
    console.error('Invalid transport mode:', transportMode);
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-6 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-700">⚠️ Invalid Transport Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">
              Transport mode "{transportMode}" is not recognized. Please refresh the page and try again.
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4 w-full"
              variant="destructive"
            >
              🔄 Reload Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Update journey stats based on animation progress and cycle count
  const updateJourneyStats = (progress: number, cycleCount: number) => {
    setAnimationProgress(progress);
    
    // Current leg statistics
    const distanceCovered = distance * progress;
    const co2Generated = emissions * progress;
    const timeElapsed = (distance / currentMode.speed) * progress; // hours
    const estimatedTimeRemaining = (distance / currentMode.speed) * (1 - progress);
    
    // Total accumulated statistics across all cycles
    const totalDistanceCovered = (cycleCount * distance * 2) + distanceCovered; // *2 for round trip
    const totalCo2Generated = (cycleCount * emissions * 2) + co2Generated;
    
    // Determine if reversing (second half of cycle)
    const isReversing = progress > 0.5;
    
    setJourneyStats({
      distanceCovered,
      totalDistanceCovered,
      timeElapsed,
      co2Generated,
      totalCo2Generated,
      estimatedTimeRemaining,
      cycleCount,
      isReversing
    });
  };

  // Get emission level for color coding
  const getEmissionLevel = (emissionValue: number): 'low' | 'medium' | 'high' => {
    if (emissionValue < 500) return 'low';
    if (emissionValue < 2000) return 'medium';
    return 'high';
  };
  
  const emissionLevel = getEmissionLevel(emissions);
  const levelColors = {
    low: '#22c55e',
    medium: '#f59e0b',
    high: '#ef4444'
  };
  
  // Best alternative recommendation
  const currentModeIndex = allEmissions.findIndex(e => e.mode === transportMode);
  const bestAlternative = allEmissions[0];
  const savingsPercent = currentModeIndex > 0 
    ? Math.round((1 - bestAlternative.emissions / emissions) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🌍 Geo-Mapping of Transport Impact
          </h1>
          <p className="text-gray-600 text-lg">
            Visualize transport routes and calculate real-time CO₂ emissions for different modes
          </p>
          <Badge className="mt-2 bg-blue-100 text-blue-800">Real-world Industry Use Case</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-4">
            {/* Location Selection */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📍 Route Configuration
                  <Badge className="bg-green-100 text-green-700">Interactive</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Source Location</Label>
                  <Select value={sourceLocation} onValueChange={setSourceLocation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(LOCATIONS).map(location => (
                        <SelectItem key={location} value={location}>{location}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Destination Location</Label>
                  <Select value={destinationLocation} onValueChange={setDestinationLocation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(LOCATIONS).map(location => (
                        <SelectItem key={location} value={location}>{location}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Transport Mode</Label>
                  <Select value={transportMode} onValueChange={(value: keyof typeof TRANSPORT_MODES) => {
                    try {
                      console.log('Transport mode changing to:', value);
                      setTransportMode(value);
                      
                      // Reset animation when changing modes
                      setIsAnimating(false);
                      
                      // Play sound separately
                      setTimeout(() => {
                        playSound('switch');
                      }, 0);
                    } catch (error) {
                      console.error('Transport mode change error:', error);
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TRANSPORT_MODES).map(([key, mode]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <span>{mode.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-600 mt-1">
                    {TRANSPORT_MODES[transportMode].description}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Cargo Weight (tons)</Label>
                  <Input
                    type="number"
                    value={cargoWeight}
                    onChange={(e) => setCargoWeight(Number(e.target.value))}
                    min="1"
                    max="10000"
                    className="mt-1"
                  />
                </div>
                
                <Separator />
                
                {/* Animation Controls */}
                <div className="space-y-2">
                <Button 
                  onClick={() => {
                    try {
                      console.log('Start Journey button clicked - Current state:', {
                        isAnimating,
                        transportMode,
                        sourceLocation,
                        destinationLocation,
                        distance,
                        route: route?.length
                      });
                      
                      // Validate before starting animation
                      if (!route || route.length < 2) {
                        console.error('Invalid route for animation:', route);
                        alert('Cannot start journey: Invalid route detected. Please refresh and try again.');
                        return;
                      }
                      
                      if (distance <= 0) {
                        console.error('Invalid distance for animation:', distance);
                        alert('Cannot start journey: Invalid distance calculated. Please select different locations.');
                        return;
                      }
                      
                      const newState = !isAnimating;
                      console.log('Changing animation state to:', newState);
                      setIsAnimating(newState);
                      
                      // Play sound separately to avoid blocking state change
                      setTimeout(() => {
                        try {
                          playSound(newState ? 'start' : 'complete');
                        } catch (soundError) {
                          console.warn('Sound playback failed:', soundError);
                        }
                      }, 0);
                    } catch (error) {
                      console.error('Critical error in Start Journey button:', error);
                      alert(`Journey start failed: ${error.message}. Please refresh the page and try again.`);
                    }
                  }}
                  className={`w-full transition-all duration-300 ${isAnimating ? 'animate-pulse' : ''}`}
                  variant={isAnimating ? "destructive" : "default"}
                >
                  {isAnimating ? '⏹️ Stop Journey' : `🚀 Start ${currentMode.name} Journey`}
                </Button>                  <Button 
                    onClick={() => setShowAllRoutes(!showAllRoutes)}
                    variant="outline"
                    className="w-full"
                  >
                    {showAllRoutes ? '👁️ Hide All Routes' : '🗺️ Show All Routes'}
                  </Button>
                </div>
                
                {/* Journey Progress - Only show during animation */}
                {isAnimating && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                      🎮 Live Journey Progress
                      <Badge className="bg-blue-100 text-blue-700">Continuous Loop</Badge>
                      {journeyStats.cycleCount > 0 && (
                        <Badge className="bg-orange-100 text-orange-700">
                          🔄 Cycle {journeyStats.cycleCount}
                        </Badge>
                      )}
                    </h4>
                    
                    {/* Direction Indicator */}
                    <div className="mb-2 flex items-center justify-center">
                      <Badge className={`${
                        journeyStats.isReversing ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {journeyStats.isReversing ? '◀ Return Journey' : '▶ Outbound Journey'}
                      </Badge>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Current Leg Progress</span>
                        <span className="font-bold text-blue-600">{Math.round(animationProgress * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-300 relative ${
                            journeyStats.isReversing 
                              ? 'bg-gradient-to-l from-red-500 to-orange-500' 
                              : 'bg-gradient-to-r from-blue-500 to-green-500'
                          }`}
                          style={{ width: `${animationProgress * 100}%` }}
                        >
                          <div className={`absolute right-0 top-0 h-3 w-3 rounded-full border-2 transform translate-x-1/2 ${
                            journeyStats.isReversing ? 'bg-red-300 border-red-600' : 'bg-white border-blue-500'
                          }`}></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Current Leg Stats */}
                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                      <div className="bg-white p-2 rounded border">
                        <div className="text-xs text-gray-500">Leg Distance</div>
                        <div className="font-bold text-blue-600">
                          {Math.round(journeyStats.distanceCovered)} km
                        </div>
                      </div>
                      <div className="bg-white p-2 rounded border">
                        <div className="text-xs text-gray-500">Leg CO₂</div>
                        <div className="font-bold text-red-600">
                          {Math.round(journeyStats.co2Generated)} kg
                        </div>
                      </div>
                    </div>
                    
                    {/* Total Accumulated Stats */}
                    {journeyStats.cycleCount > 0 && (
                      <div className="grid grid-cols-2 gap-3 text-sm mb-3 p-2 bg-orange-50 rounded border-l-4 border-orange-400">
                        <div className="text-center">
                          <div className="text-xs text-orange-600 font-medium">Total Distance</div>
                          <div className="font-bold text-orange-700">
                            {Math.round(journeyStats.totalDistanceCovered)} km
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-orange-600 font-medium">Total CO₂</div>
                          <div className="font-bold text-orange-700">
                            {Math.round(journeyStats.totalCo2Generated)} kg
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Speed and Status Indicators */}
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">Current Speed:</span>
                        <Badge className={`${
                          currentMode.speed > 500 ? 'bg-red-100 text-red-700' : 
                          currentMode.speed > 100 ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-green-100 text-green-700'
                        }`}>
                          {currentMode.speed} km/h
                        </Badge>
                        <span className="text-xs text-gray-600 ml-auto">
                          Map: <span className="font-medium capitalize">{currentMode.mapStyle}</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-center">
                        <Badge className="bg-purple-100 text-purple-700">
                          🔄 Continuous Loop Active
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Impact Summary */}
            <Card className="shadow-lg border-l-4" style={{ borderLeftColor: levelColors[emissionLevel] }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📊 Mission Summary
                  <Badge style={{ backgroundColor: levelColors[emissionLevel], color: 'white' }}>
                    {emissionLevel.toUpperCase()}
                  </Badge>
                  <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
                    {currentMode.mapStyle.toUpperCase()} VIEW
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">{Math.round(distance)}</div>
                    <div className="text-xs text-gray-600">km distance</div>
                    <div className="text-xs text-blue-500 font-medium">🌍 Route Length</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-gray-800">{cargoWeight}</div>
                    <div className="text-xs text-gray-600">tons cargo</div>
                    <div className="text-xs text-green-500 font-medium">📦 Payload</div>
                  </div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
                  <div className="text-3xl font-bold text-red-600">
                    {Math.round(emissions)} kg
                  </div>
                  <div className="text-sm text-red-700 font-medium">
                    CO₂ Emissions
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {currentMode.icon} {currentMode.name}
                  </div>
                  <div className="text-xs text-orange-600 mt-1">
                    ⚡ Speed: {currentMode.speed} km/h | ⏱️ ETA: {(distance / currentMode.speed).toFixed(1)}h
                  </div>
                </div>
                
                {/* Environmental Impact Visualization */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg border border-green-200">
                  <div className="text-xs font-semibold text-green-800 mb-2">🌱 Environmental Impact</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-600">Trees needed: </span>
                      <span className="font-bold text-green-600">{Math.round(emissions / 22)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Car equivalent: </span>
                      <span className="font-bold text-red-600">{(emissions / 4600).toFixed(1)} cars/year</span>
                    </div>
                  </div>
                </div>
                
                {savingsPercent > 0 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-sm font-medium text-green-800">💡 Optimization Tip</div>
                    <div className="text-xs text-green-700">
                      Switch to {bestAlternative.name} → Save {savingsPercent}% CO₂
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      🎯 Potential saving: {Math.round(emissions - bestAlternative.emissions)} kg CO₂
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Map Container */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🗺️ {currentMode.name} Route Map
                  <Badge className="bg-blue-100 text-blue-700">Live Visualization</Badge>
                  <Badge className={`${
                    currentMode.mapStyle === 'satellite' ? 'bg-purple-100 text-purple-700' :
                    currentMode.mapStyle === 'terrain' ? 'bg-orange-100 text-orange-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {currentMode.mapStyle.toUpperCase()} VIEW
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0" style={{ height: '520px' }}>
                {/* Map Container with Error Boundary */}
                <div className="h-full w-full">
                  {(() => {
                    try {
                      return (
                        <MapContainer
                          center={[20, 50]}
                          zoom={2}
                          style={{ height: '520px', width: '100%' }}
                          className="rounded-b-lg"
                          key={`${transportMode}-${sourceLocation}-${destinationLocation}`} // Force re-render on changes
                        >
                          <TileLayer
                            url={currentMode.tileUrl}
                            attribution={currentMode.attribution}
                          />
                          
                          <FitBounds bounds={bounds} />
                          
                          {/* Vehicle-Specific Source Marker */}
                          <Marker 
                            position={[sourceCoords[0], sourceCoords[1]]}
                            icon={createVehicleMarkerIcon(transportMode, true)}
                          >
                            <Popup>
                              <div className="text-center">
                                <div className="text-lg font-bold text-green-700">
                                  {TRANSPORT_MODES[transportMode].icon} START POINT
                                </div>
                                <div className="font-bold">{sourceLocation}</div>
                                <div className="text-sm text-gray-600">Manufacturing/Origin Point 🏭</div>
                                <div className="text-xs text-green-600 mt-1">
                                  Transport Mode: {TRANSPORT_MODES[transportMode].name}
                                </div>
                                <div className="text-xs text-blue-600">
                                  Ready for {TRANSPORT_MODES[transportMode].description.toLowerCase()}
                                </div>
                              </div>
                            </Popup>
                          </Marker>
                          
                          {/* Vehicle-Specific Destination Marker */}
                          <Marker 
                            position={[destCoords[0], destCoords[1]]}
                            icon={createVehicleMarkerIcon(transportMode, false)}
                          >
                            <Popup>
                              <div className="text-center">
                                <div className="text-lg font-bold text-red-700">
                                  {TRANSPORT_MODES[transportMode].icon} END POINT
                                </div>
                                <div className="font-bold">{destinationLocation}</div>
                                <div className="text-sm text-gray-600">Delivery Point 🎯</div>
                                <div className="text-xs text-red-600 mt-1">
                                  Transport Mode: {TRANSPORT_MODES[transportMode].name}
                                </div>
                                <div className="text-xs text-purple-600">
                                  Awaiting {TRANSPORT_MODES[transportMode].description.toLowerCase()}
                                </div>
                              </div>
                            </Popup>
                          </Marker>
                          
                          {/* Current Route */}
                          <Polyline
                            positions={route}
                            color={TRANSPORT_MODES[transportMode].color}
                            weight={4}
                            opacity={0.8}
                          />
                          
                          {/* All Routes (if enabled) */}
                          {showAllRoutes && Object.entries(TRANSPORT_MODES).map(([mode, config]) => (
                            <Polyline
                              key={mode}
                              positions={route}
                              color={config.color}
                              weight={mode === transportMode ? 4 : 2}
                              opacity={mode === transportMode ? 0.8 : 0.4}
                              dashArray={mode === transportMode ? undefined : "10, 10"}
                            />
                          ))}
                          
                          {/* Enhanced Animated Transport Icon with Error Handling */}
                          {isAnimating && (
                            <AnimatedTransportIcon
                              route={route}
                              mode={transportMode}
                              isAnimating={isAnimating}
                              distance={distance}
                              onAnimationUpdate={updateJourneyStats}
                            />
                          )}
                        </MapContainer>
                      );
                    } catch (mapError) {
                      console.error('Map rendering error:', mapError);
                      return (
                        <div className="h-full w-full flex items-center justify-center bg-red-50 rounded-b-lg">
                          <div className="text-center p-6">
                            <div className="text-red-600 text-xl mb-2">🗺️ Map Loading Error</div>
                            <div className="text-red-500 text-sm mb-4">
                              Failed to render map. This may be due to network issues or browser compatibility.
                            </div>
                            <Button 
                              onClick={() => window.location.reload()}
                              variant="destructive"
                              size="sm"
                            >
                              🔄 Reload Page
                            </Button>
                          </div>
                        </div>
                      );
                    }
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Comparison Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Transport Mode Comparison
              <Badge className="bg-purple-100 text-purple-700">All Options</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {allEmissions.map(({ mode, emissions: modeEmissions, name, icon, color, emissionFactor }) => {
                const isSelected = mode === transportMode;
                const savings = emissions > 0 ? Math.round((1 - modeEmissions / emissions) * 100) : 0;
                
                return (
                  <div 
                    key={mode}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50 shadow-lg scale-105' 
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                    }`}
                    onClick={() => {
                      setTransportMode(mode);
                      playSound('switch');
                    }}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">{icon}</div>
                      <div className="font-semibold text-gray-800">{name}</div>
                      <div className="text-sm text-gray-600 mb-3">
                        {emissionFactor} kg CO₂/ton-km
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-lg font-bold" style={{ color }}>
                          {Math.round(modeEmissions)} kg CO₂
                        </div>
                        
                        {!isSelected && savings !== 0 && (
                          <Badge 
                            className={`text-xs ${
                              savings > 0 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {savings > 0 ? `Save ${savings}%` : `+${Math.abs(savings)}% more`}
                          </Badge>
                        )}
                        
                        {isSelected && (
                          <Badge className="bg-blue-100 text-blue-700 text-xs">
                            Currently Selected
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Summary Stats */}
            <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">📈 Route Analysis Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {bestAlternative.name}
                  </div>
                  <div className="text-sm text-gray-600">Most Efficient Option</div>
                  <div className="text-xs text-green-700 font-medium">
                    {Math.round(bestAlternative.emissions)} kg CO₂
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {allEmissions[allEmissions.length - 1].name}
                  </div>
                  <div className="text-sm text-gray-600">Highest Emissions</div>
                  <div className="text-xs text-red-700 font-medium">
                    {Math.round(allEmissions[allEmissions.length - 1].emissions)} kg CO₂
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(((allEmissions[allEmissions.length - 1].emissions - bestAlternative.emissions) / allEmissions[allEmissions.length - 1].emissions) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Max Potential Savings</div>
                  <div className="text-xs text-blue-700 font-medium">
                    By choosing optimal mode
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GeoMapping;