const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const sqlite3 = require('sqlite3').verbose();

const packageDefinition = protoLoader.loadSync('./protofile.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

const crudProto = grpc.loadPackageDefinition(packageDefinition).crud;
const server = new grpc.Server();
const db = new sqlite3.Database('./data.db');

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS umat_gereja (id INTEGER PRIMARY KEY,nama TEXT NOT NULL,alamat TEXT NOT NULL,romo INTEGER NOT NULL, no_telepon INTEGER NOT NULL)");

  server.addService(crudProto.CrudService.service, {
    createUmatGereja: createUmatGereja,
    readUmatGereja: readUmatGereja,
    updateUmatGereja: updateUmatGereja,
    deleteUmatGereja: deleteUmatGereja
  });

  server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
  server.start();
});

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
