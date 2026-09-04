import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Shield,
  Users,
  Building2,
  ListOrdered,
  Sparkles,
  TrendingUp,
  Cpu,
  Sliders,
  MapPin,
  GitFork,
  BarChart3,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await adminService.getDashboardStats();
        if (res.success) {
          setStats(res.stats);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  if (isLoading) {
    return <LoadingSkeleton rows={6} />;
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-tr from-slate-900 via-navy-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950 text-teal-300 text-xs font-bold border border-teal-800">
            <Shield className="w-3.5 h-3.5 text-teal-400" />
            <span>Population Health Intelligence & Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            PFIS Administrative Control Suite
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Monitor macro-level population friction indices, analyze care leakage milestones, and run
            budget-optimized What-If intervention models.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link to="/admin/simulator">
            <Button variant="primary" size="sm" icon={<Cpu className="w-4 h-4" />}>
              What-If Simulator
            </Button>
          </Link>
          <Link to="/admin/interventions">
            <Button
              variant="outline"
              size="sm"
              className="text-slate-900 bg-white hover:bg-slate-100"
              icon={<Sliders className="w-4 h-4" />}
            >
              Budget Optimizer
            </Button>
          </Link>
        </div>
      </div>

      {/* 6 Key Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Registered Patients"
          value={stats?.totalPatients || 0}
          subtitle="Monitored for accessibility barriers"
          icon={Users}
          badge="Active Registry"
          badgeType="info"
        />

        <StatCard
          title="Empaneled Hospitals"
          value={stats?.totalHospitals || 0}
          subtitle="Tertiary & secondary facilities"
          icon={Building2}
          badge="Connected"
          badgeType="info"
        />

        <StatCard
          title="Active Intake Requests"
          value={stats?.activeRequests || 0}
          subtitle={`${stats?.completedRequests || 0} requests completed`}
          icon={ListOrdered}
          badge="In Triage"
          badgeType="warning"
        />

        <StatCard
          title="Avg. Population Friction"
          value={`${stats?.averageFrictionScore || 58} / 100`}
          subtitle="Regional non-clinical friction index"
          icon={TrendingUp}
          badge="Moderate Barrier"
          badgeType="warning"
        />

        <StatCard
          title="High Accessibility Risk"
          value={stats?.highRiskCount || 0}
          subtitle="Patients facing critical travel/cost barriers"
          icon={AlertTriangle}
          iconColor="text-rose-600 bg-rose-50 border-rose-100"
          badge="Priority Support"
          badgeType="danger"
        />

        <StatCard
          title="Est. Care Completion Rate"
          value={`${stats?.estimatedCareCompletionRate || 55}%`}
          subtitle="Regional baseline before intervention"
          icon={Sparkles}
          badge="Current Baseline"
          badgeType="info"
        />
      </div>

      {/* Quick Navigation Cards into Intelligence Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/friction-map"
          className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card hover:shadow-card-hover hover:border-teal-300 transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 group-hover:text-teal-700 transition-colors flex items-center justify-between">
            Population Friction Map <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Geographic heatmap identifying high-friction clusters, travel deserts, and district barrier distributions.
          </p>
        </Link>

        <Link
          to="/admin/simulator"
          className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card hover:shadow-card-hover hover:border-teal-300 transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-700 transition-colors flex items-center justify-between">
            What-If Simulator <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Simulate completion gains from Community Shuttles, Satellite Diagnostics, and ASHA escorts in real-time.
          </p>
        </Link>

        <Link
          to="/admin/care-leakage"
          className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card hover:shadow-card-hover hover:border-teal-300 transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200">
            <GitFork className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 group-hover:text-rose-700 transition-colors flex items-center justify-between">
            Care Leakage Funnel <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600" />
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Analyze patient retention drop-off across 6 clinical stages to diagnose where the system fails.
          </p>
        </Link>
      </div>
    </div>
  );
};
