import WebspaceHosting from './model';

export async function upsertHosting(items: any[], companyId: string) {
  const ops = items.map(it => ({
    updateOne: {
      filter: { companyId, pleskId: String(it.id) },
      update: {
        $set: {
          pleskId: String(it.id),
          domain: it.domain ?? it.name,
          plan: it.plan ?? it.servicePlan,
          status: it.status ?? 'unknown',
          companyId,
          lastSyncAt: new Date()
        }
      },
      upsert: true
    }
  }));
  if (ops.length) await WebspaceHosting.bulkWrite(ops);
}
