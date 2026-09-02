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
  seedReservations,
  seedReviews,
  seedStaff,
  seedTables,
  type AdminCoupon,
  type AdminCourier,
  type AdminCustomer,
  type AdminHouse,
  type AdminOrder,
  type AdminPayout,
  type AdminProduct,
  type AdminReservation,
  type AdminReview,
  type AdminStaff,
  type AdminTable,
  type OrderChannel,
  type OrderItemLine,
  type OrderStatus,
  type ReservationStatus,
} from "@/data/admin";
import { generateOrderId, nowMs, pickEtaMs, timeLabel } from "@/lib/orders";
import { useSyncedState } from "@/lib/sync-storage";

const SESSION_KEY = "afya-admin-session-v1";
const ORDERS_KEY = "afya-orders-v1";
const COURIERS_KEY = "afya-couriers-v1";

export const ADMIN_EMAIL = "admin@afyagrill.com";
export const ADMIN_PASSWORD = "afya130299J@";

export type NewOrderInput = {
  channel: OrderChannel;
  cliente: string;
  telefone?: string | undefined;
  casa: string;
  unidadeId?: string | undefined;
  pagamento: AdminOrder["pagamento"];
  itens: OrderItemLine[];
  total: number;
  mesa?: number | undefined;
  endereco?: string | undefined;
  destino?: { lat: number; lng: number } | undefined;
};

type AdminCtx = {
  ready: boolean;
  user: string | null;
  signIn: (email: string, password: string) => { ok: boolean; error?: string };
  signOut: () => void;

  orders: AdminOrder[];
  setOrderStatus: (id: string, status: OrderStatus) => void;
  createOrder: (input: NewOrderInput) => AdminOrder;
  startPreparing: (id: string) => void;
  markReady: (id: string) => void;
  deliverToTable: (id: string) => void;
  acceptDelivery: (id: string, courierId: string) => void;
  markDelivered: (id: string) => void;

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

  reservations: AdminReservation[];
  addReservation: (
    r: Omit<AdminReservation, "id" | "codigo" | "status" | "criadoEm">,
  ) => AdminReservation;
  setReservationStatus: (id: string, status: ReservationStatus) => void;

  tables: AdminTable[];
};

const Ctx = createContext<AdminCtx | null>(null);

const courierFlow: AdminCourier["status"][] = ["Disponível", "Em rota", "Offline"];

function withHistory(order: AdminOrder, status: OrderStatus): AdminOrder {
  return { ...order, status, historico: [...order.historico, { status, em: nowMs() }] };
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<string | null>(null);

  const [orders, setOrders] = useSyncedState<AdminOrder[]>(ORDERS_KEY, seedOrders);
  const [couriers, setCouriers] = useSyncedState<AdminCourier[]>(COURIERS_KEY, seedCouriers);
  const [products, setProducts] = useState(seedProducts);
  const [houses, setHouses] = useState(seedHouses);
  const [customers, setCustomers] = useState(seedCustomers);
  const [coupons, setCoupons] = useState(seedCoupons);
  const [reviews, setReviews] = useState(seedReviews);
  const [staff, setStaff] = useState(seedStaff);
  const [payouts, setPayouts] = useState(seedPayouts);
  const [reservations, setReservations] = useState(seedReservations);
  const [tables] = useState(seedTables);

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
        setOrders((prev) => prev.map((o) => (o.id === id ? withHistory(o, status) : o))),

      createOrder: (input) => {
        const id = generateOrderId();
        const criadoEmMs = nowMs();
        const order: AdminOrder = {
          id,
          cliente: input.cliente,
          telefone: input.telefone,
          casa: input.casa,
          unidadeId: input.unidadeId,
          itens: input.itens.map((i) => `${i.qtd}x ${i.nome}`).join(", "),
          itensDetalhados: input.itens,
          total: input.total,
          pagamento: input.pagamento,
          status: "Novo",
          criadoEm: timeLabel(criadoEmMs),
          criadoEmMs,
          entregador: "",
          channel: input.channel,
          mesa: input.mesa,
          endereco: input.endereco,
          destino: input.destino,
          historico: [{ status: "Novo", em: criadoEmMs }],
        };
        setOrders((prev) => [order, ...prev]);
        return order;
      },

      startPreparing: (id) =>
        setOrders((prev) =>
          prev.map((o) => (o.id === id && o.status === "Novo" ? withHistory(o, "Em preparo") : o)),
        ),

      markReady: (id) =>
        setOrders((prev) =>
          prev.map((o) =>
            o.id === id && o.status === "Em preparo" ? withHistory(o, "Pronto") : o,
          ),
        ),

      deliverToTable: (id) =>
        setOrders((prev) =>
          prev.map((o) =>
            o.id === id && o.channel === "mesa" && o.status === "Pronto"
              ? withHistory(o, "Entregue")
              : o,
          ),
        ),

      acceptDelivery: (id, courierId) => {
        const courier = couriers.find((c) => c.id === courierId);
        if (!courier) return;
        const aceitoEmMs = nowMs();
        const etaMs = pickEtaMs();
        setOrders((prev) =>
          prev.map((o) =>
            o.id === id && o.channel === "delivery" && o.status === "Pronto"
              ? {
                  ...withHistory(o, "A caminho"),
                  entregador: courier.nome,
                  entregadorId: courier.id,
                  aceitoEmMs,
                  etaMs,
                }
              : o,
          ),
        );
        setCouriers((prev) =>
          prev.map((c) => (c.id === courierId ? { ...c, status: "Em rota" } : c)),
        );
      },

      markDelivered: (id) => {
        setOrders((prev) => {
          const order = prev.find((o) => o.id === id);
          if (order?.entregadorId) {
            setCouriers((prevCouriers) =>
              prevCouriers.map((c) =>
                c.id === order.entregadorId
                  ? { ...c, status: "Disponível", entregasHoje: c.entregasHoje + 1 }
                  : c,
              ),
            );
          }
          return prev.map((o) => (o.id === id ? withHistory(o, "Entregue") : o));
        });
      },

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
      addCoupon: (c) => setCoupons((prev) => [...prev, { ...c, usos: 0, id: `k-${Date.now()}` }]),
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
      reservations,
      addReservation: (r) => {
        const created: AdminReservation = {
          ...r,
          id: `res-${Date.now()}`,
          codigo: `AFY-R${Math.floor(400 + Math.random() * 599)}`,
          status: "Pendente",
          criadoEm: new Date().toLocaleString("pt-BR"),
        };
        setReservations((prev) => [created, ...prev]);
        return created;
      },
      setReservationStatus: (id, status) =>
        setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r))),
      tables,
    }),
    [
      ready,
      user,
      signIn,
      signOut,
      orders,
      setOrders,
      couriers,
      setCouriers,
      products,
      houses,
      customers,
      coupons,
      reviews,
      staff,
      payouts,
      reservations,
      tables,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdmin() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdmin precisa estar dentro de AdminProvider");
  return ctx;
}
