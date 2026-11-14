import React, { useEffect, useState } from 'react';
import {
  Activity,
  BookOpen,
  BrainCircuit,
  Database,
  FileUp,
  Flame,
  FlaskConical,
  GitCompare,
  Menu,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  INITIAL_EXPERIMENT_RECORDS,
  INITIAL_PROVENANCE_EVENTS,
  INITIAL_SOURCE_DOCUMENTS,
} from './data/nasaCatalog.ts';
import type {
  ExperimentRecord,
  ImportJob,
  ProvenanceEvent,
  SourceDocument,
  VerificationStatus,
} from './types/scientific.ts';
import { MissionOverview, NavSection } from './components/MissionOverview.tsx';
import { EvidenceExplorer } from './components/EvidenceExplorer.tsx';
import { DataImport } from './components/DataImport.tsx';
import { ExperimentComparator } from './components/ExperimentComparator.tsx';
import { SpeculatronIntelligence } from './components/SpeculatronIntelligence.tsx';
import { DiwaProvenance } from './components/DiwaProvenance.tsx';
import { DigitalTwin } from './components/DigitalTwin.tsx';
import { AboutAndExport } from './components/AboutAndExport.tsx';

const STORAGE_KEY = 'aegis_mug_session_v1';

interface PersistedSession {
  userRecords: ExperimentRecord[];
  statusOverrides: Record<
    string,
    {
      verificationStatus: VerificationStatus;
      notes: string;
      citationLocator: string | null;
    }
  >;
  events: ProvenanceEvent[];
  importJobs: ImportJob[];
}

function loadPersistedSession(): PersistedSession {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        userRecords: [],
        statusOverrides: {},
        events: INITIAL_PROVENANCE_EVENTS,
        importJobs: [],
      };
    }
    const parsed = JSON.parse(raw) as Partial<PersistedSession>;
    return {
      userRecords: Array.isArray(parsed.userRecords) ? parsed.userRecords : [],
      statusOverrides: parsed.statusOverrides ?? {},
      events:
        Array.isArray(parsed.events) && parsed.events.length > 0
          ? parsed.events
          : INITIAL_PROVENANCE_EVENTS,
      importJobs: Array.isArray(parsed.importJobs) ? parsed.importJobs : [],
    };
  } catch {
    return {
      userRecords: [],
      statusOverrides: {},
      events: INITIAL_PROVENANCE_EVENTS,
      importJobs: [],
    };
  }
}

const NAV_ITEMS: Array<{ id: NavSection; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'overview', label: 'Mission Overview', icon: Activity },
  { id: 'explorer', label: 'Evidence Explorer', icon: Database },
  { id: 'import', label: 'Data Import', icon: FileUp },
  { id: 'comparator', label: 'Comparator', icon: GitCompare },
  { id: 'intelligence', label: 'SPECULATRON AI', icon: BrainCircuit },
  { id: 'digital-twin', label: 'Digital Twin Sandbox', icon: FlaskConical },
  { id: 'provenance', label: 'DIWA Provenance', icon: ShieldCheck },
  { id: 'about', label: 'About & Export', icon: BookOpen },
];

