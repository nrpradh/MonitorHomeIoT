# Monitor Home - IoT 

## a. Judul dan ringkasan cara kerja Sistem
Lorem ipsum
## b. Hardware dan software/tools yang digunakan
Lorem ipsum
## c. Gambar rangkaian (wiring diagram)
Lorem ipsum
## d. Gambar arsitektur aplikasi dan jaringan komputer  

### Struktur Frontend (Astro + React)

Catatan:
File dan folder yang tidak ditampilkan di bawah **tidak digunakan** dalam pembahasan proyek ini.

Struktur frontend untuk proyek Home Monitor adalah sebagai berikut:

```text
├── client/
│   ├── public/
│   │   └── img/
│   │
│   ├── src/
│   │   ├── mqtt/
│   │   │   └── mqttClient.js
│   │   ├── pages/
│   │   │   └── landing/
│   │   │       └── rooms/
│   │   │           ├── Backyard.jsx
│   │   │           ├── Bedrooms.jsx
│   │   │           └── Kitchen.jsx
│   │   └── App.jsx
│   │
│   ├── package.json
│   └── astro.config.mjs


```

### Struktur Kode Perangkat (.ino)

Struktur kode perangkat IoT untuk proyek Home Monitor adalah sebagai berikut:

```text
├── devices/
│   ├── bedrooms/
│   │   ├── bedroom_one.ino
│   │   ├── bedroom_two.ino
│   │   └── bedroom_three.ino
│   │
│   ├── kitchen/
│   │   ├── fridge.ino
│   │   └── stove.ino
│   │
│   ├── backyard/
│   │   ├── washing_machine.ino
│   │   └── water_pump.ino
│   │
```

## e. Topik & Payload MQTT

Pada proyek **Home Monitor**, komunikasi antara perangkat IoT dan dashboard dilakukan menggunakan protokol **MQTT**.
Setiap ruangan dan perangkat memiliki topik MQTT masing-masing untuk proses **publish** dan **subscribe** data.

Sistem ini terbagi menjadi **3 area utama**, yaitu:
- Bedrooms
- Kitchen
- Backyard

Setiap topik menggunakan payload boolean berupa `ON` dan `OFF` untuk merepresentasikan kondisi perangkat dan status okupansi tiap ruangan.

---

<details>
<summary><strong>🏠 Bedrooms</strong></summary>

Area Bedrooms terdiri dari **3 kamar tidur**: `one`, `two`, dan `three`.
Setiap kamar memiliki satu lampu dan satu status okupansi.

### Lampu Kamar Tidur
| Topic | Payload | Keterangan |
|------|--------|------------|
| `home/bedrooms/{room}/lamp/status` | `ON` / `OFF` | Status lampu kamar |
| `home/bedrooms/{room}/lamp/set` | `ON` / `OFF` | Perintah menyalakan atau mematikan lampu |
| `home/bedrooms/{room}/occupancy` | `ON` / `OFF` | Status okupansi kamar |

Keterangan:
- `{room}` = `one` | `two` | `three`

</details>

---

<details>
<summary><strong>🍳 Kitchen</strong></summary>

Area Kitchen memiliki **2 perangkat**, yaitu kulkas (Fridge) dan kompor (Stove).
Masing-masing perangkat memiliki topik untuk status, perintah, dan okupansi.

### Fridge (Kulkas)
| Topic | Payload | Keterangan |
|------|--------|------------|
| `home/kitchen/fridge/status` | `ON` / `OFF` | Status kulkas |
| `home/kitchen/fridge/set` | `ON` / `OFF` | Perintah menyalakan atau mematikan kulkas |
| `home/kitchen/fridge/occupancy` | `ON` / `OFF` | Status penggunaan kulkas |

### Stove (Kompor)
| Topic | Payload | Keterangan |
|------|--------|------------|
| `home/kitchen/stove/status` | `ON` / `OFF` | Status kompor |
| `home/kitchen/stove/set` | `ON` / `OFF` | Perintah menyalakan atau mematikan kompor |
| `home/kitchen/stove/occupancy` | `ON` / `OFF` | Status penggunaan kompor |

</details>

---

<details>
<summary><strong>🌿 Backyard</strong></summary>

Area Backyard terdiri dari **2 perangkat** dan **1 status okupansi area**.
Perangkat yang digunakan adalah mesin cuci dan pompa air.

