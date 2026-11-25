# Check stills for an episode: 3 frames (15/55/95 %) per shot -> output/<ep>/stills/sNNN.png, plus contact sheets gN.png (6 shots each).
#   powershell -File render/stills-ep.ps1 <episode-id> [shot numbers...]
param([Parameter(Mandatory = $true)][string]$ep, [string]$shots = "")
$only = @($shots -split "[, ]+" | Where-Object { $_ } | ForEach-Object { [int]$_ })
Set-Location $PSScriptRoot
$out = "..\output\$ep\stills"; New-Item -ItemType Directory -Force $out | Out-Null
$spec = Get-Content "..\output\$ep\shotspec.json" -Raw | ConvertFrom-Json
foreach ($s in $spec.shots) {
  $n = [int]$s.line
  if ($only.Count -and ($only -notcontains $n)) { continue }
  $d = [double]$s.dur
  $ts = (@(0.15, 0.55, 0.95) | ForEach-Object { "{0:N2}" -f ($_ * $d) }) -join ','
  node render.js "story.html?ep=$ep&shot=$n" ("$out\s{0:D3}.png" -f $n) $ts 2>&1 | Where-Object { $_ -notmatch '^stills' }
}
$all = @($spec.shots | ForEach-Object { [int]$_.line } | Sort-Object)
for ($g = 0; $g * 6 -lt $all.Count; $g++) {
  $set = $all[($g * 6)..([Math]::Min($all.Count, $g * 6 + 6) - 1)] | Where-Object { Test-Path ("$out\s{0:D3}.png" -f $_) }
  if (-not $set) { continue }
  $args2 = @(); $f = ""; $k = 0
  foreach ($n in $set) { $args2 += "-i"; $args2 += ("$out\s{0:D3}.png" -f $n); $f += "[$k]scale=900:533[v$k];"; $k++ }
  $chain = (0..($k - 1) | ForEach-Object { "[v$_]" }) -join ''
  ffmpeg -y -loglevel error @args2 -filter_complex "$f${chain}vstack=$k" "$out\g$g.png"
}
"stills done"