export default function App() {
  const [activeSection, setActiveSection] = useState<NavSection>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sources, setSources] = useState<SourceDocument[]>(INITIAL_SOURCE_DOCUMENTS);
  const [baseRecords, setBaseRecords] = useState<ExperimentRecord[]>(INITIAL_EXPERIMENT_RECORDS);
  const [session, setSession] = useState<PersistedSession>(() => loadPersistedSession());
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([
    'EXP-BASS2-M1',
    'EXP-BASS2-M5',
  ]);
  const [geminiConfigured, setGeminiConfigured] = useState(false);

  // Sync with backend health & catalog on mount (non-blocking)
  useEffect(() => {
    let active = true;
    fetch('/api/health')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && data) {
          setGeminiConfigured(Boolean(data.geminiConfigured));
        }
      })
      .catch(() => {});

    fetch('/api/catalog')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && data) {
          if (Array.isArray(data.sources)) setSources(data.sources);
          if (Array.isArray(data.records)) setBaseRecords(data.records);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  // Persist session changes to browser storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Ignore storage quota errors
    }
  }, [session]);

  // Merge authoritative catalog records + user imported records + reviewer overrides
  const allRecords: ExperimentRecord[] = [...baseRecords, ...session.userRecords].map((rec) => {
    const override = session.statusOverrides[rec.experimentId];
    if (!override) return rec;
    return {
      ...rec,
      verificationStatus: override.verificationStatus,
      notes: override.notes,
      citationLocator: override.citationLocator ?? rec.citationLocator,
    };
  });

  const handleNavigate = (section: NavSection) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
  };

  const handleToggleCompare = (experimentId: string) => {
    setSelectedCompareIds((prev) => {
      if (prev.includes(experimentId)) {
        return prev.filter((id) => id !== experimentId);
      }
      if (prev.length >= 4) return prev;
      return [...prev, experimentId];
    });
  };

  const handleUpdateVerification = (
    experimentId: string,
    newStatus: VerificationStatus,
    notes: string,
    citationLocator: string | null
  ) => {
    const current = allRecords.find((r) => r.experimentId === experimentId);
    const event: ProvenanceEvent = {
      eventId: `EVT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'VERIFICATION_STATUS_CHANGED',
      recordId: experimentId,
      actor: 'Human Reviewer (Session)',
      details: `Updated verification status and rationale: ${notes}`,
      previousValue: current?.verificationStatus ?? null,
      newValue: newStatus,
      hashNote: citationLocator ? `Citation: ${citationLocator}` : null,
    };

    setSession((prev) => ({
      ...prev,
      statusOverrides: {
        ...prev.statusOverrides,
        [experimentId]: {
          verificationStatus: newStatus,
          notes,
          citationLocator,
        },
      },
      events: [...prev.events, event],
    }));
  };

  const handleCommitImport = (newRecords: ExperimentRecord[], job: ImportJob) => {
    const importEvent: ProvenanceEvent = {
      eventId: `EVT-IMP-${Date.now()}`,
      timestamp: job.importedAt,
      action: 'DATA_IMPORTED',
      recordId: job.jobId,
      actor: 'CSV/JSON Ingestion Validator',
      details: `Imported ${job.acceptedRows} validated record(s) from "${job.filename}" (${job.rejectedRows} rejected, ${job.duplicateRows} duplicates). Flagged SOURCE_LINK_ONLY pending review.`,
      previousValue: null,
      newValue: `${job.acceptedRows} record(s)`,
      hashNote: `File SHA-256: ${job.sha256Hex} (proves file consistency only, not scientific accuracy).`,
    };

    setSession((prev) => ({
      ...prev,
      userRecords: [...prev.userRecords, ...newRecords],
      importJobs: [...prev.importJobs, job],
      events: [...prev.events, importEvent],
    }));
  };

  const handleResetSessionImports = () => {
    const resetEvent: ProvenanceEvent = {
      eventId: `EVT-RST-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'DATA_MODIFIED',
      recordId: 'SESSION-IMPORTS',
      actor: 'User Session Control',
      details: 'Cleared user-imported session records while preserving authoritative NASA catalog.',
      previousValue: `${session.userRecords.length} user record(s)`,
      newValue: '0 user records',
      hashNote: null,
    };

    setSession((prev) => ({
      ...prev,
      userRecords: [],
      importJobs: [],
      events: [...prev.events, resetEvent],
    }));
    setSelectedCompareIds(['EXP-BASS-II-NTRS-2021', 'EXP-PSI-98-SAFFIRE-I']);
  };

  const handleLogUrlCheck = (url: string, details: string) => {
    const evt: ProvenanceEvent = {
      eventId: `EVT-URL-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'SOURCE_LINKED',
      recordId: url,
      actor: 'SSRF-Protected URL Verifier',
      details,
      previousValue: null,
      newValue: 'Checked against NASA domain allowlist',
      hashNote: null,
    };
    setSession((prev) => ({
      ...prev,
      events: [...prev.events, evt],
    }));
  };

  const handleExportLogged = (format: 'CSV' | 'JSON' | 'MARKDOWN') => {
    const evt: ProvenanceEvent = {
      eventId: `EVT-EXP-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'EXPORT_GENERATED',
      recordId: 'ACTIVE-DOSSIER',
      actor: 'Provenance Exporter',
      details: `Exported ${allRecords.length} record(s) with full provenance and original units in ${format} format.`,
      previousValue: null,
      newValue: format,
      hashNote: null,
    };
    setSession((prev) => ({
      ...prev,
      events: [...prev.events, evt],
    }));
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-slate-800 bg-[#0A101D]">
        <div className="px-5 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-amber-500/15 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="font-display text-base font-bold tracking-tight text-slate-50 whitespace-nowrap">
                AegisμG
              </div>
              <div className="text-[11px] font-mono text-teal-400 whitespace-nowrap">
                SPECULATRON AI
              </div>
            </div>
          </div>
        </div>

        <nav aria-label="Primary Sidebar Navigation" className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-teal-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
          <div className="font-mono text-slate-300">
            NASA Space Apps 2026
          </div>
          <div>Unofficial Research Prototype</div>
          <div className="font-mono tabular-nums text-slate-500">
            {allRecords.length} record(s) · {selectedCompareIds.length} in compare
          </div>
        </div>
      </aside>

      {/* Mobile Top Header (compact <= 15% viewport height) */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-800 bg-[#0A101D] px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <Flame className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-display text-base font-bold text-slate-50 whitespace-nowrap">
            AegisμG
          </span>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
          className="inline-flex items-center justify-center rounded border border-slate-700 bg-slate-900 p-2 text-slate-200 min-w-[44px] min-h-[44px] cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile Navigation"
          className="lg:hidden border-b border-slate-800 bg-[#0A101D] px-4 py-3 space-y-1"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium min-h-[44px] cursor-pointer ${
                  active
                    ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Main Content Workspace */}
      <main className="flex-1 lg:pl-64 min-w-0">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {activeSection === 'overview' && (
            <MissionOverview
              sources={sources}
              records={allRecords}
              provenanceEvents={session.events}
              importJobs={session.importJobs}
              onNavigate={handleNavigate}
            />
          )}

          {activeSection === 'explorer' && (
            <EvidenceExplorer
              records={allRecords}
              selectedCompareIds={selectedCompareIds}
              onToggleCompare={handleToggleCompare}
              onUpdateVerification={handleUpdateVerification}
            />
          )}

          {activeSection === 'import' && (
            <DataImport
              existingRecords={allRecords}
              onCommitImport={handleCommitImport}
              onResetSessionImports={handleResetSessionImports}
              userImportedCount={session.userRecords.length}
            />
          )}

          {activeSection === 'comparator' && (
            <ExperimentComparator
              records={allRecords}
              selectedIds={selectedCompareIds}
              onToggleSelect={handleToggleCompare}
              onClearSelection={() => setSelectedCompareIds([])}
            />
          )}

          {activeSection === 'intelligence' && (
            <SpeculatronIntelligence
              records={allRecords}
              geminiConfigured={geminiConfigured}
            />
          )}

          {activeSection === 'digital-twin' && (
            <DigitalTwin records={allRecords} />
          )}

          {activeSection === 'provenance' && (
            <DiwaProvenance
              sources={sources}
              records={allRecords}
              events={session.events}
              onLogUrlCheck={handleLogUrlCheck}
            />
          )}

          {activeSection === 'about' && (
            <AboutAndExport
              sources={sources}
              records={allRecords}
              events={session.events}
              importJobs={session.importJobs}
              onExportLogged={handleExportLogged}
            />
          )}
        </div>
      </main>
    </div>
  );
}
