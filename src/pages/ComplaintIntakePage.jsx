import { useState } from "react";

import AIAssistantPanel from "../components/ai/AIAssistantPanel";
import ComplaintForm from "../components/complaint/ComplaintForm";
import "../styles/complaint-intake.css";

function ComplaintIntakePage() {
  const [complaintText, setComplaintText] = useState("");

  return (
    <main className="complaint-intake-page">
      <div className="complaint-intake-layout">
        <ComplaintForm />

        <AIAssistantPanel
          complaintText={complaintText}
          setComplaintText={setComplaintText}
        />
      </div>
    </main>
  );
}

export default ComplaintIntakePage;