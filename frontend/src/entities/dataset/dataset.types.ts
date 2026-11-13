export type Dataset = {
  id: number;
  organization_id: number;
  uploaded_by_user_id: number;

  name: string;
  original_filename: string;
  file_size_bytes: number;
  format: string;

  status: string;

  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  imported_rows: number;

  created_at: string;
  updated_at: string;
  completed_at: string | null;
};