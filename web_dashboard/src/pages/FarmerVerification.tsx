import React, { useState } from "react";
import { Search, FileText, CheckCircle, XCircle, Eye, Download, MapPin, Phone, Mail, Award, Clock, ShieldCheck, RefreshCw, UploadCloud, ChevronRight, Sparkles } from "lucide-react";
import Stepper, { Step } from "../components/Stepper";
import { useAuthContext } from "../context/AuthContext";
import { CustomToast, ToastConfig } from "../components/CustomToast";
import "../styles/FarmerVerification.css";

export default function FarmerVerification() {
  const { activeRole, user } = useAuthContext();
  const currentRole = activeRole || user?.role || 'authority';

  const [activeTab, setActiveTab] = useState("pending");
  const [selectedFarmer, setSelectedFarmer] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const storageKey = `amu_farmer_verif_${user?.email || 'default'}`;

  // Load stored state or check if brand new account
  const storedVerif = React.useMemo(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, [storageKey]);

  const [isEditing, setIsEditing] = useState<boolean>(!storedVerif);
  const [submittedStatus, setSubmittedStatus] = useState<"Verified" | "Pending" | "Not Verified">(
    storedVerif?.status || (user?.email?.includes('demo') || user?.email?.includes('farmer') ? "Verified" : "Not Verified")
  );

  // Form State for Farmer Self Verification Stepper
  const [formData, setFormData] = useState({
    name: storedVerif?.name || user?.fullName || "New Farmer Account",
    email: user?.email || "farmer@amu.gov",
    phone: storedVerif?.phone || "+91 ",
    location: storedVerif?.location || "",
    district: storedVerif?.district || "Pune",
    farmName: storedVerif?.farmName || (user?.fullName ? `${user.fullName}'s Farm` : "My Dairy Farm"),
    animalCount: storedVerif?.animalCount || "",
    species: storedVerif?.species || "Cattle & Buffalo",
    aadhaarFile: storedVerif?.aadhaarFile || "aadhaar_card.pdf",
    landDocFile: storedVerif?.landDocFile || "land_record.pdf",
    farmCertFile: storedVerif?.farmCertFile || "farm_cert.pdf"
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const [toast, setToast] = useState<ToastConfig | null>(null);
  const [rejectingFarmer, setRejectingFarmer] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleFinalSubmission = () => {
    const payload = { ...formData, status: "Pending" };
    try {
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch (e) {
      console.error("Error saving verification state", e);
    }
    setSubmittedStatus("Pending");
    setIsEditing(false);
    setToast({
      type: 'success',
      title: 'Verification Submitted',
      message: 'Your farm verification application has been submitted to District Authority Admin for review!'
    });
  };

  // Sample admin pending farmer data
  const pendingFarmers = [
    {
      id: "FRM-T001",
      name: "Rajesh Patil",
      farmName: "Green Valley Farm",
      email: "rajesh.patil@gmail.com",
      phone: "+91 98765 43210",
      location: "Hadapsar, Pune",
      district: "Pune",
      status: "Pending",
      appliedDate: "12/12/2025",
      animalCount: "25 Cattle",
      documents: [
        { name: "Aadhaar Card", status: "Uploaded", size: "420 KB" },
        { name: "Land Ownership Document", status: "Uploaded", size: "1.8 MB" },
        { name: "Farm Registration Certificate", status: "Uploaded", size: "950 KB" }
      ]
    }
  ];

  const verifiedFarmers = [
    {
      id: "F001",
      name: "Suresh Kale",
      farmName: "Sunrise Dairy Farm",
      email: "suresh.kale@gmail.com",
      phone: "+91 98761 22334",
      location: "Kharadi, Pune",
      district: "Pune",
      verifiedDate: "05/12/2025",
      status: "Verified"
    }
  ];

  const handleApprove = (farmer: any) => {
    setToast({
      type: 'success',
      title: 'Application Approved',
      message: `Verified and approved farm registration for ${farmer.name}.`
    });
    setShowDetailModal(false);
  };

  const handleConfirmReject = () => {
    if (rejectingFarmer) {
      setToast({
        type: 'error',
        title: 'Application Rejected',
        message: `Rejected application for ${rejectingFarmer.name}. Reason: "${rejectionReason || 'Document mismatch'}"`
      });
      setRejectingFarmer(null);
      setRejectionReason("");
      setShowDetailModal(false);
    }
  };

  const openDetailModal = (farmer: any) => {
    setSelectedFarmer(farmer);
    setShowDetailModal(true);
  };

  // ==========================================
  // FARMER SELF-VERIFICATION VIEW
  // ==========================================
  if (currentRole === 'farmer') {
    return (
      <div className="farmer-verification-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">🌾 Farmer Profile & Verification</h1>
            <p className="page-subtitle">Manage your farm registration, verified credentials, and compliance documents</p>
          </div>
        </div>

        {/* Status Hero Card */}
        <div className="status-hero-card neu-card">
          <div className="status-hero-main">
            <div className="status-badge-icon">
              {submittedStatus === "Verified" ? (
                <ShieldCheck size={32} color="#10b981" />
              ) : (
                <Clock size={32} color="#fbbf24" />
              )}
            </div>
            <div>
              <div className="status-pills">
                <span className={`status-pill ${submittedStatus === "Verified" ? "verified" : "pending"}`}>
                  {submittedStatus === "Verified" ? "VERIFIED FARMER" : "PENDING AUTHORITY APPROVAL"}
                </span>
                <span className="district-pill">📍 {formData.district} District</span>
              </div>
              <h2 className="farmer-farm-title">{formData.farmName}</h2>
              <p className="farmer-owner">Owned by {formData.name} ({formData.email})</p>
            </div>
          </div>

          <button
            type="button"
            className="neu-btn primary-gradient-btn"
            onClick={() => setIsEditing(!isEditing)}
          >
            <RefreshCw size={15} className={isEditing ? "spinning" : ""} />
            <span>{isEditing ? "View Verified Profile" : "Re-submit & Update Details"}</span>
          </button>
        </div>

        {/* Stepper Form for Editing / Re-submitting */}
        {isEditing ? (
          <div className="stepper-section-wrapper neu-card">
            <div className="stepper-header">
              <Sparkles size={20} className="text-purple" />
              <div>
                <h3>Update Farm Verification Details</h3>
                <p>Complete the steps below to re-submit your verification to District Authority</p>
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
                  <h4 className="step-title">Step 1: Personal & Contact Information</h4>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Enter full name"
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
                        placeholder="Enter email"
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Phone number"
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
                    <div className="form-group full-width">
                      <label>Farm Address / Location</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Full farm address"
                      />
                    </div>
                  </div>
                </div>
              </Step>

              <Step>
                <div className="step-inner-form">
                  <h4 className="step-title">Step 2: Farm Details & Livestock Information</h4>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>Registered Farm Name</label>
                      <input
                        type="text"
                        name="farmName"
                        value={formData.farmName}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Farm Name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Total Livestock Count</label>
                      <input
                        type="number"
                        name="animalCount"
                        value={formData.animalCount}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Total animal count"
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Primary Livestock Species</label>
                      <input
                        type="text"
                        name="species"
                        value={formData.species}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="e.g. Cattle, Buffalo, Goat"
                      />
                    </div>
                  </div>
                </div>
              </Step>

              <Step>
                <div className="step-inner-form">
                  <h4 className="step-title">Step 3: Verification Documents</h4>
                  <div className="doc-upload-grid">
                    <div className="doc-upload-box">
                      <UploadCloud size={24} color="#8b5cf6" />
                      <div>
                        <h5>Aadhaar Identity Proof</h5>
                        <p className="file-name">{formData.aadhaarFile}</p>
                      </div>
                      <span className="upload-badge">Uploaded</span>
                    </div>

                    <div className="doc-upload-box">
                      <UploadCloud size={24} color="#8b5cf6" />
                      <div>
                        <h5>Land Ownership Record (7/12)</h5>
                        <p className="file-name">{formData.landDocFile}</p>
                      </div>
                      <span className="upload-badge">Uploaded</span>
                    </div>

                    <div className="doc-upload-box">
                      <UploadCloud size={24} color="#8b5cf6" />
                      <div>
                        <h5>Farm Registration Certificate</h5>
                        <p className="file-name">{formData.farmCertFile}</p>
                      </div>
                      <span className="upload-badge">Uploaded</span>
                    </div>
                  </div>
                </div>
              </Step>

              <Step>
                <div className="step-inner-form">
                  <h4 className="step-title">Step 4: Review & Final Submission</h4>
                  <div className="review-summary-card">
                    <div className="review-row">
                      <span>Owner Name:</span>
                      <strong>{formData.name}</strong>
                    </div>
                    <div className="review-row">
                      <span>Farm Name:</span>
                      <strong>{formData.farmName}</strong>
                    </div>
                    <div className="review-row">
                      <span>Location:</span>
                      <strong>{formData.location}, {formData.district}</strong>
                    </div>
                    <div className="review-row">
                      <span>Livestock:</span>
                      <strong>{formData.animalCount} Animals ({formData.species})</strong>
                    </div>
                    <div className="review-row">
                      <span>Documents:</span>
                      <strong>3 Documents Attached ✅</strong>
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
              <h3>🌾 Farm Information</h3>
              <div className="detail-row"><span>Farm Name:</span><strong>{formData.farmName}</strong></div>
              <div className="detail-row"><span>Owner:</span><strong>{formData.name}</strong></div>
              <div className="detail-row"><span>Email:</span><strong>{formData.email}</strong></div>
              <div className="detail-row"><span>Phone:</span><strong>{formData.phone}</strong></div>
              <div className="detail-row"><span>Location:</span><strong>{formData.location}</strong></div>
            </div>

            <div className="detail-card neu-card">
              <h3>🐄 Livestock & Compliance</h3>
              <div className="detail-row"><span>Total Herd:</span><strong>{formData.animalCount} Animals</strong></div>
              <div className="detail-row"><span>Species:</span><strong>{formData.species}</strong></div>
              <div className="detail-row"><span>Status:</span><strong className="text-emerald">{submittedStatus}</strong></div>
              <div className="detail-row"><span>Authority:</span><strong>Pune District Office</strong></div>
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
    <div className="farmer-verification-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Farmer Verification Oversight</h1>
          <p className="page-subtitle">Review and verify farmer registration applications</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon pending-icon"><Clock size={24} /></div>
          <div>
            <div className="stat-value">{pendingFarmers.length}</div>
            <div className="stat-label">Pending Verification</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon verified-icon"><CheckCircle size={24} /></div>
          <div>
            <div className="stat-value">{verifiedFarmers.length}</div>
            <div className="stat-label">Verified Farmers</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon total-icon"><FileText size={24} /></div>
          <div>
            <div className="stat-value">{pendingFarmers.length + verifiedFarmers.length}</div>
            <div className="stat-label">Total Applications</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          <Clock size={16} /> Pending ({pendingFarmers.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "verified" ? "active" : ""}`}
          onClick={() => setActiveTab("verified")}
        >
          <CheckCircle size={16} /> Verified ({verifiedFarmers.length})
        </button>
      </div>

      {/* Farmers Table */}
      <div className="table-container">
        <table className="verification-table">
          <thead>
            <tr>
              <th>Farmer ID</th>
              <th>Farmer Name</th>
              <th>Farm Name</th>
              <th>Contact Info</th>
              <th>Location</th>
              <th>Animals</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(activeTab === "pending" ? pendingFarmers : verifiedFarmers).map((farmer) => (
              <tr key={farmer.id}>
                <td className="id-cell">{farmer.id}</td>
                <td className="name-cell">
                  <div className="farmer-name">{farmer.name}</div>
                  <div className="applied-date">Applied: {farmer.appliedDate || farmer.verifiedDate}</div>
                </td>
                <td>{farmer.farmName}</td>
                <td>
                  <div className="contact-info"><Mail size={12} /> {farmer.email}</div>
                  <div className="contact-info"><Phone size={12} /> {farmer.phone}</div>
                </td>
                <td>
                  <div className="location-info"><MapPin size={12} /> {farmer.location}</div>
                  <div className="district-tag">{farmer.district}</div>
                </td>
                <td>{farmer.animalCount || "N/A"}</td>
                <td>
                  <span className={`status-badge ${farmer.status.toLowerCase()}`}>
                    {farmer.status}
                  </span>
                </td>
                <td className="actions-cell">
                  <button
                    className="action-btn view-btn"
                    onClick={() => openDetailModal(farmer)}
                    title="Review Details"
                  >
                    <Eye size={16} /> Review
                  </button>

                  {activeTab === "pending" && (
                    <>
                      <button
                        className="action-btn approve-btn"
                        onClick={() => handleApprove(farmer)}
                        title="Approve Verification"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        className="action-btn reject-btn"
                        onClick={() => setRejectingFarmer(farmer)}
                        title="Reject Verification"
                      >
                        <XCircle size={16} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {showDetailModal && selectedFarmer && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Farmer Verification Details</h2>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="farmer-details-grid">
                <div className="detail-item"><span>Full Name:</span><strong>{selectedFarmer.name}</strong></div>
                <div className="detail-item"><span>Farm Name:</span><strong>{selectedFarmer.farmName}</strong></div>
                <div className="detail-item"><span>Email:</span><strong>{selectedFarmer.email}</strong></div>
                <div className="detail-item"><span>Phone:</span><strong>{selectedFarmer.phone}</strong></div>
                <div className="detail-item"><span>Location:</span><strong>{selectedFarmer.location}</strong></div>
                <div className="detail-item"><span>District:</span><strong>{selectedFarmer.district}</strong></div>
              </div>

              <h3>Verification Documents</h3>
              <div className="documents-list">
                {selectedFarmer.documents?.map((doc: any, idx: number) => (
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
              {selectedFarmer.status === "Pending" && (
                <>
                  <button className="btn-reject" onClick={() => setRejectingFarmer(selectedFarmer)}>Reject</button>
                  <button className="btn-approve" onClick={() => handleApprove(selectedFarmer)}>Approve Verification</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectingFarmer && (
        <div className="modal-overlay" onClick={() => setRejectingFarmer(null)}>
          <div className="modal-content neu-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h2>Reject Farmer Application</h2>
              <button className="close-btn" onClick={() => setRejectingFarmer(null)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 12px' }}>
                Please specify the reason for rejecting <strong>{rejectingFarmer.name}</strong>'s application:
              </p>
              <textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="e.g. Incomplete land ownership document or unverified Aadhaar ID..."
                className="form-input"
                style={{ width: '100%', minHeight: '90px', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setRejectingFarmer(null)}>Cancel</button>
              <button className="btn-reject" onClick={handleConfirmReject}>Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}

      <CustomToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
