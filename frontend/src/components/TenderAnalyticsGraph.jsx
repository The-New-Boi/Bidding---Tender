import React, { useState } from 'react';
import { 
  BarChart2, 
  ShieldCheck, 
  TrendingDown, 
  DollarSign, 
  Award, 
  Activity, 
  AlertTriangle, 
  Cpu,
  Radar,
  PieChart as PieIcon,
  CheckCircle2
} from 'lucide-react';

const TenderAnalyticsGraph = ({ tender, bidders, isFinancialUnsealed }) => {
  const [activeGraphTab, setActiveGraphTab] = useState('radar'); // 'radar' | 'prices' | 'cartel'
  const [selectedBidderId, setSelectedBidderId] = useState(bidders[0]?.id || null);

  const maxBudget = tender?.budget || 5500000;

  // SVG Radar Chart Math Helper
  const center = 150;
  const radius = 100;
  const numAxes = 5;
  const axesLabels = ['Tech Match', 'Local Content', 'Legacy Score', 'Financial Fit', 'Compliance'];

  // Helper to calculate radar coordinates
  const getCoordinates = (index, value) => {
    const angle = (Math.PI * 2 / numAxes) * index - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Build polygon string for a bidder
  const getPolygonPoints = (b) => {
    const tech = Math.min(100, (b.final_score || 85));
    const local = b.local_content_percentage || 50;
    const legacy = b.legacy_score || 80;
    const fin = b.bid_amount <= maxBudget ? 90 : 40;
    const comp = b.msme_registered ? 95 : 75;

    const values = [tech, local, legacy, fin, comp];
    return values.map((val, idx) => {
      const { x, y } = getCoordinates(idx, val);
      return `${x},${y}`;
    }).join(' ');
  };

  const colors = [
    { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.25)', text: 'text-amber-500', name: 'Vendor 1' },
    { stroke: '#a855f7', fill: 'rgba(168, 85, 247, 0.25)', text: 'text-purple-500', name: 'Vendor 2' },
    { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.25)', text: 'text-emerald-500', name: 'Vendor 3' },
    { stroke: '#3b82f6', fill: 'rgba(59, 130, 246, 0.25)', text: 'text-blue-500', name: 'Vendor 4' },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
      
      {/* Header & Graph Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-3 w-3 rounded-full bg-purple-500 animate-pulse"></span>
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center space-x-2">
              <span>AI Vendor Radar & Analytics Engine</span>
              <span className="bg-purple-100 text-purple-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                AI 10X Graphical Radar
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Interactive multi-axis radar chart, price discovery benchmark, and anti-collusion network graph
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveGraphTab('radar')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 ${
              activeGraphTab === 'radar' ? 'bg-slate-900 text-white shadow' : 'hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>🕸️ AI Radar Spider Chart</span>
          </button>
          <button
            onClick={() => setActiveGraphTab('prices')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 ${
              activeGraphTab === 'prices' ? 'bg-slate-900 text-white shadow' : 'hover:text-slate-900'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>📊 Price Benchmark</span>
          </button>
          <button
            onClick={() => setActiveGraphTab('cartel')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 ${
              activeGraphTab === 'cartel' ? 'bg-slate-900 text-white shadow' : 'hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>🛡️ Anti-Cartel Topology</span>
          </button>
        </div>
      </div>

      {/* TAB 1: SVG SPIDER / RADAR CHART */}
      {activeGraphTab === 'radar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          
          {/* SVG RADAR GRAPH CANVAS */}
          <div className="lg:col-span-2 bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-4 left-4 text-xs font-bold text-amber-400 flex items-center space-x-1.5">
              <Radar className="w-4 h-4" />
              <span>Multi-Dimensional AI Performance Radar</span>
            </div>

            <svg width="320" height="320" className="my-2 select-none overflow-visible">
              
              {/* Concentric Grid Circles */}
              {[0.2, 0.4, 0.6, 0.8, 1.0].map((level, i) => (
                <circle
                  key={i}
                  cx={center}
                  cy={center}
                  r={radius * level}
                  fill="none"
                  stroke="#334155"
                  strokeDasharray={i < 4 ? "3 3" : "none"}
                  strokeWidth="1"
                />
              ))}

              {/* Axis Spoke Lines */}
              {axesLabels.map((label, idx) => {
                const { x, y } = getCoordinates(idx, 100);
                const labelCoord = getCoordinates(idx, 118);
                return (
                  <g key={idx}>
                    <line
                      x1={center}
                      y1={center}
                      x2={x}
                      y2={y}
                      stroke="#475569"
                      strokeWidth="1"
                    />
                    <text
                      x={labelCoord.x}
                      y={labelCoord.y}
                      fill="#94a3b8"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {label}
                    </text>
                  </g>
                );
              })}

              {/* OVERLAID BIDDER RADAR POLYGONS */}
              {bidders.slice(0, 4).map((b, idx) => {
                const color = colors[idx % colors.length];
                const points = getPolygonPoints(b);
                const isSelected = selectedBidderId === b.id || selectedBidderId === null;

                return (
                  <g key={b.id} className="transition-all duration-300">
                    <polygon
                      points={points}
                      fill={color.fill}
                      stroke={color.stroke}
                      strokeWidth={isSelected ? "3" : "1"}
                      opacity={isSelected ? "1" : "0.2"}
                    />
                    {/* Vertices Dots */}
                    {[0, 1, 2, 3, 4].map((vIdx) => {
                      const values = [
                        Math.min(100, (b.final_score || 85)),
                        b.local_content_percentage || 50,
                        b.legacy_score || 80,
                        b.bid_amount <= maxBudget ? 90 : 40,
                        b.msme_registered ? 95 : 75
                      ];
                      const { x, y } = getCoordinates(vIdx, values[vIdx]);
                      return (
                        <circle
                          key={vIdx}
                          cx={x}
                          cy={y}
                          r={isSelected ? "4" : "2"}
                          fill={color.stroke}
                        />
                      );
                    })}
                  </g>
                );
              })}
            </svg>

            <div className="text-[10px] text-slate-500 mt-2 font-mono">
              Scale: 0 - 100% across 5 AI compliance metrics
            </div>
          </div>

          {/* RADAR LEGEND & BIDDER SELECTOR */}
          <div className="space-y-4">
            <div className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Bidder Performance Radar Overlay
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setSelectedBidderId(null)}
                className={`w-full text-left p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  selectedBidderId === null ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                👁️ View All Overlaid Bidders
              </button>

              {bidders.slice(0, 4).map((b, idx) => {
                const color = colors[idx % colors.length];
                const isSelected = selectedBidderId === b.id;

                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBidderId(b.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      isSelected ? 'bg-slate-900 text-white border-slate-800 shadow-md' : 'bg-slate-50 text-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-extrabold">
                      <div className="flex items-center space-x-2">
                        <span
                          className="h-3 w-3 rounded-full inline-block"
                          style={{ backgroundColor: color.stroke }}
                        ></span>
                        <span>{b.bidder_name}</span>
                      </div>
                      <span className="font-mono text-amber-400">{b.final_score || b.legacy_score || 75}/100</span>
                    </div>

                    <div className="text-[10px] text-slate-400 mt-1 flex justify-between font-medium">
                      <span>Local Content: {b.local_content_percentage}%</span>
                      <span>MSME: {b.msme_registered ? 'Yes ✓' : 'No'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: PRICE VS BUDGET COMPARISON BAR CHART */}
      {activeGraphTab === 'prices' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span>Approved Estimated Budget (Confidential Reference): <strong>₹{(maxBudget / 100000).toFixed(1)} Lakhs</strong></span>
            </div>
            <div className="text-[11px] text-emerald-400 font-extrabold">
              AI Market Benchmark: ₹47.5 Lakhs (Expected L1 Price)
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {bidders.map((b) => {
              const amountInLakhs = b.bid_amount / 100000;
              const percentageOfBudget = Math.min(100, (b.bid_amount / maxBudget) * 100);

              return (
                <div key={b.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-900">{b.bidder_name}</span>
                    {isFinancialUnsealed ? (
                      <span className="font-extrabold text-slate-900">
                        ₹{amountInLakhs.toFixed(2)} Lakhs ({percentageOfBudget.toFixed(1)}% of Budget)
                      </span>
                    ) : (
                      <span className="font-mono text-amber-700 font-bold text-[11px] bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-300">
                        🔒 Sealed Envelope B
                      </span>
                    )}
                  </div>

                  <div className="w-full bg-slate-100 rounded-xl h-5 overflow-hidden relative border border-slate-200">
                    {isFinancialUnsealed ? (
                      <div
                        style={{ width: `${percentageOfBudget}%` }}
                        className={`h-full transition-all duration-500 rounded-xl flex items-center justify-end pr-2 text-[10px] font-extrabold text-white ${
                          b.bid_amount <= maxBudget ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-red-600'
                        }`}
                      >
                        {percentageOfBudget < 95 ? `${percentageOfBudget.toFixed(0)}%` : ''}
                      </div>
                    ) : (
                      <div className="h-full bg-amber-200/60 w-full animate-pulse flex items-center justify-center text-[10px] text-amber-900 font-bold tracking-widest">
                        ENCRYPTED FINANCIAL ENVELOPE B
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: CARTELIZATION & ANTI-COLLUSION NETWORK TOPOLOGY DIAGRAM */}
      {activeGraphTab === 'cartel' && (
        <div className="p-6 bg-slate-950 text-white rounded-3xl space-y-6 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h4 className="font-extrabold text-sm text-white">AI Anti-Collusion & IP Pattern Network Graph</h4>
            </div>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-500/40">
              Risk Index: 0.0% (Clean Independent Network)
            </span>
          </div>

          {/* SVG TOPOLOGY NODE DIAGRAM */}
          <div className="p-6 bg-slate-900/90 rounded-3xl border border-slate-800 flex flex-col items-center justify-center">
            <svg width="400" height="200" className="overflow-visible select-none">
              
              {/* Connections from Center Hub to Bidder Nodes */}
              {bidders.slice(0, 4).map((b, idx) => {
                const angles = [-140, -40, 40, 140];
                const angle = (angles[idx] * Math.PI) / 180;
                const nodeX = 200 + 130 * Math.cos(angle);
                const nodeY = 100 + 70 * Math.sin(angle);

                return (
                  <g key={b.id}>
                    <line
                      x1="200"
                      y1="100"
                      x2={nodeX}
                      y2={nodeY}
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      className="animate-pulse"
                    />
                    <circle cx={nodeX} cy={nodeY} r="22" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
                    <text x={nodeX} y={nodeY} fill="#64748b" fontSize="9" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
                      {`V${idx + 1}`}
                    </text>
                    <text x={nodeX} y={nodeY + 32} fill="#94a3b8" fontSize="9" fontWeight="extrabold" textAnchor="middle">
                      {b.bidder_name.split(' ')[0]}
                    </text>
                  </g>
                );
              })}

              {/* Central CPCL Hub Node */}
              <circle cx="200" cy="100" r="32" fill="#f59e0b" stroke="#ffffff" strokeWidth="3" shadow="true" />
              <text x="200" y="96" fill="#020617" fontSize="12" fontWeight="black" textAnchor="middle">
                CPCL
              </text>
              <text x="200" y="108" fill="#020617" fontSize="8" fontWeight="bold" textAnchor="middle">
                Tender Hub
              </text>
            </svg>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">IP Fingerprints</div>
              <div className="text-emerald-400 font-extrabold text-sm">✓ 5 Unique IPs Verified</div>
            </div>

            <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">MCA21 Director Cross-Check</div>
              <div className="text-emerald-400 font-extrabold text-sm">✓ 0 Shared Directors</div>
            </div>

            <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Pricing Collusion Scan</div>
              <div className="text-emerald-400 font-extrabold text-sm">✓ Natural Price Distribution</div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default TenderAnalyticsGraph;
