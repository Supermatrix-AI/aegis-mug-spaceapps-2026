import React, { useMemo, useState } from 'react';
import {
  ScatterChart, Scatter, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Database, Download, ExternalLink, AlertTriangle, Layers3 } from 'lucide-react';
import {
  BASS2_TESTS,BASS2_SEGMENTS,BASS2_TABLE51_URL,BASS2_TABLE51_LIMITATION,
} from '../data/bass2Table51.ts';
import {
  BASS2_RESEARCH_INSIGHTS,BASS2_INSIGHT_SAFETY,
  computeBass2Summary,exportBass2SegmentsCsv,trendForTest,
} from '../utils/bass2Insights.ts';

function downloadCsv(){
  const data=exportBass2SegmentsCsv();
  const blob=new Blob([data],{type:'text/csv;charset=utf-8'});
  const u=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=u;
  a.download='NASA-BASS2-Table5-1-source-matched-segment-atlas.csv';
  document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(u);
}

export const Bass2Atlas:React.FC=()=>{
  const [sides,setSides]=useState<'ALL'|'ONE'|'TWO'>('ALL');
  const [selectedTest,setSelectedTest]=useState('ALL');
  const [includeUntracked,setIncludeUntracked]=useState(true);
  const summary=useMemo(()=>computeBass2Summary(),[]);
  const filtered=useMemo(()=>BASS2_SEGMENTS.filter(s=>
    (sides==='ALL'||s.burningSides===(sides==='ONE'?1:2)) &&
    (selectedTest==='ALL'||s.testId===selectedTest) &&
    (includeUntracked||s.spreadRateMmPerSecond!==null)
  ),[sides,selectedTest,includeUntracked]);
  const numeric=filtered.filter((s):s is typeof s & {spreadRateMmPerSecond:number}=>
    s.spreadRateMmPerSecond !== null
  );
  const one=numeric.filter(s=>s.burningSides===1).map(s=>({
    velocity:s.velocityCmPerSecond,spread:s.spreadRateMmPerSecond,test:s.testId,
    thickness:s.thicknessMm,width:s.widthCm,initialO2:s.initialOxygenVolPercent,
  }));
  const two=numeric.filter(s=>s.burningSides===2).map(s=>({
    velocity:s.velocityCmPerSecond,spread:s.spreadRateMmPerSecond,test:s.testId,
    thickness:s.thicknessMm,width:s.widthCm,initialO2:s.initialOxygenVolPercent,
  }));
  const selected=selectedTest==='ALL'?null:BASS2_TESTS.find(x=>x.id===selectedTest)??null;
  const trend=selected?trendForTest(selected):null;

  return <div className="space-y-6">
    <section className="space-y-2">
      <div className="text-xs font-mono text-teal-400">SPECULATRON AI · SOURCE-MATCHED RESEARCH</div>
      <h1 className="text-2xl font-semibold text-slate-50 flex items-center gap-2">
        <Layers3 className="w-6 h-6 text-amber-400"/> BASS-II Evidence Atlas
      </h1>
      <p className="text-sm text-slate-300">
        The complete published 20-test PMMA matrix from NASA/TM-20210011385 Table 5.1,
        preserving each reported velocity/spread-rate pair and explicitly missing values.
      </p>
      <a href={BASS2_TABLE51_URL} target="_blank" rel="noreferrer"
        className="inline-flex gap-1.5 items-center text-sm text-teal-300 underline">
        Open original NASA report, Table 5.1 (printed p. 57) <ExternalLink className="w-3.5 h-3.5"/>
      </a>
    </section>

    <section aria-label="Source atlas counts" className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {[
        {label:'Distinct NASA test samples',value:summary.sampleTests},
        {label:'Source-reported velocity conditions',value:summary.reportedVelocityConditions},
        {label:'Numeric spread-rate observations',value:summary.numericSpreadObservations},
        {label:'Missing / not-tracked spread values',value:summary.noTrackedRateSegments},
      ].map(x=><div key={x.label} className="bg-[#0D1422] border border-slate-800 rounded p-4">
        <div className="font-mono text-2xl text-teal-300">{x.value}</div>
        <div className="text-xs text-slate-400 mt-1">{x.label}</div>
      </div>)}
    </section>

    <section className="border border-amber-500/40 bg-amber-950/20 rounded-lg p-4 flex gap-3 text-xs text-amber-100">
      <AlertTriangle className="w-5 h-5 shrink-0 text-amber-300"/>
      <div>
        <strong>SCIENTIFIC COMPARABILITY WARNING</strong>
        <p className="mt-1">{BASS2_TABLE51_LIMITATION}</p>
        <p className="mt-2">The {summary.numericSpreadObservations} numeric values are observations across
          {summary.sampleTests} samples, NOT {summary.numericSpreadObservations} independent fires.
          The table does not include uncertainty bars or time-resolved oxygen at each flow segment.</p>
      </div>
    </section>

    <section className="bg-[#0D1422] border border-slate-800 rounded-lg p-5 space-y-4">
      <div className="flex flex-col lg:flex-row gap-3 lg:items-end lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Measured airflow vs reported flame-spread rate</h2>
          <p className="text-xs text-slate-400 mt-1">
            NASA Table 5.1 reported values, split by one-sided/two-sided burning.
            Marker positions show observations, not fitted predictions.
          </p>
        </div>
        <button type="button" onClick={downloadCsv}
          className="rounded bg-teal-700 hover:bg-teal-600 px-4 py-2.5 min-h-[44px] text-sm text-white inline-flex items-center justify-center gap-2">
          <Download className="w-4 h-4"/> Export sourced CSV
        </button>
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        <label className="text-xs text-slate-300">Burning geometry
          <select value={sides} onChange={e=>setSides(e.target.value as typeof sides)}
            className="block mt-1 w-full bg-slate-900 border border-slate-700 rounded px-3 py-2.5 min-h-[44px]">
            <option value="ALL">Both geometries</option>
            <option value="ONE">One-sided only</option>
            <option value="TWO">Two-sided only</option>
          </select>
        </label>
        <label className="text-xs text-slate-300">Test sample
          <select value={selectedTest} onChange={e=>setSelectedTest(e.target.value)}
            className="block mt-1 w-full bg-slate-900 border border-slate-700 rounded px-3 py-2.5 min-h-[44px]">
            <option value="ALL">All 20 tests</option>
            {BASS2_TESTS.map(t=><option key={t.id} value={t.id}>{t.id} — {t.thicknessMm} mm, {t.burningSides} side(s)</option>)}
          </select>
        </label>
        <label className="text-xs text-slate-300 flex items-center gap-2 pt-3">
          <input type="checkbox" checked={includeUntracked}
            onChange={e=>setIncludeUntracked(e.target.checked)}/>
          Include “Not tracked” rows in table
        </label>
      </div>
      <p className="text-xs text-slate-400">{filtered.length} velocity-condition rows shown; {numeric.length} have numeric spread rates.</p>
      {numeric.length>0?<div className="min-w-0 h-72">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <ScatterChart margin={{top:12,right:28,bottom:24,left:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
            <XAxis type="number" dataKey="velocity" name="Opposed-flow velocity" unit="cm/s"
              tick={{fill:'#94a3b8',fontSize:11}} label={{value:'Opposed flow (cm/s)',position:'insideBottom',offset:-12,fill:'#94a3b8'}}/>
            <YAxis type="number" dataKey="spread" name="Flame spread" unit="mm/s"
              tick={{fill:'#94a3b8',fontSize:11}} width={52}/>
            <Tooltip cursor={{strokeDasharray:'3 3'}}
              contentStyle={{background:'#0B1120',borderColor:'#334155',color:'#fff'}}
              formatter={(value,name)=>[String(value),String(name)]}/>
            <Legend/>
            {one.length>0&&<Scatter name="One-sided observations" data={one} fill="#f59e0b"/>}
            {two.length>0&&<Scatter name="Two-sided observations" data={two} fill="#14b8a6"/>}
          </ScatterChart>
        </ResponsiveContainer>
      </div>:<div className="text-slate-400 text-sm border border-slate-800 rounded p-8 text-center">
        No numeric spread rates under the current filters.
      </div>}
      {selected&&<div className="border border-slate-800 rounded p-4 text-sm">
        <div className="font-medium text-teal-300">Focused NASA test {selected.id}</div>
        <p className="text-slate-300 mt-1">
          {selected.thicknessMm} mm thickness · {selected.widthCm} cm width · {selected.burningSides}-sided ·
          O2 from {selected.initialOxygenVolPercent}% to {selected.finalOxygenVolPercent}% over
          {' '}{selected.burnMinutes} minutes (initial/final only).
        </p>
        <p className="text-xs text-amber-300 mt-2">
          Within-test airflow/spread alignment: {trend?.status}.
          {' '}{trend?.note}
        </p>
      </div>}
    </section>

    <section className="bg-[#0D1422] border border-slate-800 rounded-lg p-5 space-y-3">
      <h2 className="text-lg font-semibold">Auditable source table</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[760px]">
          <thead className="bg-[#080D18] text-slate-400">
            <tr>
              <th className="p-3">Test / segment</th>
              <th className="p-3">Thickness</th>
              <th className="p-3">Width</th>
              <th className="p-3">Sides</th>
              <th className="p-3">Flow</th>
              <th className="p-3">Spread</th>
              <th className="p-3">Test O2 start → end</th>
              <th className="p-3">O2 at segment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filtered.map(x=><tr key={x.id} className="hover:bg-slate-800/40">
              <td className="p-3 font-mono text-teal-300">{x.id}</td>
              <td className="p-3">{x.thicknessMm} mm</td>
              <td className="p-3">{x.widthCm} cm</td>
              <td className="p-3">{x.burningSides}</td>
              <td className="p-3">{x.velocityCmPerSecond} cm/s</td>
              <td className="p-3 font-mono">{x.spreadRateMmPerSecond===null?'Not tracked':x.spreadRateMmPerSecond+' mm/s'}</td>
              <td className="p-3">{x.initialOxygenVolPercent}% → {x.finalOxygenVolPercent}%</td>
              <td className="p-3 text-amber-300">Not reported</td>
            </tr>)}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400">NASA/TM-20210011385, Table 5.1, printed p. 57. Manual source-matched transcription; not automatically sensor-verified. Preserve all original measurement precision.</p>
    </section>

    <section className="bg-[#0D1422] border border-slate-800 rounded-lg p-5 space-y-3">
      <h2 className="text-lg font-semibold flex items-center gap-2"><Database className="w-4 h-4 text-teal-400"/> Evidence intelligence & research gaps</h2>
      <div className="grid lg:grid-cols-2 gap-3">
        <div className="border border-slate-800 rounded p-4 space-y-2">
          <h3 className="font-semibold text-slate-100">Within-test descriptive alignment</h3>
          <div className="font-mono text-xl text-teal-300">{summary.alignedWithinTest}/{summary.assessableMultiConditionTests}</div>
          <p className="text-sm text-slate-300">
            Assessable multi-velocity tests show a nondecreasing spread-rate pattern with airflow in
            { ' '}{summary.alignedWithinTest} cases. {summary.nonalignedWithinTest} case(s),
            including M3, do not follow that simple direction.
          </p>
          <p className="text-xs text-amber-300">Not a causal result: velocity and oxygen were not independently held constant in these test sequences.</p>
        </div>
        <div className="border border-slate-800 rounded p-4 space-y-2">
          <h3 className="font-semibold text-slate-100">Next highest-value data request</h3>
          <p className="text-sm text-slate-300">Obtain time-resolved NASA camera-tracked flame fronts,
            calibrated flow and oxygen measurements for individual conditions, together with uncertainty metadata.</p>
          <p className="text-xs text-amber-300">This is what a properly calibrated, cross-condition digital twin would need.</p>
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-3">
        {BASS2_RESEARCH_INSIGHTS.map(insight=><article key={insight.id}
          className="border border-slate-800 rounded p-4 space-y-2">
          <h3 className="font-semibold text-sm text-slate-100">{insight.title}</h3>
          <p className="text-xs text-slate-300">{insight.statement}</p>
          <p className="text-xs text-amber-300">{insight.limitation}</p>
          <p className="text-[11px] text-teal-400">{insight.citation}</p>
        </article>)}
      </div>
      <p className="text-xs text-amber-300">{BASS2_INSIGHT_SAFETY}</p>
    </section>
  </div>;
};
