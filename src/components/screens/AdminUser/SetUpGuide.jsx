import React, { useState } from "react";
import {
  CheckCircle, Edit, TimerIcon, ArrowRight, Shield, Users, User,
  Save, X, Mail, FileText, Clock, RefreshCw, Key, Zap
} from "lucide-react";

const inputCls = "border border-gray-300 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#6B55E8] focus:ring-2 focus:ring-[#6B55E8]/10 w-full bg-white";

const panelConfigs = {
  graph: {
    title: "Connect Graph API",
    subtitle: "Authenticate with Microsoft Graph API for guest user management.",
    iconColor: "text-[#6B55E8]",
    iconBg: "bg-indigo-50",
    icon: <Key size={20} className="text-[#6B55E8]" />,
    saveLabel: "Save changes",
    content: (
      <div className="flex flex-col gap-5">
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-[12.5px] text-indigo-800 leading-relaxed">
          <strong>Note:</strong> You'll need an Azure AD app registration with the required permissions to connect.
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-gray-700">Tenant ID</label>
          <input className={inputCls} type="text" defaultValue="a1b2c3d4-e5f6-7890-abcd-ef1234567890" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-gray-700">Client ID</label>
          <input className={inputCls} type="text" placeholder="Enter your Azure app client ID" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-gray-700">Client secret</label>
          <input className={inputCls} type="password" placeholder="••••••••••••••••" />
          <span className="text-[11px] text-gray-400">Stored encrypted — never displayed again after saving.</span>
        </div>
      </div>
    ),
  },

  tenant: {
    title: "Configure tenant domain",
    subtitle: "Set your tenant domain for guest access scoping.",
    iconColor: "text-green-500",
    iconBg: "bg-green-50",
    icon: <Shield size={20} className="text-green-500" />,
    saveLabel: "Save changes",
    content: (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-gray-700">Primary domain</label>
          <input className={inputCls} type="text" defaultValue="paccore.com" />
          <span className="text-[11px] text-gray-400">Used to scope guest user access.</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-gray-700">Additional domains</label>
          <textarea className={`${inputCls} resize-y min-h-[72px] font-sans`} defaultValue="paccore.io" />
          <span className="text-[11px] text-gray-400">One domain per line</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-gray-700">Display name</label>
          <input className={inputCls} type="text" defaultValue="Paccore" />
        </div>
      </div>
    ),
  },

  admin: {
    title: "Assign admin roles",
    subtitle: "Designate at least one company admin with full rights.",
    iconColor: "text-green-500",
    iconBg: "bg-green-50",
    icon: <Shield size={20} className="text-green-500" />,
    saveLabel: "Save changes",
    content: (
      <div className="flex flex-col gap-5">
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-[12.5px] text-indigo-800 leading-relaxed">
          <strong>Note:</strong> At least one admin must be assigned. Admins can manage all guest users belonging to their company domain.
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 text-[13px] font-medium text-gray-700">
            <User size={13} className="opacity-50" /> Primary admin email
          </label>
          <input className={inputCls} type="email" defaultValue="prathap.r@paccore.com" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 text-[13px] font-medium text-gray-700">
            <Users size={13} className="opacity-50" /> Additional admins
          </label>
          <textarea className={`${inputCls} resize-y min-h-[90px] font-sans`} defaultValue="amy.chen@paccore.com" />
          <span className="text-[11px] text-gray-400">One email address per line</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 text-[13px] font-medium text-gray-700">
            <Shield size={13} className="opacity-50" /> Admin role scope
          </label>
          <select className={inputCls}>
            <option>Company-wide (all offices)</option>
            <option>Single office</option>
            <option>Department-level</option>
          </select>
        </div>
      </div>
    ),
  },

  emailTemplates: {
    title: "Set up email templates",
    subtitle: "Customise invite and welcome emails sent to new users.",
    iconColor: "text-amber-500",
    iconBg: "bg-amber-50",
    icon: <Mail size={20} className="text-amber-500" />,
    saveLabel: "Save & Mark complete",

    content: (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 text-[13px] font-medium text-gray-700">
            <Mail size={13} className="opacity-50" /> Invite email subject
          </label>
          <input
            className={inputCls}
            type="text"
            defaultValue="You're invited to join YourCompany's portal"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 text-[13px] font-medium text-gray-700">
            <FileText size={13} className="opacity-50" /> Invite email body
          </label>
          <textarea
            className={`${inputCls} resize-y min-h-[160px] font-sans leading-relaxed`}
            defaultValue={`Hi {user_name},\n\nYou have been invited to access the {company_name} admin portal.\n\nClick the link below to accept your invitation:\n{invite_url}`}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-[13px] font-medium text-gray-700">
              <Clock size={13} className="opacity-50" /> Invite link expiry
            </label>
            <select className={inputCls}>
              <option>7 days</option>
              <option selected>14 days</option>
              <option>30 days</option>
              <option>Never</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-[13px] font-medium text-gray-700">
              <RefreshCw size={13} className="opacity-50" /> Auto-resend after
            </label>
            <select className={inputCls}>
              <option>1 day</option>
              <option>2 days</option>
              <option selected>3 days</option>
              <option>7 days</option>
              <option>Never</option>
            </select>
          </div>
        </div>
      </div>
    ),
  },

  sso: {
    title: "Enable SSO",
    subtitle: "Configure single sign-on for your organisation.",
    iconColor: "text-[#6B55E8]",
    iconBg: "bg-indigo-50",
    icon: <Key size={20} className="text-[#6B55E8]" />,
    saveLabel: "Save & Mark complete",

    content: (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-gray-700">SSO provider</label>
          <select className={inputCls}>
            <option>Azure Active Directory</option>
            <option>Okta</option>
            <option>Google Workspace</option>
            <option>Custom SAML</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-gray-700">Metadata URL</label>
          <input className={inputCls} type="url" placeholder="https://login.microsoftonline.com/…/federationmetadata" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-gray-700">Entity ID</label>
          <input className={inputCls} type="text" placeholder="urn:your-app:saml" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="sso-force" className="w-4 h-4 accent-[#6B55E8]" />
          <label htmlFor="sso-force" className="text-[13px] text-gray-700">Force SSO for all users (disable password login)</label>
        </div>
      </div>
    ),
  },

  rateLimit: {
    title: "API rate-limit policy",
    subtitle: "Define per-user API limits for your tenant.",
    iconColor: "text-[#6B55E8]",
    iconBg: "bg-indigo-50",
    icon: <Zap size={20} className="text-[#6B55E8]" />,
    saveLabel: "Save & Mark complete",

    content: (
      <div className="flex flex-col gap-5">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[12.5px] text-amber-800 leading-relaxed">
          <strong>Note:</strong> Rate limits apply per user token. Exceeding limits returns HTTP 429.
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-gray-700">Requests per minute</label>
          <input className={inputCls} type="number" defaultValue="60" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-gray-700">Requests per day</label>
          <input className={inputCls} type="number" defaultValue="10000" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-gray-700">Throttle behaviour</label>
          <select className={inputCls}>
            <option>Queue and retry</option>
            <option>Reject immediately</option>
          </select>
        </div>
      </div>
    ),
  },
};

