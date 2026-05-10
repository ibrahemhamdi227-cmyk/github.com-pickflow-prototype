
const state = {
  operator:"Ibrahim", station:"WS1", selectedItem:null, activeRequest:null, completedPicks:1234,
  autoAssign:true, trafficMode:"Balanced", showTraffic:false,
  inventory:[
    {sku:"ACME-12MM-BOLT", name:"ACME Bolt 12mm", pod:"P332", bin:"B2-14", qty:48, priority:"High"},
    {sku:"WIRE-USB-C-2M", name:"USB-C Cable 2m", pod:"P119", bin:"C3-07", qty:120, priority:"Medium"},
    {sku:"SENSOR-PROX-M8", name:"Proximity Sensor M8", pod:"P207", bin:"A1-03", qty:22, priority:"High"},
    {sku:"GLOVE-NITRILE-L", name:"Nitrile Gloves Large", pod:"P305", bin:"A3-11", qty:260, priority:"Low"},
    {sku:"LABEL-THERMAL-4X6", name:"Thermal Labels 4x6", pod:"P142", bin:"C1-20", qty:600, priority:"Low"},
    {sku:"MOTOR-DRV-24V", name:"24V Motor Driver", pod:"P410", bin:"B1-06", qty:15, priority:"Medium"},
    {sku:"FUSE-10A-MINI", name:"Mini Fuse 10A", pod:"P088", bin:"B3-19", qty:95, priority:"Medium"}
  ],
  robots:[
    {id:"RBT-01", status:"Idle", battery:76, x:25, y:45, task:"Available"},
    {id:"RBT-02", status:"Working", battery:45, x:74, y:53, task:"At WS2"},
    {id:"RBT-03", status:"En Route", battery:62, x:52, y:37, task:"To WS3"},
    {id:"RBT-04", status:"Idle", battery:88, x:34, y:73, task:"Aisle B2"},
    {id:"RBT-05", status:"Charging", battery:100, x:88, y:86, task:"Charge 1"},
    {id:"RBT-06", status:"Idle", battery:31, x:18, y:68, task:"Available"}
  ],
  stations:[
    {id:"WS1", status:"Active", pending:0, x:93, y:24},
    {id:"WS2", status:"Active", pending:1, x:93, y:48},
    {id:"WS3", status:"Waiting", pending:3, x:93, y:72},
    {id:"WS4", status:"Idle", pending:0, x:8, y:88}
  ],
  requests:[
    {id:1288, station:"WS2", item:"USB-C Cable 2m", pod:"P119", priority:"Medium", status:"Assigned to RBT-02", eta:"01:12"},
    {id:1289, station:"WS3", item:"Thermal Labels 4x6", pod:"P142", priority:"Low", status:"Queued", eta:"02:45"}
  ],
  feed:["System online","Ibrahim logged into workstation WS1"]
};

function $(id){return document.getElementById(id)}
function login(){
  state.operator = $("loginName").value || "Ibrahim";
  state.station = $("loginStation").value;
  $("operatorName").innerText = state.operator;
  document.querySelector(".avatar").innerText = initials(state.operator);
  $("defaultStation").value = state.station;
  $("loginScreen").classList.add("hidden");
  $("app").classList.remove("hidden");
  addFeed(`${state.operator} logged into workstation ${state.station}`);
  renderAll();
}
function initials(n){return n.split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase()}
function showPage(page){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active-page"));
  $(page).classList.add("active-page");
  document.querySelectorAll(".nav").forEach(n=>n.classList.toggle("active", n.dataset.page===page));
  const titles = {
    dashboard:["Dashboard","Real-time overview of robots, pods, workstations and requests"],
    callpod:["Call Pod","Search an item and call its storage pod to your workstation"],
    picking:["Picking","Confirm picked quantity and release the pod"],
    map:["Live Map","Simulated warehouse map with robot, pod and workstation positions"],
    robots:["Robots","Fleet manager and robot battery/task status"],
    inventory:["Inventory","Item, SKU, pod and bin lookup"],
    workstations:["Workstations","Station status and active queues"],
    requests:["Requests","Pod request queue and dispatch status"],
    reports:["Reports","Prototype operational performance"],
    settings:["Settings","Local prototype settings"]
  };
  $("pageTitle").innerText = titles[page][0]; $("pageSubtitle").innerText = titles[page][1];
  renderAll();
}
function addFeed(msg){ state.feed.unshift(msg); state.feed = state.feed.slice(0,30); renderFeed(); }
function clearFeed(){state.feed=[]; renderFeed()}
function updateClock(){
  const d = new Date();
  $("clockTime").innerText = d.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
  $("clockDate").innerText = d.toLocaleDateString([], {weekday:"short", month:"short", day:"numeric"});
}
setInterval(updateClock,1000);

