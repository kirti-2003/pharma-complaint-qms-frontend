import apiClient from "../config/apiClient";

export async function uploadComplaintAttachment(
  complaintId,
  file
) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await apiClient.post(
    `/complaints/${complaintId}/attachments`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}