CREATE TABLE IF NOT EXISTS yoneticiler (
    id SERIAL PRIMARY KEY,
    eposta VARCHAR(255) NOT NULL UNIQUE,
    sifre VARCHAR(255) NOT NULL,
    olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guncelleme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS uyeler (
    id SERIAL PRIMARY KEY,
    ad VARCHAR(255) NOT NULL,
    eposta VARCHAR(255) NOT NULL,
    telefon VARCHAR(255) NOT NULL,
    sifre VARCHAR(255) NOT NULL,
    uyelik_bitis_tarihi DATE NOT NULL,
    olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mevcut tablolara şifre kolonu ekle (eğer yoksa)
ALTER TABLE uyeler 
ADD COLUMN IF NOT EXISTS sifre VARCHAR(255) NOT NULL DEFAULT '123456';

CREATE TABLE IF NOT EXISTS stok_urunleri (
    id SERIAL PRIMARY KEY,
    ad VARCHAR(255) NOT NULL,
    miktar INTEGER NOT NULL DEFAULT 0,
    min_miktar INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS calisanlar (
    id SERIAL PRIMARY KEY,
    ad VARCHAR(255) NOT NULL,
    pozisyon VARCHAR(255) NOT NULL,
    telefon VARCHAR(255) NOT NULL,
    maas INTEGER NOT NULL DEFAULT 0,
    aktif BOOLEAN NOT NULL DEFAULT true,
    ise_baslama_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ekipmanlar (
    id SERIAL PRIMARY KEY,
    ad VARCHAR(255) NOT NULL,
    tip VARCHAR(255) NOT NULL,
    son_bakim_tarihi DATE NOT NULL,
    sonraki_bakim_tarihi DATE NOT NULL,
    durum VARCHAR(255) NOT NULL DEFAULT 'Aktif'
);

-- Insert default admin only if it doesn't exist
INSERT INTO
    yoneticiler (eposta, sifre)
SELECT 'admin@admin.com', '123456'
WHERE
    NOT EXISTS (
        SELECT 1
        FROM yoneticiler
        WHERE
            eposta = 'admin@admin.com'
    );

-- Insert default stock items only if they don't exist
INSERT INTO
    stok_urunleri (ad, miktar, min_miktar)
SELECT 'Protein Tozu', 10, 3
WHERE
    NOT EXISTS (
        SELECT 1
        FROM stok_urunleri
        WHERE
            ad = 'Protein Tozu'
    );

INSERT INTO
    stok_urunleri (ad, miktar, min_miktar)
SELECT 'Kreatin', 8, 2
WHERE
    NOT EXISTS (
        SELECT 1
        FROM stok_urunleri
        WHERE
            ad = 'Kreatin'
    );

INSERT INTO
    stok_urunleri (ad, miktar, min_miktar)
SELECT 'BCAA', 5, 2
WHERE
    NOT EXISTS (
        SELECT 1
        FROM stok_urunleri
        WHERE
            ad = 'BCAA'
    );