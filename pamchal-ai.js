(()=> {
  const launcher=document.createElement('button');
  launcher.className='pamchal-ai-launcher';launcher.type='button';launcher.setAttribute('aria-label','گفت‌وگو با دستیار هوشمند پامچال');
  launcher.innerHTML='<span class="ai-orb">✦</span><span>مشاور هوشمند پامچال</span>';
  const panel=document.createElement('section');panel.className='pamchal-ai-panel';panel.setAttribute('aria-label','دستیار هوشمند پامچال');
  panel.innerHTML='<header class="pamchal-ai-head"><div class="ai-mark">✦</div><div><strong>PAMCHAL AI</strong><small>مشاور آنلاین باغ‌تالار پامچال</small></div><button class="pamchal-ai-close" type="button" aria-label="بستن">×</button></header><div class="pamchal-ai-messages" aria-live="polite"><div class="pamchal-ai-msg bot">سلام، خوش اومدید 🌿 من دستیار هوشمند پامچالم. درباره منوها، خدمات یا هماهنگی بازدید چه کمکی از دستم برمیاد؟</div></div><div class="pamchal-ai-quick"><button type="button" data-q="منوها و قیمت‌ها رو معرفی کن">منوها و قیمت‌ها</button><button type="button" data-q="برای بازدید و رزرو چطور هماهنگ کنم؟">بازدید و رزرو</button><button type="button" data-q="آدرس باغ تالار پامچال کجاست؟">آدرس مجموعه</button></div><form class="pamchal-ai-form"><input maxlength="700" autocomplete="off" placeholder="پیام خود را بنویسید..." aria-label="پیام شما"><button type="submit">ارسال</button></form><div class="pamchal-ai-foot">پاسخ‌ها راهنمای اولیه‌اند؛ رزرو فقط با تأیید مجموعه قطعی می‌شود.</div><form class="pamchal-ai-lead" hidden><strong>دریافت پاسخ از مدیریت پامچال</strong><input name="name" maxlength="80" placeholder="نام شما (اختیاری)"><input name="telegram" maxlength="33" placeholder="آیدی تلگرام، مثل @username" required><small>فقط آیدی عمومی تلگرام را وارد کنید؛ رمز عبور یا کد ورود لازم نیست.</small><button type="submit">ارسال درخواست</button></form>';
  document.head.insertAdjacentHTML('beforeend','<link rel="stylesheet" href="/pamchal-ai.css?v=1">');
  document.body.append(launcher,panel);
  const close=panel.querySelector('.pamchal-ai-close'),form=panel.querySelector('form'),input=form.querySelector('input'),send=form.querySelector('button'),list=panel.querySelector('.pamchal-ai-messages');
  const history=[];let pendingQuestion='';const leadForm=panel.querySelector('.pamchal-ai-lead');
  function toggle(force){panel.classList.toggle('is-open',force??!panel.classList.contains('is-open'));if(panel.classList.contains('is-open'))input.focus();}
  launcher.addEventListener('click',()=>toggle());close.addEventListener('click',()=>toggle(false));
  function bubble(text,who){const el=document.createElement('div');el.className='pamchal-ai-msg '+who;el.textContent=text;list.append(el);list.scrollTop=list.scrollHeight;}
  async function ask(text){const value=String(text||'').trim();if(!value||send.disabled)return; bubble(value,'user');history.push({role:'user',content:value});input.value='';send.disabled=true;send.textContent='…';const wait=document.createElement('div');wait.className='pamchal-ai-msg bot';wait.textContent='در حال بررسی…';list.append(wait);list.scrollTop=list.scrollHeight;
    try{const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:history.slice(-10)})});const data=await res.json();wait.remove();if(!res.ok)throw new Error(data.error||'پاسخ دریافت نشد.');bubble(data.answer,'bot');history.push({role:'assistant',content:data.answer});if(data.needsFollowup){pendingQuestion=value;leadForm.hidden=false;leadForm.querySelector('[name=telegram]').focus();}if(history.length>12)history.splice(0,2);}
    catch(err){wait.remove();bubble((err.message||'ارتباط برقرار نشد.')+'\nبرای راهنمایی مستقیم: ۰۹۱۵۳۶۹۶۹۴۹','bot');}
    finally{send.disabled=false;send.textContent='ارسال';input.focus();}
  }
  form.addEventListener('submit',e=>{e.preventDefault();ask(input.value);});
  leadForm.addEventListener('submit',async e=>{
    e.preventDefault();const submit=leadForm.querySelector('button');const name=leadForm.querySelector('[name=name]').value.trim();const telegram=leadForm.querySelector('[name=telegram]').value.trim();submit.disabled=true;submit.textContent='در حال ارسال…';
    try{const r=await fetch('/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:pendingQuestion,name,telegram})});const d=await r.json();if(!r.ok)throw new Error(d.error||'ارسال انجام نشد.');bubble(d.message,'bot');leadForm.hidden=true;leadForm.reset();}
    catch(err){bubble(err.message,'bot');}
    finally{submit.disabled=false;submit.textContent='ارسال درخواست';}
  });
  panel.querySelectorAll('[data-q]').forEach(b=>b.addEventListener('click',()=>ask(b.dataset.q)));
})();