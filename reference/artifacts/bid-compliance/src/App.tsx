import { useMemo, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useParams } from 'wouter';
import {
  Activity as ActivityIcon,
  AlertTriangle,
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  ClipboardCheck,
  Clock3,
  Download,
  FileCheck2,
  FileText,
  Filter,
  Gauge,
  Landmark,
  Loader2,
  Menu,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  XCircle,
} from 'lucide-react';
import {
  getGetBidderQueryKey,
  getGetDashboardQueryKey,
  getListActivityQueryKey,
  getListBiddersQueryKey,
  useExportReport,
  useGetBidder,
  useGetDashboard,
  useListActivity,
  useListBidders,
  useRunVerification,
  type Activity,
  type Bidder,
  type BidderDetail,
  type Dashboard,
  type ListBiddersParams,
  type RiskLevel,
} from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import './index.css';

const queryClient = new QueryClient();

const cx = (...classes: Array<string | false | undefined>) => classes.filter(Boolean).join(' ');

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function formatDateTime(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date);
}

const todayLabel = new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date());

function StatusPill({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string; icon: typeof Check }> = {
    verified: { label: 'Verified', className: 'bg-[#e1f2e9] text-[#236443]', icon: CheckCircle2 },
    review: { label: 'Needs review', className: 'bg-[#fbefcf] text-[#886218]', icon: AlertTriangle },
    blocked: { label: 'Blocked', className: 'bg-[#f8e1dc] text-[#a33d31]', icon: XCircle },
  };
  const item = config[status] ?? { label: status, className: 'bg-muted text-muted-foreground', icon: CircleDot };
  const Icon = item.icon;
  return <span className={cx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold', item.className)} data-testid={`status-${status}`}><Icon size={12} strokeWidth={2.4} />{item.label}</span>;
}

function RiskPill({ risk, score, compact = false }: { risk: RiskLevel | string; score?: number; compact?: boolean }) {
  const palette: Record<string, string> = {
    low: 'text-[#236443] bg-[#e1f2e9]',
    medium: 'text-[#886218] bg-[#fbefcf]',
    high: 'text-[#a33d31] bg-[#f8e1dc]',
  };
  return <span className={cx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize', palette[risk] ?? 'bg-muted text-muted-foreground')} data-testid={`risk-${risk}`}>
    <span className="h-1.5 w-1.5 rounded-full bg-current" />{compact ? risk : `${risk}${score !== undefined ? ` · ${score}/100` : ''}`}
  </span>;
}

function BrandMark({ small = false }: { small?: boolean }) {
  return <div className={cx('relative flex shrink-0 items-center justify-center rounded-lg bg-[#e2b94f] text-[#182b3c]', small ? 'h-8 w-8' : 'h-10 w-10')} aria-label="CPCL mark">
    <div className="absolute h-4 w-4 rounded-full border-2 border-[#182b3c]" />
    <div className="absolute h-1.5 w-1.5 rounded-full bg-[#182b3c]" />
    <div className="absolute bottom-1 h-px w-5 bg-[#182b3c]" />
  </div>;
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={cx('animate-pulse rounded-md bg-[#e8e6df]', className)} />;
}

function LoadingPage() {
  return <div className="space-y-6 p-5 md:p-8"><Skeleton className="h-8 w-52" /><Skeleton className="h-4 w-80" /><div className="grid gap-4 md:grid-cols-4"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div><Skeleton className="h-72" /></div>;
}

function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-[#d4b6aa] bg-[#fffaf5] p-8 text-center" data-testid="state-error">
    <div className="mb-4 rounded-full bg-[#f8e1dc] p-3 text-[#a33d31]"><ShieldAlert size={22} /></div>
    <h3 className="display text-xl font-semibold text-foreground">The register is out of reach</h3>
    <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">We could not load this compliance view. Try the connection again before making a decision.</p>
    {onRetry && <button onClick={onRetry} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90" data-testid="button-retry"><RefreshCw size={15} /> Retry connection</button>}
  </div>;
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center" data-testid="state-empty">
    <div className="mb-4 rounded-full bg-secondary p-3 text-primary"><ClipboardCheck size={22} /></div>
    <h3 className="display text-xl font-semibold">{title}</h3><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{detail}</p>
  </div>;
}

function MetricCard({ label, value, detail, accent, icon: Icon, trend }: { label: string; value: string | number; detail: string; accent: string; icon: typeof Gauge; trend?: 'up' | 'down' }) {
  return <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" data-testid={`metric-${label.toLowerCase().replace(/\s/g, '-')}`}>
    <div className={cx('absolute inset-y-0 left-0 w-1', accent)} />
    <div className="flex items-start justify-between"><div><div className="eyebrow text-muted-foreground">{label}</div><div className="display mt-3 text-3xl font-semibold tracking-tight">{value}</div></div><div className="rounded-lg bg-secondary p-2 text-primary"><Icon size={18} /></div></div>
    <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">{trend && (trend === 'up' ? <ArrowUpRight size={13} className="text-[#236443]" /> : <ArrowDownRight size={13} className="text-[#a33d31]" />)}{detail}</div>
  </div>;
}

function SectionHeading({ eyebrow, title, action }: { eyebrow: string; title: string; action?: ReactNode }) {
  return <div className="mb-4 flex items-end justify-between gap-4"><div><div className="eyebrow text-primary">{eyebrow}</div><h2 className="display mt-1 text-xl font-semibold tracking-tight">{title}</h2></div>{action}</div>;
}

function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = [
    { href: '/', label: 'Command center', icon: Gauge },
    { href: '/bidders', label: 'Bidder register', icon: Building2 },
    { href: '/activity', label: 'Audit activity', icon: ActivityIcon },
  ];
  return <div className="app-shell min-h-[100dvh] text-foreground">
    <aside className={cx('fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-300 md:translate-x-0', mobileOpen ? 'translate-x-0' : '-translate-x-full')} data-testid="navigation-sidebar">
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5"><BrandMark small /><div><div className="display text-base font-semibold tracking-tight">Bid Compliance</div><div className="eyebrow mt-0.5 text-sidebar-foreground/50">CPCL · PROCUREMENT</div></div></div>
      <div className="px-4 pt-7"><div className="eyebrow px-3 text-sidebar-foreground/40">Workspace</div><nav className="mt-3 space-y-1">{nav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={cx('group flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition', location === href ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/65 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground')} data-testid={`link-${label.toLowerCase().replace(/\s/g, '-')}`}><Icon size={17} strokeWidth={location === href ? 2.4 : 1.8} /><span>{label}</span>{location === href && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" />}</Link>)}</nav></div>
      <div className="mt-auto p-4"><div className="rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-4"><div className="flex items-center gap-2 text-xs font-semibold text-sidebar-foreground"><span className="h-2 w-2 rounded-full bg-[#80c59b]" /> Systems nominal</div><p className="mt-2 text-[11px] leading-5 text-sidebar-foreground/50">Government source adapters are monitored continuously.</p><Link href="/activity" className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-sidebar-primary" data-testid="link-view-system-activity">View system activity <ChevronRight size={12} /></Link></div><div className="mt-4 flex items-center gap-3 border-t border-sidebar-border pt-4"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#315064] text-[11px] font-bold text-[#e9d48a]">AR</div><div><div className="text-xs font-semibold">Ananya Rao</div><div className="text-[10px] text-sidebar-foreground/45">Procurement officer</div></div></div></div>
    </aside>
    {mobileOpen && <button className="fixed inset-0 z-30 bg-[#102433]/50 md:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu" data-testid="button-close-menu" />}
    <main className="min-h-[100dvh] md:pl-[248px]"><header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-border bg-background/90 px-5 backdrop-blur-md md:px-8"><div className="flex items-center gap-3"><button className="rounded-lg p-2 text-muted-foreground hover:bg-secondary md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu" data-testid="button-open-menu"><Menu size={20} /></button><div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex"><Landmark size={15} className="text-primary" /> Chennai · Refinery procurement</div></div><div className="flex items-center gap-3"><div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] text-muted-foreground sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-[#5cae7b]" /> Live workspace</div><div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">AR</div></div></header><div className="app-grid min-h-[calc(100dvh-72px)]">{children}</div></main>
  </div>;
}

function VerificationButton({ bidderIds, label = 'Run verification' }: { bidderIds?: number[]; label?: string }) {
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState<string | null>(null);
  const run = useRunVerification({
    mutation: {
      onSuccess: (result) => {
        queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListBiddersQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListActivityQueryKey() });
        if (bidderIds?.length) bidderIds.forEach((id) => queryClient.invalidateQueries({ queryKey: getGetBidderQueryKey(id) }));
        setSuccess(`${result.updated} record${result.updated === 1 ? '' : 's'} updated`);
      },
    },
  });
  return <div className="flex flex-wrap items-center gap-3">{success && <div className="flex items-center gap-2 rounded-lg bg-[#e1f2e9] px-3 py-2 text-xs font-semibold text-[#236443]" data-testid="status-verification-success"><CheckCircle2 size={14} /> {success}</div>}<button onClick={() => { setSuccess(null); run.mutate({ data: bidderIds ? { bidderIds } : {} }); }} disabled={run.isPending} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-wait disabled:opacity-70" data-testid="button-run-verification">{run.isPending ? <><Loader2 size={15} className="animate-spin" /> Verifying records…</> : <><RefreshCw size={15} /> {label}</>}</button>{run.isError && <span className="text-xs font-medium text-destructive" data-testid="status-verification-error">Verification could not be completed. Try again.</span>}</div>;
}

function ExportButton() {
  const report = useExportReport();
  const [message, setMessage] = useState<string | null>(null);
  const handleExport = async () => {
    setMessage(null);
    const result = await report.refetch();
    if (!result.data) return;
    const csv = [result.data.columns, ...result.data.rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = result.data.filename || 'cpcl-compliance-report.csv'; anchor.click(); URL.revokeObjectURL(url);
    setMessage('CSV downloaded');
  };
  return <div className="flex items-center gap-2">{message && <span className="text-xs font-semibold text-[#236443]" data-testid="status-export-success">{message}</span>}<button onClick={handleExport} disabled={report.isFetching} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-secondary disabled:opacity-60" data-testid="button-export-report">{report.isFetching ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />} Export CSV</button></div>;
}

function DashboardPage() {
  const dashboard = useGetDashboard();
  const queue = useListBidders({ status: 'review', risk: 'all' });
  const activity = useListActivity();
  if (dashboard.isLoading) return <LoadingPage />;
  if (dashboard.isError || !dashboard.data) return <div className="p-5 md:p-8"><ErrorState onRetry={() => dashboard.refetch()} /></div>;
  const data = dashboard.data as Dashboard;
  const totalRisk = data.riskBreakdown.low + data.riskBreakdown.medium + data.riskBreakdown.high || 1;
  return <div className="animate-in-soft p-5 md:p-8">
    <div className="mx-auto max-w-[1440px]">
       <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><div className="eyebrow text-primary">Control room / {todayLabel}</div><h1 className="display mt-2 text-3xl font-semibold tracking-tight md:text-[38px]">Good morning, Ananya.</h1><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Your bid register is in shape. Two decisions need a closer look before the next tender gate.</p></div><div className="flex flex-wrap items-center gap-2"><ExportButton /><VerificationButton label="Verify all records" /></div></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Total bidders" value={data.totalBidders} detail="Synthetic register · active scope" accent="bg-primary" icon={Building2} /><MetricCard label="Verified" value={data.verified} detail={`${data.verificationCoverage}% verification coverage`} accent="bg-[#5cae7b]" icon={BadgeCheck} trend="up" /><MetricCard label="Needs review" value={data.needsReview} detail="Require officer judgement" accent="bg-[#e2b94f]" icon={AlertTriangle} /><MetricCard label="Average risk" value={`${data.averageRisk}/100`} detail={`${data.blocked} blocked from shortlist`} accent="bg-[#c75a4b]" icon={BarChart3} trend="down" /></div>
      <div className="mt-7 grid gap-5 xl:grid-cols-[1.55fr_1fr]">
         <section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6"><SectionHeading eyebrow="Risk distribution" title="Where attention is needed" action={<Link href="/bidders" className="inline-flex items-center gap-1 text-xs font-semibold text-primary" data-testid="link-review-risk-register">Open register <ChevronRight size={14} /></Link>} /><div className="mt-7 flex items-end gap-5 sm:gap-8"><div className="flex h-40 flex-1 items-end gap-3 sm:gap-5">{(['low', 'medium', 'high'] as const).map((risk) => { const count = data.riskBreakdown[risk]; const height = Math.max(10, (count / totalRisk) * 100); return <div className="flex flex-1 flex-col items-center gap-3" key={risk} data-testid={`risk-column-${risk}`}><div className="relative flex h-32 w-full max-w-[110px] items-end rounded-t-md bg-secondary"><div className={cx('w-full rounded-t-md transition-all duration-700', risk === 'low' ? 'bg-[#5cae7b]' : risk === 'medium' ? 'bg-[#e2b94f]' : 'bg-[#c75a4b]')} style={{ height: `${height}%` }} /><span className="absolute inset-x-0 -top-6 text-center text-sm font-bold">{count}</span></div><span className="text-xs font-semibold capitalize text-muted-foreground">{risk} risk</span></div>; })}</div><div className="hidden w-36 shrink-0 border-l border-border pl-5 sm:block"><div className="eyebrow text-muted-foreground">Risk signal</div><div className="mt-3 text-2xl font-semibold">{data.averageRisk}<span className="text-xs font-normal text-muted-foreground"> / 100</span></div><p className="mt-1 text-xs leading-5 text-muted-foreground">Portfolio average across all active bidders.</p></div></div></section>
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6"><SectionHeading eyebrow="Source health" title="Government connections" action={<span className="flex items-center gap-1.5 text-[11px] font-medium text-[#236443]"><span className="h-1.5 w-1.5 rounded-full bg-[#5cae7b]" /> All nominal</span>} /><div className="divide-y divide-border">{data.sourceHealth.map((source) => <div key={source.source} className="flex items-center justify-between gap-3 py-3 first:pt-1 last:pb-0" data-testid={`source-health-${source.source}`}><div className="flex min-w-0 items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-primary"><ShieldCheck size={15} /></div><div className="min-w-0"><div className="truncate text-sm font-semibold">{source.label}</div><div className="mt-0.5 text-[11px] text-muted-foreground">Synced {formatDateTime(source.lastSync)}</div></div></div><div className="shrink-0 text-right"><div className="font-mono text-xs font-medium">{source.latency}ms</div><div className="mt-0.5 text-[10px] text-[#236443]">{source.status}</div></div></div>)}</div></section>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6"><SectionHeading eyebrow="Decision queue" title="Bidders needing judgement" action={<Link href="/bidders?status=review" className="inline-flex items-center gap-1 text-xs font-semibold text-primary" data-testid="link-open-queue">View all <ChevronRight size={14} /></Link>} />{queue.isLoading ? <div className="space-y-3"><Skeleton className="h-14" /><Skeleton className="h-14" /><Skeleton className="h-14" /></div> : queue.isError ? <ErrorState onRetry={() => queue.refetch()} /> : !queue.data?.length ? <EmptyState title="No decisions waiting" detail="The review queue is clear. New exceptions will appear here after verification." /> : <div className="divide-y divide-border">{queue.data.slice(0, 5).map((bidder) => <BidderRow bidder={bidder} key={bidder.id} />)}</div>}</section>
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6"><SectionHeading eyebrow="Audit trail" title="Recent activity" action={<Link href="/activity" className="inline-flex items-center gap-1 text-xs font-semibold text-primary" data-testid="link-open-activity">Full trail <ChevronRight size={14} /></Link>} />{activity.isLoading ? <div className="space-y-4"><Skeleton className="h-12" /><Skeleton className="h-12" /><Skeleton className="h-12" /></div> : activity.isError ? <ErrorState onRetry={() => activity.refetch()} /> : !activity.data?.length ? <EmptyState title="No activity yet" detail="Verification and shortlist decisions will be recorded here." /> : <div className="space-y-4">{activity.data.slice(0, 5).map((item) => <ActivityRow item={item} key={item.id} />)}</div>}</section>
      </div>
    </div>
  </div>;
}

function BidderRow({ bidder }: { bidder: Bidder }) {
  return <Link href={`/bidders/${bidder.id}`} className="group flex items-center justify-between gap-3 py-3.5 first:pt-1 last:pb-1" data-testid={`link-bidder-${bidder.id}`}><div className="flex min-w-0 items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#dce8e8] text-xs font-bold text-primary">{bidder.initials}</div><div className="min-w-0"><div className="truncate text-sm font-semibold group-hover:text-primary">{bidder.companyName}</div><div className="mt-1 truncate text-[11px] text-muted-foreground">{bidder.city} · {bidder.category}</div></div></div><div className="flex shrink-0 items-center gap-3"><RiskPill risk={bidder.risk} score={bidder.riskScore} compact /><ChevronRight size={15} className="text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" /></div></Link>;
}

function ActivityRow({ item }: { item: Activity }) {
  const tone = item.tone === 'success' ? 'bg-[#5cae7b]' : item.tone === 'warning' ? 'bg-[#e2b94f]' : 'bg-[#4c9dae]';
  return <div className="flex gap-3" data-testid={`activity-item-${item.id}`}><div className={cx('mt-1.5 h-2 w-2 shrink-0 rounded-full', tone)} /><div className="min-w-0"><div className="text-sm font-semibold leading-5">{item.action}</div><p className="mt-0.5 text-xs leading-5 text-muted-foreground">{item.detail}</p><div className="mt-1 text-[10px] text-muted-foreground">{item.actor} · {formatDateTime(item.createdAt)}</div></div></div>;
}

function BiddersPage() {
  const [search, setSearch] = useState('');
  const [risk, setRisk] = useState<ListBiddersParams['risk']>('all');
  const [status, setStatus] = useState<ListBiddersParams['status']>('all');
  const params = useMemo<ListBiddersParams>(() => ({ search: search || undefined, risk, status }), [search, risk, status]);
  const bidders = useListBidders(params);
  return <div className="animate-in-soft p-5 md:p-8"><div className="mx-auto max-w-[1440px]">
    <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><div className="eyebrow text-primary">Register / all suppliers</div><h1 className="display mt-2 text-3xl font-semibold tracking-tight md:text-[38px]">Bidder register</h1><p className="mt-2 text-sm text-muted-foreground">One evidence-led view of every supplier in the active tender scope.</p></div><div className="flex items-center gap-2"><ExportButton /><VerificationButton label="Refresh verification" /></div></div>
    <div className="mb-5 rounded-xl border border-border bg-card p-3 shadow-sm"><div className="flex flex-col gap-3 lg:flex-row"><label className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} type="search" placeholder="Search company, city or category…" className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15" data-testid="input-search-bidders" /></label><div className="flex flex-wrap gap-2"><div className="relative"><Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} /><select value={risk} onChange={(event) => setRisk(event.target.value as ListBiddersParams['risk'])} className="h-11 appearance-none rounded-lg border border-input bg-background pl-9 pr-8 text-sm outline-none focus:border-primary" data-testid="select-risk-filter"><option value="all">All risk levels</option><option value="low">Low risk</option><option value="medium">Medium risk</option><option value="high">High risk</option></select></div><select value={status} onChange={(event) => setStatus(event.target.value as ListBiddersParams['status'])} className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary" data-testid="select-status-filter"><option value="all">All statuses</option><option value="verified">Verified</option><option value="review">Needs review</option><option value="blocked">Blocked</option></select></div></div></div>
    {bidders.isLoading ? <div className="space-y-3"><Skeleton className="h-16" /><Skeleton className="h-16" /><Skeleton className="h-16" /><Skeleton className="h-16" /></div> : bidders.isError ? <ErrorState onRetry={() => bidders.refetch()} /> : !bidders.data?.length ? <EmptyState title="No bidders match" detail="Try widening the search or clearing one of the filters." /> : <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"><div className="hidden grid-cols-[minmax(260px,1.5fr)_1fr_1fr_1fr_1fr_28px] gap-4 border-b border-border bg-secondary/60 px-5 py-3 md:grid"><span className="eyebrow text-muted-foreground">Supplier</span><span className="eyebrow text-muted-foreground">Location</span><span className="eyebrow text-muted-foreground">Evidence</span><span className="eyebrow text-muted-foreground">Risk</span><span className="eyebrow text-muted-foreground">Status</span><span /></div><div className="divide-y divide-border">{bidders.data.map((bidder) => <Link href={`/bidders/${bidder.id}`} key={bidder.id} className="grid grid-cols-1 gap-3 px-5 py-4 transition hover:bg-secondary/40 md:grid-cols-[minmax(260px,1.5fr)_1fr_1fr_1fr_1fr_28px] md:items-center md:gap-4" data-testid={`row-bidder-${bidder.id}`}><div className="flex items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#dce8e8] text-xs font-bold text-primary">{bidder.initials}</div><div className="min-w-0"><div className="truncate text-sm font-semibold">{bidder.companyName}</div><div className="mt-1 text-[11px] text-muted-foreground">ID CPCL-{String(bidder.id).padStart(4, '0')} · {bidder.category}</div></div></div><div className="flex justify-between text-sm md:block"><span className="text-xs text-muted-foreground md:hidden">Location</span><span>{bidder.city}</span></div><div className="flex justify-between text-sm md:block"><span className="text-xs text-muted-foreground md:hidden">Evidence</span><span className="font-mono text-xs">{bidder.checksPassed}/{bidder.checksTotal} checks</span></div><div className="flex justify-between md:block"><span className="text-xs text-muted-foreground md:hidden">Risk score</span><RiskPill risk={bidder.risk} score={bidder.riskScore} /></div><div className="flex justify-between md:block"><span className="text-xs text-muted-foreground md:hidden">Status</span><StatusPill status={bidder.status} /></div><ChevronRight size={16} className="hidden text-muted-foreground md:block" /></Link>)}</div></div>}
  </div></div>;
}

function CheckState({ state }: { state: string }) {
  const content: Record<string, { icon: typeof Check; label: string; className: string }> = {
    verified: { icon: CheckCircle2, label: 'Verified', className: 'text-[#236443]' },
    warning: { icon: AlertTriangle, label: 'Warning', className: 'text-[#886218]' },
    failed: { icon: XCircle, label: 'Failed', className: 'text-[#a33d31]' },
    pending: { icon: Clock3, label: 'Pending', className: 'text-muted-foreground' },
  };
  const item = content[state] ?? content.pending; const Icon = item.icon;
  return <div className={cx('flex items-center gap-1.5 text-xs font-semibold', item.className)} data-testid={`check-state-${state}`}><Icon size={15} /> {item.label}</div>;
}

function BidderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const bidder = useGetBidder(id);
  if (bidder.isLoading) return <LoadingPage />;
  if (bidder.isError || !bidder.data) return <div className="p-5 md:p-8"><ErrorState onRetry={() => bidder.refetch()} /></div>;
  const detail = bidder.data as BidderDetail;
  return <div className="animate-in-soft p-5 md:p-8"><div className="mx-auto max-w-[1240px]">
    <Link href="/bidders" className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition hover:text-primary" data-testid="link-back-to-register"><ArrowLeft size={14} /> Back to bidder register</Link>
    <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-start"><div className="flex items-start gap-4"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">{detail.initials}</div><div><div className="eyebrow text-primary">Supplier evidence / CPCL-{String(detail.id).padStart(4, '0')}</div><h1 className="display mt-1 text-3xl font-semibold tracking-tight md:text-[38px]">{detail.companyName}</h1><div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground"><span>{detail.city}</span><span className="text-border">•</span><span>{detail.category}</span><span className="text-border">•</span><span>Verified {formatDate(detail.lastVerified)}</span></div></div></div><div className="flex flex-wrap items-center gap-3"><StatusPill status={detail.status} /><RiskPill risk={detail.risk} score={detail.riskScore} /><VerificationButton bidderIds={[detail.id]} label="Re-run checks" /></div></div>
    <div className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
      <div className="space-y-5"><section className="rounded-xl border border-border bg-card shadow-sm"><div className="border-b border-border p-5 md:p-6"><SectionHeading eyebrow="Evidence ledger" title="Individual checks" action={<span className="font-mono text-xs text-muted-foreground">{detail.checksPassed}/{detail.checksTotal} passed</span>} /></div><div className="divide-y divide-border">{detail.checks.map((check) => <div key={check.key} className="p-5 md:p-6" data-testid={`check-${check.key}`}><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div className="flex items-start gap-3"><div className={cx('mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg', check.state === 'verified' ? 'bg-[#e1f2e9] text-[#236443]' : check.state === 'warning' ? 'bg-[#fbefcf] text-[#886218]' : check.state === 'failed' ? 'bg-[#f8e1dc] text-[#a33d31]' : 'bg-secondary text-muted-foreground')}><FileCheck2 size={16} /></div><div><div className="text-sm font-bold">{check.label}</div><div className="mt-1 flex flex-wrap gap-x-2 text-[11px] text-muted-foreground"><span>{check.source}</span><span>·</span><span>Verified {formatDateTime(check.verifiedAt)}</span></div></div></div><CheckState state={check.state} /></div><div className="mt-4 grid gap-3 rounded-lg bg-secondary/55 p-3 sm:grid-cols-[.8fr_1.2fr]"><div><div className="eyebrow text-muted-foreground">Returned value</div><div className="mt-1 break-all font-mono text-xs font-medium">{check.value}</div></div><div><div className="eyebrow text-muted-foreground">Finding</div><p className="mt-1 text-xs leading-5 text-foreground/75">{check.finding}</p></div></div>{check.recommendation && <div className="mt-3 flex gap-2 text-xs leading-5 text-muted-foreground"><Sparkles size={14} className="mt-0.5 shrink-0 text-primary" /> <span><strong className="text-foreground">Officer note:</strong> {check.recommendation}</span></div>}</div>)}</div></section>
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6"><SectionHeading eyebrow="Record controls" title="Identifiers" /><div className="space-y-4"><MaskedField label="PAN" value={detail.pan} /><MaskedField label="GSTIN" value={detail.gstin} /></div><div className="mt-5 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">Identifiers are masked in the review surface. Access to source documents remains governed by CPCL procurement controls.</div></section></div>
      <div className="space-y-5"><section className="relative overflow-hidden rounded-xl bg-[#183044] p-5 text-[#f6f0de] shadow-sm md:p-6"><div className="absolute right-[-32px] top-[-42px] h-36 w-36 rounded-full border border-[#e2b94f]/20" /><div className="absolute right-[-8px] top-[-18px] h-24 w-24 rounded-full border border-[#e2b94f]/15" /><SectionHeading eyebrow="Copilot assessment" title="AI reading of the record" /><div className="mt-5 border-l-2 border-[#e2b94f] pl-4 text-sm leading-6 text-[#e8e5d9]" data-testid="text-ai-summary">{detail.aiSummary}</div><div className="mt-6 rounded-lg bg-[#102433]/60 p-4"><div className="eyebrow text-[#e2b94f]">Recommendation</div><p className="mt-2 text-sm font-medium leading-6 text-[#f6f0de]" data-testid="text-ai-recommendation">{detail.aiRecommendation}</p></div><div className="mt-5 flex items-center gap-2 text-[11px] text-[#b8c3c6]"><Sparkles size={13} className="text-[#e2b94f]" /> AI output is advisory · officer decision is final</div></section><section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6"><SectionHeading eyebrow="Document evidence" title="Files on record" /><div className="space-y-2">{detail.documents.map((document) => <div key={document} className="flex items-center gap-3 rounded-lg border border-border bg-secondary/40 p-3" data-testid={`document-${document}`}><div className="rounded-md bg-card p-2 text-primary"><FileText size={15} /></div><span className="min-w-0 flex-1 truncate text-xs font-semibold">{document}</span><Check size={14} className="text-[#236443]" /></div>)}</div></section></div>
    </div>
  </div></div>;
}

function MaskedField({ label, value }: { label: string; value: string }) {
  const [revealed, setRevealed] = useState(false);
  const masked = value.length > 5 ? `${value.slice(0, 2)}••••${value.slice(-3)}` : value;
  return <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-secondary/35 p-3.5"><div><div className="eyebrow text-muted-foreground">{label}</div><div className="mt-1 font-mono text-sm">{revealed ? value : masked}</div></div><button onClick={() => setRevealed((current) => !current)} className="text-xs font-semibold text-primary hover:underline" data-testid={`button-toggle-${label.toLowerCase()}`}>{revealed ? 'Mask' : 'Reveal'}</button></div>;
}

function ActivityPage() {
  const activity = useListActivity();
  return <div className="animate-in-soft p-5 md:p-8"><div className="mx-auto max-w-[1040px]"><div className="mb-8"><div className="eyebrow text-primary">Audit / immutable trail</div><h1 className="display mt-2 text-3xl font-semibold tracking-tight md:text-[38px]">Activity log</h1><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Every verification run, evidence change and review signal in one accountable timeline.</p></div>{activity.isLoading ? <div className="space-y-4"><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /></div> : activity.isError ? <ErrorState onRetry={() => activity.refetch()} /> : !activity.data?.length ? <EmptyState title="No audit activity" detail="There is no recorded activity for the current workspace yet." /> : <div className="relative ml-3 border-l border-border pl-7">{activity.data.map((item, index) => <div className="relative mb-5 last:mb-0" key={item.id} data-testid={`timeline-item-${item.id}`}><div className={cx('absolute -left-[35px] top-5 flex h-4 w-4 items-center justify-center rounded-full border-4 border-background', item.tone === 'success' ? 'bg-[#5cae7b]' : item.tone === 'warning' ? 'bg-[#e2b94f]' : 'bg-[#4c9dae]')} /><div className="rounded-xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md md:p-6" style={{ animationDelay: `${index * 50}ms` }}><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><div className="text-sm font-bold">{item.action}</div><p className="mt-1.5 text-sm leading-6 text-muted-foreground">{item.detail}</p></div><div className="flex shrink-0 items-center gap-2 text-[11px] text-muted-foreground"><Clock3 size={13} /> {formatDateTime(item.createdAt)}</div></div><div className="mt-4 flex items-center gap-2 border-t border-border pt-3 text-[11px] font-medium text-muted-foreground"><div className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[9px] font-bold text-primary">{item.actor.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div>{item.actor}<span className="text-border">·</span><span className="capitalize">{item.tone} event</span></div></div></div>)}</div>}</div></div>;
}

function Router() {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}><AppShell><Switch><Route path="/" component={DashboardPage} /><Route path="/bidders" component={BiddersPage} /><Route path="/bidders/:id" component={BidderDetailPage} /><Route path="/activity" component={ActivityPage} /><Route component={NotFound} /></Switch></AppShell></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;