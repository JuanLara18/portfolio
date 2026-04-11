# One-shot blog audio generator (Windows PowerShell).
# Ensures Ollama is running, then runs EN + ES generation.
#
# Usage (from anywhere):
#   front\scripts\generate_audio.ps1
#   front\scripts\generate_audio.ps1 --only slug
#   front\scripts\generate_audio.ps1 --force
#
# Extra args are forwarded to generate_blog_audio.py unchanged.

[CmdletBinding()]
param([Parameter(ValueFromRemainingArguments = $true)] [string[]] $PassThrough)

$ErrorActionPreference = 'Stop'

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$FrontDir  = Split-Path -Parent $ScriptDir
$LogDir    = Join-Path $ScriptDir 'audio-experiments'
$OllamaLog = Join-Path $LogDir   'ollama.log'
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

$OllamaBase = if ($env:OLLAMA_URL_BASE) { $env:OLLAMA_URL_BASE } else { 'http://localhost:11434' }

function Test-Ollama {
    try {
        $null = Invoke-WebRequest -Uri "$OllamaBase/api/tags" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

function Start-OllamaIfNeeded {
    if (Test-Ollama) {
        Write-Host '[ollama] already running'
        return
    }
    $ollamaCmd = Get-Command ollama -ErrorAction SilentlyContinue
    if (-not $ollamaCmd) {
        Write-Error "[ollama] 'ollama' not on PATH"
        exit 1
    }
    Write-Host '[ollama] starting...'
    Start-Process -FilePath $ollamaCmd.Source `
                  -ArgumentList 'serve' `
                  -RedirectStandardOutput $OllamaLog `
                  -RedirectStandardError  "$OllamaLog.err" `
                  -WindowStyle Hidden `
                  -PassThru | Out-Null
    for ($i = 1; $i -le 30; $i++) {
        if (Test-Ollama) {
            Write-Host "[ollama] ready after ${i}s"
            return
        }
        Start-Sleep -Seconds 1
    }
    Write-Error "[ollama] did not become ready in 30s. See $OllamaLog"
    exit 1
}

function Invoke-Lang {
    param([string] $Lang)
    Write-Host "[gen] --lang $Lang $($PassThrough -join ' ')"
    Push-Location $FrontDir
    try {
        $args = @('-u', 'scripts/generate_blog_audio.py', '--lang', $Lang) + $PassThrough
        & python @args
        if ($LASTEXITCODE -ne 0) {
            throw "generate_blog_audio.py --lang $Lang exited with $LASTEXITCODE"
        }
    } finally {
        Pop-Location
    }
}

Start-OllamaIfNeeded
Invoke-Lang -Lang 'en'
Invoke-Lang -Lang 'es'
Write-Host '[done] blog audio generated'
