import { google } from "googleapis";
import { Readable } from "stream";

const SCOPE = ["https://www.googleapis.com/auth/drive"];

const randomString = (length) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export async function authorize() {
  const jwtClient = new google.auth.JWT(
    process.env.CLIENT_EMAIL,
    null,
    process.env.PRIVATE_KEY,
    SCOPE
  );
  await jwtClient.authorize();
  return jwtClient;
}

export function uploadFile(authClient, pdf) {
  return new Promise(async (resolve, rejected) => {
    const drive = google.drive({ version: "v3", auth: authClient });
    var fileMetaData = {
      name: `certificate-${randomString(5)}.pdf`, // A folder ID to which file will get uploaded
      parents: ["1xKtFwxaPNNb0JzxZAOnZm52b2FYFyvp6"],
    };

    const uint8Array = new Uint8Array(pdf.buffer);
    const pdfStream = new Readable();
    pdfStream.push(uint8Array);
    pdfStream.push(null);

    drive.files.create(
      {
        resource: fileMetaData,
        media: {
          body: pdfStream, // files that will get uploaded
          mimeType: "application/pdf",
        },
        fields: "id",
      },
      function (error, file) {
        if (error) {
          return rejected(error);
        }
        resolve(file);
      }
    );
  });
}
