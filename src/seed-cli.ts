import { seed } from './seed';
(async ()=>{
  try {
    const out = await seed();
    console.log('Seed result:', out);
  } catch(err) {
    console.error(err);
    process.exit(1);
  }
})();
