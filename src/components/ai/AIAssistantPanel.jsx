import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  FiAlertCircle,
  FiFileText,
  FiMessageSquare,
  FiSend,
  FiUploadCloud,
  FiX,
  FiZap,
} from "react-icons/fi";

import { uploadComplaintAttachment } from "../../services/attachmentApi";
import {
  createComplaintThunk,
  getComplaintByIdThunk,
} from "../../features/complaint/complaintSlice";
import {
  processComplaintThunk,
  sendChatCorrectionThunk,
} from "../../features/ai/aiSlice";

function AIAssistantPanel({
  complaintText,
  setComplaintText,
}) {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const [chatMessage, setChatMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const currentComplaint = useSelector(
    (state) => state.complaint.currentComplaint
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

  const complaintError = useSelector(
    (state) => state.complaint.error
  );

  const aiError = useSelector(
    (state) => state.ai.error
  );

  const isProcessing =
    complaintLoading ||
    aiLoading ||
    uploadingFile;

  const validateSelectedFile = (file) => {
    const allowedExtensions = [
      ".pdf",
      ".docx",
      ".txt",
      ".eml",
    ];

    const extension = `.${file.name
      .split(".")
      .pop()
      ?.toLowerCase()}`;

    if (!allowedExtensions.includes(extension)) {
      toast.error(
        "Only PDF, DOCX, TXT, and EML files are supported."
      );

      return false;
    }

    const maxSizeBytes = 10 * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      toast.error(
        "The selected file exceeds the 10 MB limit."
      );

      return false;
    }

    if (file.size === 0) {
      toast.error("The selected file is empty.");
      return false;
    }

    return true;
  };

  const setValidatedFile = (file) => {
    if (!file) {
      return;
    }

    if (!validateSelectedFile(file)) {
      return;
    }

    setSelectedFile(file);
  };

  const handleFileSelection = (event) => {
    const file = event.target.files?.[0];

    setValidatedFile(file);

    // Allows selecting the same file again later.
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();

    const file = event.dataTransfer.files?.[0];

    setValidatedFile(file);
  };

  const removeSelectedFile = (event) => {
    event.stopPropagation();
    setSelectedFile(null);
  };

  const createTextComplaint = async () => {
    const cleanedText = complaintText.trim();

    const createdComplaint = await dispatch(
      createComplaintThunk({
        raw_complaint_text: cleanedText,
        input_type: "TEXT",
      })
    ).unwrap();

    const complaintId =
      createdComplaint.complaint_id;

    if (!complaintId) {
      throw new Error(
        "Complaint was created, but no complaint ID was returned."
      );
    }

    await dispatch(
      processComplaintThunk({
        complaintId,
        triggerType: "TEXT_SUBMISSION",
      })
    ).unwrap();

    await dispatch(
      getComplaintByIdThunk(complaintId)
    ).unwrap();

    return complaintId;
  };

  const createDocumentComplaint = async () => {
    /*
     * The complaint record must exist before its attachment
     * can be uploaded.
     *
     * Use an empty string if your ComplaintCreate schema does
     * not accept null.
     */
    const createdComplaint = await dispatch(
      createComplaintThunk({
        raw_complaint_text: "",
        input_type: "DOCUMENT",
      })
    ).unwrap();

    const complaintId =
      createdComplaint.complaint_id;

    if (!complaintId) {
      throw new Error(
        "Complaint was created, but no complaint ID was returned."
      );
    }

    setUploadingFile(true);

    try {
      /*
       * The backend upload route should:
       *
       * 1. save the file
       * 2. extract its text
       * 3. copy extracted text into complaint.raw_complaint_text
       */
      await uploadComplaintAttachment(
        complaintId,
        selectedFile
      );
    } finally {
      setUploadingFile(false);
    }

    await dispatch(
      processComplaintThunk({
        complaintId,
        triggerType: "FILE_UPLOAD",
      })
    ).unwrap();

    await dispatch(
      getComplaintByIdThunk(complaintId)
    ).unwrap();

    return complaintId;
  };

  const handleProcessComplaint = async () => {
    const hasFile = Boolean(selectedFile);
    const hasText = Boolean(complaintText.trim());

    if (!hasFile && !hasText) {
      toast.error(
        "Please upload a document or paste complaint text before processing."
      );

      return;
    }

    try {
      if (hasFile) {
        await createDocumentComplaint();

        toast.success(
          "Document uploaded, extracted, and processed successfully."
        );
      } else {
        await createTextComplaint();

        toast.success(
          "Complaint text processed successfully."
        );
      }
    } catch (error) {
      toast.error(
        error?.message ||
          "Complaint processing failed."
      );
    }
  };

  const handleChatCorrection = async () => {
    const message = chatMessage.trim();

    const complaintId =
      currentComplaint?.complaint_id;

    if (!message) {
      return;
    }

    if (!complaintId) {
      toast.error(
        "Process the complaint before sending a correction."
      );

      return;
    }

    try {
      await dispatch(
        sendChatCorrectionThunk({
          complaintId,
          messageText: message,
        })
      ).unwrap();

      await dispatch(
        getComplaintByIdThunk(complaintId)
      ).unwrap();

      setChatMessage("");

      toast.success(
        "Complaint correction applied successfully."
      );
    } catch (error) {
      toast.error(
        error?.message ||
          "Failed to apply complaint correction."
      );
    }
  };

  const processingPercentage = isProcessing
    ? uploadingFile
      ? 35
      : 70
    : latestRun
      ? 100
      : 0;

  const processingDescription = uploadingFile
    ? "Uploading the document and extracting readable text..."
    : aiLoading
      ? "Analyzing the complaint and extracting key details..."
      : latestRun
        ? "Complaint extraction completed successfully."
        : "Upload a document or paste complaint text to begin.";

  const assistantMessage =
    latestRun?.final_output?.assistant_message;

  const validationWarnings =
    latestRun?.final_output?.validation_warnings ||
    [];

  return (
    <aside className="assistant-panel">
      <header className="assistant-header">
        <div className="assistant-header__icon">
          <FiZap />
        </div>

        <div>
          <div className="assistant-title-row">
            <h2>AI Complaint Assistant</h2>
            <span className="beta-badge">
              Beta
            </span>
          </div>

          <p>
            Upload or paste complaint information
            for automated extraction.
          </p>
        </div>
      </header>

      <div className="assistant-content">
        <section className="assistant-card">
          <div
            className="upload-box"
            role="button"
            tabIndex={0}
            onClick={() =>
              !isProcessing &&
              fileInputRef.current?.click()
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter" ||
                event.key === " "
              ) {
                fileInputRef.current?.click();
              }
            }}
            onDrop={handleDrop}
            onDragOver={(event) =>
              event.preventDefault()
            }
          >
            <FiUploadCloud className="upload-box__icon" />

            <h3>
              {selectedFile
                ? selectedFile.name
                : "Drop complaint document here"}
            </h3>

            <p>
              {selectedFile
                ? `${(
                    selectedFile.size /
                    1024
                  ).toFixed(1)} KB selected`
                : "or click to browse from your computer"}
            </p>

            {selectedFile && (
              <button
                type="button"
                className="remove-file-button"
                aria-label="Remove selected file"
                disabled={isProcessing}
                onClick={removeSelectedFile}
              >
                <FiX />
                Remove
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept=".pdf,.docx,.txt,.eml"
              disabled={isProcessing}
              onChange={handleFileSelection}
            />
          </div>

          <div className="divider">
            <span>OR</span>
          </div>

          <div className="paste-section">
            <label htmlFor="complaintText">
              <FiFileText />
              Paste complaint text or email
            </label>

            <textarea
              id="complaintText"
              rows="4"
              value={complaintText}
              disabled={
                isProcessing ||
                Boolean(selectedFile)
              }
              onChange={(event) =>
                setComplaintText(
                  event.target.value
                )
              }
              placeholder={
                selectedFile
                  ? "Remove the selected file to use pasted text."
                  : "Paste the original complaint message here..."
              }
            />
          </div>

          <div className="supported-formats">
            <FiAlertCircle />

            <div>
              <strong>
                Supported formats
              </strong>

              <p>
                PDF, DOCX, TXT and EML.
                Maximum file size: 10 MB.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="button button--primary button--full"
            disabled={isProcessing}
            onClick={handleProcessComplaint}
          >
            <FiZap />

            {uploadingFile
              ? "Uploading and extracting..."
              : aiLoading
                ? "Processing complaint..."
                : "Process complaint with AI"}
          </button>

          {(complaintError || aiError) && (
            <p className="processing-error">
              {complaintError || aiError}
            </p>
          )}
        </section>

        <section className="assistant-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">
                AI processing
              </p>

              <h3>Extraction progress</h3>
            </div>

            <span className="progress-value">
              {processingPercentage}%
            </span>
          </div>

          <div className="progress-track">
            <div
              className="progress-bar"
              style={{
                width: `${processingPercentage}%`,
              }}
            />
          </div>

          <p className="progress-description">
            {processingDescription}
          </p>
        </section>

        <section className="assistant-card assistant-card--conversation">
          <div className="card-heading">
            <div>
              <p className="eyebrow">
                Assistant
              </p>

              <h3>
                Complaint conversation
              </h3>
            </div>

            <FiMessageSquare />
          </div>

          <div className="chat-messages">
            <div className="chat-message chat-message--assistant">
              <div className="chat-avatar">
                <FiZap />
              </div>

              <div className="chat-bubble">
                <strong>AI Assistant</strong>

                <p>
                  {assistantMessage ||
                    "Upload a complaint document or paste complaint text. I will extract the relevant information, validate it, and perform an initial risk assessment."}
                </p>
              </div>
            </div>

            {validationWarnings.length > 0 && (
              <div className="validation-warning-box">
                <strong>
                  Validation warnings
                </strong>

                <ul>
                  {validationWarnings.map(
                    (warning, index) => (
                      <li
                        key={`${warning}-${index}`}
                      >
                        {warning}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
          </div>

          <div className="chat-input-wrapper">
            <textarea
              rows="2"
              value={chatMessage}
              disabled={
                !currentComplaint ||
                isProcessing
              }
              onChange={(event) =>
                setChatMessage(
                  event.target.value
                )
              }
              placeholder={
                currentComplaint
                  ? "Provide a correction, for example: Quantity is 15, not 12."
                  : "Process the complaint before sending corrections."
              }
            />

            <button
              type="button"
              className="send-button"
              aria-label="Send correction"
              disabled={
                !chatMessage.trim() ||
                !currentComplaint ||
                isProcessing
              }
              onClick={
                handleChatCorrection
              }
            >
              <FiSend />
            </button>
          </div>

          <p className="assistant-disclaimer">
            AI-generated suggestions should be
            reviewed before final submission.
          </p>
        </section>
      </div>
    </aside>
  );
}

export default AIAssistantPanel;