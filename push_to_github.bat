@echo off
chcp 65001 >nul

echo ================================================================
echo             luci-app-ani-rss 鐙珛鎻掍欢 GitHub 涓€閿帹閫佽剼鏈?echo ================================================================
echo.

cd /d "%~dp0"

where git >nul 2>&1
if %errorlevel% equ 0 goto :has_git

echo [閿欒] 褰撳墠绯荤粺鏈娴嬪埌 Git 鍛戒护锛岃鍏堝畨瑁?Git for Windows:
echo   https://git-scm.com/download/win
echo.
pause
exit /b 1

:has_git
if not exist ".git" (
    echo [1/4] 鍒濆鍖栨湰鍦?Git 浠撳簱...
    git init
)

:: 妫€鏌?Git 韬唤
git config user.name >nul 2>&1
if %errorlevel% neq 0 (
    git config user.name "OpenWrt Developer"
    git config user.email "developer@openwrt.org"
)

:: 鑾峰彇杩滅▼婧?set "EXISTING_URL="
for /f "tokens=*" %%i in ('git remote get-url origin 2^>nul') do set "EXISTING_URL=%%i"

set "REPO_URL=%~1"
if not "%REPO_URL%"=="" goto :setup_remote

if not "%EXISTING_URL%"=="" (
    echo [1/4] 妫€娴嬪埌宸插叧鑱旂殑 GitHub 浠撳簱:
    echo       %EXISTING_URL%
    echo.
    set "INPUT_URL="
    set /p "INPUT_URL=璇疯緭鍏ユ柊鐨勪粨搴撳湴鍧€ [鐩存帴鍥炶溅淇濇寔榛樿]: "
) else (
    echo [1/4] 璇烽厤缃繙绋?GitHub 浠撳簱:
    echo 渚嬪: https://github.com/your-username/luci-app-ani-rss.git
    set "INPUT_URL="
    set /p "INPUT_URL=璇疯緭鍏ユ偍鐨?GitHub 浠撳簱鍦板潃: "
)

if "%INPUT_URL%"=="" (
    set "REPO_URL=%EXISTING_URL%"
) else (
    set "REPO_URL=%INPUT_URL%"
)

if "%REPO_URL%"=="" (
    echo [閿欒] 鏈彁渚涗粨搴撳湴鍧€锛屾搷浣滀腑姝€?    pause
    exit /b 1
)

:setup_remote
git branch -M main >nul 2>&1
if not "%EXISTING_URL%"=="" (
    if not "%REPO_URL%"=="%EXISTING_URL%" (
        git remote set-url origin "%REPO_URL%"
    )
) else (
    git remote add origin "%REPO_URL%"
)

:: 妫€鏌ュ伐浣滃尯
echo.
echo [2/4] 妫€鏌ユ湰鍦版枃浠剁姸鎬?..
git status --porcelain | findstr /r "." >nul 2>&1
if %errorlevel% neq 0 goto :no_uncommitted

set "COMMIT_MSG=%~2"
if "%COMMIT_MSG%"=="" (
    set "USER_MSG="
    set /p "USER_MSG=璇疯緭鍏ユ湰娆℃彁浜よ鏄?[鐩存帴鍥炶溅浣跨敤榛樿璇存槑]: "
) else (
    set "USER_MSG=%COMMIT_MSG%"
)

if "%USER_MSG%"=="" set "USER_MSG=feat: update luci-app-ani-rss"

echo 姝ｅ湪鏆傚瓨骞舵彁浜や唬鐮?..
git add .
git commit -m "%USER_MSG%"
goto :do_push

:no_uncommitted
echo 鏈湴浠ｇ爜骞插噣锛岀洿鎺ユ帹閫佸凡鏈夋彁浜ゃ€?
:do_push
echo.
echo [3/4] 姝ｅ湪鎺ㄩ€佸埌 GitHub: %REPO_URL% ...
git push -u origin main
if %errorlevel% equ 0 goto :push_success

