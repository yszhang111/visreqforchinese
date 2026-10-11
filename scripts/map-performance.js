'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('C:/Users/92892/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:940},reducedMotion:'reduce'});
    await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});
    await page.locator('.country').first().waitFor();
    const geometry=await page.locator('.country').evaluateAll(elements=>({countries:elements.length,pathCharacters:elements.reduce((n,el)=>n+el.getAttribute('d').length,0)}));
    const measure=async(name,mode='wheel')=>page.evaluate(async ({name,mode})=>{
      const svg=document.getElementById('world-map'),samples=[],tasks=[];
      const observer=new PerformanceObserver(list=>tasks.push(...list.getEntries().map(e=>e.duration)));observer.observe({type:'longtask'});
      let last=performance.now();
      if(mode==='drag')svg.dispatchEvent(new MouseEvent('mousedown',{bubbles:true,cancelable:true,view:window,button:0,buttons:1,clientX:760,clientY:500}));
      for(let i=0;i<90;i++){
        await new Promise(resolve=>requestAnimationFrame(now=>{samples.push(now-last);last=now;resolve();}));
        if(mode==='drag')window.dispatchEvent(new MouseEvent('mousemove',{bubbles:true,cancelable:true,view:window,button:0,buttons:1,clientX:760+160*Math.sin(i/18),clientY:500+70*Math.sin(i/13)}));
        else svg.dispatchEvent(new WheelEvent('wheel',{bubbles:true,cancelable:true,view:window,clientX:620,clientY:500,deltaY:i<45?-12:12}));
      }
      if(mode==='drag')window.dispatchEvent(new MouseEvent('mouseup',{bubbles:true,cancelable:true,view:window,button:0,clientX:760+160*Math.sin(89/18),clientY:500+70*Math.sin(89/13)}));
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      observer.disconnect();samples.shift();samples.sort((a,b)=>a-b);
      return {name,frames:samples.length,medianMs:Math.round(samples[Math.floor(samples.length*.5)]*10)/10,p95Ms:Math.round(samples[Math.floor(samples.length*.95)]*10)/10,over33ms:samples.filter(ms=>ms>33).length,longTasks:tasks.length,maxTaskMs:Math.round(Math.max(0,...tasks))};
    },{name,mode});
    const overview=await measure('world overview');
    await page.getByRole('searchbox').fill('美国');await page.locator('#search-results [data-country="US"]').click();
    const focused=await measure('country focus');
    await page.getByRole('searchbox').fill('日本');await page.locator('#search-results [data-country="JP"]').click();
    const detailed=await measure('detailed coastline');
    const drag=await measure('drag detailed map','drag');
    const result={geometry,overview,focused,detailed,drag};
    const filename=process.argv[2]||'performance-results.json';
    fs.writeFileSync(path.join(__dirname,'..',filename),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
