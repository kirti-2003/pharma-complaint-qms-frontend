import apiClient from "../config/apiClient";

export async function processComplaint(
  complaintId,
  triggerType = "TEXT_SUBMISSION"
) {
  const response = await apiClient.post(
    `/ai/complaints/${complaintId}/process`,
    {
      trigger_type: triggerType,
    }
  );

  return response.data;
}

export async function sendChatCorrection(
  complaintId,
  messageText
) {
  const response = await apiClient.post(
    `/ai/complaints/${complaintId}/chat`,
    {
      message_text: messageText,
    }
  );

  return response.data;
}

export async function getComplaintAIRuns(complaintId) {
  const response = await apiClient.get(
    `/ai/complaints/${complaintId}/runs`
  );

  return response.data;
}