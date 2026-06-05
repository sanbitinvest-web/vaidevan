const EXTERNAL_API = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "");
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const API = EXTERNAL_API ?? `${BASE}/api`;

function getToken(): string | null {
  return localStorage.getItem("vdv_token");
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Erro desconhecido" }));
    throw new Error(err.error || "Erro na requisição");
  }
  return res.json();
}

// ─── Types ───────────────────────────────────────────────
export type ApprovalStatus = "pending_kyc" | "under_review" | "approved" | "suspended";

export type ApiReservation = {
  id: number;
  name: string; email: string; phone: string; cpf: string | null;
  vehicleType: string; passengerCount: number;
  startDate: string; endDate: string; departureTime: string; returnTime: string | null;
  originAddress: string; destinationAddress: string;
  useAtDestination: boolean; driveAtDestination: boolean;
  luggageInfo: string | null; eventType: string | null;
  priority: string;
  hasBudget: boolean; budgetPhotoUrls: string[] | null;
  coastalInfo: string | null; notes: string | null;
  status: string; adminNotes: string | null;
  paymentMethod: string | null; paymentStatus: string;
  paymentAmount: number | null;
  stripeSessionId: string | null; stripeCheckoutUrl: string | null;
  mpPreferenceId: string | null; mpCheckoutUrl: string | null;
  ipayOrderNsu: string | null; ipayCheckoutUrl: string | null;
  geoLat: number | null; geoLng: number | null; geoAccuracy: number | null;
  ipAddress: string | null; userAgent: string | null;
  createdAt: string; updatedAt: string;
};

export type ApiBlogPost = {
  id: number; slug: string; title: string; excerpt: string;
  content: string; image: string; category: string; readTime: string;
  published: boolean; source: string; createdAt: string; updatedAt: string;
};

export type ApiClient = {
  id: number; type: string; name: string; email: string;
  phone: string | null; cpf: string | null; rg: string | null;
  cnpj: string | null; companyName: string | null;
  cep: string | null; street: string | null; number: string | null;
  complement: string | null; neighborhood: string | null;
  city: string | null; state: string | null;
  govBrId: string | null; govBrVerified: boolean;
  govBrVerifiedAt: string | null;
  notes: string | null; active: boolean;
  createdAt: string; updatedAt: string;
};

export type ApiContractTemplate = {
  id: number; name: string; type: string; description: string | null;
  body: string; fields: Array<{ key: string; label: string; type: string; required: boolean; placeholder?: string }>;
  active: boolean; createdAt: string; updatedAt: string;
};

export type ApiContract = {
  id: number; title: string; type: string; status: string;
  pdfUrl: string | null; govBrUrl: string | null; govBrProtocol: string | null;
  signedAt: string | null; expiresAt: string | null; createdAt: string;
  filledData: Record<string, string>; clientId: number | null; templateId: number | null;
  clientName: string | null; clientEmail: string | null; clientCpf: string | null;
  clientGovBrVerified: boolean | null; renderedHtml?: string | null;
  signatureGeoLat: number | null; signatureGeoLng: number | null;
  signatureGeoAccuracy: number | null;
  vistoriaData: Record<string, unknown> | null;
};

export type ApiPartner = {
  id: number; type: string; name: string; email: string;
  phone: string | null; cpf: string | null; cnpj: string | null;
  companyName: string | null; city: string | null; state: string | null;
  message: string | null; howFound: string | null;
  status: string; active: boolean;
  cnhUrl: string | null; cnhStatus: string;
  addressProofUrl: string | null; addressProofStatus: string;
  selfieUrl: string | null; selfieStatus: string;
  crlvUrls: string[] | null; contratoSocialUrl: string | null;
  commercialRefs: Array<{ name: string; phone: string; email: string }> | null;
  // KYC aprofundado
  occupation: string | null; patrimony: string | null;
  sourceOfFunds: string | null; investmentIntent: string | null;
  competitorDeclaration: boolean;
  registrationIp: string | null; registrationUserAgent: string | null;
  registrationGeoLat: number | null; registrationGeoLng: number | null; registrationGeoAccuracy: number | null;
  createdAt: string; updatedAt: string;
};

