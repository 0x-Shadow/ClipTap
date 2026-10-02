export function applyRetention(clips, imageRetentionDays) {
  if (!imageRetentionDays || imageRetentionDays <= 0) return clips;
  const now = Date.now();
  const maxAgeMs = imageRetentionDays * 24 * 60 * 60 * 1000;
  return clips.filter((clip) => {
    if (clip.type === 'image') {
      return now - clip.timestamp < maxAgeMs;
    }
    return true;
  });
}
