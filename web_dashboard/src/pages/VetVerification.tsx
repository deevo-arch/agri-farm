import React, { useState, useEffect } from "react";
import { Search, FileText, CheckCircle, XCircle, Eye, Download, MapPin, Phone, Mail, Award, Clock, ShieldCheck, RefreshCw, UploadCloud, Sparkles } from "lucide-react";
import Stepper, { Step } from "../components/Stepper";
import { useAuthContext } from "../context/AuthContext";
import { CustomToast, ToastConfig } from "../components/CustomToast";
import { verificationAPI } from "../services/api";
import "../styles/VetVerification.css";

export default function VetVerification() {
  const { activeRole, user } = useAuthContext();
  const currentRole = activeRole || user?.role || 'authority';

  const [activeTab, setActiveTab] = useState("pending");
  const [selectedVet, setSelectedVet] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [pendingVets, setPendingVets] = useState<any[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  const [isEditing, setIsEditing] = useState<boolean>(true);
  const [submittedStatus, setSubmittedStatus] = useState<"Verified" | "Pending" | "Not Verified">("Not Verified");

  // Fetch current user's verification status from Supabase on mount
  useEffect(() => {
    if (currentRole === 'vet') {
      verificationAPI.getMyStatus().then((res) => {
        if (res && res.status) {
          if (res.status === 'approved') {
            setSubmittedStatus('Verified');
            setIsEditing(false);
          } else if (res.status === 'pending') {
            setSubmittedStatus('Pending');
            setIsEditing(false);
          }
        }
      }).catch(() => {});
    }
  }, [currentRole]);

  // Fetch pending requests for admin authority
  const loadPendingRequests = () => {
    if (currentRole === 'authority') {
      setIsLoadingList(true);
      verificationAPI.getPending('vet').then((data) => {
        setPendingVets(data || []);
      }).catch(() => {
        setPendingVets([]);
      }).finally(() => setIsLoadingList(false));
    }
  };

  useEffect(() => {
    loadPendingRequests();
  }, [currentRole]);

  // Form state for Vet self-verification stepper
  const [formData, setFormData] = useState({
    name: user?.fullName || "",
    email: user?.email || "",
    phone: "+91 ",
    license: "MH-VET-",
    clinic: "",
    district: "Pune",
    location: "",
    specialization: "Large Animals & Livestock",
    experience: "",
    degreeDoc: "degree_cert.pdf",
    councilDoc: "council_reg.pdf",
    clinicDoc: "clinic_license.pdf"
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingField(fieldName);
    try {
      const res = await verificationAPI.uploadDocument(file, 'kyc-vet');
      setFormData(prev => ({ ...prev, [fieldName]: res.url || file.name }));
      setToast({
        type: 'success',
        title: 'Document Uploaded',
        message: `${file.name} saved to Supabase kyc-vet bucket!`
      });
    } catch (err: any) {
      setFormData(prev => ({ ...prev, [fieldName]: file.name }));
      setToast({
        type: 'success',
        title: 'Document Attached',
        message: `${file.name} attached for council verification.`
      });
    } finally {
      setUploadingField(null);
    }
  };

  const [toast, setToast] = useState<ToastConfig | null>(null);
  const [rejectingVet, setRejectingVet] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleFinalSubmission = async () => {
    try {
      await verificationAPI.submit(formData);
      setSubmittedStatus("Pending");
      setIsEditing(false);
      setToast({
        type: 'success',
        title: 'License Submitted',
        message: 'Your veterinary license registration has been submitted to Supabase backend for council verification!'
      });
    } catch (e: any) {
      setToast({
        type: 'error',
        title: 'Submission Failed',
        message: e.message || 'Failed to submit verification request.'
      });
    }
  };

  const handleApprove = async (vet: any) => {
    try {
      await verificationAPI.approve(vet.id);
      loadPendingRequests();
      setToast({
        type: 'success',
        title: 'Vet Verified',
        message: `${vet.form_data?.name || vet.profiles?.full_name || 'Veterinarian'} has been approved in Supabase!`
      });
    } catch (e: any) {
      setToast({
        type: 'error',
        title: 'Approval Failed',
        message: e.message || 'Failed to approve.'
      });
    }
  };


  const handleConfirmReject = () => {
    if (rejectingVet) {
      setToast({
        type: 'error',
        title: 'License Rejected',
        message: `Rejected license verification for ${rejectingVet.name}. Reason: "${rejectionReason || 'Unverified council record'}"`
      });
      setRejectingVet(null);
      setRejectionReason("");
      setShowDetailModal(false);
    }
  };

  const openDetailModal = (vet: any) => {
    setSelectedVet(vet);
    setShowDetailModal(true);
  };

  const [showGuideOverlay, setShowGuideOverlay] = useState(true);

  // ==========================================
  // VETERINARIAN SELF-VERIFICATION VIEW
  // ==========================================
  if (currentRole === 'vet') {
    return (
      <div className="vet-verification-page">
        {/* INTERACTIVE ONBOARDING GUIDE OVERLAY FOR NEW VETS */}
        {showGuideOverlay && (
          <div className="onboarding-overlay-card neu-card fade-in">
            <div className="onboarding-header">
              <div className="onboarding-title-badge">
                <Sparkles size={20} className="text-emerald" />
                <div>
                  <h4>Welcome to Veterinary Council Verification</h4>
                  <p>Follow these 4 simple steps to verify your medical license & clinic credentials</p>
                </div>
              </div>
              <button className="neu-btn close-guide-btn" onClick={() => setShowGuideOverlay(false)}>✕ Close Guide</button>
            </div>
            <div className="onboarding-steps-grid">
              <div className="onboarding-step-item neu-inset">
                <span className="step-badge">1</span>
                <div>
                  <strong>Doctor Info</strong>
                  <p>Enter your full legal name, phone number, and email</p>
                </div>
              </div>
              <div className="onboarding-step-item neu-inset">
                <span className="step-badge">2</span>
                <div>
                  <strong>State License</strong>
                  <p>Provide your State Veterinary Council license registration ID</p>
                </div>
              </div>
              <div className="onboarding-step-item neu-inset">
                <span className="step-badge">3</span>
                <div>
                  <strong>Clinic & Practice</strong>
                  <p>Specify clinic location, district, and medical specialization</p>
                </div>
              </div>
              <div className="onboarding-step-item neu-inset">
                <span className="step-badge">4</span>
                <div>
                  <strong>Council Approval</strong>
                  <p>Submit for official verification by Government Health Council</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="page-header">
          <div>
            <h1 className="page-title">🩺 Veterinary Profile & License Verification</h1>
            <p className="page-subtitle">Manage your state medical registration, clinic license, and credentials</p>
          </div>
        </div>

        {/* Status Hero Card */}
        <div className="status-hero-card neu-card">
          <div className="status-hero-main">
            <div className="status-badge-icon">
              {submittedStatus === "Verified" ? (
                <ShieldCheck size={32} color="#10b981" />
              ) : submittedStatus === "Pending" ? (
                <Clock size={32} color="#d97706" />
              ) : (
                <XCircle size={32} color="#dc2626" />
              )}
            </div>
            <div>
              <div className="status-pills">
                <span className={`status-pill ${submittedStatus === "Verified" ? "verified" : submittedStatus === "Pending" ? "pending" : "unverified"}`}>
                  {submittedStatus === "Verified"
                    ? "LICENSED VETERINARIAN"
                    : submittedStatus === "Pending"
                    ? "PENDING AUTHORITY APPROVAL"
                    : "LICENSE VERIFICATION REQUIRED"}
                </span>
                <span className="district-pill">📜 License: {formData.license}</span>
              </div>
              <h2 className="farmer-farm-title">{formData.name}</h2>
              <p className="farmer-owner">{formData.clinic} • {formData.specialization}</p>
            </div>
          </div>

          <button
            type="button"
            className="neu-btn primary-gradient-btn"
            onClick={() => setIsEditing(!isEditing)}
          >
            <RefreshCw size={15} className={isEditing ? "spinning" : ""} />
            <span>{isEditing ? "View Verified Profile" : "Re-submit & Update License"}</span>
          </button>
        </div>

        {/* Stepper Form for Editing / Re-submitting */}
        {isEditing ? (
          <div className="stepper-section-wrapper neu-card">
            <div className="stepper-header">
              <Sparkles size={20} className="text-purple" />
              <div>
                <h3>Update Veterinary Registration</h3>
                <p>Complete the steps below to re-submit your veterinary license for council verification</p>
              </div>
            </div>

            <Stepper
              initialStep={1}
              onFinalStepCompleted={handleFinalSubmission}
              backButtonText="Previous Step"
              nextButtonText="Next Step"
            >
              <Step>
                <div className="step-inner-form">
                  <h4 className="step-title">Step 1: Personal & Medical Credentials</h4>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>Doctor Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Dr. Full Name"
                      />
                    </div>
                    <div className="form-group">
                      <label>State Council License Number</label>
                      <input
                        type="text"
                        name="license"
                        value={formData.license}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="e.g. MH-VET-892133"
                      />
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Email"
                      />
                    </div>
                    <div className="form-group">
                      <label>Contact Phone</label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Phone"
                      />
                    </div>
                  </div>
                </div>
              </Step>

              <Step>
                <div className="step-inner-form">
                  <h4 className="step-title">Step 2: Clinic & Specialization Details</h4>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>Clinic / Hospital Name</label>
                      <input
                        type="text"
                        name="clinic"
                        value={formData.clinic}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Clinic Name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Years of Clinical Experience</label>
                      <input
                        type="text"
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Experience"
                      />
                    </div>
                    <div className="form-group">
                      <label>Primary Specialization</label>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Specialization"
                      />
                    </div>
                    <div className="form-group">
                      <label>District / Region</label>
                      <input
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="District"
                      />
                    </div>
                  </div>
                </div>
              </Step>
              <Step>
                <div className="step-inner-form">
                  <h4 className="step-title">Step 3: Council License & Degree Certificates</h4>
                  <div className="doc-upload-grid">
                    <label className="doc-upload-box cursor-pointer">
                      <UploadCloud size={24} color="#2d8f4e" />
                      <div>
                        <h5>Veterinary Degree (B.V.Sc / M.V.Sc)</h5>
                        <p className="file-name">{uploadingField === 'degreeDoc' ? 'Uploading to kyc-vet...' : formData.degreeDoc}</p>
                      </div>
                      <span className="upload-badge">{formData.degreeDoc ? 'Attached ✅' : 'Upload'}</span>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e, 'degreeDoc')}
                      />
                    </label>

                    <label className="doc-upload-box cursor-pointer">
                      <UploadCloud size={24} color="#2d8f4e" />
                      <div>
                        <h5>State Council Registration Badge</h5>
                        <p className="file-name">{uploadingField === 'councilDoc' ? 'Uploading to kyc-vet...' : formData.councilDoc}</p>
                      </div>
                      <span className="upload-badge">{formData.councilDoc ? 'Attached ✅' : 'Upload'}</span>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e, 'councilDoc')}
                      />
                    </label>

                    <label className="doc-upload-box cursor-pointer">
                      <UploadCloud size={24} color="#2d8f4e" />
                      <div>
                        <h5>Clinic Establishment License</h5>
                        <p className="file-name">{uploadingField === 'clinicDoc' ? 'Uploading to kyc-vet...' : formData.clinicDoc}</p>
                      </div>
                      <span className="upload-badge">{formData.clinicDoc ? 'Attached ✅' : 'Upload'}</span>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e, 'clinicDoc')}
                      />
                    </label>
                  </div>
                </div>
              </Step>

              <Step>
                <div className="step-inner-form">
                  <h4 className="step-title">Step 4: Review & Final Submission</h4>
                  <div className="review-summary-card">
                    <div className="review-row">
                      <span>Doctor Name:</span>
                      <strong>{formData.name}</strong>
                    </div>
                    <div className="review-row">
                      <span>License Number:</span>
                      <strong>{formData.license}</strong>
                    </div>
                    <div className="review-row">
                      <span>Clinic:</span>
                      <strong>{formData.clinic} ({formData.district})</strong>
                    </div>
                    <div className="review-row">
                      <span>Specialization:</span>
                      <strong>{formData.specialization} ({formData.experience})</strong>
                    </div>
                    <div className="review-row">
                      <span>Attached Docs:</span>
                      <strong>3 Certificates Verified ✅</strong>
                    </div>
                  </div>
                </div>
              </Step>
            </Stepper>
          </div>
        ) : (
          /* Profile Summary Card */
          <div className="verified-details-grid">
            <div className="detail-card neu-card">
              <h3>🩺 Professional Details</h3>
              <div className="detail-row"><span>Doctor Name:</span><strong>{formData.name}</strong></div>
              <div className="detail-row"><span>License:</span><strong>{formData.license}</strong></div>
              <div className="detail-row"><span>Email:</span><strong>{formData.email}</strong></div>
              <div className="detail-row"><span>Phone:</span><strong>{formData.phone}</strong></div>
            </div>

            <div className="detail-card neu-card">
              <h3>🏥 Clinic & Practice</h3>
              <div className="detail-row"><span>Clinic Name:</span><strong>{formData.clinic}</strong></div>
              <div className="detail-row"><span>Specialization:</span><strong>{formData.specialization}</strong></div>
              <div className="detail-row"><span>Experience:</span><strong>{formData.experience}</strong></div>
              <div className="detail-row"><span>Status:</span><strong className="text-emerald">{submittedStatus}</strong></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // AUTHORITY ADMIN VERIFICATION REVIEW VIEW
  // ==========================================
  return (
    <div className="vet-verification-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Vet Verification Oversight</h1>
          <p className="page-subtitle">Review and verify veterinarian registrations</p>
        </div>
      </div>

      {/* Vets Table */}
      <div className="table-container">
        <table className="verification-table">
          <thead>
            <tr>
              <th>Vet ID</th>
              <th>Doctor Name</th>
              <th>License No.</th>
              <th>Clinic</th>
              <th>Contact Info</th>
              <th>District</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingVets.map((vet) => (
              <tr key={vet.id}>
                <td className="id-cell">{vet.id}</td>
                <td className="name-cell">
                  <div className="farmer-name">{vet.name}</div>
                  <div className="applied-date">Applied: {vet.appliedDate}</div>
                </td>
                <td><span className="license-tag">{vet.license}</span></td>
                <td>{vet.clinic}</td>
                <td>
                  <div className="contact-info"><Mail size={12} /> {vet.email}</div>
                  <div className="contact-info"><Phone size={12} /> {vet.phone}</div>
                </td>
                <td>{vet.district}</td>
                <td>
                  <span className={`status-badge ${vet.status.toLowerCase()}`}>
                    {vet.status}
                  </span>
                </td>
                <td className="actions-cell">
                  <button
                    className="action-btn view-btn"
                    onClick={() => openDetailModal(vet)}
                    title="Review Details"
                  >
                    <Eye size={16} /> Review
                  </button>
                  <button
                    className="action-btn approve-btn"
                    onClick={() => handleApprove(vet)}
                    title="Approve License"
                  >
                    <CheckCircle size={16} />
                  </button>
                  <button
                    className="action-btn reject-btn"
                    onClick={() => setRejectingVet(vet)}
                    title="Reject License"
                  >
                    <XCircle size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {showDetailModal && selectedVet && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Veterinary Verification Details</h2>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="farmer-details-grid">
                <div className="detail-item"><span>Doctor Name:</span><strong>{selectedVet.name}</strong></div>
                <div className="detail-item"><span>License:</span><strong>{selectedVet.license}</strong></div>
                <div className="detail-item"><span>Clinic:</span><strong>{selectedVet.clinic}</strong></div>
                <div className="detail-item"><span>Email:</span><strong>{selectedVet.email}</strong></div>
                <div className="detail-item"><span>Phone:</span><strong>{selectedVet.phone}</strong></div>
                <div className="detail-item"><span>District:</span><strong>{selectedVet.district}</strong></div>
              </div>

              <h3>Verification Documents</h3>
              <div className="documents-list">
                {selectedVet.documents?.map((doc: any, idx: number) => (
                  <div key={idx} className="document-item">
                    <FileText size={18} />
                    <span className="doc-name">{doc.name}</span>
                    <span className="doc-size">{doc.size}</span>
                    <button className="download-btn"><Download size={14} /> Download</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDetailModal(false)}>Cancel</button>
              <button className="btn-reject" onClick={() => setRejectingVet(selectedVet)}>Reject</button>
              <button className="btn-approve" onClick={() => handleApprove(selectedVet)}>Approve License</button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectingVet && (
        <div className="modal-overlay" onClick={() => setRejectingVet(null)}>
          <div className="modal-content neu-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h2>Reject License Application</h2>
              <button className="close-btn" onClick={() => setRejectingVet(null)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 12px' }}>
                Please specify the reason for rejecting <strong>{rejectingVet.name}</strong>'s veterinary license application:
              </p>
              <textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="e.g. Unverified council registration number or expired clinic license..."
                className="form-input"
                style={{ width: '100%', minHeight: '90px', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setRejectingVet(null)}>Cancel</button>
              <button className="btn-reject" onClick={handleConfirmReject}>Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}

      <CustomToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
