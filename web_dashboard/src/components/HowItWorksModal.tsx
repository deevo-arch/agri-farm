import React from "react";
import { X, ShieldCheck, Sprout, Stethoscope, Activity, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";
import BorderGlow from "./BorderGlow";
import "./HowItWorksModal.css";

export interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="how-modal-backdrop" onClick={onClose} />
      <div className="how-modal-wrapper">
        <BorderGlow colors={['#8b5cf6', '#c084fc', '#38bdf8']} backgroundColor="#13111c" borderRadius={24}>
          <div className="how-modal-card neu-card">
            {/* Header */}
            <div className="how-modal-header">
              <div className="flex items-center gap-3">
                <div className="modal-title-badge neu-btn">
                  <Sparkles size={22} color="#c084fc" />
                </div>
                <div>
                  <h2 className="modal-main-title">How Agri Farm System Works</h2>
                  <p className="modal-sub-title">End-to-End Antimicrobial Stewardship & Food Safety Ecosystem</p>
                </div>
              </div>

              <button
                type="button"
                className="close-chip"
                onClick={onClose}
                aria-label="Close modal"
                title="Close modal"
              >
                <X size={20} strokeWidth={3} color="#ffffff" />
              </button>
            </div>

            {/* Workflow Steps Container */}
            <div className="workflow-container">
              {/* Step 1 */}
              <div className="workflow-card neu-inset">
                <div className="step-header">
                  <span className="step-badge">STEP 01</span>
                  <Sprout size={20} color="#10b981" />
                </div>
                <h3>Farmer Registration & Verification</h3>
                <p>
                  Farmers submit identity credentials and 7/12 land revenue records through the multi-step Stepper verification wizard. Submissions are audited by District Authorities to prevent fraudulent livestock claims.
                </p>
                <div className="step-tag">
                  <CheckCircle2 size={13} color="#10b981" /> Verified Farm Infrastructure
                </div>
              </div>

              {/* Step 2 */}
              <div className="workflow-card neu-inset">
                <div className="step-header">
                  <span className="step-badge">STEP 02</span>
                  <Stethoscope size={20} color="#8b5cf6" />
                </div>
                <h3>Veterinarian Prescription Audit</h3>
                <p>
                  Licensed Vets review animal symptoms, prescribe approved antimicrobial drugs, and set mandatory <strong>Withdrawal Period Timers</strong> to ensure zero drug residue enters the food supply.
                </p>
                <div className="step-tag">
                  <CheckCircle2 size={13} color="#8b5cf6" /> Prescription & Dose Logging
                </div>
              </div>

              {/* Step 3 */}
              <div className="workflow-card neu-inset">
                <div className="step-header">
                  <span className="step-badge">STEP 03</span>
                  <ShieldCheck size={20} color="#c084fc" />
                </div>
                <h3>Authority Oversight & Surveillance</h3>
                <p>
                  District Admins monitor real-time farm compliance rates, approve pending verification applications, and issue single-use 12-digit invite codes for authorized role upgrades.
                </p>
                <div className="step-tag">
                  <CheckCircle2 size={13} color="#c084fc" /> National AMU Surveillance
                </div>
              </div>

              {/* Step 4 */}
              <div className="workflow-card neu-inset">
                <div className="step-header">
                  <span className="step-badge">STEP 04</span>
                  <Activity size={20} color="#38bdf8" />
                </div>
                <h3>Consumer Safety & Compliance</h3>
                <p>
                  Integrated PDF report generation and analytics export ensure complete transparency for government food safety inspectors and international export compliance standards.
                </p>
                <div className="step-tag">
                  <CheckCircle2 size={13} color="#38bdf8" /> Guaranteed Food Supply Safety
                </div>
              </div>
            </div>

            {/* Footer Credits */}
            <div className="how-modal-footer">
              <p className="developer-credit">Designed, Developed by Akash Mishra.</p>
              <button className="btn-primary-neu flex items-center gap-2" onClick={onClose}>
                <span>Got It, Let's Explore</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </BorderGlow>
      </div>
    </>
  );
}
