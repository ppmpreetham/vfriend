import React, { useState, useEffect } from "react";
import QRCode from "qrcode";

interface QRCodeGeneratorProps {
  url?: string;
  size?: number;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  url: initialUrl = "",
  size = 256,
  errorCorrectionLevel = "M",
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [qrCodeImage, setQrCodeImage] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>("");

  const generateQRCode = async (inputUrl: string) => {
    if (!inputUrl.trim()) {
      setQrCodeImage("");
      setError("");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const qrCodeDataUrl = await QRCode.toDataURL(inputUrl, {
        width: size,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel,
      });
      setQrCodeImage(qrCodeDataUrl);
    } catch (err) {
      setError("Failed to generate QR code. Please check your URL.");
      setQrCodeImage("");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    generateQRCode(url);
  }, [url, size, errorCorrectionLevel]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  return (
    <div className="qr-code-generator p-4 max-w-md mx-auto">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {isGenerating && (
        <div className="mb-4 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Generating QR code...</p>
        </div>
      )}

      {qrCodeImage && !isGenerating && (
        <div className="mb-4">
          <img
            src={qrCodeImage}
            alt="Generated QR Code"
            className="mx-auto border rounded-lg shadow-lg w-[95vw]"
          />
        </div>
      )}
    </div>
  );
};

export default QRCodeGenerator;
