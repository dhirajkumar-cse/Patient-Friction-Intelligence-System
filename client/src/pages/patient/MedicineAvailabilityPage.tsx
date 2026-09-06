import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { publicHealthService, EssentialMedicine } from '../../services/publicHealthService';
import { useToast } from '../../context/ToastContext';
import {
  Pill,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building2,
  Package,
  Calendar,
  Sparkles,
  MapPin,
  ArrowRight,
} from 'lucide-react';

export const MedicineAvailabilityPage: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [medicines, setMedicines] = useState<EssentialMedicine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  const fetchMedicines = async () => {
    try {
      setIsLoading(true);
      const data = await publicHealthService.getMedicines();
      setMedicines(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch medicine inventory', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const categories = [
    'All',
    'Analgesic',
    'Antibiotic',
    'Anti-Hypertensive',
    'Anti-Diabetic',
    'Maternal Health',
    'Emergency / Antidote',
    'Vaccine',
  ];

  const filteredMedicines = medicines.filter((m) => {
    const matchSearch =
      m.medicine_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.generic_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.facility_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === 'All' || m.category === selectedCategory;
    const matchStatus = selectedStatus === 'All' || m.status === selectedStatus;
    return matchSearch && matchCategory && matchStatus;
  });

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SIH 26133 • e-Aushadhi Real-Time Essential Drug List (EDL) Inventory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Essential Medicine Availability & Stock Tracker
          </h1>
          <p className="text-emerald-100/90 text-sm max-w-2xl leading-relaxed">
            Transparent public health drug visibility across Maharashtra. Check live stock of life-saving medicines (e.g. Anti-Snake Venom, Insulin, IFA, Anti-hypertensives) at your local <strong>PHC</strong> or <strong>Rural Hospital</strong> before traveling.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search medicine or generic name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            {['All', 'In Stock', 'Low Stock'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  selectedStatus === st
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Medicines Table / Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            <span>Essential Medicines Directory ({filteredMedicines.length} Listed Items)</span>
          </h3>
          <span className="text-xs text-slate-400">Directly Synced with State Drug Warehouses</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading medicine stock ledger...</div>
        ) : filteredMedicines.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No medicines found matching filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Medicine & Formulation</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Dispensing Facility</th>
                  <th className="py-3 px-4">Stock Count</th>
                  <th className="py-3 px-4">Availability</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredMedicines.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {m.medicine_name}
                      </div>
                      <span className="text-slate-500 text-[11px] block mt-0.5">
                        {m.generic_name} • {m.dosage_form}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        {m.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {m.facility_name}
                      </div>
                      <span className="text-teal-600 text-[11px] font-semibold">
                        {m.facility_tier}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                        {m.stock_count} units
                      </div>
                      <span className="text-slate-400 text-[10px]">Min. Threshold: {m.min_threshold}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] ${
                          m.status === 'In Stock'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : m.status === 'Low Stock'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {m.status === 'In Stock' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        {m.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {m.status === 'Low Stock' || m.status === 'Out of Stock' ? (
                        <button
                          onClick={() => showToast(`Alternate stock located at District Civil Hospital Satara (Available: 450 units)`, 'info')}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300/40 text-[11px] font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
                        >
                          <MapPin className="w-3 h-3" />
                          <span>Find Alternate Stock</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Direct Walk-in / OPD</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
