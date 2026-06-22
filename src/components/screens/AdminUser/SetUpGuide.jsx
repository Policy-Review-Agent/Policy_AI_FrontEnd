import React, { useState } from "react";
import {
  CheckCircle, Edit, TimerIcon, ArrowRight, Shield, Users, User,
  Save, X, Mail, FileText, Clock, RefreshCw, Key, Zap, Link,
  Globe, MapPin, Lock, Activity, AlertTriangle
} from "lucide-react";

const inputCls = "border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-[#6B55E8] focus:ring-2 focus:ring-[#6B55E8]/10 w-full bg-white placeholder:text-gray-300";
const labelCls = "flex items-center gap-1.5 text-[13px] font-semibold text-gray-800";
const hintCls  = "text-[11.5px] text-gray-400 mt-0.5";

// ─── Toggle component ────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${checked ? "bg-[#6B55E8]" : "bg-gray-200"}`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`}
    />
  </button>
);

// ─── Panel content components (use hooks freely here) ────────────────────────

const GraphAPIContent = () => {
  const [tenantId, setTenantId]   = useState("demo-tenant-id");
  const [clientId, setClientId]   = useState("");
  const [secret, setSecret]       = useState("");
  const [redirect, setRedirect]   = useState("file://");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className={labelCls}><Lock size={13} className="opacity-50" /> Tenant ID</label>
        <input className={inputCls} type="text" value={tenantId} onChange={e => setTenantId(e.target.value)} placeholder="demo-tenant-id" />
        <p className={hintCls}>Found in Azure Portal → Azure Active Directory → Overview</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={labelCls}><Key size={13} className="opacity-50" /> Client ID (App ID)</label>
        <input className={inputCls} type="text" value={clientId} onChange={e => setClientId(e.target.value)} placeholder="e.g. xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
        <p className={hintCls}>Found in Azure Portal → App registrations → your app → Application (client) ID</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={labelCls}><Shield size={13} className="opacity-50" /> Client Secret</label>
        <input className={inputCls} type="password" value={secret} onChange={e => setSecret(e.target.value)} placeholder="Paste your client secret value" />
        <p className={hintCls}>Create in Azure Portal → App registrations → Certificates &amp; secrets</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={labelCls}><Link size={13} className="opacity-50" /> Redirect URI</label>
        <input className={inputCls} type="url" value={redirect} onChange={e => setRedirect(e.target.value)} placeholder="https://yourapp.com/auth/callback" />
      </div>
    </div>
  );
};

const TenantContent = () => {
  const [domain, setDomain]     = useState("yourcompany.com");
  const [location, setLocation] = useState("new_york");
  const [allowed, setAllowed]   = useState("contoso.com");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className={labelCls}><Globe size={13} className="opacity-50" /> Tenant domain</label>
        <input className={inputCls} type="text" value={domain} onChange={e => setDomain(e.target.value)} placeholder="yourcompany.com" />
        <p className={hintCls}>Your primary Azure AD tenant domain name</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={labelCls}><MapPin size={13} className="opacity-50" /> Default office location</label>
        <select className={inputCls} value={location} onChange={e => setLocation(e.target.value)}>
          <option value="new_york">New York</option>
          <option value="london">London</option>
          <option value="sydney">Sydney</option>
          <option value="singapore">Singapore</option>
          <option value="dubai">Dubai</option>
        </select>
        <p className={hintCls}>New guests will be assigned this location by default</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={labelCls}><Users size={13} className="opacity-50" /> Allowed guest domains</label>
        <input className={inputCls} type="text" value={allowed} onChange={e => setAllowed(e.target.value)} placeholder="contoso.com, fabrikam.com" />
        <p className={hintCls}>Only users from these domains can be invited as guests (comma-separated)</p>
      </div>
    </div>
  );
};

