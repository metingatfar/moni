$sampleRate = 16000
$bitsPerSample = 16
$channels = 1
$duration = 1
$numSamples = $sampleRate * $duration
$dataSize = $numSamples * ($bitsPerSample / 8) * $channels
$fileSize = 36 + $dataSize

$ms = New-Object System.IO.MemoryStream
$bw = New-Object System.IO.BinaryWriter($ms)

# RIFF header
$bw.Write([System.Text.Encoding]::ASCII.GetBytes('RIFF'))
$bw.Write([int32]$fileSize)
$bw.Write([System.Text.Encoding]::ASCII.GetBytes('WAVE'))

# fmt chunk
$bw.Write([System.Text.Encoding]::ASCII.GetBytes('fmt '))
$bw.Write([int32]16)
$bw.Write([int16]1)
$bw.Write([int16]$channels)
$bw.Write([int32]$sampleRate)
$bw.Write([int32]($sampleRate * $channels * $bitsPerSample / 8))
$bw.Write([int16]($channels * $bitsPerSample / 8))
$bw.Write([int16]$bitsPerSample)

# data chunk
$bw.Write([System.Text.Encoding]::ASCII.GetBytes('data'))
$bw.Write([int32]$dataSize)
for ($i = 0; $i -lt $numSamples; $i++) {
    $bw.Write([int16]0)
}

$bw.Flush()
$bytes = $ms.ToArray()
[System.IO.File]::WriteAllBytes("c:\Users\user\Desktop\moni\test_audio.wav", $bytes)
$bw.Close()
$ms.Close()
Write-Host "WAV dosyasi olusturuldu: test_audio.wav ($($bytes.Length) bytes)"
