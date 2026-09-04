import React, { useState, useEffect } from 'react';
import { hospitalService } from '../../services/hospitalService';
import { HospitalDepartment, Hospital } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Layers, Plus, CheckCircle2, Clock, Users, Building2 } from 'lucide-react';

export const HospitalDepartments: React.FC = () => {
  const [departments, setDepartments] = useState<HospitalDepartment[]>([]);
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDepts = async () => {
      try {
        const res = await hospitalService.getMyProfile();
        if (res.success) {
          setHospital(res.hospital);
          setDepartments(res.departments || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    loadDepts();
  }, []);

  if (isLoading) {
    return <LoadingSkeleton rows={5} />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-brand-500" />
            Hospital Clinical Departments & OPD Tokens
          </h2>
          <p className="text-xs text-slate-500">
            Manage active department schedules, daily token capacity, and consultation fees
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {departments.map((dept) => (
          <div
            key={dept._id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card space-y-4"
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-base text-slate-900">{dept.name}</h4>
                {dept.headDoctorName && (
                  <p className="text-xs text-teal-700 font-semibold">{dept.headDoctorName}</p>
                )}
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800">
                {dept.consultationFee === 0 ? 'FREE OPD' : `₹${dept.consultationFee}`}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{dept.description}</p>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">OPD Schedule</span>
                <span className="font-semibold text-slate-800">{dept.opdTimings}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Token Availability</span>
                <span className="font-bold text-teal-700">
                  {dept.availableTokensToday} / {dept.dailyTokenCapacity} Available
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 pt-1">
              {dept.opdDays.map((day, i) => (
                <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                  {day.slice(0, 3)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