const SlidePanel = ({ panelKey, onClose }) => {
  const config = panelConfigs[panelKey];
  if (!config) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-[460px] max-w-full bg-white z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-start gap-3 px-5 py-5 border-b border-gray-100">
          <div className={`w-11 h-11 rounded-xl ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
            {config.icon}
          </div>
          <div className="flex-1">
            <p className="text-[16px] font-bold text-gray-900">{config.title}</p>
            <p className="text-[12.5px] text-gray-500 mt-0.5">{config.subtitle}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {config.content}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={onClose}
              className="border border-gray-200 rounded-lg px-4 py-2 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button className="flex items-center gap-1.5 bg-[#6B55E8] hover:bg-[#5a45d4] text-white rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors">
              <Save size={13} />
              {config.saveLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const steps = [
  { key: "graph",          title: "Connect Graph API",        desc: "Authenticate with Microsoft Graph API for guest user management.", done: true },
  { key: "tenant",         title: "Configure tenant domain",  desc: "Set your tenant domain for guest access scoping.",                  done: true },
  { key: "admin",          title: "Assign admin roles",       desc: "Designate at least one company admin with full rights.",            done: true },
  { key: "emailTemplates", title: "Set up email templates",   desc: "Customise invite and welcome emails sent to new users.",            done: false },
  { key: "sso",            title: "Enable SSO",               desc: "Configure single sign-on for your organisation.",                   done: false },
  { key: "rateLimit",      title: "API rate-limit policy",    desc: "Define per-user API limits for your tenant.",                       done: false },
];

const SetupGuide = () => {
  const [activePanel, setActivePanel] = useState(null);
  const completed = steps.filter((s) => s.done).length;
  const progress = Math.round((completed / steps.length) * 100);

  return (
    <div className="p-3 flex flex-col gap-2 relative">
      {/* Progress */}
      <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
        <div className="flex justify-between items-center mb-1.5">
          <p className="text-[13px] font-semibold text-gray-900">Setup progress</p>
          <span className="text-[13px] text-gray-500">{progress}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg, #8B7FF5, #6B55E8)" }}
          />
        </div>
        <p className="text-[11px] text-gray-500 mt-1">{completed} of {steps.length} steps complete</p>
      </div>

      {/* Steps */}
      {steps.map((step, i) => (
        <div
          key={i}
          className={`bg-white border border-l-4 ${step.done ? "border-l-green-400" : "border-l-gray-200"} border-gray-200 rounded-xl px-4 py-3 shadow-sm flex items-center gap-3`}
        >
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${step.done ? "bg-green-50" : "bg-gray-100"}`}>
            {step.done
              ? <CheckCircle size={18} className="text-green-500" />
              : <TimerIcon size={18} className="text-gray-300" />}
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-gray-900">{step.title}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{step.desc}</p>
          </div>
          {step.done ? (
            <button
              onClick={() => setActivePanel(step.key)}
              className="flex items-center gap-1 border border-green-200 hover:border-green-300 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-green-600 hover:bg-green-50 transition-colors"
            >
              <Edit size={11} /> Edit
            </button>
          ) : (
            <button
              onClick={() => setActivePanel(step.key)}
              className="flex items-center gap-1 border border-[#6B55E8] hover:bg-indigo-50 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-[#6B55E8] transition-colors"
            >
              Configure <ArrowRight size={11} />
            </button>
          )}
        </div>
      ))}

      {/* Slide Panel */}
      {activePanel && <SlidePanel panelKey={activePanel} onClose={() => setActivePanel(null)} />}
    </div>
  );
};

export default SetupGuide;