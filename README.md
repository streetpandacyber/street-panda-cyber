# 🐼 Street Panda Cyber — Download Center

**Protecting Your Digital Streets** — Free, open-source, professional-grade cybersecurity tools.

Live: `https://streetpandacyber.github.io/street-panda-cyber` (after enabling GitHub Pages)

---

## 🚀 What was fixed (Aug 11 2026)

This repo originally had **critical filename bugs** that broke deployment:

- `index.html.html` → `index.html` ✅
- `style.css.css` → `style.css` ✅
- `script.js.js` → `script.js` ✅
- Missing `files/` folder → added placeholders + SHA256 ✅
- CDN link now has SRI `integrity` + `crossorigin` ✅
- XSS fix: `textContent` vs `innerHTML` + no style-tag leak ✅
- Added skip-link, focus states, aria-live, reduced-motion ✅
- Dynamic footer year, actionable `mailto:`/`tel:` ✅
- Security notices & checksum UI ✅

See [ANALYSIS.md](./ANALYSIS.md) for full audit.

## 📁 File Structure

```
/
├── index.html          # Main page (fixed, accessible, SEO-ready)
├── style.css           # Brand styles (navy #1a2332 / orange #ff6b35)
├── script.js           # Secure localStorage tracking + toast
├── files/
│   ├── security-guide.pdf
│   ├── security-scripts.zip
│   ├── malware-detector.exe (placeholder)
│   ├── training-materials.zip
│   ├── password-manager.zip
│   ├── network-scanner.exe (placeholder)
│   ├── checksums.sha256
│   └── README.md
└── README.md
```

## 🛠️ Local Development

```bash
# Python
python3 -m http.server 8080
# or Node
npx serve .
# Open http://localhost:8080
```

No build step required.

## 🔒 Security Checklist (Before Production)

- [ ] Replace placeholder files in `/files/` with real signed assets
- [ ] Update SHA256 in `files/checksums.sha256`: `sha256sum files/* > files/checksums.sha256`
- [ ] Code-sign EXEs with EV cert, publish VirusTotal links
- [ ] Add CSP header (if using Netlify/Vercel): `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' https://cdnjs.cloudflare.com`
- [ ] Replace demo contact `info@streetpandacyber.com` / phone
- [ ] Add real LICENSE (MIT suggested, stated as open-source)
- [ ] Add privacy policy — currently local-only storage, no tracking
- [ ] Enable HTTPS + HSTS on hosting

## 📊 Download Tracking

Currently **local-only** (browser `localStorage`). Counts do not sync across users. For real analytics:

- Option A: Simple — Plausible / Umami analytics on download clicks
- Option B: Backend — Cloudflare Worker + KV counting
- Option C: Use GitHub Releases — GitHub tracks download counts for release assets automatically

## 🎨 Brand

- Navy Blue: `#1a2332` — trust, security
- Light Navy: `#2d3e50`
- Orange: `#ff6b35` — action, panda accent
- Light Orange: `#ff8c61`
- Font: Segoe UI
- Icons: Font Awesome 6.4.0

## 🤝 Contributing

See Issues for P2/P3 polish tasks. Keep it vanilla HTML/CSS/JS or propose Vite + Tailwind migration.

## 📄 License

Claimed as open-source in site — add explicit LICENSE file (MIT recommended).

---
© 2024-2026 Street Panda Cyber. Protecting Your Digital Streets 🐼
