import apiClient from "../config/apiClient";

export async function createComplaint(payload) {
  const response = await apiClient.post("/complaints", payload);
  return response.data;
}

export async function getComplaintById(complaintId) {
  const response = await apiClient.get(`/complaints/${complaintId}`);
  return response.data;
}

export async function commitComplaint(complaintId) {
  const response = await apiClient.post(
    `/complaints/${complaintId}/commit`,
    {
      confirm: true,
    }
  );

  return response.data;
}