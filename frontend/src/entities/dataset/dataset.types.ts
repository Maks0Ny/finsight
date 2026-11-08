export type Dataset = {
    id: number;
    organization_id: number;
    uploaded_by_user_id: number;

    name: string;
    original_filename: string;
    storage_key: string;
    file_sha256: string
    file_size_bytes: string;

    source_type: string;
    format: string;
    adapter_name: string;
    adapter_version: string;

    total_rows: number;
    valid_rows: number;
    invalid_rows: number;
    imported_rows: number;
    raw_rows_saved: number;

    error_code: string;
    error_message: string;

    created_at: Date;
    updated_at: Date;
    started_at: Date;
    completed_at: Date;
    archived_at: Date;
};