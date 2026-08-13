import React, { useState } from "react";
import { BookOpen, ShieldCheck, Stethoscope, Tractor, CheckCircle2, FileText, ArrowRight, Download, Sparkles, HelpCircle, UserCheck, Activity, Award } from "lucide-react";
import { useAuthContext } from "../context/AuthContext";
import "../styles/HelpDocumentation.css";

export default function HelpDocumentation() {
  const { activeRole, user } = useAuthContext();
  const currentRole = activeRole || user?.role || 'authority';

  // Default tab corresponds to current active role
  const [activeGuideTab, setActiveGuideTab] = useState<'farmer' | 'vet' | 'authority'>(
    currentRole === 'farmer' ? 'farmer' : currentRole === 'vet' ? 'vet' : 'authority'
  );

  return (
    <div className="help-doc-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-left-title">
          <div className="title-icon-badge neu-btn">
            <BookOpen size={26} color="#c084fc" />
          </div>
          <div>
            <h1 className="page-title">Help & System Documentation</h1>
            <p className="page-subtitle">Comprehensive role-separated operating manuals and system guides</p>
          </div>
        </div>

        {/* Role Selector Tabs */}
        <div className="doc-tabs-container neu-card">
          <button
            type="button"
            className={`doc-tab-btn ${activeGuideTab === 'farmer' ? 'active' : ''}`}
            onClick={() => setActiveGuideTab('farmer')}
          >
            <Tractor size={16} />
            <span>🌾 Farmer Manual</span>
          </button>

          <button
            type="button"
            className={`doc-tab-btn ${activeGuideTab === 'vet' ? 'active' : ''}`}
            onClick={() => setActiveGuideTab('vet')}
          >
            <Stethoscope size={16} />
            <span>🩺 Veterinarian Manual</span>
          </button>

          <button
            type="button"
            className={`doc-tab-btn ${activeGuideTab === 'authority' ? 'active' : ''}`}
            onClick={() => setActiveGuideTab('authority')}
          >
            <ShieldCheck size={16} />
            <span>🛡️ Admin Authority Manual</span>
          </button>
        </div>
      </div>

      {/* ====================================================
          TAB 1: FARMER DOCUMENTATION GUIDE
          ==================================================== */}
      {activeGuideTab === 'farmer' && (
        <div className="guide-content-section neu-card fade-in">
          <div className="guide-hero-banner farmer-theme">
            <div className="hero-text">
              <span className="role-tag">🌾 FARMER OPERATING MANUAL</span>
              <h2>Farm Verification, Herd Safety & Treatment Withdrawal Guide</h2>
              <p>Everything you need to manage your dairy & livestock farm registration, track withdrawal periods, and ensure food safety compliance.</p>
            </div>
            <Sparkles size={48} className="hero-sparkle" />
          </div>

          <div className="doc-grid-3">
            {/* Step 1: Self Verification */}
            <div className="doc-card neu-card">
              <div className="card-header-icon">
                <UserCheck size={24} color="#10b981" />
                <div className="step-num-well neu-inset">
                  <span className="step-num">01</span>
                </div>
              </div>
              <h3>Farm Self-Verification Stepper</h3>
              <p>New farmers must complete the 4-step verification wizard to register their farm with district authorities:</p>
              <ul className="doc-list">
                <li><strong>Step 1: Contact Info</strong> — Enter owner full name, phone number, and location.</li>
                <li><strong>Step 2: Farm Details</strong> — Registered farm name, total livestock count, and primary species (Cattle, Buffalo, Goat).</li>
                <li><strong>Step 3: Document Uploads</strong> — Upload Aadhaar card, 7/12 land record, and farm certificate.</li>
                <li><strong>Step 4: Review & Submit</strong> — Confirm information and submit for District Admin review.</li>
              </ul>
            </div>

            {/* Step 2: Withdrawal Tracking */}
            <div className="doc-card neu-card">
              <div className="card-header-icon">
                <Activity size={24} color="#fbbf24" />
                <div className="step-num-well neu-inset">
                  <span className="step-num">02</span>
                </div>
              </div>
              <h3>Withdrawal Period & Food Safety</h3>
              <p>Protect milk and meat from antibiotic residues during treatment cycles:</p>
              <ul className="doc-list">
                <li><strong>Active Treatments</strong> — Monitor remaining withdrawal days for treated animals.</li>
                <li><strong>Milk/Meat Safety</strong> — Never sell or distribute produce while an animal is under active drug withdrawal.</li>
                <li><strong>Prescription Alerts</strong> — Check prescribed dosage and duration logged by your assigned vet.</li>
              </ul>
            </div>

            {/* Step 3: Reports & Exports */}
            <div className="doc-card neu-card">
              <div className="card-header-icon">
                <FileText size={24} color="#c084fc" />
                <div className="step-num-well neu-inset">
                  <span className="step-num">03</span>
                </div>
              </div>
              <h3>Reports & Records Export</h3>
              <p>Generate certified farm compliance documentation for dairy cooperatives and government audits:</p>
              <ul className="doc-list">
                <li><strong>Treatment History</strong> — View historical medical logs per animal tag.</li>
                <li><strong>PDF / CSV Exports</strong> — Download certified compliance summaries with one click.</li>
              </ul>
            </div>
          </div>

          {/* Footer Branding */}
          <footer className="doc-tab-footer">
            <p>Designed, Developed by Akash Mishra.</p>
          </footer>
        </div>
      )}

      {/* ====================================================
          TAB 2: VETERINARIAN DOCUMENTATION GUIDE
          ==================================================== */}
      {activeGuideTab === 'vet' && (
        <div className="guide-content-section neu-card fade-in">
          <div className="guide-hero-banner vet-theme">
            <div className="hero-text">
              <span className="role-tag">🩺 VETERINARIAN OPERATING MANUAL</span>
              <h2>State License Verification & Clinical Treatment Administration</h2>
              <p>Guide for licensed veterinary practitioners to manage state medical council credentials, prescribe antimicrobials, and supervise regional livestock health.</p>
            </div>
            <Sparkles size={48} className="hero-sparkle" />
          </div>

          <div className="doc-grid-3">
            {/* Step 1: License Verification */}
            <div className="doc-card neu-card">
              <div className="card-header-icon">
                <Award size={24} color="#8b5cf6" />
                <div className="step-num-well neu-inset">
                  <span className="step-num">01</span>
                </div>
              </div>
              <h3>State Council License Stepper</h3>
              <p>Verify your medical credentials with state veterinary councils:</p>
              <ul className="doc-list">
                <li><strong>Step 1: Doctor Credentials</strong> — State council registration number and doctor name.</li>
                <li><strong>Step 2: Clinic & Practice</strong> — Clinic address, years of experience, and specialization (Large Animals / Poultry).</li>
                <li><strong>Step 3: Certificates</strong> — Upload B.V.Sc / M.V.Sc degree and clinic license.</li>
                <li><strong>Step 4: Submission</strong> — Submit for Council Authority approval.</li>
              </ul>
            </div>

            {/* Step 2: Prescribing & AMU */}
            <div className="doc-card neu-card">
              <div className="card-header-icon">
                <Stethoscope size={24} color="#3b82f6" />
                <div className="step-num-well neu-inset">
                  <span className="step-num">02</span>
                </div>
              </div>
              <h3>Prescriptions & AMU Management</h3>
              <p>Administer treatments following responsible Antimicrobial Stewardship guidelines:</p>
              <ul className="doc-list">
                <li><strong>Treatment Logging</strong> — Record drug name, dosage, animal tag ID, and diagnosis.</li>
                <li><strong>Withdrawal Calculator</strong> — Automatic withdrawal window calculation based on medicine pharmacokinetics.</li>
                <li><strong>Warning Flags</strong> — Monitor critical warning flags for high-risk antibiotic usage.</li>
              </ul>
            </div>

            {/* Step 3: Regional Supervision */}
            <div className="doc-card neu-card">
              <div className="card-header-icon">
                <Tractor size={24} color="#10b981" />
                <div className="step-num-well neu-inset">
                  <span className="step-num">03</span>
                </div>
              </div>
              <h3>Regional Farm Herd Supervision</h3>
              <p>Oversee assigned district farms and veterinary clinical records:</p>
              <ul className="doc-list">
                <li><strong>Farm Registry</strong> — Inspect registered farms and herd sizes in your district.</li>
                <li><strong>Compliance Metrics</strong> — Review district safety compliance scores.</li>
              </ul>
            </div>
          </div>

          {/* Footer Branding */}
          <footer className="doc-tab-footer">
            <p>Designed, Developed by Akash Mishra.</p>
          </footer>
        </div>
      )}

      {/* ====================================================
          TAB 3: ADMIN / AUTHORITY DOCUMENTATION GUIDE
          ==================================================== */}
      {activeGuideTab === 'authority' && (
        <div className="guide-content-section neu-card fade-in">
          <div className="guide-hero-banner authority-theme">
            <div className="hero-text">
              <span className="role-tag">🛡️ ADMIN AUTHORITY OPERATING MANUAL</span>
              <h2>National AMU Oversight, Approvals & System Analytics</h2>
              <p>Comprehensive administrative manual for government authorities to review farmer/vet registrations, enforce compliance, and analyze national antimicrobial usage.</p>
            </div>
            <Sparkles size={48} className="hero-sparkle" />
          </div>

          <div className="doc-grid-3">
            {/* Step 1: Registration Approvals */}
            <div className="doc-card neu-card">
              <div className="card-header-icon">
                <UserCheck size={24} color="#10b981" />
                <div className="step-num-well neu-inset">
                  <span className="step-num">01</span>
                </div>
              </div>
              <h3>Farmer & Vet Application Review</h3>
              <p>Oversight workflows for reviewing pending registration applications:</p>
              <ul className="doc-list">
                <li><strong>Review Modal</strong> — Inspect uploaded identity proofs, land records (7/12), and medical degrees.</li>
                <li><strong>Approve Action</strong> — Grants full verified status and registers applicant in government databases.</li>
                <li><strong>Reject Action</strong> — Opens custom in-app dialog to specify exact rejection reasons.</li>
              </ul>
            </div>

            {/* Step 2: AMU Analytics */}
            <div className="doc-card neu-card">
              <div className="card-header-icon">
                <Activity size={24} color="#8b5cf6" />
                <div className="step-num-well neu-inset">
                  <span className="step-num">02</span>
                </div>
              </div>
              <h3>National AMU Analytics Dashboard</h3>
              <p>Real-time antimicrobial surveillance and compliance analytics:</p>
              <ul className="doc-list">
                <li><strong>AMU Trends</strong> — Monthly treatment volume line charts and species distribution breakdown.</li>
                <li><strong>Compliance Rate</strong> — National farm safety rate and active withdrawal tracking.</li>
                <li><strong>Offline Resilience</strong> — Top-header connection pill with instant Live/Mock data toggle.</li>
              </ul>
            </div>

            {/* Step 3: Workspace & Permissions */}
            <div className="doc-card neu-card">
              <div className="card-header-icon">
                <ShieldCheck size={24} color="#c084fc" />
                <div className="step-num-well neu-inset">
                  <span className="step-num">03</span>
                </div>
              </div>
              <h3>Workspace & Admin Invites Policy</h3>
              <p>Role-based access control (RBAC) governance & invite code security:</p>
              <ul className="doc-list">
                <li><strong>Role Scoping</strong> — Farmers & Vets only see their relevant portals. Records sections are exclusively reserved for Admin oversight.</li>
                <li><strong>12-Digit Admin Invites</strong> — Ongoing Admins can generate 12-digit invite codes (valid for 5 minutes). Required for upgrading account roles to Authority Admin.</li>
              </ul>
            </div>
          </div>

          {/* Footer Branding */}
          <footer className="doc-tab-footer">
            <p>Designed, Developed by Akash Mishra.</p>
          </footer>
        </div>
      )}
    </div>
  );
}
