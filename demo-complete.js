/*
 CDS — Fusion v9
 UX sobre inspirée de v8-complete + moteur applicatif de CDS App JS v1.
 Un seul état partagé. Les formulaires produisent les objets du cycle.
*/
const KEY="cds_fusion_v11";
const blank={
 stage:0,
 challenge:null, participation:null, attempts:[], realization:null, proof:null,
 witnessRequest:null, witness:null, recognition:null, share:null, opportunity:null,
 notifications:[], tuteurNote:null
};
const initial=()=>({
 ...structuredClone(blank),
 person:{name:"Amina N.",age:19,city:"Yaoundé"},
 actors:{organisation:"TalentBridge Africa",tuteur:"Paul M.",temoin:"Paul M.",partner:"Entreprise X"}
});
let db=load();
const W=document.getElementById("workspace");
function load(){try{const x=JSON.parse(localStorage.getItem(KEY));return x||initial()}catch{return initial()}}
function save(){localStorage.setItem(KEY,JSON.stringify(db));}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function log(actor,msg){db.notifications.unshift({time:new Date().toLocaleTimeString("fr-FR"),actor,msg});}
function pct(){return Math.min(100,Math.round((db.stage/10)*100));}
function caps(){return db.challenge?.capacities||[];}
function criteria(){return db.challenge?.criteria||[];}
function status(t,kind=""){return `<span class="pill ${kind}">${esc(t)}</span>`;}
function eventCard(title,msg){return `<div class="list-item"><span><b>${esc(title)}</b><br><span class="muted">${esc(msg)}</span></span></div>`;}
function header(k,t,s){return `<div class="page-head"><div><div class="label">${k}</div><h1>${t}</h1><p>${s}</p></div><div class="scenario-progress"><span>${pct()}%</span><div><i style="width:${pct()}%"></i></div><small>progression du scénario</small></div></div>`;}
function journey(){
 const a=[
  ["Défi",!!db.challenge],["Participation",!!db.participation],["Tentative",db.attempts.length>0],
  ["Réalisation",!!db.realization],["Preuve",!!db.proof],["Témoignage",!!db.witness],
  ["Reconnaissance",!!db.recognition],["Partage",!!db.share],["Opportunité",!!db.opportunity],["Nouveau défi",db.stage>=10]
 ];
 return `<div class="flow">${a.map((x,i)=>`<div class="${x[1]?'on':''} ${i===db.stage?'current':''}"><span>${String(i+1).padStart(2,"0")}</span><b>${x[0]}</b></div>`).join("")}</div>`;
}
function cardGrid(content){return `<div class="cards">${content}</div>`}
function saveRender(space){save();render(space);}
document.querySelectorAll(".space").forEach(b=>b.addEventListener("click",()=>{
 document.querySelectorAll(".space").forEach(x=>x.classList.remove("active"));b.classList.add("active");render(b.dataset.space);
}));
document.getElementById("reset").addEventListener("click",()=>{
 const ok=window.confirm("Réinitialiser toute la simulation ? Cette action efface uniquement l’état de la démo CDS.");
 if(!ok)return;
 localStorage.removeItem(KEY);
 db=initial();
 save();
 document.querySelectorAll(".space").forEach(x=>x.classList.remove("active"));
 document.querySelector('[data-space="organisation"]').classList.add("active");
 render("organisation");
 window.scrollTo({top:0,behavior:"smooth"});
});
function render(space){({organisation,titulaire,tuteur,temoin,partenaire,admin}[space]||organisation)();}

