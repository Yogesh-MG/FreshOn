import { useState, useMemo, useRef } from "react";
import { usePos, formatINR } from "../store";
import { ScanLine, AlertTriangle, Loader2, RefreshCw } from "lucide-react";

export default function ProductGrid() {
  const products = usePos((s) => s.products);
  const productsLoading = usePos((s) => s.productsLoading);
  const fetchProducts = usePos((s) => s.fetchProducts);
  const scan = usePos((s) => s.scan);
  const addProduct = usePos((s) => s.addProduct);
  const mode = usePos((s) => s.mode);
  const addWastageDraft = usePos((s) => s.addWastageDraft);
  const [scanInput, setScanInput] = useState("");
  const [scanError, setScanError] = useState("");
  const [filter, setFilter] = useState<string>("All");
  const [search, setSearch] = useState("");
  const isScanning = useRef(false);

  const cats = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  );

  const filtered = useMemo(() => {
    let list = filter === "All" ? products : products.filter((p) => p.category === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.pid.toLowerCase().includes(q));
    }
    return list;
  }, [products, filter, search]);

  const handleScan = () => {
    if (isScanning.current || !scanInput.trim()) return;

    isScanning.current = true;
    setScanError("");
    const [pid, w] = scanInput.trim().toUpperCase().split(":");
    const ok = scan(pid, w ? parseFloat(w) : undefined);
    if (!ok) setScanError("Unknown PID: " + pid);
    setScanInput("");

    setTimeout(() => {
      isScanning.current = false;
    }, 500);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Scan bar */}
      <div className="border-b-2 border-foreground p-3 bg-card">
        <div className="flex gap-2">
          <div className="flex items-center px-3 bg-foreground text-background border-2 border-foreground">
            <ScanLine size={20}/>
          </div>
          <input
            autoFocus
            value={scanInput}
            onChange={(e) => setScanInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleScan()}
            placeholder="SCAN OR TYPE PID  ·  e.g. P101  or  P101:0.85"
            className="flex-1 border-2 border-foreground bg-background px-3 py-2 font-mono font-bold text-base outline-none focus:border-primary placeholder:text-muted-foreground"
          />
          <button
            onClick={handleScan}
            className="pressable-primary bg-primary text-primary-foreground border-2 border-foreground px-5 font-extrabold text-sm tracking-widest"
          >
            SCAN
          </button>
          <button
            onClick={() => fetchProducts()}
            disabled={productsLoading}
            className="pressable border-2 border-foreground bg-card px-3 font-extrabold text-xs tracking-widest flex items-center gap-1 disabled:opacity-50"
          >
            <RefreshCw size={14} className={productsLoading ? "animate-spin" : ""}/> SYNC
          </button>
        </div>
        {scanError && (
          <div className="mt-2 bg-destructive text-destructive-foreground px-2 py-1 font-bold text-xs uppercase">{scanError}</div>
        )}
        {/* Inline search */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="SEARCH PRODUCTS..."
          className="mt-2 w-full border-2 border-foreground bg-background px-3 py-1.5 font-bold text-xs outline-none focus:border-primary placeholder:text-muted-foreground"
        />
      </div>

      {/* Category tabs */}
      <div className="flex border-b-2 border-foreground bg-card overflow-x-auto">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider border-r-2 border-foreground whitespace-nowrap ${
              filter === c ? "bg-foreground text-background" : "hover:bg-secondary"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto scrollbar-sharp p-3">
        {productsLoading && products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
            <Loader2 size={40} className="animate-spin"/>
            <span className="font-extrabold uppercase tracking-widest text-sm">Loading Catalog...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
            <span className="font-extrabold uppercase tracking-widest text-sm">No Products Found</span>
            <span className="text-xs font-bold">Try a different category or search term</span>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {filtered.map((p) => {
              const low = p.stock <= (p.low_stock_threshold ?? 5);
              const out = p.stock <= 0;
              return (
                <button key={p.pid}
                  onClick={() => mode === "wastage" ? addWastageDraft(p, 1) : addProduct(p, 1)}
                  className={`pressable border-2 border-foreground bg-card text-left p-3 hover:bg-secondary relative
                    ${mode === "wastage" ? "hover:bg-destructive hover:text-destructive-foreground" : ""}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono font-extrabold text-[10px] bg-foreground text-background px-1.5 py-0.5">{p.pid}</span>
                    <div className="flex gap-1">
                      {p.member_eligible && (
                        <span className="font-extrabold text-[9px] bg-accent text-accent-foreground px-1.5 py-0.5 border border-foreground">PRIDE</span>
                      )}
                      {p.weighed && (
                        <span className="font-extrabold text-[10px] bg-secondary text-foreground px-1.5 py-0.5 border border-foreground">/ KG</span>
                      )}
                    </div>
                  </div>
                  <div className="font-extrabold text-base leading-tight mb-2 line-clamp-2">{p.name}</div>
                  <div className="flex items-end justify-between">
                    <div className="font-mono font-extrabold text-2xl tabular-nums">{formatINR(p.price)}</div>
                    <div className="font-mono text-[10px] font-bold text-muted-foreground">
                      STK {p.weighed ? p.stock.toFixed(1) : p.stock}
                    </div>
                  </div>
                  {low && (
                    <div className={`absolute -top-1 -right-1 px-1.5 py-0.5 border-2 border-foreground font-extrabold text-[9px] tracking-widest flex items-center gap-0.5
                      ${out ? "bg-foreground text-background" : "bg-destructive text-destructive-foreground"}`}>
                      <AlertTriangle size={10}/> {out ? "OUT" : "LOW STOCK"}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
