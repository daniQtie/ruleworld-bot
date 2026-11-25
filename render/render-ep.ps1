# Render every shot of an episode (PowerShell: Git Bash leaves Edge processes behind) and write shots.json.
#   powershell -File render/render-ep.ps1 <episode-id> [shot numbers...]      ($env:JOIN_ONLY = "1" -> only re-join clips)
# A spec shot with "partOf": N is a second part of line N's slot (e.g. a cut to another location): its clip is
# appended to line N's clip. shots.json lists one clip per script line (pipeline/assemble.py needs that).
param([Parameter(Mandatory = $true)][string]$ep, [string]$shots = "")
$only = @($shots -split "[, ]+" | Where-Object { $_ } | ForEach-Object { [int]$_ })
Set-Location $PSScriptRoot
$out = "..\output\$ep"; New-Item -ItemType Directory -Force "$out\clips" | Out-Null
$spec = Get-Content "$out\shotspec.json" -Raw | ConvertFrom-Json
$t0 = Get-Date
if ($env:JOIN_ONLY -ne "1") {
  foreach ($s in $spec.shots) {
    $n = [int]$s.line
    $main = if ($s.partOf -ne $null) { [int]$s.partOf } else { $n }
    if ($only.Count -and ($only -notcontains $n) -and ($only -notcontains $main)) { continue }
    node render.js "story.html?ep=$ep&shot=$n" ("$out\clips\raw{0:D3}.mp4" -f $n) $s.dur | Out-Null
  }
}
# join parts -> sNN.mp4
$lines = @($spec.shots | Where-Object { $_.partOf -eq $null } | ForEach-Object { [int]$_.line })
foreach ($n in $lines) {
  $parts = @($n) + @($spec.shots | Where-Object { $_.partOf -eq $n } | ForEach-Object { [int]$_.line })
  $raws = @($parts | ForEach-Object { "$out\clips\raw{0:D3}.mp4" -f $_ })
  if (-not (Test-Path $raws[0])) { continue }
  $dst = "$out\clips\s{0:D2}.mp4" -f $n
  if ($raws.Count -eq 1) { Copy-Item -LiteralPath $raws[0] -Destination $dst -Force }
  else { $lst = "$out\clips\join.txt"; ($raws | ForEach-Object { "file '" + (Resolve-Path $_).Path.Replace('\', '/') + "'" }) | Out-File -Encoding ascii $lst; ffmpeg -y -loglevel error -f concat -safe 0 -i $lst -c copy $dst }
}
$json = '{"shots": [' + (($lines | ForEach-Object { '{"line": ' + $_ + ', "file": "clips/s' + ("{0:D2}" -f $_) + '.mp4"}' }) -join ', ') + ']}'
[IO.File]::WriteAllText((Resolve-Path $out).Path + "\shots.json", $json)
"done in $([int]((Get-Date) - $t0).TotalSeconds) s"