function organisation(){
 if(!db.challenge){
 W.innerHTML=header("ÉTAPE 01 · ENVIRONNEMENT","Formaliser un besoin puis publier un défi",
 "Le premier acte CDS part d'un besoin réel. L'organisation transforme ce besoin en situation d'action avec des conditions observables.")+journey()+cardGrid(`
 <div class="card wide">
 <div class="label">FORMALISATION DU BESOIN</div>
 <form id="challengeForm">
  <label>Besoin / problème à traiter</label><textarea name="need" required placeholder="Ex. Les activités d'une association de quartier sont mal documentées et les responsables perdent du temps à consolider les informations."></textarea>
  <div class="two">
   <div><label>Contexte / environnement</label><textarea name="environment" required placeholder="Public concerné, lieu, contraintes, acteurs..."></textarea></div>
   <div><label>Résultat attendu</label><textarea name="goal" required placeholder="Ce qui devra être produit, amélioré ou rendu observable."></textarea></div>
  </div>
  <label>Titre du défi</label><input name="title" required placeholder="Ex. Structurer le suivi d'une activité communautaire">
  <label>Capacités explorées</label><div class="chips-form">
   ${["Planifier","Analyser","Communiquer","Collaborer","Résoudre un problème","Rendre compte"].map(x=>`<label><input type="checkbox" name="cap" value="${x}"> ${x}</label>`).join("")}
  </div>
  <div class="two">
   <div><label>Critères observables</label><textarea name="criteria" required placeholder="Un critère par ligne. Ex. planning exploitable, participants mobilisés, imprévus traités..."></textarea></div>
   <div><label>Ressources promises</label><textarea name="resources" required placeholder="Accompagnement, temps, matériel, budget, accès aux personnes..."></textarea></div>
  </div>
  <label>Échéance</label><input name="deadline" type="date" required>
  <button class="action">Formaliser et publier le défi</button>
 </form>
 </div>`);}
 else {
 const c=db.challenge;
 if(db.witness?.confirmed && !db.recognition){
  W.innerHTML=header("ÉTAPE 07 · ORGANISATION","Émettre la reconnaissance", "Le témoignage confirme un élément vérifiable. L'organisation décide maintenant si la réalisation répond aux critères du défi.")+journey()+cardGrid(`<div class="card wide"><div class="notice"><b>Réalisation :</b> ${esc(db.realization?.summary||"")}<br><b>Preuve :</b> ${esc(db.proof?.ref||"")}<br><b>Témoignage :</b> ${esc(db.witness?.text||"")}</div><form id="recognitionForm"><label>Reconnaissance</label><textarea name="text" required>Reconnaissance de la réalisation du défi « ${esc(c.title)} » et des capacités mobilisées : ${esc(caps().join(", "))}.</textarea><button class="action">Émettre la reconnaissance</button></form></div>`);
  document.getElementById("recognitionForm")?.addEventListener("submit",e=>{e.preventDefault();const d=new FormData(e.target);db.recognition={text:d.get("text"),level:"confirmée",by:db.actors.organisation,at:new Date().toISOString()};log(db.actors.organisation,"Reconnaissance émise après témoignage.");db.stage=Math.max(db.stage,7);saveRender("organisation")});
  return;
 }
 W.innerHTML=header("ÉTAPE 01 · ENVIRONNEMENT","Le défi est publié",
 "Le besoin a été formalisé. Les acteurs peuvent maintenant faire vivre le même objet dans leurs espaces.")+journey()+cardGrid(`
 <div class="card wide"><div class="label">DÉFI PUBLIÉ</div><h3>${esc(c.title)}</h3><p>${esc(c.goal)}</p>
 <div class="notice"><b>Besoin :</b> ${esc(c.need)}<br><b>Contexte :</b> ${esc(c.environment)}</div>
 <div class="list">${c.criteria.map(x=>`<div class="list-item"><span>${esc(x)}</span>${status("critère")}</div>`).join("")}</div></div>
 <div class="card"><h3>Capacités explorées</h3><p>${caps().map(esc).join(" · ")}</p></div>
 <div class="card"><h3>Ressources</h3><p>${c.resources.map(esc).join(" · ")}</p><p class="muted">Échéance : ${esc(c.deadline)}</p></div>
 <div class="card full"><div class="success">✓ Défi publié. Passez dans <b>Amina</b> pour le recevoir et participer.</div><button class="action" id="goAmina">Ouvrir l’espace d’Amina</button></div>`);
 }
 const f=document.getElementById("challengeForm");
 f?.addEventListener("submit",e=>{
  e.preventDefault();const d=new FormData(f);
  db.challenge={title:d.get("title"),need:d.get("need"),environment:d.get("environment"),goal:d.get("goal"),
   capacities:d.getAll("cap"),criteria:d.get("criteria").split(/\n+/).map(x=>x.trim()).filter(Boolean),
   resources:d.get("resources").split(/\n+/).map(x=>x.trim()).filter(Boolean),deadline:d.get("deadline"),publishedAt:new Date().toISOString()};
  log("TalentBridge","Besoin formalisé et défi publié.");db.stage=1;saveRender("organisation");
 });
 document.getElementById("goAmina")?.addEventListener("click",()=>render("titulaire"));
}

