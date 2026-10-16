// Hadith des Tages: bekannte, anerkannte Überlieferungen (Vierzig Hadithe des Nawawi, Buchari, Muslim u. a.).
// Die Übersetzungen sind sinngemäß und stammen nicht aus einer amtlichen Ausgabe – vor Veröffentlichung an Dritte
// bitte von einem Kundigen gegenlesen lassen. Neue Einträge: de, tr, Quellen-Kürzel q, optional n (Nr. bei Nawawi).
// Quellen-Kürzel: B Buchari, M Muslim, T Tirmidhi, AD Abu Dawud, IM Ibn Madscha, N Nasa'i.

export const QUELLEN = {
  B: { de: "Buchari", tr: "Buhârî" }, M: { de: "Muslim", tr: "Müslim" }, T: { de: "Tirmidhi", tr: "Tirmizî" },
  AD: { de: "Abu Dawud", tr: "Ebû Dâvûd" }, IM: { de: "Ibn Madscha", tr: "İbn Mâce" }, N: { de: "Nasa'i", tr: "Nesâî" },
};

export const HADITHE = [
  { q: ["B", "M"], n: 1, de: "Die Taten sind nur gemäß den Absichten, und jedem steht nur zu, was er beabsichtigt hat.", tr: "Ameller ancak niyetlere göredir. Herkese ancak niyet ettiği şey vardır." },
  { q: ["B", "M"], n: 3, de: "Der Islam ist auf fünf Grundlagen gebaut: dem Bezeugen, dass es keinen Gott außer Allah gibt und dass Muhammad der Gesandte Allahs ist, dem Verrichten des Gebets, dem Entrichten der Zakat, der Pilgerfahrt zum Haus und dem Fasten im Ramadan.", tr: "İslam beş şey üzerine kurulmuştur: Allah'tan başka ilah olmadığına ve Muhammed'in Allah'ın resulü olduğuna şahitlik etmek, namaz kılmak, zekât vermek, Kâbe'yi haccetmek ve Ramazan orucunu tutmak." },
  { q: ["B", "M"], n: 5, de: "Wer in dieser unserer Angelegenheit etwas Neues einführt, das nicht zu ihr gehört, dessen Tat wird zurückgewiesen.", tr: "Kim bizim şu işimizde (dinimizde) ondan olmayan bir şey ihdas ederse, o reddedilir." },
  { q: ["M"], n: 7, de: "Die Religion ist Aufrichtigkeit. – Wir fragten: Für wen? – Er sagte: Für Allah, für Sein Buch, für Seinen Gesandten, für die Führer der Muslime und für alle Muslime.", tr: "Din samimiyettir (nasihattir). – „Kimin için?“ dedik. – „Allah için, Kitabı için, Resulü için, Müslümanların yöneticileri ve bütün Müslümanlar için.“" },
  { q: ["B", "M"], n: 9, de: "Was ich euch verboten habe, das meidet; und was ich euch befohlen habe, davon tut, so viel ihr könnt.", tr: "Size yasakladığım şeyden kaçının; size emrettiğim şeyi de gücünüz yettiğince yapın." },
  { q: ["T"], n: 12, de: "Zur Güte des Islam eines Menschen gehört, dass er das lässt, was ihn nichts angeht.", tr: "Kişinin kendisini ilgilendirmeyen şeyi terk etmesi İslam'ının güzelliğindendir." },
  { q: ["B", "M"], n: 13, de: "Keiner von euch glaubt wirklich, bis er für seinen Bruder liebt, was er für sich selbst liebt.", tr: "Sizden biriniz, kendisi için istediğini kardeşi için de istemedikçe (gerçekten) iman etmiş olmaz." },
  { q: ["B", "M"], n: 15, de: "Wer an Allah und den Jüngsten Tag glaubt, soll Gutes sprechen oder schweigen.", tr: "Kim Allah'a ve ahiret gününe iman ediyorsa ya hayır söylesin ya da sussun." },
  { q: ["B", "M"], n: 15, de: "Wer an Allah und den Jüngsten Tag glaubt, soll seinen Nachbarn ehren.", tr: "Kim Allah'a ve ahiret gününe iman ediyorsa komşusuna ikram etsin." },
  { q: ["B", "M"], n: 15, de: "Wer an Allah und den Jüngsten Tag glaubt, soll seinen Gast ehren.", tr: "Kim Allah'a ve ahiret gününe iman ediyorsa misafirine ikram etsin." },
  { q: ["B"], n: 16, de: "Werde nicht zornig.", tr: "Öfkelenme." },
  { q: ["M"], n: 17, de: "Wahrlich, Allah hat die Güte (Ihsan) in allen Dingen vorgeschrieben.", tr: "Şüphesiz Allah her şeyde ihsanı (güzelliği) farz kılmıştır." },
  { q: ["T"], n: 18, de: "Fürchte Allah, wo immer du bist; lass auf eine schlechte Tat eine gute folgen, sie löscht jene aus; und begegne den Menschen mit gutem Charakter.", tr: "Nerede olursan ol Allah'tan sakın; kötülüğün ardından iyilik yap ki onu silsin; insanlara güzel ahlakla muamele et." },
  { q: ["B"], n: 20, de: "Wenn du dich nicht schämst, dann tu, was du willst.", tr: "Utanmıyorsan dilediğini yap." },
  { q: ["M"], n: 21, de: "Sprich: „Ich glaube an Allah“, und dann sei standhaft.", tr: "De ki: „Allah'a iman ettim“, sonra dosdoğru ol." },
  { q: ["M"], n: 23, de: "Die Reinheit ist die Hälfte des Glaubens, und „Al-hamdu lillah“ füllt die Waage.", tr: "Temizlik imanın yarısıdır; „Elhamdülillah“ mizanı doldurur." },
  { q: ["M"], n: 27, de: "Das Rechtschaffene ist der gute Charakter, und die Sünde ist das, was in deiner Brust Unruhe auslöst und wovon du nicht willst, dass die Menschen es erfahren.", tr: "Birr (iyilik) güzel ahlaktır; günah ise içinde tereddüt uyandıran ve insanların bilmesini istemediğin şeydir." },
  { q: ["IM"], n: 32, de: "Es soll weder Schaden zugefügt noch Schaden mit Schaden vergolten werden.", tr: "Zarar vermek de, zarara zararla karşılık vermek de yoktur." },
  { q: ["M"], n: 34, de: "Wer von euch etwas Verwerfliches sieht, soll es mit seiner Hand ändern; kann er das nicht, dann mit seiner Zunge; kann er auch das nicht, dann mit seinem Herzen – und das ist der schwächste Glaube.", tr: "Sizden kim bir kötülük görürse onu eliyle değiştirsin; gücü yetmezse diliyle; ona da gücü yetmezse kalbiyle (buğzetsin) – bu da imanın en zayıf halidir." },
  { q: ["M"], n: 35, de: "Beneidet einander nicht, hasst einander nicht, wendet euch nicht voneinander ab, und seid, o Diener Allahs, Brüder.", tr: "Birbirinizi kıskanmayın, birbirinize buğzetmeyin, birbirinize sırt çevirmeyin; ey Allah'ın kulları, kardeş olun." },
  { q: ["M"], n: 36, de: "Wer einem Gläubigen eine Not dieser Welt erleichtert, dem erleichtert Allah eine Not am Tag der Auferstehung.", tr: "Kim bir mümin kardeşinin dünya sıkıntılarından birini giderirse, Allah da kıyamet günü onun bir sıkıntısını giderir." },
  { q: ["IM"], n: 39, de: "Allah hat meiner Gemeinschaft das Versehen, das Vergessen und das, wozu sie gezwungen wird, nachgesehen.", tr: "Allah, ümmetimden hatayı, unutmayı ve zorlandıkları şeyi bağışlamıştır." },
  { q: ["B"], n: 40, de: "Sei in dieser Welt wie ein Fremder oder ein Reisender.", tr: "Dünyada bir garip ya da bir yolcu gibi ol." },
  { q: ["B", "M"], de: "Der Starke ist nicht der, der andere niederringt; der Starke ist der, der sich im Zorn beherrscht.", tr: "Güçlü kimse güreşte yenen değildir; asıl güçlü, öfkelendiği zaman kendine hâkim olandır." },
  { q: ["T"], de: "Dein Lächeln gegenüber deinem Bruder ist eine Sadaqa (Almosen).", tr: "Kardeşine tebessüm etmen sadakadır." },
  { q: ["B"], de: "Die Besten unter euch sind diejenigen, die den Koran lernen und ihn lehren.", tr: "Sizin en hayırlınız Kur'an'ı öğrenen ve öğretendir." },
  { q: ["T", "IM"], de: "Der Beste von euch ist, wer zu seiner Familie am besten ist, und ich bin der Beste von euch zu meiner Familie.", tr: "Sizin en hayırlınız ailesine karşı en hayırlı olanınızdır; ben de aileme karşı en hayırlınızım." },
  { q: ["B", "M"], de: "Wer keine Barmherzigkeit zeigt, dem wird keine Barmherzigkeit gezeigt.", tr: "Merhamet etmeyene merhamet edilmez." },
  { q: ["AD", "T"], de: "Die Barmherzigen werden vom Allerbarmer mit Barmherzigkeit bedacht. Seid barmherzig mit denen, die auf der Erde sind, so erbarmt Sich eurer, der im Himmel ist.", tr: "Merhametli olanlara Rahman merhamet eder. Yeryüzündekilere merhamet edin ki göktekiler de size merhamet etsin." },
  { q: ["B", "M"], de: "Der Muslim ist der, vor dessen Zunge und Hand die anderen Muslime sicher sind.", tr: "Müslüman, elinden ve dilinden diğer Müslümanların emin olduğu kimsedir." },
  { q: ["AD", "T"], de: "Wer den Menschen nicht dankt, der dankt auch Allah nicht.", tr: "İnsanlara teşekkür etmeyen Allah'a da şükretmiş olmaz." },
  { q: ["B"], de: "Zwei Gnaden werden von vielen Menschen verkannt: die Gesundheit und die freie Zeit.", tr: "İki nimet vardır ki insanların çoğu bunlarda aldanmıştır: sağlık ve boş vakit." },
  { q: ["M"], de: "Wer einen Weg beschreitet, um Wissen zu suchen, dem erleichtert Allah dadurch einen Weg ins Paradies.", tr: "Kim ilim öğrenmek için bir yola girerse, Allah ona bunun sebebiyle cennete giden bir yolu kolaylaştırır." },
  { q: ["M"], de: "Allah schaut nicht auf eure Gestalten und euer Vermögen, sondern Er schaut auf eure Herzen und eure Taten.", tr: "Allah sizin suretlerinize ve mallarınıza bakmaz; kalplerinize ve amellerinize bakar." },
  { q: ["B", "M"], de: "Der Gläubige ist dem Gläubigen wie ein Bauwerk, dessen Teile einander stützen.", tr: "Mümin mümine karşı, parçaları birbirini destekleyen bir bina gibidir." },
  { q: ["B", "M"], de: "Die Gläubigen sind in ihrer gegenseitigen Liebe, Barmherzigkeit und Zuneigung wie ein Körper: Wenn ein Glied leidet, antwortet der ganze Körper mit Schlaflosigkeit und Fieber.", tr: "Müminler birbirlerini sevmede, birbirlerine merhamet etmede ve şefkat göstermede bir vücut gibidir; bir uzvu rahatsızlanınca diğer uzuvları uykusuzlukla ve ateşle ona katılır." },
  { q: ["B", "M"], de: "Wer den Ramadan aus Glauben und im Streben nach Allahs Lohn fastet, dem wird vergeben, was er zuvor an Sünden begangen hat.", tr: "Kim iman ederek ve sevabını Allah'tan bekleyerek Ramazan orucunu tutarsa, geçmiş günahları bağışlanır." },
  { q: ["B", "M"], de: "Was meint ihr: Wenn vor der Tür eines von euch ein Fluss wäre, in dem er fünfmal am Tag badet – bliebe etwas von seinem Schmutz? Sie sagten: Nein. Er sagte: So ist es mit den fünf Gebeten; Allah tilgt damit die Fehler.", tr: "Birinizin kapısı önünde bir nehir olsa ve her gün beş defa onda yıkansa, üzerinde kir kalır mı? „Hayır“ dediler. „İşte beş vakit namaz da böyledir; Allah onunla hataları siler.“" },
  { q: ["B", "M"], de: "Das Gebet in Gemeinschaft ist um siebenundzwanzig Grade besser als das Gebet des Einzelnen.", tr: "Cemaatle kılınan namaz, tek başına kılınan namazdan yirmi yedi derece daha faziletlidir." },
  { q: ["T", "N"], de: "Das Erste, wofür der Diener am Tag der Auferstehung zur Rechenschaft gezogen wird, ist sein Gebet.", tr: "Kıyamet günü kulun hesaba çekileceği ilk şey namazıdır." },
  { q: ["M"], de: "Wer das Morgengebet verrichtet, steht unter dem Schutz Allahs.", tr: "Kim sabah namazını kılarsa Allah'ın himayesindedir." },
  { q: ["M"], de: "Niemand demütigt sich vor Allah, ohne dass Allah ihn erhöht.", tr: "Kim Allah için tevazu gösterirse Allah onu yükseltir." },
  { q: ["M"], de: "Allah ist schön und liebt die Schönheit.", tr: "Allah güzeldir, güzeli sever." },
  { q: ["B", "M"], de: "Wer eine gute Tat beabsichtigt, sie aber nicht ausführt, dem schreibt Allah bei Sich eine volle gute Tat auf.", tr: "Kim bir iyiliğe niyet eder de onu yapmazsa, Allah katında ona tam bir sevap yazılır." },
  { q: ["B", "M"], de: "Zwei Worte, leicht auf der Zunge, schwer auf der Waage und beliebt beim Allerbarmer: „Subhanallahi wa bihamdihi, subhanallahi l-azim.“", tr: "İki kelime vardır ki dile hafif, mizanda ağır, Rahman'a sevimlidir: „Sübhânallâhi ve bihamdihî, sübhânallâhil-azîm.“" },
  { q: ["B", "M"], de: "Der Glaube hat über sechzig Zweige; der höchste ist das Wort „Es gibt keinen Gott außer Allah“, der niedrigste das Entfernen von Schädlichem vom Weg; und die Scham ist ein Zweig des Glaubens.", tr: "İman altmıştan fazla şubedir; en üstünü „Lâ ilâhe illallah“ demek, en aşağısı yoldan eziyet veren şeyi kaldırmaktır; haya da imanın bir şubesidir." },
  { q: ["M"], de: "Wer zu etwas Gutem anleitet, erhält den gleichen Lohn wie der, der es ausführt.", tr: "Hayra vesile olan, onu yapan gibi sevap kazanır." },
  { q: ["M"], de: "Wenn der Mensch stirbt, enden seine Taten – außer in drei Fällen: fortdauernde Wohltätigkeit, nützliches Wissen oder ein rechtschaffenes Kind, das für ihn betet.", tr: "İnsan ölünce ameli kesilir; ancak üç şey hariç: sürekli sadaka, faydalanılan ilim ve kendisine dua eden hayırlı evlat." },
  { q: ["B", "M"], de: "Jeder von euch ist ein Hirte, und jeder ist für seine Herde verantwortlich.", tr: "Hepiniz çobansınız ve hepiniz idareniz altındakilerden sorumlusunuz." },
  { q: ["B", "M"], de: "Der Gläubige lässt sich nicht zweimal aus demselben Loch stechen.", tr: "Mümin, aynı delikten iki defa sokulmaz." },
  { q: ["AD", "T"], de: "Wer seinen Zorn herunterschluckt, obwohl er die Macht hätte, ihn auszuleben, den ruft Allah am Tag der Auferstehung vor allen Geschöpfen zu Sich.", tr: "Kim, öfkesini tatbik etmeye gücü yettiği halde yutarsa, Allah onu kıyamet günü bütün mahlûkatın huzurunda çağırır." },
  { q: ["B", "M"], de: "Ein gutes Wort ist eine Sadaqa.", tr: "Güzel söz sadakadır." },
  { q: ["B", "M"], de: "Schützt euch vor dem Feuer, und sei es mit einer halben Dattel.", tr: "Yarım hurma ile de olsa kendinizi ateşten koruyun." },
  { q: ["B", "M"], de: "Die obere Hand (die gibt) ist besser als die untere Hand (die nimmt).", tr: "Veren el, alan elden daha hayırlıdır." },
  { q: ["B", "M"], de: "Hütet euch vor dem bösen Verdacht, denn der Verdacht ist die verlogenste Rede.", tr: "Zandan sakının; çünkü zan sözlerin en yalanıdır." },
  { q: ["B"], de: "Wer mir garantiert, was zwischen seinen Kiefern ist und was zwischen seinen Beinen ist, dem garantiere ich das Paradies.", tr: "Kim bana iki çenesi arasındakini (dilini) ve iki bacağı arasındakini koruma güvencesi verirse, ben ona cennet güvencesi veririm." },
  { q: ["B", "M"], de: "Wahrhaftigkeit führt zur Rechtschaffenheit, und Rechtschaffenheit führt ins Paradies.", tr: "Doğruluk iyiliğe götürür, iyilik de cennete götürür." },
  { q: ["T", "IM"], de: "Wer von euch am Morgen sicher in seinem Haus, gesund an seinem Körper und mit Nahrung für den Tag aufwacht, dem ist, als wäre ihm die ganze Welt gegeben worden.", tr: "Sizden kim evinde güven içinde, bedeni sağlıklı ve günlük yiyeceği yanında olarak sabahlarsa, ona sanki dünya bütünüyle verilmiş gibidir." },
  { q: ["M"], de: "Seht auf den, der unter euch steht, und nicht auf den, der über euch steht; so verkennt ihr die Gnade Allahs an euch nicht.", tr: "Sizden aşağıda olana bakın, yukarıda olana bakmayın; böylece Allah'ın size verdiği nimeti küçümsemezsiniz." },
  { q: ["B", "M"], de: "Reichtum ist nicht die Fülle des Besitzes, sondern der wahre Reichtum ist die Genügsamkeit der Seele.", tr: "Zenginlik mal çokluğu değildir; asıl zenginlik gönül zenginliğidir." },
  { q: ["M", "T"], de: "Wohl dem, der zum Islam geleitet wurde, dessen Lebensunterhalt ausreicht und der damit zufrieden ist.", tr: "Müslüman olan, geçimi yeten ve Allah'ın verdiğine kanaat eden kimse kurtuluşa ermiştir." },
  { q: ["M"], de: "Ihr werdet nicht ins Paradies eintreten, bis ihr glaubt, und ihr glaubt nicht, bis ihr einander liebt. Soll ich euch auf etwas hinweisen, wodurch ihr einander liebt? Verbreitet den Friedensgruß unter euch.", tr: "İman etmedikçe cennete giremezsiniz; birbirinizi sevmedikçe iman etmiş olmazsınız. Size, yaptığınız takdirde birbirinizi seveceğiniz bir şey göstereyim mi? Aranızda selamı yayın." },
  { q: ["T", "IM"], de: "Der Mensch füllt kein schlimmeres Gefäß als seinen Magen. Dem Sohn Adams genügen einige Bissen, die sein Rückgrat aufrecht halten.", tr: "Âdemoğlu midesinden daha kötü bir kap doldurmamıştır. Belini doğrultacak birkaç lokma ona yeter." },
  { q: ["T", "IM"], de: "Jeder Sohn Adams sündigt, und die Besten unter den Sündigen sind die Reuigen.", tr: "Âdemoğlunun hepsi hata eder; hata edenlerin en hayırlısı tövbe edenlerdir." },
  { q: ["M"], de: "Allah ist gut und nimmt nur Gutes an.", tr: "Allah güzeldir, ancak güzel olanı kabul eder." },
  { q: ["B", "M"], de: "Erleichtert und erschwert nicht; verkündet frohe Botschaft und schreckt nicht ab.", tr: "Kolaylaştırın, zorlaştırmayın; müjdeleyin, nefret ettirmeyin." },
];

