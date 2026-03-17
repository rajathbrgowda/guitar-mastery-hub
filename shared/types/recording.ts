export interface SkillRecording {
  id: string;
  skill_key: string;
  curriculum_key: string;
  duration_sec: number | null;
  notes: string | null;
  content_type: string;
  recorded_at: string;
  playback_url?: string; // short-lived signed URL, included in GET responses
}

export interface CreateRecordingResponse {
  recording_id: string;
  upload_url: string;
}

export interface RecordingsListResponse {
  recordings: SkillRecording[];
}
