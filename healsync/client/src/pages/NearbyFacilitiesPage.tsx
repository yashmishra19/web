import { useState, useEffect, useRef } from 'react';
import { 
  MapPin, List, Map, Phone, Navigation, Loader2, AlertCircle, 
  X, Clock, Globe, Mail, ShieldAlert, Sparkles,
  RefreshCw, Info, Heart
} from 'lucide-react';
import { Badge } from '../components/ui';

interface Facility {
  id: number;
  name: string;
  type: string;
  lat: number;
  lon: number;
  phone?: string;
  address?: string;
  speciality?: string;
  opening_hours?: string;
  emergency?: boolean;
  website?: string;
  email?: string;
  operator?: string;
  score: number; // Quality heuristic score
}

type ViewMode = 'list' | 'map';
type SortMode = 'best' | 'distance' | 'emergency';

function getNavigationUrl(lat: number, lon: number) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS) {
    return `maps://maps.apple.com/?q=${lat},${lon}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
}



function sortFacilities(list: Facility[], lat: number, lon: number, mode: SortMode): Facility[] {
  const sorted = [...list];
  sorted.sort((a, b) => {
    if (mode === 'best') {
      // Primary: Score (Heuristic), Secondary: Distance
      if (b.score !== a.score) return b.score - a.score;
      const da = Math.hypot(a.lat - lat, a.lon - lon);
      const db = Math.hypot(b.lat - lat, b.lon - lon);
      return da - db;
    } else if (mode === 'emergency') {
      // Primary: Emergency availability, Secondary: Distance
      if (a.emergency !== b.emergency) return a.emergency ? -1 : 1;
      const da = Math.hypot(a.lat - lat, a.lon - lon);
      const db = Math.hypot(b.lat - lat, b.lon - lon);
      return da - db;
    } else {
      // Proximity only
      const da = Math.hypot(a.lat - lat, a.lon - lon);
      const db = Math.hypot(b.lat - lat, b.lon - lon);
      return da - db;
    }
  });
  return sorted;
}

// ─── Google Maps iframe (searches hospitals near the user) ────────────────────
function GoogleMapView({ userLat, userLon }: { userLat: number; userLon: number }) {
  // Uses Google Maps embed search URL — shows native Google Maps with all nearby hospitals/clinics pinned
  const src = `https://maps.google.com/maps?q=hospitals+and+clinics+near+me&ll=${userLat},${userLon}&z=14&output=embed&iwloc=near`;

  return (
    <iframe
      title="Nearby Hospitals & Clinics - Google Maps"
      src={src}
      width="100%"
      height="100%"
      style={{ border: 0, borderRadius: '12px' }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NearbyFacilitiesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortMode, setSortMode] = useState<SortMode>('best');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const lastFetchRef = useRef<{ lat: number; lon: number } | null>(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    fetchFacilities();
    
    // Auto-refresh on significant movement
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setUserLocation({ lat, lon });

        if (lastFetchRef.current) {
          const dist = Math.hypot(lat - lastFetchRef.current.lat, lon - lastFetchRef.current.lon) * 111;
          if (dist > 1.0) { // Refresh if user moves > 1km (increased to prevent jitter)
            fetchFacilities();
          }
        }
      },
      undefined,
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []); // Run once on mount

  // Re-sort when sort mode changes
  useEffect(() => {
    if (userLocation && facilities.length > 0) {
      setFacilities(sortFacilities(facilities, userLocation.lat, userLocation.lon, sortMode));
    }
  }, [sortMode]);

  const fetchFacilities = () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    
    // Only show loading spinner if we don't have facilities yet (initial load)
    if (facilities.length === 0) {
      setLoading(true);
    }
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setUserLocation({ lat, lon });

        try {
          const radius = 5000;
          const query = `
            [out:json][timeout:25];
            (
              node["amenity"~"hospital|clinic|doctors"](around:${radius},${lat},${lon});
              way["amenity"~"hospital|clinic"](around:${radius},${lat},${lon});
              node["healthcare"~"hospital|clinic"](around:${radius},${lat},${lon});
            );
            out center;
          `;

          const res = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: query,
          });
          const data = await res.json();

          const parsed: Facility[] = data.elements
            .filter((el: any) => el.tags?.name || el.tags?.['name:en'])
            .map((el: any) => {
              const tags = el.tags || {};
              const fLat = el.lat ?? el.center?.lat;
              const fLon = el.lon ?? el.center?.lon;
              
              // Calculate a simple "Quality Score" based on data completeness
              let score = 0;
              if (tags.speciality || tags['healthcare:speciality']) score += 30;
              if (tags.emergency === 'yes') score += 50;
              if (tags.phone || tags['contact:phone']) score += 10;
              if (tags.opening_hours) score += 10;
              if (tags.website || tags.url) score += 10;

              return {
                id: el.id,
                name: tags.name || tags['name:en'] || 'Unnamed Facility',
                type: tags.amenity || tags.healthcare || 'facility',
                lat: fLat,
                lon: fLon,
                phone: tags.phone || tags['contact:phone'] || tags['emergency:phone'],
                speciality: tags.speciality || tags['healthcare:speciality'],
                opening_hours: tags.opening_hours,
                emergency: tags.emergency === 'yes',
                website: tags.website || tags.url || tags['contact:website'],
                email: tags.email || tags['contact:email'],
                operator: tags.operator,
                address: [
                  tags['addr:housenumber'],
                  tags['addr:street'],
                  tags['addr:city'],
                ].filter(Boolean).join(', ') || undefined,
                score
              };
            })
            .filter((f: Facility) => f.lat && f.lon);

          lastFetchRef.current = { lat, lon };
          setFacilities(sortFacilities(parsed, lat, lon, sortMode));
        } catch {
          // If we already have facilities, don't show the error screen, just keep current data
          if (facilities.length === 0) {
            setError('Failed to load nearby facilities. Please try again.');
          }
        } finally {
          setLoading(false);
          isFetchingRef.current = false;
        }
      },
      () => {
        setError('Location access denied. Please allow location permission and try again.');
        setLoading(false);
        isFetchingRef.current = false;
      },
      { timeout: 15000, enableHighAccuracy: true }
    );
  };

  const distanceKm = (lat: number, lon: number) => {
    if (!userLocation) return '';
    const d = Math.hypot(lat - userLocation.lat, lon - userLocation.lon) * 111;
    return d < 1 ? `${(d * 1000).toFixed(0)}m` : `${d.toFixed(1)}km`;
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <MapPin size={16} className="text-red-500" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-800 dark:text-gray-100">Nearby Hospitals & Clinics</h1>
            {userLocation && (
              <p className="text-xs text-gray-400">{facilities.length} facilities found within 5km</p>
            )}
          </div>
        </div>

        {/* Sort & View Toggle */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
          {/* Sort Toggle (Only visible in List View) */}
          {viewMode === 'list' && (
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
              <button
                onClick={() => setSortMode('best')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  sortMode === 'best'
                    ? 'bg-white dark:bg-gray-700 text-mint-600 dark:text-mint-400 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Best Match
              </button>
              <button
                onClick={() => setSortMode('distance')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  sortMode === 'distance'
                    ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Closest
              </button>
              <button
                onClick={() => setSortMode('emergency')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  sortMode === 'emergency'
                    ? 'bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                ER First
              </button>
            </div>
          )}

          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <List size={13} /> Details
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'map'
                  ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <Map size={13} /> Map
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <Loader2 size={32} className="text-mint-500 animate-spin" />
          <p className="text-sm text-gray-500">Detecting your location and fetching nearby facilities...</p>
        </div>
      )}

      {/* Error / Fallback */}
      {error && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">Network Congestion Detected</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-sm">
            The global community directory (OSM) is currently busy. For your safety, please use our <strong>Google Maps Fallback</strong> below.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
            <button
              onClick={fetchFacilities}
              className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-2xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} /> Retry Directory
            </button>
            <a
              href={userLocation ? `https://www.google.com/maps/search/hospitals+and+clinics+near+me/@${userLocation.lat},${userLocation.lon},14z` : 'https://www.google.com/maps/search/hospitals+and+clinics+near+me'}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
            >
              <Map size={16} /> Open Google Maps
            </a>
          </div>

          {userLocation && (
            <div className="mt-8 w-full max-w-lg aspect-video rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-xl">
              <GoogleMapView userLat={userLocation.lat} userLon={userLocation.lon} />
            </div>
          )}
        </div>
      )}

      {/* ── DETAIL LIST VIEW ── */}
      {!loading && !error && viewMode === 'list' && (
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {facilities.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <MapPin size={28} className="text-gray-300" />
              <p className="text-sm text-gray-400">No facilities found nearby.</p>
            </div>
          )}
          {facilities.map((f) => (
            <div
              key={f.id}
              onClick={() => setSelectedFacility(f)}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex items-start gap-3 hover:border-mint-300 dark:hover:border-mint-700 transition-all cursor-pointer group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                f.type === 'hospital' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
              }`}>
                <span className="text-lg">{f.type === 'hospital' ? '🏥' : '🩺'}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight group-hover:text-mint-600 transition-colors">{f.name}</p>
                  <div className="flex gap-1">
                    {f.emergency && (
                      <span className="text-[10px] bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider animate-pulse">
                        ER
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-medium capitalize ${
                      f.type === 'hospital'
                        ? 'bg-red-50 text-red-600 dark:bg-red-900/10'
                        : 'bg-blue-50 text-blue-600 dark:bg-blue-900/10'
                    }`}>
                      {f.type}
                    </span>
                  </div>
                </div>

                {f.speciality && (
                  <p className="text-[11px] text-mint-600 dark:text-mint-400 mt-0.5 line-clamp-1 italic">{f.speciality}</p>
                )}

                {f.address && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{f.address}</p>
                )}

                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Navigation size={10} /> {distanceKm(f.lat, f.lon)}
                  </span>

                  {f.opening_hours && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={10} /> {f.opening_hours.includes('24/7') ? 'Open 24/7' : 'Check Hours'}
                    </span>
                  )}

                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(getNavigationUrl(f.lat, f.lon), '_blank');
                      }}
                      className="text-xs bg-mint-500 text-white px-3 py-1 rounded-lg hover:bg-mint-600 transition-colors flex items-center gap-1"
                    >
                      <Navigation size={10} /> Navigate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── GOOGLE MAP VIEW ── */}
      {!loading && !error && viewMode === 'map' && userLocation && (
        <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md relative">
          <GoogleMapView userLat={userLocation.lat} userLon={userLocation.lon} />
        </div>
      )}

      {/* ── FACILITY DETAIL MODAL ── */}
      {selectedFacility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-modal-backdrop"
            onClick={() => setSelectedFacility(null)}
          />
          <div className="relative bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-modal-content flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className={`p-6 pb-4 flex items-start justify-between ${
              selectedFacility.type === 'hospital' ? 'bg-red-50/50 dark:bg-red-900/10' : 'bg-blue-50/50 dark:bg-blue-900/10'
            }`}>
              <div className="flex gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${
                  selectedFacility.type === 'hospital' ? 'bg-white dark:bg-red-900/30' : 'bg-white dark:bg-blue-900/30'
                }`}>
                  {selectedFacility.type === 'hospital' ? '🏥' : '🩺'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-1">
                    {selectedFacility.name}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Badge color={selectedFacility.type === 'hospital' ? 'red' : 'blue'} className="capitalize">
                      {selectedFacility.type}
                    </Badge>
                    {selectedFacility.emergency && (
                      <Badge color="red" className="flex items-center gap-1">
                        <ShieldAlert size={10} /> 24/7 EMERGENCY
                      </Badge>
                    )}
                    <span className="text-xs text-gray-400 font-medium">
                      {distanceKm(selectedFacility.lat, selectedFacility.lon)} away
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedFacility(null)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
                aria-label="Close"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Quality Score Insights */}
              {selectedFacility.score > 70 && (
                <div className="bg-mint-50 dark:bg-mint-900/20 border border-mint-100 dark:border-mint-800 rounded-2xl p-4 flex gap-3">
                  <Sparkles className="text-mint-500 shrink-0" size={20} />
                  <div>
                    <p className="text-sm font-semibold text-mint-800 dark:text-mint-300">High Trust Rating</p>
                    <p className="text-xs text-mint-600/80 dark:text-mint-400">Verified specialization and emergency facilities available.</p>
                  </div>
                </div>
              )}

              {/* Specializations */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Info size={12} /> Medical Help & Specializations
                </h3>
                {selectedFacility.speciality ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedFacility.speciality.split(';').map((s, i) => (
                      <span key={i} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-medium border border-gray-200 dark:border-gray-700">
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">General practice and consultation services</p>
                )}
              </div>

              {/* Contact & Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Contact Information</h3>
                  <div className="space-y-3">
                    {selectedFacility.phone && (
                      <a href={`tel:${selectedFacility.phone}`} className="flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded-lg bg-mint-50 dark:bg-mint-900/20 text-mint-600 flex items-center justify-center shrink-0">
                          <Phone size={14} />
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:underline">
                          {selectedFacility.phone}
                        </span>
                      </a>
                    )}
                    {selectedFacility.website && (
                      <a href={selectedFacility.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center shrink-0">
                          <Globe size={14} />
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:underline truncate">
                          Visit Website
                        </span>
                      </a>
                    )}
                    {selectedFacility.email && (
                      <a href={`mailto:${selectedFacility.email}`} className="flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center shrink-0">
                          <Mail size={14} />
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:underline truncate">
                          Send Email
                        </span>
                      </a>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Service Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center shrink-0">
                        <Clock size={14} />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {selectedFacility.opening_hours || 'Contact for hours'}
                      </span>
                    </div>
                    {selectedFacility.operator && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 flex items-center justify-center shrink-0">
                          <Heart size={14} />
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          By: {selectedFacility.operator}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 flex gap-3">
                <MapPin className="text-gray-400 shrink-0" size={18} />
                <p className="text-xs text-gray-500 leading-relaxed">
                  {selectedFacility.address || 'Address details not available in directory. Please use navigation for exact spot.'}
                </p>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-6 pt-2 grid grid-cols-2 gap-3 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => {
                  setViewMode('map');
                  setSelectedFacility(null);
                }}
                className="btn-secondary py-3 flex items-center justify-center gap-2 text-sm font-semibold rounded-2xl"
              >
                <Map size={18} /> Focus on Map
              </button>
              <a
                href={getNavigationUrl(selectedFacility.lat, selectedFacility.lon)}
                target="_blank"
                rel="noreferrer"
                className="bg-mint-500 text-white py-3 flex items-center justify-center gap-2 text-sm font-semibold rounded-2xl hover:bg-mint-600 transition-all shadow-lg shadow-mint-500/20 active:scale-95"
              >
                <Navigation size={18} /> Navigate Now
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
