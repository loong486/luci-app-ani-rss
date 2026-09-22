@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ================================================================
echo             luci-app-ani-rss 独立插件 GitHub 一键推送脚本
echo ================================================================
echo.

cd /d "%~dp0"

where git >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 当前系统未检测到 Git 命令，请先安装 Git for Windows:
    echo   https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)

:: 检查或初始化仓库
if not exist ".git" (
    echo [1/4] 正在初始化本地 Git 仓库...
    git init
)

:: 检查 Git 身份
git config user.name >nul 2>&1
if %errorlevel% neq 0 (
    set /p "GIT_NAME=请输入您的 Git 昵称/用户名: "
    set /p "GIT_EMAIL=请输入您的 Git 邮箱: "
    git config user.name "!GIT_NAME!"
    git config user.email "!GIT_EMAIL!"
)

:: 获取已配置远程地址
set "EXISTING_URL="
for /f "tokens=*" %%i in ('git remote get-url origin 2^>nul') do set "EXISTING_URL=%%i"

set "REPO_URL=%~1"
if not defined REPO_URL (
    if defined EXISTING_URL (
        echo [1/4] 检测到已关联的 GitHub 仓库:
        echo       !EXISTING_URL!
        echo.
        set /p "INPUT_URL=请输入新的仓库地址 (直接回车保持默认): "
        if "!INPUT_URL!"=="" (
            set "REPO_URL=!EXISTING_URL!"
        ) else (
            set "REPO_URL=!INPUT_URL!"
        )
    ) else (
        echo [1/4] 请配置远程 GitHub 仓库:
        echo 例如: https://github.com/your-username/luci-app-ani-rss.git
        set /p "REPO_URL=请输入您的 GitHub 仓库地址: "
    )
)

if not defined REPO_URL (
    echo [错误] 未提供仓库地址，操作中止。
    pause
    exit /b 1
)

git branch -M main >nul 2>&1
if defined EXISTING_URL (
    if not "!REPO_URL!"=="!EXISTING_URL!" (
        git remote set-url origin "!REPO_URL!"
    )
) else (
    git remote add origin "!REPO_URL!"
)

:: 检查并提交更改
echo.
echo [2/4] 检查本地更改...
set "STATUS_TEMP=%TEMP%\git_st_%RANDOM%.tmp"
git status --porcelain > "!STATUS_TEMP!"
set /a HAS_CHANGES=0
for %%A in ("!STATUS_TEMP!") do if %%~zA gtr 0 set HAS_CHANGES=1
del "!STATUS_TEMP!" 2>nul

if %HAS_CHANGES% equ 1 (
    echo 检测到本地有未提交的更新。
    set "COMMIT_MSG=%~2"
    if not defined COMMIT_MSG (
        set "DEFAULT_MSG=feat: update luci-app-ani-rss"
        set /p "COMMIT_MSG=请输入本次提交说明 (直接回车使用默认: !DEFAULT_MSG!): "
        if "!COMMIT_MSG!"=="" set "COMMIT_MSG=!DEFAULT_MSG!"
    )
    git add .
    git commit -m "!COMMIT_MSG!"
) else (
    echo 本地代码干净，直接推送已有提交。
)

:: 推送代码
echo.
echo [3/4] 正在推送到 GitHub: !REPO_URL! ...
git push -u origin main
if %errorlevel% equ 0 goto :push_success

echo.
echo ================================================================
echo [提示] 直接推送遇到拒绝，通常因为远程仓库刚创建包含 README 导致不同步。
echo.
echo 请选择处理方式:
echo   [1] 覆盖推送 (强制覆盖远程，适合全新空仓库) - 推荐
echo   [2] 变基拉取后推送 (git pull --rebase origin main)
echo   [3] 取消退出
echo ================================================================
set /p "RETRY_OPT=请输入选项编号 [1/2/3] (默认 1): "
if "!RETRY_OPT!"=="" set "RETRY_OPT=1"

if "!RETRY_OPT!"=="1" (
    echo 正在执行覆盖推送 (git push --force)...
    git push -u origin main --force
    if %errorlevel% equ 0 goto :push_success
)

if "!RETRY_OPT!"=="2" (
    echo 正在拉取远程更新...
    git pull --rebase origin main
    echo 正在重新推送...
    git push -u origin main
    if %errorlevel% equ 0 goto :push_success
)

echo.
echo [错误] 推送失败，请检查网络连接与 GitHub 写入权限。
pause
exit /b 1

:push_success
echo.
echo ================================================================
echo [4/4] 恭喜！luci-app-ani-rss 已成功推送到您的 GitHub 仓库！
echo 后续发布版本只需在 GitHub 创建 Release 或推送 tag (如 v1.0.0)，
echo 自动化工作流将自动打包归档产物。
echo ================================================================
echo.
pause
exit /b 0
