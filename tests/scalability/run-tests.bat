@echo off
REM Simple runner for the k6 scalability scripts in this folder.
REM Usage: run-tests.bat [BASE_URL]

setlocal
set "BASE_URL=%~1"
if "%BASE_URL%"=="" set "BASE_URL=https://prompt-forge.co.za"

echo Using BASE_URL=%BASE_URL%

REM Check that k6 is available
where k6 >nul 2>&1
if errorlevel 1 goto NO_K6

echo Running static load test (warm cache)...
k6 run --env BASE_URL=%BASE_URL% load-test.js

echo Running static load test (cold cache)...
k6 run --env BASE_URL=%BASE_URL% --env COLD_CACHE=1 load-test.js

echo Running API smoke test...
k6 run --env BASE_URL=%BASE_URL% api-smoke.js

goto END

:NO_K6
echo ERROR: k6 not found in PATH. Install k6 (https://k6.io) or add it to PATH and retry.
endlocal
exit /b 1

:END
endlocal
exit /b 0
