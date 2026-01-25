# 相对目录
$PackagesRoot = ".\components"
$TargetDir = ".\service\src\components"

# Python 可执行文件（可按实际路径改）
$Python = "python.exe"

# 确保目标目录存在
New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null

# 遍历每个包目录
Get-ChildItem $PackagesRoot -Directory | ForEach-Object {

    $PkgDir = $_.FullName
    Write-Host "==== Build package: $PkgDir ====" -ForegroundColor Cyan

    Push-Location $PkgDir

    # 清理旧构建产物
    Remove-Item -Recurse -Force -ErrorAction SilentlyContinue dist, build, *.egg-info

    # 构建 whl
    & $Python -m build --wheel

    if ($LASTEXITCODE -ne 0) {
        Write-Error "Build failed: $PkgDir"
        Pop-Location
        exit 1
    }

    # 拷贝 whl 到相对目录
    Get-ChildItem "dist\*.whl" | ForEach-Object {
        Copy-Item $_.FullName (Resolve-Path $TargetDir) -Force
        Write-Host "Copied $($_.Name) to $TargetDir" -ForegroundColor Green
    }

    Pop-Location
}

Write-Host "==== ALL PACKAGES BUILT SUCCESSFULLY ====" -ForegroundColor Yellow
