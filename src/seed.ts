import { connectMongo } from './db/mongo';
import Role from './modules/roles/model';
import Company from './modules/companies/model';
import Operator from './modules/operators/model';
import { hashPin } from './utils/crypto';

async function main() {
  await connectMongo();

  // Crea azienda WebSpace
  const company = await Company.findOneAndUpdate(
    { slug: 'webspace' },
    { $setOnInsert: { name: 'Leopard WebSpace', type: 'webspace', slug: 'webspace' } },
    { new: true, upsert: true }
  );

  // Crea ruolo Admin con permessi ampi
  const adminRole = await Role.findOneAndUpdate(
    { name: 'Admin' },
    { $set: { permissions: ['*'] } },
    { new: true, upsert: true }
  );

  // Crea operatore admin
  const pinHash = await hashPin('1234'); // cambia subito in produzione
  const op = await Operator.findOneAndUpdate(
    { operatorCode: 'OP0001' },
    {
      $setOnInsert: {
        name: 'Admin',
        status: 'verified',
        pinHash,
        roles: [{ companyId: company._id, roleId: adminRole._id }]
      }
    },
    { new: true, upsert: true }
  );

  console.log('Seed completato:', { company: company._id, adminRole: adminRole._id, operator: op._id });
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
