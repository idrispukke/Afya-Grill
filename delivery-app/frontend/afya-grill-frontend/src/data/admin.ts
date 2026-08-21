export type OrderStatus = "Novo" | "Preparando" | "A caminho" | "Entregue" | "Cancelado";

export type AdminOrder = {
  id: string;
  cliente: string;
  casa: string;
  itens: string;
  total: number;
  pagamento: "Pix" | "Cartão" | "Dinheiro";
  status: OrderStatus;
  criadoEm: string;
  entregador: string;
};

export type AdminProduct = {
  id: string;
  nome: string;
  casa: string;
  categoria: "Destaques" | "Principais" | "Doces" | "Drinks";
  preco: number;
  estoque: number;
  ativo: boolean;
};

export type AdminHouse = {
  id: string;
  nome: string;
  bairro: string;
  cozinha: string;
  nota: number;
  ativo: boolean;
  comissao: number;
};

export type AdminCustomer = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  pedidos: number;
  gasto: number;
  vip: boolean;
};

export type AdminCourier = {
  id: string;
  nome: string;
  veiculo: "Moto" | "Bike";
  zona: string;
  entregasHoje: number;
  status: "Disponível" | "Em rota" | "Offline";
};

export type AdminCoupon = {
  id: string;
  codigo: string;
  tipo: "Percentual" | "Fixo";
  valor: number;
  usos: number;
  ativo: boolean;
};

export type AdminReview = {
  id: string;
  cliente: string;
  casa: string;
  nota: number;
  comentario: string;
  respondido: boolean;
};

export type AdminStaff = {
  id: string;
  nome: string;
  email: string;
  cargo: "Administrador" | "Gerente" | "Atendente";
  ativo: boolean;
};

export type AdminPayout = {
  id: string;
  casa: string;
  periodo: string;
  bruto: number;
  taxa: number;
  status: "Pago" | "Pendente";
};

export type ReservationStatus = "Pendente" | "Confirmada" | "Cancelada" | "Concluída";

export type AdminReservation = {
  id: string;
  codigo: string;
  cliente: string;
  telefone: string;
  email?: string | undefined;
  casa: string;
  pessoas: number;
  data: string;
  hora: string;
  mesa?: string | undefined;
  observacao?: string | undefined;
  status: ReservationStatus;
  origem: "Site" | "QR Code" | "Telefone" | "Painel";
  criadoEm: string;
};

export type AdminTable = {
  id: string;
  casa: string;
  numero: number;
  capacidade: number;
  area: "Salão" | "Varanda" | "Bar" | "Área externa";
  scans: number;
};

export const seedOrders: AdminOrder[] = [
  {
    id: "AFY-2041",
    cliente: "Marina Duarte",
    casa: "Afya Grill Duque de Caxias",
    itens: "2x Smash Ouro",
    total: 97.8,
    pagamento: "Pix",
    status: "Preparando",
    criadoEm: "20:14",
    entregador: "Rafael Lima",
  },
  {
    id: "AFY-2042",
    cliente: "Caio Bentes",
    casa: "Afya Grill Botafogo",
    itens: "1x Omakase 15 peças",
    total: 139,
    pagamento: "Cartão",
    status: "A caminho",
    criadoEm: "20:31",
    entregador: "Bruna Alves",
  },
];

export const seedProducts: AdminProduct[] = [
  {
    id: "smash-ouro",
    nome: "Smash Ouro",
    casa: "Afya Grill Duque de Caxias",
    categoria: "Destaques",
    preco: 48.9,
    estoque: 24,
    ativo: true,
  },
  {
    id: "lava-gold",
    nome: "Lava Gold",
    casa: "Afya Grill Leblon",
    categoria: "Doces",
    preco: 34,
    estoque: 8,
    ativo: true,
  },
];

