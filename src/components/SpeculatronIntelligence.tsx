import React, { useState } from 'react';
import { AlertTriangle, BrainCircuit, Loader2, Sparkles } from 'lucide-react';
import type { ApplicationContext, ExperimentRecord } from '../types/scientific.ts';
import {
  CONTEXT_LABELS,
  generateDeterministicSynthesis,
  rankExperimentsForContext,
  RELEVANCE_FORMULA_DESCRIPTION,
} from '../utils/scoring.ts';
import { OriginTag, VerificationTag } from './ScientificLabels.tsx';
import { BASS2_RESEARCH_INSIGHTS, computeBass2Summary } from '../utils/bass2Insights.ts';

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
  const [customQuestion, setCustomQuestion] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const ranked = rankExperimentsForContext(records, context);
  const deterministic = generateDeterministicSynthesis(records, context);

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

      {/* NASA evidence-derived SI insights: source-reported, not hazard predictions */}
      <section className="rounded-lg border border-teal-700/40 bg-[#0D1422] p-5 space-y-3">
        <h2 className="text-base font-semibold text-slate-100">
          Evidence intelligence: NASA BASS-II Table 5.1
        </h2>
        <p className="text-xs text-slate-400">
          The separate Data Atlas transcribes 20 NASA PMMA test samples, 43 reported airflow
          conditions and 39 numeric flame-spread observations. These are not 39 independent
          experimental fires. Our transparent alignment check finds
          {' '}{computeBass2Summary().alignedWithinTest} of
          {' '}{computeBass2Summary().assessableMultiConditionTests} assessable multi-velocity
          tests align directionally; M3 is a counterexample. Causation is NOT established
          because oxygen and other conditions changed within tests.
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          {BASS2_RESEARCH_INSIGHTS.map((insight) => (
            <article key={insight.id} className="rounded border border-slate-800 p-3 space-y-2">
              <h3 className="text-sm font-semibold text-teal-300">{insight.title}</h3>
              <p className="text-xs text-slate-300">{insight.statement}</p>
              <p className="text-xs text-amber-300">{insight.limitation}</p>
              <p className="text-[11px] font-mono text-slate-400">{insight.citation}</p>
            </article>
          ))}
        </div>
        <a href="https://ntrs.nasa.gov/citations/20210011385" target="_blank"
          rel="noopener noreferrer" className="text-xs underline text-teal-400">
          Primary NASA BASS-II report
        </a>
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