function titulaire(){
 const c=db.challenge;
 if(!c){W.innerHTML=header("ÉTAPE 02 · TITULAIRE","Amina","En attente d'un défi.")+journey()+`<div class="notice">TalentBridge n'a encore rien publié. Ouvrez l'espace Organisation pour commencer.</div>`;return;}
 let main;
 if(!db.participation){
   main=`<div class="notice"><b>Action 1 — Décider de participer.</b><br>Le défi présente son besoin, son contexte, ses critères et ses ressources avant toute participation.</div><button class="action" id="join">Accepter de participer</button>`;
 } else if(!db.attempts.length || (db.attempts.at(-1)?.outcome === "partial" && !db.realization)) {
   main=attemptInterface();
 } else if(!db.realization){
   main=realizationInterface();
 } else if(!db.proof){
   main=proofInterface();
 } else if(!db.witnessRequest){
   main=`<div class="success">✓ Réalisation et preuve préparées.</div><p><b>Action suivante — demander un témoignage.</b> Choisissez une personne habilitée à confirmer ce qu'elle peut réellement vérifier.</p><button class="action" id="requestWitness">Demander un témoignage à Paul</button>`;
 } else if(!db.witness){
   main=`<div class="notice"><b>En attente du témoin.</b><br>La demande a été envoyée à Paul. Passez dans son espace pour poursuivre la simulation.</div><button class="action" id="goWitness">Ouvrir l'espace du témoin</button>`;
 } else if(!db.recognition){
   main=`<div class="success">✓ Témoignage confirmé.</div><p><b>Action suivante — reconnaissance.</b> Le témoignage n'est pas encore une reconnaissance. L'organisation doit maintenant émettre la reconnaissance contextualisée.</p><button class="action" id="goOrganisation">Ouvrir l'espace de l'organisation</button>`;
 } else if(!db.share){
   main=shareInterface();
 } else {
   main=`<div class="success">✓ Partage autorisé.</div><p><b>Action suivante — opportunité.</b> Entreprise X peut maintenant consulter uniquement la sélection autorisée.</p><button class="action" id="goPartner">Ouvrir l'espace du partenaire</button>`;
 }
 W.innerHTML=header("ESPACE · TITULAIRE","Amina — agir, itérer, documenter, partager",
 "Ici, Amina ne consulte pas seulement son profil : elle accomplit les actions qui font progresser le cycle CDS.")+journey()+cardGrid(`
 <div class="card wide"><div class="person-line"><div class="initial">A</div><div><b>${esc(db.person.name)}</b><div class="muted">${db.person.age} ans · ${db.person.city}</div></div></div>
 <div class="divider"></div><div class="label">DÉFI REÇU</div><h3>${esc(c.title)}</h3><p>${esc(c.goal)}</p>
 <div class="action-panel">${main}</div></div>
 <div class="card"><h3>Contexte</h3><p>${esc(c.environment)}</p><h3>Critères observables</h3><div class="list">${c.criteria.map(x=>`<div class="list-item"><span>${esc(x)}</span>${status("attendu")}</div>`).join("")}</div></div>
 <div class="card"><h3>Capacités explorées</h3><p>${caps().map(esc).join(" · ")}</p><h3>Ressources</h3><p>${c.resources.map(esc).join(" · ")}</p></div>
 <div class="card full"><h3>Historique du parcours</h3>${db.attempts.length?db.attempts.map((a,i)=>eventCard("Tentative "+(i+1),`${a.result}${a.outcome==="partial"?" · itération nécessaire":" · passage à la réalisation"}`)).join(""):eventCard("En attente","Aucune tentative enregistrée : l'action suivante est définie dans le panneau ci-dessus.")}</div>`);
 document.getElementById("join")?.addEventListener("click",()=>{db.participation={at:new Date().toISOString()};db.stage=Math.max(db.stage,2);log("Amina","Participation acceptée.");saveRender("titulaire")});
 document.getElementById("attemptForm")?.addEventListener("submit",e=>{
   e.preventDefault();const d=new FormData(e.target),a={plan:d.get("plan"),success:d.get("success"),result:d.get("result"),participants:Number(d.get("participants")),outcome:d.get("outcome"),at:new Date().toISOString()};
   db.attempts.push(a);log("Amina",`Tentative ${db.attempts.length} enregistrée : ${a.outcome==="partial"?"itération nécessaire":"résultat satisfaisant"}.`);
   if(a.outcome==="complete"){db.stage=Math.max(db.stage,3)} else {db.stage=Math.max(db.stage,2)}
   saveRender("titulaire");
 });
 document.getElementById("realizationForm")?.addEventListener("submit",e=>{e.preventDefault();const d=new FormData(e.target);db.realization={summary:d.get("summary"),learning:d.get("learning"),attempts:db.attempts.length};log("Amina","Réalisation finale documentée.");db.stage=Math.max(db.stage,4);saveRender("titulaire")});
 document.getElementById("proofForm")?.addEventListener("submit",e=>{e.preventDefault();const d=new FormData(e.target);db.proof={type:d.get("type"),ref:d.get("ref"),description:d.get("description")};log("Amina","Preuve associée à la réalisation.");db.stage=Math.max(db.stage,5);saveRender("titulaire")});
 document.getElementById("requestWitness")?.addEventListener("click",()=>{db.witnessRequest={from:"Amina",to:"Paul",at:new Date().toISOString()};log("Amina","Demande de témoignage envoyée à Paul.");db.stage=Math.max(db.stage,6);saveRender("titulaire")});
 document.getElementById("goWitness")?.addEventListener("click",()=>render("temoin"));
 document.getElementById("goOrganisation")?.addEventListener("click",()=>render("organisation"));
 document.getElementById("shareForm")?.addEventListener("submit",e=>{e.preventDefault();const d=new FormData(e.target);db.share={recipient:"Entreprise X",items:d.getAll("item"),at:new Date().toISOString()};log("Amina","Partage sélectif autorisé.");db.stage=Math.max(db.stage,8);saveRender("titulaire")});
 document.getElementById("goPartner")?.addEventListener("click",()=>render("partenaire"));
}

