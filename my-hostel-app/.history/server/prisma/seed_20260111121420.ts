import prisma from '../src/prisma/client';

async function main() {
  console.log('Seeding database...');
  // Create a landlord user
  await prisma.user.upsert({ where: { email: 'landlord@example.com' }, update: {}, create: { email: 'landlord@example.com', password: 'seedpassword' } });

  // Room classes
  const classA = await prisma.roomClass.upsert({ where: { name: 'Underground' }, update: {}, create: { name: 'Underground', price: 18000 } });
  const classB = await prisma.roomClass.upsert({ where: { name: 'Standard' }, update: {}, create: { name: 'Standard', price: 20000 } });

  // Rooms
  for (let i = 1; i <= 15; i++) {
    await prisma.room.upsert({ where: { number: `U${String(i).padStart(2, '0')}` }, create: { number: `U${String(i).padStart(2, '0')}`, classId: classA.id }, update: {} });
  }
  for (let i = 1; i <= 60; i++) {
    await prisma.room.upsert({ where: { number: `R${String(i).padStart(3, '0')}` }, create: { number: `R${String(i).padStart(3, '0')}`, classId: classB.id }, update: {} });
  }

  // Tenants
  const t1 = await prisma.tenant.upsert({ where: { phoneNumber: '254700000001' }, update: {}, create: { name: 'Alice Mwangi', phoneNumber: '254700000001', room: { connect: { number: 'U01' } } } });
  const t2 = await prisma.tenant.upsert({ where: { phoneNumber: '254700000002' }, update: {}, create: { name: 'Brian Kimani', phoneNumber: '254700000002', room: { connect: { number: 'R001' } } } });

  await prisma.ledger.upsert({ where: { tenantId: t1.id }, update: {}, create: { tenantId: t1.id, totalBilled: 18000, currentBalance: 18000 } });
  await prisma.ledger.upsert({ where: { tenantId: t2.id }, update: {}, create: { tenantId: t2.id, totalBilled: 20000, currentBalance: 20000 } });

  console.log('Seeding complete');
}

main().catch((e)=>{ console.error(e); process.exit(1); }).finally(()=>prisma.$disconnect());
