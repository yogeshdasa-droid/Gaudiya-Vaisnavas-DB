# OCR de un PDF escaneado con el motor de Windows (Windows.Media.Ocr + Windows.Data.Pdf), sin instalar nada.
# powershell -File ocr-pdf.ps1 -Pdf "ruta.pdf" -Out "salida.txt" [-Pages 3] [-Lang en-US] [-Scale 2.0]
# Escribe el texto con «\f» (salto de página) entre páginas, como pdftotext (así sigue sirviendo a cargar.mjs).
param([string]$Pdf, [string]$Out, [int]$Pages = 0, [string]$Lang = "en-US", [double]$Scale = 2.0)
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
$null = [Windows.Data.Pdf.PdfDocument, Windows.Data.Pdf, ContentType = WindowsRuntime]
$null = [Windows.Media.Ocr.OcrEngine, Windows.Media.Ocr, ContentType = WindowsRuntime]
$null = [Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType = WindowsRuntime]
$null = [Windows.Storage.Streams.InMemoryRandomAccessStream, Windows.Storage.Streams, ContentType = WindowsRuntime]
$null = [Windows.Globalization.Language, Windows.Globalization, ContentType = WindowsRuntime]
$null = [Windows.Graphics.Imaging.SoftwareBitmap, Windows.Graphics.Imaging, ContentType = WindowsRuntime]
$null = [Windows.Data.Pdf.PdfPageRenderOptions, Windows.Data.Pdf, ContentType = WindowsRuntime]

$asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
    $_.Name -eq "AsTask" -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq "IAsyncOperation``1" })[0]
function Await($op, [Type]$type) {
    $task = $asTaskGeneric.MakeGenericMethod($type).Invoke($null, @($op))
    try { $task.Wait(-1) | Out-Null } catch {
        $e = $_.Exception; while ($e.InnerException) { $e = $e.InnerException }
        throw "WinRT: $($e.Message)"
    }
    $task.Result
}
function AwaitAction($op) {
    $m = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq "AsTask" -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq "IAsyncAction" })[0]
    $t = $m.Invoke($null, @($op)); $t.Wait(-1) | Out-Null
}

$file = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync((Get-Item -LiteralPath $Pdf).FullName)) ([Windows.Storage.StorageFile])
$doc = Await ([Windows.Data.Pdf.PdfDocument]::LoadFromFileAsync($file)) ([Windows.Data.Pdf.PdfDocument])
$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage([Windows.Globalization.Language]::new($Lang))
if (-not $engine) { throw "Sin motor OCR para $Lang" }
$n = $doc.PageCount
if ($Pages -gt 0 -and $Pages -lt $n) { $n = $Pages }
$sb = New-Object System.Text.StringBuilder
for ($i = 0; $i -lt $n; $i++) {
    $page = $doc.GetPage($i)
    $stream = New-Object Windows.Storage.Streams.InMemoryRandomAccessStream
    $opt = New-Object Windows.Data.Pdf.PdfPageRenderOptions
    $w = [uint32]([Math]::Min(4000, [Math]::Max(1500, $page.Size.Width * $Scale)))
    $opt.DestinationWidth = $w
    AwaitAction ($page.RenderToStreamAsync($stream, $opt))
    $dec = Await ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
    $bmp = Await ($dec.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
    $res = Await ($engine.RecognizeAsync($bmp)) ([Windows.Media.Ocr.OcrResult])
    $lines = $res.Lines | ForEach-Object { $_.Text }
    [void]$sb.Append(($lines -join "`n")).Append("`f")
    $page.Dispose(); $stream.Dispose()
    if (($i + 1) % 10 -eq 0) { Write-Host "  $($i + 1)/$n" }
}
[System.IO.File]::WriteAllText($Out, $sb.ToString(), (New-Object System.Text.UTF8Encoding($false)))
Write-Host "OCR $n páginas → $Out"
