# Spor Salonu Takip Sistemi

Bu proje, **spor salonu sahiplerinin salon yönetim süreçlerini dijital ortamda yönetebilmesi** amacıyla geliştirilmiş, **sanallaştırma teknolojileri** kullanan web tabanlı bir yönetim sistemidir.

Uygulama sayesinde salon yöneticileri; üye takibi, QR kod ile giriş kontrolü, stok ve ekipman yönetimi ile çalışan takibini tek bir platform üzerinden gerçekleştirebilmektedir.

---

##  Proje Özellikleri

-  **Üye Yönetimi**
-  **QR Kod ile Giriş–Çıkış Sistemi**
-  **Stok ve Ekipman Takibi**
-  **Çalışan Yönetimi**
-  **Bulut Tabanlı Mimari**
-  **Docker ile Konteyner Yapısı**

---

##  Kullanılan Teknolojiler

- **Frontend:** React (Vite)
- **Backend:** Node.js (Express)
- **Veritabanı:** PostgreSQL
- **Konteyner:** Docker & Docker Compose
- **Bulut Platformu:** Google Cloud (VM)

---

## Sistem Mimarisi

Proje, katmanlı mimari yaklaşımıyla geliştirilmiştir:

1. **Client Layer:** Web tabanlı kullanıcı arayüzü  
2. **API Layer:** Backend servisleri  
3. **Database Layer:** PostgreSQL veritabanı  
4. **Sanallaştırma Katmanı:** Docker & Google Cloud VM  

Tüm servisler Docker konteynerleri içerisinde izole şekilde çalışmaktadır.

---



## ⚙️ Kurulum ve Çalıştırma

```bash
docker compose up --build -d
