# vCONTROL

**Ovozli Boshqaruv Tizimi — Veb-interfeys**

Repozitoriy: [github.com/Xorazmlik/vCONTROL](https://github.com/Xorazmlik/vCONTROL)

Raspberry Pi (Zero 2 W, 2, 3, 4 yoki 5) va INMP441 raqamli mikrofoni
asosida qurilgan, **to'liq oflayn** ishlaydigan o'zbekcha ovozli GPIO
boshqaruv tizimi. Loyiha dastlab oddiy Python skripti sifatida boshlangan
edi (mikrofondan ovoz o'qib, bitta LED'ni yoqib-o'chiruvchi) — bu qism esa
o'sha g'oyani to'liq veb-interfeysga, istalgan sondagi GPIO qoidasini
o'zi sozlay oladigan tizimga aylantiradi. Hech qanday tashqi internet
xizmatiga (bulutli nutqni aniqlash, uchinchi tomon API) bog'liq emas —
nutqni aniqlash butunlay qurilmaning o'zida, Vosk kutubxonasi yordamida
amalga oshadi, shuning uchun tizim internetsiz joyda ham, va shaxsiy
suhbatlaringiz hech qayerga jo'natilmagan holda ham ishlayveradi.

## Nima qila oladi

- **Ikki tilli interfeys (O'zbek / English)** — sahifaning yuqori
  o'ng burchagidagi "UZ / EN" tugmalari orqali interfeys tilini istalgan
  payt almashtirish mumkin. Tanlov brauzeringizda saqlanib qoladi, shuning
  uchun keyingi safar sahifani ochganingizda avvalgi tanlovingiz
  qo'llanadi. E'tibor bering: bu faqat interfeys (tugmalar, yorliqlar,
  xabarlar) tilini o'zgartiradi — ovozli buyruqlarning o'zi baribir
  o'zbek tilida aytilishi kerak, chunki tizim aynan o'zbekcha Vosk
  modelidan foydalanadi.
- **Raspberry Pi Zero 2 W, 2, 3, 4 va 5** — qaysi modelni
  ishlatayotganingizni sahifada bitta tugma bosib tanlaysiz. GPIO
  raqamlash barcha modellarda bir xil (40-pinli header o'zgarmagan),
  shuning uchun ulanish sxemasi model tanlovidan qat'i nazar bir xil
  qoladi. **Pi 5** uchun esa tizim buni avtomatik aniqlab, kerakli
  dasturiy backend (`lgpio`)ni o'zi sozlaydi — sababi va o'rnatish yo'li
  pastdagi "Muammolarni bartaraf etish" bo'limida batafsil tushuntirilgan.
- **Mikrofon ulanishini sahifadan ko'rish va sozlash** — INMP441'ning
  SCK/WS/SD pinlari qaysi GPIO'ga va qaysi jismoniy pinga ulanganini
  jadval ko'rinishida ko'rasiz. Standart bo'lmagan ulanish qilgan
  bo'lsangiz, shu qiymatlarni "Kengaytirilgan" bo'limidan
  o'zgartirishingiz mumkin — bunda tizim o'sha pinlarni GPIO qoidalar
  ro'yxatidan avtomatik chetlab o'tadi, shunda ularni tasodifan boshqa
  maqsadga tanlab qo'ymaysiz.
- **Serial Monitor** — "Tinglash" blokida (Arduino IDE'dagiga o'xshash)
  aniqlangan har bir so'z xronologik tartibda chiqib turadi. Qaysi
  qatorga bossangiz, o'sha so'z darhol "Yangi qoida" formasidagi maydonga
  tushadi (va bonus sifatida clipboard'ga ham nusxalanadi) — agar qurilma
  yoki talaffuz xato eshitilsa, aynan nima eshitilganini ko'rib, o'sha
  holatni bir bosishda to'g'ri qoidaga aylantirasiz.
- **To'liq moslashuvchan qoidalar** — har qanday bo'sh GPIO pinni
  tanlab, unga o'zingiz xohlagan o'zbekcha so'zni va amalni (ON/HIGH
  yoki OFF/LOW) biriktirasiz — hammasi veb-sahifada, kod yozmasdan.
  Bitta GPIO uchun bir nechta so'z belgilash mumkin (masalan GPIO 6
  uchun ham "yon", ham "chiroqni yoq" — ikkalasi ham ON qiladi), lekin
  bitta so'z faqat bitta (GPIO, amal) juftligiga tegishli bo'la oladi —
  tizim bu qoidani buzishga urinishni avtomatik bloklaydi va aniq
  sababini tushuntiradi.
- **Jonli holat va yashash tekshiruvi** — qaysi qismlar haqiqiy
  apparatga ulanganini (Vosk modeli yuklanganmi, GPIO ishlayaptimi yoki
  simulyatsiya rejimidami) sahifa tepasidagi indikatorlar orqali darhol
  ko'rasiz.
- **Apparatsiz sinov (simulyatsiya rejimi)** — haqiqiy Raspberry Pi
  bo'lmasa ham (masalan, oddiy kompyuteringizda), tizim buni avtomatik
  payqab, GPIO amallarini xatoliksiz, faqat jurnalga yozib bajaradi.
  Shu sababli butun interfeysni — qoida qo'shish, o'chirish, sozlamalar —
  har qanday kompyuterda to'liq sinab ko'rish mumkin.

## Talablar

**Apparat (haqiqiy ishlatish uchun):**
- Raspberry Pi Zero 2 W, 2, 3, 4 yoki 5 (64-bit Raspberry Pi OS bilan —
  sababi pastda tushuntirilgan)
- INMP441 I2S raqamli mikrofon moduli
- Ixtiyoriy: LED yoki tranzistorli rele kaliti (namunaviy misolda GPIO 6)

**Dasturiy ta'minot:**
- Python 3.9 yoki undan yuqori
- pip (Python paket menejeri)
- Haqiqiy Pi'da: `arecord` (odatda `alsa-utils` paketi bilan birga keladi)

**Kompyuterda faqat interfeysni ko'rish uchun** yuqoridagilarning
hech biri shart emas — pastdagi "Tezkor boshlash" bo'limiga qarang.

> **Nega 64-bit Raspberry Pi OS?** `vosk` kutubxonasi 64-bit tizim uchun
> tayyor (oldindan qurilgan) paket bilan ta'minlangan, lekin 32-bit
> versiyada odatda topilmaydi va manba kodidan qurishni talab qiladi —
> bu ancha murakkab va uzoq jarayon. 64-bit Raspberry Pi OS esa Pi
> Zero 2 W, 3, 4 va 5'ning barchasida bemalol ishlaydi, shuning uchun
> imkon qadar shundan foydalanishni tavsiya qilamiz.

## Tezkor boshlash: avval kompyuteringizda ko'ring

Pi apparati qo'lingizda bo'lmasa ham, yoki shunchaki interfeys qanday
ko'rinishini oldindan bilmoqchi bo'lsangiz, quyidagi buyruqlar yetarli —
pastdagi "O'rnatish" va "Doimiy ishlashi uchun" bo'limlarini hozircha
o'tkazib yuborishingiz mumkin:

```bash
git clone https://github.com/Xorazmlik/vCONTROL.git
cd vCONTROL
pip install -r requirements.txt --break-system-packages
python3 app.py
```

So'ng brauzerda `http://localhost:5000` manzilini oching. Yuqoridagi
**MODEL** va **GPIO** indikatorlari boshida qizil/to'q sariq bo'lib
ko'rinadi — bu shu bosqichda kutilgan, normal holat (Vosk modeli hali
yuklab olinmagan va haqiqiy GPIO apparati yo'q), interfeysning qolgan
qismi — qoida qo'shish, GPIO pin tanlagich, Pi modeli tugmalari,
mikrofon ulanish jadvali, til almashtirish — hammasi to'liq ishlaydi.
Batafsil tushuntirish uchun pastdagi "Kompyuterda (Pi'siz) sinash"
bo'limiga qarang.

## 1) Raspberry Pi'da o'rnatish

Apparat ulanishi (INMP441 → GPIO 18/19/20, LED → GPIO 6 namunaviy misol
sifatida) barcha qo'llab-quvvatlanadigan Pi modellarida bir xil, chunki
ular barchasi bir xil 40-pinli headerga ega. `/boot/firmware/config.txt`
faylida I2S interfeysi yoqilgan bo'lishi kerak (agar hali yoqilmagan
bo'lsa, faylning oxiriga qo'shing):

```
dtparam=i2s=on
dtoverlay=googlevoicehat-soundcard
```

Bu qatorlar Linux yadrosiga INMP441'dan I2S orqali audio signal
qabul qilinishini va uni oddiy audio qurilma (soundcard) sifatida
ko'rsatishni buyuradi — shu tufayli keyinchalik oddiy `arecord`
buyrug'i bilan mikrofondan ovoz o'qiy olamiz.

Kerakli tizim paketlarini o'rnating:

```bash
sudo apt update
sudo apt install -y python3-pip alsa-utils portaudio19-dev libasound2-dev
```

Loyihani Pi'ga GitHub'dan klonlang, so'ng loyiha papkasi ichida turib
Python kutubxonalarini o'rnating:

```bash
git clone https://github.com/Xorazmlik/vCONTROL.git
cd vCONTROL
pip install -r requirements.txt --break-system-packages
```

(Klonlash o'rniga `scp` yoki USB fleshka orqali ko'chirish ham mumkin —
bu holatda ham papka nomini `vCONTROL` deb qoldirish tavsiya etiladi,
aks holda pastdagi systemd namunasidagi yo'lni ham moslashtirishingiz
kerak bo'ladi.)

(`--break-system-packages` bayrog'i zamonaviy Raspberry Pi OS/Debian
versiyalarida kerak bo'ladi, chunki ular tizim Python'iga to'g'ridan-
to'g'ri paket o'rnatishni cheklaydi. Bu xavfsiz — biz shu loyiha uchun
kerakli uchta kichik kutubxonani o'rnatyapmiz, xolos.)

**Agar Raspberry Pi 5 ishlatayotgan bo'lsangiz**, qo'shimcha ravishda
`lgpio` kerak bo'ladi. Buning ENG ODDIY yo'li — apt orqali (tayyor ARM
paketi, hech narsa qurish shart emas):

```bash
sudo apt update
sudo apt install -y python3-lgpio
```

> Nega maxsus e'tibor kerak? `pip install lgpio --break-system-packages`
> orqali o'rnatishga urinsangiz, ARM protsessorda (x86 emas) u manba
> kodidan qurilishga harakat qiladi va ketma-ket ikkita xatolik bilan
> to'xtaydi: avval `swig topilmadi`, keyin `liblgpio topilmadi`.
> Yuqoridagi apt buyrug'i esa tayyor, oldindan qurilgan paketni
> o'rnatadi, shuning uchun bu muammolarning hech biriga duch kelmaysiz.
> Agar biror sababga ko'ra baribir pip orqali (masalan venv ichida)
> o'rnatmoqchi bo'lsangiz, avval quyidagini bajaring:
> ```bash
> sudo apt install -y swig liblgpio-dev python3-dev
> pip install lgpio --break-system-packages
> ```
> Sababi: Pi 5 yangi RP1 chipi orqali ishlaydi va eski `RPi.GPIO`
> kutubxonasini qo'llab-quvvatlamaydi — shuning uchun `gpiozero`ga
> alohida `lgpio` backendi kerak. Pi 2/3/4 va Zero 2 W'da bu qo'shimcha
> qadamning hech biri kerak emas, chunki ular eski `RPi.GPIO` bilan ham
> muammosiz ishlayveradi.

### Vosk o'zbek modelini yuklab olish

Nutqni aniqlash uchun tayyor o'zbekcha akustik model kerak. Buni faqat
BIR MARTA, internet mavjud paytda yuklab olasiz — keyin tizim butunlay
oflayn ishlayveradi:

```bash
cd vCONTROL
wget https://alphacephei.com/vosk/models/vosk-model-small-uz-0.22.zip
unzip vosk-model-small-uz-0.22.zip
mv vosk-model-small-uz-0.22/* model/
rmdir vosk-model-small-uz-0.22
rm vosk-model-small-uz-0.22.zip
```

## 2) Ishga tushirish

```bash
python3 app.py
```

Boshqa qurilmadan (masalan noutbukdan) `http://<pi-ip-manzili>:5000`
orqali, yoki Pi'ning o'ziga monitor ulangan bo'lsa
`http://localhost:5000` orqali oching. Pi'ning IP manzilini bilish
uchun terminalda `hostname -I` buyrug'ini bajaring.

### Foydalanish tartibi

Sahifada quyidagi tartibda harakat qilish tavsiya etiladi:

1. **"Qurilma va mikrofon"** blokida Raspberry Pi modelingizni tanlang
   va mikrofon ulanish jadvalini tekshiring (standart INMP441 ulanishi
   bo'lsa, hech narsani o'zgartirish shart emas — jadval faqat
   tasdiqlash uchun).
2. **"Yangi qoida"** blokida GPIO pinni (doira ko'rinishidagi tugma)
   bosib tanlang — bu tugmalar haqiqiy 40-pinli headerni aks ettiradi,
   allaqachon band pinlar (mikrofon yoki tizim ehtiyojlari uchun)
   ro'yxatda umuman ko'rinmaydi.
3. ON (yoqish/HIGH) yoki OFF (o'chirish/LOW) amalini tanlang.
4. Ovozli buyruq bo'ladigan so'zni o'zbek tilida yozing va
   **"Qoidani qo'shish"** tugmasini bosing.
5. **"Tinglash"** blokidagi tugma orqali mikrofonni yoqing — endi shu
   so'z aytilganda tanlangan GPIO darhol ishga tushadi. Pastdagi Serial
   Monitor'da har bir aniqlangan so'zni jonli kuzatib borishingiz
   mumkin.

## 3) Doimiy ishlashi uchun (systemd)

Agar tizim Pi yoqilgan har safar avtomatik ishga tushishini, va biror
sababdan yiqilib qolsa o'zi qayta tiklanishini xohlasangiz, uni systemd
xizmati sifatida ro'yxatdan o'tkazing:

```bash
sudo cp voice-control.service /etc/systemd/system/
sudo nano /etc/systemd/system/voice-control.service   # yo'l va foydalanuvchi nomini tekshiring
sudo systemctl daemon-reload
sudo systemctl enable --now voice-control.service
sudo systemctl status voice-control.service
```

Xizmat ishlab turgan paytda jurnal (log) yozuvlarini ko'rish uchun:

```bash
journalctl -u voice-control.service -f
```

## 4) Kompyuterda (Pi'siz) sinash

`gpiozero` yoki `vosk` o'rnatilmagan, yoki mos apparat topilmagan
taqdirda ham `python3 app.py` xatoliksiz ishga tushadi. Sahifa
yuqorisidagi **MODEL** va **GPIO** ko'rsatkichlari (LED) haqiqiy
holatni ko'rsatadi:

- 🟢 yashil — to'liq ishlayapti (haqiqiy apparat topildi / model
  yuklandi)
- 🟠 to'q sariq (mis rang) — GPIO simulyatsiya rejimida (apparat
  topilmadi, amallar faqat jurnalga yoziladi)
- 🔴 qizil — model topilmadi (`model/` papkasini tekshiring)

Bu rejimda qoidalarni qo'shish, o'chirish, sozlamalarni o'zgartirish va
butun interfeysni sinab ko'rish to'liq mumkin; faqat haqiqiy audio
signali va haqiqiy GPIO chiqishi bo'lmaydi — ularning o'rniga konsolda
`[SIMULYATSIYA] GPIO 6 -> HIGH (ON)` kabi yozuvlar chiqadi.

## Muammolarni bartaraf etish

**`ModuleNotFoundError` yoki import xatoligi** — `pip install -r
requirements.txt --break-system-packages` buyrug'i to'liq va xatoliksiz
bajarilganini tekshiring.

**`lgpio` o'rnatishda `swig` yoki `liblgpio` xatoligi** — yuqoridagi
"Raspberry Pi 5" qismidagi apt-orqali o'rnatish yo'lini ishlating
(`sudo apt install -y python3-lgpio`); pip orqali manba kodidan qurish
odatda kerak emas.

**Kompyuterimda `python3-lgpio` yoki `liblgpio-dev` paketi
topilmayapti** — bu ehtimol siz oddiy Debian/Ubuntu kompyuterda
ishlayotganingizni bildiradi (Raspberry Pi emas). Bu paketlar
Raspberry Pi OS'ning o'ziga xos repozitoriylarida mavjud. Agar
maqsadingiz shunchaki interfeysni ko'rish bo'lsa, `lgpio`ni umuman
o'rnatishga urinmang — yuqoridagi "Tezkor boshlash" bo'limiga qarang,
tizim simulyatsiya rejimida to'liq ishlayveradi.

**"TINGLASHNI BOSHLASH" tugmasi bosilmayapti (kulrang)** — bu Vosk
modeli hali `model/` papkasiga joylashtirilmaganini bildiradi. Yuqoridagi
"Vosk o'zbek modelini yuklab olish" bo'limiga qarang.

**Mikrofondan ovoz kelmayapti, lekin xatolik ham chiqmayapti** —
`/boot/firmware/config.txt`dagi I2S sozlamalari to'g'ri kiritilganini
va Pi qayta ishga tushirilganini (`sudo reboot`) tekshiring, so'ngra
`arecord -l` buyrug'i orqali audio qurilma tizim tomonidan ko'rinib
turganini tasdiqlang.

**So'z hech qachon aniqlanmayapti yoki noto'g'ri aniqlanadi** —
"Tinglash" blokidagi Serial Monitor'ga qarang: tizim aynan nimani
eshitganini ko'rasiz. Agar u kutganingizdan boshqacha so'z chiqarayotgan
bo'lsa (masalan talaffuz yoki mikrofon sifati tufayli), o'sha qatorni
bosib, aynan shu variantni yangi qoida sifatida qo'shib qo'yishingiz
mumkin.

## Fayl strukturasi

```
vCONTROL/
├── app.py                   # Flask serveri + REST API
├── core/
│   ├── command_store.py     # Qoidalarni JSON'da saqlash + validatsiya
│   ├── gpio_manager.py      # GPIO boshqaruvi (+ Pi 5 uchun lgpio, simulyatsiya rejimi)
│   ├── settings_store.py    # Pi modeli va mikrofon pin sozlamalari
│   ├── pinout.py            # BCM<->fizik pin xaritasi, Pi modellari ro'yxati
│   └── voice_engine.py      # Vosk fon oqimi, dinamik grammatika
├── config/
│   ├── commands.json        # Saqlangan qoidalar (avtomatik yaratiladi/yangilanadi)
│   └── settings.json        # Pi modeli + mikrofon pinlari (avtomatik yaratiladi)
├── templates/index.html     # Veb-sahifa (data-i18n atributlari bilan)
├── static/
│   ├── css/style.css
│   └── js/
│       ├── i18n.js          # O'zbek/ingliz tarjima lug'ati
│       └── main.js          # Interfeys mantig'i
├── model/                   # Vosk uz modeli shu yerga joylashadi
├── requirements.txt
├── voice-control.service    # systemd xizmat namunasi
├── LICENSE                  # MIT litsenziyasi
└── README.md
```

## Texnik eslatmalar

- Foydalanish mumkin bo'lgan GPIO pinlar ro'yxati doimo dinamik
  hisoblanadi: I2C/UART/EEPROM pinlari (`core/pinout.py` ichidagi
  `BASE_RESERVED_PINS`) hamda joriy mikrofon sozlamasida band qilingan
  pinlar (`config/settings.json`) ro'yxatdan avtomatik chetlashtiriladi.
  Mikrofon pinini o'zgartirsangiz, band pinlar ro'yxati ham shu zahoti
  yangilanadi — shu bilan bir GPIO'ni tasodifan ikki xil maqsadga
  ishlatib qo'yish imkoniyati oldindan yo'q qilingan.
- Raspberry Pi 2/3/4/5 va Zero 2 W bir xil 40-pinli headerga ega — GPIO
  raqamlash va jismoniy pin joylashuvi barchasida bir xil. Model
  tanlovi asosan Pi 5'ning `lgpio` talabini avtomatik hal qilish uchun
  ishlatiladi; boshqa hech qanday funksional farq yo'q.
- So'zlarni solishtirish katta-kichik harf va ortiqcha bo'sh joylarga
  sezgir emas ("Yon " va "yon" bir xil hisoblanadi), va mos kelish aniq
  (to'liq) satr darajasida amalga oshadi.
- `config/commands.json` va `config/settings.json` fayllarini qo'lda
  ham tahrirlash mumkin, lekin veb-panel orqali qo'shish/o'zgartirish
  validatsiyani avtomatik bajaradi — qo'lda tahrirlashda bu tekshiruvlar
  ishlamaydi, shuning uchun ehtiyot bo'ling.
- Backend xatoliklari tayyor matn emas, balki barqaror "kod" (masalan
  `word_taken`) va parametrlar shaklida qaytariladi; yakuniy xabar
  `static/js/i18n.js` ichida, tanlangan tilga qarab, frontendda
  shakllantiriladi. Yangi til qo'shmoqchi bo'lsangiz, asosan shu faylni
  to'ldirish kifoya.

## Xavfsizlik

**Bu loyihada hech qanday kirish (login) tekshiruvi, parol yoki
foydalanuvchi hisobi tizimi mavjud emas.** Bu — nazardan chetda qolgan
kamchilik emas, balki ataylab qilingan qaror: loyiha ochiq manbali,
shaxsiy/hobbi darajasidagi boshlang'ich nuqta sifatida chiqarilmoqda, va
xavfsizlik talablari har bir odamning aniq joylashtirish (deployment)
sharoitiga juda qattiq bog'liq bo'lgani uchun, buni oldindan barcha
holatlarga mos qilib hal qilish imkonsiz.

Amalda bu shuni anglatadi: veb-server ishga tushgan paytda, o'sha
tarmoqdagi **istalgan qurilma** (kompyuter, telefon, yoki hatto boshqa
IoT qurilma) hech qanday parolsiz sahifani ochib, qoidalarni
o'zgartirishi, GPIO chiqishlarini boshqarishi va tizim sozlamalarini
o'zgartirishi mumkin. Uy tarmog'ida, faqat o'zingiz va ishonchli
odamlar ulangan holatda bu odatda muammo emas — lekin buni bilib
turish kerak.

**Tavsiyalar:**

- Tizimni faqat **ishonchli mahalliy tarmoqda** (uy Wi-Fi'i kabi)
  ishlating. Routeringizda portni tashqi internetga ochib qo'ymang
  (port forwarding qilmang) va statik/ochiq IP orqali internetga
  to'g'ridan-to'g'ri chiqarmang.
- Agar tizimni uydan tashqarida ham boshqarish kerak bo'lsa, oddiy port
  ochish o'rniga VPN (masalan WireGuard yoki Tailscale) orqali o'z
  tarmog'ingizga xavfsiz ulaning, so'ng shu VPN ichidan veb-panelga
  kiring.
- Agar buni **jiddiyroq yoki ko'p foydalanuvchili IoT tizimida**
  qo'llamoqchi bo'lsangiz, quyidagilardan birini albatta qo'shing:
  - Flask uchun tayyor autentifikatsiya kutubxonasi (masalan
    `Flask-Login` yoki oddiy session-asosidagi login sahifasi) qo'shib,
    parolsiz kirishni butunlay bloklang; yoki
  - Serverni reverse-proxy (nginx yoki Caddy) orqasiga joylashtirib,
    unga HTTP Basic Auth yoki to'liq huquqli autentifikatsiya
    qatlamini biriktiring; yoki
  - Agar sizda allaqachon o'z autentifikatsiya/xavfsizlik tizimingiz
    bo'lgan kattaroq IoT platforma bo'lsa, ushbu loyihaning Flask veb-
    serverini alohida ochiq holda ishlatish o'rniga, uning REST
    API'sini (`/api/...` yo'llari) o'sha platformangizning
    autentifikatsiya qilingan qatlami orqali chaqiring.
- Umuman, ushbu kodni "tayyor mahsulot" emas, balki **ishonchli
  boshlang'ich nuqta** deb qarang — GPIO/ovoz mantig'i to'liq ishlaydi,
  lekin foydalanuvchi kirishini cheklash sizning mas'uliyatingizda
  qoladi.

## Hissa qo'shish

Xatolik topsangiz, yaxshilash bo'yicha g'oyangiz bo'lsa yoki yangi
funksiya qo'shmoqchi bo'lsangiz, GitHub'da Issue oching yoki Pull
Request yuboring. Kod tuzilishi jihatidan har bir modul (`core/`
ichidagi fayllar) o'z vazifasiga ega bo'lgani uchun (qoidalar, GPIO,
sozlamalar, ovoz dvigateli alohida-alohida), kerakli qismni topish va
o'zgartirish nisbatan oson bo'lishi kerak.

## Litsenziya

Ushbu loyiha **MIT litsenziyasi** ostida tarqatiladi — to'liq matn
uchun [LICENSE](LICENSE) fayliga qarang. Qisqacha aytganda: bu kodni
istalgan maqsadda (shu jumladan tijorat maqsadida ham) erkin
foydalanishingiz, o'zgartirishingiz va tarqatishingiz mumkin, yagona
shart — asl mualliflik huquqi bildirishnomasini saqlab qolish.

