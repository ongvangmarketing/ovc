function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function textLine(value: string, x: number, y: number, size = 11) {
  return `BT /F1 ${size} Tf ${x} ${y} Td (${escapePdfText(value)}) Tj ET`;
}

export function createSignatureTestPdf() {
  const lines = [
    textLine("ONG VANG CLOUD", 72, 760, 11),
    textLine("DIGITAL OFFICE", 72, 735, 22),
    textLine("VAN BAN THU NGHIEM KY SO", 72, 705, 16),
    textLine("Document code: OVC-DO-SIGN-TEST-001", 72, 660),
    textLine("Document type: Digital signature test confirmation", 72, 640),
    textLine("Created by: Digital Office module", 72, 620),
    textLine("Purpose: Generate a stable PDF input for MISA eSign sandbox flow.", 72, 600),
    textLine("Signing flow:", 72, 560, 13),
    textLine("1. Convert this PDF to base64 on the server.", 96, 535),
    textLine("2. Create document hash with certificate and certificate chain.", 96, 515),
    textLine("3. Send digest to remote signing provider.", 96, 495),
    textLine("4. Poll transaction status or receive webhook.", 96, 475),
    textLine("5. Attach signature to this PDF and store signed version.", 96, 455),
    textLine("Signature placeholder", 72, 360, 13),
    "0.8 w 72 300 220 70 re S",
    textLine("Signer:", 90, 335),
    textLine("Signed at:", 90, 315),
    textLine("This PDF is generated for integration testing only.", 72, 110, 9),
  ];
  const stream = lines.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let index = 1; index < offsets.length; index++) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, "utf8");
}
