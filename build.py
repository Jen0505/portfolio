from pathlib import Path
import base64,re,mimetypes,zipfile,json
root=Path(__file__).parent
def asset(m):
    p=root/'assets'/m.group(1)
    mime=mimetypes.guess_type(p.name)[0] or 'application/octet-stream'
    return 'data:'+mime+';base64,'+base64.b64encode(p.read_bytes()).decode()
def render(name):
    template=(root/name).read_text()
    template=template.replace('%%SITE_THEME%%',(root/'glass.css').read_text())
    if '%%CONTACT_SCRIPT%%' in template:
        config=json.loads((root/'contact-config.json').read_text())
        script=(root/'contact.js').read_text().replace('/*CONTACT_CONFIG*/null',json.dumps(config).replace('<','\\u003c'))
        template=template.replace('%%CONTACT_SCRIPT%%',script)
    return re.sub(r'\{\{([^}]+)\}\}',asset,template)
html=render('portfolio.template.html')
(root/'jen_sebastian_portfolio.html').write_text(html)
(root/'index.html').write_text(html)
(root/'contact.html').write_text(render('contact.template.html'))
with zipfile.ZipFile(root/'Jen-Sebastian-Portfolio.zip','w',zipfile.ZIP_DEFLATED) as bundle:
    for name in ['index.html','contact.html']:bundle.write(root/name,name)
    bundle.writestr('START-HERE.txt','Open index.html in your browser. Keep contact.html in the same folder. All images, contact card, and the brand presentation are embedded. Online email delivery requires the configured backend. Until connected, visitors can use email, WhatsApp and LinkedIn or prepare an email draft. To publish, upload both HTML files to the same folder on a static website host.\n')
with zipfile.ZipFile(root/'Jen-Sebastian-Email-Backend.zip','w',zipfile.ZIP_DEFLATED) as bundle:
    for name in ['index.html','jen_sebastian_portfolio.html','contact.html','contact-config.json']:
        bundle.write(root/name,name)
    for name in ['server.js','server.test.js','package.json','package-lock.json','Dockerfile','.env.example','LICENSE','NOTICE.md','SETUP.md']:
        bundle.write(root/'backend'/name,'backend/'+name)
print('Built portfolio, contact page, website ZIP and email backend ZIP.')
