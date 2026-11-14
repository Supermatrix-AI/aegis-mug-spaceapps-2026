import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BrainCircuit,
  Compass,
  Download,
  ExternalLink,
  Loader2,
  Sparkles,
} from 'lucide-react';
import type { ApplicationContext, ExperimentRecord } from '../types/scientific.ts';
import {
  CONTEXT_LABELS,
  generateDeterministicSynthesis,
  rankExperimentsForContext,
  RELEVANCE_FORMULA_DESCRIPTION,
} from '../utils/scoring.ts';
import {
  BASS2_RESEARCH_INSIGHTS,
  buildScientificBriefings,
  computeBass2Summary,
  exportScientificBriefingMarkdown,
  MISSION_RESEARCH_BRIEFINGS,
} from '../utils/bass2Insights.ts';
import type { BriefingQuestionId } from '../utils/bass2Insights.ts';
import { OriginTag, VerificationTag } from './ScientificLabels.tsx';

interface SpeculatronIntelligenceProps {
  records: ExperimentRecord[];
  geminiConfigured: boolean;
}

interface AnalysisResponse {
  mode: 'AI_ASSISTED' | 'DETERMINISTIC_FALLBACK';
  label: string;
  model: string | null;
  aiNarrative: string | null;
  note: string;
}

export const SpeculatronIntelligence: React.FC<SpeculatronIntelligenceProps> = ({
  records,
  geminiConfigured,
}) => {
  const [context, setContext] = useState<ApplicationContext>('ISS_HABITAT');
  const [selectedBriefingId, setSelectedBriefingId] =
    useState<BriefingQuestionId>('Q1_AIRFLOW_TREND');
  const [customQuestion, setCustomQuestion] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const ranked = rankExperimentsForContext(records, context);
  const deterministic = generateDeterministicSynthesis(records, context);
  const bass2Summary = useMemo(() => computeBass2Summary(), []);
  const briefings = useMemo(() => buildScientificBriefings(records), [records]);
  const activeBriefing =
    briefings.find((b) => b.id === selectedBriefingId) ?? briefings[0];
  const activeMissionProfile =
    MISSION_RESEARCH_BRIEFINGS.find((m) => m.context === context) ??
    MISSION_RESEARCH_BRIEFINGS[0];

  const handleDownloadBriefing = () => {
    const md = exportScientificBriefingMarkdown(briefings, records);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aegis-mug-scientific-briefing-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const runServerAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const res = await fetch('/api/intelligence/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context,
          records: records.slice(0, 25),
          question: customQuestion.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAnalysisError(data.error ?? 'Failed to run intelligence synthesis.');
      } else {
        setAnalysisResult(data as AnalysisResponse);
      }
    } catch (err) {
      setAnalysisError(
        err instanceof Error
          ? `Server request failed (${err.message}); deterministic analysis remains active below.`
          : 'Server request failed.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">
            SPECULATRON Evidence Intelligence
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Deterministic research-relevance ranking, completeness auditing, and optional
            server-side Gemini grounded synthesis.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 shrink-0">
          <label htmlFor="app-context" className="text-xs text-slate-400 whitespace-nowrap">
            Target Habitat Context
          </label>
          <select
            id="app-context"
            value={context}
            onChange={(e) => {
              setContext(e.target.value as ApplicationContext);
              setAnalysisResult(null);
            }}
            className="rounded-md border border-slate-700 bg-[#0D1422] px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none focus:border-teal-500"
          >
            {(Object.keys(CONTEXT_LABELS) as ApplicationContext[]).map((k) => (
              <option key={k} value={k}>
                {CONTEXT_LABELS[k]}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* AEGIS SCIENTIFIC BRIEFING — Interactive 3-Question Judging & Research Mode */}
      <section
        aria-label="AEGIS Scientific Briefing"
        className="rounded-lg border border-teal-500/40 bg-[#0D1422] p-5 space-y-4"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <div className="text-xs font-mono text-teal-400">
              AEGIS SCIENTIFIC BRIEFING · TRACEABLE SOURCE-TO-CLAIM PATHS
            </div>
            <h2 className="text-lg font-semibold text-slate-50 mt-0.5">
              Featured Research Questions &amp; Discovery Evidence
            </h2>
            <p className="text-xs text-slate-400">
              Click any core research question to inspect NASA observations, exceptions, missing evidence,
              and source-to-recommendation lineage.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownloadBriefing}
            className="inline-flex items-center justify-center gap-2 rounded bg-teal-700 hover:bg-teal-600 px-4 py-2.5 min-h-[44px] text-xs font-medium text-white whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Briefing Report (.md)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {briefings.map((b) => {
            const active = b.id === activeBriefing.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedBriefingId(b.id)}
                className={`text-left rounded border px-3.5 py-3 min-h-[44px] transition-colors cursor-pointer ${
                  active
                    ? 'border-teal-500 bg-teal-500/15 text-slate-50'
                    : 'border-slate-800 bg-[#070B14] text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="text-[11px] font-mono text-teal-400">{b.shortTitle}</div>
                <div className="text-xs font-medium mt-1 leading-snug">{b.question}</div>
              </button>
            );
          })}
        </div>

        <div className="rounded border border-slate-800 bg-[#070B14] p-4 space-y-4 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-100">{activeBriefing.question}</h3>
            <span className="font-mono text-[11px] text-amber-300">
              {activeBriefing.patternSummary}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="font-semibold text-teal-300 uppercase tracking-wider">
                NASA Observations
              </div>
              <ul className="list-disc pl-4 space-y-1 text-slate-300 leading-relaxed">
                {activeBriefing.observations.map((obs, idx) => (
                  <li key={idx}>{obs}</li>
                ))}
              </ul>

              <div className="font-semibold text-amber-300 uppercase tracking-wider pt-2">
                Exceptions &amp; Contradictions
              </div>
              <ul className="list-disc pl-4 space-y-1 text-slate-300 leading-relaxed">
                {activeBriefing.contradictionsOrExceptions.map((exc, idx) => (
                  <li key={idx}>{exc}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <div className="font-semibold text-amber-300 uppercase tracking-wider">
                Confounders &amp; Missing Evidence
              </div>
              <ul className="list-disc pl-4 space-y-1 text-slate-300 leading-relaxed">
                {activeBriefing.confoundersAndMissingData.map((conf, idx) => (
                  <li key={idx}>{conf}</li>
                ))}
              </ul>

              <div className="pt-2 space-y-1.5">
                <div>
                  <span className="font-semibold text-slate-100">Scientific Conclusion: </span>
                  <span className="text-slate-300">{activeBriefing.conclusion}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-100">Remaining Uncertainty: </span>
                  <span className="text-slate-300">{activeBriefing.remainingUncertainty}</span>
                </div>
                <div className="text-amber-300">
                  <strong>Scope Boundary:</strong> {activeBriefing.safetyBoundary}
                </div>
              </div>
            </div>
          </div>

          {/* 6-Stage Source-to-Claim Trace */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
              Source-to-Claim Traceability Path
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {activeBriefing.evidenceChain.map((step) => (
                <div
                  key={step.stage}
                  className="rounded border border-slate-800 bg-[#0D1422] p-2.5 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-semibold text-teal-400">
                      {step.stage}
                    </span>
                    <a
                      href={step.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-[10px] text-amber-300 hover:text-amber-200"
                    >
                      <span>{step.locator}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">{step.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission-Relevance Research Briefing for Selected Context */}
      <section className="rounded-lg border border-slate-800 bg-[#0D1422] p-5 space-y-3 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-400 shrink-0" />
            <h2 className="text-base font-semibold text-slate-100">
              Mission-Relevance Research Briefing: {activeMissionProfile.title}
            </h2>
          </div>
          <span className="font-mono text-[11px] text-teal-400">
            {activeMissionProfile.gravityLabel}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded border border-slate-800 bg-[#070B14] p-3 space-y-1.5">
            <div>
              <strong className="text-slate-100">Relevant NASA Studies: </strong>
              <span className="text-slate-300">{activeMissionProfile.relevantStudies}</span>
            </div>
            <div>
              <strong className="text-slate-100">Actually Measured Variables: </strong>
              <span className="text-slate-300">{activeMissionProfile.measuredVariables}</span>
            </div>
            <div>
              <strong className="text-teal-300">Preliminary Research Context: </strong>
              <span className="text-slate-300">{activeMissionProfile.preliminaryContext}</span>
            </div>
          </div>

          <div className="rounded border border-slate-800 bg-[#070B14] p-3 space-y-1.5">
            <div>
              <strong className="text-amber-300">Non-Transferable Assumptions: </strong>
              <span className="text-slate-300">
                {activeMissionProfile.nonTransferableAssumptions}
              </span>
            </div>
            <div>
              <strong className="text-amber-300">Missing Validation Data: </strong>
              <span className="text-slate-300">{activeMissionProfile.missingValidationData}</span>
            </div>
            <div>
              <strong className="text-slate-100">Proposed Research Priorities:</strong>
              <ul className="list-disc pl-4 mt-1 text-slate-300 space-y-0.5">
                {activeMissionProfile.proposedResearchPriorities.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* NASA evidence-derived SI insights from BASS-II Table 5.1 Atlas */}
      <section className="rounded-lg border border-slate-800 bg-[#0D1422] p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-slate-100">
            Evidence Intelligence: NASA BASS-II Table 5.1 Atlas
          </h2>
          <a
            href="https://ntrs.nasa.gov/citations/20210011385"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono underline text-teal-400 inline-flex items-center gap-1"
          >
            <span>Primary NASA BASS-II report</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <p className="text-xs text-slate-400">
          The BASS-II Data Atlas transcribes {bass2Summary.sampleTests} NASA PMMA test samples,{' '}
          {bass2Summary.reportedVelocityConditions} reported airflow conditions, and{' '}
          {bass2Summary.numericSpreadObservations} numeric flame-spread observations (preserving{' '}
          {bass2Summary.noTrackedRateSegments} missing rates as null). These are NOT 39 independent
          experimental fires. Our descriptive alignment check finds {bass2Summary.alignedWithinTest} of{' '}
          {bass2Summary.assessableMultiConditionTests} assessable multi-velocity tests align
          directionally; M3 is a counterexample. Causation is NOT established because oxygen and
          other conditions changed within tests.
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          {BASS2_RESEARCH_INSIGHTS.map((insight) => (
            <article key={insight.id} className="rounded border border-slate-800 bg-[#070B14] p-3 space-y-2">
              <h3 className="text-sm font-semibold text-teal-300">{insight.title}</h3>
              <p className="text-xs text-slate-300">{insight.statement}</p>
              <p className="text-xs text-amber-300">{insight.limitation}</p>
              <p className="text-[11px] font-mono text-slate-400">{insight.citation}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Non-Certification & Formula Transparency Banner */}
      <section className="rounded-lg border border-slate-800 bg-[#0D1422] p-5 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="text-xs font-mono text-teal-300">
            Formula: {RELEVANCE_FORMULA_DESCRIPTION}
          </div>
          <div className="text-xs font-mono text-slate-400">
            Weights: 0.30 Env · 0.25 Params · 0.25 Verification · 0.20 Material
          </div>
        </div>
        <p className="text-xs text-amber-300/90 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            This Relevance Index measures research-evidence alignment and schema completeness ONLY.
            It is NEVER a fire probability, physical hazard severity, material safety certification,
            or validation of Lunar (0.165 g) / Martian (0.38 g) combustion behavior from 0 g tests.
          </span>
        </p>
      </section>

      {/* Deterministic Research-Relevance Ranking Table */}
      <section className="rounded-lg border border-slate-800 bg-[#0D1422] overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-base font-semibold text-slate-100">
            Deterministic Relevance Ranking ({CONTEXT_LABELS[context]})
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Completeness Factor = 0.25 + 0.75 × Completeness
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#080D18] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-medium">Rank</th>
                <th className="px-4 py-3 font-medium">Experiment &amp; Title</th>
                <th className="px-4 py-3 font-medium text-right">Index</th>
                <th className="px-4 py-3 font-medium text-right">Completeness</th>
                <th className="px-4 py-3 font-medium text-right">Env</th>
                <th className="px-4 py-3 font-medium text-right">Param</th>
                <th className="px-4 py-3 font-medium text-right">Verif</th>
                <th className="px-4 py-3 font-medium">Status &amp; Limitations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {ranked.map(({ record, breakdown }, idx) => (
                <tr key={record.experimentId} className="align-top">
                  <td className="px-4 py-3 font-mono tabular-nums text-slate-400">#{idx + 1}</td>
                  <td className="px-4 py-3 min-w-[220px]">
                    <div className="font-mono text-teal-400">{record.experimentId}</div>
                    <div className="text-slate-200 font-medium mt-0.5">{record.paperTitle}</div>
                    <div className="text-slate-400 mt-0.5">
                      {record.experimentFamily} · {record.recordLevel ?? 'CATALOG_INDEX'} ·{' '}
                      {record.gravityContext}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono tabular-nums text-right text-amber-300 font-semibold">
                    {breakdown.overallRelevanceIndex.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 font-mono tabular-nums text-right text-slate-200">
                    {Math.round(breakdown.completenessScore * 100)}%
                  </td>
                  <td className="px-4 py-3 font-mono tabular-nums text-right text-slate-300">
                    {breakdown.environmentAlignment.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 font-mono tabular-nums text-right text-slate-300">
                    {breakdown.parameterAlignment.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 font-mono tabular-nums text-right text-slate-300">
                    {breakdown.verificationWeight.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 min-w-[250px] space-y-1.5">
                    <VerificationTag status={record.verificationStatus} />
                    {breakdown.limitations.length > 0 && (
                      <ul className="list-disc pl-4 text-[11px] text-slate-400 space-y-0.5">
                        {breakdown.limitations.slice(0, 2).map((lim, i) => (
                          <li key={i}>{lim}</li>
                        ))}
                      </ul>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Deterministic Research Analysis & Optional Gemini Synthesis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-6 rounded-lg border border-slate-800 bg-[#0D1422] p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-100">
              Deterministic Evidence Synthesis
            </h2>
            <OriginTag origin="DERIVED_CALCULATION" />
          </div>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {deterministic.groundedSummary}
          </p>

          <div className="space-y-3 text-xs">
            <div>
              <h3 className="font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Methodological Similarities &amp; Scope Boundaries
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                {deterministic.methodologicalSimilarities.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold uppercase tracking-wider text-amber-300 mb-1">
                Missing Measurements &amp; Evidence Gaps
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                {deterministic.evidenceGaps.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Documented Contradictions
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                {deterministic.contradictions.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold uppercase tracking-wider text-teal-300 mb-1">
                Suggested Next Research Questions
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                {deterministic.suggestedQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Optional Server-Side Gemini Analysis */}
        <section className="lg:col-span-6 rounded-lg border border-slate-800 bg-[#0D1422] p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-teal-400" />
              <h2 className="text-base font-semibold text-slate-100">
                Grounded Research Brief Generator
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {geminiConfigured ? 'Server Gemini Ready' : 'No-Key Deterministic Mode'}
            </span>
          </div>

          <p className="text-xs text-slate-400">
            {geminiConfigured
              ? 'Server-side Gemini integration is active. Claims are strictly grounded to retrieved experimentId/sourceId records and labeled AI-Assisted.'
              : 'No server Gemini key detected. Generates a deterministic evidence-grounded summary without requiring external AI credentials.'}
          </p>

          <form onSubmit={runServerAnalysis} className="space-y-3">
            <div>
              <label htmlFor="research-question" className="block text-xs text-slate-300 mb-1">
                Optional Research Focus Question
              </label>
              <input
                id="research-question"
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder={`e.g., What evidence gaps limit applying BASS-II to ${CONTEXT_LABELS[context]}?`}
                className="w-full rounded border border-slate-700 bg-[#070B14] px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <button
              type="submit"
              disabled={isAnalyzing}
              className="inline-flex items-center gap-2 rounded-md bg-teal-600 hover:bg-teal-500 disabled:opacity-60 px-4 py-2 text-xs font-medium text-slate-950 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isAnalyzing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>
                {isAnalyzing
                  ? 'Synthesizing Active Records...'
                  : 'Generate Grounded Synthesis'}
              </span>
            </button>
          </form>

          {analysisError && (
            <div className="rounded border border-rose-500/40 bg-rose-950/30 p-3 text-xs text-rose-300">
              {analysisError}
            </div>
          )}

          {analysisResult && (
            <div className="rounded border border-slate-800 bg-[#070B14] p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <span className="text-xs font-semibold text-amber-300">
                  {analysisResult.label}
                </span>
                <OriginTag
                  origin={
                    analysisResult.mode === 'AI_ASSISTED'
                      ? 'AI_ASSISTED'
                      : 'DERIVED_CALCULATION'
                  }
                />
              </div>
              <p className="text-[11px] text-slate-400">{analysisResult.note}</p>
              {analysisResult.aiNarrative ? (
                <pre className="whitespace-pre-wrap font-sans text-xs text-slate-200 leading-relaxed">
                  {analysisResult.aiNarrative}
                </pre>
              ) : (
                <p className="text-xs text-slate-200 leading-relaxed">
                  {deterministic.groundedSummary}
                </p>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Source-Grounded Finding Cards */}
      <section className="rounded-lg border border-slate-800 bg-[#0D1422] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              Source-Grounded NASA Findings
            </h2>
            <p className="text-xs text-slate-400">
              Every finding below traces directly to an ingested sourceId, locator, origin class,
              and DIWA verification state.
            </p>
          </div>
          <span className="text-xs font-mono text-teal-400 tabular-nums">
            {records.reduce((acc, r) => acc + r.findings.length, 0)} cited finding(s)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {records
            .flatMap((r) =>
              r.findings.map((f) => ({
                finding: f,
                experimentId: r.experimentId,
                sourceId: r.sourceId,
                sourceUrl: r.sourceUrl,
                recordLevel: r.recordLevel ?? 'CATALOG_INDEX',
              }))
            )
            .map(({ finding, experimentId, sourceId, sourceUrl, recordLevel }) => (
              <article
                key={`${experimentId}-${finding.findingId}`}
                className="rounded border border-slate-800 bg-[#070B14] p-4 space-y-2 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-teal-400">
                    {finding.findingId} · {experimentId}
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <OriginTag origin={finding.originType} />
                    <VerificationTag status={finding.verificationStatus} />
                  </div>
                </div>
                <p className="text-slate-200 leading-relaxed">{finding.statement}</p>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
                  <span>
                    {sourceId} · {recordLevel} · {finding.citationLocator ?? 'No locator'}
                  </span>
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-300 hover:text-amber-200"
                  >
                    Source
                  </a>
                </div>
              </article>
            ))}
        </div>
      </section>
    </div>
  );
};
