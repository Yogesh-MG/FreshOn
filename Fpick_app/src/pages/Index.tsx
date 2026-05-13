import { useState, useEffect } from "react";
import { GeoGate } from "@/components/GeoGate";
import { PinLogin } from "@/components/PinLogin";
import { Dashboard } from "@/components/Dashboard";
import { PickingScreen } from "@/components/PickingScreen";
import { QAScreen } from "@/components/QAScreen";
import { CompleteScreen } from "@/components/CompleteScreen";
import { mockOrders } from "@/lib/mockData";
import { Order, PickItem, Screen } from "@/lib/types";
import { authService } from "@/lib/authService";
import { backendAuthService } from "@/lib/backendAuthService";
import { pickerOrderService, PickerTask } from "@/lib/pickerOrderService";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("login");
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);

  const activeOrder = orders.find(o => o.id === activeOrderId) ?? null;

  /**
   * Convert PickerTask from backend to Order type for UI
   */
  const convertPickerTaskToOrder = (task: PickerTask): Order => {
    return {
      id: task.id,
      trackingId: task.order.tracking_id,
      customer: task.order.customer,
      itemCount: task.items.length,
      deadlineMinutes: task.order.deadline_minutes,
      status: task.status,
      items: task.items.map(item => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        unit: item.unit,
        emoji: item.emoji,
        status: item.status === "packed" ? "packed" : "pending",
        substitutions: [],
      })),
    };
  };

  /**
   * Fetch orders from backend
   */
  const fetchOrders = async () => {
    setIsLoading(true);
    const result = await pickerOrderService.getQueue();
    
    if (result.success && result.orders) {
      // Convert backend PickerTask objects to UI Order type
      const converted = result.orders.map(convertPickerTaskToOrder);
      setOrders(converted);
    } else {
      // Fall back to mock data if backend fails
      console.warn("Failed to fetch orders:", result.error);
      setOrders(mockOrders);
    }
    
    setIsLoading(false);
  };

  /**
   * Verify picker attendance and proceed to dashboard
   */
  const verifyAndProceed = async (employeeId: string) => {
    setIsLoading(true);
    const result = await backendAuthService.verifyPetpoojaAttendance(employeeId);
    
    if (result.success && result.on_duty) {
      // Attendance verified, proceed to dashboard
      setAttendanceError(null);
      setScreen("geo");
      fetchOrders();
    } else {
      // Not on duty, show error and redirect to login
      setAttendanceError("Please clock-in on Petpooja first.");
      authService.logout();
      setScreen("login");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // Check auth state on mount
    const auth = authService.getAuthState();
    if (auth.isLoggedIn && auth.pin && auth.employeeId) {
      // PERSISTENT LOGIN: If the user is already logged in, 
      // verify attendance and go directly to geo-gate
      verifyAndProceed(auth.employeeId);
    } else {
      // FRESH START: Start with the login screen
      setScreen("login");
    }
    setIsInitialized(true);
  }, []);

  const updateItem = (orderId: string, itemId: string, patch: Partial<PickItem>) => {
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, items: o.items.map(i => i.id === itemId ? { ...i, ...patch } : i) } : o
    ));
  };

  const handleLogout = () => {
    authService.logout();
    setScreen("login");
    setActiveOrderId(null);
  };

  const handleLoginSuccess = (employeeId: string) => {
    // After successful PIN login, verify attendance
    verifyAndProceed(employeeId);
  };

  const handleScreenChange = (newScreen: Screen) => {
    setScreen(newScreen);
    // Refresh orders when going back to dashboard
    if (newScreen === "dashboard") {
      fetchOrders();
    }
  };

  if (!isInitialized) {
    return (
      <main className="min-h-screen bg-background mx-auto max-w-md font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Loading…</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background mx-auto max-w-md font-sans">
      {screen === "login" && (
        <PinLogin 
          onLogin={handleLoginSuccess}
          attendanceError={attendanceError}
          onClearError={() => setAttendanceError(null)}
        />
      )}
      {screen === "geo" && <GeoGate onUnlock={() => handleScreenChange("dashboard")} />}
      {screen === "dashboard" && (
        <Dashboard
          orders={orders}
          onSelectOrder={(id) => { setActiveOrderId(id); handleScreenChange("picking"); }}
          onLogout={handleLogout}
        />
      )}
      {screen === "picking" && activeOrder && (
        <PickingScreen
          order={activeOrder}
          onUpdateItem={(itemId, patch) => updateItem(activeOrder.id, itemId, patch)}
          onBack={() => handleScreenChange("dashboard")}
          onAllPacked={() => handleScreenChange("qa")}
        />
      )}
      {screen === "qa" && activeOrder && (
        <QAScreen
          order={activeOrder}
          onBack={() => handleScreenChange("picking")}
          onComplete={() => handleScreenChange("complete")}
        />
      )}
      {screen === "complete" && activeOrder && (
        <CompleteScreen
          orderId={activeOrder.id}
          onNext={() => {
            setOrders(prev => prev.filter(o => o.id !== activeOrder.id));
            setActiveOrderId(null);
            handleScreenChange("dashboard");
          }}
        />
      )}
    </main>
  );
};

export default Index;
