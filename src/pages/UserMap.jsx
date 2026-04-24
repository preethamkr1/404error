import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { SERVER_URL } from '../config';
import { MapPin, Search, Navigation, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom Icons for different statuses (Using a Printer SVG icon)
const createIcon = (color) => {
  return new L.DivIcon({
    className: 'bg-transparent',
    html: `
      <div style="background-color: white; width: 36px; height: 36px; border-radius: 50%; border: 3px solid ${color}; box-shadow: 0 4px 10px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
           <path d="M6 9V2h12v7"></path>
           <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
           <path d="M6 14h12v8H6z"></path>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });
};

const icons = {
  free: createIcon('#4f46e5'), // indigo-600
  moderate: createIcon('#f59e0b'), // amber-500
  busy: createIcon('#f97316'), // orange-500
  closed: createIcon('#ef4444'), // red-500
};

const statusLabels = {
  free: 'Available Now',
  moderate: 'Moderate Wait',
  busy: 'Very Busy (~15m)',
  closed: 'Closed'
};

const RecenterMap = ({ location }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(location, 16); // Closer initial zoom
  }, [location, map]);
  return null;
};

const UserMap = () => {
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [userLocation, setUserLocation] = useState([17.4401, 78.3489]); // fallback
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => console.warn(err)
      );
    }
  }, []);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await axios.get(`${SERVER_URL}/api/shops/nearby?lat=${userLocation[0]}&lng=${userLocation[1]}`);
        setShops(res.data.shops);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, [userLocation]);

  return (
    <div className="h-screen w-full flex flex-col bg-slate-950 font-sans">
      <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="text-white font-bold text-xl hover:text-indigo-400 transition">
              SafePrint<span className="text-indigo-500">.</span>
            </button>
            <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-xs ml-4">Nearby Shops</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar List */}
        <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col z-10">
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-white font-bold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-500" />
              Available Shops
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {loading ? (
              <div className="text-slate-500 text-center py-10 text-sm italic">Locating nearby shops...</div>
            ) : shops.length === 0 ? (
              <div className="text-slate-500 text-center py-10 text-sm">No shops found in this area.</div>
            ) : (
              shops.map((shop) => (
                <div 
                  key={shop.id} 
                  className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-indigo-500/50 transition-all group cursor-pointer"
                  onClick={() => setUserLocation(shop.location)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white font-bold text-sm group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{shop.name}</h3>
                    <div className={`w-2 h-2 rounded-full mt-1 ${
                      shop.status === 'free' ? 'bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.4)]' :
                      shop.status === 'moderate' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' :
                      shop.status === 'busy' ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]' :
                      'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                    }`} />
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed mb-3 line-clamp-2 italic">
                    {shop.address || "Address not provided"}
                  </p>
                  <div className="flex items-center justify-between">
                     <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                        shop.status === 'free' ? 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10' :
                        shop.status === 'moderate' ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' :
                        shop.status === 'busy' ? 'border-orange-500/30 text-orange-400 bg-orange-500/10' :
                        'border-red-500/30 text-red-400 bg-red-500/10'
                      }`}>
                        {statusLabels[shop.status]}
                      </span>
                      <button className="text-indigo-500 text-[10px] font-bold flex items-center gap-1 hover:text-indigo-400 transition-colors">
                        View <ChevronRight className="w-3 h-3" />
                      </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Map View */}
        <div className="flex-1 relative">
          <MapContainer 
            center={userLocation} 
            zoom={16} 
            maxZoom={19}
            className="w-full h-full z-0" 
            style={{ background: '#020617' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              maxZoom={19}
            />
            <RecenterMap location={userLocation} />

            {/* User Marker */}
            <Marker position={userLocation} icon={new L.DivIcon({ className: 'bg-transparent', html: '<div class="w-4 h-4 bg-indigo-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(79,70,229,0.6)]"></div>', iconSize: [16,16] })}>
              <Popup className="custom-popup">You are here</Popup>
            </Marker>

            {/* Shop Markers */}
            {shops.map((shop) => (
              <Marker key={shop.id} position={shop.location} icon={icons[shop.status] || icons['free']}>
                <Popup className="custom-popup">
                  <div className="p-0 flex flex-col w-48">
                    {/* Realistic Print Shop Image Image */}
                    <img 
                      src={`https://images.unsplash.com/photo-1598440947619-2ce1be41ce0e?auto=format&fit=crop&q=80&w=400&h=200`} 
                      alt="Shop" 
                      className="w-full h-24 object-cover rounded-t-md border-b"
                    />
                    <div className="p-3">
                      <h3 className="font-bold text-base text-slate-900 mb-0.5 leading-tight">{shop.name}</h3>
                      <p className="text-xs text-slate-500 mb-3">{shop.address}</p>
                      
                      <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${
                          shop.status === 'free' ? 'bg-indigo-100 text-indigo-700' :
                          shop.status === 'moderate' ? 'bg-amber-100 text-amber-700' :
                          shop.status === 'busy' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                        {statusLabels[shop.status]}
                      </span>
                      {shop.status !== 'closed' && (
                        <button onClick={() => navigate('/upload')} className="bg-slate-900 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-slate-800 transition">
                          Upload File
                        </button>
                      )}
                    </div>
                  </div>
                 </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Legend */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-700 shadow-2xl z-[1000] flex gap-4">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.5)]"></div><span className="text-xs text-slate-300 font-medium whitespace-nowrap">Free</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div><span className="text-xs text-slate-300 font-medium whitespace-nowrap">Moderate</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.5)]"></div><span className="text-xs text-slate-300 font-medium whitespace-nowrap">Busy</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div><span className="text-xs text-slate-300 font-medium whitespace-nowrap">Closed</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserMap;
 