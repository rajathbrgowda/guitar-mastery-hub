import { useCallback, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { api } from '../services/api';
import type {
  SkillRecording,
  CreateRecordingResponse,
  RecordingsListResponse,
} from '@gmh/shared/types/recording';
import { CompareRecordings } from './CompareRecordings';

interface RecordingTabProps {
  skillKey: string;
}

export function RecordingTab({ skillKey }: RecordingTabProps) {
  const [recordings, setRecordings] = useState<SkillRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [error, setError] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchRecordings = useCallback(async () => {
    try {
      const res = await api.get<RecordingsListResponse>(`/api/skills/${skillKey}/recordings`);
      setRecordings(res.data.recordings);
    } catch {
      setError('Could not load recordings');
    } finally {
      setLoading(false);
    }
  }, [skillKey]);

  useEffect(() => {
    fetchRecordings();
  }, [fetchRecordings]);

  async function startRecording() {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        setShowNotes(true);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch {
      setError('Microphone access denied. Check your browser permissions.');
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  async function uploadRecording(blob: Blob) {
    setUploading(true);
    setError('');
    try {
      const { data } = await api.post<CreateRecordingResponse>(
        `/api/skills/${skillKey}/recordings`,
        { content_type: 'audio/webm', notes: notes || null },
      );
      // Upload blob to presigned URL
      await fetch(data.upload_url, {
        method: 'PUT',
        body: blob,
        headers: { 'Content-Type': 'audio/webm' },
      });
      setRecordedBlob(null);
      setShowNotes(false);
      setNotes('');
      await fetchRecordings();
    } catch {
      setError('Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  }

  async function handleFileUpload(file: File) {
    if (!file.type.match(/^(audio|video)\//)) {
      setError('Only audio and video files are accepted.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('File too large (max 20MB).');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const { data } = await api.post<CreateRecordingResponse>(
        `/api/skills/${skillKey}/recordings`,
        { content_type: file.type, notes: null },
      );
      await fetch(data.upload_url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      await fetchRecordings();
    } catch {
      setError('Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  }

  async function deleteRecording(id: string) {
    try {
      await api.delete(`/api/skills/${skillKey}/recordings/${id}`);
      setRecordings((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError('Could not delete recording.');
    }
  }

  function togglePlay(rec: SkillRecording) {
    if (playingId === rec.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(rec.playback_url);
    audio.onended = () => setPlayingId(null);
    audio.play();
    audioRef.current = audio;
    setPlayingId(rec.id);
  }

  if (showCompare && recordings.length >= 2) {
    return (
      <CompareRecordings
        oldest={recordings[recordings.length - 1]}
        newest={recordings[0]}
        onClose={() => setShowCompare(false)}
      />
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Record / Upload controls */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, alignItems: 'center' }}>
        {recording ? (
          <Button
            variant="contained"
            color="error"
            startIcon={<StopIcon />}
            onClick={stopRecording}
          >
            Stop
          </Button>
        ) : (
          <Button
            variant="contained"
            startIcon={<MicIcon />}
            onClick={startRecording}
            disabled={uploading}
          >
            Record
          </Button>
        )}

        <Button
          variant="outlined"
          component="label"
          startIcon={<UploadFileIcon />}
          disabled={uploading || recording}
          sx={{ textTransform: 'none' }}
        >
          Upload file
          <input
            type="file"
            accept="audio/*,video/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />
        </Button>

        {uploading && <CircularProgress size={20} />}
      </Box>

      {/* Post-record: notes + save */}
      {showNotes && recordedBlob && (
        <Box sx={{ mb: 2.5, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
            Recording ready
          </Typography>
          <TextField
            size="small"
            fullWidth
            placeholder="Add notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={{ mb: 1.5 }}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              onClick={() => uploadRecording(recordedBlob)}
              disabled={uploading}
            >
              Save recording
            </Button>
            <Button
              variant="text"
              size="small"
              onClick={() => {
                setRecordedBlob(null);
                setShowNotes(false);
              }}
              sx={{ color: 'text.secondary' }}
            >
              Discard
            </Button>
          </Box>
        </Box>
      )}

      {/* Compare button */}
      {recordings.length >= 2 && (
        <Button
          variant="outlined"
          size="small"
          startIcon={<CompareArrowsIcon />}
          onClick={() => setShowCompare(true)}
          sx={{ mb: 2, textTransform: 'none' }}
        >
          Compare oldest & newest
        </Button>
      )}

      {/* Recordings list */}
      {loading ? (
        <CircularProgress size={24} />
      ) : recordings.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No recordings yet. Record yourself playing this skill to track your progress over time.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {recordings.map((rec) => (
            <Box
              key={rec.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1,
                borderRadius: 1,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <IconButton size="small" onClick={() => togglePlay(rec)}>
                {playingId === rec.id ? (
                  <PauseIcon fontSize="small" />
                ) : (
                  <PlayArrowIcon fontSize="small" />
                )}
              </IconButton>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary">
                  {new Date(rec.recorded_at).toLocaleDateString('en', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  {rec.duration_sec != null && ` · ${rec.duration_sec}s`}
                </Typography>
                {rec.notes && (
                  <Typography variant="caption" display="block" color="text.disabled" noWrap>
                    {rec.notes}
                  </Typography>
                )}
              </Box>
              <IconButton
                size="small"
                onClick={() => deleteRecording(rec.id)}
                sx={{ color: 'text.disabled' }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
