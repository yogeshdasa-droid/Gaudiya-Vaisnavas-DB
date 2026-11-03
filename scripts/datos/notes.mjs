import {DatabaseSync} from 'node:sqlite';const db=new DatabaseSync(process.env.BIO_COPY??'copia/biodata.db',{readOnly:true});
for(const id of process.argv.slice(2).map(Number)){const p=db.prepare('select * from persons where id=?').get(id);if(!p)continue;
console.log(`#### ${id} ${p.name} | aka:${p.aka} | guru:${p.guru} | disc:${p.disciples.slice(0,200)} | A:${p.appearance} | D:${p.disappearance} | P:${p.place}\n  NOTES: ${p.notes.replace(/\s+/g,' ').slice(0,700)}`);
for(const d of db.prepare('select id,title from docs where person_id=? and deleted is null').all(id)){const t=db.prepare('select text from sections where doc_id=? order by ordinal').all(d.id).map(r=>r.text).join(' ');console.log('  DOC',d.title,'|',t.replace(/\s+/g,' ').slice(0,1200))}}
