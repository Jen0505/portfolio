"""Embed a deployment revision and emit a small no-store freshness-check manifest."""
from pathlib import Path
import hashlib, json
ROOT = Path(__file__).resolve().parent

def prepare_page(html, output_path):
    output_path = Path(output_path)
    head = ('<meta name="jen-page-revision" content="__JEN_REVISION__">'
            '<script>' + (ROOT / 'freshness.js').read_text() + '</script>')
    html = html.replace('</head>', head + '</head>', 1)
    revision = hashlib.sha256(html.encode()).hexdigest()[:20]
    html = html.replace('__JEN_REVISION__', revision)
    output_path.with_name(output_path.name + '.version.json').write_text(
        json.dumps({'revision': revision}) + '\n')
    return html
