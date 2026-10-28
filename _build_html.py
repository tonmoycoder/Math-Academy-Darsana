#!/usr/bin/env python3
"""
_build_html.py — Root build runner for Math Academy Darsana
Delegates to _src/build.py with --publish mode.
"""
import sys
import os
import subprocess

if __name__ == '__main__':
    args = sys.argv[1:]
    if not args:
        args = ['--publish', '--skip-pull']
    elif '--publish' not in args:
        args.append('--publish')

    script_path = os.path.join('_src', 'build.py')
    cmd = [sys.executable, script_path] + args
    res = subprocess.run(cmd)
    sys.exit(res.returncode)
