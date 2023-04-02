const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const readline = require('readline');

const packageDefinition = protoLoader.loadSync('./protofile.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const crudProto = grpc.loadPackageDefinition(packageDefinition).crud;
const client = new crudProto.CrudService('localhost:50051', grpc.credentials.createInsecure());

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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

function mainMenu() {
  console.log(`\nPilih operasi yang ingin dilakukan:`);
  console.log(`1. Tambah data`);
  console.log(`2. Lihat data`);
  console.log(`3. Ubah data`);
  console.log(`4. Hapus data`);
  console.log(`5. Keluar`);

  rl.question('Masukkan pilihan Anda: ', (option) => {
    switch (option) {
      case '1':
        createData();
        break;
      case '2':
        readData();
        break;
      case '3':
        updateData();
        break;
      case '4':
        deleteData();
        break;
      case '5':
        console.log('Terima kasih telah menggunakan program ini.');
        rl.close();
        break;
      default:
        console.log('Pilihan tidak valid. Silakan pilih ulang.');
        mainMenu();
        break;
    }
  });
}

console.log(`Selamat datang di aplikasi CRUD Umat Gereja!`);
mainMenu();