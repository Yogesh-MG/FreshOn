import { usePos, formatINR, subtotalOf } from "../store";
import { X, Play, Trash2, Clock, User } from "lucide-react";

interface Props {
  onClose: () => void;
}

export default function HeldOrdersModal({ onClose }: Props) {
  const heldOrders = usePos((s) => s.heldOrders);
  const resumeHeldOrder = usePos((s) => s.resumeHeldOrder);
  const deleteHeldOrder = usePos((s) => s.deleteHeldOrder);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-[80vh]">
        <div className="bg-foreground text-background px-4 py-3 flex items-center justify-between">
          <h2 className="font-extrabold text-xl tracking-tighter uppercase">Parked Transactions</h2>
          <button onClick={onClose} className="hover:bg-destructive p-1 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-sharp">
          {heldOrders.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-muted-foreground font-bold uppercase tracking-widest">No orders on hold</div>
            </div>
          ) : (
            heldOrders.map((order) => {
              const subtotal = subtotalOf(order.cart, !!order.customer?.pride);
              const itemCount = order.cart.reduce((s, i) => s + i.quantity, 0);
              
              return (
                <div key={order.id} className="border-2 border-foreground bg-background p-4 hover:border-primary transition-colors group">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-foreground text-background px-2 py-0.5 font-mono font-bold text-xs">
                          #{order.id}
                        </span>
                        <span className="text-[10px] font-extrabold text-muted-foreground uppercase flex items-center gap-1">
                          <Clock size={12}/> {new Date(order.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-extrabold">
                        <User size={16} className="text-primary"/>
                        {order.customer ? (
                          <span>{order.customer.name} <span className="font-mono text-xs opacity-60">({order.customer.phone})</span></span>
                        ) : (
                          <span className="italic opacity-50">Walk-in Customer</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-extrabold text-muted-foreground uppercase">Balance Due</div>
                      <div className="text-xl font-mono font-black text-primary">{formatINR(subtotal)}</div>
                    </div>
                  </div>

                  <div className="mb-4 bg-muted/30 p-2 border border-foreground/10 text-xs font-bold space-y-1">
                    {order.cart.slice(0, 3).map(item => (
                      <div key={item.pid} className="flex justify-between">
                        <span>{item.name} x {item.quantity}</span>
                        <span className="font-mono opacity-60">{formatINR(item.unitPrice * item.quantity)}</span>
                      </div>
                    ))}
                    {order.cart.length > 3 && (
                      <div className="text-[10px] opacity-50 italic">+ {order.cart.length - 3} more items...</div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => {
                        deleteHeldOrder(order.id);
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-foreground bg-card hover:bg-destructive hover:text-destructive-foreground font-extrabold text-xs transition-colors"
                    >
                      <Trash2 size={16} /> DISCARD
                    </button>
                    <button 
                      onClick={() => {
                        resumeHeldOrder(order.id);
                        onClose();
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-foreground bg-primary text-primary-foreground font-extrabold text-xs hover:bg-foreground hover:text-background transition-colors"
                    >
                      <Play size={16} /> RESUME
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t-2 border-foreground p-4 bg-muted/20">
          <p className="text-[10px] font-bold text-center uppercase tracking-widest text-muted-foreground leading-relaxed">
            Parked orders are stored locally for this session.<br/>
            Resume them to complete checkout or discard to clear space.
          </p>
        </div>
      </div>
    </div>
  );
}
