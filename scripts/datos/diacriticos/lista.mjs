// node lista.mjs <sugerencias.json> <salida palabras.json>   (21-11-2026, Whisper: «que las palabras salgan con sus
// diacríticos, la mayoría que puedas»)
// From the app's suggestions (`diacritic_suggestions`): the dictionary ones minus the doubtful, plus the ones learnt
// from the library that were checked one by one (the rest of those has rubbish — «age→āge», «seen→seeṇ» — and words
// with two meanings — Brahma/Brahmā, Vasudeva/Vāsudeva, rasa/rāsa —). Writes [[plain, with diacritics], …] for
// `replace_apply` (spec.words: whole words, any case, the capitals kept).
import fs from "node:fs";
const [inp, out] = process.argv.slice(2);
const sug = JSON.parse(fs.readFileSync(inp, "utf8"));

// dictionary words left out: two meanings, Spanish/English, or a wrong guess for a compound
const DICT_OUT = new Set(
  `mata namas saras mayas sakha sakhas shakha varah bhadra bhadravana bhadrasena bhadrabhadra ramabhadra dasavatara
   krpamaya dayamaya mayamaya shravana siddhanama bhagavatacarya madhavananda namananda nrisimhananda nrsimhananda
   prahladananda kirtanananda krparama krsnaa dasaa`.split(/\s+/).filter(Boolean),
);
// right form for a few the app proposes wrongly
const FIX = {
  sravana: "śravaṇa", sacinandana: "śacīnandana", tatastha: "taṭastha", parakiya: "parakīya", sankhya: "sāṅkhya",
  tesam: "teṣām", jnanam: "jñānam", vamsa: "vaṁśa", sraddhaya: "śraddhayā", krpaya: "kṛpayā", sakatasura: "śakaṭāsura",
};
// learnt from the library, checked one by one (the 900 most frequent; the rest is left as it is)
const LIB_OK = new Set(
  `khanda adi baba sakti sanga yamuna premanande haila radhe pandavas nahi hiranyakasipu aham suddha ananda vrajavasis
   kanistha giriraja rupanuga tomara yatha ravana kama kaliya suta prthu prajnana sada visnupada daksa purusa prana
   svayam raghava durvasa danda jane carana mayavadi arcana mandala garuda idam madhai kumara rsis sadhya ajamila manah
   raja bhima tvam jagai sthane mayavada krsnera sudarsana kisora kumaras pravista khan yah sacinandana mayavadis tatha
   bada sange sarvam jarasandha vamsi pranaya ramana vidya hladini kim abhasa padmanabha namah prakasa kariya
   anyabhilasita visvarupa koti karila madhumangala sruti sesa duhkha tatastha jada ekam sahajiya natha tamal devahuti
   devananda parakiya godavari sunyam vrsabhanu sankhya karana dham asraya mahadeva haiya vani sati saranam ache brhad
   ksane sisupala puripada nila padam prakrti prataparudra kaila karmis anuraga harih apane dasaratha karuna aghasura
   purusam dhrtarastra brahmanda visvamitra rupe visaya punah dekhiya anukulyena bhrgu adhikara kazi lata diya gela
   kartika panca sukracarya trnad mula kasyapa bija taha anga tare kiba hrdaya tatah tanra visnoh asana bhismadeva
   bhagavatamrta varsa venu katwa evam priti hrsikesa tamala varna sunicena punya satyam giya garbhodakasayi yanra
   prajapati kriya lanka nrtya rsabhadeva lagila bahya isvarah hariscandra karmady sattvika bihari purna brahmananda
   gundica vrtrasura prabodhananda amrta bhai bhaktya varuna anavrtam jani mahatma aji nirguna sriyam brhaspati carane
   anande vada dana smarta apana vakya karna yadavas hiranyaksa salagrama smrti bhajami mani vaisnavera karanam krsnah
   toma narasimha dhari upasana himalayas venkata darpana sahajiyas patrika svayambhuva suniya babu jivana dhyana
   phalam sarira bakasura vrajavasi namabhasa prasade yayati angira sisu madhuri pramana srutis upadesa kesavaji gurum
   jivera sabda guroh iccha visnudutas jayatirtha kalindi sagara ranga syat
   namaskara sahisnuna svakiya bhaktim vrtti cirat mamata bhumi tomare dhananjaya anyatha anubhasya krta jivanam
   prakata brahmanya mohini surabhi bhutanam rajendra udupi yamadutas karya mahan sabare tesam nivrtti canura avidya
   chadi rahugana jnanam bhutani purva surya nace mustika pracetas hrdi kusa yada calila gatim krsne vadhu candrasekhara
   padmavati amanina linga vamsa acyutananda drona pandu partha snana vayu amare sunya govindaji vira navadvipe prakrta
   bhavananda nityam parah tasmad kale laiya navina svetadvipa vanamali kutira smarana gopisvara hrd kirtaniyah kunkuma
   lagi markandeya bhiksa vicara nahika pradhana saksad sastre grhe laksana tahara chota ksirodakasayi pitambara uvaca
   kesi asiya ramai sadasiva aradhana deham tathapi hiranya vaikunthaloka kayastha hastinapura kausalya satyaraja
   trnavarta bhuri sadashiva simha vyuha asvatthama sugriva vacaspati grha karmani vapuh camara asru bhrtya bhutesu
   ksana santi sekhara bhuvanesvara vidyadhiraja matih puman sthali gargacarya atah esa puspanjali yanti gosvamipada
   marici prtha hridaya kuliya urvasi dese adhoksaja rukmi vidyanagara varnas saunaka klim sandipani amsa dosa krsnaya
   pranali puspa visva digvijayi dhira dhrta sthana stri dhirah vigrahah yaksas nandini pache vibhisana mattah tattvam
   tyaktva arya ratri vrksa yavat kamalakara mahesvara rajasuya sripata subha aptakama dhanam hitva saktir sayujya
   akshobhya jyotisekhara kanu lavanga rahu samba khande omkara parijata akincana hamsa papebhyo sabde kishora manasah
   rupena jatila mallika raksasas mayaya namaiva priyah devayani sanjaya kathamrtam romaharsana salva akhanda maryada
   sanatanau prthivi yadava bhaktih sarvajna sraddhaya visuddha malini saranga darsinah mangalam ninda vishvarupa adau
   moksayisyami prarabdha suhrt tanhara laksmipati anadi drdha krida sabha santosa sucah dhenukasura isa kathah sukham
   jagadisa bhagyavan nyasi uddhara yanhara vrajanatha gopalakau karmi nandanah nidra sankalpa tridanda vancha virya
   lakshmipati tungavidya yajigrama aprakata dadati sankha patala radhanatha saptagrama purata dharmah kaupina srestha
   tire duhkhi bhagya hatta krpaya krtam tanum hadai kanai kubja gatam kisori krti mangalacarana katyayani sakatasura
   uttaradi jayate apsaras paundraka achaye ange baliya dhuli gosthi karunya parivara minaketana aise asesa hrdaye sarire
   sudha yatah jati jnane saksat sarvatha sese vrndavane hina majhe namni pumsah sastric visesa gauri pandava raksaka
   ramakeli srivatsa viduh aprakrta sankirtanam strinam sune janaki prabhasa dhariya gopika kanya kutah niscaya patnis
   soka candi adhirudha vadanam jagadisha janardana pippalai saksi varahadeva gatah govindah ista kacid papi purusah
   rajan chandrashekhara mithila kriyatam punati svarupam chandogya narayani apurva hrdayam suvarna chandrasekhara
   isopanisad ahaituki antaryami srivasadi samvada vrsni bhavuka gunaih kanti saktis samah sandhya svarupe suryadasa`
    .split(/\s+/)
    .filter(Boolean),
);

const pairs = new Map();
let dictN = 0, libN = 0, count = 0;
for (const s of sug) {
  const w = s.word.toLowerCase();
  // glued words («SrilaPrabhupada»: a space lost in the text) stay as they are
  if (/[a-z][A-Z]/.test(s.word)) continue;
  let to = (FIX[w] ?? s.proposed).toLowerCase();
  if (s.source === "dict") {
    if (DICT_OUT.has(w)) continue;
    // a compound guessed without the long ā of «ānanda»
    if (/ananda$/.test(w) && !/ānanda$/.test(to)) continue;
    dictN++;
  } else {
    if (!LIB_OK.has(w)) continue;
    libN++;
  }
  if (to === w) continue;
  pairs.set(w, to);
  count += s.count;
}
fs.writeFileSync(out, JSON.stringify([...pairs], null, 0));
console.log(`palabras: ${pairs.size} (diccionario ${dictN}, revisadas de la biblioteca ${libN}) — ${count.toLocaleString("es")} veces`);