export const seedHouses: AdminHouse[] = [
  {
    id: "brasa",
    nome: "Afya Grill Duque de Caxias",
    bairro: "Centro, Duque de Caxias",
    cozinha: "Grill",
    nota: 4.9,
    ativo: true,
    comissao: 12,
  },
  {
    id: "kaze",
    nome: "Afya Grill Botafogo",
    bairro: "Botafogo, Rio de Janeiro",
    cozinha: "Japonesa",
    nota: 5,
    ativo: true,
    comissao: 15,
  },
];

export const seedCustomers: AdminCustomer[] = [
  {
    id: "c1",
    nome: "Marina Duarte",
    email: "marina@email.com",
    telefone: "(21) 98812-4410",
    pedidos: 18,
    gasto: 1420.5,
    vip: true,
  },
  {
    id: "c2",
    nome: "Caio Bentes",
    email: "caio@email.com",
    telefone: "(21) 99604-7723",
    pedidos: 6,
    gasto: 512,
    vip: false,
  },
];

export const seedCouriers: AdminCourier[] = [
  {
    id: "e1",
    nome: "Rafael Lima",
    veiculo: "Moto",
    zona: "Caxias Centro",
    entregasHoje: 11,
    status: "Em rota",
  },
  {
    id: "e2",
    nome: "Bruna Alves",
    veiculo: "Bike",
    zona: "Vila São Luís",
    entregasHoje: 7,
    status: "Disponível",
  },
];

export const seedCoupons: AdminCoupon[] = [
  { id: "k1", codigo: "AFYA10", tipo: "Percentual", valor: 10, usos: 214, ativo: true },
  { id: "k2", codigo: "BRASA20", tipo: "Fixo", valor: 20, usos: 61, ativo: false },
];

export const seedReviews: AdminReview[] = [
  {
    id: "r1",
    cliente: "Marina Duarte",
    casa: "Afya Grill Duque de Caxias",
    nota: 5,
    comentario: "Chegou quente e no ponto perfeito. O brioche é surreal.",
    respondido: true,
  },
  {
    id: "r2",
    cliente: "Caio Bentes",
    casa: "Afya Grill Botafogo",
    nota: 4,
    comentario: "Omakase impecável, só demorou 10 min a mais que o previsto.",
    respondido: false,
  },
];

export const seedStaff: AdminStaff[] = [
  {
    id: "s1",
    nome: "Equipe Afya",
    email: "admin@afyagrill.com",
    cargo: "Administrador",
    ativo: true,
  },
  {
    id: "s2",
    nome: "Júlia Prado",
    email: "julia@afyagrill.com",
    cargo: "Gerente",
    ativo: true,
  },
];

export const seedPayouts: AdminPayout[] = [
  {
    id: "p1",
    casa: "Afya Grill Duque de Caxias",
    periodo: "01–15 Ago",
    bruto: 18420,
    taxa: 12,
    status: "Pago",
  },
  {
    id: "p2",
    casa: "Afya Grill Botafogo",
    periodo: "01–15 Ago",
    bruto: 22150,
    taxa: 15,
    status: "Pendente",
  },
];

