"""Build and stage only public portfolio pages for GitHub Pages /docs publishing."""
from pathlib import Path
import shutil
import subprocess
import sys

root = Path(__file__).resolve().parent
subprocess.run([sys.executable, str(root / 'build.py')], cwd=root, check=True)
public = root / 'docs'
public.mkdir(exist_ok=True)
for name in ('index.html', 'contact.html'):
    shutil.copy2(root / name, public / name)
if (root / 'CNAME').exists():
    shutil.copy2(root / 'CNAME', public / 'CNAME')
(public / '.nojekyll').touch()
print('Staged docs/index.html, docs/contact.html, docs/CNAME and docs/.nojekyll. No deployment performed.')
