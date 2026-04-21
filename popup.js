const states = {
  detecting: document.getElementById("state-detecting"),
  notMr: document.getElementById("state-not-mr"),
  ready: document.getElementById("state-ready"),
  loading: document.getElementById("state-loading"),
  success: document.getElementById("state-success"),
  error: document.getElementById("state-error"),
};

const mrInfo = document.getElementById("mr-info");
const errorMsg = document.getElementById("error-msg");

function showState(name) {
  Object.entries(states).forEach(([key, el]) => {
    el.classList.toggle("hidden", key !== name);
  });
}

// ---------------------------------------------------------------------------
// URL helpers
// ---------------------------------------------------------------------------

// Matches GitLab MR URLs like:
//   https://gitlab.com/group/project/-/merge_requests/113
//   https://gitlab.com/group/project/-/merge_requests/113/diffs
//   https://gitlab.example.com/group/sub/project/-/merge_requests/42
const MR_PATTERN = /^(https?:\/\/[^/]+\/.+\/-\/merge_requests\/(\d+))(\/.*)?$/;

function parseMrUrl(url) {
  const m = url.match(MR_PATTERN);
  if (!m) return null;
  return { base: m[1], mrNumber: m[2] };
}

function rawDiffUrl(base) {
  // merge_requests/113 → merge_requests/113.diff
  return base + ".diff";
}

// ---------------------------------------------------------------------------
// Core actions
// ---------------------------------------------------------------------------

let cachedDiff = null;
let currentBase = null;

async function fetchDiff(base) {
  if (cachedDiff && currentBase === base) return cachedDiff;

  const url = rawDiffUrl(base);
  const resp = await fetch(url, { credentials: "include" });

  if (!resp.ok) {
    throw new Error(`Failed to fetch diff (HTTP ${resp.status}). Make sure you're logged in to GitLab.`);
  }

  const text = await resp.text();
  if (!text.trim()) {
    throw new Error("Diff is empty — the MR may have no changes.");
  }

  cachedDiff = text;
  currentBase = base;
  return text;
}

async function handleAction(base, action) {
  showState("loading");
  try {
    const diff = await fetchDiff(base);

    if (action === "copy") {
      await navigator.clipboard.writeText(diff);
    } else {
      downloadFile(diff, base);
    }

    showState("success");
    setTimeout(() => showState("ready"), 1800);
  } catch (err) {
    errorMsg.textContent = err.message;
    showState("error");
  }
}

function downloadFile(content, base) {
  const parts = base.split("/");
  const mrNum = parts[parts.length - 1];
  const project = parts.slice(3, -3).join("-"); // rough project slug
  const filename = `${project}-mr-${mrNum}.diff`;

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) {
    showState("notMr");
    return;
  }

  const parsed = parseMrUrl(tab.url);
  if (!parsed) {
    showState("notMr");
    return;
  }

  mrInfo.textContent = `MR !${parsed.mrNumber} detected`;
  showState("ready");

  document.getElementById("btn-copy").addEventListener("click", () => {
    handleAction(parsed.base, "copy");
  });

  document.getElementById("btn-download").addEventListener("click", () => {
    handleAction(parsed.base, "download");
  });

  document.getElementById("btn-retry").addEventListener("click", () => {
    cachedDiff = null;
    handleAction(parsed.base, "copy");
  });
}

init();