function attemptInterface(){
 const n=db.attempts.length;
 return `<div class="notice ${n&&db.attempts[n-1].outcome==="partial"?"warning":""}"><b>${n?"Nouvelle itération":"Première tentative"}</b><br>
 Une tentative produit des informations : plan, action, résultat, difficultés et apprentissages. L'échec n'est pas converti en note.</div>
 <form id="attemptForm"><div class="two"><div><label>Plan d'action</label><textarea name="plan" required placeholder="Étapes, personnes mobilisées, ordre des actions..."></textarea></div>
 <div><label>Comment saurai-je que cela fonctionne ?</label><textarea name="success" required placeholder="Signes ou résultats observables..."></textarea></div></div>
 <label>Ce qui s'est réellement passé</label><textarea name="result" required placeholder="Décrire les faits, y compris les difficultés rencontrées."></textarea>
 <div class="two"><div><label>Participants impliqués</label><input name="participants" type="number" min="1" required placeholder="18"></div>
 <div><label>Issue de la tentative</label><select name="outcome"><option value="partial">Partiellement aboutie — analyser et recommencer</option><option value="complete">Aboutie — passer à la réalisation</option></select></div></div>
 <button class="action">Enregistrer la tentative</button></form>`;
}
function realizationInterface(){return `<div class="notice"><b>Action 2 — Documenter la réalisation.</b> La dernière tentative est considérée comme suffisamment aboutie pour passer à la formalisation.</div>
<div class="list">${db.attempts.map((a,i)=>eventCard("Tentative "+(i+1),`${a.result} · ${a.participants} participant(s)`)).join("")}</div>
<form id="realizationForm"><label>Réalisation finale</label><textarea name="summary" required placeholder="Qu'est-ce qui a effectivement été produit, changé ou accompli ?"></textarea>
<label>Ce qui a été appris ou amélioré</label><textarea name="learning" required placeholder="Méthodes, adaptation, collaboration, capacités mobilisées..."></textarea><button class="action">Documenter la réalisation</button></form>`}
function proofInterface(){return `<div class="notice"><b>Action 3 — Ajouter une preuve.</b> La preuve doit être reliée à la réalisation et permettre à un tiers de vérifier un élément précis.</div>
<div class="success">✓ Réalisation : ${esc(db.realization.summary)}</div>
<form id="proofForm"><div class="label">PREUVE</div><label>Type</label><select name="type"><option>Livrable</option><option>Rapport</option><option>Trace d'activité</option><option>Observation</option></select><label>Référence</label><input name="ref" required placeholder="rapport-activité-001"><label>Ce que la preuve permet de vérifier</label><textarea name="description" required placeholder="Ex. le résultat obtenu, les données utilisées, les décisions prises..." ></textarea><button class="action">Ajouter la preuve</button></form>`}
function shareInterface(){return `<div class="notice"><b>Action 4 — Contrôler le partage.</b> La reconnaissance est confirmée. Amina choisit précisément les éléments transmis à Entreprise X.</div><form id="shareForm"><label>Éléments à partager</label>${["Défi et contexte","Réalisation","Preuve","Témoignage","Reconnaissance"].map(x=>`<label class="check"><input type="checkbox" name="item" value="${x}" checked> ${x}</label>`).join("")}<br><button class="action">Autoriser le partage</button></form>`}



