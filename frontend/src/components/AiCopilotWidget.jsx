import React, { useState } from 'react';
import { Sparkles, Bot, X, Send, ShieldAlert, FileText, TrendingDown, CheckCircle2, AlertTriangle } from 'lucide-react';

const AiCopilotWidget = ({ currentTenderId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'ai',
      text: 'Namaste Ananya! Main Aapka GeM 10X AI Procurement Copilot hoon. Aap is tender ke bare me kya poochna chahte hain?'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');

  const quickPrompts = [
    { label: '🛡️ Anti-Cartel Audit', query: 'Is tender me koi bid-rigging ya cartelization risk hai kya?' },
    { label: '📜 Qualification Rules', query: 'Summarize local content and MSME exemption requirements.' },
    { label: '💰 Price Discovery', query: 'Suggest optimal L1 bidding strategy for vendor guidance.' }
  ];

  const handleSendQuery = (textToSend) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    // Add User Message
    const updatedMessages = [...chatMessages, { sender: 'user', text: query }];
    setChatMessages(updatedMessages);
    setInputQuery('');

    // Simulate AI Response
    setTimeout(() => {
      let reply = '';
      if (query.includes('cartel') || query.includes('rigging') || query.includes('Anti-Cartel')) {
        reply = '✅ **AI Anti-Corruption Scan Complete**:\n- Total 5 Registered Bidders verified.\n- Unique IP Addresses & GST Registrations confirmed.\n- No price-collusion pattern found. Cartel Risk Score: 0.2% (Low/Safe).';
      } else if (query.includes('local content') || query.includes('MSME') || query.includes('Qualification')) {
        reply = '📋 **Rule Summary**:\n- Min Local Content: **40%** mandatory under Make in India policy.\n- MSME vendors get EMD exemption and 15% price preference allowance.\n- OEM Authorization certificate required.';
      } else if (query.includes('price') || query.includes('Price Discovery') || query.includes('L1')) {
        reply = '💰 **AI Price Trend Analysis**:\n- Estimated Budget: ₹55.0 Lakhs\n- Recommended Bid Range: ₹46.5L - ₹51.2L based on last 3 refinery instrumentation procurement awards.';
      } else {
        reply = `🤖 **Copilot Insight**: Processing query regarding "${query}". All eligibility criteria, bidder documents, and financial envelopes are cryptographically verified in compliance with CVC Guidelines 2026.`;
      }

      setChatMessages(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 600);
  };

  return (
    <>
      {/* FLOATING TRIGGER BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-5 py-3.5 rounded-2xl shadow-2xl shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all font-black flex items-center space-x-2.5 border border-amber-300/40"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-950"></span>
            </span>
          </div>
          <span className="text-sm tracking-tight">CPCL AI 10X Copilot</span>
        </button>
      )}

      {/* CHAT/COPILOT DRAWER PANEL */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-md bg-slate-950 text-white rounded-3xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[600px]">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white flex items-center space-x-1.5">
                  <span>CPCL AI Copilot</span>
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.5 rounded font-bold border border-amber-500/30">v10X</span>
                </h3>
                <p className="text-[11px] text-slate-400">Anti-Corruption & Tender Intelligence</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Tab Selectors */}
          <div className="grid grid-cols-3 bg-slate-900 border-b border-slate-800 text-[11px] font-bold">
            <button
              onClick={() => setActiveTab('summary')}
              className={`py-2.5 border-b-2 text-center transition-all ${
                activeTab === 'summary' ? 'border-amber-400 text-amber-400 bg-slate-800/50' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              📋 Rules Summary
            </button>
            <button
              onClick={() => setActiveTab('cartel')}
              className={`py-2.5 border-b-2 text-center transition-all ${
                activeTab === 'cartel' ? 'border-purple-400 text-purple-400 bg-slate-800/50' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              🛡️ Anti-Cartel Scan
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-2.5 border-b-2 text-center transition-all ${
                activeTab === 'chat' ? 'border-blue-400 text-blue-400 bg-slate-800/50' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              💬 AI Assistant
            </button>
          </div>

          {/* Body Content depending on Tab */}
          <div className="p-4 flex-1 overflow-y-auto space-y-3 min-h-[300px]">
            {activeTab === 'summary' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                  <div className="font-bold text-amber-400 flex items-center space-x-1.5">
                    <FileText className="w-4 h-4" />
                    <span>Key Qualification Rules</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-300 list-disc pl-4 text-[11px]">
                    <li>Minimum Local Content requirement: <strong className="text-white">40%</strong></li>
                    <li>MSME Certificate registration mandatory for fee exemption.</li>
                    <li>OEM Authorization letter required for instrumentation valves.</li>
                    <li>Financial Bids remain <strong className="text-amber-300">SEALED</strong> until Tech Evaluation clearance.</li>
                  </ul>
                </div>

                <div className="p-3 bg-emerald-950/40 rounded-2xl border border-emerald-800/50 text-emerald-300 space-y-1 text-[11px]">
                  <div className="font-bold flex items-center space-x-1.5 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>CVC Compliance Verified</span>
                  </div>
                  <p>All automated checks adhere to Central Vigilance Commission Procurement Guidelines 2026.</p>
                </div>
              </div>
            )}

            {activeTab === 'cartel' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-purple-950/40 rounded-2xl border border-purple-800/50 space-y-2">
                  <div className="font-bold text-purple-300 flex items-center space-x-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Cartel & Bid Rigging Detector</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-slate-900 p-2 rounded-xl">
                      <div className="text-slate-400">IP Pattern Anomalies</div>
                      <div className="font-extrabold text-emerald-400 text-sm">0 Detected</div>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-xl">
                      <div className="text-slate-400">Shared GST / Directors</div>
                      <div className="font-extrabold text-emerald-400 text-sm">Clean Graph</div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400">AI monitors submit timestamps and pricing variance to prevent cartel formation.</p>
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="space-y-3 text-xs">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`p-3 rounded-2xl max-w-[85%] whitespace-pre-line text-[11px] leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-amber-500 text-slate-950 font-semibold rounded-br-none'
                          : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Action Chips & Input Box */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-2">
            <div className="flex space-x-1.5 overflow-x-auto pb-1 text-[10px] no-scrollbar">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveTab('chat');
                    handleSendQuery(qp.query);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full whitespace-nowrap border border-slate-700 transition-colors"
                >
                  {qp.label}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Ask AI Copilot about this tender..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={() => handleSendQuery()}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 p-2 rounded-xl shadow font-bold transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      )}
    </>
  );
};

export default AiCopilotWidget;
