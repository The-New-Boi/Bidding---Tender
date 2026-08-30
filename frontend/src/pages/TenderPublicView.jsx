import React, { useState, useEffect } from 'react';
import { getTenderDetail } from '../api/client';
import { 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2, 
  FileText, 
  BadgeCheck,
  AlertCircle,
  Tag,
  Send
} from 'lucide-react';

const TenderPublicView = ({ tenderId, onBack }) => {
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applyForm, setApplyForm] = useState({
    company_name: '',
    pan: '',
    gstin: '',
    contact_email: '',
    msme_registered: false,
    local_content_percentage: 40,
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getTenderDetail(tenderId);
        if (data) {
          setTender(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tenderId]);

  const handleApply = (e) => {
    e.preventDefault();
    setApplied(true);
    setShowApplyForm(false);
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400 font-medium">Loading tender details...</div>;
  }

  const activeTender = tender || {
    id: 1,
    tender_number: "TENDER-2026-CPCL-001",
    title: "Procurement of Refinery Instrumentation Valves & Flow Controllers",
    description: "Supply, installation, and commissioning of high-precision refinery grade instrumentation control valves, digital positioners, and mass flow controllers for CPCL Manali Refinery Unit 2.",
    department: "CPCL Refinery Instrumentation Division",
    budget: 5500000,
    category: "Instrumentation & Controls",
    status: "open",
    selection_mode: "ai_ranked",
    eligibility_criteria: {
      require_msme: true,
      min_local_content: 50,
      require_oem: true
    }
  };

  const criteria = activeTender.eligibility_criteria || {};
  const isOpen = activeTender.status === 'open';

  return (
    <div className="min-h-screen bg-slate-50">

      {/* TOP HEADER */}
      <div className="bg-slate-950 text-white px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={onBack}
            className="text-slate-400 hover:text-white text-xs font-semibold flex items-center space-x-1 mb-6 transition-colors"
          >
            <span>← Back to Tender Marketplace</span>
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-400 px-3 py-1 rounded-lg border border-amber-500/30">
              {activeTender.tender_number}
            </span>
            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
              isOpen ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              activeTender.status === 'evaluation' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              'bg-slate-700 text-slate-300 border border-slate-600'
            }`}>
              {isOpen ? '🟢 Accepting Applications' :
               activeTender.status === 'evaluation' ? '🟡 Under Evaluation (Closed)' :
               activeTender.status === 'awarded' ? '✅ Awarded — Closed' : activeTender.status}
            </span>
            {criteria.require_msme && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                🏅 MSME Preferred
              </span>
            )}
          </div>

          <h1 className="text-3xl font-black text-white leading-tight">{activeTender.title}</h1>
          <p className="text-slate-400 text-sm mt-2 max-w-3xl leading-relaxed">{activeTender.description}</p>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-400 font-medium">
            <span className="flex items-center space-x-1.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>{activeTender.department}</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>{activeTender.category}</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Selection: {activeTender.selection_mode === 'fair_draw' ? 'Anti-Corruption Fair Draw' : 'AI Composite Ranking'}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* APPLICATION SUCCESS BANNER */}
        {applied && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-5 flex items-start space-x-4">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 min-w-[24px] mt-0.5" />
            <div>
              <h4 className="font-extrabold text-emerald-900 text-base">Application Submitted Successfully!</h4>
              <p className="text-emerald-700 text-sm mt-1">Your company has been registered as a bidder for this tender. The Procurement Officer will review your credentials and notify you via email.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT COLUMN: Eligibility & Requirements */}
          <div className="lg:col-span-2 space-y-6">

            {/* ELIGIBILITY CRITERIA */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
              <div>
                <h2 className="font-extrabold text-slate-900 text-lg">Eligibility Criteria</h2>
                <p className="text-xs text-slate-500 mt-0.5">All criteria must be met to qualify for evaluation. Documents required at time of bid submission.</p>
              </div>

              <div className="space-y-3">
                <EligibilityRow
                  label="MSME Registration"
                  required={criteria.require_msme}
                  met={true}
                  description={criteria.require_msme
                    ? 'Valid Udyam Registration Certificate mandatory. MSME vendors receive EMD exemption.'
                    : 'MSME registration is preferred but not mandatory.'}
                />
                <EligibilityRow
                  label={`Minimum Local Content ≥ ${criteria.min_local_content || 40}%`}
                  required={true}
                  met={true}
                  description="Make in India mandatory. Products/services must have minimum indigenous content percentage as certified."
                />
                <EligibilityRow
                  label="OEM Authorization"
                  required={criteria.require_oem}
                  met={true}
                  description={criteria.require_oem
                    ? 'Original Equipment Manufacturer authorization letter required for instrumentation products.'
                    : 'OEM authorization is preferred but not mandatory.'}
                />
                <EligibilityRow
                  label="GST Registration"
                  required={true}
                  met={true}
                  description="Valid GSTIN registration mandatory. GST returns must be filed up to date."
                />
                <EligibilityRow
                  label="Financial Turnover"
                  required={true}
                  met={true}
                  description="3-year average audited turnover minimum required. Exact threshold provided in tender NIT document."
                />
              </div>
            </div>

            {/* DOCUMENTS REQUIRED */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h2 className="font-extrabold text-slate-900 text-lg">Documents to be Submitted</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { doc: 'Udyam MSME Certificate', note: 'If MSME registered' },
                  { doc: 'GST Registration Certificate', note: 'Mandatory' },
                  { doc: 'Last 3 Years Audited Balance Sheet', note: 'CA Certified' },
                  { doc: 'OEM Authorization Letter', note: 'If applicable' },
                  { doc: 'PAN Card Copy', note: 'Mandatory' },
                  { doc: 'Experience Certificate', note: 'Similar work orders' },
                  { doc: 'Bid Security / EMD', note: 'MSME exempt' },
                  { doc: 'Local Content Certificate', note: 'Self-certified' },
                ].map(item => (
                  <div key={item.doc} className="flex items-start space-x-2.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <FileText className="w-4 h-4 text-slate-400 mt-0.5 min-w-[16px]" />
                    <div>
                      <div className="text-xs font-bold text-slate-800">{item.doc}</div>
                      <div className="text-[10px] text-slate-500">{item.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PROCESS TIMELINE */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h2 className="font-extrabold text-slate-900 text-lg">Evaluation Process & Timeline</h2>
              <div className="space-y-3">
                {[
                  { step: '1', label: 'Application Submission', status: isOpen ? 'active' : 'done', desc: 'Submit credentials via this portal or physically at CPCL procurement office.' },
                  { step: '2', label: 'Technical Document Verification', status: activeTender.status !== 'open' ? 'active' : 'pending', desc: 'AI-assisted OCR screening of all submitted certificates and financial documents.' },
                  { step: '3', label: 'Sealed Financial Bid Opening', status: (activeTender.status === 'evaluation' || activeTender.status === 'awarded') ? 'active' : 'pending', desc: 'Financial quotes (Envelope B) opened only after technical evaluation clearance.' },
                  { step: '4', label: 'AI Composite Ranking / Fair Draw', status: activeTender.status === 'awarded' ? 'active' : 'pending', desc: 'Transparent AI scoring based on price, compliance, and legacy performance.' },
                  { step: '5', label: 'Contract Award & Public Disclosure', status: activeTender.status === 'awarded' ? 'done' : 'pending', desc: 'Winner notified and contract value publicly disclosed.' },
                ].map(s => (
                  <div key={s.step} className={`flex items-start space-x-4 p-3 rounded-xl ${s.status === 'active' ? 'bg-amber-50 border border-amber-200' : s.status === 'done' ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-50 border border-slate-100'}`}>
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-black min-w-[28px] ${s.status === 'done' ? 'bg-emerald-500 text-white' : s.status === 'active' ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-500'}`}>
                      {s.status === 'done' ? '✓' : s.step}
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-slate-900">{s.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Apply CTA + Notes */}
          <div className="space-y-4">
            {/* APPLY CARD */}
            <div className={`rounded-3xl border p-6 shadow-sm space-y-4 sticky top-6 ${isOpen ? 'bg-amber-500 border-amber-600' : 'bg-slate-900 border-slate-700'}`}>
              {isOpen ? (
                <>
                  <h3 className="font-extrabold text-slate-950 text-lg">Apply for This Tender</h3>
                  <p className="text-slate-800 text-sm leading-relaxed">
                    This tender is currently accepting applications. Submit your credentials to be considered for evaluation.
                  </p>
                  {!applied ? (
                    <button
                      onClick={() => setShowApplyForm(true)}
                      className="w-full bg-slate-950 text-amber-400 font-extrabold py-3.5 rounded-2xl text-sm shadow hover:bg-slate-800 transition-all flex items-center justify-center space-x-2"
                    >
                      <span>Register as Bidder</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="bg-emerald-500 text-white text-center font-bold py-3 rounded-2xl text-sm">
                      ✓ Application Submitted!
                    </div>
                  )}
                  <p className="text-xs text-slate-700 text-center">No fees required to apply</p>
                </>
              ) : (
                <>
                  <h3 className="font-extrabold text-white text-lg">
                    {activeTender.status === 'awarded' ? '✅ Tender Awarded' : '🟡 Closed for Applications'}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {activeTender.status === 'awarded'
                      ? 'This tender has been awarded. Check our Past Awards History for disclosed contract details.'
                      : 'Application window is closed. Evaluation is in progress.'}
                  </p>
                  <div className="bg-white/10 text-slate-300 text-center font-bold py-3 rounded-2xl text-sm">
                    Not Accepting Applications
                  </div>
                </>
              )}
            </div>

            {/* IMPORTANT NOTICES */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-extrabold text-blue-900 flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>Important Notices</span>
              </h4>
              <ul className="text-[11px] text-blue-800 space-y-1.5 list-disc pl-4">
                <li>Financial bid amounts are <strong>NOT disclosed</strong> until technical evaluation is complete.</li>
                <li>All bids are sealed under 2-Envelope System (CVC Protocol).</li>
                <li>MSME companies receive 15% price preference in evaluation.</li>
                <li>Contract value is publicly disclosed only after formal award.</li>
              </ul>
            </div>
          </div>

        </div>
      </div>

      {/* APPLY MODAL */}
      {showApplyForm && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div>
              <h3 className="font-extrabold text-slate-900 text-xl">Register as Bidder</h3>
              <p className="text-xs text-slate-500 mt-1">Your financial bid will be submitted separately and kept sealed until evaluation.</p>
            </div>

            <form onSubmit={handleApply} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Company Name</label>
                <input
                  type="text" required
                  placeholder="Your Company Pvt Ltd"
                  value={applyForm.company_name}
                  onChange={e => setApplyForm({...applyForm, company_name: e.target.value})}
                  className="w-full p-2.5 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">PAN Number</label>
                  <input
                    type="text" required placeholder="AAACK1234F"
                    value={applyForm.pan}
                    onChange={e => setApplyForm({...applyForm, pan: e.target.value.toUpperCase()})}
                    className="w-full p-2.5 border rounded-xl bg-slate-50"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">GSTIN</label>
                  <input
                    type="text" required placeholder="33AAACK1234F1Z5"
                    value={applyForm.gstin}
                    onChange={e => setApplyForm({...applyForm, gstin: e.target.value.toUpperCase()})}
                    className="w-full p-2.5 border rounded-xl bg-slate-50"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Contact Email</label>
                <input
                  type="email" required placeholder="procurement@company.com"
                  value={applyForm.contact_email}
                  onChange={e => setApplyForm({...applyForm, contact_email: e.target.value})}
                  className="w-full p-2.5 border rounded-xl bg-slate-50"
                />
              </div>
              <label className="flex items-center space-x-2 font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={applyForm.msme_registered}
                  onChange={e => setApplyForm({...applyForm, msme_registered: e.target.checked})}
                  className="rounded"
                />
                <span>We are MSME Registered (Udyam Certificate)</span>
              </label>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900">
                ⚠️ Your financial bid will be submitted separately in Envelope B and will remain encrypted until technical evaluation is complete.
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowApplyForm(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 text-xs">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-amber-500 text-slate-950 font-extrabold rounded-xl hover:bg-amber-400 shadow-sm text-xs flex items-center space-x-1.5">
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Application</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const EligibilityRow = ({ label, required, met, description }) => (
  <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
    {required ? (
      <CheckCircle2 className="w-5 h-5 text-emerald-500 min-w-[20px] mt-0.5" />
    ) : (
      <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center min-w-[20px] mt-0.5">
        <span className="text-slate-400 text-[10px] font-bold">~</span>
      </div>
    )}
    <div>
      <div className="text-xs font-extrabold text-slate-900 flex items-center space-x-2">
        <span>{label}</span>
        {required && <span className="text-[10px] text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded">Required</span>}
      </div>
      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{description}</p>
    </div>
  </div>
);

export default TenderPublicView;
