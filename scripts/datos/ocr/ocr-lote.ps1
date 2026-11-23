# OCR por lotes de los PDF de una carpeta → un .txt por PDF (nombre = número de Calibre entre corchetes).
# powershell -File ocr-lote.ps1 -Dir "O:\CHECK PDFS\escaneados" -OutDir "O:\CHECK PDFS\ocr" [-Excluir "Kathamrita"]
# Se puede parar y relanzar: salta los que ya tienen .txt. Registro en lote.log (junto a este script).
param([string]$Dir, [string]$OutDir, [string]$Excluir = "", [switch]$Invertir)
New-Item -ItemType Directory -Force $OutDir | Out-Null
$aqui = Split-Path -Parent $MyInvocation.MyCommand.Path
$log = Join-Path $aqui "lote.log"
$pdfs = Get-ChildItem -LiteralPath $Dir -Filter *.pdf | Where-Object { -not $Excluir -or $_.Name -notmatch $Excluir } | Sort-Object Length -Descending:$Invertir
"$(Get-Date -Format s) empieza: $($pdfs.Count) PDF" | Add-Content $log
foreach ($f in $pdfs) {
    $id = if ($f.Name -match '\[(\d+)\]\.pdf$') { $Matches[1] } else { $f.BaseName }
    $out = Join-Path $OutDir "$id.txt"
    if ((Test-Path -LiteralPath $out) -or (Test-Path -LiteralPath "$out.tmp")) { continue }
    $t = Get-Date
    try {
        & (Join-Path $aqui "ocr-pdf.ps1") -Pdf $f.FullName -Out "$out.tmp" | Out-Null
        Move-Item -LiteralPath "$out.tmp" $out -Force
        "$(Get-Date -Format s) ok $id ($([int]((Get-Date) - $t).TotalSeconds) s) $($f.Name)" | Add-Content $log
    } catch {
        "$(Get-Date -Format s) FALLO $id $($f.Name): $($_.Exception.Message)" | Add-Content $log
    }
}
"$(Get-Date -Format s) fin" | Add-Content $log
