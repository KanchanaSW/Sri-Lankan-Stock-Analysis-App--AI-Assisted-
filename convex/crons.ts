import { cronJobs } from "convex/server";
import { api, internal } from "./_generated/api";

const crons = cronJobs();

/**
 * DAILY ANALYSIS
 * Schedule: Monday-Friday at 10:00 AM and 3:00 PM LKT
 * (Matches previous GitHub Actions schedule)
 * 10:00 AM LKT = 04:30 AM UTC
 * 03:00 PM LKT = 09:30 AM UTC
 */
crons.daily(
    "daily-stock-analysis-morning",
    { hourUTC: 4, minuteUTC: 30 },
    api.scraper.runScrape,
    { tier: "long-term" }
);

crons.daily(
    "daily-stock-analysis-afternoon",
    { hourUTC: 9, minuteUTC: 30 },
    api.scraper.runScrape,
    { tier: "long-term" }
);

/**
 * WEEKLY DEEP DIVE (VERY LONG-TERM)
 * Schedule: Every Monday at 12:30 PM LKT
 * 12:30 PM LKT = 07:00 AM UTC
 */
crons.weekly(
    "weekly-very-long-term-analysis",
    {
        hourUTC: 7,
        minuteUTC: 0,
        dayOfWeek: "monday",
    },
    api.scraper.runScrape,
    { tier: "very-long-term" }
);

/**
 * CACHE CLEANUP
 * Remove expired cache entries once per day at 02:00 UTC (7:30 AM LKT)
 */
crons.daily(
    "clear-expired-cache",
    { hourUTC: 2, minuteUTC: 0 },
    internal.cache.clearExpiredCacheInternal
);

export default crons;
