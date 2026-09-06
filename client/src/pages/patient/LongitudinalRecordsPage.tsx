import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { publicHealthService, HealthRecord } from '../../services/publicHealthService';
import { useToast } from '../../context/ToastContext';
import {
  FileText,
  CreditCard,
  QrCode,
  Download,
  Calendar,
  Building2,
  User,
  Activity,
  Pill,
  Sparkles,
  CheckCircle2,
  Plus,
  Share2,
} from 'lucide-react';

export const LongitudinalRecordsPage: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [abhaId, setAbhaId] = useState('91-4582-7391-2041@abdm');
  const [isLoading, setIsLoading] = useState(true);
  const [isNewRecordModalOpen, setIsNewRecordModalOpen] = useState(false);

  // Form State for new clinical entry
  const [facilityName, setFacilityName] = useState('Primary Health Centre (PHC) Mahabaleshwar');
  const [doctorName, setDoctorName] = useState('Dr. Anand Shinde, MBBS');
  const [recordType, setRecordType] = useState('OPD Consultation');
  const [diagnosis, setDiagnosis] = useState('');
  const [bp, setBp] = useState('130/85 mmHg');
  const [pulse, setPulse] = useState('78 bpm');
  const [notes, setNotes] = useState('');

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      const data = await publicHealthService.getHealthRecords();
      setAbhaId(data.abhaId || '91-4582-7391-2041@abdm');
      setRecords(data.records || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch health records', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosis) {
      showToast('Please enter a clinical diagnosis or visit summary', 'error');
      return;
    }

    try {
      await publicHealthService.createHealthRecord({
        facility_name: facilityName,
        doctor_name: doctorName,
        record_type: recordType,
        record_date: new Date().toISOString().split('T')[0],
        diagnosis,
        vitals: { bp, pulse },
        notes,
      });
      showToast('Longitudinal record appended with ABDM cryptographic hash!', 'success');
      setIsNewRecordModalOpen(false);
      fetchRecords();
    } catch (err: any) {
      showToast(err.message || 'Failed to save health record', 'error');
    }
  };

  const handleDownloadFHIR = () => {
    const fhirBundle = {
      resourceType: 'Bundle',
      id: `bundle-${Date.now()}`,
      type: 'document',
      timestamp: new Date().toISOString(),
      identifier: { system: 'https://healthid.ndhm.gov.in', value: abhaId },
      entry: records.map((r) => ({
        resource: {
          resourceType: 'Composition',
          title: r.record_type,
          date: r.record_date,
          author: [{ display: r.doctor_name }],
          custodian: { display: r.facility_name },
          section: [
            { title: 'Diagnosis', text: { status: 'generated', div: r.diagnosis } },
            { title: 'Notes', text: { status: 'generated', div: r.notes || '' } },
          ],
        },
      })),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fhirBundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ABHA_FHIR_Longitudinal_Record_${abhaId.replace(/[^a-zA-Z0-9]/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('ABDM-compliant FHIR R4 JSON Bundle exported!', 'success');
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-800 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SIH 26133 • Interoperable Longitudinal Health Records & ABHA</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Longitudinal Patient Records & ABHA Timeline
            </h1>
            <p className="text-blue-100/90 text-sm max-w-2xl leading-relaxed">
              Consolidated health timeline connecting your consultations across <strong>Sub-Centres</strong>, <strong>PHCs</strong>, and <strong>District Hospitals</strong>. No lost paperwork, instant QR scan-in, and interoperable FHIR standards.
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleDownloadFHIR}
              className="px-4 py-2.5 rounded-xl bg-blue-500/30 hover:bg-blue-500/40 border border-blue-400/40 text-white font-bold text-xs shadow flex items-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export FHIR JSON</span>
            </button>
            <button
              onClick={() => setIsNewRecordModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs shadow flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Visit Entry</span>
            </button>
          </div>
        </div>
      </div>

      {/* ABHA Digital Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-indigo-800/60 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-3 z-10">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-widest">
            <CreditCard className="w-4 h-4" />
            <span>Ayushman Bharat Health Account (ABDM Verified)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-mono font-black tracking-wider text-indigo-100">
            {abhaId}
          </h2>
          <div className="flex flex-wrap items-center gap-4 text-xs text-indigo-200">
            <span>Name: <strong>Sunita Devi</strong></span>
            <span>DOB: <strong>1966 (Age 60)</strong></span>
            <span>Gender: <strong>Female</strong></span>
            <span>State: <strong>Maharashtra</strong></span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl shadow-lg shrink-0 flex flex-col items-center gap-1.5 z-10 text-slate-900">
          <QrCode className="w-24 h-24 text-slate-800" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Scan at OPD Counter</span>
        </div>
      </div>

      {/* Longitudinal Timeline */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <span>Chronological Care History ({records.length} Recorded Encounters)</span>
          </h3>
          <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Synchronized Across Maharashtra Health Grid
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading longitudinal timeline...</div>
        ) : records.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No clinical records found.</div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2 sm:before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-indigo-200 dark:before:bg-indigo-900">
            {records.map((rec, idx) => {
              const vitals = rec.vitals_json ? JSON.parse(rec.vitals_json) : null;
              const prescription = rec.prescription_json ? JSON.parse(rec.prescription_json) : null;

              return (
                <div key={rec.id || idx} className="relative group">
                  {/* Timeline Node Dot */}
                  <div className="absolute -left-6 sm:-left-8 top-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-indigo-600 ring-4 ring-indigo-100 dark:ring-indigo-950 flex items-center justify-center text-white text-[10px]" />

                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-indigo-300 transition-all space-y-4">
                    {/* Entry Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 uppercase">
                            {rec.record_type}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {rec.record_date}
                          </span>
                        </div>
                        <h4 className="font-bold text-base text-slate-900 dark:text-white mt-1">
                          {rec.diagnosis}
                        </h4>
                      </div>

                      <div className="text-xs text-slate-500 sm:text-right">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                          {rec.doctor_name}
                        </span>
                        <span className="flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-indigo-500" /> {rec.facility_name}
                        </span>
                      </div>
                    </div>

                    {/* Vitals Pill Display */}
                    {vitals && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {Object.entries(vitals).map(([k, v]) => (
                          <span
                            key={k}
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                          >
                            <Activity className="w-3 h-3 text-indigo-600" />
                            <span className="uppercase text-slate-400 font-bold">{k}:</span>
                            <strong className="text-slate-900 dark:text-white">{String(v)}</strong>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Prescription Table */}
                    {prescription && Array.isArray(prescription) && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                        <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                          <Pill className="w-3.5 h-3.5 text-indigo-600" /> Prescribed Medications (e-Prescription)
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {prescription.map((m: any, pIdx: number) => (
                            <div
                              key={pIdx}
                              className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                            >
                              <strong className="text-slate-900 dark:text-white block">{m.name}</strong>
                              <span className="text-slate-500 text-[11px]">{m.dosage} • {m.duration}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Clinical Notes */}
                    {rec.notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 bg-indigo-50/40 dark:bg-indigo-950/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                        <strong>Doctor's Advice:</strong> {rec.notes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Add New Visit Entry */}
      {isNewRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Add Health Record Entry
              </h3>
              <button
                onClick={() => setIsNewRecordModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Health Facility
                </label>
                <input
                  type="text"
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Doctor Name
                  </label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Record Type
                  </label>
                  <select
                    value={recordType}
                    onChange={(e) => setRecordType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  >
                    <option value="OPD Consultation">OPD Consultation</option>
                    <option value="Diagnostic Report">Diagnostic Report</option>
                    <option value="Prescription Refill">Prescription Refill</option>
                    <option value="Immunization Record">Immunization Record</option>
                    <option value="Referral Slip">Referral Slip</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Clinical Diagnosis / Summary <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mild respiratory tract infection, vitals stable"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Blood Pressure
                  </label>
                  <input
                    type="text"
                    value={bp}
                    onChange={(e) => setBp(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Pulse Rate
                  </label>
                  <input
                    type="text"
                    value={pulse}
                    onChange={(e) => setPulse(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Doctor Notes & Advice
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewRecordModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition-all"
                >
                  Save to ABHA Timeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
