import React, { useState, useEffect } from 'react';
import { getTenders, createTender } from '../api/client';

const Tenders = ({ onSelectTender }) => {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    tender_number: `TENDER-${new Date().getFullYear()}-CPCL-${Math.floor(100 + Math.random() * 900)}`,
    title: '',
    description: '',
    department: 'CPCL Chennai Refinery',
    budget: 5000000,
    category: 'Instrumentation & Controls',
    selection_mode: 'ai_ranked', // 'ai_ranked' or 'fair_draw'
    require_msme: true,
    min_local_content: 50,
    require_oem: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchTendersList = async () => {
    setLoading(true);
    try {
      const data = await getTenders();
      setTenders(data);
    } catch (err) {
      console.error('Error fetching tenders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTendersList();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        tender_number: formData.tender_number,
        title: formData.title,
        description: formData.description,
        department: formData.department,
        budget: parseFloat(formData.budget),
        category: formData.category,
        selection_mode: formData.selection_mode,
        eligibility_criteria: {
          require_msme: formData.require_msme,
          min_local_content: parseInt(formData.min_local_content),
          require_oem: formData.require_oem,
          max_bid_amount: parseFloat(formData.budget) * 1.1
        }
      };
      await createTender(payload);
      setShowModal(false);
      fetchTendersList();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create tender');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tenders Pipeline & Evaluation</h1>
          <p className="text-sm text-slate-500 mt-1">Manage active tender lifecycle, eligibility filters & AI selection</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-md shadow-amber-500/20 text-sm transition-all flex items-center justify-center space-x-2"
        >
          <span>+ Create New Tender</span>
        </button>
      </div>

      {/* Tenders Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 font-medium">Loading active tenders...</div>
      ) : tenders.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300">
          <p className="text-slate-500 font-medium">No tenders created yet.</p>
          <button onClick={() => setShowModal(true)} className="mt-4 text-amber-600 font-bold text-sm hover:underline">
            Click here to create the first tender
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenders.map((tender) => (
            <div
              key={tender.id}
              onClick={() => onSelectTender(tender.id)}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                    {tender.tender_number}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full capitalize ${
                    tender.status === 'open' ? 'bg-blue-100 text-blue-800' :
                    tender.status === 'evaluation' ? 'bg-amber-100 text-amber-800' :
                    tender.status === 'awarded' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {tender.status}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2">
                  {tender.title}
                </h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">{tender.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Budget:</span>
                  <span className="font-bold text-slate-900">₹{(tender.budget / 100000).toFixed(1)} Lakhs</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Registered Bidders:</span>
                  <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                    {tender.bidders_count || 0} Companies
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Selection Mode:</span>
                  <span className={`font-semibold px-2 py-0.5 rounded-md ${
                    tender.selection_mode === 'fair_draw' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {tender.selection_mode === 'fair_draw' ? '🎲 Fair Draw Lottery' : '⚡ AI Ranked Score'}
                  </span>
                </div>

                <div className="pt-2">
                  <button className="w-full bg-slate-900 text-white font-semibold text-xs py-2 rounded-lg group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                    Open Pipeline Workstation →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Create New Tender Notice</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tender Reference ID</label>
                <input
                  type="text"
                  required
                  value={formData.tender_number}
                  onChange={(e) => setFormData({...formData, tender_number: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tender Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Supply of High-Pressure Piping Valves"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description & Scope</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Technical specifications..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Budget (INR ₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Eligibility Conditions & Anti-Corruption Settings</h4>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <label className="flex items-center space-x-2 border p-2.5 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.require_msme}
                      onChange={(e) => setFormData({...formData, require_msme: e.target.checked})}
                      className="rounded text-amber-500 focus:ring-amber-500"
                    />
                    <span className="font-medium text-slate-700">Require MSME Registration</span>
                  </label>
                  <label className="flex items-center space-x-2 border p-2.5 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.require_oem}
                      onChange={(e) => setFormData({...formData, require_oem: e.target.checked})}
                      className="rounded text-amber-500 focus:ring-amber-500"
                    />
                    <span className="font-medium text-slate-700">Require OEM Authorization</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min Make-in-India Local Content %</label>
                  <input
                    type="number"
                    value={formData.min_local_content}
                    onChange={(e) => setFormData({...formData, min_local_content: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Winner Selection Mode</label>
                  <select
                    value={formData.selection_mode}
                    onChange={(e) => setFormData({...formData, selection_mode: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold"
                  >
                    <option value="ai_ranked">⚡ AI Ranked Evaluation (Highest total score wins)</option>
                    <option value="fair_draw">🎲 Anti-Corruption Fair Draw (Random draw among top qualified)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2 rounded-lg text-sm shadow-md"
                >
                  {submitting ? 'Publishing...' : 'Publish Tender Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Tenders;
