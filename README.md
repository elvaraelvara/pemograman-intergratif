# pemograman-intergratif
Pemograman Integratif B

# Project Data Umat Gereja
Maria Teresia Elvara B
5027211042

 __A. Init Project__

1. ``` npm init -y ```

Digunakan untuk membuat file package.json dengan nilai default. Dalam konteks mengimplementasikan gRPC API dan protobuf, file package.json digunakan untuk mengelola dependensi dan skrip yang dibutuhkan dalam pengembangan aplikasi. 

2. ``` npm install grpc grpc-tools protobufjs @grpc/proto-loader pg ```


grpc dan grpc-tools mengimplementasikan protokol gRPC.protobufjs berkomunikasi dengan API.@grpc/proto-loader memuat definisi protobuf menggunakan require di Node.js. pg adalah driver Node.js untuk mengakses database PostgreSQL yang digunakan sebagai penyimpanan data untuk API. 

__B. Add CRUD Functions__

1. protofile.proto
``` 
service CrudService {
rpc CreateUmatGereja(UmatGereja) returns (UmatGereja) {}
rpc ReadUmatGereja(UmatGereja) returns (UmatGereja) {}
rpc UpdateUmatGereja(UmatGereja) returns (UmatGereja) {}
rpc DeleteUmatGereja(UmatGereja) returns (UmatGereja) {}
}
```

2. server.js
```
function createUmatGereja(call, callback) {
  const { nama, alamat, romo, no_telepon } = call.request;
  db.run(`INSERT INTO umat_gereja (nama, alamat, romo, no_telepon) VALUES (?, ?, ?, ?)`, [nama, alamat, romo, no_telepon], function(err) {
    if (err) {
      return callback(err);
    }
    const id = this.lastID;
    callback(null, { id, nama, alamat, romo, no_telepon });
  });
}

function readUmatGereja(call, callback) {
  const { id } = call.request;
  db.get(`SELECT * FROM umat_gereja WHERE id = ?`, [id], (err, row) => {
    if (err || !row) {
      return callback(err || new Error('Data not found'));
    }
    const { id: umat_gereja_id, nama, alamat, romo, no_telepon } = row;
    callback(null, { id: umat_gereja_id, nama, alamat, romo, no_telepon });
  });
}

function updateUmatGereja(call, callback) {
  const { id, nama, alamat, romo, no_telepon } = call.request;
  db.run(`UPDATE umat_gereja SET nama = ?, alamat = ?, romo = ?, no_telepon = ? WHERE id = ?`, [nama, alamat, romo, no_telepon, id], (err) => {
    if (err) {
      return callback(err);
    }
    callback(null, { id, nama, alamat, romo, no_telepon });
  });
}

function deleteUmatGereja(call, callback) {
  const { id } = call.request;
  db.run(`DELETE FROM umat_gereja WHERE id = ?`, [id], (err) => {
    if (err) {
      return callback(err);
    }
    callback(null, { id });
  });
}
```

