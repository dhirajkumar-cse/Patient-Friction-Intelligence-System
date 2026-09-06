import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { publicHealthService, FrontlineTask } from '../../services/publicHealthService';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Phone,
  Plus,
  Wifi,
  WifiOff,
  Video,
  Activity,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const FrontlineWorkerPortal: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [tasks, setTasks] = useState<FrontlineTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(!navigator.onLine);

  // Form State
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [phone, setPhone] = useState('');
  const [villageName, setVillageName] = useState('Medha Valley, Satara');
  const [taskType, setTaskType] = useState('Doorstep Triage & BP Check');
  const [dueDate, setDueDate] = useState('Today, 03:00 PM');
  const [notes, setNotes] = useState('');

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const data = await publicHealthService.getFrontlineTasks();
      setTasks(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load ASHA tasks', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();

    const handleOnline = () => setIsOfflineMode(false);
    const handleOffline = () => setIsOfflineMode(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await publicHealthService.createFrontlineTask({
        worker_id: 'asha-worker-01',
        worker_name: 'Sunanda Kadam (ASHA Worker)',
        worker_role: 'ASHA',
        village_name: villageName,
        beneficiary_name: beneficiaryName,
        beneficiary_phone: phone,
        task_type: taskType,
        due_date: dueDate,
        notes,
      });
      showToast('Village beneficiary task logged and scheduled!', 'success');
      setIsNewTaskModalOpen(false);
      fetchTasks();
    } catch (err: any) {
      showToast(err.message || 'Failed to create task', 'error');
    }
  };

  const handleCompleteTask = async (id: string) => {
    try {
      await publicHealthService.updateFrontlineTaskStatus(
        id,
        'Completed',
        'Doorstep check completed. Vitals verified and synced to Ayushman Arogya Mandir.'
      );
      showToast('Doorstep task marked completed!', 'success');
      fetchTasks();
    } catch (err: any) {
      showToast(err.message || 'Failed to complete task', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-emerald-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SIH 26133 • Frontline Health Worker Seva (ASHA / ANM / CHO)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Frontline Worker Desk & Doorstep Operations
            </h1>
            <p className="text-emerald-100/90 text-sm max-w-2xl leading-relaxed">
              Empowering <strong>ASHA</strong>, <strong>ANM</strong>, and <strong>Community Health Officers (CHOs)</strong> with offline-first doorstep triage, maternal ANC checklists, child immunization due lists, and assisted teleconsultations.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border ${
                isOfflineMode
                  ? 'bg-amber-500/20 border-amber-400/40 text-amber-200'
                  : 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200'
              }`}
            >
              {isOfflineMode ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
              <span>{isOfflineMode ? 'Low Connectivity Mode (Local Storage Cached)' : 'Online Synchronized'}</span>
            </div>

            <button
              onClick={() => setIsNewTaskModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Household Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Cards for Frontline Worker */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/patient/triage"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-teal-400 transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Doorstep Digital Triage
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Screen villager symptoms & route to Sub-Centre or PHC
            </p>
          </div>
        </Link>

        <Link
          to="/patient/teleconsult"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Assisted Tele-eSanjeevani
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Connect elderly/illiterate patient to District Doctor
            </p>
          </div>
        </Link>

        <Link
          to="/patient/high-risk"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-rose-400 transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Maternal & NCD Registry
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Track 100% ANC visits and hypertension compliance
            </p>
          </div>
        </Link>
      </div>

      {/* Today's Route & Household Task List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <span>Today's Village Household Visits ({tasks.length} Assigned)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ASHA Field Area: Medha Valley, Satara District • Ayushman Arogya Mandir
            </p>
          </div>

          <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            Offline Auto-Sync Enabled
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading field tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No frontline tasks scheduled for today.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((t) => {
              const isCompleted = t.status === 'Completed';
              return (
                <div
                  key={t.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                    isCompleted
                      ? 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-75'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300 shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {t.task_type}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {t.beneficiary_name}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {t.village_name}
                      </span>
                      {t.beneficiary_phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" /> {t.beneficiary_phone}
                        </span>
                      )}
                    </div>

                    {t.notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 mt-2">
                        {t.notes}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Due: <strong className="text-slate-700 dark:text-slate-300">{t.due_date}</strong>
                    </span>

                    {!isCompleted && (
                      <button
                        onClick={() => handleCompleteTask(t.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Complete Visit</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Log Household Task */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Schedule Doorstep ASHA Visit
              </h3>
              <button
                onClick={() => setIsNewTaskModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Beneficiary Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tukaram Jagtap"
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  placeholder="e.g. 98221-44556"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Task Category
                </label>
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                >
                  <option value="Doorstep Triage & BP Check">Doorstep Triage & BP Check</option>
                  <option value="ANC Home Visit (High-Risk Anemia)">ANC Home Visit (High-Risk Anemia)</option>
                  <option value="Child Immunization Due Reminder">Child Immunization Due Reminder</option>
                  <option value="TB Medicine Dispense (DOTS)">TB Medicine Dispense (DOTS)</option>
                  <option value="Assisted Teleconsultation Setup">Assisted Teleconsultation Setup</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Due Time
                </label>
                <input
                  type="text"
                  placeholder="e.g. Today, 04:30 PM"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Visit Notes & Instructions
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Bring digital glucometer and check fasting sugar levels."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition-all cursor-pointer"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
