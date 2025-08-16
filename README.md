# Laporan Surat Masuk/Keluar (Aman)

Versi ini sudah disesuaikan untuk keamanan:
- Firestore rules: user hanya bisa baca/tulis dokumen miliknya, admin (custom claim) bisa baca/tulis semua.
- Storage rules: file disimpan di path `surat/{uid}/{docId}/...` dan hanya dapat diakses pemilik atau admin.
- Cloud Functions: callable `setAdminByEmail` untuk memberi klaim admin.
- Perlu upgrade project ke Blaze (billing) untuk deploy Functions.

## Langkah cepat untuk deploy

1. Install Node & Firebase tools:
```bash
npm install
npm install -g firebase-tools
```

2. Konfigurasi Firebase (di Console):
- Buat project baru atau gunakan project yang ada.
- Aktifkan Authentication (Email/Password), Firestore, Storage.
- Upgrade billing ke Blaze (diperlukan untuk Functions produksi).

3. Isi konfigurasi Firebase di `src/firebase.js` (Project Settings → SDK setup):
```js
const firebaseConfig = { apiKey: '...', authDomain: '...', projectId: '...', storageBucket: '...', messagingSenderId: '...', appId: '...' }
```

4. Tambahkan SUPER ADMIN env untuk functions:
```bash
firebase functions:config:set roles.super_admin_email="super@contoh.go.id"
```

5. Deploy functions:
```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

6. Build & deploy hosting:
```bash
npm run build
firebase deploy --only hosting
```

7. Set admin awal:
- Login sebagai super admin dan gunakan tombol "Set Admin" di Admin dashboard untuk mengangkat akun admin kabupaten.
- Atau gunakan Firebase Admin SDK di server/console untuk setCustomUserClaims(uid,{admin:true}).

## Files penting
- `firestore.rules` (disediakan di project)
- `storage.rules` (disediakan di project)
- `functions/index.js` (Cloud Functions callable untuk set admin)

## Firestore Rules (contoh)
Simpan di Firebase Console -> Firestore -> Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /admins/{uid} {
      allow read, write: if request.auth != null && request.auth.token.admin == true;
    }
    match /surat/{docId} {
      allow read: if request.auth != null && (request.auth.token.admin == true || resource.data.createdBy == request.auth.uid);
      allow create: if request.auth != null && (request.resource.data.createdBy == request.auth.uid);
      allow update, delete: if request.auth != null && (request.auth.token.admin == true || resource.data.createdBy == request.auth.uid);
    }
  }
}
```

## Storage Rules (contoh) - simpan di Storage -> Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /surat/{ownerUid}/{allPaths=**} {
      allow read: if request.auth != null && (request.auth.token.admin == true || request.auth.uid == ownerUid);
      allow write: if request.auth != null && (request.auth.token.admin == true || request.auth.uid == ownerUid);
    }
  }
}
```