echo.
echo ================================================================
echo [鎻愮ず] 鎺ㄩ€侀亣鍒伴棶棰橈紒
echo.
echo 甯歌鍘熷洜涓庤В鍐冲姙娉?
echo   1. 杩滅▼浠撳簱鍒氬垱寤哄寘鍚?README 瀵艰嚧涓嶅悓姝?(闇€寮哄埗瑕嗙洊)
echo   2. 缃戠粶杩炴帴澶辫触 (SSL/TLS Handshake Failed):
echo      - 璇峰紑鍚唬鐞?鍔犻€熻蒋浠?(濡?Watt Toolkit / Clash / 绉戝涓婄綉)
echo      - 鎴栬€呭鏋滄偍鐨勪唬鐞嗙鍙ｄ负 7890锛屽彲鍦ㄦ彁绀烘椂閰嶇疆 Git 浠ｇ悊
echo.
echo 璇烽€夋嫨澶勭悊鏂瑰紡:
echo   [1] 灏濊瘯寮哄埗瑕嗙洊鎺ㄩ€?(git push --force, 閫傜敤浜庡叏鏂扮┖浠撳簱) - 鎺ㄨ崘
echo   [2] 灏濊瘯鎷夊彇鍚堝苟 (git pull --rebase)
echo   [3] 璁剧疆 Git 浠ｇ悊骞堕噸璇?(濡?http://127.0.0.1:7890)
echo   [4] 鍙栨秷閫€鍑?echo ================================================================
set "RETRY_OPT="
set /p "RETRY_OPT=璇疯緭鍏ラ€夐」缂栧彿 [1/2/3/4] (榛樿 1): "
if "%RETRY_OPT%"=="" set "RETRY_OPT=1"

if "%RETRY_OPT%"=="1" (
    echo 姝ｅ湪鎵ц瑕嗙洊鎺ㄩ€?(git push --force)...
    git push -u origin main --force
    if %errorlevel% equ 0 goto :push_success
)

if "%RETRY_OPT%"=="2" (
    echo 姝ｅ湪鎷夊彇杩滅▼鏇存柊...
    git pull --rebase origin main
    echo 閲嶆柊鎺ㄩ€?..
    git push -u origin main
    if %errorlevel% equ 0 goto :push_success
)

if "%RETRY_OPT%"=="3" (
    set "PROXY_ADDR="
    set /p "PROXY_ADDR=璇疯緭鍏ヤ唬鐞嗗湴鍧€ (渚嬪 http://127.0.0.1:7890): "
    if not "%PROXY_ADDR%"=="" (
        git config --global http.proxy "%PROXY_ADDR%"
        git config --global https.proxy "%PROXY_ADDR%"
        echo 宸查厤缃?Git 浠ｇ悊涓?%PROXY_ADDR%锛屾鍦ㄩ噸鏂版帹閫?..
        git push -u origin main
        if %errorlevel% equ 0 goto :push_success
    )
)

echo.
echo ================================================================
echo [閿欒] 鎺ㄩ€佸け璐ワ紝璇锋鏌ョ綉缁滆繛鎺ヤ笌 GitHub 鍐欏叆鏉冮檺銆?echo ================================================================
pause
exit /b 1

:push_success
echo.
echo ================================================================
echo [4/4] 鎭枩锛乴uci-app-ani-rss 宸叉垚鍔熸帹閫佸埌鎮ㄧ殑 GitHub 浠撳簱锛?echo 鍚庣画鍙戝竷鐗堟湰鍙渶鍦?GitHub 鍒涘缓 Release 鎴栨帹閫?tag (濡?v1.0.0)锛?echo 鑷姩鍖栧伐浣滄祦灏嗚嚜鍔ㄦ墦鍖呭綊妗ｄ骇鐗┿€?echo ================================================================
echo.
pause
exit /b 0
