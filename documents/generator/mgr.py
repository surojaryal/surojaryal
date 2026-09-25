import csv,re,json,subprocess,time,html,sys,os
rows=list(csv.reader(open('Haverton Recruitment/7 Launch Kit/Target Providers Import.csv',encoding='utf-8')))[1:]
out=json.load(open('mgr.json')) if os.path.exists('mgr.json') else {}
for r in rows:
    locid=r[4].split()[0]
    if locid in out: continue
    t=subprocess.run(['curl','-sSL','-m','30','-A','Mozilla/5.0','https://www.cqc.org.uk/location/'+locid],capture_output=True,text=True,errors='ignore').stdout
    people=[tuple(html.unescape(x).strip() for x in m) for m in re.findall(r'who-runs-service">([^<]+)<br\s*/?>\s*([^<]+)</p>',t)]
    out[locid]=people
    time.sleep(0.7)
    if len(out)%25==0: json.dump(out,open('mgr.json','w')); print(len(out),flush=True)
json.dump(out,open('mgr.json','w'));print('done',len(out))
