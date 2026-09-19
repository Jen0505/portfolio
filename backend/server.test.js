import test from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {createApp} from './server.js';
const recipient='jensebastian2001@gmail.com';
const valid={name:'Alex Recruiter',email:'alex@example.com',message:'A marketing role for Jen.',opportunity:'Marketing role',company:'Example Company',preferredContact:'WhatsApp',contactDetails:'+61400123456',consent:true,submissionId:'test-request-000001'};
async function fixture(t,options={}){
  const mail=[];
  const app=createApp({origin:'https://portfolio.example',sender:'verified@example.com',ready:true,rateMax:20,transport:{sendMail:async message=>{mail.push(message);return {accepted:[recipient]}}},...options});
  const server=app.listen(0,'127.0.0.1');await once(server,'listening');t.after(()=>new Promise(resolve=>server.close(resolve)));
  const base=`http://127.0.0.1:${server.address().port}`;
  const send=(body=valid,origin='https://portfolio.example')=>fetch(base+'/formbee/email-only',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(body)});
  return {send,mail,base};
}
test('enquiry emails only Jen, uses validated Reply-To, and includes connection preference',async t=>{const {send,mail}=await fixture(t);const r=await send({...valid,to:'attacker@example.com'});assert.equal(r.status,200);assert.equal((await r.json()).success,true);assert.equal(mail.length,1);assert.equal(mail[0].to,recipient);assert.equal(mail[0].replyTo.address,valid.email);assert.equal(mail[0].from,'verified@example.com');assert.match(mail[0].text,/WhatsApp/);assert.match(mail[0].text,/\+61400123456/);});
test('duplicate accepted enquiry is not mailed twice',async t=>{const {send,mail}=await fixture(t);const first=await (await send()).json();const second=await (await send()).json();assert.equal(first.reference,second.reference);assert.equal(mail.length,1);});
test('SMTP error and recipient rejection never produce success',async t=>{for(const transport of [{sendMail:async()=>{throw Error('private SMTP detail')}},{sendMail:async()=>({accepted:[],rejected:[recipient]})}]){const {send}=await fixture(t,{transport});const r=await send();assert.equal(r.status,502);assert.equal((await r.json()).success,undefined);}});
test('reject invalid fields, missing consent, header injection, honeypot and foreign origins',async t=>{const {send,mail}=await fixture(t);for(const body of [{...valid,name:' '},{...valid,email:'bad'},{...valid,consent:false},{...valid,email:'x@example.com\r\nBcc:spam@example.com'},{...valid,message:'a'.repeat(1801)},{...valid,website:'bot.example'},{...valid,message:123}])assert.equal((await send(body)).status,400);assert.equal((await send(valid,'https://unrelated.example')).status,403);assert.equal(mail.length,0);});
test('unconfigured backend reports unavailable and sends nothing',async t=>{const {send,base,mail}=await fixture(t,{ready:false});assert.equal((await (await fetch(base+'/formbee/health')).json()).ready,false);assert.equal((await send()).status,503);assert.equal(mail.length,0);});
test('rate limiter blocks repeated submissions',async t=>{const {send,mail}=await fixture(t,{rateMax:1});assert.equal((await send()).status,200);assert.equal((await send({...valid,submissionId:'test-request-000002'})).status,429);assert.equal(mail.length,1);});
test('server never serves private configuration or backend sources',async t=>{const {base}=await fixture(t);for(const url of ['/backend/.env','/.env','/backend/server.js','/contact-config.json'])assert.equal((await fetch(base+url)).status,404);});
