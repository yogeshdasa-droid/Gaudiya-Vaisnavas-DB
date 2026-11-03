(async()=>{const inv=window.__TAURI_INTERNALS__.invoke;const NL=String.fromCharCode(10);const out=[];
const F=p=>({name:p.name,aka:p.aka,appearance:p.appearance,disappearance:p.disappearance,place:p.place,guru:p.guru,disciples:p.disciples,works:p.works,notes:p.notes,tags:p.tags});
const addNote=(f,line)=>{if(!f.notes.includes(line))f.notes=(f.notes.trim()?f.notes.trim()+NL+NL:'')+line};
const addDisc=(f,names)=>{const add=names.filter(n=>!f.disciples.includes(n));if(add.length)f.disciples=(f.disciples.trim()?f.disciples.trim().replace(/;$/,'')+', ':'')+add.join(', ')};
const setGuru=(f,g)=>{if(!f.guru.trim())f.guru=g};
const SR='Śrīnivāsa Ācārya',NT='Śrī Narottama dāsa Ṭhākura',SY='Śyāmānanda Paṇḍita',HC='Hridayacaitanya (Hiranyaka)';
const ops={
// Śrīnivāsa Ācārya
1466:[SR,f=>{f.disciples=f.disciples.replace('King Vīra Hamvira (Birahambira) of Vana-Visnupura','Vīra Hamvira');
  addNote(f,`Family (exact names): father Gaṅgadhara Bhaṭṭācārya (later called Caitanya Dāsa); mother Lakṣmīpriyā (daughter of Balarāma Vipra; no record of her own yet); wives Īśvarī Devī (Draupadī) and Gaurāṅga Priyā; fathers-in-law Gopāla Cakravartī and Raghunātha Cakravartī; sons Vṛndāvana Vallabha, Rādhākṛṣṇa (no record) and Gati Govinda; daughters Hemalatā Devī, Krsnapriya Devī and Yamunā. Close companions: ${NT} and ${SY}; dearest disciple: Rāmacandra Kavirāja.`);
  addDisc(f,['Rāmacandra Kavirāja','Īśvarī Devī','Gaurāṅga Priyā','Raghunātha Cakravartī','Sulaksana','Krsnapriya Devī','Gati Govinda','Gokula Dāsa (Gokulananda)','Sridasa'])}],
293:['Gaṅgadhara Bhaṭṭācārya',f=>addNote(f,`Wife: Lakṣmīpriyā. Son: ${SR}.`)],
519:['Īśvarī Devī',f=>{if(!f.aka.trim())f.aka='Draupadī';addNote(f,`Husband and guru: ${SR}. Father: Gopāla Cakravartī.`)}],
320:['Gaurāṅga Priyā',f=>{setGuru(f,SR);addNote(f,`Husband and guru: ${SR}. Father: Raghunātha Cakravartī.`)}],
348:['Gopāla Cakravartī',f=>{if(f.disciples.trim()===SR)f.disciples='';addNote(f,`Daughter: Īśvarī Devī. Son-in-law (not his disciple): ${SR}.`)}],
1205:['Raghunātha Cakravartī',f=>{setGuru(f,SR);addNote(f,`Daughter: Gaurāṅga Priyā. Son-in-law and guru: ${SR}.`)}],
1750:['Vṛndāvana Vallabha',f=>addNote(f,`Father: ${SR}.`)],
305:['Gati Govinda',f=>{f.guru=f.guru.replace('Śrīnīvasa Ācārya',SR);addNote(f,`Father and guru: ${SR}.`)}],
799:['Krsnapriya Devī',f=>{setGuru(f,SR);addNote(f,`Father and guru: ${SR}.`)}],
1780:['Yamunā',f=>addNote(f,`Father: ${SR}.`)],
335:['Gokula Dāsa',f=>addNote(f,'Brother: Sridasa.')],
1435:['Sridasa',f=>addNote(f,'Brother: Gokula Dāsa (Gokulananda).')],
1700:['Vīra Hamvira',f=>addNote(f,`Wife: Sulaksana. Son: Dhīra Hamvira (Dhadi Hamvira). Guru: ${SR}. Jīva Gosvāmī named him Caitanyadāsa.`)],
1490:['Sulaksana',f=>{setGuru(f,SR);addNote(f,'Husband: Vīra Hamvira.')}],
214:['Dhīra Hamvira',f=>addNote(f,'Father: Vīra Hamvira.')],
1244:['Rāmacandra Kavirāja',f=>addNote(f,`Mother: Sunanda. Brother: Govinda Dāsa Kavirāja (no record). Inseparable friend: ${NT}.`)],
1493:['Sunanda',f=>addNote(f,'Son: Rāmacandra Kavirāja.')],
1916:['Rādhākṛṣṇa Ācārya',f=>setGuru(f,'Gati Govinda')],
// Narottama
1010:[NT,f=>{if(f.guru.trim()==='Kṛṣṇadāsa Kavirāj Gosvāmī')f.guru='Lokanātha Gosvāmī (dīkṣā), Śrīla Jīva Gosvāmī (śikṣā), Śrī Kṛṣṇadāsa Kavirāja Gosvāmī (śikṣā)';
  addNote(f,`Family (exact names): father Kṛṣṇānanda Datta; mother Nārāyaṇī Dāsī (her record also mixes in Lord Caitanya's nurse); uncle Puruṣottama Datta; cousin Santosa Datta (Rāya). Dīkṣā guru: Lokanātha Gosvāmī. Inseparable friend: Rāmacandra Kavirāja.`);
  addDisc(f,['Santosa Datta (Rāya)','Narottama Majumdar'])}],
791:['Kṛṣṇānanda Datta',f=>addNote(f,`Son: ${NT}. Wife: Nārāyaṇī Dāsī. Brother: Puruṣottama Datta. Nephew: Santosa Datta (Rāya).`)],
1130:['Puruṣottama Datta',f=>addNote(f,`Brother: Kṛṣṇānanda Datta. Son: Santosa Datta (Rāya). Nephew: ${NT}.`)],
1375:['Santosa Datta',f=>{if(f.guru.trim()==='Narottama Ṭhākura')f.guru=NT;addNote(f,`Father: Puruṣottama Datta. Cousin and guru: ${NT}.`)}],
1006:['Nārāyaṇī Dāsī',f=>{if(f.disciples.trim()==='Narottama Ṭhākura')f.disciples='';addNote(f,`Son (not disciple), in note 2: ${NT}. Husband: Kṛṣṇānanda Datta.`)}],
1011:['Narottama Majumdar',f=>setGuru(f,NT)],
1376:['Santosa Rāya',f=>{f.name='Santosa Rāya (brother of Chānd Rāya)'}],
844:['Lokanātha Gosvāmī',f=>{if(f.disciples.trim()==='Narottama Dāsa')f.disciples=NT}],
// Śyāmānanda
1535:[SY,f=>{if(f.guru.trim()==='Śrī Jīva Gosvāmī')f.guru=HC+' (dīkṣā), Śrīla Jīva Gosvāmī (śikṣā)';
  addNote(f,`Family (exact names): father Krsnamandala; mother Durika Dāsī. Dīkṣā guru: ${HC}.`);
  addDisc(f,['Rasikānanda Prabhu','Uddanda Rāya','Sundarānanda (disciple of Śyāmānanda)','Vīrabhadra (disciple of Śyāmānanda)'])}],
504:['Hridayacaitanya',f=>{setGuru(f,'Gaurī Dāsa Paṇḍit');if(f.disciples.trim()==='Śyāmānanda Prabhu')f.disciples=SY}],
325:['Gaurī Dāsa Paṇḍit',f=>addDisc(f,[HC])],
785:['Krsnamandala',f=>addNote(f,`Wife: Durika Dāsī. Son: ${SY}.`)],
238:['Durika Dāsī',f=>addNote(f,`Husband: Krsnamandala. Son: ${SY}.`)],
1566:['Uddanda Rāya',f=>setGuru(f,SY)],
1497:['Sundarānanda',f=>setGuru(f,SY)],
1702:['Vīrabhadra',f=>{if(f.guru.trim()==='Śyāmānanda Prabhu')f.guru=SY}],
1908:['Rasikānanda Prabhu',f=>{if(f.guru.startsWith('Śyāmānanda Paṇḍita, Śrī Śyāmānanda'))f.guru=SY+' (dīkṣā)'}]};
for(const [id,[name,fn]] of Object.entries(ops)){const p=await inv('get_person',{id:+id});if(!p.name.startsWith(name.split(' (')[0])){out.push('SKIP '+id+' '+p.name);continue}
 const f=F(p);const before=JSON.stringify(f);fn(f);if(JSON.stringify(f)===before)continue;await inv('update_person',{id:+id,fields:f});out.push('OK '+id+' '+f.name)}
return out})()
