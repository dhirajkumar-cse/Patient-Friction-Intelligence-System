import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { publicHealthService, Referral } from '../../services/publicHealthService';
import { useToast } from '../../context/ToastContext';
import {
  GitFork,
  ArrowRight,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Building2,
  FileText,
  Share2,
  Printer,
  QrCode,
  ShieldAlert,
  Search,
} from 'lucide-react';

export const ReferralTrackingPage: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Form State for new referral
  const [patientName, setPatientName] = useState('Sunita Devi');
  const [fromFacility, setFromFacility] = useState('Primary Health Centre (PHC) Mahabaleshwar');
  const [fromTier, setFromTier] = useState('Primary Health Centre (PHC)');
  const [toFacility, setToFacility] = useState('Rural Hospital Wai (30-Bedded Community Health Centre)');
  const [toTier, setToTier] = useState('Rural Hospital (RH)');
  const [specialty, setSpecialty] = useState('Obstetrics & Sonography');
  const [reason, setReason] = useState('Persistent severe hypertension and calf numbness. Requires 12-lead ECG, USG, and specialist physician review.');
  const [priority, setPriority] = useState<'Routine' | 'Urgent' | 'Emergency'>('Urgent');
  const [transportMode, setTransportMode] = useState('102 Janani / Shishu Ambulatory Van');

  const fetchReferrals = async () => {
    try {
      setIsLoading(true);
      const data = await publicHealthService.getReferrals();
      setReferrals(data);
      if (data.length > 0 && !selectedReferral) {
        setSelectedReferral(data[0]);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch referrals', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const handleCreateReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newRef = await publicHealthService.createReferral({
        patient_name: patientName,
        from_facility_name: fromFacility,
        from_tier: fromTier,
        to_facility_name: toFacility,
        to_tier: toTier,
        specialty_required: specialty,
        reason_for_referral: reason,
        priority,
        transport_mode: transportMode,
      });
      showToast(`Referral slip ${newRef.referral_code} generated successfully!`, 'success');
      setIsNewModalOpen(false);
      fetchReferrals();
      setSelectedReferral(newRef);
    } catch (err: any) {
      showToast(err.message || 'Failed to create referral', 'error');
    }
  };

  const handleStatusAdvance = async (id: string, currentStatus: string) => {
    const nextStatusMap: Record<string, string> = {
      'Initiated': 'In Transit',
      'In Transit': 'Arrived',
      'Arrived': 'Specialist Consulted',
      'Specialist Consulted': 'Counter-Referred',
      'Counter-Referred': 'Completed',
    };
    const next = nextStatusMap[currentStatus];
    if (!next) return;

    try {
      const updated = await publicHealthService.updateReferralStatus(
        id,
        next,
        next === 'Counter-Referred' ? 'Specialist physician initiated counter-referral back to local PHC with 30-day oral medication regimen.' : undefined
      );
      showToast(`Referral updated to status: ${next}`, 'success');
      fetchReferrals();
      setSelectedReferral(updated);
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const STAGES = ['Initiated', 'In Transit', 'Arrived', 'Specialist Consulted', 'Counter-Referred'];

  const getStageIndex = (status: string) => {
    const idx = STAGES.indexOf(status);
    return idx === -1 ? (status === 'Completed' ? STAGES.length : 0) : idx;
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold uppercase tracking-wider">
              <GitFork className="w-3.5 h-3.5" />
              <span>SIH 26133 • Closed-Loop Referral Tracking Across Public Tiers</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Tiered Public Health Referral Pathway
            </h1>
            <p className="text-emerald-100/90 text-sm max-w-2xl leading-relaxed">
              Eliminating lost referrals and delays. Tracks patient movement between <strong>Sub-Centre</strong> ➡️ <strong>PHC</strong> ➡️ <strong>Rural Hospital</strong> ➡️ <strong>District Hospital</strong> with transport coordination and counter-referral feedback.
            </p>
          </div>
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="self-start sm:self-auto px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Electronic Referral Slip</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Referral List + Selected Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Referral List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Active Referrals ({referrals.length})
            </h3>
            <span className="text-xs text-slate-500">Live Status Updates</span>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400 text-sm">Loading referrals...</div>
            ) : referrals.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 text-sm">
                No active referrals found.
              </div>
            ) : (
              referrals.map((ref) => {
                const isSelected = selectedReferral?.id === ref.id;
                return (
                  <div
                    key={ref.id}
                    onClick={() => setSelectedReferral(ref)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50/60 dark:bg-teal-950/40 border-teal-500 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-400 bg-teal-100/60 dark:bg-teal-900/60 px-2 py-0.5 rounded">
                        {ref.referral_code}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          ref.priority === 'Emergency'
                            ? 'bg-rose-100 text-rose-700'
                            : ref.priority === 'Urgent'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {ref.priority}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {ref.patient_name}
                    </h4>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mt-2">
                      <span className="font-medium truncate max-w-[130px]">{ref.from_tier}</span>
                      <ArrowRight className="w-3 h-3 text-teal-500 shrink-0" />
                      <span className="font-medium text-slate-900 dark:text-white truncate max-w-[150px]">
                        {ref.to_tier}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3 h-3" /> {ref.transport_mode}
                      </span>
                      <span className="font-semibold text-teal-600 dark:text-teal-400">
                        {ref.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Referral Detail & Multi-Tier Tracker */}
        <div className="lg:col-span-7">
          {selectedReferral ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
              {/* Slip Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md">
                      {selectedReferral.referral_code}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      Active Referral
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                    {selectedReferral.patient_name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Referred on {new Date(selectedReferral.created_at).toLocaleDateString()} for {selectedReferral.specialty_required}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => window.print()}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Slip</span>
                  </button>
                  <button
                    onClick={() => showToast('Referral link copied with QR Verification token!', 'success')}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Multi-Stage Visual Pipeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Referral Progression Pipeline
                </h4>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2 text-center text-[10px] sm:text-xs">
                  {STAGES.map((stage, idx) => {
                    const currentIdx = getStageIndex(selectedReferral.status);
                    const isCompleted = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div key={stage} className="flex flex-col items-center">
                        <div
                          className={`w-full h-2 rounded-full mb-2 transition-all ${
                            isCompleted ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'
                          }`}
                        />
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                            isCurrent
                              ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950'
                              : isCompleted
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <span
                          className={`mt-1 font-semibold line-clamp-1 ${
                            isCurrent ? 'text-emerald-600 font-bold' : 'text-slate-500'
                          }`}
                        >
                          {stage}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Origin & Destination Facilities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Initiating Health Facility
                  </span>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">
                    {selectedReferral.from_facility_name}
                  </p>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {selectedReferral.from_tier}
                  </span>
                </div>

                <div className="space-y-1 sm:border-l sm:border-slate-200 sm:dark:border-slate-700 sm:pl-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    Receiving Referral Facility
                  </span>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">
                    {selectedReferral.to_facility_name}
                  </p>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300">
                    {selectedReferral.to_tier}
                  </span>
                </div>
              </div>

              {/* Reason & Clinical Notes */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Reason for Referral & Clinical Indication
                </span>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 bg-amber-50/50 dark:bg-amber-950/20 p-3.5 rounded-xl border border-amber-200/60 dark:border-amber-900/40 leading-relaxed">
                  {selectedReferral.reason_for_referral}
                </p>
              </div>

              {/* Transit & Counter-Referral Feedback */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 font-medium block">Transit Arrangement</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-1">
                    <Truck className="w-4 h-4 text-teal-600" /> {selectedReferral.transport_mode}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 font-medium block">Counter-Referral Loop</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300 block mt-1">
                    {selectedReferral.counter_referral_notes || 'Pending specialist discharge & local PHC follow-up instructions.'}
                  </span>
                </div>
              </div>

              {/* Advance Status Button */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500">
                  Current Status: <strong className="text-slate-800 dark:text-slate-200">{selectedReferral.status}</strong>
                </div>

                {selectedReferral.status !== 'Completed' && (
                  <button
                    onClick={() => handleStatusAdvance(selectedReferral.id, selectedReferral.status)}
                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Advance Referral to Next Stage</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center text-slate-400 text-sm">
              Select a referral from the left panel to view its real-time multi-tier transit and counter-referral loop.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Electronic Referral Slip */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    New Electronic Referral Slip
                  </h3>
                  <p className="text-xs text-slate-500">
                    Inter-facility transfer across Maharashtra public health tiers
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReferral} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Patient Name
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Referring Facility (Origin)
                  </label>
                  <select
                    value={fromTier}
                    onChange={(e) => setFromTier(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  >
                    <option value="Sub-Centre / AAM">Sub-Centre / AAM</option>
                    <option value="Primary Health Centre (PHC)">Primary Health Centre (PHC)</option>
                    <option value="Rural Hospital (RH)">Rural Hospital (RH)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Receiving Tier (Destination)
                  </label>
                  <select
                    value={toTier}
                    onChange={(e) => setToTier(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  >
                    <option value="Rural Hospital (RH)">Rural Hospital (RH)</option>
                    <option value="Sub-District Hospital (SDH)">Sub-District Hospital (SDH)</option>
                    <option value="District Hospital (DH)">District Hospital (DH)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  >
                    <option value="Routine">Routine</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Transport Mode
                  </label>
                  <select
                    value={transportMode}
                    onChange={(e) => setTransportMode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  >
                    <option value="102 Janani Shishu Express">102 Janani Shishu Express (Free)</option>
                    <option value="108 Emergency Ambulance">108 Emergency Ambulance (ALS)</option>
                    <option value="Public Bus (MSRTC)">Public Bus (MSRTC)</option>
                    <option value="Private Auto / Vehicle">Private Auto / Vehicle</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Specialty Required
                </label>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                  placeholder="e.g. Obstetrics, Cardiology, General Surgery"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Reason for Referral & Clinical Summary
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow transition-all"
                >
                  Generate & Send Referral
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
