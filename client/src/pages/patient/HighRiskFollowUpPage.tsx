import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { publicHealthService, HighRiskPatient } from '../../services/publicHealthService';
import { useToast } from '../../context/ToastContext';
import {
  HeartPulse,
  Baby,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  User,
  Plus,
  Filter,
  Sparkles,
  Phone,
  ShieldAlert,
} from 'lucide-react';

export const HighRiskFollowUpPage: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [patients, setPatients] = useState<HighRiskPatient[]>([]);
  const [selectedCohort, setSelectedCohort] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [patientName, setPatientName] = useState('');
  const [cohortType, setCohortType] = useState('Maternal (HRP)');
  const [riskLevel, setRiskLevel] = useState('High Risk');
  const [primaryCondition, setPrimaryCondition] = useState('');
  const [currentMilestone, setCurrentMilestone] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');
  const [assignedAsha, setAssignedAsha] = useState('ASHA Tai Sunanda Kadam');
  const [notes, setNotes] = useState('');

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      const data = await publicHealthService.getHighRiskRegistry(selectedCohort);
      setPatients(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch high-risk registry', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [selectedCohort]);

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await publicHealthService.createHighRiskEntry({
        patient_name: patientName,
        cohort_type: cohortType,
        risk_level: riskLevel,
        primary_condition: primaryCondition,
        current_milestone: currentMilestone,
        next_due_date: nextDueDate,
        assigned_asha_name: assignedAsha,
        follow_up_notes: notes,
      });
      showToast('High-risk cohort entry added with automated ASHA alert!', 'success');
      setIsModalOpen(false);
      fetchPatients();
    } catch (err: any) {
      showToast(err.message || 'Failed to add high-risk entry', 'error');
    }
  };

  const handleMarkCompleted = async (id: string) => {
    try {
      await publicHealthService.updateHighRiskStatus(
        id,
        'Completed',
        'Milestone verified and recorded by Community Health Officer.'
      );
      showToast('Follow-up milestone marked completed!', 'success');
      fetchPatients();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const cohorts = ['All', 'Maternal (HRP)', 'Child (Immunization)', 'Chronic NCD', 'Tuberculosis'];

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-800 via-red-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-200 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SIH 26133 • High-Risk Patient Tracking & Follow-up</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              High-Risk Care & Doorstep Follow-Up Cohorts
            </h1>
            <p className="text-rose-100/90 text-sm max-w-2xl leading-relaxed">
              Zero dropouts for vulnerable lives. Automated tracking for <strong>High-Risk Pregnancies (ANC)</strong>, <strong>Child Immunization Schedules</strong>, and <strong>Chronic Diseases (Hypertension, Diabetes, TB)</strong> with ASHA home visits.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="self-start sm:self-auto px-5 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register High-Risk Case</span>
          </button>
        </div>
      </div>

      {/* Cohort Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {cohorts.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCohort(c)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCohort === c
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Cohort Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-slate-400 text-sm">
            Loading high-risk registry...
          </div>
        ) : patients.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 text-sm">
            No high-risk patients found in this cohort.
          </div>
        ) : (
          patients.map((p) => {
            const isOverdue = p.status === 'Overdue';
            return (
              <div
                key={p.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-6 shadow-xs flex flex-col justify-between space-y-4 transition-all ${
                  isOverdue
                    ? 'border-rose-400 dark:border-rose-800/80 bg-rose-50/20 dark:bg-rose-950/10'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {p.cohort_type}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                        isOverdue
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {isOverdue && <AlertTriangle className="w-3 h-3" />}
                      {p.status}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                    {p.patient_name}
                  </h3>

                  <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-1">
                    {p.primary_condition}
                  </p>

                  <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Target Milestone / Scheduled Intervention
                    </span>
                    <strong className="text-slate-900 dark:text-white block">
                      {p.current_milestone}
                    </strong>
                    <span className="text-slate-500 text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> Due: <strong className="text-slate-700 dark:text-slate-300">{p.next_due_date}</strong>
                    </span>
                  </div>

                  {p.follow_up_notes && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 italic">
                      "{p.follow_up_notes}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-rose-600" /> Assigned: <strong>{p.assigned_asha_name || 'ASHA Tai'}</strong>
                  </span>

                  {p.status !== 'Completed' && (
                    <button
                      onClick={() => handleMarkCompleted(p.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Log Doorstep Check</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Register High-Risk Case */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Register High-Risk Patient
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEntry} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Beneficiary Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Radhika Jadhav (W/O Santosh)"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Cohort Type
                  </label>
                  <select
                    value={cohortType}
                    onChange={(e) => setCohortType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  >
                    <option value="Maternal (HRP)">Maternal (HRP - High Risk)</option>
                    <option value="Child (Immunization)">Child (National Immunization)</option>
                    <option value="Chronic NCD (Hypertension)">Chronic NCD (Hypertension)</option>
                    <option value="Chronic NCD (Diabetes)">Chronic NCD (Diabetes)</option>
                    <option value="Tuberculosis (DOTS)">Tuberculosis (DOTS)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Risk Severity
                  </label>
                  <select
                    value={riskLevel}
                    onChange={(e) => setRiskLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  >
                    <option value="High Risk">High Risk</option>
                    <option value="Critical">Critical</option>
                    <option value="Moderate Risk">Moderate Risk</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Primary High-Risk Condition
                </label>
                <input
                  type="text"
                  placeholder="e.g. Severe Gestational Anemia (Hb 7.5) with Twin Gestation"
                  value={primaryCondition}
                  onChange={(e) => setPrimaryCondition(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Target Milestone
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 3rd ANC + USG Doppler"
                    value={currentMilestone}
                    onChange={(e) => setCurrentMilestone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Due Date / Schedule
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tomorrow, 10:00 AM"
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Assigned ASHA / Frontline Worker
                </label>
                <input
                  type="text"
                  value={assignedAsha}
                  onChange={(e) => setAssignedAsha(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Clinical & Travel Barrier Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Remote tribal hamlet; free 102 ambulance required on delivery date."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow transition-all cursor-pointer"
                >
                  Add to High-Risk Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
