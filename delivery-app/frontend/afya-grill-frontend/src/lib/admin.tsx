import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  seedCoupons,
  seedCouriers,
  seedCustomers,
  seedHouses,
  seedOrders,
  seedPayouts,
  seedProducts,
  seedReviews,
  seedStaff,
  type AdminCoupon,
  type AdminCourier,
  type AdminCustomer,
  type AdminHouse,
  type AdminOrder,
  type AdminPayout,
  type AdminProduct,
  type AdminReview,
  type AdminStaff,
  type OrderStatus,
} from "@/data/admin";

const SESSION_KEY = "afya-admin-session-v1";

export const ADMIN_EMAIL = "admin@afyagrill.com";
export const ADMIN_PASSWORD = "afya130299J@";

type AdminCtx = {
  ready: boolean;
  user: string | null;
  signIn: (email: string, password: string) => { ok: boolean; error?: string };
  signOut: () => void;

  orders: AdminOrder[];
  setOrderStatus: (id: string, status: OrderStatus) => void;

  products: AdminProduct[];
  toggleProduct: (id: string) => void;
  addProduct: (p: Omit<AdminProduct, "id">) => void;
  removeProduct: (id: string) => void;

  houses: AdminHouse[];
  toggleHouse: (id: string) => void;

  customers: AdminCustomer[];
  toggleVip: (id: string) => void;

  couriers: AdminCourier[];
  cycleCourier: (id: string) => void;

  coupons: AdminCoupon[];
  toggleCoupon: (id: string) => void;
  addCoupon: (c: Omit<AdminCoupon, "id" | "usos">) => void;
  removeCoupon: (id: string) => void;

  reviews: AdminReview[];
  answerReview: (id: string) => void;

  staff: AdminStaff[];
  toggleStaff: (id: string) => void;

  payouts: AdminPayout[];
  payPayout: (id: string) => void;
};

const Ctx = createContext<AdminCtx | null>(null);

const courierFlow: AdminCourier["status"][] = ["Disponível", "Em rota", "Offline"];

export function AdminProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<string | null>(null);

  const [orders, setOrders] = useState(seedOrders);
  const [products, setProducts] = useState(seedProducts);
  const [houses, setHouses] = useState(seedHouses);
  const [customers, setCustomers] = useState(seedCustomers);
  const [couriers, setCouriers] = useState(seedCouriers);
  const [coupons, setCoupons] = useState(seedCoupons);
  const [reviews, setReviews] = useState(seedReviews);
  const [staff, setStaff] = useState(seedStaff);
  const [payouts, setPayouts] = useState(seedPayouts);

  useEffect(() => {
    try {
      setUser(localStorage.getItem(SESSION_KEY));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const signIn = useCallback<AdminCtx["signIn"]>((email, password) => {
    const mail = email.trim().toLowerCase();
    if (!mail.endsWith("@afyagrill.com")) {
      return { ok: false, error: "Use um e-mail corporativo @afyagrill.com" };
    }
    if (password !== ADMIN_PASSWORD) {
      return { ok: false, error: "Senha incorreta" };
    }
    try {
      localStorage.setItem(SESSION_KEY, mail);
    } catch {
      /* ignore */
    }
    setUser(mail);
    return { ok: true };
  }, []);

  const signOut = useCallback(() => {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
    setUser(null);
  }, []);

  const value = useMemo<AdminCtx>(
    () => ({
      ready,
      user,
      signIn,
      signOut,
      orders,
      setOrderStatus: (id, status) =>
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o))),
      products,
      toggleProduct: (id) =>
        setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ativo: !p.ativo } : p))),
      addProduct: (p) =>
        setProducts((prev) => [...prev, { ...p, id: `p-${prev.length + 1}-${Date.now()}` }]),
      removeProduct: (id) => setProducts((prev) => prev.filter((p) => p.id !== id)),
      houses,
      toggleHouse: (id) =>
        setHouses((prev) => prev.map((h) => (h.id === id ? { ...h, ativo: !h.ativo } : h))),
      customers,
      toggleVip: (id) =>
        setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, vip: !c.vip } : c))),
      couriers,
      cycleCourier: (id) =>
        setCouriers((prev) =>
          prev.map((c) =>
            c.id === id
              ? {
                  ...c,
                  status:
                    courierFlow[(courierFlow.indexOf(c.status) + 1) % courierFlow.length] ??
                    c.status,
                }
              : c,
          ),
        ),
      coupons,
      toggleCoupon: (id) =>
        setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, ativo: !c.ativo } : c))),
      addCoupon: (c) =>
        setCoupons((prev) => [...prev, { ...c, usos: 0, id: `k-${Date.now()}` }]),
      removeCoupon: (id) => setCoupons((prev) => prev.filter((c) => c.id !== id)),
      reviews,
      answerReview: (id) =>
        setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, respondido: true } : r))),
      staff,
      toggleStaff: (id) =>
        setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, ativo: !s.ativo } : s))),
      payouts,
      payPayout: (id) =>
        setPayouts((prev) => prev.map((p) => (p.id === id ? { ...p, status: "Pago" } : p))),
    }),
    [
      ready,
      user,
      signIn,
      signOut,
      orders,
      products,
      houses,
      customers,
      couriers,
      coupons,
      reviews,
      staff,
      payouts,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdmin() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdmin precisa estar dentro de AdminProvider");
  return ctx;
}
