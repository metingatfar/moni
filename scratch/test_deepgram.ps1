$uri = "http://localhost:5000/api/stt/deepgram"
$filePath = "c:\Users\user\Desktop\moni\test_audio.wav"
$fileBytes = [System.IO.File]::ReadAllBytes($filePath)
$boundary = [System.Guid]::NewGuid().ToString()
$LF = [char]10

$bodyLines = @()
$bodyLines += "--" + $boundary
$bodyLines += 'Content-Disposition: form-data; name="audio"; filename="record.wav"'
$bodyLines += "Content-Type: audio/wav"
$bodyLines += ""

$headerStr = ($bodyLines -join $LF) + $LF
$headerBytes = [System.Text.Encoding]::UTF8.GetBytes($headerStr)
$footerStr = $LF + "--" + $boundary + "--" + $LF
$footerBytes = [System.Text.Encoding]::UTF8.GetBytes($footerStr)

$ms = New-Object System.IO.MemoryStream
$ms.Write($headerBytes, 0, $headerBytes.Length)
$ms.Write($fileBytes, 0, $fileBytes.Length)
$ms.Write($footerBytes, 0, $footerBytes.Length)
$bodyBytes = $ms.ToArray()
$ms.Close()

$headers = @{ "Content-Type" = "multipart/form-data; boundary=" + $boundary }

try {
    $response = Invoke-WebRequest -Uri $uri -Method POST -Headers $headers -Body $bodyBytes -TimeoutSec 15
    Write-Host "HTTP Status:" $response.StatusCode
    Write-Host "Response Body:" $response.Content
} catch {
    Write-Host "ERROR:" $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Response Body:" $reader.ReadToEnd()
    }
}
