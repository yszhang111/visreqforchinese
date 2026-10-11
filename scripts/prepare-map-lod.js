'use strict';
const fs=require('node:fs'),path=require('node:path');
const topojson=require('../dist/assets/topojson.min.js'),d3=require('../dist/assets/d3.min.js');
const directory=path.join(__dirname,'../dist/assets');
const original=JSON.parse(fs.readFileSync(path.join(directory,'world.json'),'utf8'));
const supplement=JSON.parse(fs.readFileSync(path.join(directory,'small-country-boundaries.json'),'utf8'));
const correctedIds=new Set(supplement.features.map(f=>f.id));
const decoded=original.arcs.map(arc=>{let x=0,y=0;return arc.map(([dx,dy])=>[x+=dx,y+=dy]);});
const [sx,sy]=original.transform.scale;
function references(geometry){return geometry.arcs.flat(Infinity).map(id=>id<0?~id:id);}
const protectedArcs=new Set();
for(const geometry of original.objects.countries.geometries){
  if(correctedIds.has(geometry.id))continue;
  const feature=topojson.feature(original,geometry),bounds=d3.geoBounds(feature);
  if(bounds[1][0]-bounds[0][0]<1&&bounds[1][1]-bounds[0][1]<1)references(geometry).forEach(id=>protectedArcs.add(id));
}
function simplify(points,epsilon){
  if(points.length<12)return points;
  const keep=new Uint8Array(points.length);keep[0]=keep[points.length-1]=1;
  const stack=[[0,points.length-1]],limit=epsilon*epsilon;
  while(stack.length){
    const [start,end]=stack.pop(),a=points[start],b=points[end],dx=(b[0]-a[0])*sx,dy=(b[1]-a[1])*sy,length=dx*dx+dy*dy;
    let farthest=-1,max=limit;
    for(let i=start+1;i<end;i++){
      const px=(points[i][0]-a[0])*sx,py=(points[i][1]-a[1])*sy,t=length?Math.max(0,Math.min(1,(px*dx+py*dy)/length)):0;
      const distance=(px-t*dx)**2+(py-t*dy)**2;
      if(distance>max){max=distance;farthest=i;}
    }
    if(farthest!==-1){keep[farthest]=1;stack.push([start,farthest],[farthest,end]);}
  }
  const result=points.filter((_,i)=>keep[i]);
  if(points[0][0]===points.at(-1)[0]&&points[0][1]===points.at(-1)[1]&&result.length<4)return points;
  return result;
}
function encode(points){let x=0,y=0;return points.map(([nextX,nextY])=>{const delta=[nextX-x,nextY-y];x=nextX;y=nextY;return delta;});}
for(const [name,epsilon] of [['overview',.045],['regional',.018]]){
  const simplified=decoded.map((points,id)=>protectedArcs.has(id)?points:simplify(points,epsilon));
  const topology={...original,objects:{countries:original.objects.countries},arcs:simplified.map(encode)};
  for(const geometry of original.objects.countries.geometries){
    if(correctedIds.has(geometry.id))continue;
    const polygons=geometry.type==='Polygon'?[geometry.arcs]:geometry.arcs;
    for(const arcs of polygons){
      const polygon={type:'Polygon',arcs},before=d3.geoArea(topojson.feature(original,polygon)),after=d3.geoArea(topojson.feature(topology,polygon));
      if(after===0&&before>0||(before>2*Math.PI)!==(after>2*Math.PI))for(const id of references(polygon))topology.arcs[id]=original.arcs[id];
    }
  }
  // Keep original arcs for any ring whose orientation degenerates after simplification.
  for(const feature of topojson.feature(topology,topology.objects.countries).features){
    if(correctedIds.has(feature.id))continue;
    const area=d3.geoArea(feature);
    if(area<=0||area>2*Math.PI){const geometry=original.objects.countries.geometries.find(g=>g.id===feature.id);for(const id of references(geometry))topology.arcs[id]=original.arcs[id];}
  }
  for(const feature of topojson.feature(topology,topology.objects.countries).features){if(!correctedIds.has(feature.id)){const area=d3.geoArea(feature);if(area<=0||area>2*Math.PI)throw new Error('Invalid simplified boundary: '+feature.properties.name);}}
  const output=JSON.stringify(topology);fs.writeFileSync(path.join(directory,`world-${name}.json`),output);
  console.log(JSON.stringify({level:name,points:topology.arcs.reduce((n,a)=>n+a.length,0),bytes:output.length,originalPoints:decoded.reduce((n,a)=>n+a.length,0)}));
}
