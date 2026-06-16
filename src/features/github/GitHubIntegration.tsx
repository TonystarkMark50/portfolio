import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Github,
  Star,
  GitFork,
  Code2,
  RefreshCw,
  Search,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  fork: boolean;
}

interface RepoStats {
  totalRepos: number;
  totalStars: number;
  topLanguage: string;
  languages: Record<string, number>;
}

interface Props {
  onNavigate?: (tab: string) => void;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Scala: '#c22d40',
  Shell: '#89e051',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Vue: '#41b883',
  Svelte: '#ff3e00',
};

function getLanguageColor(language: string | null): string {
  if (!language) return '#64748b';
  return LANGUAGE_COLORS[language] || '#64748b';
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

function RepoSkeleton() {
  return (
    <div className="animate-pulse bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-3">
      <div className="h-4 bg-gray-800 rounded w-2/3" />
      <div className="h-3 bg-gray-800 rounded w-full" />
      <div className="h-3 bg-gray-800 rounded w-4/5" />
      <div className="flex gap-4 pt-2">
        <div className="h-3 bg-gray-800 rounded w-16" />
        <div className="h-3 bg-gray-800 rounded w-16" />
        <div className="h-3 bg-gray-800 rounded w-20" />
      </div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="animate-pulse bg-gray-900 rounded-xl border border-gray-800 p-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 bg-gray-800 rounded w-16" />
            <div className="h-6 bg-gray-800 rounded w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GitHubIntegration(_props: Props) {
  const [username, setUsername] = useState('');
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  const fetchRepos = useCallback(async () => {
    const trimmed = username.trim();
    if (!trimmed) {
      setError('Please enter a GitHub username');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `https://api.github.com/users/${encodeURIComponent(trimmed)}/repos?per_page=100&sort=updated`,
      );

      if (!res.ok) {
        if (res.status === 404) throw new Error(`User "${trimmed}" not found`);
        if (res.status === 403) throw new Error('Rate limit exceeded. Try again later.');
        throw new Error(`GitHub API error: ${res.status}`);
      }

      const data: GitHubRepo[] = await res.json();

      if (!Array.isArray(data)) {
        throw new Error('Unexpected response from GitHub API');
      }

      const sorted = data.sort(
        (a, b) => b.stargazers_count - a.stargazers_count,
      );

      setRepos(sorted);
      setFetched(true);
      localStorage.setItem('github-repos', JSON.stringify(sorted));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch repos';
      setError(msg);
      setRepos([]);
    } finally {
      setLoading(false);
    }
  }, [username]);

  const handleRefresh = () => {
    fetchRepos();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      fetchRepos();
    }
  };

  const stats: RepoStats | null = repos.length > 0
    ? (() => {
        const totalRepos = repos.length;
        const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
        const langCounts: Record<string, number> = {};
        repos.forEach((r) => {
          if (r.language) {
            langCounts[r.language] = (langCounts[r.language] || 0) + 1;
          }
        });
        const entries = Object.entries(langCounts).sort((a, b) => b[1] - a[1]);
        const topLanguage = entries.length > 0 ? entries[0][0] : 'N/A';
        return { totalRepos, totalStars, topLanguage, languages: langCounts };
      })()
    : null;

  const languageTotal = stats
    ? Object.values(stats.languages).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Github className="w-5 h-5 text-gray-300" />
          GitHub Integration
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Fetch and showcase your GitHub repositories
        </p>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter GitHub username..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-900 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={fetchRepos}
          disabled={loading || !username.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm font-medium text-gray-200 hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          Fetch
        </motion.button>
        {fetched && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm font-medium text-gray-200 hover:bg-gray-700 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2.5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          <StatsSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <RepoSkeleton key={i} />
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      {stats && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 rounded-xl border border-gray-800 p-5"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Repos
              </p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats.totalRepos}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Stars
              </p>
              <p className="text-2xl font-bold text-amber-400 mt-1 flex items-center gap-1.5">
                <Star className="w-5 h-5" />
                {formatCount(stats.totalStars)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Top Language
              </p>
              <p className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: getLanguageColor(stats.topLanguage),
                  }}
                />
                {stats.topLanguage}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Languages
              </p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {Object.entries(stats.languages)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([lang, count]) => (
                    <span
                      key={lang}
                      className="text-[11px] text-gray-400 bg-gray-800 px-2 py-0.5 rounded-md"
                    >
                      {lang} ({count})
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Language Breakdown Bar */}
      {stats && !loading && Object.keys(stats.languages).length > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-2 rounded-full overflow-hidden bg-gray-800 flex"
        >
          {Object.entries(stats.languages)
            .sort((a, b) => b[1] - a[1])
            .map(([lang, count]) => (
              <div
                key={lang}
                style={{
                  width: `${(count / languageTotal) * 100}%`,
                  backgroundColor: getLanguageColor(lang),
                }}
                className="h-full first:rounded-l-full last:rounded-r-full transition-all"
                title={`${lang}: ${count} repos`}
              />
            ))}
        </motion.div>
      )}

      {/* Repo Cards */}
      {repos.length > 0 && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {repos.map((repo, index) => (
              <motion.a
                key={repo.id}
                href={repo.html_url}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ y: -2 }}
                className="block bg-gray-900 rounded-xl border border-gray-800 p-4 hover:border-gray-700 hover:bg-gray-800/50 transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                      {repo.name}
                    </h3>
                    {repo.description && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {repo.description}
                      </p>
                    )}
                  </div>
                  {repo.fork && (
                    <span className="text-[10px] text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                      Fork
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  {repo.language && (
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor: getLanguageColor(repo.language),
                        }}
                      />
                      {repo.language}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5" />
                    {repo.stargazers_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork className="w-3.5 h-3.5" />
                    {repo.forks_count}
                  </span>
                </div>
              </motion.a>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && fetched && repos.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-gray-800 flex items-center justify-center mb-4">
            <Code2 className="w-7 h-7 text-gray-600" />
          </div>
          <p className="text-sm font-medium text-gray-400">No repositories found</p>
          <p className="text-xs text-gray-600 mt-1">
            This user has no public repositories
          </p>
        </motion.div>
      )}

      {/* Initial state */}
      {!loading && !error && !fetched && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-gray-800 flex items-center justify-center mb-4">
            <Github className="w-7 h-7 text-gray-600" />
          </div>
          <p className="text-sm font-medium text-gray-400">
            Enter a GitHub username to fetch repositories
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Repos are cached in your browser for offline access
          </p>
        </motion.div>
      )}
    </div>
  );
}