// Für Freitage (wechseln wöchentlich)
export const FREITAGS_HADITHE = [
  { q: ["M"], de: "Der beste Tag, an dem die Sonne aufgeht, ist der Freitag: An ihm wurde Adam erschaffen, an ihm wurde er ins Paradies gebracht, und an ihm wurde er aus ihm herausgeführt.", tr: "Güneşin doğduğu günlerin en hayırlısı cuma günüdür: Âdem o gün yaratıldı, o gün cennete konuldu ve o gün oradan çıkarıldı." },
  { q: ["B"], de: "Wer am Freitag ein Vollbad nimmt, sich so gut er kann reinigt, sich mit Öl einreibt oder von dem Duft seines Hauses aufträgt, dann zum Gebet geht, ohne sich zwischen zwei Menschen zu drängen, so viel betet, wie ihm bestimmt ist, und schweigt, wenn der Imam spricht – dem wird vergeben, was zwischen diesem und dem nächsten Freitag liegt.", tr: "Kim cuma günü boy abdesti alır, gücü yettiğince temizlenir, yağ sürünür veya evindeki güzel kokudan sürünür, sonra mescide gider, iki kişinin arasını ayırmaz, takdir edildiği kadar namaz kılar, imam konuşurken susarsa, bu cuma ile gelecek cuma arasındaki günahları bağışlanır." },
];

/** Hadith für einen Kalendertag. `tagsNummer` = Tage seit 1970 (aus kalender.js), `wochentag` 0=So … 5=Fr. */
export function hadithFuer(tagsNummer, wochentag) {
  if (wochentag === 5) return FREITAGS_HADITHE[Math.floor(tagsNummer / 7) % FREITAGS_HADITHE.length];
  return HADITHE[((tagsNummer % HADITHE.length) + HADITHE.length) % HADITHE.length];
}

/** Quellenzeile, z. B. „Buchari, Muslim · Nawawi 40, Nr. 1“. */
export function quelleText(h, sprache, nawawiText) {
  const namen = h.q.map((k) => QUELLEN[k][sprache]).join(", ");
  return h.n ? `${namen} · ${nawawiText.replace("{n}", h.n)}` : namen;
}
