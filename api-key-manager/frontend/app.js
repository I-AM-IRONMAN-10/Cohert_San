
let currentTab = "login";
let revealTimers = {}; // id → intervalId

function authHeaders() {
  return {
    "Content-Type": "application/json"
  };
}

function showStatus(containerId, message, isError = false) {
  const el = document.getElementById(containerId);
  el.innerHTML = `<div class="status-msg ${isError ? "error" : "success"}">${message}</div>`;
  setTimeout(() => { el.innerHTML = ""; }, 3500);
}

function expiryBadge(expiresAt) {
  const now = Date.now();
  const exp = new Date(expiresAt).getTime();
  const daysLeft = Math.ceil((exp - now) / 86400000);

  if (daysLeft <= 0) return `<span class="badge expired">⛔ Expired</span>`;
  if (daysLeft <= 7) return `<span class="badge warning">⚠️ ${daysLeft}d left</span>`;
  return `<span class="badge good">✅ ${daysLeft}d left</span>`;
}

function switchTab(tab) {
  currentTab = tab;
  document.getElementById("tabLogin").classList.toggle("active", tab === "login");
  document.getElementById("tabRegister").classList.toggle("active", tab === "register");
  document.getElementById("authSubmitBtn").textContent = tab === "login" ? "Login" : "Register";
  document.getElementById("authStatus").innerHTML = "";
}

async function submitAuth(e) {
  e.preventDefault();
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value;
  const btn = document.getElementById("authSubmitBtn");

  btn.disabled = true;
  btn.textContent = currentTab === "login" ? "Logging in…" : "Registering…";

  try {
    const endpoint = currentTab === "login" ? "/auth/login" : "/auth/register";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");

    if (currentTab === "register") {
      showStatus("authStatus", "Registered! Please log in.");
      switchTab("login");
    } else {
      showAppView();
    }
  } catch (err) {
    showStatus("authStatus", err.message, true);
  } finally {
    btn.disabled = false;
    btn.textContent = currentTab === "login" ? "Login" : "Register";
  }
}

async function logout() {
  try {
    await fetch("/auth/logout", { method: "POST" });
  } catch (err) {
    console.error("Logout error", err);
  }
  document.getElementById("appView").classList.add("hidden");
  document.getElementById("authView").classList.remove("hidden");
  document.getElementById("list").innerHTML = "";
}


function showAppView() {
  document.getElementById("authView").classList.add("hidden");
  document.getElementById("appView").classList.remove("hidden");
  load();
}


async function create() {
  const titleInput = document.getElementById("title");
  const secretInput = document.getElementById("secret");
  const title = titleInput.value.trim();
  const secret = secretInput.value.trim();

  if (!title || !secret) {
    showStatus("status", "Both title and secret are required.", true);
    return;
  }

  const btn = document.getElementById("createBtn");
  btn.disabled = true;
  btn.textContent = "Saving…";

  try {
    const res = await fetch("/api/create", {
      method: "POST",
      headers: authHeaders(),
      credentials: "same-origin",
      body: JSON.stringify({ title, secret }),
    });

    if (res.status === 401) { logout(); return; }
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.error || `Server error: ${res.status}`);
    }

    titleInput.value = "";
    secretInput.value = "";
    showStatus("status", "Key created successfully!");
    load();
  } catch (err) {
    showStatus("status", "Failed to create key: " + err.message, true);
  } finally {
    btn.disabled = false;
    btn.textContent = "+ Add Key";
  }
}


async function remove(id) {
  if (!confirm("Delete this key? This cannot be undone.")) return;
  try {
    const res = await fetch(`/api/${id}`, { 
      method: "DELETE", 
      headers: authHeaders(),
      credentials: "same-origin"
    });
    if (res.status === 401) { logout(); return; }
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    showStatus("status", "Key deleted.");
    load();
  } catch (err) {
    showStatus("status", "Failed to delete: " + err.message, true);
  }
}

async function rotate(id) {
  try {
    const res = await fetch(`/api/${id}/rotate`, { 
      method: "POST", 
      headers: authHeaders(),
      credentials: "same-origin"
    });
    if (res.status === 401) { logout(); return; }
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    showStatus("status", "Key rotated — re-encrypted with a new IV.");
    load();
  } catch (err) {
    showStatus("status", "Failed to rotate: " + err.message, true);
  }
}


async function reveal(id) {
  // Clear any existing reveal for this card
  if (revealTimers[id]) {
    clearInterval(revealTimers[id]);
    delete revealTimers[id];
    const existing = document.getElementById(`reveal-${id}`);
    if (existing) { existing.remove(); return; } // toggle off
  }

  try {
    const res = await fetch(`/api/${id}/reveal`, { 
      headers: authHeaders(),
      credentials: "same-origin"
    });
    if (res.status === 401) { logout(); return; }
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const { secret } = await res.json();

    const card = document.getElementById(`card-${id}`);
    let secs = 10;

    const box = document.createElement("div");
    box.id = `reveal-${id}`;
    box.className = "reveal-box";
    box.innerHTML = `
      <span class="reveal-value">${escapeHtml(secret)}</span>
      <span class="reveal-timer" id="timer-${id}">Clears in ${secs}s</span>
    `;
    card.appendChild(box);

    revealTimers[id] = setInterval(() => {
      secs--;
      const t = document.getElementById(`timer-${id}`);
      if (t) t.textContent = `Clears in ${secs}s`;
      if (secs <= 0) {
        clearInterval(revealTimers[id]);
        delete revealTimers[id];
        box.remove();
      }
    }, 1000);
  } catch (err) {
    showStatus("status", "Failed to reveal: " + err.message, true);
  }
}

function escapeHtml(str) {
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

async function load() {
  const container = document.getElementById("list");

  try {
    const res = await fetch("/api/list", { 
      headers: authHeaders(),
      credentials: "same-origin"
    });

    if (res.status === 401) { logout(); return; }
    if (!res.ok) throw new Error(`Server error: ${res.status}`);

    const data = await res.json();
    container.innerHTML = "";

    if (data.length === 0) {
      container.innerHTML = `<p class="empty">No keys stored yet. Add your first key above.</p>`;
      return;
    }

    data.forEach((d) => {
      const card = document.createElement("div");
      card.className = "item";
      card.id = `card-${d.id}`;

      const createdStr = new Date(d.createdAt).toLocaleDateString();
      const rotatedStr = d.rotatedAt ? `Rotated: ${new Date(d.rotatedAt).toLocaleDateString()}` : "";

      card.innerHTML = `
        <div class="item-top">
          <div class="item-title">${escapeHtml(d.title)}</div>
          <div class="item-actions">
            <button class="btn-sm" onclick="reveal('${d.id}')">👁 Reveal</button>
            <button class="btn-sm" onclick="rotate('${d.id}')">🔄 Rotate</button>
            <button class="btn-danger" onclick="remove('${d.id}')">Delete</button>
          </div>
        </div>
        <div class="item-meta">
          <span class="item-date">Created: ${createdStr}</span>
          ${rotatedStr ? `<span class="item-date">${rotatedStr}</span>` : ""}
          ${expiryBadge(d.expiresAt)}
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = `<p class="status-msg error">Could not load keys: ${err.message}</p>`;
  }
}


// Check if user is logged in by making a test request
async function checkAuthOnLoad() {
  try {
    const res = await fetch("/api/list", { 
      headers: authHeaders(),
      credentials: "same-origin"
    });
    if (res.ok) {
      showAppView();
    }
  } catch (err) {
    // Not logged in or error, stay on login view
  }
}

checkAuthOnLoad();