### Washing Machine (Mesin Cuci)
| Topic | Payload | Keterangan |
|------|--------|------------|
| `home/backyard/wm/status` | `ON` / `OFF` | Status mesin cuci |
| `home/backyard/wm/set` | `ON` / `OFF` | Perintah menyalakan atau mematikan mesin cuci |
| `home/backyard/wm/occupancy` | `ON` / `OFF` | Status penggunaan mesin cuci |

### Water Pump (Pompa Air)
| Topic | Payload | Keterangan |
|------|--------|------------|
| `home/backyard/pump/status` | `ON` / `OFF` | Status pompa air |
| `home/backyard/pump/set` | `ON` / `OFF` | Perintah menyalakan atau mematikan pompa air |
| `home/backyard/pump/occupancy` | `ON` / `OFF` | Status penggunaan pompa air |

### Backyard Area
| Topic | Payload | Keterangan |
|------|--------|------------|
| `home/backyard/occupancy` | `ON` / `OFF` | Status okupansi area backyard |

</details>


## f. Cara Instalasi

### 1. Instalasi MQTT Broker (Mosquitto)
Unduh dan instal Mosquitto dari situs resmi:  https://mosquitto.org/download/

Jalankan broker untuk memastikan Mosquitto berjalan:
```sh
mosquitto -v
```

### 2. Setup Arduino IDE
Unduh dan instal Arduino IDE: 
https://www.arduino.cc/en/software

Buka file .ino yang sesuai dengan perangkat, lalu sesuaikan konfigurasi WiFi dan alamat MQTT Broker.
Upload kode ke perangkat IoT menggunakan Arduino IDE.

### 3. Git Clone Repository 
```sh
git clone <URL_REPOSITORY>
```
### 4. Frontend Dependencies
Masuk ke direktori frontend, lalu install dependensi:
```sh
cd client
npm install
```
Jalankan frontend dashboard:
```sh
npm run dev
```


## g. Cara pengoperasian dan pengujian
### 1. Jalankan beberapa commans di vscode untuk bagian frontend:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Menginstal dependencies                            |
| `npm run dev`             | Menyalakan dashboard frontend      |

### 2. Nyalakan server mqtt di cmd dengan command:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `cd "C:\Program Files\mosquitto`             | path di mana Anda menginstal mosquitto                            |
| `mosquitto -v`             | Menyalakan server mqtt      |

### 3. Jika server sudah menyala, maka gunakan broker URL yang sesuai dan hubungkan via dashboard

| Command | Action |
| :------------------------ | :----------------------------------------------- |
| `ipconfig` | Jalankan di CMD untuk mengetahui IPv4 Address komputer yang digunakan |
| `ws://192.168.6.50:9001` | Broker URL (contoh) |

Keterangan:
- `192.168.6.50` adalah IPv4 Address komputer yang menjalankan MQTT Broker.
  IPv4 Address dapat berbeda pada setiap pengguna, sesuaikan dengan hasil `ipconfig`.
- `9001` adalah port WebSocket MQTT Broker dan dapat berbeda tergantung konfigurasi broker.
- Format umum Broker URL:
  ws://<IPv4_ADDRESS>:<PORT>

### 4. Pengujian Pengiriman Data MQTT

Jika perangkat IoT sudah tersedia, pengujian dapat dilakukan langsung melalui perangkat.
Jika perangkat **belum dibuat**, pengujian dapat dilakukan menggunakan **CMD** dengan Mosquitto sebagai berikut;

| Command | Action |
| :------------------------ | :----------------------------------------------- |
| `cd "C:\Program Files\mosquitto"` | Masuk ke direktori instalasi Mosquitto |
| `mosquitto -v` | Menjalankan MQTT Broker |

Setelah broker berjalan, lakukan pengujian sebagai berikut.

Subscribe (mendengarkan semua topik):
```sh
mosquitto_sub -h <IPV4_ADDRESS> -p <PORT> -t "home/#" -v
```

Publish (mengirim data ke topik):
```sh
mosquitto_pub -h <IPV4_ADDRESS> -p <PORT> -t "<TOPIC>" -m "<PAYLOAD>"
```

Contoh pengujian:

Menyalakan status mesin cuci:
```mosquitto_pub -h 192.168.10.28 -p 1884 -t "home/backyard/wm/status" -m "ON"```

Mensimulasikan penggunaan mesin cuci:
```mosquitto_pub -h 192.168.10.28 -p 1884 -t "home/backyard/wm/occupancy" -m "ON"```



### i. Foto Perangkat
### ii. Tangkapan layar dashhboard



## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
