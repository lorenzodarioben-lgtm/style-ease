import { spawn } from 'node:child_process';
import http from 'node:http';

const SERVER_URL = 'http://127.0.0.1:4173/style-ease/';

function waitForServer() {
  return new Promise(function (resolve, reject) {
    var deadline = Date.now() + 30_000;

    function check() {
      var request = http.get(SERVER_URL, function (response) {
        response.resume();
        resolve();
      });

      request.on('error', function () {
        if (Date.now() >= deadline) {
          reject(new Error('Vite preview server did not start in time.'));
          return;
        }

        setTimeout(check, 100);
      });
    }

    check();
  });
}

export default async function () {
  var server = spawn(
    process.execPath,
    ['./node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1'],
    { stdio: 'ignore', windowsHide: true }
  );

  try {
    await waitForServer();
  } catch (error) {
    server.kill();
    throw error;
  }

  return async function () {
    if (!server.killed) {
      server.kill();
      await new Promise(function (resolve) {
        server.once('exit', resolve);
      });
    }
  };
}
