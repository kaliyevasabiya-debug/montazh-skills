# Windows port of export.sh: platform-specific FFmpeg encoding for rendered shorts.
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File export.ps1 -InputDir DIR [-Platform youtube|tiktok|instagram|all] [-OutputDir DIR] [-Force]
param(
    [Parameter(Mandatory = $true)][string]$InputDir,
    [string]$Platform = "all",
    [string]$OutputDir = ".\shorts",
    [switch]$Force
)
$ErrorActionPreference = "Stop"

if (-not (Test-Path $InputDir)) { Write-Output "{`"error`":`"Input directory not found: $InputDir`"}"; exit 1 }
New-Item -ItemType Directory -Force $OutputDir | Out-Null

$hasNvenc = $false
if (Get-Command nvidia-smi -ErrorAction SilentlyContinue) {
    # Listing the encoder is not enough (old drivers fail to open it) — do a real 1-frame probe.
    $ErrorActionPreference = "Continue"
    & ffmpeg -hide_banner -loglevel quiet -f lavfi -i color=black:s=256x256 -frames:v 1 -c:v h264_nvenc -f null - 2>$null
    if ($LASTEXITCODE -eq 0) { $hasNvenc = $true }
    $ErrorActionPreference = "Stop"
}

function Get-Args($plat) {
    $common = @("-af", "loudnorm=I=-14:TP=-1:LRA=11", "-pix_fmt", "yuv420p", "-movflags", "+faststart")
    switch ($plat) {
        "youtube" {
            $v = if ($hasNvenc) { @("-c:v", "h264_nvenc", "-preset", "p5", "-tune", "hq") } else { @("-c:v", "libx264", "-preset", "slow") }
            return $v + @("-b:v", "12M", "-maxrate", "14M", "-bufsize", "24M", "-profile:v", "high", "-level", "4.2", "-c:a", "aac", "-b:a", "192k", "-ar", "48000") + $common
        }
        "tiktok" {
            $v = if ($hasNvenc) { @("-c:v", "h264_nvenc", "-preset", "p5", "-tune", "hq", "-cq", "18") } else { @("-c:v", "libx264", "-preset", "slow", "-crf", "18") }
            return $v + @("-maxrate", "10M", "-bufsize", "20M", "-c:a", "aac", "-b:a", "128k", "-ar", "44100") + $common
        }
        "instagram" {
            $v = if ($hasNvenc) { @("-c:v", "h264_nvenc", "-preset", "p5", "-tune", "hq") } else { @("-c:v", "libx264", "-preset", "slow") }
            return $v + @("-b:v", "4500k", "-maxrate", "5000k", "-bufsize", "10M", "-profile:v", "high", "-level", "4.2", "-c:a", "aac", "-b:a", "128k", "-ar", "44100") + $common
        }
    }
}

$suffix = @{ youtube = "_yt"; tiktok = "_tt"; instagram = "_ig" }
$platforms = if ($Platform -eq "all") { @("youtube", "tiktok", "instagram") } else { @($Platform) }
$results = @()
$count = 0

foreach ($f in Get-ChildItem $InputDir -Filter "short_*.mp4") {
    $count++
    $num = $f.BaseName.Substring(6)
    foreach ($plat in $platforms) {
        if (-not $suffix.ContainsKey($plat)) { Write-Error "Unknown platform: $plat"; continue }
        $out = Join-Path $OutputDir ("short_" + $num + $suffix[$plat] + ".mp4")
        $skipped = $false
        if ((Test-Path $out) -and -not $Force) { $skipped = $true }
        else { & ffmpeg -y -hide_banner -loglevel error -i $f.FullName @(Get-Args $plat) $out }
        $dur = [math]::Round([double](& ffprobe -v quiet -show_entries format=duration -of csv=p=0 $out))
        $size = [math]::Round((Get-Item $out).Length / 1MB, 1)
        $results += [ordered]@{ file = $out; platform = $plat; duration = "${dur}s"; size_mb = $size; skipped = $skipped }
    }
}

[ordered]@{ action = "export"; platform = $Platform; nvenc = $hasNvenc; shorts_exported = $count; output_dir = $OutputDir; files = $results } | ConvertTo-Json -Depth 4
