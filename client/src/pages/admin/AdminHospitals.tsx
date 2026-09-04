import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Building2, MapPin, Phone, Bed, Clock } from 'lucide-react';

export const AdminHospitals: React.FC = () => {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHospitals = async () => {
      try {
        const res = await adminService.getAllHospitals();
        if (res.success) {
          setHospitals(res.hospitals || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    loadHospitals();
  }, []);

  if (isLoading) {
    return <LoadingSkeleton rows={6} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-brand-500" />
            Connected Hospital Registry
          </h2>
          <p className="text-xs text-slate-500">
            Empaneled public and private facilities configured for PFIS triage
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
          {hospitals.length} Active Facilities
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hospitals.map((hosp) => (
          <div
            key={hosp._id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card space-y-3 text-xs"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                  {hosp.type}
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-1">{hosp.name}</h4>
                <p className="text-slate-500">{hosp.address}, {hosp.city}</p>
              </div>

              {hosp.emergencyAvailable && (
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                  🚨 24/7 Emergency
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Beds</span>
                <span className="font-semibold text-slate-800">{hosp.availableBeds} / {hosp.totalBeds} Vacant</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Avg Wait</span>
                <span className="font-semibold text-slate-800">~{hosp.averageWaitTimeMinutes}m</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
              <span>Phone: {hosp.phone}</span>
              <span className="font-medium text-slate-600">Rating: {hosp.rating} ★</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
