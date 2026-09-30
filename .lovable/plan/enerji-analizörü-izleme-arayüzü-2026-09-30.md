# Enerji Analizörü İzleme Arayüzü

Endüstriyel SCADA görünümlü, animasyonlu bir web arayüzü. Sahadaki (şu an simülatörden gelen) 3 fazlı enerji analizörü verilerini REST API'den okur, sanal bir analizör cihazı gibi gösterir ve şalter ile reset modunu kontrol eder.

Python dosyalarınıza hiçbir değişiklik yapılmayacak.

## Ekranlar

**1. Ana panel (/)**
- Sanal analizör cihazı: koyu metal gövde, parlayan LCD ekran, faz LED'leri (L1/L2/L3), canlı akan rakamlar.
- Büyük fiziksel şalter (ON/OFF kolu): kapatıldığında API'ye reset isteği gider, DB'de `reset_mode` true olur ve tüm değerler 0'a iner. Kol animasyonlu hareket eder, ekran söner, uyarı lambası yanar.
- Faz kartları: L1/L2/L3 için gerilim, akım, aktif/reaktif güç, güç faktörü — animasyonlu ibre/bar göstergeleri.
- Toplam değerler: P/Q/S toplam, güç faktörü, frekans (50 Hz etrafında salınan gösterge), ithal aktif enerji ve endüktif reaktif enerji sayaçları (yuvarlanan rakam animasyonu).
- Canlı trend grafiği: son okumalardan gerilim / akım / güç eğrileri.
- Bağlantı durumu rozeti: API'ye bağlı / bağlantı yok, son güncelleme zamanı, veri yenileme sıklığı.

**2. Register haritası (/registers)**
- 44 register (30000–30043), float32 ABCD, 22 ölçüm satırı: adres, açıklama, birim, ham register çifti ve çözülmüş değer. Canlı güncellenir.

**3. Cihazlar (/devices)**
- API'den cihaz listesi (id, ad, host, port, unit id), kart görünümü, aktif cihaz seçimi.

**4. Ayarlar (/settings)**
- API adresi girişi (varsayılan `http://192.168.1.34:8000/api/v1`), yenileme aralığı, demo mod anahtarı. Tarayıcıda saklanır, sayfa yenilense de kalır.

## Bağımsız çalışma

API'ye ulaşılamazsa arayüz kendi içindeki simülasyon motoruyla (sizin `enerji_analizoru_sim.py` mantığının birebir aynısı: aynı gerilim/akım/pf yürüyüşleri, fazör hesabı, enerji sayaçları) veri üretip çalışmaya devam eder ve "DEMO" rozeti gösterir. Şalter demo modda da çalışır. Bağlantı gelince otomatik gerçek veriye döner.

## Teknik notlar

- Veri kaynağı: `GET /api/v1/modbus` (son 50 ölçüm, `measurements` alanı), `GET /api/v1/devices`, `PUT /api/v1/modbus/reset?value=true|false`.
- Yoklama tarayıcıdan doğrudan API'ye yapılır (CORS açık varsayımıyla); istek hatası veya CORS engeli demo moda düşürür ve kullanıcıya nedeni bildirilir.
- Register haritası ve çözümleme arayüzde sabit tablo olarak tutulur (BASE 30000, offset/anahtar/birim eşlemesi uploaded koddaki sırayla).
- Tasarım: koyu SCADA paleti (antrasit gövde, amber/yeşil gösterge, kırmızı alarm), monospace sayaç tipografisi, tüm renkler tasarım tokenlarıyla; animasyonlar (LED nabzı, ibre yumuşaması, şalter kolu, rakam geçişleri) Motion ile.
- Her sayfa kendi başlık/açıklama meta verisine sahip olur.
