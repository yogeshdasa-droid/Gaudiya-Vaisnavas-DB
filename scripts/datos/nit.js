(async()=>{const inv=window.__TAURI_INTERNALS__.invoke;const NL=String.fromCharCode(10);const out=[];
const F=p=>({name:p.name,aka:p.aka,appearance:p.appearance,disappearance:p.disappearance,place:p.place,guru:p.guru,disciples:p.disciples,works:p.works,notes:p.notes,tags:p.tags});
const addNote=(f,line)=>{if(!f.notes.includes(line))f.notes=(f.notes.trim()?f.notes.trim()+NL+NL:'')+line};
const N='Śrī Nityānanda',J='Jāhnavā Devī (Mātā)',V='Vasudhā',VC='Vīracandra (Vīrabhadra Gosvāmī)',G='Gaṅgā Devī',M='Mādhava Ācārya',SD='Suryadasa Paṇḍit',GD='Gaurī Dāsa Paṇḍit',P='Padmāvatī Devī',H='Hadai Ṭhākura (Mukunda Ojha Haddipa Paṇḍita)';
const TWELVE='One of the twelve gopālas of Śrī Nityānanda.';
const GOP=['Abhirāma Ṭhākura (Śrīdāmā)','Sundarānanda Ṭhākura (Sudāmā)','Dhananjaya (Vasudāmā)','Gaurī Dāsa Paṇḍit (Subala)','Kamalakara Pippalai (Mahābala)','Uddhāraṇa Datta Ṭhākura (Subāhu)','Maheśa Paṇḍita (Mahābāhu)','Puruṣottama Dāsa (Dāma)','Parameśvara Dāsa Ṭhākura (Arjuna)','Kālīya Kṛṣṇa Dāsa Ṭhākura (Lavaṅga)','Kholāvecā Śrīdhara (Kusumāsava)'];
const ops={
1851:[N,f=>{addNote(f,`Family (exact names): father ${H}; mother ${P}; wives ${V} and ${J}; father-in-law ${SD}; son ${VC}; daughter ${G}; son-in-law ${M}.`);
  addNote(f,`The twelve gopālas (Gaura-gaṇoddeśa-dīpikā 126-132; exact names): ${GOP.join(', ')}.`);
  for(const n of ['Maheśa Paṇḍita','Kālīya Kṛṣṇa Dāsa Ṭhākura'])if(!f.disciples.includes(n))f.disciples=(f.disciples.trim()?f.disciples.trim()+', ':'')+n}],
439:['Hadai',f=>addNote(f,`Wife: ${P}. Son: ${N}.`)],
1066:[P,f=>addNote(f,`Husband: ${H}. Son: ${N}.`)],
1660:[V,f=>addNote(f,`Husband: ${N}. Father: ${SD}. Younger sister: ${J}. Son: ${VC}. Daughter: ${G}.`)],
574:[J,f=>addNote(f,`Exact names: husband ${N}; father ${SD}; elder sister ${V}; uncle ${GD}; stepson and disciple ${VC}; adopted son Rāmacandra Gosvāmī (Ramai).`)],
1503:[SD,f=>addNote(f,`Daughters: ${V} and ${J}, wives of ${N}. Brother: ${GD}.`)],
292:[G,f=>addNote(f,`Father: ${N}. Mother: ${V}. Brother: ${VC}. Husband: ${M}.`)],
857:[M,f=>{addNote(f,`Husband of ${G}, the daughter of ${N}.`);addNote(f,'In Kṛṣṇa-līlā: King Śantanu (Gaura-gaṇoddeśa-dīpikā 69).')}],
1703:[VC,f=>addNote(f,`Father: ${N}. Mother: ${V}. Stepmother and guru: ${J}. Sister: ${G}.`)],
325:[GD,f=>addNote(f,`Brother of ${SD}; uncle of ${V} and ${J}. His disciple Hṛdaya Caitanya was the guru of Śyāmānanda.`)],
1701:['Vīrabhadra Gosvāmī',f=>{if(!f.guru.trim())f.guru=J+' (dīkṣā)'}],
894:['Maheśa Paṇḍita',f=>{if(!f.guru.trim())f.guru=N}],
639:['Kālīya Kṛṣṇa Dāsa Ṭhākura',f=>{if(!f.guru.trim())f.guru=N;addNote(f,'In Kṛṣṇa-līlā: Lavaṅga (Gaura-gaṇoddeśa-dīpikā 132).')}],
1702:['Vīrabhadra',f=>{f.name='Vīrabhadra (disciple of Śyāmānanda)'}],
1704:['Vīracandra Gosvāmī',f=>{f.name='Vīracandra Gosvāmī (Madograma, 19th c.)'}],
1504:['Suryadasa',f=>{f.name='Suryadasa (son of Harivaṁśa)'}],
1497:['Sundarānanda',f=>{f.name='Sundarānanda (disciple of Śyāmānanda)'}],
1495:['Sundarānanda Paṇḍit',f=>{f.name='Sundarānanda Paṇḍit (disciple of Abhirāma)'}]};
for(const id of [6,1496,1814,325,657,1567,894,1129,1080,639,1833]){const prev=ops[id];ops[id]=[prev?prev[0]:'',f=>{prev&&prev[1](f);addNote(f,TWELVE)}]}
for(const [id,[name,fn]] of Object.entries(ops)){const p=await inv('get_person',{id:+id});if(name&&!p.name.startsWith(name.split(' (')[0])){out.push('SKIP '+id+' '+p.name);continue}
 const f=F(p);const before=JSON.stringify(f);fn(f);if(JSON.stringify(f)===before)continue;await inv('update_person',{id:+id,fields:f});out.push('OK '+id+' '+f.name)}
return out})()
