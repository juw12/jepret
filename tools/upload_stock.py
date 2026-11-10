"""Upload Jepret keepers to Shutterstock (FTPS) and Adobe Stock (SFTP).

Point it at the folder Jepret saved ("Copy keepers (words inside) + CSV to a folder").
Each photo already carries its title and keywords inside (XMP + IPTC), so both sites
fill them in on their own. What stays with you, on purpose:

- Shutterstock: open the contributor dashboard, check the batch and press Submit.
- Adobe Stock: SFTP only works once Adobe has enabled it for your account
  (contributor portal > Upload > FTP/SFTP shows your SFTP ID and password).
  Files uploaded by SFTP go straight to Adobe's review.
- You confirm you own the photos and have releases where needed.

Usage
    python tools/upload_stock.py D:\\stock\\2026-11-08 --shutterstock --adobe
    python tools/upload_stock.py D:\\stock --shutterstock --watch      # keep uploading new photos
    python tools/upload_stock.py D:\\stock --shutterstock --dry-run    # show what would be sent

Credentials come from environment variables, or you are asked once:
    JEPRET_SHUTTERSTOCK_USER, JEPRET_SHUTTERSTOCK_PASSWORD   (your Shutterstock login)
    JEPRET_ADOBE_SFTP_ID, JEPRET_ADOBE_SFTP_PASSWORD         (from the Adobe Stock portal)
Adobe needs `pip install paramiko`; Shutterstock uses only the Python standard library.
"""

from __future__ import annotations

import argparse
import ftplib
import getpass
import os
import sys
import time
from pathlib import Path

SHUTTERSTOCK_HOST = "ftps.shutterstock.com"
SHUTTERSTOCK_PORT = 21
ADOBE_HOST = "sftp.contributor.adobestock.com"
ADOBE_PORT = 22
LOG_NAME = "uploaded.txt"
XMP_MARKER = b"http://ns.adobe.com/xap/1.0/\x00"


def keepers(folder: Path) -> list[Path]:
    """JPEGs in the folder, without watermarked client proofs."""
    photos = [
        path for path in folder.iterdir()
        if path.is_file() and path.suffix.lower() in {".jpg", ".jpeg"} and not path.name.lower().startswith("proof_")
    ]
    return sorted(photos)


def has_words(path: Path) -> bool:
    """True when the photo carries an XMP title (written by Jepret) in its first 256 KB."""
    head = path.read_bytes()[: 256 * 1024]
    return XMP_MARKER in head and b"<dc:title>" in head


def read_log(folder: Path) -> set[str]:
    log = folder / LOG_NAME
    if not log.exists():
        return set()
    return {line.strip() for line in log.read_text(encoding="utf-8").splitlines() if line.strip()}


def append_log(folder: Path, entry: str) -> None:
    with (folder / LOG_NAME).open("a", encoding="utf-8") as log:
        log.write(entry + "\n")


def credential(env_name: str, prompt: str, secret: bool) -> str:
    value = os.environ.get(env_name)
    if value:
        return value
    return getpass.getpass(prompt) if secret else input(prompt)


class Shutterstock:
    name = "shutterstock"

    def __init__(self) -> None:
        self.user = credential("JEPRET_SHUTTERSTOCK_USER", "Shutterstock e-mail: ", secret=False)
        self.password = credential("JEPRET_SHUTTERSTOCK_PASSWORD", "Shutterstock password: ", secret=True)
        self.connection: ftplib.FTP_TLS | None = None

    def connect(self) -> None:
        connection = ftplib.FTP_TLS(timeout=60)
        connection.connect(SHUTTERSTOCK_HOST, SHUTTERSTOCK_PORT)
        connection.login(self.user, self.password)  # sends AUTH TLS first
        connection.prot_p()  # encrypt the file transfers too
        self.connection = connection

    def upload(self, path: Path) -> None:
        with path.open("rb") as handle:
            self.connection.storbinary(f"STOR {path.name}", handle)

    def close(self) -> None:
        if self.connection:
            try:
                self.connection.quit()
            except ftplib.all_errors:
                self.connection.close()


