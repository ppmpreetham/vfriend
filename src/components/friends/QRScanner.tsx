import { useState } from "react";
import { platform } from "@tauri-apps/plugin-os";
import { validateAndAddFriend } from "../../store/newtimeTableStore";
import useAddFriendStore from "../../store/useAddFriendStore";

const QRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addStatus, setAddStatus] = useState({ message: "", isError: false });
  const { setFriendAdded } = useAddFriendStore();

  const startScan = async () => {
    try {
      const currentPlatform = platform();
      if (currentPlatform !== "android" && currentPlatform !== "ios") {
        throw new Error("QR scanning is available on Android and iOS. Use the access code option on desktop.");
      }

      setScanning(true);
      setError(null);
      setAddStatus({ message: "", isError: false });

      const {
        scan,
        Format,
        requestPermissions,
        checkPermissions,
      } = await import("@tauri-apps/plugin-barcode-scanner");

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
        const addResult = await validateAndAddFriend(scanResult.content);

        if (addResult.success) {
          setAddStatus({
            message: "Friend added successfully!",
            isError: false,
          });
          setFriendAdded(true);
        } else {
          setAddStatus({
            message:
              addResult.error &&
              typeof addResult.error === "object" &&
              "message" in addResult.error
                ? `Failed: ${String(addResult.error.message)}`
                : "Failed to add friend",
            isError: true,
          });
        }
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

      {addStatus.message && (
        <div
          className={`mb-4 p-3 ${
            addStatus.isError
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          } rounded`}
        >
          {addStatus.message}
        </div>
      )}

      {result && !addStatus.isError && (
        <div className="mb-4 p-3 bg-gray-100 rounded">
          <p>
            <strong>Scanned QR Code successfully</strong>
          </p>
        </div>
      )}

      <button
        className="px-4 py-2 bg-black text-foreground rounded"
        onClick={startScan}
        disabled={scanning}
      >
        {scanning ? "Scanning..." : "Scan QR Code"}
      </button>
    </div>
  );
};

export default QRScanner;