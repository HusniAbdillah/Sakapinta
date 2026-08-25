$raw = Get-Content main_text.txt -Raw -Encoding UTF8
$pages = $raw -split "`f"
Write-Output ("Jumlah halaman (split-by-ff): " + $pages.Count)
for ($i=0; $i -lt $pages.Count; $i++) {
    $txt = $pages[$i].Trim()
    $nonempty = @($txt -split "`n" | Where-Object { $_.Trim() -ne '' })
    $hasFig = if ($txt -match "Gambar") { " [FIG]" } else { "" }
    $preview = ($nonempty | Select-Object -First 1).Trim() -replace '\s+',' '
    Write-Output (("{0:D2}" -f ($i+1)) + ": lines=" + ($nonempty.Count) + $hasFig + " " + $preview.Substring(0, [Math]::Min(90, $preview.Length)))
}