class AdobeStock:
    name = "adobe"

    def __init__(self) -> None:
        try:
            import paramiko  # noqa: F401
        except ImportError:
            sys.exit("Adobe Stock upload needs paramiko: python -m pip install paramiko")
        self.user = credential("JEPRET_ADOBE_SFTP_ID", "Adobe Stock SFTP ID: ", secret=False)
        self.password = credential("JEPRET_ADOBE_SFTP_PASSWORD", "Adobe Stock SFTP password: ", secret=True)
        self.transport = None
        self.sftp = None

    def connect(self) -> None:
        import paramiko

        self.transport = paramiko.Transport((ADOBE_HOST, ADOBE_PORT))
        self.transport.connect(username=self.user, password=self.password)
        self.sftp = paramiko.SFTPClient.from_transport(self.transport)

    def upload(self, path: Path) -> None:
        self.sftp.put(str(path), path.name)

    def close(self) -> None:
        if self.sftp:
            self.sftp.close()
        if self.transport:
            self.transport.close()


def upload_pending(folder: Path, sites: list, dry_run: bool) -> int:
    done = read_log(folder)
    photos = keepers(folder)
    sent = 0
    for site in sites:
        pending = [path for path in photos if f"{site.name}\t{path.name}" not in done]
        if not pending:
            continue
        missing_words = [path.name for path in pending if not has_words(path)]
        if missing_words:
            print(f"! {len(missing_words)} photo(s) have no words inside and will need typing on the site: "
                  + ", ".join(missing_words[:5]) + (" ..." if len(missing_words) > 5 else ""))
        if dry_run:
            for path in pending:
                print(f"[dry run] {site.name}: {path.name} ({path.stat().st_size / 1e6:.1f} MB)")
            continue
        site.connect()
        try:
            for index, path in enumerate(pending, start=1):
                print(f"{site.name}: {index}/{len(pending)} {path.name}", flush=True)
                site.upload(path)
                append_log(folder, f"{site.name}\t{path.name}")
                sent += 1
        finally:
            site.close()
    return sent


def main() -> None:
    parser = argparse.ArgumentParser(description="Upload Jepret keepers to stock sites.")
    parser.add_argument("folder", type=Path, help="folder with the keepers Jepret saved")
    parser.add_argument("--shutterstock", action="store_true", help="upload to Shutterstock by FTPS")
    parser.add_argument("--adobe", action="store_true", help="upload to Adobe Stock by SFTP (account must be enabled)")
    parser.add_argument("--watch", action="store_true", help="keep running and upload new photos every minute")
    parser.add_argument("--dry-run", action="store_true", help="list what would be uploaded, send nothing")
    args = parser.parse_args()

    folder = args.folder.expanduser().resolve()
    if not folder.is_dir():
        sys.exit(f"Not a folder: {folder}")
    if not (args.shutterstock or args.adobe):
        sys.exit("Choose at least one site: --shutterstock and/or --adobe")

    sites = []
    if args.shutterstock:
        sites.append(Shutterstock() if not args.dry_run else type("Dry", (), {"name": "shutterstock"})())
    if args.adobe:
        sites.append(AdobeStock() if not args.dry_run else type("Dry", (), {"name": "adobe"})())

    while True:
        sent = upload_pending(folder, sites, args.dry_run)
        if sent:
            print(f"Uploaded {sent} file(s). Shutterstock: open the dashboard and press Submit. "
                  "Adobe Stock: the photos are in review.")
        elif args.dry_run:
            print("Dry run: nothing was sent.")
        elif not args.watch:
            print("Nothing new to upload.")
        if not args.watch:
            break
        time.sleep(60)


if __name__ == "__main__":
    main()
