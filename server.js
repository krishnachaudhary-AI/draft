const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, "data.json");
const PUBLIC_DIR = path.join(__dirname, "public");

// ---- tiny JSON-file "database" ----
function load() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, "utf8")); }
  catch { return []; }
}
function save(items) {
  fs.writeFileSync(DB_FILE, JSON.stringify(items, null, 2));
}

// undefined = not provided, ""/null = clear, otherwise must be a real YYYY-MM-DD date
function parseDue(v) {
  if (v === undefined) return undefined;
  if (v === null || v === "") return null;
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v))
    throw new Error("dueDate must be a valid YYYY-MM-DD date");
  const d = new Date(v + "T00:00:00Z");
  if (isNaN(d) || d.toISOString().slice(0, 10) !== v)
    throw new Error("dueDate must be a valid YYYY-MM-DD date");
  return v;
}

function send(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(body === undefined ? "" : JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch { reject(new Error("Invalid JSON")); }
    });
  });
}

async function handleApi(req, res, id) {
  const items = load();

  // READ (list)
  if (req.method === "GET" && !id) return send(res, 200, items);

  // READ (one)
  if (req.method === "GET") {
    const item = items.find((t) => t.id === id);
    return item ? send(res, 200, item) : send(res, 404, { error: "Not found" });
  }

  // CREATE
  if (req.method === "POST" && !id) {
    const body = await readBody(req);
    if (!body.title || !String(body.title).trim())
      return send(res, 400, { error: "title is required" });
    const item = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      title: String(body.title).trim(),
      done: false,
      dueDate: parseDue(body.dueDate) ?? null,
      createdAt: new Date().toISOString(),
    };
    items.push(item);
    save(items);
    return send(res, 201, item);
  }

  // UPDATE
  if (req.method === "PUT" && id) {
    const body = await readBody(req);
    const item = items.find((t) => t.id === id);
    if (!item) return send(res, 404, { error: "Not found" });
    if (body.title !== undefined) {
      if (!String(body.title).trim()) return send(res, 400, { error: "title cannot be empty" });
      item.title = String(body.title).trim();
    }
    if (body.done !== undefined) item.done = !!body.done;
    const due = parseDue(body.dueDate);
    if (due !== undefined) item.dueDate = due;
    save(items);
    return send(res, 200, item);
  }

  // DELETE all completed tasks
  if (req.method === "DELETE" && !id) {
    const remaining = items.filter((t) => !t.done);
    const removed = items.length - remaining.length;
    save(remaining);
    return send(res, 200, { removed });
  }

  // DELETE
  if (req.method === "DELETE" && id) {
    const idx = items.findIndex((t) => t.id === id);
    if (idx === -1) return send(res, 404, { error: "Not found" });
    items.splice(idx, 1);
    save(items);
    return send(res, 204);
  }

  send(res, 405, { error: "Method not allowed" });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const match = url.pathname.match(/^\/api\/tasks(?:\/([^/]+))?\/?$/);

  if (match) {
    try { await handleApi(req, res, match[1]); }
    catch (e) { send(res, 400, { error: e.message }); }
    return;
  }

  // static files
  const file = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
  const full = path.join(PUBLIC_DIR, path.normalize(file));
  if (!full.startsWith(PUBLIC_DIR)) return send(res, 403, { error: "Forbidden" });
  fs.readFile(full, (err, content) => {
    if (err) return send(res, 404, { error: "Not found" });
    const type = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" }[path.extname(full)] || "text/plain";
    res.writeHead(200, { "Content-Type": type });
    res.end(content);
  });
});

server.listen(PORT, () => console.log(`Task manager running at http://localhost:${PORT}`));
