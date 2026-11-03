(async()=>{const inv=window.__TAURI_INTERNALS__.invoke;const NL=String.fromCharCode(10);const out=[];
const F=p=>({name:p.name,aka:p.aka,appearance:p.appearance,disappearance:p.disappearance,place:p.place,guru:p.guru,disciples:p.disciples,works:p.works,notes:p.notes,tags:p.tags});
const addNote=(f,line)=>{if(!f.notes.includes(line))f.notes=(f.notes.trim()?f.notes.trim()+NL+NL:'')+line};
const A='Śrī Advaita Ācārya Prabhu',S='Sītā Ṭhākurāṇī',AC='Acyutānanda (son of Advaita)';
const SONS=`${AC}, Kṛṣṇamiśra, Gopāla Miśra, Balarāma Miśra, Svarūpa Ācārya, Jagadīśa Miśra`;
const son=f=>addNote(f,`Father: ${A}. Mother: ${S}. Brothers: ${SONS.split(', ').filter(n=>n!==f.name).join(', ')}.`);
const ops={
14:['Acyutananda',f=>{f.name=AC;if(!f.guru.trim())f.guru='Gadādhara Paṇḍit Gosvāmī';if(!f.place.trim())f.place='Śāntipura';if(!f.appearance.trim())f.appearance='1426 Śaka (1504) (CC: 1428 Śaka)';
  addNote(f,'Eldest son of Śrī Advaita Ācārya Prabhu (see his text).');son(f);addNote(f,'In Kṛṣṇa-līlā: Kārttikeya and the gopī Acyutā (Gaura-gaṇoddeśa-dīpikā 87-88).')}],
786:['Kṛṣṇamiśra',son],85:['Balarāma Miśra',son],1510:['Svarūpa Ācārya',son],533:['Jagadīśa Miśra',son],
358:['Gopāla Miśra',f=>{son(f);if(!f.place.trim())f.place='Śāntipura';if(!f.appearance.trim())f.appearance='Kārtika Śukla Daśamī, 1500 (?) (Advaita-prakāśa 11)'}],
15:[A,f=>{addNote(f,`Family (exact names): father Kuvera Paṇḍit; mother Nabha; grandfather Narasimha Nadial; brothers (Premavilāsa 24) Kusala Dāsa, Kirticandra, Sadāśiva, Srikanta; wives ${S} and Śrī; father-in-law Nṛsiṁha Bhadudi; sons ${SONS} (from Sītā), Śyāmadāsa (from Śrī).`)}],
819:['Kuvera Paṇḍit',f=>{if(/^\s*Advaita Prabhu\s*$/.test(f.disciples))f.disciples='';addNote(f,`Son (not disciple): ${A}; also Kusala Dāsa, Kirticandra and others (seven sons in all). Wife: Nabha.`)}],
956:['Nabha',f=>addNote(f,`Husband: Kuvera Paṇḍit. Son: ${A}.`)],
986:['Narasimha Nadial',f=>addNote(f,`Grandson: ${A}.`)],
1049:['Nṛsiṁha Bhadudi',f=>addNote(f,`Daughter: ${S}, wife of ${A}.`)],
1417:[S,f=>addNote(f,`Husband: ${A}. Father: Nṛsiṁha Bhadudi. Sons: ${SONS}.`)],
1431:['Śrī',f=>addNote(f,`Husband: ${A}. Son: Śyāmadāsa.`)],
817:['Kusala Dāsa',f=>addNote(f,`Brother of ${A}; son of Kuvera Paṇḍit.`)],
1345:['Sadāśiva',f=>addNote(f,`Brother of ${A}; son of Kuvera Paṇḍit.`)],
727:['Kirticandra',f=>addNote(f,`Probably the sixth son of Kuvera Paṇḍit and a brother of ${A} (the note above seems to have them reversed).`)],
1416:['Sītā Devī',f=>{f.name='Sītā Devī (mother of Lokanātha)'}],
1907:['Gopāla Miśra',f=>{if(f.guru.includes('Sanātana'))f.name='Gopāla Miśra (disciple of Sanātana)'}],
1103:['Prakāśānanda',f=>{if(f.guru.trim()==='(dīkṣā) Advaita')f.guru=A+' (dīkṣā)'}]};
const D={240:'Durlabha Viśvāsa',557:'Jagannātha Kāra',588:'Janārdana Dāsa',843:'Lokanātha Dāsa',865:'Mādhava Paṇḍit',1470:'Śrīvatsa Paṇḍit',1441:'Sriharicarana',1587:'Vaidyanatha',1628:'Vanamālī Kavicandra',1679:'Vijay Paṇḍit',1681:'Vijaya Dāsa',1759:'Yādava Dāsa',1769:'Yadunandana Ācārya',141:'Bhavanatha Kar',99:'Bhagavān Kar',147:'Bholanatha Dās'};
for(const [id,n] of Object.entries(D))ops[id]=[n,f=>{if(!f.guru.trim())f.guru=A}];
const extra=[...Object.values(D),'Ananta Dāsa','Divyasimha Rāja','Padmanābha','Kanu Paṇḍit','Prakāśānanda'];
const old=ops[15][1];ops[15]=[A,f=>{old(f);const have=f.disciples;const add=extra.filter(n=>!have.includes(n));if(add.length)f.disciples=(have.trim()?have.trim()+', ':'')+add.join(', ')}];
ops[274]=['Gadādhara Paṇḍit Gosvāmī',f=>{if(!f.disciples.includes(AC))f.disciples=(f.disciples.trim()?f.disciples.trim()+', ':'')+AC}];
for(const [id,[name,fn]] of Object.entries(ops)){const p=await inv('get_person',{id:+id});if(p.name!==name&&!p.name.startsWith(name.split(' (')[0])){out.push('SKIP '+id+' '+p.name);continue}
 const f=F(p);const before=JSON.stringify(f);fn(f);if(JSON.stringify(f)===before)continue;await inv('update_person',{id:+id,fields:f});out.push('OK '+id+' '+f.name)}
return out})()
