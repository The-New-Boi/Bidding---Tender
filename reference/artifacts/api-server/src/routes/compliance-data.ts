export type Risk = "low" | "medium" | "high";
export type Status = "verified" | "review" | "blocked";
export type CheckState = "verified" | "warning" | "failed" | "pending";

export type ComplianceCheck = {
  key: string;
  label: string;
  source: string;
  state: CheckState;
  value: string;
  finding: string;
  recommendation: string;
  verifiedAt: string;
};

export type Bidder = {
  id: number;
  companyName: string;
  pan: string;
  gstin: string;
  city: string;
  category: string;
  riskScore: number;
  risk: Risk;
  status: Status;
  checksPassed: number;
  checksTotal: number;
  lastVerified: string;
  initials: string;
  checks: ComplianceCheck[];
  aiSummary: string;
  aiRecommendation: string;
  documents: string[];
};

const companies = [
  "Apex Industrial Systems",
  "Coromandel Process Works",
  "Delta Mechanical & Engineering",
  "East Coast Energy Services",
  "Harbourline Logistics",
  "Indus Valve Technologies",
  "Kaveri Industrial Supplies",
  "Marina Automation Works",
  "Northridge Fabrication",
  "Orbit Safety Solutions",
  "Peninsula Engineering Co.",
  "Southern Tank & Piping",
];
const cities = ["Chennai", "Coimbatore", "Bengaluru", "Hyderabad", "Visakhapatnam", "Pune"];
const categories = ["Mechanical", "Electrical", "Civil", "Instrumentation", "Logistics", "Safety"];
const checkLabels = [
  ["pan", "PAN identity", "Income Tax"],
  ["gstin", "GST registration", "GSTN"],
  ["mca", "MCA company status", "MCA21"],
  ["epfo", "EPFO registration", "EPFO"],
  ["esi", "ESI registration", "ESIC"],
  ["blacklist", "Blacklist screening", "CPCL vendor registry"],
  ["financial", "Financial capacity", "Bank statement"],
  ["performance", "Past performance", "CPCL contracts"],
] as const;

const pad = (value: number, length: number) => value.toString().padStart(length, "0");
const dateFor = (daysAgo: number) => {
  const date = new Date("2026-08-27T09:30:00Z");
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString();
};
const initialsFor = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

function panFor(id: number) {
  return `A${String.fromCharCode(65 + (id % 26))}KPM${pad(id, 4)}Q`;
}

function gstinFor(id: number) {
  return `33A${String.fromCharCode(65 + (id % 26))}KPM${pad(id, 4)}Q1Z${id % 10}`;
}

function buildChecks(id: number, status: Status, verifiedAt: string): ComplianceCheck[] {
  const blocked = status === "blocked";
  const review = status === "review";
  const failedKey = blocked ? (id % 4 === 0 ? "blacklist" : "financial") : undefined;
  const warningKey = review ? checkLabels[(id + 2) % checkLabels.length][0] : undefined;

  return checkLabels.map(([key, label, source], index) => {
    const state: CheckState =
      key === failedKey ? "failed" : key === warningKey ? "warning" : "verified";
    const value =
      key === "pan"
        ? panFor(id)
        : key === "gstin"
          ? gstinFor(id)
          : state === "failed"
            ? "Exception found"
            : state === "warning"
              ? "Needs document refresh"
              : index % 2 === 0
                ? "Active / matched"
                : "Clear";
    const finding =
      state === "failed"
        ? key === "blacklist"
          ? "Entity resembles a restricted vendor record."
          : "Declared capacity could not be matched to the latest financial evidence."
        : state === "warning"
          ? "Record is valid but supporting evidence is older than the policy window."
          : "Source response matched the bidder declaration.";
    const recommendation =
      state === "failed"
        ? "Hold bid evaluation and request procurement officer review."
        : state === "warning"
          ? "Request an updated certificate before award recommendation."
          : "No action required.";
    return { key, label, source, state, value, finding, recommendation, verifiedAt };
  });
}

function buildBidder(id: number): Bidder {
  const status: Status = id <= 126 ? "verified" : id <= 172 ? "review" : "blocked";
  const risk: Risk = status === "verified" ? (id % 8 === 0 ? "medium" : "low") : status === "review" ? "medium" : "high";
  const riskScore = status === "verified" ? 12 + (id % 28) : status === "review" ? 42 + (id % 24) : 74 + (id % 24);
  const companyName = `${companies[(id - 1) % companies.length]} ${id > companies.length ? `#${pad(id, 3)}` : ""}`.trim();
  const lastVerified = dateFor(id % 6);
  const checks = buildChecks(id, status, lastVerified);
  const checksPassed = checks.filter((check) => check.state === "verified").length;

  return {
    id,
    companyName,
    pan: panFor(id),
    gstin: gstinFor(id),
    city: cities[(id - 1) % cities.length],
    category: categories[(id + 1) % categories.length],
    riskScore,
    risk,
    status,
    checksPassed,
    checksTotal: checks.length,
    lastVerified,
    initials: initialsFor(companyName),
    checks,
    aiSummary:
      status === "verified"
        ? "All critical identity, registration, and integrity checks are aligned with the bidder declaration."
        : status === "review"
          ? "The bidder is broadly compliant, but one evidence item needs a procurement officer decision before shortlist."
          : "Critical compliance evidence requires manual review before this bidder can proceed in the evaluation workflow.",
    aiRecommendation:
      status === "verified"
        ? "Eligible for the next stage. Preserve this verification snapshot with the tender file."
        : status === "review"
          ? "Keep in review and request the missing or refreshed evidence within 2 business days."
          : "Do not advance until the exception is resolved and a fresh verification run is completed.",
    documents: ["Certificate of incorporation", "GST registration certificate", "Bank capacity letter", "Past performance statement"],
  };
}

export const bidders: Bidder[] = Array.from({ length: 200 }, (_, index) => buildBidder(index + 1));

export const activities = [
  { id: 1, action: "Verification run completed", detail: "200 bidder records checked across 8 sources", actor: "Compliance engine", createdAt: "2026-08-27T09:24:00Z", tone: "success" as const },
  { id: 2, action: "High-risk bidder flagged", detail: "Southern Tank & Piping #198 · financial capacity", actor: "AI review", createdAt: "2026-08-27T09:18:00Z", tone: "warning" as const },
  { id: 3, action: "Evidence snapshot saved", detail: "Tender CPCL/PROC/26-081 · verification batch 04", actor: "A. Raman", createdAt: "2026-08-27T08:56:00Z", tone: "info" as const },
  { id: 4, action: "Source sync healthy", detail: "GSTN, MCA21, EPFO, and ESIC responded within SLA", actor: "System monitor", createdAt: "2026-08-27T08:31:00Z", tone: "success" as const },
  { id: 5, action: "Manual review assigned", detail: "9 bidders routed to procurement desk", actor: "A. Raman", createdAt: "2026-08-27T08:12:00Z", tone: "info" as const },
];
