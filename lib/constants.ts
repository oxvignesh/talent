export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes
export const ACCEPTED_FILE_TYPES = {
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
};

export const statusColors: Record<string, string> = {
  open: "text-[#27548A]",
  cancelled: "text-[#F16767]",
  in_progress: "text-[#D3CA79]",
  completed: "text-[#5F8B4C]",
};

export const pingColors: Record<string, string> = {
  open: "bg-[#27548A]",
  cancelled: "bg-[#F16767]",
  in_progress: "bg-[#D3CA79]",
  completed: "bg-[#5F8B4C]",
};