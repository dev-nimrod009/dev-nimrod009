import prisma from '../src/prisma/client';

async function main() {
  console.log('Seeding database...');
  // Create a landlord user
  await prisma.user.upsert({ where: { email: 'landlord@example.com' }, update: {}, create: { email: 'landlord@example.com', password: 'seedpassword' } });

  // Room classes (Underground, Ground Floor, First Floor, Second Floor)
  const underground = await prisma.roomClass.upsert({ where: { name: 'Underground' }, update: {}, create: { name: 'Underground', price: 18000 } });
  const ground = await prisma.roomClass.upsert({ where: { name: 'Ground Floor' }, update: {}, create: { name: 'Ground Floor', price: 20000 } });
  const first = await prisma.roomClass.upsert({ where: { name: 'First Floor' }, update: {}, create: { name: 'First Floor', price: 20000 } });
  const second = await prisma.roomClass.upsert({ where: { name: 'Second Floor' }, update: {}, create: { name: 'Second Floor', price: 20000 } });

  // Rooms
  // Underground: U01..U05 (adjust if you prefer a different count)
  for (let i = 1; i <= 5; i++) {
    await prisma.room.upsert({ where: { number: `U${String(i).padStart(2, '0')}` }, create: { number: `U${String(i).padStart(2, '0')}`, classId: underground.id }, update: {} });
  }

  // Ground Floor: 15 rooms -> 101..115
  for (let i = 1; i <= 15; i++) {
    const num = `101`.slice(0, 0) + String(100 + i); // produce 101..115
    await prisma.room.upsert({ where: { number: num }, create: { number: num, classId: ground.id }, update: {} });
  }

  // First Floor: 22 rooms -> 201..222
  for (let i = 1; i <= 22; i++) {
    const num = String(200 + i);
    await prisma.room.upsert({ where: { number: num }, create: { number: num, classId: first.id }, update: {} });
  }

  // Second Floor: 16 rooms -> 301..316
  for (let i = 1; i <= 16; i++) {
    const num = String(300 + i);
    await prisma.room.upsert({ where: { number: num }, create: { number: num, classId: second.id }, update: {} });
  }

  // Tenants
  const t1 = await prisma.tenant.upsert({ where: { phoneNumber: '254700000001' }, update: {}, create: { name: 'Alice Mwangi', phoneNumber: '254700000001', room: { connect: { number: 'U01' } } } });
  const t2 = await prisma.tenant.upsert({ where: { phoneNumber: '254700000002' }, update: {}, create: { name: 'Brian Kimani', phoneNumber: '254700000002', room: { connect: { number: 'R001' } } } });

  await prisma.ledger.upsert({ where: { tenantId: t1.id }, update: {}, create: { tenantId: t1.id, totalBilled: 18000, currentBalance: 18000 } });
  await prisma.ledger.upsert({ where: { tenantId: t2.id }, update: {}, create: { tenantId: t2.id, totalBilled: 20000, currentBalance: 20000 } });

  console.log('Seeding complete');
}

main().catch((e)=>{ console.error(e); process.exit(1); }).finally(()=>prisma.$disconnect());
