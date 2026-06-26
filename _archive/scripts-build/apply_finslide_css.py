FILES = ["qranty-dashboard.html","qranty-kho-hang.html","qranty-repair-kanban.html",
         "qranty-bao-hanh.html","qranty-khach-hang.html","qranty-sidebar.html"]

BASE_CSS = """
.fin-slide-backdrop {
  position: fixed; inset: 0; background: rgba(15,23,42,.45); z-index: 500;
  opacity: 0; visibility: hidden; transition: opacity .2s ease, visibility .2s ease;
}
.fin-slide-backdrop.open { opacity: 1; visibility: visible; }
.fin-slide-panel {
  position: fixed; top: 0; right: 0; bottom: 0; width: 420px; max-width: 92vw;
  background: #fff; z-index: 501; box-shadow: -12px 0 40px rgba(15,23,42,.25);
  display: flex; flex-direction: column;
  transform: translateX(100%); transition: transform .25s ease;
}
.fin-slide-backdrop.open .fin-slide-panel { transform: translateX(0); }
.fin-slide-hdr {
  padding: 22px 22px 18px; background: linear-gradient(135deg, var(--p700) 0%, var(--p500) 60%, #60A5FA 100%);
  color: #fff; flex-shrink: 0;
}
.fin-slide-hdr-title { font-size: 17px; font-weight: 900; }
.fin-slide-hdr-sub { font-size: 12px; color: rgba(255,255,255,.85); font-weight: 600; margin-top: 4px; line-height: 1.5; }
.fin-slide-body { flex: 1; overflow-y: auto; padding: 18px 22px; }
.fin-slide-footer { padding: 16px 22px; border-top: 1px solid var(--n200); display: flex; gap: 10px; flex-shrink: 0; }
.fin-slide-footer .btn-secondary { flex: 0 0 auto; }
.fin-slide-footer .btn-primary { flex: 1; }
"""

for fname in FILES:
    with open(fname, encoding="utf-8") as f:
        html = f.read()
    idx = html.find("</style>")
    assert idx != -1
    html = html[:idx] + BASE_CSS + "\n" + html[idx:]
    with open(fname, "w", encoding="utf-8") as f:
        f.write(html)
    print(fname, "done")
