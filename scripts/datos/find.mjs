import {DatabaseSync} from 'node:sqlite';
const db=new DatabaseSync(process.env.BIO_COPY??'copia/biodata.db',{readOnly:true});
const fold=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z ]/g,'');
const all=db.prepare("select p.id,p.name,p.aka,p.appearance a,p.disappearance d,p.place pl,(t.person_id is not null) tree from persons p left join person_tree t on t.person_id=p.id").all();
for(const q of process.argv.slice(2)){const w=fold(q).split(' ');
 const hits=all.filter(p=>w.every(x=>fold(p.name+' '+p.aka).includes(x)));
 console.log('## '+q); for(const h of hits.slice(0,6)) console.log(`  ${h.id}${h.tree?'*':''} ${h.name} | A:${h.a.slice(0,50)} | D:${h.d.slice(0,50)} | P:${h.pl.slice(0,50)}`);}
