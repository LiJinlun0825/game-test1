@echo off
chcp 65001 >nul
REM Claude Code startup script - skip permission confirmation
REM Start Claude Code with --dangerously-skip-permissions flag

claude --dangerously-skip-permissions %*