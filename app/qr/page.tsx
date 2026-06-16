export default function QRPage() {
  return (
    <main className="p-10">
      <h1 className="text-4xl font-bold mb-8">
        Table QR Links
      </h1>

      <div className="space-y-4">
        <a
          href="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=http://localhost:3000/?table=1"
          target="_blank"
        >
          Table 1 QR
        </a>

        <br />

        <a
          href="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=http://localhost:3000/?table=2"
          target="_blank"
        >
          Table 2 QR
        </a>

        <br />

        <a
          href="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=http://localhost:3000/?table=3"
          target="_blank"
        >
          Table 3 QR
        </a>
      </div>
    </main>
  );
}