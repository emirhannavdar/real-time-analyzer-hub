# Energy Analyzer Live

bir rest api geliştirdim bu api sahadaki gerçek cihazlardan gelen veriyi çekiyor db ye yazıyor. şuanda simulatörden test ediyoruz (enerji_analizoru_sim.py) ben buna arayüz istiyorum. bu arayüzde simulasyon şeklinde gerçek bir analizor olabilir. ayrıca animasyonlu güzel bir site olsun. bu site olabildiğince bağımsız çalışmalı. api'den verileri çekebilir. analizor üstünde veriler dinamik olması gerekiyorsa eğer simulatörden tcp ile çekebilirsin ama direk sana attığım dosyaların üstünde hiç bir değişiklik yapma. registerlar 44 tane var float32 başlangıç adresleri 30000. bu bilgiiler sana eklediğim kodlarda da var incele ve güzel bir site çıkart. bu apide reset özzelliği var bu özellik aktif olunca (apiden istek gelince) true false olarak db de değişiyor buna göre analizor sim den değerler hep 0 olarak geliyor bunu da şalter olarak düşün ve arayüzde dinamik bir şalter yap şalter kapandığında db de resset_mode true olmalı yani değerler 0 gelmeli.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/19f2c846-0435-456e-aeb9-22235a3562c8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
