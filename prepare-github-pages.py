"""Build and stage only public portfolio pages for GitHub Pages /docs publishing."""
from pathlib import Path
import shutil
import subprocess
import sys

root = Path(__file__).resolve().parent
subprocess.run([sys.executable, str(root / 'build.py')], cwd=root, check=True)
public = root / 'docs'
public.mkdir(exist_ok=True)
for name in ('index.html', 'contact.html', 'index.html.version.json', 'contact.html.version.json'):
    shutil.copy2(root / name, public / name)
if (root / 'presentations').exists():
    shutil.copytree(root / 'presentations', public / 'presentations', dirs_exist_ok=True)
if (root / 'CNAME').exists():
    shutil.copy2(root / 'CNAME', public / 'CNAME')
(public / '.nojekyll').touch()
print('Staged website, presentations, custom domain and .nojekyll in docs/. No deployment performed.')
