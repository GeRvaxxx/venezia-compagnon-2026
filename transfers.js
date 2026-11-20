'use strict';
// Checklist locale des transferts, sans informations privées ni confirmations fictives.
const TRANSFER_TASKS=[
 'Samedi : confirmer avec TargetRent la restitution anticipée et le dépôt des clés',
 'Samedi : vérifier les horaires réels des bus MOM 6/101 et surtout du 108',
 'Samedi : acheter les billets MOM nécessaires (non inclus dans ACTV)',
 'Samedi : vérifier le dernier arrêt et la marche jusqu’au Crowne Plaza',
 'Dimanche : demander le taxi Radio Taxi Treviso samedi matin (04h30)',
 'Dimanche : vérifier la prise en charge et le montant approximatif',
 'Dimanche : être devant l’hôtel avant 04h30 avec bagages et documents'
];
function renderTransferChecklist(){
 const target=document.getElementById('transferChecklist');
 if(!target)return;
 const selected=memory.get('venice-v2-transfer-checks',{});
 target.replaceChildren();
 TRANSFER_TASKS.forEach((label,i)=>{
  const wrap=document.createElement('label');wrap.className='checkline'+(selected[i]?' checked':'');
  const input=document.createElement('input');input.type='checkbox';input.checked=!!selected[i];
  const span=document.createElement('span');span.textContent=label;
  input.addEventListener('change',()=>{selected[i]=input.checked;memory.set('venice-v2-transfer-checks',selected);wrap.classList.toggle('checked',input.checked);});
  wrap.append(input,span);target.append(wrap);
 });
}
window.addEventListener('load',renderTransferChecklist);
