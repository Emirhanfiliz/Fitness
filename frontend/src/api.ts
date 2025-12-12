const API_BASE = "http://35.189.234.33:4000/api";


export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error("Giriş başarısız");
  }
  return res.json() as Promise<{ token: string }>;
}

export async function fetchDashboard(token: string) {
  const res = await fetch(`${API_BASE}/admin/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Dashboard verisi alınamadı");
  return res.json();
}

export async function fetchMembers(token: string) {
  const res = await fetch(`${API_BASE}/admin/members`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Üyeler alınamadı");
  return res.json();
}

export async function createMember(
  token: string,
  data: { name: string; email: string; phone: string; password: string; durationMonths: number }
) {
  const res = await fetch(`${API_BASE}/admin/members`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Üye oluşturulamadı");
  return res.json();
}

export async function deleteMember(token: string, id: number) {
  const res = await fetch(`${API_BASE}/admin/members/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Üye silinemedi");
}

export async function fetchStock(token: string) {
  const res = await fetch(`${API_BASE}/admin/stock`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Stok alınamadı");
  return res.json();
}

export async function createStock(
  token: string,
  data: { name: string; quantity?: number; minQuantity?: number }
) {
  const res = await fetch(`${API_BASE}/admin/stock`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Stok oluşturulamadı");
  return res.json();
}

export async function updateStock(
  token: string,
  id: number,
  data: { name?: string; quantity?: number; minQuantity?: number }
) {
  const res = await fetch(`${API_BASE}/admin/stock/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Stok güncellenemedi");
  return res.json();
}

export async function deleteStock(token: string, id: number) {
  const res = await fetch(`${API_BASE}/admin/stock/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Stok silinemedi");
}

export async function fetchEmployees(token: string) {
  const res = await fetch(`${API_BASE}/admin/employees`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Çalışanlar alınamadı");
  return res.json();
}

export async function createEmployee(
  token: string,
  data: { name: string; role: string; phone: string; salary: number }
) {
  const res = await fetch(`${API_BASE}/admin/employees`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Çalışan oluşturulamadı");
  return res.json();
}

export async function toggleEmployeeActive(token: string, id: number) {
  const res = await fetch(`${API_BASE}/admin/employees/${id}/toggle`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Çalışan durumu güncellenemedi");
  return res.json();
}

export async function fetchEkipmanlar(token: string) {
  const res = await fetch(`${API_BASE}/admin/ekipmanlar`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Ekipmanlar alınamadı");
  return res.json();
}

export async function createEkipman(
  token: string,
  data: { ad: string; tip: string; sonBakimTarihi: string; bakimAraligiAy?: number }
) {
  const res = await fetch(`${API_BASE}/admin/ekipmanlar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Ekipman oluşturulamadı");
  return res.json();
}

export async function updateEkipman(
  token: string,
  id: number,
  data: { ad?: string; tip?: string; sonBakimTarihi?: string; bakimAraligiAy?: number; durum?: string }
) {
  const res = await fetch(`${API_BASE}/admin/ekipmanlar/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Ekipman güncellenemedi");
  return res.json();
}

export async function deleteEkipman(token: string, id: number) {
  const res = await fetch(`${API_BASE}/admin/ekipmanlar/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Ekipman silinemedi");
}

export async function bakimYap(token: string, id: number, bakimAraligiAy: number) {
  const res = await fetch(`${API_BASE}/admin/ekipmanlar/${id}/bakim-yap`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ bakimAraligiAy }),
  });
  if (!res.ok) throw new Error("Bakım kaydedilemedi");
  return res.json();
}

export async function getQrToken() {
  const res = await fetch(`${API_BASE}/auth/qr-token`);
  if (!res.ok) throw new Error("QR token alınamadı");
  return res.json() as Promise<{ token: string; expiresIn: number }>;
}

export async function qrLogin(token: string, email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/qr-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, email, password }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Giriş başarısız");
  }
  return res.json() as Promise<{ success: boolean; message: string; member?: any }>;
}

export async function fetchLoginAnalytics(token: string) {
  const res = await fetch(`${API_BASE}/admin/analytics/logins`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Rapor verisi alınamadı");
  return res.json() as Promise<{
    weekly: { day: string; count: number }[];
    monthly: { month: string; count: number }[];
    hourly: { hour: number; count: number }[];
  }>;
}


