import { useState, useEffect } from 'react';
import { MapPin, List, Map, Phone, Navigation, Loader2, AlertCircle, ExternalLink } from 'lucide-react';

interface Facility {
  id: number;
  name: string;
  type: string;
  lat: number;
  lon: number;
  phone?: string;
  address?: string;
}

type ViewMode = 'list' | 'map';

function getGoogleMapsUrl(lat: number, lon: number, name: string) {
  return `https://www.google.com/maps/search/${encodeURIComponent(name)}/@${lat},${lon},17z`;
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
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

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
              node["amenity"="hospital"](around:${radius},${lat},${lon});
              way["amenity"="hospital"](around:${radius},${lat},${lon});
              node["amenity"="clinic"](around:${radius},${lat},${lon});
              way["amenity"="clinic"](around:${radius},${lat},${lon});
              node["amenity"="doctors"](around:${radius},${lat},${lon});
              node["healthcare"="hospital"](around:${radius},${lat},${lon});
              node["healthcare"="clinic"](around:${radius},${lat},${lon});
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
            .map((el: any) => ({
              id: el.id,
              name: el.tags?.name || el.tags?.['name:en'] || 'Unnamed Facility',
              type: el.tags?.amenity || el.tags?.healthcare || 'facility',
              lat: el.lat ?? el.center?.lat,
              lon: el.lon ?? el.center?.lon,
              phone: el.tags?.phone || el.tags?.['contact:phone'],
              address: [
                el.tags?.['addr:housenumber'],
                el.tags?.['addr:street'],
                el.tags?.['addr:city'],
              ].filter(Boolean).join(', ') || undefined,
            }))
            .filter((f: Facility) => f.lat && f.lon);

          parsed.sort((a, b) => {
            const da = Math.hypot(a.lat - lat, a.lon - lon);
            const db = Math.hypot(b.lat - lat, b.lon - lon);
            return da - db;
          });

          setFacilities(parsed);
        } catch {
          setError('Failed to load nearby facilities. Please try again.');
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError('Location access denied. Please allow location permission and try again.');
        setLoading(false);
      },
      { timeout: 10000 }
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
            <List size={13} /> Detail View
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'map'
                ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <Map size={13} /> Map View
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <Loader2 size={32} className="text-mint-500 animate-spin" />
          <p className="text-sm text-gray-500">Detecting your location and fetching nearby facilities...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertCircle size={22} className="text-red-500" />
          </div>
          <p className="text-sm text-gray-500 text-center max-w-xs">{error}</p>
          <button
            onClick={fetchFacilities}
            className="px-4 py-2 bg-mint-500 text-white text-sm rounded-xl hover:bg-mint-600 transition-colors"
          >
            Try Again
          </button>
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
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex items-start gap-3 hover:border-mint-300 dark:hover:border-mint-700 transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                f.type === 'hospital' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
              }`}>
                <span className="text-lg">🏥</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight">{f.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-medium capitalize ${
                    f.type === 'hospital'
                      ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {f.type}
                  </span>
                </div>

                {f.address && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{f.address}</p>
                )}

                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Navigation size={10} /> {distanceKm(f.lat, f.lon)} away
                  </span>

                  {f.phone && (
                    <a href={`tel:${f.phone}`} className="text-xs text-mint-600 dark:text-mint-400 flex items-center gap-1 hover:underline">
                      <Phone size={10} /> {f.phone}
                    </a>
                  )}

                  <a
                    href={getGoogleMapsUrl(f.lat, f.lon, f.name)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-500 flex items-center gap-1 hover:underline ml-auto"
                  >
                    <ExternalLink size={10} /> Directions
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── GOOGLE MAP VIEW ── */}
      {!loading && !error && viewMode === 'map' && userLocation && (
        <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md">
          <GoogleMapView userLat={userLocation.lat} userLon={userLocation.lon} />
        </div>
      )}
    </div>
  );
}