function renderAll(){
  updateClock(); renderKPIs(); renderMaps(); renderRobots(); renderRequests(); renderStations(); renderInventory(); renderFeed(); renderPickPanel(); renderReports();
}
function renderKPIs(){
  const active = state.robots.filter(r=>r.status!=="Charging").length;
  $("kpiRobots").innerText = `${active} / ${state.robots.length}`;
  $("robotUtil").innerText = `${Math.round(active/state.robots.length*100)}% in operation`;
  $("kpiRequests").innerText = state.requests.filter(r=>!r.status.includes("Completed")).length;
  $("urgentCount").innerText = `${state.requests.filter(r=>r.priority==="High").length} high priority`;
  $("kpiTransit").innerText = state.robots.filter(r=>r.status==="En Route").length;
  $("kpiPicked").innerText = state.completedPicks.toLocaleString();
}
function renderMap(targetId, mini=false){
  const el=$(targetId); if(!el)return; el.innerHTML="";
  const zones=[["A1",8,8],["A2",8,34],["A3",8,60],["B1",38,8],["B2",38,34],["B3",38,60],["C1",68,8],["C2",68,34],["C3",68,60]];
  zones.forEach(z=>{const d=document.createElement("div");d.className="zone";d.style.left=z[1]+"%";d.style.top=z[2]+"%";d.style.width="13%";d.style.height="18%";d.innerText=z[0];el.appendChild(d)});
  state.stations.forEach(s=>{const d=document.createElement("div");d.className="station";d.style.left=s.x+"%";d.style.top=s.y+"%";d.innerHTML=`👤<br>${s.id}`;el.appendChild(d)});
  state.inventory.slice(0,5).forEach((p,i)=>{const d=document.createElement("div");d.className="pod-marker";d.style.left=(18+i*14)+"%";d.style.top=(82-(i%2)*13)+"%";d.innerText=p.pod;el.appendChild(d)});
  if(state.showTraffic){[[44,41,20,18],[59,18,17,14]].forEach(t=>{const d=document.createElement("div");d.className="traffic";d.style.left=t[0]+"%";d.style.top=t[1]+"%";d.style.width=t[2]+"%";d.style.height=t[3]+"%";el.appendChild(d)})}
  state.robots.forEach(r=>{const d=document.createElement("div");d.className=`robot ${classFor(r.status)}`;d.style.left=r.x+"%";d.style.top=r.y+"%";d.title=`${r.id} - ${r.status}`;d.innerText="🤖";el.appendChild(d)});
}
function renderMaps(){renderMap("dashboardMap",true);renderMap("fullMap",false)}
function classFor(status){return status==="En Route"?"route":status==="Working"?"working":status==="Charging"?"charging":"idle"}
function renderRobots(){
  const rows = state.robots.map(r=>`<div class="robot-row"><span><b>${r.id}</b><br><small>${r.task}</small></span><span class="status ${r.status==='Idle'?'ok':r.status==='Charging'?'warn':''}">${r.status}</span><span>🔋 ${r.battery}%</span></div>`).join("");
  $("robotList").innerHTML=rows;
  $("robotsGrid").innerHTML = state.robots.map(r=>`<div class="robot-card"><h4>${r.id}</h4><p>Status: <b>${r.status}</b></p><p>Task: ${r.task}</p><div class="battery"><span style="width:${r.battery}%"></span></div><p>Battery: ${r.battery}%</p><button onclick="manualAssign('${r.id}')">Manual Assign</button></div>`).join("");
}
function renderRequests(){
  const table = `<table><thead><tr><th>ID</th><th>Station</th><th>Item / Pod</th><th>Priority</th><th>Status</th><th>ETA</th></tr></thead><tbody>` +
    state.requests.map(r=>`<tr><td>#${r.id}</td><td>${r.station}</td><td>${r.item}<br><small>${r.pod}</small></td><td><span class="pill ${r.priority.toLowerCase()}">${r.priority}</span></td><td>${r.status}</td><td>${r.eta}</td></tr>`).join("") + `</tbody></table>`;
  $("requestTable").innerHTML=table; $("requestsFullTable").innerHTML=table;
}
function renderStations(){
  $("stationList").innerHTML = state.stations.map(s=>`<div class="station-row"><span><b>${s.id}</b> <small>${s.status}</small></span><span>${s.pending} pending</span></div>`).join("");
  $("workstationGrid").innerHTML = state.stations.map(s=>`<div class="station-card"><h4>${s.id}</h4><p>Status: <b>${s.status}</b></p><p>Pending: ${s.pending}</p><button onclick="changeStation('${s.id}')">Use this station</button></div>`).join("");
}
function renderInventory(){
  const filter=($("inventoryFilter")?.value||"").toLowerCase();
  const data=state.inventory.filter(i=>(i.name+i.sku+i.pod+i.bin).toLowerCase().includes(filter));
  $("inventoryTable").innerHTML=`<table><thead><tr><th>SKU</th><th>Item</th><th>Pod</th><th>Bin</th><th>Qty</th><th></th></tr></thead><tbody>`+
    data.map(i=>`<tr><td>${i.sku}</td><td>${i.name}</td><td>${i.pod}</td><td>${i.bin}</td><td>${i.qty}</td><td><button onclick="selectItem('${i.sku}');showPage('callpod')">Call Pod</button></td></tr>`).join("")+`</tbody></table>`;
}
function renderFeed(){ if($("activityFeed")) $("activityFeed").innerHTML = state.feed.map(f=>`<li>${f}</li>`).join(""); }
function renderReports(){
  $("performanceBars").innerHTML = [["WS1",88],["WS2",62],["WS3",74],["WS4",38]].map(b=>`<div class="bar-row"><span>${b[0]} pick rate</span><div class="bar"><i style="width:${b[1]}%"></i></div></div>`).join("");
}
function focusSearch(){$("itemSearch").focus()}
function searchInventory(){
  const q=$("itemSearch").value.toLowerCase();
  const results=state.inventory.filter(i=>(i.name+i.sku+i.pod+i.bin).toLowerCase().includes(q)).slice(0,5);
  $("searchResults").innerHTML = results.map(i=>`<div class="result-row"><span><b>${i.name}</b><br><small>${i.sku} · ${i.pod} · Bin ${i.bin} · ${i.qty} EA</small></span><button onclick="selectItem('${i.sku}')">Select</button></div>`).join("") || `<div class="empty-state">No matching item found.</div>`;
}
function selectItem(sku){
  const item=state.inventory.find(i=>i.sku===sku); state.selectedItem=item;
  $("selectedItemBox").innerHTML=`<div class="selected-card"><h4>${item.name}</h4><p><b>SKU:</b> ${item.sku}</p><p><b>Pod:</b> ${item.pod}</p><p><b>Bin:</b> ${item.bin}</p><p><b>Available:</b> ${item.qty} EA</p><button onclick="requestPod()">Call ${item.pod} to ${state.station}</button></div>`;
  addFeed(`Item selected: ${item.name} in ${item.pod}`);
}
function requestPod(){
  if(!state.selectedItem)return;
  const robot=state.robots.filter(r=>r.status==="Idle").sort((a,b)=>b.battery-a.battery)[0] || state.robots[0];
  robot.status="En Route"; robot.task=`To ${state.station} with ${state.selectedItem.pod}`; robot.x=45; robot.y=42;
  const req={id:Math.max(...state.requests.map(r=>r.id),1289)+1,station:state.station,item:state.selectedItem.name,pod:state.selectedItem.pod,priority:state.selectedItem.priority,status:`Assigned to ${robot.id}`,eta:"00:45",robot:robot.id};
  state.activeRequest=req; state.requests.unshift(req);
  $("currentRequestBox").innerHTML=`<div class="selected-card"><h4>Pod Requested</h4><p>${req.pod} is being delivered by <b>${robot.id}</b>.</p><p>ETA: <b>00:45</b></p><button class="ghost" onclick="cancelRequest()">Cancel Request</button></div>`;
  addFeed(`${robot.id} dispatched to bring ${req.pod} to ${state.station}`);
  renderAll();
  setTimeout(()=>podArrived(robot.id),2500);
}
function podArrived(robotId){
  if(!state.activeRequest)return;
  const robot=state.robots.find(r=>r.id===robotId); const station=state.stations.find(s=>s.id===state.station);
  robot.status="Working"; robot.task=`At ${state.station}`; robot.x=station.x-4; robot.y=station.y+2;
  state.activeRequest.status=`Arrived at ${state.station}`; state.activeRequest.eta="Ready";
  $("currentRequestBox").innerHTML=`<div class="selected-card"><h4>Pod Arrived</h4><p>${state.activeRequest.pod} has arrived at ${state.station}.</p><button onclick="showPage('picking')">Open Pick Screen</button></div>`;
  addFeed(`${state.activeRequest.pod} arrived at ${state.station}`);
  renderAll();
}
function renderPickPanel(){
  if(!state.activeRequest || !state.selectedItem){$("pickPanel").innerHTML=`<div class="empty-state">No pod is ready to pick.</div>`; $("releasePanel").innerHTML=`<div class="empty-state">Confirm a pick before releasing the pod.</div>`; return;}
  const ready=state.activeRequest.eta==="Ready";
  $("pickPanel").innerHTML = ready ? `<div class="selected-card"><h4>${state.selectedItem.name}</h4><p>Pod ${state.selectedItem.pod} · Bin ${state.selectedItem.bin}</p><p>Required Quantity</p><div class="qty-row"><button onclick="adjustQty(-1)">−</button><input id="pickQty" value="5"/><button onclick="adjustQty(1)">+</button></div><button onclick="confirmPick()">Confirm Pick</button></div>` : `<div class="empty-state">Pod is still en route.</div>`;
  $("releasePanel").innerHTML = `<div class="empty-state">Confirm a pick before releasing the pod.</div>`;
}
function adjustQty(n){const q=$("pickQty"); q.value=Math.max(1,(parseInt(q.value)||1)+n)}
function confirmPick(){
  const qty=parseInt($("pickQty").value)||1; state.selectedItem.qty=Math.max(0,state.selectedItem.qty-qty); state.completedPicks+=qty;
  state.activeRequest.status="Pick Confirmed"; state.activeRequest.eta="Done";
  $("pickPanel").innerHTML=`<div class="selected-card"><h4>Pick Confirmed</h4><p>${qty} EA picked successfully.</p><p>Remaining in pod: ${state.selectedItem.qty} EA</p></div>`;
  $("releasePanel").innerHTML=`<div class="selected-card"><h4>Release ${state.selectedItem.pod}</h4><button onclick="releasePod('next')">Release for Other Tasks</button><button class="ghost" onclick="releasePod('storage')">Return to Storage</button></div>`;
  addFeed(`${qty} EA picked from ${state.selectedItem.pod}`);
  renderKPIs(); renderInventory();
}
function releasePod(mode){
  const req=state.activeRequest; const robot=state.robots.find(r=>r.id===req.robot)||state.robots[0];
  robot.status= mode==="next" ? "En Route":"Idle"; robot.task= mode==="next" ? "Next task assigned":"Available"; robot.x= mode==="next"?60:35; robot.y= mode==="next"?65:74;
  req.status= mode==="next" ? "Released to next task":"Returned to storage";
  addFeed(`${req.pod} ${req.status.toLowerCase()}`);
  state.activeRequest=null; state.selectedItem=null;
  $("currentRequestBox").innerHTML=`<div class="empty-state">Ready for next pod request.</div>`;
  renderAll(); showPage("callpod");
}
function cancelRequest(){ if(state.activeRequest){state.activeRequest.status="Cancelled";addFeed(`Request for ${state.activeRequest.pod} cancelled`);state.activeRequest=null;renderAll();}}
function simulateTick(){state.robots.forEach(r=>{if(r.status==="En Route"){r.x=Math.min(92,r.x+Math.random()*8);r.y=Math.min(88,Math.max(12,r.y+(Math.random()-.5)*10));}});renderMaps()}
function toggleTraffic(){state.showTraffic=!state.showTraffic;renderMaps()}
function chargeLowestRobot(){const r=state.robots.slice().sort((a,b)=>a.battery-b.battery)[0];r.status="Charging";r.task="Going to charge";r.x=88;r.y=86;addFeed(`${r.id} sent to charging station`);renderAll()}
function manualAssign(id){addFeed(`${id} selected for manual assignment`)}
function seedUrgentRequest(){
  const item=state.inventory[Math.floor(Math.random()*state.inventory.length)];
  state.requests.unshift({id:Math.max(...state.requests.map(r=>r.id),1289)+1,station:"WS3",item:item.name,pod:item.pod,priority:"High",status:"Queued",eta:"01:30"});
  addFeed(`Urgent request created for ${item.pod}`);
  renderAll();
}
function changeStation(s){state.station=s; $("defaultStation").value=s; addFeed(`Active workstation changed to ${s}`); renderAll()}
function resetSimulation(){localStorage.removeItem("pickflowState"); location.reload();}
setInterval(()=>{state.robots.forEach(r=>{if(r.status!=="Charging")r.battery=Math.max(8,r.battery-0.02);});},3000);
setInterval(simulateTick,5000);
window.onload=()=>{searchInventory(); renderAll();}
