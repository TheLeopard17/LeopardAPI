import { Request, Response } from "express";
import HostingModel from "./model";
import { listDomainsWithStatus } from "../plesk/client";

/** GET /v1/webspace/hosting
 * Legge DAL DB (veloce). Filtri/paginazione lato Mongo.
 */
export async function getList(req: Request, res: Response) {
  try {
    const companyId = String(req.query.companyId || "");
    if (!companyId) return res.status(400).json({ error: "companyId is required" });

    const q = String(req.query.q || "").trim();
    const status = String(req.query.status || "");
    const page = Math.max(parseInt(String(req.query.page || "1"), 10), 1);
    const pageSize = Math.min(Math.max(parseInt(String(req.query.pageSize || "25"), 10), 1), 200);

    const filter: any = { companyId };
    if (q) filter.domain = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    if (status && ["attivo","sospeso","in_attivazione","unknown"].includes(status)) filter.status = status;

    const total = await HostingModel.countDocuments(filter);
    const items = await HostingModel.find(filter)
      .sort({ domain: 1 })
      .skip((page-1)*pageSize)
      .limit(pageSize)
      .lean();

    return res.json({ items, total, page, pageSize });
  } catch (e:any) {
    return res.status(500).json({ error: e.message || "Internal error" });
  }
}

/** POST /v1/webspace/hosting/sync?companyId=...
 * Interroga Plesk: /domains + /domains/{id}/status, salva su Mongo (upsert).
 */
export async function syncNow(req: Request, res: Response) {
  try {
    const companyId = String(req.query.companyId || "");
    if (!companyId) return res.status(400).json({ error: "companyId is required" });

    const items = await listDomainsWithStatus(10);

    if (items.length) {
      const ops = items.map((it) => ({
        updateOne: {
          filter: { companyId, pleskId: it.pleskId },
          update: {
            $set: {
              companyId,
              pleskId: it.pleskId,
              domain: it.domain,
              status: it.status,
              lastStatusRaw: it.lastStatusRaw ?? null,
              lastSyncAt: new Date(),
            },
          },
          upsert: true,
        }
      }));
      await HostingModel.bulkWrite(ops, { ordered: false });
    }

    return res.json({ ok: true, count: items.length });
  } catch (e:any) {
    const status = e?.response?.status || 502;
    return res.status(status).json({ error: e?.message || "Sync failed" });
  }
}

/** (facoltativo) GET /v1/webspace/hosting/:id */
export async function getOne(req: Request, res: Response) {
  try {
    const id = String(req.params.id || "");
    const doc = await HostingModel.findById(id).lean();
    if (!doc) return res.status(404).json({ error: "Not found"});
    return res.json(doc);
  } catch (e:any) {
    return res.status(500).json({ error: e.message || "Internal error" });
  }
}
