(async()=>{const inv=window.__TAURI_INTERNALS__.invoke;const NL=String.fromCharCode(10);const out=[];
const F=p=>({name:p.name,aka:p.aka,appearance:p.appearance,disappearance:p.disappearance,place:p.place,guru:p.guru,disciples:p.disciples,works:p.works,notes:p.notes,tags:p.tags});
const blank={name:'',aka:'',appearance:'',disappearance:'',place:'',guru:'',disciples:'',works:'',notes:'',tags:''};
const mk=async(name,o={})=>{const id=await inv('new_person',{fields:{...blank,...o,name}});out.push('NEW '+id+' '+name);return id};
const upd=async(id,fn)=>{const p=await inv('get_person',{id});const f=F(p);const b=JSON.stringify(f);fn(f);if(JSON.stringify(f)!==b){await inv('update_person',{id,fields:f});out.push('OK '+id+' '+f.name)}};
const addNote=(f,line)=>{if(!f.notes.includes(line))f.notes=(f.notes.trim()?f.notes.trim()+NL+NL:'')+line};
const full=async d=>(await inv('get_sections',{docId:d,from:0,to:100000})).map(s=>s.text.endsWith(NL)?s.text:s.text+NL).join('');
const has=async(id,s)=>(await inv('get_person',{id})).notes.includes(s);
const A='Śrī Advaita Ācārya Prabhu',GP='Gadādhara Paṇḍit Gosvāmī',NT='Śrī Narottama dāsa Ṭhākura',SR='Śrīnivāsa Ācārya',SY='Śyāmānanda Paṇḍita',N='Śrī Nityānanda';

// 468 Haridāsa Brahmacārī
if(await has(468,'2. He belonged to the lineage of Gadādhara')){
 await mk('Haridāsa Brahmacārī (Gadādhara’s branch)',{guru:GP,notes:'He belonged to the lineage of Gadādhara Paṇḍita. (Caitanya Caritāmṛta 1.12.79, Sakhanirnayamrta 7)'});
 await upd(468,f=>{f.notes='He belonged to the lineage of Advaita Prabhu (Caitanya Caritāmṛta 1.12.62).';f.guru=A})}
// 953 Murāri Paṇḍit
if(await has(953,'2. He was the father of Gopāla Guru')){
 await mk('Murāri Paṇḍit (father of Gopāla Guru Gosvāmī)',{notes:'He was the father of Gopāla Guru Gosvāmī.'});
 await upd(953,f=>{f.notes='He was a brāhmaṇa belonging to the sakhā of Advaita. (Caitanya Caritāmṛta 1.12.64, Namamrtasamudra 155)';if(!f.guru.trim())f.guru=A})}
// 1215 Raghunātha
if(await has(1215,'2. He belonged to the sakhā of Advaita')){
 await mk('Raghunātha (Advaita’s branch)',{guru:A,notes:'He belonged to the sakhā of Advaita Prabhu. (Caitanya Caritāmṛta 1.12.63)'});
 await mk('Raghunātha (Gadādhara’s branch)',{guru:GP,notes:'A brāhmaṇa by caste who belonged to the spiritual lineage of Gadādhara.'+NL+NL+'In Kṛṣṇa-līlā: Varāṅgada (Gaura-gaṇoddeśa-dīpikā 194-200).'});
 await upd(1215,f=>{f.notes='He was a close associate of Lord Gaurāṅga and was one of the eight Siddhis. (Gaura-gaṇoddeśa-dīpikā 96-97)'})}
// 1444 Srikanta
if(await has(1444,'husband of Sanātana')){
 await mk('Śrīkānta (husband of Sanātana’s sister)',{notes:'He was the husband of Sanātana Gosvāmī’s sister. (CC 2.20.38)'});
 await mk('Srikanta (disciple of Narottama)',{guru:NT,notes:'He was a disciple of Narottama Ṭhākura. (Premavilāsa 20, Narottamavilāsa 12)'});
 await upd(1444,f=>{f.notes=`He was the brother of Lord Advaita. (Premavilāsa 24)${NL+NL}Brother: ${A}; son of Kuvera Paṇḍit.`;if(f.disciples.trim()==='Lord Advaita')f.disciples=''})}
// 658 Kamalākṣa → Kamalānanda
if(await has(658,'Kamalananda')){
 await mk('Kamalānanda',{notes:'He was the thirty fourth devotee of Lord Caitanya. He served the Lord in Bengal, where his Sripata still exists, but later went to Jagannātha Purī to live with the Lord (Caitanya Caritāmṛta 1.10.149).'});
 await upd(658,f=>{f.notes=`The name given to ${A} at birth (Caitanya Caritāmṛta 1.6.30). The same person as ${A}.`});
 await upd(15,f=>{if(!f.aka.includes('Kamalākṣa'))f.aka=(f.aka.trim()?f.aka.trim()+', ':'')+'Kamalākṣa'})}
// 106 Bhāgavata Dās
if(await has(106,'2. He was a disciple of Narottama')){
 await mk('Bhāgavata Dāsa (disciple of Narottama)',{guru:NT,notes:'He was a disciple of Narottama Ṭhākura. (Premavilāsa 20)'});
 await upd(106,f=>{f.notes='He lived in Vṛndāvan and was a disciple of Gadādhara Paṇḍit. (Caitanya Caritāmṛta 1.12.81, Sakhanirnayamrita 16)'})}
// 1276 Rāmakṛṣṇa
if(await has(1276,'1. He was the second son of Vīracandra')){
 await mk('Rāmakṛṣṇa (son of Vīracandra)',{notes:'He was the second son of Vīracandra prabhu. (Prema-vilāsa 24)'+NL+NL+'Father: Vīracandra (Vīrabhadra Gosvāmī).'});
 await mk('Rāmakṛṣṇa (author of Bhāgavata-kaumudī)',{works:'Bhāgavatakaumudī',notes:'He wrote a commentary on Śrīmad Bhāgavatam titled Bhāgavatakaumudī. In Śaka 1743 (1821 A.D.) he completed a commentary on Rāsa-pancadhyayi.'});
 await upd(1276,f=>{f.notes='He was a disciple of Rasikānanda prabhu. (Rasikamaṅgala Pascima 7.13)';f.guru='Rasikānanda Prabhu';f.works=''})}
// 1701 Vīrabhadra Gosvāmī: the 1858 translator is another person
if(await has(1701,'1858-1861')){
 await mk('Vīrabhadra Gosvāmī (translator of the Bhāgavatam, 1858)',{notes:'He translated in brief the essence of the entire Śrīmad Bhāgavatam which was published in two volumes in 1858-1861 A.D. (1265-1268).'});
 await upd(1701,f=>{f.notes=f.notes.replace(/\s*NOTE: the only text in this record[^\n]*/,'').replace(/\s*He translated in brief the essence[^\n]*/,'').trim()})}
// 1006 Nārāyaṇī Dāsī: nurse of Mahāprabhu / mother of Narottama
if(await has(1006,'2. She was the mother of Narottama')){
 const NM='Nārāyaṇī (mother of Narottama)';
 await mk(NM,{notes:`She was the mother of Narottama Ṭhākura. (Narottama-vilāsa 2)${NL+NL}Son: ${NT}. Husband: Kṛṣṇānanda Datta.`});
 await upd(1006,f=>{f.notes=f.notes.replace(/\s*2\. She was the mother of Narottama[^\n]*/,'').replace(/\s*Son \(not disciple\), in note 2[^\n]*/,'').replace(/^1\. /,'').trim()});
 await upd(1010,f=>{f.notes=f.notes.replace('Mother: Nārāyaṇī Devī.','Mother: '+NM+'.').replace('mother Nārāyaṇī Dāsī (her record also mixes in Lord Caitanya\'s nurse)','mother '+NM)});
 await upd(791,f=>{f.notes=f.notes.replace('Wife: Nārāyaṇī Dāsī.','Wife: '+NM+'.')})}
// 497 Hemalatā Devī (doc 502)
{const t=await full(502);if(t.includes('A resident of Budhuri')){
 const id=await mk('Hemalatā Devī (daughter of Śyāmadāsa Cakravartī)',{place:'Budhuri',notes:'Father: Śyāmadāsa Cakravartī. Husband: Badu Gaṅgādāsa.'});
 await inv('move_text',{docId:502,fragment:t.slice(t.indexOf('## HEMALATĀ DEVĪ',10)),toPerson:id,title:'Hemalatā Devī'});
 await upd(497,f=>{if(f.guru.trim()==='Śyāmadāsa Cakravartī')f.guru=SR;if(f.place.trim()==='Budhuri')f.place='';addNote(f,`Father and guru: ${SR}. Husband: Gopijanavallabha, son of Rāmakṛṣṇa Cattaraj.`)})}}
// 348 Gopāla Cakravartī (doc 352)
{const t=await full(352);if(t.includes('Gopāla lived in Bengal')){
 const id=await mk('Gopāla Cakravartī (tax collector who offended Haridāsa)',{notes:'Chief tax collector of Hiraṇya and Govardhana Majumdar; he insulted Haridāsa Ṭhākura and was struck by leprosy (CC 3.3.190-210). Some say he was the same as Capala Gopāla.'});
 const end=t.indexOf('## GOPĀLA CAKRAVARTĪ',10);
 await inv('move_text',{docId:352,fragment:t.slice(0,end),toPerson:id,title:'Gopāla Cakravartī'});
 await upd(348,f=>{f.notes='Father-in-law and disciple of Śrīnivāsa Ācārya. His Sripata was at Jajigrama.'+NL+NL+`Daughter: Īśvarī Devī (Draupadī). Son-in-law and guru: ${SR}. Sons: Śyāma Dāsa and Rāmacaraṇa. Brother: Vṛndāvana Cakravartī.`;if(!f.guru.trim())f.guru=SR;if(!f.place.trim())f.place='Jajigrama'})}}
// 834 Lakṣmīpriyā (doc 841): Mahāprabhu's wife → 1841
{const t=await full(841);if(t.includes('She was the first wife of Lord Caitanya')){
 await inv('move_text',{docId:841,fragment:t.slice(t.indexOf('## LAKṢMĪPRIYĀ',10)),toPerson:1841,title:'Lakṣmīpriyā'});
 await upd(834,f=>{f.name='Lakṣmīpriyā (wife of Panna Gopāla)';f.notes='She was the wife of Panna Gopāla of Mangaladihi.'})}}
// Lakṣmīpriyā, mother of Śrīnivāsa
if(await has(1466,'no record of her own yet')){
 const LM='Lakṣmīpriyā (mother of Śrīnivāsa)';
 await mk(LM,{notes:`Daughter of Balarāma Vipra. Husband: Gaṅgadhara Bhaṭṭācārya. Son: ${SR}.`});
 await upd(1466,f=>{f.notes=f.notes.replace('mother Lakṣmīpriyā (daughter of Balarāma Vipra; no record of her own yet)','mother '+LM+' (daughter of Balarāma Vipra)')});
 await upd(293,f=>{f.notes=f.notes.replace('Wife: Lakṣmīpriyā.','Wife: '+LM+'.')})}
// 326 Gaurī Dāsa (doc 2958): the disciple of Śyāmānanda stays; Gaurīdāsa Paṇḍita's text → 325
{const t=await full(2958);const i=t.indexOf('# Gaurī dāsa - v.1');if(i>0){
 await inv('move_text',{docId:2958,fragment:t.slice(i),toPerson:325,title:'Gaurī Dāsa Paṇḍit'});
 await upd(326,f=>{f.name='Gaurī Dāsa (disciple of Śyāmānanda)';f.guru=SY+' (dīkṣā)';f.disciples='';f.place='';f.notes='He was a disciple of Śyāmānanda Prabhu. (Premavilāsa 20)'});
 await upd(325,f=>{if(!f.place.trim())f.place='Ambikā-kālnā';addNote(f,'Parents: Kamsari Miśra and Kamalā Devī. Brothers: Dāmodara, Jagannātha, Suryadasa Paṇḍit, Kṛṣṇadāsa Sarakhela and Nṛsiṁha-Caitanya. He served the Deities of Gaura-Nityānanda at Ambikā-kālnā until old age.')})}}
// 4 Abhirāma Dāsa (doc 4): the poet stays; Abhirāma Gosvāmī → 6
{const t=await full(4);const i=t.indexOf('Abhirāma Gosvāmī (Abhirāma Gopāla');if(i>0){
 await inv('move_text',{docId:4,fragment:t.slice(i),toPerson:6,title:'Abhirāma Gosvāmī'});
 await upd(4,f=>{f.guru='';f.place='';f.works='Govindavijaya, Kṛṣṇamaṅgala';addNote(f,'The author of Govinda-vijaya and Kṛṣṇa-maṅgala; not the same as Abhirāma Ṭhākura (Abhirāma Gosvāmī).')});
 await upd(6,f=>{for(const w of ['Śrī Virabhadrastaka','Śrī Gaṅgāstotra'])if(!f.works.includes(w))f.works=(f.works.trim()?f.works.trim()+', ':'')+w});
 await inv('move_person',{id:4,place:null});out.push('tree: 4 out')}}
// 1136 Puruṣottama Paṇḍita (doc 1150) — about ten people
{const p=await inv('get_person',{id:1136});if(p.notes.includes('2. He belonged to the sakhā of Lord Nityānanda')){
 const t=await full(1150);const blocks=t.split(/\n(?=## PURUṢOTTAMA\s*\n)/).map(b=>b.trim()).filter(b=>b);
 const who=[['Puruṣottama Paṇḍita (Orissa poet, Kāñcī-kāverī)',{works:'Kanchikaveri',place:'Orissa'}],
  ['Puruṣottama (disciple of Narottama)',{guru:NT}],['Puruṣottama (disciple of Rasikānanda)',{guru:'Rasikānanda Prabhu'}],
  ['Puruṣottama (disciple of Śyāmānanda)',{guru:SY,place:'Nrsimhapura'}],['Puruṣottama (of Kulīna-grāma)',{place:'Kulīna-grāma'}],
  ['Puruṣottama (Caitanya’s branch, CC 1.10.112)',{}],['Puruṣottama (of Navadvīpa, Vaiṣṇava-vandanā)',{place:'Navadvīpa'}],
  ['Puruṣottama (student of Lord Gaurāṅga)',{place:'Navadvīpa'}]];
 if(blocks.length!==who.length){out.push('STOP 1150: '+blocks.length+' blocks');return out}
 let narId=null;
 for(let k=0;k<blocks.length;k++){
  if(k===0){const id=await mk(who[k][0],who[k][1]);await inv('move_text',{docId:1150,fragment:blocks[k],toPerson:id,title:'Puruṣottama'});continue}
  const note=blocks[k].replace(/^## PURUṢOTTAMA\s*/,'').replace(/\s+/g,' ').trim();
  const id=await mk(who[k][0],{...who[k][1],notes:note});if(k===1)narId=id}
 await inv('trash_doc',{docId:1150});
 await mk('Puruṣottama (Advaita’s branch)',{guru:A,notes:'He belonged to the sakhā of Advaita prabhu. (Caitanya Caritāmṛta 1.12.63, Vaiṣṇava Vandanā)'});
 await mk('Puruṣottama Tīrtha (Puruṣottama Purī)',{notes:'A devotee of Lord Gaurāṅga. B.B. Majumdar (p. 662) states that the Puruṣottama Tīrtha mentioned by Jīva Gosvāmī and Vṛndāvanadāsa in their Vaiṣṇava-vandanā (260 and 129 respectively) is called Puruṣottama Purī by Devakīnandana in his Vaiṣṇava-vandanā 130.'});
 await upd(1886,f=>{if(!f.aka.includes('Puruṣottama'))f.aka=(f.aka.trim()?f.aka.trim()+', ':'')+'Puruṣottama'});
 await upd(1513,f=>{if(!f.aka.includes('Puruṣottama Ācārya'))f.aka=(f.aka.trim()?f.aka.trim()+', ':'')+'Puruṣottama Ācārya'});
 await upd(1136,f=>{f.aka='';f.guru=N;f.notes='He belonged to the sakhā of Lord Nityānanda and lived at Navadvīpa. (Caitanya Caritāmṛta 1.11.33, Caitanya Bhāgavata 3.5.737)'});
 // tree: Narottama's disciple takes the place under Narottama; Puruṣottama Paṇḍita goes beside Nityānanda
 await inv('move_person',{id:narId,place:{parent:1010,before:1136}});await inv('set_tree_kind',{id:narId,kind:'diksa'});
 await inv('move_person',{id:1136,place:{parent:1851,before:null}});await inv('set_tree_kind',{id:1136,kind:'associate'});
 out.push('tree: '+narId+' under Narottama, 1136 beside Nityānanda')}}
return out})()
