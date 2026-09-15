"""
AI Scam & Phishing Detector API Package.
"""

import sys
from pathlib import Path

# Ensure project root is on sys.path so sibling packages ('ml', 'dl') can be resolved
PROJECT_ROOT = str(Path(__file__).resolve().parents[2])
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)