export type ApiInvestorApplication = {
  id: number;
  name: string; email: string; phone: string | null; cpf: string | null;
  city: string | null; state: string | null;
  approvalStatus: ApprovalStatus;
  kycNotes: string | null;
  approvedAt: string | null; approvedBy: string | null;
  rejectedReason: string | null;
  partnerApplicationId: number | null;
  registrationIp: string | null; registrationUserAgent: string | null;
  cnhStatus: string; addressProofStatus: string;
  govBrVerified: boolean; active: boolean;
  createdAt: string; updatedAt: string;
  // Candidatura original (formulário de parceiro)
  application: ApiPartner | null;
};

export type ApiInvestorProfile = {
  id: number; name: string; email: string; phone: string | null;
  cpf: string | null; rg: string | null; nationality: string | null;
  cep: string | null; street: string | null; number: string | null;
  complement: string | null; neighborhood: string | null;
  city: string | null; state: string | null;
  govBrId: string | null; govBrVerified: boolean; govBrVerifiedAt: string | null;
  cnhUrl: string | null; cnhStatus: string;
  addressProofUrl: string | null; addressProofStatus: string;
  approvalStatus: ApprovalStatus;
  approvedAt: string | null; approvedBy: string | null;
  rejectedReason: string | null;
  partnerApplicationId: number | null;
  active: boolean; createdAt: string; updatedAt: string;
};

export type ApiVehicleListing = {
  id: number;
  brand: string; model: string; year: number; color: string; plate: string | null;
  fuelType: string; transmission: string; mileage: number;
  passengerCapacity: number | null; cargoCapacity: string | null; enginePower: string | null;
  accessories: string[] | null; benefits: string[] | null;
  photos: string[] | null; coverPhoto: string | null;
  price: number | null; priceNegotiable: boolean;
  expectedReturnMonths: number | null; monthlyReturn: number | null; monthlyReturnPercent: number | null;
  description: string | null; condition: string; location: string | null;
  status: string; featured: boolean; sortOrder: number;
  createdAt: string; updatedAt: string;
};

