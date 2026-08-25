# Panduan Deployment Sakapinta ke Google Cloud VM (COMPFEST 18)

Panduan ini disusun khusus untuk deployment sistem **Sakapinta** pada **Google Cloud Compute Engine VM** menggunakan **Nginx Reverse Proxy** di Port 80 (HTTP) dan **tmux** untuk menjaga proses tetap hidup (*daemonized*).

---

## 1. Arsitektur Deployment di VM

Karena port eksternal yang dibuka firewall adalah **Port 80 (HTTP)**, maka **Nginx** bertindak sebagai gerbang utama (*reverse proxy*) yang mendistribusikan traffic ke service internal:

```text
               INTERNET / JURI LOMBA
                         │
                         │ Port 80 (HTTP)
                         ▼
                  ┌─────────────┐
                  │    NGINX    │
                  │   Port 80   │
                  └──────┬──────┘
                         │
                ┌────────┴────────┐
                ▼                 ▼
         Next.js Frontend   FastAPI Backend
          Port 3000 (Local)  Port 8000 (Local)
                │                 │
                └────────┬────────┘
                         │
                  Proyek Sakapinta
```

---

## 2. Langkah-Langkah Deployment di VM

### Langkah 1: Masuk ke VM via Google Cloud Shell
Buka Cloud Shell di [Google Cloud Console](https://console.cloud.google.com) dan jalankan:

```bash
gcloud compute ssh normal-2 --zone=us-central1-a --project=kemenkop-comfest-18
```
*(Jika diminta passphrase SSH, tekan **Enter** saja).*

---

### Langkah 2: Update Sistem & Install Paket Dependensi

```bash
sudo apt-get update && sudo apt-get install -y python3-pip python3-venv tmux git nginx curl
```

Install Node.js 20 LTS untuk frontend Next.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Verifikasi versi:
```bash
node -v   # v20.x.x
npm -v    # 10.x.x
python3 --version
```

---

### Langkah 3: Clone Repositori Sakapinta

```bash
cd ~
git clone https://github.com/HusniAbdillah/Sakapinta.git
cd Sakapinta
```

---

### Langkah 4: Setup & Jalankan Backend FastAPI (di Sesi tmux `backend`)

1. Masuk ke folder backend dan buat Virtual Environment:
```bash
cd ~/Sakapinta/backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

2. Jalankan Backend di dalam sesi `tmux`:
```bash
tmux new -s backend
```

3. Di dalam sesi tmux, jalankan uvicorn:
```bash
cd ~/Sakapinta/backend
source .venv/bin/activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

4. Tekan kombinasi tombol:
   **`Ctrl + B`**, lalu lepaskan dan tekan **`D`** (untuk detach/keluar dari tmux tanpa mematikan backend).

5. Uji backend dari terminal VM:
```bash
curl http://127.0.0.1:8000/api/health
```
*(Harus menghasilkan respons `{"status":"healthy", ...}`)*

---

### Langkah 5: Setup & Jalankan Frontend Next.js (di Sesi tmux `frontend`)

1. Masuk ke folder frontend dan install dependensi:
```bash
cd ~/Sakapinta/frontend
npm install
npm run build
```

2. Jalankan Frontend di dalam sesi `tmux`:
```bash
tmux new -s frontend
```

3. Di dalam sesi tmux, jalankan:
```bash
cd ~/Sakapinta/frontend
npm start -- -p 3000 -H 0.0.0.0
```

4. Tekan kombinasi tombol:
   **`Ctrl + B`**, lalu lepaskan dan tekan **`D`** (detach dari tmux).

5. Cek kedua sesi tmux yang aktif:
```bash
tmux ls
```
*(Akan terlihat sesi `backend` dan `frontend` keduanya aktif).*

---

### Langkah 6: Konfigurasi Nginx Reverse Proxy (Port 80)

1. Buat file konfigurasi Nginx baru:
```bash
sudo nano /etc/nginx/sites-available/sakapinta
```

2. Tempel (*paste*) konfigurasi berikut:
```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    # Proxy API requests ke FastAPI Backend
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proxy Web UI requests ke Next.js Frontend
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```
*(Tekan **`Ctrl + O`**, lalu **`Enter`** untuk menyimpan, kemudian **`Ctrl + X`** untuk keluar).*

3. Aktifkan konfigurasi dan restart Nginx:
```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/sakapinta /etc/nginx/sites-enabled/sakapinta
sudo nginx -t
sudo systemctl restart nginx
```

---

## 3. Hasil Akhir & Pengujian

Buka browser Anda di:
- **Aplikasi Web**: `http://34.44.169.181` *(atau IP VM aktif Anda)*
- **API Health Endpoint**: `http://34.44.169.181/api/health`

Aplikasi Sakapinta sekarang dapat diakses secara publik oleh dewan juri melalui Port 80 standar!