export const seedReservations: AdminReservation[] = [
  {
    id: "res-1",
    codigo: "AFY-R482",
    cliente: "Beatriz Nogueira",
    telefone: "(21) 98123-4455",
    email: "beatriz@email.com",
    casa: "Afya Grill Duque de Caxias",
    pessoas: 4,
    data: "2026-08-17",
    hora: "20:00",
    mesa: "Mesa 12",
    observacao: "Aniversário — pediu vela na sobremesa",
    status: "Confirmada",
    origem: "QR Code",
    criadoEm: "2026-08-15 14:02",
  },
  {
    id: "res-2",
    codigo: "AFY-R483",
    cliente: "Thiago Andrade",
    telefone: "(21) 99887-2210",
    casa: "Afya Grill Botafogo",
    pessoas: 2,
    data: "2026-08-17",
    hora: "21:30",
    mesa: "Balcão 3",
    status: "Pendente",
    origem: "Site",
    criadoEm: "2026-08-16 09:40",
  },
  {
    id: "res-3",
    codigo: "AFY-R484",
    cliente: "Luiza Fontes",
    telefone: "(21) 98221-7734",
    email: "luiza.fontes@email.com",
    casa: "Afya Grill Copacabana",
    pessoas: 6,
    data: "2026-08-18",
    hora: "19:30",
    mesa: "Mesa 5",
    observacao: "Uma criança, precisa de cadeirão",
    status: "Confirmada",
    origem: "Site",
    criadoEm: "2026-08-14 18:21",
  },
  {
    id: "res-4",
    codigo: "AFY-R485",
    cliente: "Pedro Salgado",
    telefone: "(21) 97744-1290",
    casa: "Afya Grill Ipanema",
    pessoas: 3,
    data: "2026-08-19",
    hora: "20:30",
    status: "Pendente",
    origem: "Telefone",
    criadoEm: "2026-08-16 20:05",
  },
  {
    id: "res-5",
    codigo: "AFY-R486",
    cliente: "Marina Duarte",
    telefone: "(21) 98812-4410",
    casa: "Afya Grill Duque de Caxias",
    pessoas: 2,
    data: "2026-08-16",
    hora: "20:00",
    mesa: "Mesa 8",
    status: "Concluída",
    origem: "QR Code",
    criadoEm: "2026-08-13 11:15",
  },
  {
    id: "res-6",
    codigo: "AFY-R487",
    cliente: "Caio Bentes",
    telefone: "(21) 99604-7723",
    casa: "Afya Grill Flamengo",
    pessoas: 5,
    data: "2026-08-15",
    hora: "22:00",
    status: "Cancelada",
    origem: "Site",
    criadoEm: "2026-08-12 16:48",
  },
];

export const seedTables: AdminTable[] = [
  {
    id: "t1",
    casa: "Afya Grill Duque de Caxias",
    numero: 1,
    capacidade: 2,
    area: "Salão",
    scans: 142,
  },
  {
    id: "t2",
    casa: "Afya Grill Duque de Caxias",
    numero: 2,
    capacidade: 4,
    area: "Salão",
    scans: 118,
  },
  {
    id: "t3",
    casa: "Afya Grill Duque de Caxias",
    numero: 3,
    capacidade: 4,
    area: "Varanda",
    scans: 96,
  },
  {
    id: "t4",
    casa: "Afya Grill Duque de Caxias",
    numero: 4,
    capacidade: 6,
    area: "Área externa",
    scans: 71,
  },
  { id: "t5", casa: "Afya Grill Botafogo", numero: 1, capacidade: 2, area: "Bar", scans: 88 },
  { id: "t6", casa: "Afya Grill Botafogo", numero: 2, capacidade: 4, area: "Salão", scans: 64 },
];

export const revenueSeries = [
  { dia: "Seg", valor: 4200 },
  { dia: "Ter", valor: 5100 },
  { dia: "Qua", valor: 4780 },
  { dia: "Qui", valor: 6320 },
  { dia: "Sex", valor: 9140 },
  { dia: "Sáb", valor: 11280 },
  { dia: "Dom", valor: 8760 },
];

export const categorySplit = [
  { categoria: "Destaques", valor: 38 },
  { categoria: "Principais", valor: 29 },
  { categoria: "Drinks", valor: 18 },
  { categoria: "Doces", valor: 15 },
];

export const ordersByHour = [
  { hora: "11h", pedidos: 8 },
  { hora: "13h", pedidos: 26 },
  { hora: "15h", pedidos: 12 },
  { hora: "17h", pedidos: 9 },
  { hora: "19h", pedidos: 31 },
  { hora: "21h", pedidos: 44 },
  { hora: "23h", pedidos: 19 },
];

export const statusFlow: OrderStatus[] = [
  "Novo",
  "Preparando",
  "A caminho",
  "Entregue",
  "Cancelado",
];

export const reservationStatusFlow: ReservationStatus[] = [
  "Pendente",
  "Confirmada",
  "Concluída",
  "Cancelada",
];