// ─── API ─────────────────────────────────────────────────
export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; investor: { id: number; name: string; email: string; approvalStatus: ApprovalStatus } }>("/auth/login", {
      method: "POST", body: JSON.stringify({ email, password }),
    }),
  me: () => request<{ id: number; name: string; email: string; approvalStatus: ApprovalStatus }>("/auth/me"),

  // Dashboard unificado (1 round-trip)
  dashboard: () => request<{
    overview: {
      operations: number; vehicles: number; activeVehicles: number;
      totalIncome: number; totalExpense: number; netResult: number; pendingContracts: number;
    };
    monthly: Record<string, { income: number; expense: number }>;
    contracts: Array<{ id: number; title: string; status: string; createdAt: string }>;
    profile: ApiInvestorProfile;
  }>("/investor/dashboard"),

  // Visão geral (mantido para compatibilidade com outras páginas)
  overview: () => request<{
    operations: number; vehicles: number; activeVehicles: number;
    totalIncome: number; totalExpense: number; netResult: number; pendingContracts: number;
  }>("/investor/overview"),

  // Financeiro (mantido para compatibilidade com página /financeiro)
  financials: () => request<{
    records: Array<{ id: number; type: string; category: string; description: string | null; amount: string; date: string; operationId: number | null }>;
    byCategory: Record<string, { income: number; expense: number }>;
    monthly: Record<string, { income: number; expense: number }>;
  }>("/investor/financials"),

  // Veículos
  vehicles: () => request<Array<{
    id: number; plate: string; model: string; year: string | null;
    status: string; lat: number; lng: number; lastUpdate: string; operationId: number | null;
  }>>("/investor/vehicles"),

  // Contratos
  contracts: () => request<ApiContract[]>("/investor/contracts"),
  createContract: (data: {
    templateId?: number; clientId?: number; title: string;
    filledData?: Record<string, string>; expiresAt?: string;
    vistoriaData?: Record<string, unknown>;
  }) => request<ApiContract>("/investor/contracts", { method: "POST", body: JSON.stringify(data) }),
  signContract: (id: number, geo?: { geoLat: number; geoLng: number; geoAccuracy: number }) =>
    request<ApiContract>(`/investor/contracts/${id}/sign`, {
      method: "PATCH",
      body: JSON.stringify(geo ?? {}),
    }),
  cancelContract: (id: number) =>
    request<ApiContract>(`/investor/contracts/${id}/cancel`, { method: "PATCH" }),

  // Perfil do investidor
  profile: () => request<ApiInvestorProfile>("/investor/profile"),
  updateProfile: (data: Partial<ApiInvestorProfile>) =>
    request<ApiInvestorProfile>("/investor/profile", { method: "PUT", body: JSON.stringify(data) }),
  updateDocuments: (data: { cnhUrl?: string; addressProofUrl?: string }) =>
    request<ApiInvestorProfile>("/investor/documents", { method: "PATCH", body: JSON.stringify(data) }),
  verifyGovBr: () =>
    request<ApiInvestorProfile>("/investor/profile/govbr-verify", { method: "PATCH" }),

  // Clientes (admin)
  clients: () => request<ApiClient[]>("/admin/clients"),
  client: (id: number) => request<ApiClient>(`/admin/clients/${id}`),
  createClient: (data: Partial<ApiClient>) =>
    request<ApiClient>("/admin/clients", { method: "POST", body: JSON.stringify(data) }),
  updateClient: (id: number, data: Partial<ApiClient>) =>
    request<ApiClient>(`/admin/clients/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteClient: (id: number) =>
    request<{ message: string }>(`/admin/clients/${id}`, { method: "DELETE" }),
  verifyClientGovBr: (id: number) =>
    request<ApiClient>(`/admin/clients/${id}/govbr-verify`, { method: "PATCH" }),

  // Templates de contrato (admin)
  contractTemplates: () => request<ApiContractTemplate[]>("/admin/contract-templates"),
  contractTemplate: (id: number) => request<ApiContractTemplate>(`/admin/contract-templates/${id}`),
  createContractTemplate: (data: Partial<ApiContractTemplate>) =>
    request<ApiContractTemplate>("/admin/contract-templates", { method: "POST", body: JSON.stringify(data) }),
  updateContractTemplate: (id: number, data: Partial<ApiContractTemplate>) =>
    request<ApiContractTemplate>(`/admin/contract-templates/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteContractTemplate: (id: number) =>
    request<{ message: string }>(`/admin/contract-templates/${id}`, { method: "DELETE" }),

  // Parceiros (público)
  registerPartner: (data: {
    type: string; name: string; email: string; phone?: string;
    cpf?: string; cnpj?: string; companyName?: string;
    city?: string; state?: string; message?: string; howFound?: string;
    cnhUrl?: string; addressProofUrl?: string; selfieUrl?: string;
    crlvUrls?: string[]; contratoSocialUrl?: string;
    commercialRefs?: Array<{ name: string; phone: string; email: string }>;
    // KYC aprofundado
    occupation?: string; patrimony?: string; sourceOfFunds?: string;
    investmentIntent?: string; competitorDeclaration?: boolean;
    registrationGeoLat?: number; registrationGeoLng?: number; registrationGeoAccuracy?: number;
  }) => request<{ success: boolean; partner: { id: number }; message: string }>("/partners", { method: "POST", body: JSON.stringify(data) }),

  // Parceiros (admin)
  partners: () => request<ApiPartner[]>("/admin/partners"),
  updatePartnerStatus: (id: number, status: string) =>
    request<ApiPartner>(`/admin/partners/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  updatePartnerDocStatus: (id: number, field: string, status: string) =>
    request<ApiPartner>(`/admin/partners/${id}/doc-status`, { method: "PATCH", body: JSON.stringify({ field, status }) }),
  deletePartner: (id: number) =>
    request<{ message: string }>(`/admin/partners/${id}`, { method: "DELETE" }),

  // Candidatos investidores (admin) — gating de aprovação
  investorApplications: () => request<ApiInvestorApplication[]>("/admin/investor-applications"),
  investorApplication: (id: number) => request<ApiInvestorApplication>(`/admin/investor-applications/${id}`),
  reviewInvestorApplication: (id: number) =>
    request<{ id: number; approvalStatus: string }>(`/admin/investor-applications/${id}/review`, { method: "PATCH" }),
  approveInvestorApplication: (id: number, data: { approvedBy: string; kycNotes?: string; temporaryPassword?: string }) =>
    request<{ id: number; name: string; email: string; approvalStatus: string; message: string }>(
      `/admin/investor-applications/${id}/approve`, { method: "PATCH", body: JSON.stringify(data) }
    ),
  rejectInvestorApplication: (id: number, data: { rejectedReason?: string; kycNotes?: string }) =>
    request<{ id: number; approvalStatus: string }>(
      `/admin/investor-applications/${id}/reject`, { method: "PATCH", body: JSON.stringify(data) }
    ),
  updateInvestorNotes: (id: number, kycNotes: string) =>
    request<{ id: number; kycNotes: string }>(
      `/admin/investor-applications/${id}/notes`, { method: "PATCH", body: JSON.stringify({ kycNotes }) }
    ),
  resetInvestorPassword: (id: number, newPassword: string) =>
    request<{ message: string; email: string }>(
      `/admin/investor-applications/${id}/reset-password`, { method: "PATCH", body: JSON.stringify({ newPassword }) }
    ),

  // Reservas (público)
  createReservation: (data: {
    name: string; email: string; phone: string; cpf?: string;
    vehicleType: string; passengerCount: number;
    startDate: string; endDate: string; departureTime: string; returnTime?: string;
    originAddress: string; destinationAddress: string;
    useAtDestination: boolean; driveAtDestination: boolean;
    luggageInfo?: string; eventType?: string; priority: string;
    hasBudget: boolean; budgetPhotoUrls?: string[];
    coastalInfo?: string; notes?: string; paymentMethod?: string;
    honeypot?: string;
    geoLat?: number; geoLng?: number; geoAccuracy?: number;
  }) => request<{ success: boolean; id: number }>("/reservations", { method: "POST", body: JSON.stringify(data) }),
  getReservationForPayment: (id: number) =>
    request<ApiReservation & { alreadyPaid?: boolean }>(`/reservations/${id}/pay`),
  createPaymentLink: (id: number, gateway: "stripe" | "mercadopago" | "infinitepay") =>
    request<{ checkoutUrl: string }>(`/reservations/${id}/pay/${gateway}`, { method: "POST" }),

  // Reservas (admin)
  reservations: () => request<ApiReservation[]>("/admin/reservations"),
  updateReservation: (id: number, data: Partial<ApiReservation>) =>
    request<ApiReservation>(`/admin/reservations/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteReservation: (id: number) =>
    request<{ message: string }>(`/admin/reservations/${id}`, { method: "DELETE" }),
  generateAdminPaymentLink: (id: number, gateway: "stripe" | "mercadopago" | "infinitepay") =>
    request<{ checkoutUrl: string; gateway: string }>(
      `/admin/reservations/${id}/generate-payment-link`, { method: "POST", body: JSON.stringify({ gateway }) }
    ),

  // Catálogo de veículos (investidor aprovado)
  vehicleListings: () => request<ApiVehicleListing[]>("/investor/vehicle-listings"),

  // Catálogo de veículos (admin)
  adminVehicleListings: () => request<ApiVehicleListing[]>("/admin/vehicle-listings"),
  createAdminVehicleListing: (data: Partial<ApiVehicleListing>) =>
    request<ApiVehicleListing>("/admin/vehicle-listings", { method: "POST", body: JSON.stringify(data) }),
  updateAdminVehicleListing: (id: number, data: Partial<ApiVehicleListing>) =>
    request<ApiVehicleListing>(`/admin/vehicle-listings/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  updateAdminVehicleListingStatus: (id: number, status: string) =>
    request<{ id: number; status: string }>(`/admin/vehicle-listings/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  deleteAdminVehicleListing: (id: number) =>
    request<{ message: string }>(`/admin/vehicle-listings/${id}`, { method: "DELETE" }),

  // ─── Rastreamento de motoristas ──────────────────────────────────────────────
  trackingActive: () => request<Array<{
    trip: { id: number; vehiclePlate: string | null; vehicleModel: string | null; trackerUrl: string | null; startedAt: string };
    driver: { id: number; name: string; phone: string } | null;
    lastLocation: { lat: number; lng: number; accuracy: number | null; speed: number | null; timestamp: string } | null;
  }>>("/admin/tracking/active"),

  trackingDrivers: () => request<Array<{
    id: number; name: string; phone: string; trackerUrl: string | null;
    status: string; notes: string | null; active: boolean; createdAt: string;
  }>>("/admin/tracking/drivers"),

  createTrackingDriver: (data: { name: string; phone: string; pin: string; trackerUrl?: string | null; notes?: string | null }) =>
    request<{ id: number; name: string; phone: string }>("/admin/tracking/drivers", { method: "POST", body: JSON.stringify(data) }),

  updateTrackingDriver: (id: number, data: { name?: string; phone?: string; pin?: string; trackerUrl?: string | null; notes?: string | null; active?: boolean }) =>
    request<{ id: number; name: string; phone: string }>(`/admin/tracking/drivers/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  deleteTrackingDriver: (id: number) =>
    request<{ ok: boolean }>(`/admin/tracking/drivers/${id}`, { method: "DELETE" }),

  setVehicleTrackerUrl: (vehicleId: number, trackerUrl: string | null) =>
    request<{ id: number }>(`/admin/tracking/vehicles/${vehicleId}/tracker-url`, { method: "PATCH", body: JSON.stringify({ trackerUrl }) }),

  // Endereços Favoritos (investidor autenticado)
  favorites: () =>
    request<Array<{ id: number; label: string; lat: string; lon: string; nickname?: string }>>("/investor/favorites"),
  addFavorite: (data: { label: string; lat: string; lon: string; nickname?: string }) =>
    request<{ id: number; label: string; lat: string; lon: string; nickname?: string }>("/investor/favorites", {
      method: "POST", body: JSON.stringify(data),
    }),
  removeFavorite: (label: string) =>
    request<{ ok: boolean }>(`/investor/favorites/${encodeURIComponent(label)}`, { method: "DELETE" }),

  // Endereços Favoritos Anônimos (token via cookie, sem login)
  anonFavorites: () =>
    request<Array<{ id: number; label: string; lat: string; lon: string; nickname?: string }>>("/favorites/anon", { credentials: "include" }),
  addAnonFavorite: (data: { label: string; lat: string; lon: string; nickname?: string }) =>
    request<{ id: number; label: string; lat: string; lon: string; nickname?: string }>("/favorites/anon", {
      method: "POST", body: JSON.stringify(data), credentials: "include",
    }),
  removeAnonFavorite: (label: string) =>
    request<{ ok: boolean }>(`/favorites/anon/${encodeURIComponent(label)}`, { method: "DELETE", credentials: "include" }),
  replaceAnonFavorites: (items: Array<{ label: string; lat: string; lon: string; nickname?: string }>) =>
    request<{ ok: boolean }>("/favorites/anon", { method: "PUT", body: JSON.stringify(items), credentials: "include" }),

  // OTP
  otpSend: (email: string) =>
    request<{ sent: boolean }>("/auth/otp/send", { method: "POST", body: JSON.stringify({ email }) }),
  otpVerify: (email: string, code: string) =>
    request<{ token: string; investor: { id: number; name: string; email: string; approvalStatus: ApprovalStatus } }>(
      "/auth/otp/verify",
      { method: "POST", body: JSON.stringify({ email, code }) },
    ),

  // Seed
  seed: () => request<{ message: string; investorEmail?: string; password?: string }>("/seed", { method: "POST" }),

  // Blog público
  blogPosts: () => request<ApiBlogPost[]>("/blog/posts"),

  // Blog admin
  blogAdminPosts: () => request<ApiBlogPost[]>("/blog/admin/posts"),
  createBlogPost: (data: { title: string; content: string; excerpt?: string; image?: string; category?: string; published?: boolean }) =>
    request<ApiBlogPost>("/blog/posts", { method: "POST", body: JSON.stringify(data) }),
  updateBlogPost: (id: number, data: Partial<ApiBlogPost>) =>
    request<ApiBlogPost>(`/blog/posts/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteBlogPost: (id: number) =>
    request<{ message: string }>(`/blog/posts/${id}`, { method: "DELETE" }),
  toggleBlogPost: (id: number) =>
    request<ApiBlogPost>(`/blog/posts/${id}/toggle`, { method: "PATCH" }),

  syncBlogFromWP: () =>
    request<{ imported: number; skipped: number; total: number; posts: Array<{ title: string; slug: string }> }>(
      "/soro/sync-from-wp", { method: "POST" }
    ),
};
