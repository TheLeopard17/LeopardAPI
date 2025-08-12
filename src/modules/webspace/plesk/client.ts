import axios, { AxiosRequestConfig } from "axios";
import https from "https";

const baseURL = process.env.PLESK_BASE_URL!;
const PLESK_API_TOKEN = process.env.PLESK_API_TOKEN || "";
const PLESK_BASIC_USER = process.env.PLESK_BASIC_USER || "";
const PLESK_BASIC_PASS = process.env.PLESK_BASIC_PASS || "";

const httpsAgent = new https.Agent({ rejectUnauthorized: false }); // solo DEV

export type DomainWithStatus = {
  pleskId: string;
  domain: string;
  status: "attivo" | "sospeso" | "in_attivazione" | "unknown";
  lastStatusRaw?: any;
};

function headerStrategy(): Record<string,string> {
  if (PLESK_API_TOKEN) return { Authorization: `Bearer ${PLESK_API_TOKEN}` };
  if (PLESK_BASIC_USER && PLESK_BASIC_PASS) {
    const b64 = Buffer.from(`${PLESK_BASIC_USER}:${PLESK_BASIC_PASS}`).toString("base64");
    return { Authorization: `Basic ${b64}` };
  }
  return {};
}

async function pleskGet<T=any>(url: string, cfg: Partial<AxiosRequestConfig> = {}) {
  const res = await axios.request<T>({
    baseURL, url, method: "GET",
    headers: { Accept: "application/json", "Content-Type": "application/json", ...headerStrategy(), ...(cfg.headers||{}) },
    httpsAgent, timeout: 20000, ...cfg
  });
  return res.data as T;
}

export function mapPleskStatusToUi(input: any): DomainWithStatus["status"] {
  const n = (typeof input === "number" ? input : Number(String(input)));
  if (!Number.isNaN(n)) {
    if (n === 0) return "attivo";
    if (n === 4) return "in_attivazione";
    if (n === 1 || n === 2 || n === 16) return "sospeso";
  }
  const s = String(input || "").toLowerCase();
  if (s === "active" || s === "attivo") return "attivo";
  if (s.includes("suspend") || s === "sospeso") return "sospeso";
  if (s.includes("prepar") || s.includes("provision") || s.includes("create")) return "in_attivazione";
  return "unknown";
}

export async function listDomains(): Promise<Array<{ id: string; name: string }>> {
  const data = await pleskGet<any>("/api/v2/domains");
  const arr: any[] = Array.isArray(data) ? data : Array.isArray(data?.domains) ? data.domains : [];
  return arr.map((d: any) => ({
    id: String(d.id ?? d.ID ?? d.domainId ?? d.site_id ?? ""),
    name: String(d.name ?? d.domain ?? d.fqdn ?? ""),
  })).filter(d => d.id && d.name);
}

export async function getDomainStatus(domainId: string) {
  const data = await pleskGet<any>(`/api/v2/domains/${encodeURIComponent(domainId)}/status`);
  const rawStatus = data?.status ?? data?.statusId ?? data?.state ?? data;
  return { statusUi: mapPleskStatusToUi(rawStatus), raw: data };
}

async function inBatches<T,R>(items: T[], size: number, worker: (chunk: T[]) => Promise<R[]>): Promise<R[]> {
  const out: R[] = [];
  for (let i=0;i<items.length;i+=size) {
    const res = await worker(items.slice(i, i+size));
    out.push(...res);
  }
  return out;
}

export async function listDomainsWithStatus(batchSize = 10): Promise<DomainWithStatus[]> {
  const domains = await listDomains();
  if (!domains.length) return [];

  const results = await inBatches(domains, batchSize, async (chunk) => {
    const promises = chunk.map(async (d): Promise<DomainWithStatus> => {
      try {
        const s = await getDomainStatus(d.id);
        return { pleskId: d.id, domain: d.name, status: s.statusUi, lastStatusRaw: s.raw };
      } catch (e) {
        return { pleskId: d.id, domain: d.name, status: "unknown" as const, lastStatusRaw: { error: (e as Error).message } };
      }
    });
    return Promise.all(promises);
  });

  return results;
}
