@echo off
cd /d "%~dp0"
call npm.cmd run web > expo-web-runtime.out.log 2> expo-web-runtime.err.log
