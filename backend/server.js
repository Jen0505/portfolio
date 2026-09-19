// Adapted from FormBee's MIT-licensed email-only backend. See NOTICE.md.
import express from 'express';
import {rateLimit} from 'express-rate-limit';
import nodemailer from 'nodemailer';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {existsSync} from 'node:fs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const recipient = 'jensebastian2001@gmail.com';
const emailPattern = /^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/;
export function createApp({transport, origin, sender, ready = false, rateMax = 5, trustProxy = false} = {}) {
  const app = express();
  app.disable('x-powered-by');
  if(trustProxy) app.set('trust proxy',trustProxy);
  // A single instance retains deduplication keys for one hour. No enquiry bodies are stored.
  const requests = new Map();
  app.use('/formbee', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    if (req.get('origin') && req.get('origin') !== origin) return res.status(403).json({error:'Origin not allowed'});
    if (req.get('origin') === origin) res.set('Access-Control-Allow-Origin', origin).set('Vary', 'Origin');
    res.set('Access-Control-Allow-Methods','GET, POST, OPTIONS').set('Access-Control-Allow-Headers','Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });
  app.get('/formbee/health', (req, res) => res.json({ready}));
  app.use(express.json({limit:'16kb'}));
  const limiter = rateLimit({windowMs:15*60*1000, limit:rateMax, standardHeaders:'draft-8', legacyHeaders:false,
    message:{error:'Please wait before sending another enquiry.'}});
  app.post('/formbee/email-only', limiter, async (req, res) => {
    if (!ready) return res.status(503).json({error:'Email delivery is not connected yet.'});
    const data = req.body;
    if (!data || typeof data !== 'object' || Array.isArray(data)) return res.status(400).json({error:'Invalid enquiry'});
    if (data.website) return res.status(400).json({error:'Unable to accept this enquiry.'});
    const limits={name:100,email:200,message:1800,company:150,opportunity:100,role:150,preferredContact:30,contactDetails:250,submissionId:100};
    const clean={};
    for (const [key,max] of Object.entries(limits)) {
      if (data[key] !== undefined && typeof data[key] !== 'string') return res.status(400).json({error:'Invalid field'});
      clean[key]=(data[key]||'').trim();
      if (clean[key].length>max || (key!=='message' && /[\r\n\u0000]/.test(clean[key]))) return res.status(400).json({error:'Invalid field'});
    }
    if (!clean.name || !emailPattern.test(clean.email) || !clean.message || data.consent !== true) return res.status(400).json({error:'Name, email, message and contact consent are required.'});
    if (!['Email','WhatsApp','LinkedIn'].includes(clean.preferredContact)) return res.status(400).json({error:'Choose a reply method.'});
    if (clean.preferredContact==='WhatsApp' && !/^\+?[0-9 ()-]{7,30}$/.test(clean.contactDetails)) return res.status(400).json({error:'Enter a WhatsApp number with country code.'});
    if (clean.preferredContact==='LinkedIn') {
      try { const url=new URL(clean.contactDetails); if(url.protocol!=='https:' || !['linkedin.com','www.linkedin.com'].includes(url.hostname) || !url.pathname.startsWith('/in/')) throw new Error(); }
      catch { return res.status(400).json({error:'Enter a valid LinkedIn profile URL.'}); }
    }
    const now=Date.now();
    for(const [key,entry] of requests) if(now-entry.created>3600000) requests.delete(key);
    const key=clean.submissionId;
    if (!/^[a-zA-Z0-9-]{16,100}$/.test(key)) return res.status(400).json({error:'Invalid submission reference'});
    if(requests.has(key)) {
      const entry=requests.get(key);
      return entry.sent ? res.json({success:true,reference:entry.reference}) : res.status(409).json({error:'This enquiry is still being processed.'});
    }
    const reference=randomUUID();
    requests.set(key,{created:now,reference,sent:false});
    const text=[`New portfolio enquiry for Jen Sebastian`, `Reference: ${reference}`,`Name: ${clean.name}`,`Reply email: ${clean.email}`,`Company: ${clean.company||'Not supplied'}`,`Opportunity: ${clean.opportunity}`,`Role / subject: ${clean.role||'Not supplied'}`,`Preferred response: ${clean.preferredContact||'Email'}`,`WhatsApp number / LinkedIn URL: ${clean.contactDetails||'Not supplied'}`,`Message:\n${clean.message}`].join('\n\n');
    try {
      const result=await transport.sendMail({from:sender,to:recipient,replyTo:{name:clean.name,address:clean.email},subject:`Portfolio enquiry: ${clean.role||clean.opportunity||'New opportunity'}`,text});
      if (!result.accepted?.some(address=>String(address).toLowerCase()===recipient)) throw new Error('Recipient not accepted');
      requests.get(key).sent=true;
      res.json({success:true,reference});
    } catch {
      requests.delete(key);
      // Do not log personal data, message bodies, tokens or SMTP responses.
      res.status(502).json({error:'Delivery could not be confirmed. Please contact Jen directly.'});
    }
  });
  // Only public delivery files are served. Never expose source, .env or SMTP credentials.
  for(const name of ['index.html','jen_sebastian_portfolio.html','contact.html']) app.get('/'+name,(req,res)=>res.sendFile(path.join(root,name)));
  app.get('/',(req,res)=>res.sendFile(path.join(root,'index.html')));
  app.use((err,req,res,next)=>res.status(err.type==='entity.too.large'?413:400).json({error:'The enquiry could not be processed.'}));
  return app;
}

if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const envFile=path.join(path.dirname(fileURLToPath(import.meta.url)),'.env');
  if(existsSync(envFile)) process.loadEnvFile(envFile);
  const port=Number(process.env.PORT||8787);
  const origin=process.env.PUBLIC_ORIGIN||`http://127.0.0.1:${port}`;
  const sender=process.env.EMAIL_FROM||process.env.EMAIL_USER;
  const configured=Boolean(process.env.EMAIL_PROVIDER&&process.env.EMAIL_USER&&process.env.EMAIL_PASSWORD&&sender);
  let transport,ready=false;
  if(configured) {
    const smtpPort=Number(process.env.SMTP_PORT||465);
    transport=nodemailer.createTransport({host:process.env.EMAIL_PROVIDER,port:smtpPort,secure:smtpPort===465,requireTLS:smtpPort!==465,auth:{user:process.env.EMAIL_USER,pass:process.env.EMAIL_PASSWORD},connectionTimeout:10000,socketTimeout:15000});
    try { await transport.verify(); ready=true; } catch { console.error('SMTP connection could not be verified. Check private server settings.'); }
  }
  createApp({transport,origin,sender,ready,trustProxy:process.env.TRUST_PROXY_HOPS?Number(process.env.TRUST_PROXY_HOPS):false}).listen(port,process.env.HOST||'127.0.0.1',()=>console.log(`Portfolio running on port ${port}. Email delivery ${ready?'connected':'not configured'}.`));
}
