const imap = require("imap-simple");
async function run() {
  const config = {
    imap: {
      user: "marketing@ovc.vn",
      password: "cNrDINhmGE2fNfnN",
      host: "smtp.larksuite.com",
      port: 993,
      tls: true,
      authTimeout: 10000,
      tlsOptions: { rejectUnauthorized: false }
    }
  };
  try {
    const connection = await imap.connect(config);
    const boxes = await connection.getBoxes();
    for (const [key, value] of Object.entries(boxes)) {
        console.log(`Box: ${key}`, value.attribs);
    }
    connection.end();
  } catch(e) {
    console.error(e);
  }
}
run();
