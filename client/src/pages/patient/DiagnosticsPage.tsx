import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { publicHealthService, DiagnosticTest, DiagnosticBooking } from '../../services/publicHealthService';
import { useToast } from '../../context/ToastContext';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building2,
  Calendar,
  FileCheck,
  Search,
  Filter,
  Sparkles,
} from 'lucide-react';

export const DiagnosticsPage: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [tests, setTests] = useState<DiagnosticTest[]>([]);
  const [bookings, setBookings] = useState<DiagnosticBooking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Booking Modal
  const [selectedTest, setSelectedTest] = useState<DiagnosticTest | null>(null);
  const [patientName, setPatientName] = useState('Sunita Devi');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [testsData, bookingsData] = await Promise.all([
        publicHealthService.getDiagnostics(),
        publicHealthService.getDiagnosticBookings(),
      ]);
      setTests(testsData);
      setBookings(bookingsData);
    } catch (err: any) {
      showToast(err.message || 'Failed to load diagnostics', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBookTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTest) return;

    try {
      const newBooking = await publicHealthService.bookDiagnostic({
        diagnosticId: selectedTest.id,
        testName: selectedTest.test_name,
        facilityName: selectedTest.facility_name,
        scheduledDate,
        patientName,
      });
      showToast(`Diagnostic slot booked! Booking #${newBooking.booking_number}`, 'success');
      setSelectedTest(null);
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to book diagnostic test', 'error');
    }
  };

  const categories = ['All', 'Pathology', 'Radiology', 'Cardiology', 'Microbiology'];

  const filteredTests = tests.filter((t) => {
    const matchSearch =
      t.test_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.facility_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === 'All' || t.category === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-800 via-purple-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-200 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SIH 26133 • Diagnostic Coordination & Real-Time Equipment Uptime</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Diagnostic Network & Equipment Availability
          </h1>
          <p className="text-violet-100/90 text-sm max-w-2xl leading-relaxed">
            Eliminating irregular diagnostics and broken trips. Verify working status of <strong>X-Ray</strong>, <strong>Ultrasound</strong>, <strong>CBNAAT TB</strong>, and <strong>Automated Blood Analyzers</strong> across nearby PHCs and District Hospitals.
          </p>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search test name or facility..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Diagnostic Directory */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-slate-400 text-sm">
            Loading diagnostic equipment roster...
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 text-sm">
            No diagnostic tests matching your search criteria.
          </div>
        ) : (
          filteredTests.map((t) => (
            <div
              key={t.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md hover:border-violet-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300">
                    {t.category}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      t.is_equipment_functional
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {t.is_equipment_functional ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <AlertTriangle className="w-3 h-3" />
                    )}
                    {t.is_equipment_functional ? 'Machine Functional' : 'Under Maintenance'}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                  {t.test_name}
                </h3>

                <div className="mt-3 space-y-1 text-xs text-slate-500">
                  <p className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                    <Building2 className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                    <span className="truncate">{t.facility_name}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{t.operational_hours}</span>
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Fee (Govt.)</span>
                  <strong className="text-sm text-emerald-600 font-extrabold">
                    {t.fee === 0 ? 'FREE' : `₹${t.fee}`}
                  </strong>
                </div>

                <button
                  onClick={() => setSelectedTest(t)}
                  disabled={!t.is_equipment_functional}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Book Slot
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Booked Diagnostic Tests Status */}
      {bookings.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-violet-600" />
            <span>My Booked Diagnostic Tests & Sample Pipeline</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-violet-700 dark:text-violet-400">{b.booking_number}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                    {b.sample_status}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{b.test_name}</h4>
                <p className="text-slate-500">{b.facility_name}</p>
                <p className="text-slate-400 text-[11px] pt-1">Date: {b.scheduled_date}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {selectedTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Book Diagnostic Test Slot
              </h3>
              <button
                onClick={() => setSelectedTest(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900 text-xs space-y-1">
              <p className="font-bold text-slate-900 dark:text-white">{selectedTest.test_name}</p>
              <p className="text-slate-500">{selectedTest.facility_name}</p>
              <p className="text-emerald-600 font-semibold">Government Fee: {selectedTest.fee === 0 ? 'FREE' : `₹${selectedTest.fee}`}</p>
            </div>

            <form onSubmit={handleBookTest} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Beneficiary Name
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Preferred Appointment Date
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedTest(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow transition-all cursor-pointer"
                >
                  Confirm Diagnostic Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
