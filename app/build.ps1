# Builds Jepret.exe: copies the web app into app/dist, then compiles the Tauri shell.
# Run from the repo root:  ./app/build.ps1
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$dist = Join-Path $PSScriptRoot "dist"
if (Test-Path $dist) { Remove-Item $dist -Recurse -Force }
New-Item -ItemType Directory -Path $dist | Out-Null
$files = @(
    "index.html", "styles.css", "app.js", "core.js", "vocab.js",
    "icon.svg", "icon-192.png", "icon-512.png", "icon-maskable-512.png",
    "apple-touch-icon.png", "manifest.webmanifest"
)
foreach ($file in $files) {
    Copy-Item (Join-Path $root $file) $dist
}
Push-Location $PSScriptRoot
try {
    cargo build --release
    if ($LASTEXITCODE -ne 0) { throw "cargo build failed" }
} finally {
    Pop-Location
}
Get-Item (Join-Path $PSScriptRoot "target/release/jepret.exe") | Select-Object Name, Length
