import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { publicHealthService, TriageResult } from '../../services/publicHealthService';
import { useToast } from '../../context/ToastContext';
import {
  Stethoscope,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Building2,
  MapPin,
  Clock,
  ArrowRight,
  ShieldAlert,
  FileText,
  Ambulance,
  Sparkles,
  QrCode,
  Calendar,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DigitalTriagePage: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [chiefComplaint, setChiefComplaint] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [systolicBP, setSystolicBP] = useState<number | ''>('');
  const [mobility, setMobility] = useState('Walkable');
  const [distanceKm, setDistanceKm] = useState<number>(18);
  const [hasCaregiver, setHasCaregiver] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);

  const COMMON_SYMPTOMS = [
    'High Fever / Chills',
    'Severe Headache & Dizziness',
    'Persistent Cough (> 2 weeks)',
    'Shortness of Breath',
    'Chest Pain / Heaviness',
    'Abdominal Pain / Cramps',
    '3rd Trimester Pregnancy Pain',
    'Joint Pain / Inability to Walk',
    'Numbness in Legs / Feet',
    'Diarrhea & Vomiting',
    'Open Wound / Dressing Required',
    'Routine Blood Pressure / Sugar Refill',
  ];

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const handleTriageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chiefComplaint.trim() && selectedSymptoms.length === 0) {
      showToast('Please describe your main health issue or select symptoms.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await publicHealthService.runTriage({
        chiefComplaint: chiefComplaint || selectedSymptoms.join(', '),
        symptoms: selectedSymptoms,
        vitals: systolicBP ? { bpSystolic: Number(systolicBP) } : {},
        mobilityStatus: mobility,
        distanceKm,
        hasCaregiver,
      });
      setTriageResult(res);
      showToast('Digital triage completed! Public health tier recommended.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to process digital triage', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-teal-700 via-cyan-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-200 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SIH 26133 • Government of Maharashtra Public Health Initiative</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Digital Triage & Public Health Facility Router
          </h1>
          <p className="text-teal-100/90 text-sm sm:text-base max-w-3xl leading-relaxed">
            Non-clinical & operational triage determining clinical urgency, mobility hurdles, and travel barriers to route you to the correct level of public care: <strong>Sub-Centre</strong>, <strong>PHC</strong>, <strong>Rural Hospital</strong>, or <strong>District Hospital</strong>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Triage Assessment Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Describe Symptoms & Health Concern
              </h2>
              <p className="text-xs text-slate-500">
                Answer a few questions to get routed to the right public healthcare facility.
              </p>
            </div>
          </div>

          <form onSubmit={handleTriageSubmit} className="space-y-6">
            {/* Chief Complaint */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Chief Complaint / Main Problem <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="e.g., Severe headache and high blood pressure for 3 days, feeling weak to travel by bus..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              />
            </div>

            {/* Quick Symptom Selectors */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Common Symptoms (Click all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_SYMPTOMS.map((sym) => {
                  const isSelected = selectedSymptoms.includes(sym);
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => toggleSymptom(sym)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-teal-600 border-teal-600 text-white shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-300'
                      }`}
                    >
                      {sym}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Operational & Non-Clinical Determinants */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Systolic Blood Pressure (Optional)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 165 mmHg"
                  value={systolicBP}
                  onChange={(e) => setSystolicBP(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Mobility / Physical Status
                </label>
                <select
                  value={mobility}
                  onChange={(e) => setMobility(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                >
                  <option value="Walkable">Independent / Walkable</option>
                  <option value="Assisted Walk">Needs Stick or Support</option>
                  <option value="Wheelchair">Wheelchair Needed</option>
                  <option value="Bedridden">Bedridden / Stretcher</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Approx. Distance to Tehsil/City (km)
                </label>
                <input
                  type="number"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Caregiver Accompanying?
                </label>
                <div className="flex gap-4 mt-2">
                  <label className="inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="caregiver"
                      checked={hasCaregiver === true}
                      onChange={() => setHasCaregiver(true)}
                      className="text-teal-600"
                    />
                    <span>Yes, Family Available</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="caregiver"
                      checked={hasCaregiver === false}
                      onChange={() => setHasCaregiver(false)}
                      className="text-teal-600"
                    />
                    <span>No / Traveling Alone</span>
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Activity className="w-4 h-4" />
              <span>{isSubmitting ? 'Evaluating Clinical & Travel Acuity...' : 'Run Digital Triage & Get Facility Recommendation'}</span>
            </button>
          </form>
        </div>

        {/* Results & Recommendation Card */}
        <div className="lg:col-span-5 space-y-6">
          {triageResult ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-teal-500/40 p-6 shadow-lg space-y-6 animate-scale-up">
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Triage Recommendation
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 ${
                    triageResult.acuityLevel === 'Emergency'
                      ? 'bg-rose-100 text-rose-700 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-300'
                      : triageResult.acuityLevel === 'Urgent'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'bg-teal-100 text-teal-800 border border-teal-300 dark:bg-teal-950/60 dark:text-teal-300'
                  }`}
                >
                  {triageResult.acuityLevel === 'Emergency' ? (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  {triageResult.acuityLevel} Level
                </span>
              </div>

              {/* Recommended Facility Tier */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-slate-800 dark:to-slate-800/60 border border-teal-200 dark:border-slate-700">
                <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wider">
                  Recommended Public Health Tier
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {triageResult.recommendedTier}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {triageResult.triageNotes}
                </p>
              </div>

              {/* Recommended Facility Info */}
              {triageResult.recommendedFacility && (
                <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {triageResult.recommendedFacility.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {triageResult.recommendedFacility.city || 'Satara, Maharashtra'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="text-slate-400 block">Available Beds</span>
                      <span className="font-bold text-emerald-600">
                        {triageResult.recommendedFacility.available_beds} Beds
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Average Wait</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> ~20 mins
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Operational Barriers Flagged */}
              {triageResult.operationalBarriers.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5 mb-2">
                    <ShieldAlert className="w-4 h-4" /> Operational Barriers Detected
                  </h4>
                  <ul className="space-y-1.5">
                    {triageResult.operationalBarriers.map((bar, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2 bg-amber-50/60 dark:bg-amber-950/20 p-2 rounded-lg border border-amber-200/60 dark:border-amber-900/40"
                      >
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{bar}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <Link
                  to={`/patient/hospitals/${triageResult.recommendedFacility?.id || 'hosp-mh-rh-03'}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow flex items-center justify-center gap-2 transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book OPD Token at {triageResult.recommendedTier}</span>
                </Link>

                <Link
                  to="/patient/referrals"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>Generate Electronic Referral Slip</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 mx-auto flex items-center justify-center">
                <Activity className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  How Digital Triage Works
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                  Instead of traveling 60km directly to a crowded District Civil Hospital, our system evaluates if your treatment can be completed earlier with zero wait time at your local <strong>Sub-Centre (AAM)</strong>, <strong>Primary Health Centre (PHC)</strong>, or <strong>Rural Hospital (RH)</strong>.
                </p>
              </div>

              <div className="space-y-2 text-left text-xs text-slate-600 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Level 1: Sub-Centre (Primary Wellness & Refills)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  <span>Level 2: PHC (MBBS Doctor, Delivery, Basic Labs)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Level 3: Rural Hospital (X-Ray, USG, Minor Surgery)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Level 4: District Hospital (ICU, CT Scan, Super-Specialist)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
