import { useEffect, useRef, useState } from "react";
import { X, Zap, AlertCircle } from "lucide-react";
import { scannerService, scanValidation, ScanResult } from "@/lib/scannerService";

interface Props {
  itemName: string;
  itemSKU: string;
  onSuccess: (scanResult: ScanResult) => void;
  onCancel: () => void;
}

export const Scanner = ({ itemName, itemSKU, onSuccess, onCancel }: Props) => {
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const stopScanRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let isMounted = true;

    const setupCamera = async () => {
      try {
        if (isMounted) {
          // Start scanning
          const stop = scannerService.startScanning(
            null as any, // Video element is managed by Html5Qrcode internally now
            (result) => {
              // Check if scanned code matches expected SKU
              if (scanValidation.matchesSKU(result.text, itemSKU)) {
                setScanResult(result);
                setScanned(true);
                if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

                // Stop scanning and call success after animation
                if (stopScanRef.current) stopScanRef.current();
                setTimeout(() => {
                  onSuccess(result);
                }, 1200);
              }
            },
            150
          );
          stopScanRef.current = stop;
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Scanner initialization failed");
        }
      }
    };

    setupCamera();

    return () => {
      isMounted = false;
      if (stopScanRef.current) {
        stopScanRef.current();
      }
    };
  }, [itemSKU, onSuccess]);

  const handleCancel = () => {
    if (stopScanRef.current) {
      stopScanRef.current();
    }
    onCancel();
  };

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 flex flex-col p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Scanning Error</div>
            <div className="font-semibold text-foreground">{itemName}</div>
          </div>
          <button onClick={handleCancel} className="touch-target size-12 rounded-md bg-card industrial-border flex items-center justify-center">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="size-12 text-destructive mx-auto mb-4" />
            <p className="font-mono text-sm text-destructive mb-4">{error}</p>
            <p className="text-muted-foreground text-xs mb-6">Please check camera permissions</p>
            <button
              onClick={handleCancel}
              className="touch-target px-6 py-3 bg-primary text-primary-foreground rounded-md font-mono font-bold uppercase text-xs tracking-wider active:scale-95"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-fade-in"
      style={{
        paddingTop: "max(0px, env(safe-area-inset-top))",
        paddingBottom: "max(0px, env(safe-area-inset-bottom))",
        paddingLeft: "max(0px, env(safe-area-inset-left))",
        paddingRight: "max(0px, env(safe-area-inset-right))",
      }}
    >
      <div className="flex items-center justify-between p-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Scanning</div>
          <div className="font-semibold text-foreground">{itemName}</div>
        </div>
        <button onClick={handleCancel} className="touch-target size-12 rounded-md bg-card industrial-border flex items-center justify-center">
          <X className="size-5" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="relative w-full max-w-sm">
          {/* Camera viewfinder - respects safe area */}
          <div className="relative aspect-square rounded-md overflow-hidden bg-black border-4 border-accent/50">
            {/* Live camera feed container for Html5Qrcode */}
            <div id="qr-reader-container" className="absolute inset-0 w-full h-full object-cover" />

            {/* Scan animation overlay */}
            {!scanned && (
              <>
                <div className="absolute inset-x-0 h-1 scanline" />
                <div className="absolute top-1/2 left-1/2 w-32 h-32 border-4 border-accent/60 rounded-lg -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </>
            )}

            {/* Success animation */}
            {scanned && (
              <div className="absolute inset-0 flex items-center justify-center bg-primary/30 animate-fade-in">
                <div className="size-24 rounded-full bg-primary border-4 border-primary-foreground flex items-center justify-center haptic-tick">
                  <Zap className="size-12 text-primary-foreground" fill="currentColor" />
                </div>
              </div>
            )}
          </div>

          {/* Corner brackets */}
          {["top-0 left-0 border-t-4 border-l-4", "top-0 right-0 border-t-4 border-r-4", "bottom-0 left-0 border-b-4 border-l-4", "bottom-0 right-0 border-b-4 border-r-4"].map((c, i) => (
            <div key={i} className={`absolute size-10 ${c} border-accent`} />
          ))}
        </div>
      </div>

      <div className="p-6 text-center">
        <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {scanned ? (
            <>
              <div className="text-primary font-semibold">✓ Match Confirmed</div>
              <div className="text-xs mt-1">{scanResult?.text || "Scan complete"}</div>
            </>
          ) : (
            <>
              <div>Point camera at barcode/QR</div>
              <div className="text-xs mt-1">SKU: {itemSKU}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
