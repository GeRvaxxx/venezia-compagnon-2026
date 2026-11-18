/* Extension Venezia: plusieurs fichiers par réservation, sans effacer les anciens. */
async function getTicketEntries(id){
 const keys=await dbOp('readonly',s=>s.getAllKeys());
 const selected=keys.filter(k=>typeof k==='string'&&(k===id||k.startsWith(id+'::')));
 const entries=await Promise.all(selected.map(async key=>({key,file:await dbOp('readonly',s=>s.get(key))})));
 return entries.filter(e=>e.file&&e.file.blob);
}
async function addTicketFiles(id,files){
 const invalid=[];
 for(const file of Array.from(files)){
  if(file.size>16*1024*1024){invalid.push(file.name+' : trop volumineux (16 Mo max)');continue;}
  if(!['application/pdf','image/png','image/jpeg'].includes(file.type) && !/\.(pdf|png|jpe?g)$/i.test(file.name)){invalid.push(file.name+' : format non pris en charge');continue;}
  try{const key=id+'::'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);await dbOp('readwrite',s=>s.put({name:file.name,blob:file,type:file.type},key));}
  catch(e){invalid.push(file.name+' : '+e.message);}
 }
 await showTicketEntries(id);
 if(invalid.length)alert('Ces fichiers n’ont pas été ajoutés :\n'+invalid.join('\n'));
}
async function showTicketEntries(id){
 const info=document.querySelector('[data-fileinfo="'+id+'"]');
 const list=document.querySelector('[data-ticketlist="'+id+'"]');
 if(!info||!list)return;
 try{
  const entries=await getTicketEntries(id);
  info.textContent=entries.length ? entries.length+' billet(s) enregistré(s) hors ligne sur cet appareil.' : 'Aucun PDF ajouté sur cet appareil.';
  list.replaceChildren();
  entries.forEach(({key,file})=>{
   const row=document.createElement('div');row.className='ticket-file-row';
   const label=document.createElement('span');label.className='ticket-file-name';label.textContent='📄 '+(file.name||'Billet');
   const open=document.createElement('button');open.type='button';open.className='btn small outline';open.textContent='Ouvrir';open.addEventListener('click',async()=>{
    const data=await dbOp('readonly',s=>s.get(key));if(!data)return;
    const url=URL.createObjectURL(data.blob);
    const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener';a.textContent=data.name;document.body.append(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),120000);
   });
   const remove=document.createElement('button');remove.type='button';remove.className='btn small ghost';remove.textContent='Retirer';remove.addEventListener('click',async()=>{
    if(!confirm('Retirer uniquement ce billet ? Les autres billets seront conservés.'))return;
    await dbOp('readwrite',s=>s.delete(key));await showTicketEntries(id);
   });
   row.append(label,open,remove);list.append(row);
  });
 }catch(e){info.textContent='Stockage local indisponible : '+e.message;}
}
renderTickets=function(){
 const el=$('ticketCards');el.replaceChildren();
 TICKETS.forEach(t=>{
  const card=document.createElement('article');card.className='reservation';card.id='ticket-'+t.id;
  card.innerHTML='<div class="flex between gap8"><span style="font-size:23px">'+t.icon+'</span><span class="mini-pill">'+safe(t.price)+'</span></div>'+
    '<b style="margin-top:8px">'+safe(t.name)+'</b><div class="date">'+safe(t.when)+'</div><p class="small muted">'+safe(t.note)+'</p>'+
    '<div class="ticket-actions"><a href="'+safe(t.mail)+'" target="_blank" rel="noopener noreferrer" class="btn outline small">↗ Ouvrir le mail</a></div>'+
    '<div class="filebox"><label for="pdf-'+t.id+'"><strong>Ajouter plusieurs billets PDF hors ligne</strong></label>'+
    '<input type="file" multiple id="pdf-'+t.id+'" accept="application/pdf,image/png,image/jpeg">'+
    '<small data-fileinfo="'+t.id+'">Chargement des billets…</small><div class="ticket-file-list" data-ticketlist="'+t.id+'"></div></div>';
  el.append(card);
  const input=card.querySelector('input[type=file]');
  input.addEventListener('change',async()=>{if(input.files.length)await addTicketFiles(t.id,input.files);input.value='';});
  showTicketEntries(t.id);
 });
 $('checklist').innerHTML=TODO.map((v,i)=>'<label class="checkline '+(checks[i]?'checked':'')+'"><input type="checkbox" data-check="'+i+'" '+(checks[i]?'checked':'')+'><span>'+safe(v)+'</span></label>').join('');
 $('checklist').querySelectorAll('[data-check]').forEach(e=>e.addEventListener('change',()=>{checks[e.dataset.check]=e.checked;memory.set('venice-v2-checks',checks);renderTickets();}));
};