function tuteur(){
 W.innerHTML=header("ÉTAPE 03 · ACCOMPAGNEMENT","Paul accompagne sans se substituer à la personne","Le tuteur documente le contexte d'accompagnement. Il ne transforme pas son observation en score.")+journey()+cardGrid(`
 <div class="card"><div class="muted">TUTEUR</div><div class="metric">Paul M.</div><p>Accompagnateur d'Amina.</p></div>
 <div class="card"><div class="muted">ÉTAT</div><div class="metric">${db.participation?"Actif":"En attente"}</div><p>${db.attempts.length?"Des tentatives existent.":"Amina n'a pas encore commencé."}</p></div>
 <div class="card wide"><h3>Observation d'accompagnement</h3><form id="tutorForm"><textarea name="note" placeholder="Ex. Amina a demandé un retour après la première tentative et a modifié la répartition des tâches.">${esc(db.tuteurNote||"")}</textarea><button class="action">Enregistrer l'observation</button></form>
 ${db.tuteurNote?`<div class="success">✓ Observation enregistrée : ${esc(db.tuteurNote)}</div>`:""}</div>`);
 document.getElementById("tutorForm")?.addEventListener("submit",e=>{e.preventDefault();db.tuteurNote=new FormData(e.target).get("note");log("Paul","Observation d'accompagnement enregistrée.");saveRender("tuteur")});
}

