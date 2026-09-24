const root = process.argv[2];
const mods = process.argv.slice(3);
(async () => {
  const jobs = mods.flatMap(m => require("./" + m)(root));
  const files = await Promise.all(jobs);
  files.forEach(f => console.log("built", f.replace(root + "/", "")));
})().catch(e => { console.error(e); process.exit(1); });
