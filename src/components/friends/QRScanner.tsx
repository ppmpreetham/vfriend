import { useState } from "react";
import {
  scan,
  Format,
  requestPermissions,
  checkPermissions,
} from "@tauri-apps/plugin-barcode-scanner";
import { validateAndAddFriend } from "../../store/newtimeTableStore";

const QRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startScan = async () => {
    try {
      setScanning(true);
      setError(null);

      // Check for camera permissions
      let permissionStatus = await checkPermissions();
      if (permissionStatus !== "granted") {
        permissionStatus = await requestPermissions();
        if (permissionStatus !== "granted") {
          throw new Error("Camera permission not granted");
        }
      }

      const scanResult = await scan({
        windowed: false,
        formats: [Format.QRCode],
      });

      if (scanResult) {
        setResult(scanResult.content);
        await validateAndAddFriend(scanResult.content);
        console.log("QR code scanned:", scanResult.content);
      } else {
        console.log("No QR code scanned");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to scan QR code");
      console.error("Scanning error:", err);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="p-4">
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {result && (
        <div className="mb-4 p-3 bg-gray-100 rounded">
          <p>
            <strong>Scanned QR Code</strong>
          </p>
        </div>
      )}

      <button
        className="px-4 py-2 bg-black text-white rounded"
        onClick={startScan}
        disabled={scanning}
      >
        {scanning ? "Scanning..." : "Scan QR Code"}
      </button>
    </div>
  );
};

export default QRScanner;
