# PowerShell launcher for LoanGuard (Windows)
# Usage: Open PowerShell, run from repo root: .\run.ps1

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoRoot

$backendDir = Join-Path $repoRoot 'backend'
$frontendDir = Join-Path $repoRoot 'frontend'

Write-Host "Starting LoanGuard (backend + frontend)"
Write-Host "Backend: $backendDir"
Write-Host "Frontend: $frontendDir"

# Activate venv if available
$venvActivate = Join-Path $backendDir '.venv\Scripts\Activate.ps1'
if (Test-Path $venvActivate) {
    Write-Host "Activating backend venv..."
    & $venvActivate
} else {
    Write-Host "No backend venv found at $venvActivate. Ensure Python/uvicorn is installed globally or create venv." -ForegroundColor Yellow
}

# Determine python executable to use
$pythonExe = ""
if (Test-Path (Join-Path $backendDir ".venv\Scripts\python.exe")) {
    $pythonExe = Join-Path $backendDir ".venv\Scripts\python.exe"
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonExe = (Get-Command python).Source
} else {
    Write-Error "Python not found. Install Python or create backend\.venv and install dependencies."
    exit 1
}

# Start backend
Write-Host "Starting backend with: $pythonExe -m uvicorn main:app --reload --port 8000"
$backendProc = Start-Process -FilePath $pythonExe -ArgumentList '-m','uvicorn','main:app','--reload','--port','8000' -WorkingDirectory $backendDir -PassThru
Start-Sleep -Seconds 2
Write-Host "Backend PID: $($backendProc.Id)"

# Start frontend
Write-Host "Starting frontend: npm run dev"
$npmCmd = Get-Command npm -ErrorAction SilentlyContinue
if ($npmCmd) {
    $npmPath = $npmCmd.Source
    # If npm is a .cmd shim (common on Windows), call it directly; otherwise use cmd.exe /c to run the npm command
    if ($npmPath -and $npmPath.ToLower().EndsWith('.cmd')) {
        $frontendProc = Start-Process -FilePath $npmPath -ArgumentList 'run','dev' -WorkingDirectory $frontendDir -PassThru
    } else {
        $frontendProc = Start-Process -FilePath 'cmd.exe' -ArgumentList '/c','npm run dev' -WorkingDirectory $frontendDir -PassThru
    }
    Start-Sleep -Seconds 2
    Write-Host "Frontend PID: $($frontendProc.Id)"
} else {
    Write-Error "npm not found. Install Node.js and npm or add npm to PATH."
}

Write-Host "\nLoanGuard is running."
Write-Host "Frontend: http://localhost:5173"
Write-Host "Backend: http://localhost:8000 (docs: /docs)"

Write-Host "\nTo stop both processes run these commands in PowerShell:"
Write-Host "Stop-Process -Id $($backendProc.Id) -Force"
Write-Host "Stop-Process -Id $($frontendProc.Id) -Force"

Write-Host "Or press Ctrl+C in this window to stop (if you started them in the foreground)."
