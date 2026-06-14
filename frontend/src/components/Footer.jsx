import { Logo } from './Logo';

// Profile details fetched from github.com/Nitin23123 (GitHub API).
const DEV = {
  name: 'Nitin Tanwar',
  handle: 'Nitin23123',
  url: 'https://github.com/Nitin23123',
  avatar: 'https://avatars.githubusercontent.com/u/166863746?v=4',
  bio: 'Full-Stack Engineer @ Novus Aegis AI · MCA @ CDAC Noida · Web, Backend & AI Integration',
  location: 'Delhi, India',
  company: 'Novus Aegis AI',
  repo: 'https://github.com/Nitin23123/DEVtraceDashboard',
};

const GitHubIcon = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.2 3.44 9.6 8.21 11.16.6.11.82-.25.82-.56v-2.13c-3.34.71-4.04-1.4-4.04-1.4-.55-1.36-1.34-1.72-1.34-1.72-1.09-.72.08-.71.08-.71 1.2.08 1.84 1.21 1.84 1.21 1.07 1.78 2.81 1.27 3.5.97.11-.76.42-1.27.76-1.56-2.67-.29-5.47-1.31-5.47-5.84 0-1.29.47-2.34 1.24-3.17-.12-.29-.54-1.46.12-3.05 0 0 1.01-.31 3.3 1.21a11.6 11.6 0 0 1 3-.39c1.02 0 2.05.13 3 .39 2.29-1.52 3.3-1.21 3.3-1.21.66 1.59.24 2.76.12 3.05.77.83 1.24 1.88 1.24 3.17 0 4.54-2.81 5.55-5.49 5.83.43.36.81 1.08.81 2.18v3.23c0 .31.22.68.83.56C20.56 21.88 24 17.49 24 12.29 24 5.78 18.63.5 12 .5z" />
  </svg>
);

const PinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

const BuildingIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
  </svg>
);

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="mt-16"
      style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--glass)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
    >
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-8">
          {/* About the project */}
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <Logo size={26} />
              <span className="text-base font-semibold tracking-tight">
                <span style={{ color: 'var(--text-soft)' }}>dev</span>
                <span style={{ background: 'linear-gradient(120deg, var(--accent), var(--accent-2))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>trace</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-soft)' }}>
              A developer productivity dashboard — tasks, DSA, snippets, GitHub insights, and GGSIPU placement prep, all in one place.
            </p>
          </div>

          {/* About the developer */}
          <div className="sm:col-span-3">
            <p className="mono text-xs uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--accent)' }}>About the developer</p>
            <div className="flex items-start gap-4">
              <img
                src={DEV.avatar}
                alt={DEV.name}
                loading="lazy"
                className="h-14 w-14 rounded-full shrink-0"
                style={{ border: '1px solid var(--border)' }}
              />
              <div className="min-w-0">
                <h3 className="font-semibold" style={{ color: 'var(--text)' }}>{DEV.name}</h3>
                <p className="text-sm mt-0.5 leading-relaxed" style={{ color: 'var(--text-soft)' }}>{DEV.bio}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-xs" style={{ color: 'var(--muted)' }}>
                  <span className="flex items-center gap-1.5"><PinIcon /> {DEV.location}</span>
                  <span className="flex items-center gap-1.5"><BuildingIcon /> {DEV.company}</span>
                </div>
                <a
                  href={DEV.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium transition-opacity hover:opacity-80"
                  style={{ color: 'var(--accent)' }}
                >
                  <GitHubIcon /> github.com/{DEV.handle}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-9 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{ borderTop: '1px solid var(--border)', color: 'var(--muted)' }}
        >
          <span>© {year} DevTrace · Built by {DEV.name}</span>
          <a
            href={DEV.repo}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors"
            style={{ color: 'var(--muted)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
          >
            <GitHubIcon size={14} /> Source on GitHub →
          </a>
        </div>
      </div>
    </footer>
  );
}
