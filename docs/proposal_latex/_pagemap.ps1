cd c:\Users\Pongo\Desktop\AIC\Sakapinta\docs\proposal_latex
pdftotext -layout main.pdf main_text.txt
$raw = Get-Content main_text.txt -Raw -Encoding UTF8
$pages = $raw -split "`f"
Write-Host "Jumlah halaman:" $pages.Count
for ($i=0; $i -lt $pages.Count; $i++) {
    $txt = $pages[$i].Trim()
    $nonempty = @($txt -split "`n" | Where-Object { $_.Trim() -ne '' })
    $lineCount = $nonempty.Count
    $hasFig = if ($txt -match "Gambar") { " [FIG]" } else { "" }
    $preview = ($nonempty | Select-Object -First 3 | Out-String).Trim() -replace '\s+',' '
    Write-Output (($i+1).ToString() + ": lines=" + $lineCount + $hasFig + "] " + $preview.Substring(0, [Math]::Min(110, $preview.Length)))
}