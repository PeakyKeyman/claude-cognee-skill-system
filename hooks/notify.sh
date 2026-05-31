#!/bin/bash

# Stop hook: macOS notification when Claude finishes a response
# Async — doesn't block Claude's response
# Only fires if terminal is not focused (user is away)

# Check if Terminal/iTerm is frontmost app — skip if user is watching
FRONTMOST=$(osascript -e 'tell application "System Events" to get name of first application process whose frontmost is true' 2>/dev/null)

# Notify if user isn't in the terminal
if [[ "$FRONTMOST" != "Terminal" && "$FRONTMOST" != "iTerm2" && "$FRONTMOST" != "Ghostty" && "$FRONTMOST" != "Alacritty" && "$FRONTMOST" != "WezTerm" ]]; then
  osascript -e 'display notification "Claude has finished." with title "Claude Code" sound name "Blow"' 2>/dev/null
fi

exit 0
