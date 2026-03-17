/**
 * MilestoneCard — CARD-495
 * Generates a 1200×630 PNG milestone card using the Canvas API.
 * Used by PhaseCompleteModal (share button) and Analytics (hour prompt).
 */

export interface MilestoneCardData {
  /** Primary headline, e.g. "Phase 1 Complete" or "50 Hours Practiced" */
  headline: string;
  /** Sub-line, e.g. curriculum name or "of total practice" */
  detail: string;
  /** Large highlighted stat, e.g. "12" or "50h" */
  stat: string;
  /** Label below the stat, e.g. "skills mastered" or "total hours" */
  statLabel: string;
  /** ISO date string for "Completed …" line — omit for hour-threshold cards */
  completedAt?: string;
}

const W = 1200;
const H = 630;
const BG = '#0f172a';
const ACCENT = '#6366f1';
const TEXT_PRIMARY = '#f8fafc';
const TEXT_SECONDARY = '#94a3b8';
const TEXT_MUTED = '#475569';
const FONT = 'system-ui, -apple-system, sans-serif';

export async function generateMilestoneCardBlob(data: MilestoneCardData): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  // Background
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);

  // Top accent bar
  ctx.fillStyle = ACCENT;
  ctx.fillRect(0, 0, W, 6);

  // Bottom accent bar (subtle)
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, H - 80, W, 80);

  // Music note icon
  ctx.fillStyle = ACCENT;
  ctx.font = `500 38px ${FONT}`;
  ctx.fillText('♪', 80, 108);

  // App name
  ctx.fillStyle = TEXT_SECONDARY;
  ctx.font = `500 22px ${FONT}`;
  ctx.fillText('Guitar Mastery Hub', 128, 103);

  // Headline (truncate to maxWidth)
  ctx.fillStyle = TEXT_PRIMARY;
  ctx.font = `bold 58px ${FONT}`;
  ctx.fillText(data.headline, 80, 222, 1040);

  // Detail line
  ctx.fillStyle = TEXT_SECONDARY;
  ctx.font = `400 26px ${FONT}`;
  ctx.fillText(data.detail, 80, 275, 1040);

  // Divider
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, 310);
  ctx.lineTo(W - 80, 310);
  ctx.stroke();

  // Stat block — left accent bar
  ctx.fillStyle = ACCENT;
  ctx.fillRect(80, 344, 4, 84);

  ctx.fillStyle = TEXT_PRIMARY;
  ctx.font = `bold 52px ${FONT}`;
  ctx.fillText(data.stat, 106, 396);

  ctx.fillStyle = TEXT_SECONDARY;
  ctx.font = `400 21px ${FONT}`;
  ctx.fillText(data.statLabel, 106, 430);

  // Completion date
  if (data.completedAt) {
    const dateStr = new Date(data.completedAt).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    ctx.fillStyle = TEXT_MUTED;
    ctx.font = `400 19px ${FONT}`;
    ctx.fillText(`Completed ${dateStr}`, 80, 520);
  }

  // URL in bottom bar
  ctx.fillStyle = TEXT_MUTED;
  ctx.font = `400 17px ${FONT}`;
  ctx.fillText('guitar-mastery-hub-mu.vercel.app', 80, H - 28);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('canvas.toBlob returned null'));
    }, 'image/png');
  });
}

export function downloadMilestoneCard(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function shareOrDownloadMilestoneCard(
  data: MilestoneCardData,
  shareTitle: string,
  shareText: string,
  fileName: string,
): Promise<void> {
  const blob = await generateMilestoneCardBlob(data);
  const file = new File([blob], fileName, { type: 'image/png' });

  if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
    await navigator.share({ title: shareTitle, text: shareText, files: [file] });
  } else {
    downloadMilestoneCard(blob, fileName);
  }
}
