import {
  FiCalendar,
  FiCheckCircle,
  FiRotateCcw,
  FiSave,
} from "react-icons/fi";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import { toast } from "react-toastify";

import {
  commitComplaintThunk,
  resetComplaint,
} from "../../features/complaint/complaintSlice";

import {
  resetAI,
} from "../../features/ai/aiSlice";

import FormSection from "./FormSection";

function ComplaintForm() {
  const dispatch = useDispatch();

  const complaint = useSelector(
    (state) =>
      state.complaint.currentComplaint
  );

  const complaintLoading = useSelector(
    (state) => state.complaint.loading
  );

  const aiLoading = useSelector(
    (state) => state.ai.loading
  );

  const latestRun = useSelector(
    (state) => state.ai.latestRun
  );

  const extractedFields =
    latestRun?.extracted_fields ||
    latestRun?.final_output
      ?.extracted_fields ||
    {};

  const classification =
    latestRun?.classification_result ||
    latestRun?.final_output
      ?.classification ||
    {};

  const riskAssessment =
    latestRun?.risk_assessment_result ||
    latestRun?.final_output
      ?.risk_assessment ||
    {};

  const complaintSource =
    complaint?.complaint_source ||
    complaint?.source_type ||
    extractedFields.customer_type
      ?.toUpperCase() ||
    "";

  const complaintStatus =
    complaint?.status
      ? complaint.status.replaceAll(
          "_",
          " "
        )
      : "Pending triage";

  const patientInvolved =
    extractedFields.patient_involved ===
    true
      ? "true"
      : extractedFields.patient_involved ===
          false
        ? "false"
        : "";

  const adverseEventReported =
    extractedFields.adverse_event_reported ===
    true
      ? "true"
      : extractedFields.adverse_event_reported ===
          false
        ? "false"
        : "";

  const isCommitted =
    complaint?.is_committed === true ||
    complaint?.status === "COMMITTED";

  const isReadyToCommit =
    complaint?.status ===
    "READY_TO_COMMIT";

  const isBusy =
    complaintLoading || aiLoading;

  const resetFormState = () => {
    dispatch(resetComplaint());
    dispatch(resetAI());
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    const complaintId =
      complaint?.complaint_id;

    if (!complaintId) {
      toast.error(
        "Process a complaint before saving."
      );

      return;
    }

    if (isCommitted) {
      toast.info(
        "This complaint is already committed."
      );

      return;
    }

    if (!isReadyToCommit) {
      toast.error(
        "Only complaints with READY TO COMMIT status can be committed."
      );

      return;
    }

    try {
      await dispatch(
        commitComplaintThunk(
          complaintId
        )
      ).unwrap();

      /*
       * Do not fetch the committed complaint again.
       * Clear the Redux state so the page becomes
       * ready for a new complaint.
       */
      resetFormState();

      toast.success(
        "Complaint committed successfully. Ready for a new complaint."
      );
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : error?.message ||
              "Failed to commit complaint."
      );
    }
  };

  const handleReset = () => {
    if (isBusy) {
      return;
    }

    resetFormState();

    toast.info(
      "Complaint form has been reset."
    );
  };

  return (
    <div className="complaint-form-panel">
      <header className="complaint-form-header">
        <div>
          <p className="eyebrow">
            Quality Management System
          </p>

          <h1>
            Log Customer Complaint
          </h1>

          <p className="header-description">
            AI-assisted pharmaceutical
            complaint intake and assessment.
          </p>
        </div>

        <span className="status-badge">
          <span className="status-badge__dot" />

          {complaintStatus}
        </span>
      </header>

      <form
        className="complaint-form"
        onSubmit={handleSubmit}
      >
        <FormSection
          number="01"
          title="Origin and customer details"
        >
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="complaintSource">
                Complaint source
              </label>

              <select
                id="complaintSource"
                value={complaintSource}
                disabled
              >
                <option value="">
                  Select complaint source
                </option>

                <option value="EMAIL">
                  Email
                </option>

                <option value="PHONE">
                  Phone
                </option>

                <option value="WEB_FORM">
                  Web form
                </option>

                <option value="PHARMACY">
                  Pharmacy
                </option>

                <option value="DISTRIBUTOR">
                  Distributor
                </option>

                <option value="OTHER">
                  Other
                </option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="customerName">
                Customer name
              </label>

              <input
                id="customerName"
                type="text"
                value={
                  complaint?.customer_name ||
                  extractedFields.complainant_name ||
                  ""
                }
                placeholder="Awaiting AI extraction"
                readOnly
              />
            </div>

            <div className="form-field">
              <label htmlFor="customerEmail">
                Email address
              </label>

              <input
                id="customerEmail"
                type="email"
                value={
                  complaint?.complainant_email ||
                  extractedFields.complainant_email ||
                  ""
                }
                placeholder="Awaiting AI extraction"
                readOnly
              />
            </div>

            <div className="form-field">
              <label htmlFor="customerPhone">
                Phone number
              </label>

              <input
                id="customerPhone"
                type="tel"
                value={
                  complaint?.complainant_phone ||
                  extractedFields.complainant_phone ||
                  ""
                }
                placeholder="Awaiting AI extraction"
                readOnly
              />
            </div>

            <div className="form-field form-field--full">
              <label htmlFor="country">
                Country
              </label>

              <input
                id="country"
                type="text"
                value={
                  complaint?.country ||
                  extractedFields.country ||
                  ""
                }
                placeholder="Awaiting AI extraction"
                readOnly
              />
            </div>
          </div>
        </FormSection>

        <FormSection
          number="02"
          title="Product and batch identification"
        >
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="productName">
                Product name
              </label>

              <input
                id="productName"
                type="text"
                value={
                  complaint?.product_name ||
                  extractedFields.product_name ||
                  ""
                }
                placeholder="Awaiting AI extraction"
                readOnly
              />
            </div>

            <div className="form-field">
              <label htmlFor="productStrength">
                Product strength / grade
              </label>

              <input
                id="productStrength"
                type="text"
                value={
                  complaint?.product_strength_grade ||
                  extractedFields.product_strength_grade ||
                  ""
                }
                placeholder="Awaiting AI extraction"
                readOnly
              />
            </div>

            <div className="form-field">
              <label htmlFor="dosageForm">
                Dosage form
              </label>

              <input
                id="dosageForm"
                type="text"
                value={
                  complaint?.dosage_form ||
                  extractedFields.dosage_form ||
                  ""
                }
                placeholder="Awaiting AI extraction"
                readOnly
              />
            </div>

            <div className="form-field">
              <label htmlFor="batchNumber">
                Batch / lot number
              </label>

              <input
                id="batchNumber"
                type="text"
                value={
                  complaint?.batch_lot_number ||
                  extractedFields.batch_lot_number ||
                  ""
                }
                placeholder="Awaiting AI extraction"
                readOnly
              />
            </div>

            <div className="form-field">
              <label htmlFor="manufacturingDate">
                Manufacturing date
              </label>

              <div className="input-with-icon">
                <input
                  id="manufacturingDate"
                  type="text"
                  value={
                    complaint?.manufacturing_date_text ||
                    extractedFields.manufacturing_date ||
                    ""
                  }
                  placeholder="Awaiting AI extraction"
                  readOnly
                />

                <FiCalendar />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="expiryDate">
                Expiry date
              </label>

              <div className="input-with-icon">
                <input
                  id="expiryDate"
                  type="text"
                  value={
                    complaint?.expiry_date_text ||
                    extractedFields.expiry_date ||
                    ""
                  }
                  placeholder="Awaiting AI extraction"
                  readOnly
                />

                <FiCalendar />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="quantityAffected">
                Quantity affected
              </label>

              <input
                id="quantityAffected"
                type="text"
                value={
                  complaint?.affected_quantity_text ||
                  extractedFields.quantity_affected ||
                  ""
                }
                placeholder="Awaiting AI extraction"
                readOnly
              />
            </div>

            <div className="form-field">
              <label htmlFor="storageConditions">
                Storage conditions
              </label>

              <input
                id="storageConditions"
                type="text"
                value={
                  complaint?.storage_conditions ||
                  extractedFields.storage_conditions ||
                  ""
                }
                placeholder="Awaiting AI extraction"
                readOnly
              />
            </div>
          </div>
        </FormSection>

        <FormSection
          number="03"
          title="Complaint details"
        >
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="observedIssue">
                Observed issue
              </label>

              <input
                id="observedIssue"
                type="text"
                value={
                  complaint?.observed_issue ||
                  extractedFields.observed_issue ||
                  ""
                }
                placeholder="Awaiting AI extraction"
                readOnly
              />
            </div>

            <div className="form-field">
              <label htmlFor="incidentDate">
                Incident date
              </label>

              <div className="input-with-icon">
                <input
                  id="incidentDate"
                  type="text"
                  value={
                    complaint?.incident_date_text ||
                    extractedFields.incident_date ||
                    ""
                  }
                  placeholder="Awaiting AI extraction"
                  readOnly
                />

                <FiCalendar />
              </div>
            </div>

            <div className="form-field form-field--full">
              <label htmlFor="complaintDescription">
                Detailed complaint description
              </label>

              <textarea
                id="complaintDescription"
                rows="5"
                value={
                  complaint?.complaint_description ||
                  extractedFields.complaint_description ||
                  ""
                }
                placeholder="Awaiting AI extraction"
                readOnly
              />
            </div>

            <div className="form-field">
              <label htmlFor="patientInvolved">
                Patient involved
              </label>

              <select
                id="patientInvolved"
                value={patientInvolved}
                disabled
              >
                <option value="">
                  Awaiting AI extraction
                </option>

                <option value="true">
                  Yes
                </option>

                <option value="false">
                  No
                </option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="adverseEvent">
                Adverse event reported
              </label>

              <select
                id="adverseEvent"
                value={
                  adverseEventReported
                }
                disabled
              >
                <option value="">
                  Awaiting AI extraction
                </option>

                <option value="true">
                  Yes
                </option>

                <option value="false">
                  No
                </option>
              </select>
            </div>
          </div>
        </FormSection>

        <FormSection
          number="04"
          title="Initial assessment and priority"
        >
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="complaintCategory">
                Complaint category
              </label>

              <input
                id="complaintCategory"
                type="text"
                value={
                  complaint?.complaint_category ||
                  classification.complaint_category ||
                  ""
                }
                placeholder="Awaiting AI assessment"
                readOnly
              />
            </div>

            <div className="form-field">
              <label htmlFor="complaintSubcategory">
                Subcategory
              </label>

              <input
                id="complaintSubcategory"
                type="text"
                value={
                  complaint?.complaint_subcategory ||
                  classification.complaint_subcategory ||
                  ""
                }
                placeholder="Awaiting AI assessment"
                readOnly
              />
            </div>

            <div className="form-field">
              <label htmlFor="severity">
                Suggested severity
              </label>

              <select
                id="severity"
                value={
                  complaint?.suggested_severity ||
                  classification.suggested_severity ||
                  ""
                }
                disabled
              >
                <option value="">
                  Awaiting AI assessment
                </option>

                <option value="MINOR">
                  Minor
                </option>

                <option value="MAJOR">
                  Major
                </option>

                <option value="CRITICAL">
                  Critical
                </option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="riskLevel">
                Risk level
              </label>

              <select
                id="riskLevel"
                value={
                  riskAssessment.risk_level ||
                  ""
                }
                disabled
              >
                <option value="">
                  Awaiting AI assessment
                </option>

                <option value="LOW">
                  Low
                </option>

                <option value="MEDIUM">
                  Medium
                </option>

                <option value="HIGH">
                  High
                </option>

                <option value="CRITICAL">
                  Critical
                </option>
              </select>
            </div>

            <div className="form-field form-field--full">
              <label htmlFor="nextAction">
                Suggested next action
              </label>

              <textarea
                id="nextAction"
                rows="3"
                value={
                  complaint?.suggested_next_action ||
                  riskAssessment.suggested_next_action ||
                  ""
                }
                placeholder="Awaiting AI assessment"
                readOnly
              />
            </div>
          </div>
        </FormSection>

        <div className="form-actions">
          <button
            type="button"
            className="button button--secondary"
            disabled={isBusy}
            onClick={handleReset}
          >
            <FiRotateCcw />
            Reset form
          </button>

          <div className="form-actions__right">
            <span className="form-ready-message">
              <FiCheckCircle />

              {isCommitted
                ? "Complaint has been committed to QMS"
                : isReadyToCommit
                  ? "Complaint is ready to save"
                  : "Complete the intake before saving"}
            </span>

            <button
              type="submit"
              className="button button--primary"
              disabled={
                !complaint ||
                isBusy ||
                isCommitted ||
                !isReadyToCommit
              }
            >
              <FiSave />

              {complaintLoading
                ? "Saving..."
                : isCommitted
                  ? "Complaint saved"
                  : "Save complaint"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ComplaintForm;