function temoin(){
 const ready=!!db.witnessRequest&&!!db.realization&&!!db.proof;
 W.innerHTML=header("ÉTAPE 06 · TÉMOIGNAGE","Paul vérifie une réalisation précise","Le témoignage ne porte pas sur la valeur de la personne. Il confirme ou ne confirme pas ce qui est vérifiable dans son périmètre.")+journey()+cardGrid(`
 <div class="card wide"><div class="label">DEMANDE DE TÉMOIGNAGE</div>
 ${!db.witnessRequest?`<div class="notice">Aucune demande. Amina doit d'abord documenter sa réalisation et demander un témoignage.</div>`:
 !ready?`<div class="notice">La demande existe, mais les éléments vérifiables ne sont pas encore complets.</div>`:
 db.witness?`<div class="success">✓ Témoignage ${db.witness.confirmed?"confirmé":"non confirmé"}.</div><p>${esc(db.witness.text||"")}</p>`:
 `<h3>${esc(db.challenge.title)}</h3><div class="notice"><b>Réalisation :</b> ${esc(db.realization.summary)}<br><b>Preuve :</b> ${esc(db.proof.type)} · ${esc(db.proof.ref)}<br>${esc(db.proof.description)}</div>
 <form id="witnessForm"><label>Observation vérifiable</label><textarea name="text" required placeholder="Ce que vous avez directement observé ou que vous pouvez vérifier."></textarea>
 <button class="action">Confirmer le témoignage</button><button type="button" class="outline" id="declineWitness">Je ne peux pas confirmer</button></form>`}</div>
 <div class="card"><h3>Règle</h3><p>Pas d'auto-attestation. Le témoin doit avoir une relation réelle avec la réalisation et agir dans son périmètre.</p></div>
 <div class="card"><h3>Après</h3><p>La confirmation permet à l'environnement d'émettre une reconnaissance contextualisée.</p></div>`);
 document.getElementById("witnessForm")?.addEventListener("submit",e=>{e.preventDefault();const d=new FormData(e.target);db.witness={confirmed:true,text:d.get("text"),by:"Paul"};log("Paul","Témoignage confirmé.");db.stage=Math.max(db.stage,7);saveRender("temoin")});
 document.getElementById("declineWitness")?.addEventListener("click",()=>{db.witness={confirmed:false,text:"Témoignage non confirmé."};log("Paul","Témoignage non confirmé.");db.stage=Math.max(4,db.stage-1);saveRender("temoin")});
}

function partenaire(){
 const visible=db.share;
 const sharedList=visible ? db.share.items.map(x=>`<div class="list-item"><span>${esc(x)}</span>${status("visible")}</div>`).join("") : "";
 const received=visible
  ? `<div class="success">✓ Sélection partagée.</div>
     <div class="list">${sharedList}</div>
     ${db.recognition?`<div class="notice"><b>Reconnaissance :</b> ${esc(db.recognition.text)}</div>`:""}
     ${!db.opportunity
       ? `<form id="oppForm"><label>Opportunité proposée</label><input name="title" value="Mission pilote de coordination" required>
          <label>Pourquoi cette proposition ?</label><textarea name="reason" required>Les éléments partagés montrent une réalisation contextualisée et vérifiée.</textarea>
          <button class="action">Proposer l'opportunité</button></form>`
       : `<div class="success">✓ Opportunité proposée : ${esc(db.opportunity.title)}</div>
          <button class="action" id="next">Transformer l'opportunité en nouveau défi</button>`}`
  : `<div class="notice">Amina n'a pas encore autorisé le partage.</div>`;
 W.innerHTML=header("ÉTAPE 09 · OPPORTUNITÉ","Entreprise X reçoit uniquement le carnet partagé","Le partenaire ne consulte pas automatiquement l'ensemble du parcours.")+
 journey()+cardGrid(`
 <div class="card"><div class="muted">ACCÈS</div><div class="metric">${visible?"Autorisé":"Fermé"}</div><p>${visible?"Sélection reçue d'Amina.":"Aucun accès par défaut."}</p></div>
 <div class="card"><div class="muted">RECONNAISSANCE</div><div class="metric">${db.recognition?"1":"0"}</div><p>${db.recognition?"Contextualisée.":"Non visible."}</p></div>
 <div class="card wide"><h3>Vue reçue</h3>${received}</div>`);
 document.getElementById("oppForm")?.addEventListener("submit",e=>{
   e.preventDefault();const d=new FormData(e.target);
   db.opportunity={title:d.get("title"),reason:d.get("reason")};
   log("Entreprise X","Opportunité proposée.");db.stage=Math.max(db.stage,9);saveRender("partenaire");
 });
 document.getElementById("next")?.addEventListener("click",()=>{
   db.stage=10;log("Système","L'opportunité devient le point de départ d'un nouveau défi.");saveRender("partenaire");
 });
}
function admin(){
 W.innerHTML=header("VUE TRANSVERSALE","Administration CDS","Observer les invariants et l'état du cycle sans attribuer de score à la personne.")+journey()+cardGrid(`
 <div class="card"><div class="muted">ÉTAT</div><div class="metric">${pct()}%</div><p>Un état partagé entre les espaces.</p></div>
 <div class="card"><div class="muted">TENTATIVES</div><div class="metric">${db.attempts.length}</div><p>Les itérations restent contextualisées.</p></div>
 <div class="card"><div class="muted">PREUVES</div><div class="metric">${db.proof?1:0}</div><p>Associées à une réalisation.</p></div>
 <div class="card"><div class="muted">RÈGLES</div><div class="metric">4</div><p>Pas d'auto-attestation · relation réelle · consentement · traçabilité.</p></div>
 <div class="card wide"><h3>Journal</h3>${db.notifications.length?db.notifications.map(x=>eventCard(`${x.time} · ${x.actor}`,x.msg)).join(""):eventCard("Système","Aucune action.")}</div>
 <div class="card wide"><h3>Invariants observables</h3><div class="list">
 <div class="list-item"><span>Défi issu d'un besoin formalisé</span>${status(db.challenge?"OK":"En attente")}</div>
 <div class="list-item"><span>Tentatives avant réalisation</span>${status(db.realization&&db.attempts.length?"OK":"En attente")}</div>
 <div class="list-item"><span>Preuve liée à une réalisation</span>${status(db.proof&&db.realization?"OK":"En attente")}</div>
 <div class="list-item"><span>Partage autorisé par Amina</span>${status(db.share?"OK":"En attente")}</div>
 </div></div>`);
}

/* Recognition is a separate organizational action: testimony != recognition. */
function maybeRecognition(space){
 if(db.witness?.confirmed && !db.recognition){
  db.recognition={text:`Reconnaissance de la réalisation du défi « ${db.challenge.title} » et des capacités mobilisées : ${caps().join(", ")}.`,level:"confirmée",by:db.actors.organisation};
  log(db.actors.organisation,"Reconnaissance émise après confirmation du témoignage.");
  db.stage=Math.max(db.stage,7); save(); return true;
 }
 return false;
}
render("organisation");
