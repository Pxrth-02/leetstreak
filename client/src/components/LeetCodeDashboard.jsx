import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ActivityCalendar } from 'react-activity-calendar';
import {
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Flame,
  Calendar,
  Code2,
  Clock,
  Sparkles,
  Award
} from 'lucide-react';
import { getDashboard, getContests } from '../api/leetcode';

function timeAgo(timestamp) {
  const ts = parseInt(timestamp, 10);
  if (!ts) return '';
  const seconds = Math.floor(Date.now() / 1000 - ts);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function formatIST(timestamp) {
  if (!timestamp) return '';
  return new Date(timestamp * 1000).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

export default function LeetCodeDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const [dash, contestList] = await Promise.all([
        getDashboard(),
        getContests().catch(() => ({ contests: [] }))
      ]);

      setDashboardData(dash);
      setContests(contestList.contests || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.response?.data?.error || 'Failed to load LeetCode data. Try refreshing.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  // Transform submission calendar into 365-day array for ActivityCalendar
  const heatmapData = useMemo(() => {
    const calendarObj = dashboardData?.calendar || {};
    const countByDate = {};

    if (calendarObj && typeof calendarObj === 'object') {
      for (const [timestamp, count] of Object.entries(calendarObj)) {
        const ts = parseInt(timestamp, 10);
        if (!isNaN(ts)) {
          const d = new Date(ts * 1000);
          const yyyy = d.getUTCFullYear();
          const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
          const dd = String(d.getUTCDate()).padStart(2, '0');
          const dateStr = `${yyyy}-${mm}-${dd}`;
          countByDate[dateStr] = (countByDate[dateStr] || 0) + (Number(count) || 0);
        }
      }
    }

    const result = [];
    const now = new Date();

    for (let i = 364; i >= 0; i--) {
      const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
      const yyyy = day.getUTCFullYear();
      const mm = String(day.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(day.getUTCDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const count = countByDate[dateStr] || 0;

      let level = 0;
      if (count === 1) level = 1;
      else if (count >= 2 && count <= 3) level = 2;
      else if (count >= 4 && count <= 7) level = 3;
      else if (count >= 8) level = 4;

      result.push({
        date: dateStr,
        count,
        level
      });
    }

    return result;
  }, [dashboardData?.calendar]);

  // Loading State
  if (loading) {
    return (
      <div className="rounded-xl border border-[#383838] bg-[#1a1a1a] p-12 flex flex-col items-center justify-center space-y-4">
        <div className="spinner !w-9 !h-9 !border-2 !border-white/20 !border-t-[#ffa116]" />
        <span className="text-xs text-[#9ca3af] font-medium tracking-wide">
          Syncing with LeetCode GraphQL API...
        </span>
      </div>
    );
  }

  // Error State
  if (error || !dashboardData) {
    return (
      <div className="rounded-xl border border-red-900/50 bg-[#1a1a1a] p-8 text-center space-y-4">
        <div className="inline-flex p-3 rounded-full bg-red-950/50 border border-red-800/60 text-red-400">
          <AlertCircle size={28} />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-white">Data Sync Error</h3>
          <p className="text-xs text-[#9ca3af] max-w-sm mx-auto">
            {error || 'Failed to load LeetCode data. Try refreshing.'}
          </p>
        </div>
        <div>
          <button
            onClick={() => fetchData(false)}
            id="retry-fetch-btn"
            className="px-4 py-2 bg-[#ffa116] hover:bg-[#e08e13] text-[#1a1a1a] text-xs font-semibold rounded-lg transition-colors inline-flex items-center space-x-1.5 cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Retry Loading</span>
          </button>
        </div>
      </div>
    );
  }

  const { stats, potd, solvedToday, solvedPOTD, todayCount, recentSubmissions } = dashboardData;
  const solved = stats?.solved || { easy: 0, medium: 0, hard: 0, total: 0 };
  const contest = stats?.contest || {};
  const hasContestStats = contest.rating !== null && contest.rating !== undefined;

  const nowSec = Math.floor(Date.now() / 1000);
  const next24hSec = nowSec + 24 * 3600;

  return (
    <div className="space-y-6 pt-2">
      {/* Top Bar / Header with Refresh */}
      <div className="flex items-center justify-between border-b border-[#333333] pb-3">
        <div className="flex items-center space-x-2">
          <Flame size={18} className="text-[#ffa116]" />
          <h2 className="text-base font-semibold text-white tracking-tight">
            LeetCode Overview
          </h2>
          <span className="text-xs text-[#8c8c8c]">
            (@{dashboardData.username})
          </span>
        </div>

        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          id="refresh-dashboard-btn"
          title="Refresh LeetCode Data"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#262626] hover:bg-[#333333] border border-[#383838] text-xs text-[#d1d5db] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin text-[#ffa116]' : ''} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* SECTION 1 — Solve Stats Row */}
      <div className="rounded-xl border border-[#383838] bg-[#1a1a1a] p-5 space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#8c8c8c] font-medium uppercase tracking-wider text-[11px]">
            Solved Problems
          </span>
          {stats?.globalRanking ? (
            <span className="text-[11px] text-[#9ca3af] bg-[#262626] px-2.5 py-0.5 rounded border border-[#333333]">
              Global Ranking: <strong className="text-white">#{stats.globalRanking.toLocaleString()}</strong>
            </span>
          ) : null}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* Easy Card */}
          <div className="p-3.5 rounded-lg bg-[#222222] border border-[#333333] text-center space-y-1">
            <span className="text-[11px] font-semibold text-[#8c8c8c] uppercase tracking-wider">
              Easy
            </span>
            <div className="text-2xl font-bold text-[#00B8A3] tracking-tight">
              {solved.easy}
            </div>
          </div>

          {/* Medium Card */}
          <div className="p-3.5 rounded-lg bg-[#222222] border border-[#333333] text-center space-y-1">
            <span className="text-[11px] font-semibold text-[#8c8c8c] uppercase tracking-wider">
              Medium
            </span>
            <div className="text-2xl font-bold text-[#FFC01E] tracking-tight">
              {solved.medium}
            </div>
          </div>

          {/* Hard Card */}
          <div className="p-3.5 rounded-lg bg-[#222222] border border-[#333333] text-center space-y-1">
            <span className="text-[11px] font-semibold text-[#8c8c8c] uppercase tracking-wider">
              Hard
            </span>
            <div className="text-2xl font-bold text-[#FF375F] tracking-tight">
              {solved.hard}
            </div>
          </div>
        </div>

        {/* Total below all three */}
        <div className="pt-2 border-t border-[#2e2e2e] flex items-center justify-between text-xs">
          <span className="text-[#9ca3af]">Total Solved</span>
          <span className="text-sm font-bold text-white tracking-wide">
            {solved.total}
          </span>
        </div>
      </div>

      {/* SECTION 2 — Today's Status */}
      <div className="rounded-xl border border-[#383838] bg-[#1a1a1a] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar size={15} className="text-[#ffa116]" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8c8c8c]">
              Today's Status
            </h3>
          </div>

          {/* Solved Today Badge */}
          {solvedToday ? (
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 text-xs font-medium">
              <CheckCircle2 size={13} />
              <span>Solved today ✓ ({todayCount})</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-zinc-800/70 border border-zinc-700 text-[#9ca3af] text-xs font-medium">
              <span>No submission today</span>
            </span>
          )}
        </div>

        {/* POTD Card */}
        {potd ? (
          <div className="p-4 rounded-lg bg-[#222222] border border-[#333333] space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#ffa116]">
                    Daily Challenge
                  </span>
                  <span className="text-[11px] text-[#6b7280]">{potd.date}</span>
                </div>
                <h4 className="text-sm font-semibold text-white tracking-tight">
                  {potd.title}
                </h4>
              </div>

              {/* Solved POTD Badge */}
              {solvedPOTD ? (
                <span className="shrink-0 inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 size={12} />
                  <span>Solved POTD ✓</span>
                </span>
              ) : (
                <span className="shrink-0 inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-950/40 border border-amber-800/60 text-[#ffa116] text-xs font-semibold">
                  <span>Not solved yet</span>
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                  potd.difficulty.toLowerCase() === 'easy'
                    ? 'text-[#00B8A3] bg-emerald-950/30 border-emerald-900/50'
                    : potd.difficulty.toLowerCase() === 'hard'
                    ? 'text-[#FF375F] bg-rose-950/30 border-rose-900/50'
                    : 'text-[#FFC01E] bg-amber-950/30 border-amber-900/50'
                }`}
              >
                {potd.difficulty}
              </span>

              <a
                href={
                  potd.link?.startsWith('http')
                    ? potd.link
                    : `https://leetcode.com${potd.link || ''}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-xs font-medium text-[#ffa116] hover:underline"
              >
                <span>View on LeetCode</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[#8c8c8c]">No daily challenge data available today.</p>
        )}
      </div>

      {/* SECTION 3 — Contest Stats (only if contest.rating is not null) */}
      {hasContestStats ? (
        <div className="rounded-xl border border-[#383838] bg-[#1a1a1a] p-5 space-y-4">
          <div className="flex items-center space-x-2">
            <Trophy size={16} className="text-[#ffa116]" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8c8c8c]">
              Contest Performance
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-[#222222] border border-[#333333] space-y-1">
              <span className="text-[11px] text-[#8c8c8c] uppercase tracking-wider">Rating</span>
              <div className="text-lg font-bold text-white">{contest.rating}</div>
            </div>

            <div className="p-3 rounded-lg bg-[#222222] border border-[#333333] space-y-1">
              <span className="text-[11px] text-[#8c8c8c] uppercase tracking-wider">Global Rank</span>
              <div className="text-lg font-bold text-white">
                {contest.globalRanking ? `#${contest.globalRanking.toLocaleString()}` : '—'}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#222222] border border-[#333333] space-y-1">
              <span className="text-[11px] text-[#8c8c8c] uppercase tracking-wider">Top %</span>
              <div className="text-lg font-bold text-[#ffa116]">
                {contest.topPercentage !== null ? `${contest.topPercentage}%` : '—'}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#222222] border border-[#333333] space-y-1">
              <span className="text-[11px] text-[#8c8c8c] uppercase tracking-wider">Attended</span>
              <div className="text-lg font-bold text-white">
                {contest.attendedContestsCount ?? 0}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* SECTION 4 — Activity Heatmap */}
      <div className="rounded-xl border border-[#383838] bg-[#1a1a1a] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar size={15} className="text-[#ffa116]" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8c8c8c]">
              Submissions in the past year
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto pb-2 flex justify-center">
          {ActivityCalendar ? (
            <ActivityCalendar
              data={heatmapData}
              colorScheme="dark"
              theme={{
                dark: ['#1a1a1a', '#003d00', '#006600', '#009900', '#00cc00']
              }}
              blockSize={12}
              blockMargin={3}
              fontSize={12}
              labels={{
                totalCount: '{{count}} submissions in the past year'
              }}
            />
          ) : (
            <p className="text-xs text-[#8c8c8c]">Unable to load activity heatmap.</p>
          )}
        </div>
      </div>

      {/* SECTION 5 — Recent Accepted Submissions */}
      <div className="rounded-xl border border-[#383838] bg-[#1a1a1a] p-5 space-y-3">
        <div className="flex items-center space-x-2">
          <Code2 size={16} className="text-[#ffa116]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8c8c8c]">
            Recent Accepted Submissions
          </h3>
        </div>

        {recentSubmissions && recentSubmissions.length > 0 ? (
          <div className="space-y-2">
            {recentSubmissions.slice(0, 5).map((sub) => (
              <div
                key={sub.id || `${sub.titleSlug}-${sub.timestamp}`}
                className="flex items-center justify-between p-3 rounded-lg bg-[#222222] border border-[#333333] hover:border-[#444444] transition-colors"
              >
                <div className="flex items-center space-x-2 min-w-0 pr-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <a
                    href={`https://leetcode.com/problems/${sub.titleSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-white hover:text-[#ffa116] truncate transition-colors"
                  >
                    {sub.title}
                  </a>
                </div>

                <div className="flex items-center space-x-2 shrink-0 text-xs">
                  <span className="px-2 py-0.5 rounded bg-[#1a1a1a] border border-[#383838] text-[11px] text-[#9ca3af]">
                    {sub.lang}
                  </span>
                  <span className="text-[11px] text-[#6b7280]">
                    {timeAgo(sub.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#8c8c8c]">No recent accepted submissions found.</p>
        )}
      </div>

      {/* SECTION 6 — Upcoming Contests */}
      <div className="rounded-xl border border-[#383838] bg-[#1a1a1a] p-5 space-y-3">
        <div className="flex items-center space-x-2">
          <Trophy size={16} className="text-[#ffa116]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8c8c8c]">
            Upcoming Contests
          </h3>
        </div>

        {contests && contests.length > 0 ? (
          <div className="space-y-2">
            {contests.map((c) => {
              const isStartingSoon = c.startTime >= nowSec && c.startTime <= next24hSec;
              const durationHours = (c.duration / 3600).toFixed(1).replace('.0', '');

              return (
                <div
                  key={c.titleSlug || c.title}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg border transition-colors gap-2 ${
                    isStartingSoon
                      ? 'bg-[#2a2114] border-[#ffa116]/60 shadow-[0_0_12px_rgba(255,161,22,0.1)]'
                      : 'bg-[#222222] border-[#333333]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-white tracking-tight">
                        {c.title}
                      </span>
                      {isStartingSoon ? (
                        <span className="px-2 py-0.5 rounded-full bg-[#ffa116] text-[#1a1a1a] text-[10px] font-bold uppercase tracking-wider animate-pulse">
                          Starts in &lt; 24h
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-[#9ca3af]">
                      <span className="flex items-center space-x-1">
                        <Calendar size={12} />
                        <span>{formatIST(c.startTime)} (IST)</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock size={12} />
                        <span>{durationHours}h duration</span>
                      </span>
                    </div>
                  </div>

                  <div>
                    <a
                      href={`https://leetcode.com/contest/${c.titleSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#2b2b2b] border border-[#383838] hover:border-[#ffa116] text-xs font-medium text-[#ffa116] transition-colors"
                    >
                      <span>Register</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[#8c8c8c]">No contests in the next 7 days.</p>
        )}
      </div>
    </div>
  );
}
