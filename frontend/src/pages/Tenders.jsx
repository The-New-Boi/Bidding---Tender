import React, { useState, useEffect } from 'react';
import { getTenders, createTender } from '../api/client';
import { Sparkles, Search, SlidersHorizontal, Plus, FileText } from 'lucide-react';

const Tenders = ({ onSelectTender }) => {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [formData, setFormData] = useState({
    tender_number: `TENDER-${new Date().getFullYear()}-CPCL-${Math.floor(100 + Math.random() * 900)}`,
    title: '',
    description: '',
    department: 'CPCL Chennai Refinery',
    budget: 5000000,
    category: 'Instrumentation & Controls',
    selection_mode: 'ai_ranked',
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

  const filteredTenders = tenders.filter(t => {
    const titleMatch = (t.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (t.tender_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (t.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatch = selectedCategory === 'all' || t.category === selectedCategory;
    return titleMatch && categoryMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tenders Pipeline & Evaluation Workstation</h1>
          <p className="text-xs text-slate-500 mt-1">Manage active tender lifecycle, 2-envelope eligibility filters & AI composite ranking</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-md shadow-amber-500/20 text-sm transition-all flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Tender</span>
        </button>
      </div>

      {/* AI SEMANTIC SEARCH BAR & QUICK FILTERS */}
      <div className="bg-slate-950 text-white p-5 rounded-2xl shadow-xl space-y-3 border border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-400">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI Semantic Natural Language Search</span>
          </div>
          <span className="text-[10px] text-slate-400">CPCL Neural Index v10X</span>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search tenders e.g. 'Instrumentation valves', 'MSME preferred tenders', or 'Refinery Unit 4'..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold text-[11px]">Quick Prompts:</span>
          {['Instrumentation & Controls', 'MSME Exemption', 'Refinery Maintenance', 'High Budget (>50L)'].map((tag, idx) => (
            <button
              key={idx}
              onClick={() => setSearchQuery(tag === 'High Budget (>50L)' ? 'CPCL' : tag)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Tenders Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 font-medium">Loading active tenders...</div>
      ) : filteredTenders.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300">
          <p className="text-slate-500 font-medium">No tenders found matching your query.</p>
          <button onClick={() => setSearchQuery('')} className="mt-4 text-amber-600 font-bold text-sm hover:underline">
            Clear Search Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTenders.map((tender) => (
            <div
              key={tender.id}
              onClick={() => onSelectTender(tender.id)}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold bg-slate-900 text-amber-400 px-2.5 py-1 rounded-md">
                    {tender.tender_number}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    tender.status === 'open' ? 'bg-blue-100 text-blue-800' :
                    tender.status === 'evaluation' ? 'bg-amber-100 text-amber-800' :
                    tender.status === 'awarded' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {tender.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors text-base line-clamp-2">
                    {tender.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{tender.description}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Estimated Budget:</span>
                  <span className="font-black text-slate-900">₹{(tender.budget / 100000).toFixed(1)} Lakhs</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Mode:</span>
                  <span className="font-bold text-purple-700 capitalize">
                    {tender.selection_mode === 'fair_draw' ? '🎲 Fair Trade Draw' : '⚡ AI Ranked'}
                  </span>
                </div>
                <div className="pt-2 flex items-center justify-between text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
                  <span>Open Evaluation Workstation →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE TENDER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-xl">Create New Procurement Tender</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tender Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Supply of High-Pressure Gas Valves"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description / Scope of Work</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Detailed specifications and refinery unit requirements..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 border rounded-xl bg-slate-50"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Estimated Budget (₹ INR)</label>
                  <input
                    type="number"
                    required
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full p-2.5 border rounded-xl bg-slate-50 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Selection Strategy</label>
                  <select
                    value={formData.selection_mode}
                    onChange={(e) => setFormData({ ...formData, selection_mode: e.target.value })}
                    className="w-full p-2.5 border rounded-xl bg-slate-50 font-bold"
                  >
                    <option value="ai_ranked">⚡ AI Ranked Evaluation</option>
                    <option value="fair_draw">🎲 Anti-Corruption Fair Draw</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl hover:bg-amber-400 shadow shadow-amber-500/20"
                >
                  {submitting ? 'Creating...' : 'Publish Tender'}
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
