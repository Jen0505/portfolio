(()=>{
const config=/*CONTACT_CONFIG*/null;
const $=id=>document.getElementById(id);
const form=$('opportunity-form'),result=$('draft-result'),button=$('send-enquiry'),status=$('submit-status');
let messageDraft='',sending=false,online=false,submissionId='';
const fields=$('enquiry-fields');
const newId=()=>typeof crypto.randomUUID==='function'?crypto.randomUUID():Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)+'-'+Math.random().toString(36).slice(2);
async function copy(text,target){try{await navigator.clipboard.writeText(text);target.textContent='Copied to clipboard.'}catch{target.textContent='Copy isn’t available here. Select the visible text and copy it manually.'}}
$('copy-contact-email').addEventListener('click',()=>copy('jensebastian2001@gmail.com',$('contact-copy-status')));
function setStatus(text,type=''){status.textContent=text;status.className='submit-status '+type;}
function value(id){return $(id).value.trim()}
function validate(){
  for(const id of ['sender-name','message']) $(id).setCustomValidity(value(id)?'':'Please enter more than spaces.');
  const preference=$('preferred-contact').value,details=value('contact-details');
  let error='';
  if(preference==='WhatsApp'&&!/^\+?[0-9 ()-]{7,30}$/.test(details)) error='Enter your WhatsApp number, including country code.';
  if(preference==='LinkedIn') {try{const u=new URL(details);if(u.protocol!=='https:'||!['linkedin.com','www.linkedin.com'].includes(u.hostname)||!u.pathname.startsWith('/in/')) error='Enter your LinkedIn profile URL, starting with https://www.linkedin.com/in/.'}catch{error='Enter your LinkedIn profile URL.'}}
  $('contact-details').setCustomValidity(error);
  return form.reportValidity();
}
function data(){return {name:value('sender-name'),email:value('sender-email'),company:value('company'),opportunity:$('opportunity').value,role:value('role-title'),message:value('message'),preferredContact:$('preferred-contact').value,contactDetails:$('preferred-contact').value==='Email'?'':value('contact-details'),consent:$('contact-consent').checked,website:value('website'),submissionId:submissionId||(submissionId=newId())}}
function prepareDraft(){
  if(sending||!validate()) return;
  const d=data(),subject=(d.role||d.opportunity)+(d.company?' at '+d.company:'')+' — enquiry for Jen Sebastian';
  const body='Hi Jen,\n\n'+d.message+'\n\nOpportunity: '+d.opportunity+(d.role?'\nRole: '+d.role:'')+(d.company?'\nCompany: '+d.company:'')+'\nPreferred reply: '+d.preferredContact+(d.contactDetails?'\nContact: '+d.contactDetails:'')+'\n\nBest regards,\n'+d.name+'\nReply email: '+d.email;
  messageDraft='To: jensebastian2001@gmail.com\nSubject: '+subject+'\n\n'+body;
  $('draft-preview').textContent=messageDraft;
  $('open-email-app').href='mailto:jensebastian2001@gmail.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
  $('open-gmail').href='https://mail.google.com/mail/?view=cm&fs=1&to=jensebastian2001%40gmail.com&su='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
  $('draft-copy-status').textContent=''; result.hidden=false; $('draft-heading').focus();
}
$('prepare-draft').addEventListener('click',prepareDraft);
$('copy-message').addEventListener('click',()=>copy(messageDraft,$('draft-copy-status')));
function preferenceChanged(){
  const preference=$('preferred-contact').value;
  $('contact-details-field').hidden=preference==='Email';
  $('contact-details').required=preference!=='Email';
  $('contact-details-label').textContent=preference==='WhatsApp'?'Your WhatsApp number':'Your LinkedIn profile URL';
  $('contact-details').placeholder=preference==='WhatsApp'?'+61 …':'https://www.linkedin.com/in/…';
  $('contact-details-help').textContent=preference==='WhatsApp'?'Include your country code. Jen can reply to this number.':'Jen can use this profile to connect with you.';
  $('contact-details').setCustomValidity('');
}
$('preferred-contact').addEventListener('change',preferenceChanged);
function edited(event){if(event.target.setCustomValidity)event.target.setCustomValidity('');result.hidden=true;messageDraft='';submissionId='';$('open-email-app').removeAttribute('href');$('open-gmail').removeAttribute('href');setStatus('');}
form.addEventListener('input',edited);form.addEventListener('change',edited);
form.addEventListener('submit',async event=>{
  event.preventDefault();if(sending||!validate())return;
  if(!online){setStatus('Online enquiries are not available yet. Please use email, WhatsApp or LinkedIn to reach Jen.','error');return;}
  const payload=data();sending=true;fields.disabled=true;button.disabled=true;$('prepare-draft').disabled=true;form.setAttribute('aria-busy','true');result.hidden=true;button.textContent='Sending…';setStatus('Sending your enquiry…');
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),20000);
  try{
    const response=await fetch(config.endpoint,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload),signal:controller.signal,credentials:'omit',redirect:'error'});
    const answer=await response.json().catch(()=>null);
    if(!response.ok||!(answer?.success===true||answer==='Email sent successfully')) {
      if(response.status===429)throw new Error('Please wait a few minutes before trying again, or contact Jen directly.');
      if(response.status===409)throw new Error('Your earlier enquiry is still being processed. Please wait before trying again.');
      throw new Error('We couldn’t confirm delivery. Your details are still here. Try again or use email, WhatsApp or LinkedIn.');
    }
    form.reset();preferenceChanged();submissionId='';setStatus('Your enquiry was accepted by the email service for Jen. Thank you — he can reply using the contact details you provided.','success');
  }catch(error){setStatus(error.name==='AbortError'?'Delivery confirmation timed out. Your enquiry may have been sent. Your details are still here; wait before retrying or contact Jen directly.':error.message==='Failed to fetch'?'We couldn’t reach the email service. Your details are still here. Please use email, WhatsApp or LinkedIn.':error.message,'error');}
  finally{clearTimeout(timeout);sending=false;fields.disabled=false;button.disabled=!online;$('prepare-draft').disabled=false;button.innerHTML='Send enquiry <span aria-hidden="true">↗</span>';form.removeAttribute('aria-busy');}
});
async function checkDelivery(){
  try{
    if(!config.endpoint||location.protocol==='file:')throw new Error();
    // Self-hosted backend readiness is checked without transmitting any visitor details.
    if(config.healthEndpoint){const res=await fetch(config.healthEndpoint,{signal:AbortSignal.timeout(5000),credentials:'omit',cache:'no-store'});const body=await res.json();if(!res.ok||body.ready!==true)throw new Error();}
    online=true;button.disabled=false;$('delivery-availability').textContent='Send securely to Jen’s email. You don’t need to open an email app.';$('delivery-availability').classList.add('ready');
  }catch{online=false;button.disabled=true;$('delivery-availability').textContent='Online enquiries are being connected. Email Jen directly, use WhatsApp or LinkedIn, or prepare a message with your email app below.';}
}
checkDelivery();
})();
