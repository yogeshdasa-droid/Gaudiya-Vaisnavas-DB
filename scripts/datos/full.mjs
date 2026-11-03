import {DatabaseSync} from 'node:sqlite';const db=new DatabaseSync(process.env.BIO_COPY??'copia/biodata.db',{readOnly:true});
for(const id of process.argv.slice(2).map(Number)){const p=db.prepare('select * from persons where id=?').get(id);if(!p){console.log('#### '+id+' GONE');continue}
const tr=db.prepare('select t.parent_id,q.name,t.kind from person_tree t left join persons q on q.id=t.parent_id where t.person_id=?').get(id);
console.log(`\n#### ${id} ${p.name} | aka:${p.aka} | guru:${p.guru} | disc:${p.disciples} | A:${p.appearance} | D:${p.disappearance} | P:${p.place} | works:${p.works} | tree:${tr?tr.name+'/'+tr.kind:'-'}\n  NOTES: ${p.notes}`);
for(const d of db.prepare('select id,title from docs where person_id=? and deleted is null').all(id)){const t=db.prepare('select text from sections where doc_id=? order by ordinal').all(d.id).map(r=>r.text).join('\n');console.log(`  DOC ${d.id} «${d.title}» (${t.length} ch)\n${t.slice(0,3500)}`)}}