const AdminContent = () => {
  const [primaryEmail, setPrimaryEmail]   = useState("prathap.r@paccore.com");
  const [additionalEmails, setAdditional] = useState("amy.chen@paccore.com");
  const [scope, setScope]                 = useState("company");

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-[12.5px] text-indigo-800 leading-relaxed">
        <strong>Note:</strong> At least one admin must be assigned. Admins can manage all guest users belonging to their company domain.
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={labelCls}><User size={13} className="opacity-50" /> Primary admin email</label>
        <input className={inputCls} type="email" value={primaryEmail} onChange={e => setPrimaryEmail(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={labelCls}><Users size={13} className="opacity-50" /> Additional admins</label>
        <textarea
          className={`${inputCls} resize-y min-h-[90px] font-sans`}
          value={additionalEmails}
          onChange={e => setAdditional(e.target.value)}
        />
        <p className={hintCls}>One email address per line</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={labelCls}><Shield size={13} className="opacity-50" /> Admin role scope</label>
        <select className={inputCls} value={scope} onChange={e => setScope(e.target.value)}>
          <option value="company">Company-wide (all offices)</option>
          <option value="single">Single office</option>
          <option value="dept">Department-level</option>
        </select>
      </div>
    </div>
  );
};

const EmailTemplatesContent = () => {
  const [subject, setSubject]   = useState("You're invited to join YourCompany's portal");
  const [body, setBody]         = useState("Hi {user_name},\n\nYou have been invited to access the {company_name} admin portal.\n\nClick the link below to accept your invitation:\n{invite_url}");
  const [expiry, setExpiry]     = useState("14");
  const [resend, setResend]     = useState("3");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className={labelCls}><Mail size={13} className="opacity-50" /> Invite email subject</label>
        <input className={inputCls} type="text" value={subject} onChange={e => setSubject(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={labelCls}><FileText size={13} className="opacity-50" /> Invite email body</label>
        <textarea
          className={`${inputCls} resize-y min-h-[160px] font-sans leading-relaxed`}
          value={body}
          onChange={e => setBody(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}><Clock size={13} className="opacity-50" /> Invite link expiry</label>
          <select className={inputCls} value={expiry} onChange={e => setExpiry(e.target.value)}>
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
            <option value="never">Never</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}><RefreshCw size={13} className="opacity-50" /> Auto-resend after</label>
          <select className={inputCls} value={resend} onChange={e => setResend(e.target.value)}>
            <option value="1">1 day</option>
            <option value="2">2 days</option>
            <option value="3">3 days</option>
            <option value="7">7 days</option>
            <option value="never">Never</option>
          </select>
        </div>
      </div>
    </div>
  );
};

const SSOContent = () => {
  const [ssoEnabled, setSsoEnabled]   = useState(true);
  const [mfaEnabled, setMfaEnabled]   = useState(false);
  const [redirectUri, setRedirectUri] = useState("file:///auth/callback");
  const [timeout, setTimeout_]        = useState("1h");

  return (
    <div className="flex flex-col gap-5">
      {/* Info box */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-[12.5px] text-indigo-800 leading-relaxed">
        <strong>Microsoft SSO (MSAL):</strong> Users sign in with their existing Microsoft / Azure AD work accounts. No separate password needed.
      </div>

      {/* Enable Microsoft SSO toggle row */}
      <div className="border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold text-gray-800">Enable Microsoft SSO</p>
          <p className="text-[11.5px] text-gray-400 mt-0.5">Allow users to sign in with their Microsoft work account</p>
        </div>
        <Toggle checked={ssoEnabled} onChange={setSsoEnabled} />
      </div>

      {/* Require MFA toggle row */}
      <div className="border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold text-gray-800">Require MFA</p>
          <p className="text-[11.5px] text-gray-400 mt-0.5">Users must complete multi-factor authentication on each sign-in</p>
        </div>
        <Toggle checked={mfaEnabled} onChange={setMfaEnabled} />
      </div>

      {/* SSO Redirect URI */}
      <div className="flex flex-col gap-1.5">
        <label className={labelCls}><Link size={13} className="opacity-50" /> SSO Redirect URI</label>
        <input className={inputCls} type="url" value={redirectUri} onChange={e => setRedirectUri(e.target.value)} />
      </div>

      {/* Session timeout */}
      <div className="flex flex-col gap-1.5">
        <label className={labelCls}><Clock size={13} className="opacity-50" /> Session timeout</label>
        <select className={inputCls} value={timeout} onChange={e => setTimeout_(e.target.value)}>
          <option value="30m">30 minutes</option>
          <option value="1h">1 hour</option>
          <option value="4h">4 hours</option>
          <option value="8h">8 hours</option>
          <option value="24h">24 hours</option>
        </select>
      </div>
    </div>
  );
};

const RateLimitContent = () => {
  const [perMin, setPerMin]         = useState(60);
  const [perDay, setPerDay]         = useState(5000);
  const [throttle, setThrottle]     = useState("block");
  const [alertOn, setAlertOn]       = useState(true);
  const [alertEmail, setAlertEmail] = useState("prathap.r@paccore.com");

  return (
    <div className="flex flex-col gap-5">
      {/* Two number inputs side by side */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}><Activity size={13} className="opacity-50" /> Max calls per minute</label>
          <input
            className={inputCls} type="number" min={1}
            value={perMin} onChange={e => setPerMin(e.target.value)}
          />
          <p className={hintCls}>Requests per user per minute</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}><Clock size={13} className="opacity-50" /> Max calls per day</label>
          <input
            className={inputCls} type="number" min={1}
            value={perDay} onChange={e => setPerDay(e.target.value)}
          />
          <p className={hintCls}>Requests per user per day</p>
        </div>
      </div>

      {/* Throttle action */}
      <div className="flex flex-col gap-1.5">
        <label className={labelCls}><AlertTriangle size={13} className="opacity-50" /> Throttle action</label>
        <select className={inputCls} value={throttle} onChange={e => setThrottle(e.target.value)}>
          <option value="block">Block request (429 Too Many Requests)</option>
          <option value="queue">Queue and retry</option>
          <option value="throttle">Throttle (slow response)</option>
        </select>
      </div>

      {/* Alert on threshold breach toggle row */}
      <div className="border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold text-gray-800">Alert on threshold breach</p>
          <p className="text-[11.5px] text-gray-400 mt-0.5">Email admin when a user hits 80% of their daily limit</p>
        </div>
        <Toggle checked={alertOn} onChange={setAlertOn} />
      </div>

      {/* Alert email */}
      <div className="flex flex-col gap-1.5">
        <label className={labelCls}><Mail size={13} className="opacity-50" /> Alert email address</label>
        <input
          className={inputCls} type="email"
          value={alertEmail} onChange={e => setAlertEmail(e.target.value)}
        />
      </div>
    </div>
  );
};

// ─── Panel config map ────────────────────────────────────────────────────────
const panelConfigs = {
  graph: {
    title: "Connect Graph API",
    subtitle: "Authenticate with Microsoft Graph API for guest user management.",
    iconBg: "bg-indigo-50",
    icon: <Key size={20} className="text-[#6B55E8]" />,
    saveLabel: "Save changes",
    footerNote: "You will need Global Admin or Application Admin role in Azure.",
    Content: GraphAPIContent,
  },
  tenant: {
    title: "Configure tenant domain",
    subtitle: "Set your tenant domain and default office for new invites.",
    iconBg: "bg-blue-50",
    icon: <Globe size={20} className="text-blue-500" />,
    saveLabel: "Save changes",
    footerNote: "You can add multiple domains separated by commas.",
    Content: TenantContent,
  },
  admin: {
    title: "Assign admin roles",
    subtitle: "Designate at least one company admin with full rights.",
    iconBg: "bg-green-50",
    icon: <Shield size={20} className="text-green-500" />,
    saveLabel: "Save changes",
    footerNote: "Changes take effect immediately after saving.",
    Content: AdminContent,
  },
  emailTemplates: {
    title: "Set up email templates",
    subtitle: "Customise invite and welcome emails sent to new users.",
    iconBg: "bg-amber-50",
    icon: <Mail size={20} className="text-amber-500" />,
    saveLabel: "Save & Mark complete",
    footerNote: "Variables: {user_name}, {invite_url}, {company_name}, {location}",
    Content: EmailTemplatesContent,
  },
  sso: {
    title: "Enable SSO",
    subtitle: "Configure single sign-on via Azure AD for seamless login.",
    iconBg: "bg-indigo-50",
    icon: <Lock size={20} className="text-[#6B55E8]" />,
    saveLabel: "Save & Mark complete",
    footerNote: "SSO requires Azure AD Premium P1 or above.",
    Content: SSOContent,
  },
  rateLimit: {
    title: "API rate-limit policy",
    subtitle: "Define per-user API call quotas and throttling rules.",
    iconBg: "bg-red-50",
    icon: <Activity size={20} className="text-red-500" />,
    saveLabel: "Save & Mark complete",
    footerNote: "Limits apply per user per rolling time window.",
    Content: RateLimitContent,
  },
};

// ─── SlidePanel ──────────────────────────────────────────────────────────────
const SlidePanel = ({ panelKey, onClose }) => {
  const config = panelConfigs[panelKey];
  if (!config) return null;
  const { Content } = config;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-[480px] max-w-full bg-white z-50 flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-start gap-3 px-5 py-3 border-b border-gray-100 flex-shrink-0">
          <div className={`w-11 h-10 rounded-xl ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
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
        <div className="flex-1 overflow-y-auto px-5 py-3">
          <Content />
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-end gap-3 flex-shrink-0">
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

// ─── Steps config ────────────────────────────────────────────────────────────
const steps = [
  { key: "graph",          title: "Connect Graph API",       desc: "Authenticate with Microsoft Graph API for guest user management.", done: true },
  { key: "tenant",         title: "Configure tenant domain", desc: "Set your tenant domain for guest access scoping.",                  done: true },
  { key: "admin",          title: "Assign admin roles",      desc: "Designate at least one company admin with full rights.",            done: true },
  { key: "emailTemplates", title: "Set up email templates",  desc: "Customise invite and welcome emails sent to new users.",            done: false },
  { key: "sso",            title: "Enable SSO",              desc: "Configure single sign-on for your organisation.",                   done: false },
  { key: "rateLimit",      title: "API rate-limit policy",   desc: "Define per-user API limits for your tenant.",                       done: false },
];

// ─── Main ────────────────────────────────────────────────────────────────────
const SetupGuide = () => {
  const [activePanel, setActivePanel] = useState(null);
  const completed = steps.filter((s) => s.done).length;
  const progress  = Math.round((completed / steps.length) * 100);

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

      {/* Step rows */}
      {steps.map((step, i) => (
        <div
          key={i}
          className={`bg-white border border-l-4 ${step.done ? "border-l-green-400" : "border-l-gray-200"} border-gray-200 rounded-xl px-4 py-3 shadow-sm flex items-center gap-3`}
        >
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${step.done ? "bg-green-50" : "bg-gray-100"}`}>
            {step.done
              ? <CheckCircle size={18} className="text-green-500" />
              : <TimerIcon   size={18} className="text-gray-300" />}
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