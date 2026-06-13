/** Format a timestamp as a user-friendly relative or calendar label */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffMinutes < 1) return 'Updated just now';
  if (diffMinutes < 60) return `Updated ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `Updated ${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays === 0) return 'Updated today';
  if (diffDays === 1) return 'Updated yesterday';
  if (diffDays < 7) return `Updated ${diffDays} days ago`;

  return `Updated on ${new Date(timestamp).toLocaleDateString('en-LK', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;
}

/** Label for AI analysis freshness */
export function formatAiGeneratedTime(timestamp: number): string {
  const now = Date.now();
  const diffDays = Math.floor((now - timestamp) / (24 * 60 * 60 * 1000));

  if (diffDays === 0) return 'AI analysis generated today';
  if (diffDays === 1) return 'AI analysis generated yesterday';
  return formatRelativeTime(timestamp).replace('Updated', 'AI analysis generated');
}

/** Label for market overview refresh time */
export function formatMarketRefreshTime(lastUpdated: string): string {
  if (!lastUpdated || lastUpdated === 'N/A') return 'Market data refresh time unavailable';
  if (lastUpdated.includes(':')) {
    return `Market data refreshed at ${lastUpdated}`;
  }
  return `Market data refreshed on ${lastUpdated}`;
}
