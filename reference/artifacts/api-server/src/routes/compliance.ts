import { Router, type IRouter } from "express";
import {
  ExportReportResponse,
  GetBidderParams,
  GetBidderResponse,
  GetDashboardResponse,
  ListActivityResponse,
  ListBiddersQueryParams,
  ListBiddersResponse,
  RunVerificationBody,
  RunVerificationResponse,
} from "@workspace/api-zod";
import { activities, bidders, type Bidder } from "./compliance-data";

const router: IRouter = Router();

const summaryFor = (bidder: Bidder) => ({
  id: bidder.id,
  companyName: bidder.companyName,
  pan: bidder.pan.replace(/^(.{3}).+(.{2})$/, "$1••••$2"),
  gstin: bidder.gstin.replace(/^(.{4}).+(.{3})$/, "$1••••••$2"),
  city: bidder.city,
  category: bidder.category,
  riskScore: bidder.riskScore,
  risk: bidder.risk,
  status: bidder.status,
  checksPassed: bidder.checksPassed,
  checksTotal: bidder.checksTotal,
  lastVerified: bidder.lastVerified,
  initials: bidder.initials,
});

router.get("/dashboard", (_req, res) => {
  const low = bidders.filter((bidder) => bidder.risk === "low").length;
  const medium = bidders.filter((bidder) => bidder.risk === "medium").length;
  const high = bidders.filter((bidder) => bidder.risk === "high").length;
  const verified = bidders.filter((bidder) => bidder.status === "verified").length;
  const needsReview = bidders.filter((bidder) => bidder.status === "review").length;
  const blocked = bidders.filter((bidder) => bidder.status === "blocked").length;
  const dashboard = {
    totalBidders: bidders.length,
    verified,
    needsReview,
    blocked,
    averageRisk: Math.round(bidders.reduce((sum, bidder) => sum + bidder.riskScore, 0) / bidders.length),
    verificationCoverage: 96,
    riskBreakdown: { low, medium, high },
    sourceHealth: [
      { source: "gstn", label: "GSTN", status: "Operational", latency: 420, lastSync: "2 min ago" },
      { source: "mca", label: "MCA21", status: "Operational", latency: 680, lastSync: "4 min ago" },
      { source: "epfo", label: "EPFO", status: "Operational", latency: 510, lastSync: "5 min ago" },
      { source: "esic", label: "ESIC", status: "Degraded", latency: 1450, lastSync: "8 min ago" },
    ],
  };
  res.json(GetDashboardResponse.parse(dashboard));
});

router.get("/bidders", (req, res) => {
  const parsed = ListBiddersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid bidder filters" });
    return;
  }
  const { search, risk = "all", status = "all" } = parsed.data;
  const normalizedSearch = search?.trim().toLowerCase();
  const result = bidders
    .filter((bidder) => !normalizedSearch || [bidder.companyName, bidder.city, bidder.category].some((value) => value.toLowerCase().includes(normalizedSearch)))
    .filter((bidder) => risk === "all" || bidder.risk === risk)
    .filter((bidder) => status === "all" || bidder.status === status)
    .map(summaryFor);
  res.json(ListBiddersResponse.parse(result));
});

router.get("/bidders/:bidderId", (req, res) => {
  const parsed = GetBidderParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid bidder id" });
    return;
  }
  const bidder = bidders.find((item) => item.id === parsed.data.bidderId);
  if (!bidder) {
    res.status(404).json({ error: "Bidder not found" });
    return;
  }
  res.json(GetBidderResponse.parse({ ...summaryFor(bidder), checks: bidder.checks, aiSummary: bidder.aiSummary, aiRecommendation: bidder.aiRecommendation, documents: bidder.documents }));
});

router.post("/verification/run", (req, res) => {
  const parsed = RunVerificationBody.safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid verification request" });
    return;
  }
  const selected = parsed.data.bidderIds?.length
    ? bidders.filter((bidder) => parsed.data.bidderIds?.includes(bidder.id))
    : bidders;
  const completedAt = new Date().toISOString();
  for (const bidder of selected) {
    bidder.lastVerified = completedAt;
    bidder.checks = bidder.checks.map((check) => ({ ...check, verifiedAt: completedAt }));
  }
  activities.unshift({
    id: activities.length + 1,
    action: "Verification run completed",
    detail: `${selected.length} bidder records checked across government and internal sources`,
    actor: "Compliance engine",
    createdAt: completedAt,
    tone: "success",
  });
  const result = {
    runId: `RUN-${completedAt.replace(/\D/g, "").slice(0, 14)}`,
    processed: selected.length,
    updated: selected.length,
    completedAt,
    aiProvider: "Gemini adapter · demo mode",
    message: "Government portal simulations and AI gap analysis completed successfully.",
  };
  res.json(RunVerificationResponse.parse(result));
});

router.get("/activity", (_req, res) => {
  res.json(ListActivityResponse.parse(activities.slice(0, 12)));
});

router.get("/reports/export", (_req, res) => {
  const report = {
    filename: `cpcl-compliance-${new Date().toISOString().slice(0, 10)}.csv`,
    generatedAt: new Date().toISOString(),
    columns: ["Company", "PAN", "GSTIN", "City", "Category", "Risk score", "Risk", "Status", "Checks passed", "Last verified"],
    rows: bidders.map((bidder) => [
      bidder.companyName,
      bidder.pan,
      bidder.gstin,
      bidder.city,
      bidder.category,
      String(bidder.riskScore),
      bidder.risk,
      bidder.status,
      `${bidder.checksPassed}/${bidder.checksTotal}`,
      bidder.lastVerified,
    ]),
  };
  res.json(ExportReportResponse.parse(report));
});

export default router;
