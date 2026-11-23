# Pasa a imagen los «Maps & Diagrams» de Calibre (lista en mapas.json): cada PDF → JPG (una por página) con el motor de PDF de
# Windows; los que ya son imagen se copian. Una página → «<título>.jpg»; varias → carpeta «<título>\página-01.jpg …».
# powershell -File mapas-a-imagen.ps1 -Out "O:\Gaudiya Vaisnavas DB\Biblioteca\Maps & Diagrams" [-Ancho 3200]
param([string]$Out, [int]$Ancho = 3200)
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
$null = [Windows.Data.Pdf.PdfDocument, Windows.Data.Pdf, ContentType = WindowsRuntime]
$null = [Windows.Data.Pdf.PdfPageRenderOptions, Windows.Data.Pdf, ContentType = WindowsRuntime]
$null = [Windows.Graphics.Imaging.BitmapEncoder, Windows.Graphics.Imaging, ContentType = WindowsRuntime]
$null = [Windows.Storage.Streams.InMemoryRandomAccessStream, Windows.Storage.Streams, ContentType = WindowsRuntime]
$gen = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq "AsTask" -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq "IAsyncOperation``1" })[0]
$act = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq "AsTask" -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq "IAsyncAction" })[0]
function Await($op, [Type]$type) {
    $task = $gen.MakeGenericMethod($type).Invoke($null, @($op))
    try { $task.Wait(-1) | Out-Null } catch { $e = $_.Exception; while ($e.InnerException) { $e = $e.InnerException }; throw "WinRT: $($e.Message)" }
    $task.Result
}
function AwaitAction($op) { $t = $act.Invoke($null, @($op)); $t.Wait(-1) | Out-Null }

[void][System.IO.Directory]::CreateDirectory($Out)
$lista = Get-Content -LiteralPath (Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "mapas.json") -Raw -Encoding UTF8 | ConvertFrom-Json
$resumen = @()
foreach ($m in $lista) {
    $nombre = ($m.title -replace '\s+', ' ').Trim()
    if ($m.ext -ne ".pdf") {
        Copy-Item -LiteralPath $m.file -Destination (Join-Path $Out "$nombre$($m.ext)") -Force
        $resumen += "copiado  $nombre$($m.ext)"; continue
    }
    try {
        $file = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync((Get-Item -LiteralPath $m.file).FullName)) ([Windows.Storage.StorageFile])
        $doc = Await ([Windows.Data.Pdf.PdfDocument]::LoadFromFileAsync($file)) ([Windows.Data.Pdf.PdfDocument])
        $n = [int]$doc.PageCount
        $dest = if ($n -eq 1) { $Out } else { Join-Path $Out $nombre }
        if ($n -gt 1) { [void][System.IO.Directory]::CreateDirectory($dest) }
        for ($i = 0; $i -lt $n; $i++) {
            $page = $doc.GetPage($i)
            $stream = New-Object Windows.Storage.Streams.InMemoryRandomAccessStream
            $opt = New-Object Windows.Data.Pdf.PdfPageRenderOptions
            $opt.DestinationWidth = [uint32]$Ancho
            $opt.BitmapEncoderId = [Windows.Graphics.Imaging.BitmapEncoder]::JpegEncoderId
            AwaitAction ($page.RenderToStreamAsync($stream, $opt))
            $nom = if ($n -eq 1) { "$nombre.jpg" } else { ("página-{0:D2}.jpg" -f ($i + 1)) }
            $fs = [System.IO.File]::Create((Join-Path $dest $nom))
            $in = [System.IO.WindowsRuntimeStreamExtensions]::AsStreamForRead($stream.GetInputStreamAt(0))
            $in.CopyTo($fs); $fs.Dispose(); $in.Dispose(); $stream.Dispose(); $page.Dispose()
        }
        $resumen += "PDF→JPG $nombre ($n pág.)"
    } catch { $resumen += "FALLO   $nombre : $($_.Exception.Message)" }
}
$resumen
