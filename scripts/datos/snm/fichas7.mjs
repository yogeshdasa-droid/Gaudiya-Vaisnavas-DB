// node fichas7.mjs [puerto] [--dry]   (17-11-2026) — conferencias de SNM, tanda 7: Śrī Nityānanda Prabhu (#1851).
// Guru: SNM (2003-02-14) dice Lakṣmīpati Tīrtha → pasa al primer lugar (los demás se quedan, con su fuente).
import { aplicar, SRC } from "./aplicar.mjs";

const F = [
  {
    id: 1851,
    name: "Śrī Nityānanda Prabhu",
    notes:
      "From the lectures of Śrīla Nārāyaṇa Gosvāmī Mahārāja: born at Ekacakrā to Padmāvatī and Hāḍāi Paṇḍita, as a boy He always played Baladeva or Lakṣmaṇa; at about twelve a sannyāsī took Him on pilgrimage all over India; at Pandharpur He met Lakṣmīpati Tīrtha, the guru of Mādhavendra Purī, who initiated Him — therefore Mahāprabhu honoured Him as a guru; He broke Mahāprabhu's ekadaṇḍa in three on the way to Purī; He led Mahāprabhu after sannyāsa to Śāntipura, where Śacī-mātā met Him; after the Ratha-yātrā Mahāprabhu sent Him to preach in Bengal, especially to the low castes and the poor; He foretold the ruin of Rāmacandra Khān; He married Jāhnavā and Vasudhā, and His son Vīrabhadra took initiation from Jāhnavā-devī; He met Jīva Gosvāmī in Navadvīpa and sent him to Vṛndāvana (see the text «In the lectures…»).",
    set: {
      guru: "Lakṣmīpati Tīrtha (Bhakti-ratnākara; Gauḍīya Maṭha; lectures of Śrīla Nārāyaṇa Gosvāmī Mahārāja); Mādhavendra Purī (Abhidhāna; the Caitanya-bhāgavata shows Him revering Mādhavendra as His guru); Īśvara Purī (Prema-vilāsa 24); Saṅkarṣaṇa Purī (Jīva Gosvāmī)",
    },
    text: `## In short

For Śrīla Nārāyaṇa Gosvāmī Mahārāja, Nityānanda Prabhu is Baladeva Himself, akhaṇḍa-guru-tattva, the jagat-guru without whose mercy no one can attain Rādhā-Kṛṣṇa — «Nitāi-pada-kamala», he would insist, must be sung and explained. Born at Ekacakrā to Padmāvatī and Hāḍāi Paṇḍita, as a boy He always took the part of Baladeva or Lakṣmaṇa in the village plays, once lying senseless as Lakṣmaṇa until His friends remembered the herb. At about twelve a sannyāsī asked His father for Him, and He travelled all over India; at Pandharpur He met Lakṣmīpati Tīrtha, the guru of Mādhavendra Purī, who initiated Him — so Mahāprabhu, two generations after Him in that line, honoured Him as a guru. He performed Mahāprabhu's Vyāsa-pūjā, delivered Jagāi and Mādhāi, led the new sannyāsī to Śāntipura to meet Śacī-mātā, and broke His ekadaṇḍa in three on the way to Purī. Sent back to Bengal, He preached to the fallen and low-caste without distinction, foretold the ruin of Rāmacandra Khān, married Jāhnavā and Vasudhā, and in Navadvīpa met the young Jīva and sent him to Vṛndāvana. He is «akrodha paramānanda»: never angry, even when Mādhāi made Him bleed.

## In the lectures

- **Baladeva** — «Nityananda is jagat-guru, guru of the universe. He is personally Baladeva Prabhu» (Australia, 1997-02-20). «So Baladeva Prabhu Himself is Nityananda Prabhu» (Bali, 2001-02-06). «In Gaura-lila He came back as Lord Nityananda, the older brother,not younger brother, and He broke the ekadanda of Mahaprabhu» (2000-08-15).
- **Childhood at Ekacakrā** — «Nityananda Prabhu took birth in Ekacakra. His mother Padmavati and father Hadai Pandit» (2001-02-06). «When He was a small boy of 5, 6, 7, 8, 9, He used to play only the parts of Baladeva Prabhu in Krishna pastimes, sometimes Laksmana in Rama pastimes» (2001-02-06). Playing Lakṣmaṇa, «When he shot Laksmana, Nityananda Prabhu became senseless» (2001-02-06).
- **Pilgrimage and initiation** — «In the meantime when He came about 12 years, a renounced order sannyasi came» (2001-02-06). «And there luckily Laksmipati Tirtha, the guru of Madhavendra Puri met Him» (2001-02-06). «Mahaprabhu is in the disciplic succession two generations after Nityananda Prabhu, and He therefore used to show him great respect» (Brazil, 2003-02-14).
- **Śāntipura** — «After Caitanya Mahaprabhu took sannyasa, He wanted to go to Vrndavana, but Nityananda Prabhu kindly, by trick, changed His direction and took Him to Santipura» (2003-02-14).
- **The daṇḍa** — «O my dear danda, why are you in the hands of Sri Caitanya Mahaprabhu» (2000-05-23). «Nityananda Prabhu then took that danda, broke it into three parts, and threw it in the river nearby» (2000-05-23). «Sri Nityananda prabhu as Guru, did not accept the principle of ekadanda sannyasa, and therefore He broke Mahaprabhus danda in three» (2000-05-23).
- **Etiquette** — «When Caitanya Mahaprabhu used to dance in Srivasa-angam and would faint in the courtyard, Nityananda Prabhu would not touch Him» (1997-02-20).
- **Preaching in Bengal** — «after the festival Mahaprabhu ordered him to return to Bengal and preach His mission there. He preached without care for caste or creed, and he especially preached to those who were inferior in caste and very poor» (2003-02-14). «Nityananda Prabhu embraced and inspired everyone in Bengal, including all those who were fallen» (1997-02-20).
- **Rāmacandra Khān** — sent to the cowshed, «Nityananda Prabhu began to laugh very loudly» (2003-02-14): «Certainly your place is not pure enough for me. A cowshed is superior» (2003-02-14).
- **Never angry** — «When Jagai and Madhai hit him and he was bleeding, he prayed to Mahaprabhu, "In this incarnation, You should forgive them, and give them Krsna-prema» (2003-02-14).
- **Jīva Gosvāmī** — «That is why Nityananda Prabhu ordered Jiva Gosvami to go to Vrndavana and learn all philosophical conclusions under the guidance of Srila Rupa Gosvami and Srila Santana Gosvami» (1997-02-20).
- **His family** — the lecture was to tell «how He married with Jahnava-devi and Vasudha-devi, and how His son Virabhadra Prabhu took initiation from Jahnava-devi» (1997-02-20).

## Sources

${SRC}: «The Glories of Nityananda Prabhu, Part 2» (Australia, 20 February 1997); «Raya Ramananda's Appearance» (Maui, Hawaii, 23 May 2000); «Lord Baladeva's Appearance Day» (15 August 2000); «Nityananda Trayodasi (am)» (Bali, 6 February 2001); «Lord Nityananda Is Never Angry» (Teresópolis, Brazil, 14 February 2003).`,
  },
];

await aplicar(F);
