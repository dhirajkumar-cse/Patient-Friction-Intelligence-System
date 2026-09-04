import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Hospital } from '../../types';
import { Button } from '../common/Button';
import { Building2, Navigation, Phone, CheckCircle } from 'lucide-react';

// Fix Leaflet Default Marker Icons in Webpack/Vite
const UserIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `<div style="background-color: #0d9488; width: 22px; height: 22px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 10px rgba(13,148,136,0.6); display: flex; align-items: center; justify-content: center;"><div style="width: 6px; height: 6px; background-color: #fff; border-radius: 50%;"></div></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const HospitalIcon = L.divIcon({
  className: 'custom-hospital-marker',
  html: `<div style="background-color: #0f172a; color: #fff; width: 28px; height: 28px; border-radius: 8px; border: 2px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 13px;">H</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const EmergencyIcon = L.divIcon({
  className: 'custom-emergency-marker',
  html: `<div style="background-color: #dc2626; color: #fff; width: 30px; height: 30px; border-radius: 8px; border: 2px solid #fff; box-shadow: 0 0 12px rgba(220,38,38,0.5); display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">+</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// Component to dynamically recenter map when center changes
const RecenterMap: React.FC<{ center: [number, number]; zoom?: number }> = ({
  center,
  zoom = 12,
}) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export interface HospitalMapProps {
  userLocation: { latitude: number; longitude: number };
  hospitals: Hospital[];
  selectedHospitalId?: string;
  onSelectHospital?: (hospital: Hospital) => void;
  radiusKm?: number;
  height?: string;
}

export const HospitalMap: React.FC<HospitalMapProps> = ({
  userLocation,
  hospitals,
  selectedHospitalId,
  onSelectHospital,
  radiusKm = 25,
  height = '480px',
}) => {
  const center: [number, number] = [userLocation.latitude, userLocation.longitude];

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md">
      {/* Map Status Badge */}
      <div className="absolute top-3 right-3 z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>PFIS Map Active (Interactive Geo-Spatial Engine)</span>
      </div>

      <div style={{ height }}>
        <MapContainer center={center} zoom={11} scrollWheelZoom={false} className="w-full h-full">
          <RecenterMap center={center} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User Location Marker */}
          <Marker position={center} icon={UserIcon}>
            <Popup>
              <div className="p-1 space-y-1 text-xs">
                <div className="font-bold text-teal-700 flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Your Detected Location</span>
                </div>
                <p className="text-slate-500">
                  Lat: {userLocation.latitude.toFixed(4)}, Lng: {userLocation.longitude.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>

          {/* User Radius Circle */}
          <Circle
            center={center}
            radius={radiusKm * 1000}
            pathOptions={{
              color: '#0d9488',
              fillColor: '#14b8a6',
              fillOpacity: 0.08,
              weight: 1.5,
              dashArray: '4, 4',
            }}
          />

          {/* Hospital Markers */}
          {hospitals.map((hosp) => {
            const isSelected = selectedHospitalId === hosp._id;
            const markerIcon = hosp.emergencyAvailable ? EmergencyIcon : HospitalIcon;

            return (
              <Marker
                key={hosp._id}
                position={[hosp.latitude, hosp.longitude]}
                icon={markerIcon}
              >
                <Popup>
                  <div className="p-1 space-y-2 text-xs min-w-[200px]">
                    <div>
                      <div className="flex items-center gap-1 font-bold text-slate-900 text-sm">
                        <Building2 className="w-3.5 h-3.5 text-slate-600" />
                        <span>{hosp.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{hosp.address}, {hosp.city}</p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-medium bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      <span className="text-teal-700 font-bold">
                        {hosp.distanceKm ? `${hosp.distanceKm} km away` : 'Nearby'}
                      </span>
                      <span className="text-slate-600">
                        {hosp.emergencyAvailable ? '🚨 24/7 Emergency' : 'OPD Available'}
                      </span>
                    </div>

                    {onSelectHospital && (
                      <button
                        onClick={() => onSelectHospital(hosp)}
                        className="w-full mt-1 px-2.5 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors text-center block"
                      >
                        View Details & Request
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};