3. client.js
```


function printData(data) {
  console.log(`ID: ${data.id}`);
  console.log(`Nama: ${data.nama}`);
  console.log(`Alamat: ${data.alamat}`);
  console.log(`Romo: ${data.romo}`);
  console.log(`No Telepon: ${data.no_telepon}\n`);
}

function createData() {
  rl.question('Masukkan Nama: ', (nama) => {
    rl.question('Masukkan Alamat: ', (alamat) => {
      console.log('Romo yang tersedia: Matius, Markus, Lukas, Yohanes, Petrus');
      rl.question('Pilih Nama Romo: ', (romo) => {
        const romoList = ['Matius', 'Markus', 'Lukas', 'Yohanes', 'Petrus'];
        if (!romoList.includes(romo)) {
          console.log('Romo yang Anda masukkan tidak valid. Silakan ulangi.');
          createData();
          return;
        }
        rl.question('Masukkan No Telepon (minimal 8 digit): ', (no_telepon) => {
          if (!/^\d{8,}$/.test(no_telepon)) {
            console.log('No telepon harus berupa angka minimal 8 digit. Silakan ulangi.');
            createData();
            return;
          }
          client.createUmatGereja({ nama, alamat, romo, no_telepon }, (err, data) => {
            if (err) {
              console.error(err);
              return;
            }
            console.log(`Data berhasil ditambahkan:\n`);
            printData(data);
            mainMenu();
          });
        });
      });
    });
  });
}

function readData() {
  rl.question('Masukkan ID data yang akan ditampilkan: ', (id) => {
    client.readUmatGereja({ id }, (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(`Data yang Anda cari adalah:\n`);
      printData(data);
      mainMenu();
    });
  });
}

function updateData() {
  rl.question('Masukkan ID umat gereja yang ingin diubah: ', (id) => {
    client.readUmatGereja({ id }, (err, data) => {
      if (err) {
        console.error(err);
        mainMenu();
        return;
      }
      if (!data.id) {
        console.log('ID umat gereja tidak ditemukan. Silakan ulangi.');
        updateData();
        return;
      }
      console.log('Data umat gereja yang akan diubah:');
      printData(data);
      rl.question('Masukkan Nama Baru: ', (nama) => {
       rl.question('Masukkan Alamat Baru: ', (alamat) => {
        rl.question('Masukkan Nama Romo Baru: ', (romo) => {
          const romoList = ['Matius', 'Markus', 'Lukas', 'Yohanes', 'Petrus'];
          if (!romoList.includes(romo)) {
            console.log('Romo yang Anda masukkan tidak valid. Silakan ulangi.');
            updateData();
            return;
          }
          rl.question('Masukkan No Telepon Baru (minimal 8 digit): ', (no_telepon) => {
            if (!/^\d{8,}$/.test(no_telepon)) {
              console.log('No telepon harus berupa angka minimal 8 digit. Silakan ulangi.');
              updateData();
              return;
            }
            client.updateUmatGereja({ nama, alamat, romo, no_telepon, id }, (err, data) => {
              if (err) {
                console.error(err);
                return;
              }
              console.log(`Data berhasil diperbarui:\n`);
              printData(data);
              mainMenu();
            });
          });
        });
      });
    });
  });
});
}

function deleteData() {
  rl.question('Masukkan ID data yang akan dihapus: ', (id) => {
    client.deleteUmatGereja({ id }, (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(`Data berhasil dihapus dengan ID: ${id}\n`);
      mainMenu();
    });
  });
}


```

__C. Testing Output__

Pada terminal tuliskan
``` node server.js ```

Lalu buka terminal lain tanpa menutup terminal sebelumnya dengan menuliskan
``` node client.js ```

Setelah mengeclick akan muncul pilihan untuk create, read, update, dan delete


![Teks alternatif](https://github.com/elvaraelvara/pemograman-intergratif/blob/main/image/Output%201.jpeg?raw=true)


Untuk create data, tekan 1 dan masukkan data berupa nama, alamat, nama romo, dan nomor telepon sesuai dengan yang diinginkan. Lalu akan keluar output data yang disimpan 

![Teks alternatif](https://github.com/elvaraelvara/pemograman-intergratif/blob/main/image/Output%202.jpeg?raw=true)

Data akan tersimpan di file data.db 

![Teks alternatif](https://github.com/elvaraelvara/pemograman-intergratif/blob/main/image/Output%203.jpeg?raw=true)

![Teks alternatif](https://github.com/elvaraelvara/pemograman-intergratif/blob/main/image/Output%204.jpeg?raw=true)


Untuk read data, tekan 2 dan masukkan ID data yang ingin dilihat maka akan keluar output nya

![Teks alternatif](https://github.com/elvaraelvara/pemograman-intergratif/blob/main/image/Output%205.jpeg?raw=true)


Untuk update data, tekan 3 lalu akan keluar data sebelumnya yang ingin diubah dan masukkan inputan data yang diubah, maka setelah memasukkan input akan mengeluarkan output data yang berubah

![Teks alternatif](https://github.com/elvaraelvara/pemograman-intergratif/blob/main/image/Output%206.jpeg?raw=true)

Untuk delete data, tekan 4 dan input ID data yang ingin dihapus maka data tersebut akan terhapus

![Teks alternatif](https://github.com/elvaraelvara/pemograman-intergratif/blob/main/image/Output%207.jpeg?raw=true)




