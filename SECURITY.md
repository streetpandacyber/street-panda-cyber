# Security Policy

## Reporting Vulnerabilities

Email: info@streetpandacyber.com (replace with real security contact before prod)
We aim to respond within 48h.

## Download Verification

All files in `/files/` should be verified:

```bash
sha256sum -c files/checksums.sha256
```

For EXE files:
1. Verify SHA256
2. Check code signature (Windows: Right-click → Properties → Digital Signatures)
3. Scan on https://virustotal.com
4. Run in sandbox first

## CDN Security

- Font Awesome loaded with SRI: `integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="`
- No inline scripts (removed onclick). If you add CSP, use:
  `script-src 'self'; style-src 'self' https://cdnjs.cloudflare.com`

## No Tracking

This static site uses only localStorage for download counts (client-side). No cookies, no third-party trackers.

For production, add privacy policy and DPA if you add analytics.
