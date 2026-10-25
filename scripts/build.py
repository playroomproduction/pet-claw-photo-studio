#!/usr/bin/env python3
"""Build the self-contained offline editor using Python's standard library."""
import base64,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def read(name): return (ROOT/name).read_text()
def b64(name): return base64.b64encode((ROOT/name).read_bytes()).decode()
data={'css':read('runtime/claw.css'),'js':read('runtime/claw.js'),'font':b64('runtime/outfit.ttf'),'sample':'data:image/png;base64,'+b64('samples/pet-heads.png'),'integration':read('runtime/INTEGRATION.md'),'notices':{n:read(n) for n in ['LICENSE','THIRD_PARTY_NOTICES.md','MEDIA.md','licenses/Outfit-OFL.txt']}}
safe=json.dumps(data,ensure_ascii=True).replace('<','\\u003c').replace('>','\\u003e').replace('&','\\u0026')
html=read('editor/index.src.html')
for key,value in {'EDITOR_STYLE':read('editor/editor.css'),'FACTORY_DATA':'window.PET_CLAW_DATA='+safe+';','FACTORY_SCRIPT':read('editor/factory.js'),'EDITOR_SCRIPT':read('editor/editor.js')}.items():html=html.replace('<!--'+key+'-->',value)
(ROOT/'index.html').write_text(html)
print('Built index.html:',len(html.encode()),'bytes')
