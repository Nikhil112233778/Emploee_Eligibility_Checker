export interface EmployeeResult {
  eligible: boolean;
  mobile: string | null;
}

export interface SaveMobileRequest {
  employeeId: string;
  mobile: string;
  isNewEntry: boolean;
}

export interface SaveMobileResponse {
  success: boolean;
  error?: string;
}
