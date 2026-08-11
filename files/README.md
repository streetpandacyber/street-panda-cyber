# Downloads folder

This folder contains downloadable assets for Street Panda Cyber.

Currently these are **placeholders** created during site fix (2026-08-11) to prevent 404s.

## Replace before production:

- `security-guide.pdf` → Real 2.5MB PDF guide
- `security-scripts.zip` → Real scripts (1.8MB)
- `malware-detector.exe` → Signed binary (5.2MB) + provide VirusTotal link
- `training-materials.zip` → Real training pack (12MB)
- `password-manager.zip` → Real tool (3.1MB) + audit report
- `network-scanner.exe` → Signed binary (4.7MB)

## Security checklist for EXEs:

1. Code-sign with EV cert
2. Publish SHA256 in `checksums.sha256` (auto-generated)
3. Link to VirusTotal scan
4. Provide GPG signature
5. Never serve EXE without HTTPS + CSP

Run `sha256sum files/* > files/checksums.sha256` after replacing.
