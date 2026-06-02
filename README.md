# Kişisel Yayın Arşivi

Hikaye, şiir, çeviri vitrini, inceleme, analiz ve bildiri yazıları için hazırlanmış statik kişisel websitesi.

## Açma

`index.html` dosyasını tarayıcıda açman yeterli. Build süreci veya paket kurulumu yok.

## Sayfa Yapısı

- `index.html`: ana vitrin, tür odaları, filtreli arşiv ve çeviri seçkisi.
- `yayin.html?id=...`: seçili yayını türüne göre özel okuma düzeniyle açar.
- `content.js`: tüm yayın verileri.
- `script.js`: ana sayfa arşiv ve filtre davranışı.
- `publication.js`: yayın detay sayfası ve türe özel şablonlar.

## İçerik Ekleme

Yayınlar `content.js` içindeki `posts` dizisinden yönetiliyor. Yeni bir yayın için mevcut nesnelerden birini kopyalayıp şu ortak alanları değiştir:

- `id`: kısa ve benzersiz yayın kimliği
- `title`: yayın başlığı
- `category`: `story`, `poem`, `translation`, `essay` veya `paper`
- `classification`: bölümlü hikaye, şiir dizisi, altyazı, kısa ekran çevirisi gibi alt sınıf
- `format`: chapter serisi, serbest şiir, zaman kodlu çeviri gibi biçim
- `date`: `YYYY-MM-DD`
- `status`: taslak, revizyon, portfolyo veya yayımlandı
- `language`: `TR`, `EN → TR`, `TR → EN` gibi dil bilgisi
- `tags`: arama ve kart etiketleri
- `summary`: kart ve yayın girişi özeti

## Türe Özel Alanlar

Hikaye için `chapters` kullanılır. Her chapter `number`, `title`, `summary` ve `body` alanlarına sahiptir.

Şiir için `poemLines` kullanılır. Boş dize bırakmak için diziye `""` eklenir.

Çeviri için `translationPairs` kullanılır. Her satırda `cue`, `original`, `translated` ve isteğe bağlı `note` alanları bulunur.

İnceleme ve bildiri için `sections` kullanılır. Bildiri dosyalarına ayrıca `abstract`, `keywords` ve `bibliography` eklenebilir.

## Yayına Alma

Bu site GitHub Pages, Netlify, Vercel veya herhangi bir statik hosting üzerinde doğrudan çalışır. Dosyaları aynı klasör yapısıyla yüklemek yeterlidir.
