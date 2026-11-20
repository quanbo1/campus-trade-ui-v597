/* ================================================================
   校园闲置 · 多用户在线版
   数据总线：公共 MQTT broker (wss)，所有访问者共享同一份数据
   ================================================================ */
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const NS='campus2nd_v1/';
/* 访客模式开关：true=隐藏登录页，自动分配 1~10 号账号；false=还原正常登录 */
const GUEST_MODE=true;
const SEED_USERS=['爱整理的小周','数码 scavenger','早睡冠军','衣柜断舍离','上岸学长'];
const SEED_PASS='123456';
const SEED_PRODUCTS=[
  {id:'p1',emoji:'📚',name:'高等数学 第七版 上册 同济版 笔记干净',price:18,cond:'九成新',cat:'教材书籍',sub:'专业课教材',owner:'爱整理的小周',desc:'大一高数教材，内容完整，后面几章有少量铅笔笔记（可擦）。支持校内中转站交易，买家到站现场验货后确认收货，放心购～'},
  {id:'p2',emoji:'🎧',name:'蓝牙耳机 半入耳式 音质很好 续航给力',price:45,cond:'八成新',cat:'电子数码配件',sub:'耳机',owner:'数码 scavenger',desc:'用了半年，音质在线，附赠充电线。功能一切正常，欢迎到站点试听验货。'},
  {id:'p3',emoji:'🪴',name:'宿舍小台灯 夹式暖光 三档调光护眼',price:12,cond:'九成新',cat:'宿舍家具',sub:null,owner:'早睡冠军',desc:'夹在床架或书桌上都行，暖光很舒服，搬宿舍用不上了。'},
  {id:'p4',emoji:'🧥',name:'春秋薄外套 M码 只穿过两次',price:39,cond:'九成新',cat:'服饰鞋包',sub:'上衣',owner:'衣柜断舍离',desc:'买小了只穿两次，无任何瑕疵，可以到站点试穿确认。'},
  {id:'p5',emoji:'📖',name:'英语四级真题套装 全套带解析 送答题卡',price:15,cond:'八成新',cat:'教材书籍',sub:'考证资料',owner:'上岸学长',desc:'做过一部分，解析册全新未拆。过了就出，概率论满分感谢它。'},
  {id:'p6',emoji:'🔌',name:'三合一数据线 Type-C/苹果/安卓 1.2m',price:8,cond:'全新',cat:'电子数码配件',sub:'数据线',owner:'数码 scavenger',desc:'囤多了全新未拆封，一条顶三条，宿舍桌面清爽神器。'},
  {id:'p7',emoji:'📦',name:'收纳箱大号两个 带滑轮 可叠放',price:20,cond:'八成新',cat:'生活用品',sub:'收纳箱',owner:'早睡冠军',desc:'毕业清宿舍，两个一起出，滑轮顺滑，装被子装书都行。'},
  {id:'p8',emoji:'👕',name:'加绒卫衣 L码 冬天太暖和了',price:55,cond:'九成新',cat:'服饰鞋包',sub:'上衣',owner:'衣柜断舍离',desc:'去年冬天买的，今年回了南方穿不上。绒很厚实，尺码标准。'},
  {id:'p9',emoji:'🏀',name:'篮球 七号球 气很足 适合操场',price:35,cond:'八成新',cat:'文体用品',sub:'球类',owner:'上岸学长',desc:'打了两个学期，表皮轻微磨损，弹性很好，毕业出。'},
  {id:'p10',emoji:'✏️',name:'文具套装大礼包 笔记本+笔+荧光笔',price:9,cond:'全新',cat:'文体用品',sub:'文具',owner:'爱整理的小周',desc:'社团抽奖多出来的全新套装，一件没拆。'},
  {id:'p11',emoji:'🧴',name:'护肤品水乳套装 敏感肌可用',price:60,cond:'八成新',cat:'美妆杂物',sub:'护肤品',owner:'衣柜断舍离',desc:'买错肤质了，只用过两三次，专柜小票还在。'},
  {id:'p12',emoji:'☂️',name:'自动长柄雨伞 抗风骨架 深灰',price:10,cond:'九成新',cat:'生活用品',sub:'雨伞',owner:'早睡冠军',desc:'宿舍囤了两把，出一把，骨架很结实。'},
  {id:'p13',emoji:'🖱️',name:'无线键鼠套装 静音轴 打字舒服',price:49,cond:'九成新',cat:'电子数码配件',sub:'鼠标键盘',owner:'数码 scavenger',desc:'换了机械键盘所以出，键鼠都很静音，适合图书馆。'},
  {id:'p14',emoji:'📝',name:'考研笔记习题集 手写整理全套',price:25,cond:'九成新',cat:'教材书籍',sub:'笔记习题集',owner:'上岸学长',desc:'一战上岸的手写笔记，重点标注超全，学妹学弟冲。'},
];
const CATS=[
  {major:'教材书籍',subs:['专业课教材','考证资料','课外读物','笔记习题']},
  {major:'电子数码',subs:['耳机','数据线','充电宝','鼠标键盘','支架','小配件']},
  {major:'生活用品',subs:['收纳箱','水杯','雨伞','清洁工具','床品织物']},
  {major:'服饰鞋包',subs:['上衣','裤装','鞋子','包包','配饰']},
  {major:'文体用品',subs:['文具','画板','球类','乐器','运动器材']},
  {major:'宿舍家具',subs:['床上桌','收纳架','椅子','小置物架']},
  {major:'美妆杂物',subs:['护肤小样','化妆工具']},
  {major:'食品零食',subs:['冲泡饮品','零食礼盒','特产','代餐食品']},
  {major:'二次元周边',subs:['徽章','立牌','吧唧','海报','谷圈周边','cos道具']},
  {major:'其他闲置',subs:['未归类杂项']},
];
/* 兼容早期线上数据里的旧分类名 */
const CAT_MAP={'教材':'教材书籍','电子配件':'电子数码','电子数码配件':'电子数码','衣物':'服饰鞋包','耳机':'电子数码','数据线':'电子数码','鼠标键盘':'电子数码','充电宝':'电子数码','支架':'电子数码','收纳箱':'生活用品','雨伞':'生活用品','水壶':'生活用品','清洁工具':'生活用品','上衣':'服饰鞋包','裤子':'服饰鞋包','包包':'服饰鞋包','鞋子':'服饰鞋包','球类':'文体用品','文具':'文体用品','画板':'文体用品','乐器':'文体用品','收纳架':'宿舍家具','床上桌':'宿舍家具','椅子':'宿舍家具','护肤品':'美妆杂物','化妆工具':'美妆杂物','笔记习题集':'教材书籍','考证资料':'教材书籍','专业课教材':'教材书籍','课外书':'教材书籍','各类杂项':'其他闲置','食品零食':'食品零食','零食':'食品零食','冲泡饮品':'食品零食','特产':'食品零食','代餐食品':'食品零食','徽章':'二次元周边','立牌':'二次元周边','吧唧':'二次元周边','海报':'二次元周边','谷圈周边':'二次元周边','cos道具':'二次元周边','运动器材':'文体用品','配饰':'服饰鞋包','床品织物':'生活用品','小配件':'电子数码','小置物架':'宿舍家具','零食礼盒':'食品零食','护肤小样':'美妆杂物','课外读物':'教材书籍','笔记习题':'教材书籍','裤装':'服饰鞋包','水杯':'生活用品'};

const state={
  view:'splash', me:null,
  users:{}, products:[], orders:[], presences:{},
  chatLog:{}, unread:{},
  favs:new Set(), history:[],
  posts:{}, postMarks:{}, postCmts:{}, myLikes:new Set(), myFavs:new Set(), plazaMode:'posts',
  filter:{kw:'',mine:false,tags:[]},
  chatProducts:{}, peerRoles:{}, currentThread:null,
  activity:{days:{},hours:new Array(24).fill(0),replies:{n:0,total:0},lastRecv:{}},
  currentProduct:null, currentOrder:null, currentPeer:null,
  prefs:{match:true,speed:'不限',online:'不限',rating:'不限',delivery:'站点自取'},
  pubTags:new Set(), pubGrade:'九成新', pubCut:'接受小刀', pubTrade:'线下面交', pubTradeNote:'', pubEditId:null,
  listMode:'all',
  csMsgs:[{side:'left',text:'同学你好～我是闲置小助手。想和真人卖家聊，请到商品详情页点「联系卖家」；这里处理交易纠纷与平台问题 📎'}],
};

/* ---------- 工具 ---------- */
let toastTimer;
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),1900);}
const fmt=n=>'¥'+Number(n).toFixed(2);
const getStore=k=>{const v=localStorage.getItem('cu_'+k);return v?JSON.parse(v):null;};
const setStore=(k,v)=>localStorage.setItem('cu_'+k,JSON.stringify(v));
async function hash(str){
  try{
    const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('cu::'+str));
    return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
  }catch(e){let h=5381;for(const c of 'cu::'+str)h=((h<<5)+h+c.charCodeAt(0))>>>0;return 'x'+h.toString(16);}
}
function isOnline(name){const p=state.presences[name];return !!(p&&p.on&&Date.now()-p.ts<75000);}

/* ---------- MQTT 数据总线 ---------- */
let mq=null,chatSubTopic=null,seedTimer=null,chatSyncUntil=0;
/* 公共总线节点列表：连接时并行竞速，自动采用最快连上的节点 */
/* 主节点：emqx 公共版单条消息上限 1MB；hivemq 只有 256KB，超限消息会被踢掉连接——
   所以主节点只放 emqx，hivemq 仅作镜像兜底且不发大消息 */
const BROKERS=['wss://broker.emqx.io:8084/mqtt','wss://broker-cn.emqx.io:8084/mqtt'];
const MIRROR_URLS=['wss://broker.hivemq.com:8884/mqtt'];
/* 单条消息安全上限：900KB（base64 后），超过一律拒发，防止被 broker 断连 */
const PAYLOAD_MAX=900000;
let brokerIdx=0,failCount=0;
function setNetUI(on,text){
  $$('.net-pill').forEach(p=>{
    p.classList.toggle('on',on);
    p.querySelector('i').style.background=on?'#7FBF7B':'#C9BB9F';
    p.lastChild.textContent=text;
  });
}
let raceTimer=null;
function mqConnect(){
  if(typeof mqtt==='undefined'){setNetUI(false,'组件加载失败，请刷新');return;}
  if(mq){try{mq.end(true);}catch(e){}mq=null;}
  clearTimeout(raceTimer);
  setNetUI(false,'正在连接市集…');
  /* 三节点并行竞速：同时发起连接，谁先连上用谁，其余立即关闭 */
  let settled=false;
  const clients=[];
  const cleanup=()=>{
    clearTimeout(raceTimer);
    clients.forEach(c=>{if(c!==mq){try{c.end(true);}catch(e){}}});
  };
  BROKERS.forEach((url,i)=>{
    const c=mqtt.connect(url,{clientId:'cu_'+Math.random().toString(16).slice(2,10),clean:true,keepalive:30,connectTimeout:8000,reconnectPeriod:3000});
    clients.push(c);
    c.on('connect',()=>{
      if(settled){try{c.end(true);}catch(e){}return;}
      settled=true;
      brokerIdx=i;failCount=0;mq=c;
      cleanup();
      /* 每次连上就清一次演示商品，三节点同步墓碑 */
      setTimeout(()=>{try{purgeAllSeeds();}catch(e){}},1200);
      onNetUp();
    });
    c.on('message',onMqMsg);
    c.on('close',()=>{
      if(!settled||c!==mq)return;
      setNetUI(false,'连接断开，自动重连');
      failCount++;
      /* mqtt.js 自带指数重连；连续 4 次失败才切换节点，减少不必要的全量重连 */
      if(failCount>=4){
        failCount=0;
        setNetUI(false,'切换节点…');
        setTimeout(mqConnect,500);
      }
    });
    c.on('reconnect',()=>{if(!settled||c===mq)setNetUI(false,'重连中…');});
    c.on('error',()=>{});
  });
  /* 15 秒内没有任何节点连上：全部重来一轮 */
  raceTimer=setTimeout(()=>{
    if(settled)return;
    settled=true;
    cleanup();
    failCount++;
    setNetUI(false,'节点较慢，重试…');
    setTimeout(mqConnect,500);
  },15000);
}
/* 断线暂存队列：retain 消息断网时先存起来，恢复连接后自动补发 */
const outbox=[];
function pub(topic,obj,retain=false){
  const payload=obj===null?'':JSON.stringify(obj);
  /* 超过红线直接拒绝：发出去会被 broker 断开，害得所有人掉线 */
  if(payload.length>PAYLOAD_MAX){
    toast('内容太大无法上传，请删掉几张图片');
    return false;
  }
  if(!mq||!mq.connected){
    if(retain&&outbox.length<300)outbox.push({topic,payload,retain:true});
    toast('网络未连接，已暂存，恢复后自动发送');
    return false;
  }
  mq.publish(topic,payload,{qos:0,retain});
  mirrorPublish(topic,payload,retain);
  return true;
}
function flushOutbox(){
  if(!mq||!mq.connected)return;
  while(outbox.length){
    const o=outbox.shift();
    try{
      mq.publish(o.topic,o.payload,{qos:0,retain:o.retain});
      mirrorPublish(o.topic,o.payload,o.retain);
    }catch(e){outbox.unshift(o);break;}
  }
}
/* ---------- 镜像节点：所有保留消息同步写入三个总线节点，数据不再依赖单一节点 ---------- */
let mirrors=[];
/* 演示商品墓碑：三节点发布空 retain，彻底删除 */
const SEED_IDS=new Set((typeof SEED_PRODUCTS!=='undefined'?SEED_PRODUCTS:[]).map(p=>p.id));
function purgeSeed(id){
  const topic=NS+'products/'+id;
  if(mq&&mq.connected){try{mq.publish(topic,'',{qos:0,retain:true});}catch(e){}}
  mirrorPublish(topic,'',true);
}
function purgeAllSeeds(){
  SEED_IDS.forEach(id=>purgeSeed(id));
}
function mirrorPublish(topic,payload,retain){
  mirrors.forEach(m=>{
    /* 镜像节点上限不同（hivemq 256KB），大消息跳过，避免镜像连接被踢 */
    if(payload.length>(m.max||PAYLOAD_MAX))return;
    if(m.c&&m.c.connected){
      try{m.c.publish(topic,payload,{qos:0,retain});}catch(e){if(retain&&m.out.length<300)m.out.push({topic,payload,retain:true});}
    }else if(retain&&m.out.length<300)m.out.push({topic,payload,retain:true});
  });
}
function flushMirror(m){
  if(!m.c||!m.c.connected)return;
  while(m.out.length){
    const o=m.out.shift();
    try{m.c.publish(o.topic,o.payload,{qos:0,retain:o.retain});}catch(e){m.out.unshift(o);break;}
  }
}
function syncMirrors(){
  const stale=mirrors.find(m=>m.idx===brokerIdx);
  if(stale){try{stale.c.end(true);}catch(e){}mirrors=mirrors.filter(m=>m!==stale);}
  MIRROR_URLS.forEach((url,i)=>{
    if(mirrors.some(m=>m.idx===i))return;
    const m={idx:i,c:null,out:[],max:url.indexOf('hivemq')>=0?250000:PAYLOAD_MAX};
    const c=mqtt.connect(url,{clientId:'cum_'+Math.random().toString(16).slice(2,10),clean:true,keepalive:30,connectTimeout:8000,reconnectPeriod:8000});
    m.c=c;
    c.on('connect',()=>flushMirror(m));
    c.on('error',()=>{});
    mirrors.push(m);
  });
}
/* 跨节点取数：主节点切换后，从其他节点把历史保留消息拉回来（一次性临时连接） */
let lastPrimary=-1,syncQuietUntil=0;
function collectRetained(){
  const topics=[NS+'users/+',NS+'products/+',NS+'orders/+',NS+'presence/+',NS+'chat/+/+',NS+'archive/+',NS+'posts/+',NS+'postcmt/+/+',NS+'postmark/+/+'];
  const urls=[];
  BROKERS.forEach((u,i)=>{if(i!==brokerIdx)urls.push(u);});
  MIRROR_URLS.forEach(u=>urls.push(u));
  urls.forEach(url=>{
    const c=mqtt.connect(url,{clientId:'cuc_'+Math.random().toString(16).slice(2,10),clean:true,keepalive:15,connectTimeout:8000});
    c.on('connect',()=>{try{c.subscribe(topics);}catch(e){}});
    c.on('message',(t,p,packet)=>{
      /* 只取保留消息（历史数据），实时消息由主连接负责 */
      if(!packet||!packet.retain)return;
      try{onMqMsg(t,p);}catch(e){}
    });
    c.on('error',()=>{});
    setTimeout(()=>{try{c.end(true);}catch(e){}},7000);
  });
  syncQuietUntil=Date.now()+8000;
}
window.addEventListener('online',()=>{
  setNetUI(false,'重连中…');
  if(mq&&!mq.connected){try{mq.reconnect();}catch(e){}}
});
window.addEventListener('offline',()=>setNetUI(false,'网络离线'));
function onNetUp(){
  setNetUI(true,'已连接');
  chatSubTopic=null;
  mq.subscribe([NS+'users/+',NS+'products/+',NS+'orders/+',NS+'presence/+',NS+'chat/+/+',NS+'archive/+',NS+'posts/+',NS+'postcmt/+/+',NS+'postmark/+/+']);
  flushOutbox();
  if(lastPrimary!==brokerIdx){lastPrimary=brokerIdx;syncMirrors();collectRetained();}
  chatSyncUntil=Date.now()+3000;
  const saved=getStore('me');
  if(saved&&saved.name){state.me=saved;afterLogin();if(state.view==='splash')showView('home');}
  clearTimeout(seedTimer);
  seedTimer=setTimeout(()=>{
    const seedKey='cu_seeded_v2_'+brokerIdx;
    /* 演示商品已按需求删除，永久关闭播种，避免再次出现 */
    const SEED_ENABLED=false;
    if(SEED_ENABLED&&state.products.length===0&&!localStorage.getItem(seedKey)){
      localStorage.setItem(seedKey,'1');
      hash(SEED_PASS).then(h=>{
        /* 只补缺失的演示数据，已存在的账号/商品绝不覆盖（保护真实数据） */
        SEED_USERS.forEach(u=>{if(!state.users[u])pub(NS+'users/'+encodeURIComponent(u),{pass:h,ts:Date.now()},true);});
        SEED_PRODUCTS.forEach(p=>{if(!state.products.some(x=>x.id===p.id))pub(NS+'products/'+p.id,{...p,ts:Date.now()},true);});
      });
    }
  },3200);
  heartbeat();
}
function heartbeat(){if(state.me&&mq&&mq.connected)pub(NS+'presence/'+encodeURIComponent(state.me.name),{on:true,ts:Date.now()},true);}
setInterval(heartbeat,25000);
window.addEventListener('pagehide',()=>{
  if(state.me&&mq&&mq.connected){
    mq.publish(NS+'presence/'+encodeURIComponent(state.me.name),JSON.stringify({on:false,ts:Date.now()}),{qos:0,retain:true});
    publishArchive();
  }
});
function onMqMsg(topic,payload){
  const path=topic.slice(NS.length);
  const raw=payload.toString();
  let data=null;
  if(raw){try{data=JSON.parse(raw);}catch(e){return;}}
  if(path.startsWith('users/')){
    const name=decodeURIComponent(path.slice(6));
    if(data)state.users[name]=data;else delete state.users[name];
    if(state.view==='userpage'&&state.userPageWho===name)renderUserPage();
  }else if(path.startsWith('presence/')){
    const name=decodeURIComponent(path.slice(9));
    state.presences[name]=data||{on:false,ts:0};
    if(state.view==='chat'&&state.currentPeer===name)renderChatHead();
    if(state.view==='userpage'&&state.userPageWho===name)renderUserPage();
    if(state.view==='detail')renderDetailOwnerState();
  }else if(path.startsWith('products/')){
    const id=path.slice(9);
    /* 演示商品已永久下线：任何节点再出现即清除（防止旧客户端重新播种） */
    if(SEED_IDS.has(id)){
      if(data)purgeSeed(id);
      return;
    }
    if(!data)state.products=state.products.filter(p=>p.id!==id);
    else{const i=state.products.findIndex(p=>p.id===id);if(i>=0)state.products[i]=data;else state.products.push(data);}
    if(state.view==='home')renderGoods();
    if(state.view==='detail'&&curP()?.id===id)renderDetail();
    if(state.view==='profile')renderProfile();
  }else if(path.startsWith('orders/')){
    if(!data||!state.me)return;
    if(data.buyer!==state.me.name&&data.seller!==state.me.name)return;
    const isNew=!state.orders.some(o=>o.id===data.id);
    const i=state.orders.findIndex(o=>o.id===data.id);
    if(i>=0)state.orders[i]=data;else state.orders.push(data);
    state.orders.sort((a,b)=>b.ts-a.ts);
    if(isNew&&Date.now()>syncQuietUntil&&data.seller===state.me.name&&data.buyer!==state.me.name)toast('你有新订单 🧾');
    if(state.view==='order')renderOrder();
    if(state.view==='profile')renderProfile();
  }else if(path.startsWith('chat/')){
    if(!data||!state.me)return;
    if(data.from!==state.me.name&&data.to!==state.me.name)return;
    const peer=data.from===state.me.name?data.to:data.from;
    /* 频道路由：消息携带 pid 时落到该商品的独立频道 */
    const tKey=threadKey(peer,data.pid||null);
    const log=state.chatLog[tKey]=state.chatLog[tKey]||[];
    const exist=log.find(m=>m.ts===data.ts);
    if(exist){
      /* 已读回执：同一条消息被对方更新 readAt */
      if(data.readAt&&!exist.readAt){
        exist.readAt=data.readAt;
        if(state.view==='chat'&&state.currentPeer===peer)renderChat();
        else saveSoon();
      }
      return;
    }
    log.push(data);log.sort((a,b)=>a.ts-b.ts);
    const replay=Date.now()<chatSyncUntil;
    const inThread=state.view==='chat'&&state.currentThread===tKey;
    if(inThread){
      renderChat();
      markRead();
    }
    else if(!replay&&data.from!==state.me.name){
      state.activity.lastRecv[data.from]=Date.now();
      state.unread[tKey]=(state.unread[tKey]||0)+1;updateUnread();saveUserData();
      toast(peer+'：'+(data.text||(data.img&&data.img.indexOf('stk#')===0?'[表情包]':'[图片]')));
    }
    if(replay)saveSoon();else scheduleArchive();
  }else if(path.startsWith('archive/')){
    if(!data||!state.me)return;
    const name=decodeURIComponent(path.slice(8));
    if(name!==state.me.name||!data.log)return;
    let changed=false;
    Object.entries(data.log).forEach(([peer,msgs])=>{
      const arr=state.chatLog[peer]=state.chatLog[peer]||[];
      msgs.forEach(m=>{if(!arr.some(x=>x.ts===m.ts)){arr.push(m);changed=true;}});
      arr.sort((a,b)=>a.ts-b.ts);
    });
    if(changed){saveSoon();if(state.view==='msgs')renderMsgs();if(state.view==='chat'&&state.currentPeer)renderChat();}
  }else if(path.startsWith('posts/')){
    const id=path.slice(6);
    if(!data)delete state.posts[id];else state.posts[id]=data;
    if(state.view==='plaza')renderPlaza();
  }else if(path.startsWith('postcmt/')){
    const rest=path.slice(8);
    const sep=rest.indexOf('/');
    const pid=rest.slice(0,sep);
    if(!data||!pid)return;
    const arr=state.postCmts[pid]=state.postCmts[pid]||[];
    if(!arr.some(c=>c.ts===data.ts)){
      arr.push(data);arr.sort((a,b)=>a.ts-b.ts);
      if(state.view==='plaza')renderPlaza();
    }
  }else if(path.startsWith('postmark/')){
    const rest=path.slice(9);
    const sep=rest.indexOf('/');
    const pid=rest.slice(0,sep);
    const uk=rest.slice(sep+1);
    const usep=uk.lastIndexOf('_');
    if(!pid||usep<0)return;
    const kind=uk.slice(usep+1)==='fav'?'fav':'like';
    const user=decodeURIComponent(uk.slice(0,usep));
    const on=!!(data&&data.on);
    const m=state.postMarks[pid]=state.postMarks[pid]||{like:new Set(),fav:new Set()};
    if(on)m[kind].add(user);else m[kind].delete(user);
    if(state.view==='plaza')renderPlaza();
  }
}
function waitNet(ms=3000){
  return new Promise(res=>{
    if(mq&&mq.connected)return res();
    const t0=Date.now();
    const timer=setInterval(()=>{if((mq&&mq.connected)||Date.now()-t0>ms){clearInterval(timer);res();}},150);
  });
}

/* ---------- 路由（带历史栈：返回按钮回到上一步） ---------- */
let navStack=[];
function showView(v,push=true){
  if(push&&state.view&&state.view!==v){navStack.push(state.view);if(navStack.length>40)navStack.shift();}
  state.view=v;
  $$('.view').forEach(el=>el.classList.remove('active'));
  $('#view-'+v).classList.add('active');
  $('#tabbar').classList.toggle('hidden',!['home','plaza','search','profile','msgs'].includes(v));
  $$('.tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===v));
  if(v==='home')renderGoods();
  if(v==='search'){renderSearchTools();renderSearchChips();renderSearchGoods();}
  if(v==='userpage')renderUserPage();
  if(v==='detail')renderDetail();
  if(v==='chat'){ensureChatSub();renderChat();}
  if(v==='msgs')renderMsgs();
  if(v==='changelog')renderChangelog();
  if(v==='plaza')renderPlaza();
  if(v==='mylist')renderMyList();
  if(v==='profile')renderProfile();
  if(v==='support')renderSupport();
  if(v==='publish')renderUpload();
  if(v==='order')renderOrder();
  if(v==='station')renderStation();
  /* 聊天区不重置滚动，renderChat 会定位到最新一条 */
  const sc=$('#view-'+v).querySelector('.home-body,.search-body,.detail-body,.me-body,.order-scroll,.pub-body,.userpage-body');
  if(sc)sc.scrollTop=0;
}
function goBack(){
  let prev=null;
  while(navStack.length){const p=navStack.pop();if(p!==state.view){prev=p;break;}}
  showView(prev||'home',false);
}
$$('[data-back]').forEach(b=>b.addEventListener('click',goBack));

/* ---------- 启动页 ---------- */
if(GUEST_MODE){
  const hint=document.querySelector('#view-splash .tap-hint');
  if(hint)hint.textContent='正在为你准备账号…';
  /* 隐藏入口：连续点击开屏 5 次可回到原登录页（供老账号/管理员使用） */
  let tapN=0,tapT=0;
  $('#view-splash').addEventListener('click',()=>{
    const now=Date.now();
    tapN=(now-tapT<1200)?tapN+1:1;tapT=now;
    if(tapN>=5){tapN=0;showView('login');return;}
    if(!state.me)setTimeout(()=>{if(state.view==='splash'&&!state.me)autoGuest();},700);
  });
  setTimeout(()=>{if(state.view==='splash'&&!state.me)autoGuest();},1500);
}else{
  $('#view-splash').addEventListener('click',()=>showView(state.me?'home':'login'));
  setTimeout(()=>{if(state.view==='splash')showView(state.me?'home':'login');},3000);
}
/* ---------- 访客模式：自动分配 1~10 号账号 ---------- */
async function autoGuest(){
  if(state.me||state.view!=='splash')return;
  const hint=document.querySelector('#view-splash .tap-hint');
  const ok=await waitNet(10000);
  if(!mq||!mq.connected){
    if(hint)hint.textContent='网络较慢，正在重试…';
    setTimeout(()=>{if(state.view==='splash'&&!state.me)autoGuest();},2000);
    return;
  }
  /* 等总线上的注册表（保留消息）到达，避免误判占用 */
  await new Promise(r=>setTimeout(r,2200));
  if(state.me||state.view!=='splash')return;
  let pick=null;
  for(let i=1;i<=10;i++){if(!state.users[String(i)]){pick=String(i);break;}}
  if(pick){
    /* 空闲号码：注册新访客账号（注册前再核对一次，避免覆盖晚到的注册表） */
    if(state.users[pick]){guestLogin(pick,state.users[pick].pass);return;}
    const pass='g'+Math.random().toString(36).slice(2,10);
    const h=await hash(pass);
    if(state.users[pick]){guestLogin(pick,state.users[pick].pass);return;}
    pub(NS+'users/'+encodeURIComponent(pick),{pass:h,ts:Date.now()},true);
    state.users[pick]={pass:h,ts:Date.now()};
    guestLogin(pick,h,'已为你分配账号 '+pick);
  }else{
    /* 1~10 全部占用：随机借用一个（不改动其数据） */
    const name=String(1+Math.floor(Math.random()*10));
    guestLogin(name,(state.users[name]||{}).pass||'','已进入访客账号 '+name);
  }
}
function guestLogin(name,passHash,tip){
  if(!passHash)return;
  state.me={name,pass:passHash};
  setStore('me',state.me);
  navStack=[];
  if(tip)toast(tip+' 🦢');
  afterLogin();
  showView('home',false);
}

/* ---------- 登录 ---------- */
async function doLogin(){
  const name=$('#liName').value.trim();
  const pass=$('#liPass').value;
  const err=$('#loginErr');
  if(!name){err.textContent='请输入昵称';return;}
  if(!pass){err.textContent='请输入密码';return;}
  err.textContent='正在连接市集…';
  await waitNet(10000);
  if(!mq||!mq.connected){
    err.textContent='网络较慢，正在重试…';
    if(mq&&!mq.connected){try{mq.reconnect();}catch(e){}}
    await waitNet(10000);
    if(!mq||!mq.connected){err.textContent='连接超时，请检查网络后重试';return;}
  }
  const h=await hash(pass);
  const rec=state.users[name];
  if(rec&&rec.pass!==h){err.textContent='该昵称已被注册，密码不匹配';return;}
  if(!rec)pub(NS+'users/'+encodeURIComponent(name),{pass:h,ts:Date.now()},true);
  state.users[name]=rec||{pass:h,ts:Date.now()};
  state.me={name,pass:h};
  setStore('me',state.me);
  err.textContent='';
  toast('欢迎你，'+name+' 🎉');
  navStack=[];
  afterLogin();
  showView('home',false);
}
function afterLogin(){
  heartbeat();
  /* 登录成功后再触发一次跨节点取数：聊天/档案需要登录才能接收，
     手动登录往往晚于打开页面时的取数窗口，这里补一次（消息按 id/ts 幂等） */
  setTimeout(()=>{if(mq&&mq.connected)collectRetained();},600);
  /* 登录后把在线/成交摘要推到总线，供他人主页查看 */
  setTimeout(()=>publishActivity(true),1800);
  setInterval(()=>publishActivity(),300000);
  const perUser=getStore('data_'+state.me.name)||{};
  state.favs=new Set(perUser.favs||[]);
  state.history=perUser.history||[];
  state.myLikes=new Set(perUser.myLikes||[]);
  state.myFavs=new Set(perUser.myFavs||[]);
  state.unread=perUser.unread||{};
  state.chatProducts=perUser.chatProducts||{};
  state.peerRoles=perUser.peerRoles||{};
  state.prefs=perUser.prefs||state.prefs;
  state.chatLog=perUser.chatLog||{};
  const a=perUser.activity||{};
  state.activity={
    days:a.days||{},
    hours:(Array.isArray(a.hours)&&a.hours.length===24)?a.hours.slice():new Array(24).fill(0),
    replies:a.replies&&a.replies.n?a.replies:{n:0,total:0},
    lastRecv:{},
  };
  $('#meName').textContent=state.me.name;
  $('#meBio').textContent='校园闲置用户 · '+state.me.name;
  $('#meAvatar').textContent=state.me.name[0];
  updateUnread();
}
function saveUserData(){
  if(!state.me)return;
  const slimLog={};
  Object.entries(state.chatLog).forEach(([k,v])=>{
    slimLog[k]=v.filter(m=>m.text||(m.img&&m.img.indexOf('stk#')===0)).slice(-150).map(m=>({from:m.from,to:m.to,text:m.text||'',img:m.img||null,ts:m.ts,readAt:m.readAt||null}));
  });
  setStore('data_'+state.me.name,{favs:[...state.favs],history:state.history,unread:state.unread,prefs:state.prefs,chatProducts:state.chatProducts,peerRoles:state.peerRoles,chatLog:slimLog,activity:state.activity,myLikes:[...state.myLikes],myFavs:[...state.myFavs]});
}
/* 聊天记录三层持久化：本地缓存 + 消息 retained + 账号云端档案 */
let saveTimer=null,archiveTimer=null;
function saveSoon(){clearTimeout(saveTimer);saveTimer=setTimeout(saveUserData,800);}
function scheduleArchive(){clearTimeout(archiveTimer);archiveTimer=setTimeout(publishArchive,4000);}
function slimLog(){
  const out={};
  Object.entries(state.chatLog).forEach(([k,v])=>{
    out[k]=v.filter(m=>m.text||(m.img&&m.img.indexOf('stk#')===0)).slice(-120).map(m=>({from:m.from,to:m.to,text:m.text||'',img:m.img||null,ts:m.ts}));
  });
  return out;
}
function publishArchive(){
  if(!state.me||!mq||!mq.connected)return;
  try{
    const t=NS+'archive/'+encodeURIComponent(state.me.name);
    const pl=JSON.stringify({log:slimLog(),ts:Date.now()});
    mq.publish(t,pl,{qos:0,retain:true});
    mirrorPublish(t,pl,true);
  }catch(e){}
}
/* 在线行为统计：每分钟累计在线时长与活跃小时 */
setInterval(()=>{
  if(!state.me||!mq||!mq.connected)return;
  if(document.visibilityState!=='visible')return;
  const a=state.activity;
  const key=new Date().toISOString().slice(0,10);
  a.days[key]=(a.days[key]||0)+1;
  a.hours[new Date().getHours()]++;
  saveUserData();
},60000);
/* 由真实行为计算个人主页三项在线数据 */
function dailyAvgHours(){
  const keys=Object.keys(state.activity.days);
  if(!keys.length)return null;
  const total=keys.reduce((s,k)=>s+state.activity.days[k],0);
  return total/keys.length/60;
}
function topPeriod(){
  const h=state.activity.hours;
  if(!h.some(v=>v>0))return null;
  const top=h.map((v,i)=>[v,i]).sort((x,y)=>y[0]-x[0]).slice(0,4).map(x=>x[1]).sort((a,b)=>a-b);
  let best=[top[0],top[0]],curStart=top[0],prev=top[0];
  for(let i=1;i<top.length;i++){
    if(top[i]===prev+1){prev=top[i];if(top[i]-curStart>best[1]-best[0])best=[curStart,prev];}
    else{curStart=prev=top[i];}
  }
  return best;
}
function avgReplyMs(){
  const r=state.activity.replies;
  return r&&r.n?r.total/r.n:null;
}
$('#liGo').addEventListener('click',doLogin);
$('#liPass').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});
$('#logoutBtn').addEventListener('click',()=>{
  if(state.me&&mq&&mq.connected){
    try{
      mq.publish(NS+'presence/'+encodeURIComponent(state.me.name),JSON.stringify({on:false,ts:Date.now()}),{qos:0,retain:true});
      publishArchive();
    }catch(e){}
  }
  localStorage.removeItem('cu_me');
  setTimeout(()=>location.reload(),400);
});

/* ---------- 首页 ---------- */
function matchTags(p){
  const tags=state.filter.tags;
  if(!tags.length)return true;
  const cat=CAT_MAP[p.cat]||p.cat;
  return tags.includes(cat)||(p.sub&&tags.includes(p.sub));
}
function renderGoods(){
  const{kw,mine,tags,sort,face,barg}=state.filter;
  let list=state.products.filter(p=>{
    if(SEED_IDS.has(p.id))return false;
    if(mine)return state.me&&p.owner===state.me.name;
    if(p.sold||(p.stock!=null&&p.stock<=0))return false;
    if(!matchTags(p))return false;
    if(kw&&!(p.name+p.cat+p.owner).toLowerCase().includes(kw.toLowerCase()))return false;
    /* 频道面板属性筛选：支持面交 / 可议价 */
    if(face&&(p.trade||'线下面交')!=='线下面交')return false;
    if(barg&&p.cut==='不接受小刀')return false;
    return true;
  });
  /* 排序：热门商品按浏览+收藏加权，其余按时间 */
  if(sort==='hot')list.sort((a,b)=>((b.stats&&b.stats.views||0)+(b.stats&&b.stats.favs||0)*3)-((a.stats&&a.stats.views||0)+(a.stats&&a.stats.favs||0)*3));
  else list.sort((a,b)=>(b.ts||0)-(a.ts||0));
  const extra=[];
  if(sort==='new')extra.push('最新发布');
  if(sort==='hot')extra.push('热门商品');
  if(face)extra.push('支持面交');
  if(barg)extra.push('可议价');
  $('#homeSecTitle').textContent=mine?'我的发布':(kw?`“${kw}” 的搜索结果`:(tags.length||extra.length)?`筛选结果 · ${list.length} 件`:'闲鹅校园二手APP');
  $('#goodsGrid').innerHTML=list.length?list.map(p=>`
    <div class="card goods" data-id="${p.id}">
      <div class="gimg" style="background:linear-gradient(140deg,#FBE7D4,#F3CEAC);">${p.img?`<img src="${p.img}">`:p.emoji||'📦'}</div>
      ${p.sold?'<span class="sold-mark">已售出</span>':''}
      <div class="ginfo">
        <div class="gname">${p.name}</div>
        <div class="grow"><span class="gprice"><small>¥</small>${p.price}</span><span class="gtag">${CAT_MAP[p.cat]||p.cat}${p.sub?' · '+p.sub:''} · ${p.cond}</span></div>
      </div>
    </div>`).join('')
    :`<div class="empty-tip">🧺 ${mine?'你还没有发布闲置，点底部「＋」试试':'没有找到相关闲置，换个分类或关键词试试～'}</div>`;
  renderFilterChips();
  renderChannels();
}
function renderFilterChips(){
  const box=$('#filterChips');
  const tags=state.filter.tags;
  if(!tags.length){box.style.display='none';box.innerHTML='';return;}
  box.style.display='flex';
  box.innerHTML=tags.map(t=>`<span class="fchip" data-tag="${t}">${t}<b>✕</b></span>`).join('')
    +`<span class="fchip clear" data-clr="1">清除全部</span>`;
}
$('#filterChips').addEventListener('click',e=>{
  const clr=e.target.closest('[data-clr]');
  if(clr){state.filter.tags=[];renderGoods();return;}
  const c=e.target.closest('[data-tag]');
  if(c){state.filter.tags=state.filter.tags.filter(t=>t!==c.dataset.tag);renderGoods();}
});
$('#goodsGrid').addEventListener('click',e=>{const g=e.target.closest('.goods');if(g)openDetail(g.dataset.id);});
/* ---------- 首页频道导航（闲鱼样式平铺）+ 全部频道弹窗 ---------- */
/* 频道大类标签 → 现有分类体系映射 */
Object.assign(CAT_MAP,{'绘画文体':'文体用品','宿舍好物':'宿舍家具','美妆个护':'美妆杂物'});
const HF_SORTS=[{k:'rec',t:'推荐'},{k:'new',t:'最新发布'},{k:'hot',t:'热门商品'}];
const HF_ATTRS=[{k:'face',t:'支持面交'},{k:'barg',t:'可议价'},{k:'school',t:'本校可见'}];
const HF_CATS=[['教材书籍','📚'],['电子数码','📱'],['绘画文体','🎨'],['服饰鞋包','👗'],['宿舍好物','🛏️'],['二次元周边','🎀'],['食品零食','🍬'],['美妆个护','💄'],['运动器材','🏀'],['乐器','🎸'],['其他闲置','📦']];
/* 统一处理频道点击：inPanel=true（弹窗内）时应用后收起，频道行点击就地刷新 */
function handleHfClick(e,inPanel){
  const s=e.target.closest('[data-hfsort]');
  if(s){state.filter.sort=s.dataset.hfsort;renderGoods();hfRender();if(inPanel)hfClose();return true;}
  const a=e.target.closest('[data-hfattr]');
  if(a){
    const k=a.dataset.hfattr;
    if(k!=='school')state.filter[k]=!state.filter[k];
    else toast('当前展示的全部是本校同学的闲置');
    renderGoods();hfRender();if(inPanel)hfClose();return true;
  }
  const c=e.target.closest('[data-hfcat]');
  if(c){
    const t=c.dataset.hfcat;
    state.filter.tags=state.filter.tags.includes(t)?state.filter.tags.filter(x=>x!==t):[...state.filter.tags,t];
    renderGoods();hfRender();if(inPanel)hfClose();
    return true;
  }
  return false;
}
/* 频道行渲染（与弹窗共用同一份筛选状态，选中态同步） */
function renderChannels(){
  const f=state.filter;
  $('#hcTabs').innerHTML=HF_SORTS.map(s=>`<div class="hc-tab ${(f.sort||'rec')===s.k?'on':''}" data-hfsort="${s.k}">${s.t}</div>`).join('')
    +HF_ATTRS.map(a=>`<div class="hc-tab ${f[a.k]?'on':''}" data-hfattr="${a.k}">${a.t}</div>`).join('');
  $('#hcIcos').innerHTML=HF_CATS.map(([c,ico])=>`<div class="hc-ico ${f.tags.includes(c)?'on':''}" data-hfcat="${c}"><i>${ico}</i><span>${c}</span></div>`).join('');
}
function hfRender(){
  renderChannels();
  const f=state.filter;
  $('#hfSortTags').innerHTML=HF_SORTS.map(s=>`<div class="hf-tag ${(f.sort||'rec')===s.k?'on':''}" data-hfsort="${s.k}">${s.t}</div>`).join('')
    +HF_ATTRS.map(a=>`<div class="hf-tag ${f[a.k]?'on':''}" data-hfattr="${a.k}">${a.t}</div>`).join('');
  $('#hfCatTags').innerHTML=HF_CATS.map(([c])=>`<div class="hf-tag ${f.tags.includes(c)?'on':''}" data-hfcat="${c}">${c}</div>`).join('');
}
function hfOpen(){hfRender();$('#homeFilterOverlay').classList.add('show');$('#homeFilterBtn').classList.add('on');}
function hfClose(){$('#homeFilterOverlay').classList.remove('show');$('#homeFilterBtn').classList.remove('on');}
/* 右侧下拉箭头：打开全部频道面板 */
$('#homeFilterBtn').addEventListener('click',e=>{
  e.stopPropagation();
  $('#homeFilterOverlay').classList.contains('show')?hfClose():hfOpen();
});
$('#hfClose').addEventListener('click',hfClose);
$('#homeFilterOverlay').addEventListener('click',e=>{
  if(e.target.id==='homeFilterOverlay'){hfClose();return;}
  handleHfClick(e,true);
});
/* 频道行直接点击：就地筛选，不弹面板 */
$('#homeChannels').addEventListener('click',e=>{handleHfClick(e,false);});
/* 首页搜索框：点击进入独立搜索页 */
$('#homeSearchBox').addEventListener('click',()=>{
  state.filter.mine=false;
  showView('search');
  setTimeout(()=>$('#searchInput2').focus(),120);
});
/* ---------- 独立搜索页：搜索框 + 热门标签 + 分类筛选 + 历史 ---------- */
const HOT_WORDS=['耳机','考研笔记','收纳箱','雨伞','充电宝','卫衣','泡面','cos'];
function getHist(){try{return JSON.parse(localStorage.getItem('cu_searchHist'))||[];}catch(e){return [];}}
function addHist(kw){
  if(!kw)return;
  let h=getHist().filter(x=>x!==kw);
  h.unshift(kw);h=h.slice(0,10);
  localStorage.setItem('cu_searchHist',JSON.stringify(h));
}
let histTimer;
function goodsCard(p){
  return `<div class="card goods" data-id="${p.id}">
      <div class="gimg" style="background:linear-gradient(140deg,#FBE7D4,#F3CEAC);">${p.img?`<img src="${p.img}">`:p.emoji||'📦'}</div>
      ${p.sold?'<span class="sold-mark">已售出</span>':''}
      <div class="ginfo">
        <div class="gname">${p.name}</div>
        <div class="grow"><span class="gprice"><small>¥</small>${p.price}</span><span class="gtag">${CAT_MAP[p.cat]||p.cat}${p.sub?' · '+p.sub:''} · ${p.cond}</span></div>
      </div>
    </div>`;
}
function renderSearchTools(){
  /* 热门搜索标签 */
  $('#hotTags').innerHTML=HOT_WORDS.map(w=>`<span class="hot-tag" data-hot="${w}">${w}</span>`).join('');
  /* 分类选择区：大类行 + 当前选中大类的子类行 */
  const tags=state.filter.tags;
  const selMajors=tags.filter(t=>CATS.some(c=>c.major===t));
  $('#catPick').innerHTML=CATS.map(c=>{
    const on=tags.includes(c.major);
    return `<span class="pick ${on?'on':''}" data-major="${c.major}">${c.major}</span>`;
  }).join('');
  const cur=selMajors[selMajors.length-1];
  const sec=cur?CATS.find(c=>c.major===cur):null;
  $('#catPickSubs').innerHTML=sec
    ?sec.subs.map(s=>{
      const on=tags.includes(s);
      return `<span class="pick ${on?'on':''}" data-sub="${s}">${s}</span>`;
    }).join('')
    :'';
}
function renderSearchChips(){
  const box=$('#searchChips');
  const tags=state.filter.tags;
  if(!tags.length){box.style.display='none';box.innerHTML='';return;}
  box.style.display='flex';
  box.innerHTML=tags.map(t=>`<span class="fchip" data-tag="${t}">${t}<b>✕</b></span>`).join('')
    +`<span class="fchip clear" data-clr="1">清除全部</span>`;
}
function renderSearchGoods(){
  const kw=state.filter.kw;
  const tags=state.filter.tags;
  const box=$('#searchGrid');
  $('#searchChips').style.display=tags.length?'flex':'none';
  if(!kw&&!tags.length){
    const h=getHist();
    box.innerHTML=`<div class="hist-wrap">
      <div class="hist-title"><b>搜索历史</b><span class="hist-clear" id="histClear" style="${h.length?'':'display:none;'}">清空</span></div>
      <div class="hist-rows">${h.length?h.map(k=>`<span class="hist-chip" data-kw="${k}">${k}</span>`).join(''):'<span style="font-size:12px;color:var(--text3);">暂无记录，搜过的关键词会出现在这里</span>'}</div>
    </div>`;
    return;
  }
  const list=state.products.filter(p=>{
    if(SEED_IDS.has(p.id))return false;
    if(p.sold||(p.stock!=null&&p.stock<=0))return false;
    if(kw&&!(p.name+CAT_MAP[p.cat]+p.cat+p.owner).toLowerCase().includes(kw.toLowerCase()))return false;
    if(!matchTags(p))return false;
    return true;
  }).sort((a,b)=>(b.ts||0)-(a.ts||0));
  const cond=kw&&tags.length?'关键词 + 分类':(kw?`“${kw}”`:`${tags.join(' · ')}`);
  box.innerHTML=list.length?list.map(goodsCard).join('')
    :`<div class="empty-tip">🧺 没有“${cond}”相关的闲置<br><span style="font-size:12px;">换个关键词或分类试试～</span></div>`;
}
function runSearch(kw){
  state.filter.kw=kw||'';
  $('#searchInput2').value=state.filter.kw;
  syncSearchClear2();
  addHist(state.filter.kw);
  renderSearchGoods();
}
$('#searchInput2').addEventListener('input',e=>{
  state.filter.kw=e.target.value.trim();
  syncSearchClear2();
  renderSearchGoods();
  /* 搜索词防抖入历史 */
  clearTimeout(histTimer);
  histTimer=setTimeout(()=>addHist(state.filter.kw),900);
});
function syncSearchClear2(){$('#searchClear2').style.display=$('#searchInput2').value?'flex':'none';}
$('#searchClear2').addEventListener('click',()=>{
  $('#searchInput2').value='';state.filter.kw='';
  renderSearchGoods();syncSearchClear2();$('#searchInput2').focus();
});
/* 搜索页各区域事件 */
$('#hotTags').addEventListener('click',e=>{
  const t=e.target.closest('[data-hot]');
  if(t)runSearch(t.dataset.hot);
});
$('#catPick').addEventListener('click',e=>{
  const m=e.target.closest('[data-major]');
  if(!m)return;
  const t=m.dataset.major;
  state.filter.tags=state.filter.tags.includes(t)?state.filter.tags.filter(x=>x!==t):[...state.filter.tags,t];
  renderSearchTools();renderSearchChips();renderSearchGoods();
});
$('#catPickSubs').addEventListener('click',e=>{
  const s=e.target.closest('[data-sub]');
  if(!s)return;
  const t=s.dataset.sub;
  state.filter.tags=state.filter.tags.includes(t)?state.filter.tags.filter(x=>x!==t):[...state.filter.tags,t];
  renderSearchTools();renderSearchChips();renderSearchGoods();
});
$('#searchChips').addEventListener('click',e=>{
  const clr=e.target.closest('[data-clr]');
  if(clr){state.filter.tags=[];renderSearchTools();renderSearchChips();renderSearchGoods();return;}
  const c=e.target.closest('[data-tag]');
  if(c){state.filter.tags=state.filter.tags.filter(t=>t!==c.dataset.tag);renderSearchTools();renderSearchChips();renderSearchGoods();}
});
$('#searchGrid').addEventListener('click',e=>{
  const chip=e.target.closest('.hist-chip');
  if(chip){runSearch(chip.dataset.kw);return;}
  if(e.target.closest('#histClear')){localStorage.removeItem('cu_searchHist');renderSearchGoods();return;}
  const g=e.target.closest('.goods');if(g)openDetail(g.dataset.id);
});
/* ---------- 分类筛选面板 ---------- */
let draftTags=new Set();
function renderCatPanel(){
  $('#catBody').innerHTML=CATS.map(sec=>{
    const mOn=draftTags.has(sec.major);
    const subs=sec.subs.map(s=>`<span class="schip ${draftTags.has(s)?'on':''}" data-tag="${s}">${s}</span>`).join('');
    return `<div class="cs-sec">
      <div class="cs-major"><span class="mchip ${mOn?'on':''}" data-major="${sec.major}">${sec.major}</span></div>
      <div class="cs-subs">${subs}</div>
    </div>`;
  }).join('');
}
function openCatPanel(){
  draftTags=new Set(state.filter.tags);
  renderCatPanel();
  $('#catOverlay').classList.add('show');
}
function closeCatPanel(){$('#catOverlay').classList.remove('show');}
$('#catBody').addEventListener('click',e=>{
  const m=e.target.closest('[data-major]');
  if(m){
    const sec=CATS.find(x=>x.major===m.dataset.major);
    if(draftTags.has(sec.major)){
      draftTags.delete(sec.major);
      sec.subs.forEach(s=>draftTags.delete(s));
    }else draftTags.add(sec.major);
    renderCatPanel();return;
  }
  const s=e.target.closest('[data-tag]');
  if(s){
    const t=s.dataset.tag;
    if(draftTags.has(t))draftTags.delete(t);
    else{
      draftTags.add(t);
      const sec=CATS.find(x=>x.subs.includes(t));
      if(sec)draftTags.delete(sec.major);
    }
    renderCatPanel();
  }
});
$('#catApply').addEventListener('click',()=>{
  state.filter.tags=[...draftTags];
  closeCatPanel();renderGoods();
  toast(state.filter.tags.length?`已按 ${state.filter.tags.length} 个标签筛选`:'已显示全部商品');
});
$('#catReset').addEventListener('click',()=>{draftTags=new Set();renderCatPanel();});
$('#catClear').addEventListener('click',()=>{draftTags=new Set();state.filter.tags=[];closeCatPanel();renderGoods();toast('已清除分类筛选');});
$('#catClose').addEventListener('click',closeCatPanel);
$('#catOverlay').addEventListener('click',e=>{if(e.target.id==='catOverlay')closeCatPanel();});

/* ---------- 闲鹅推荐价 ---------- */
const COND_FACTOR={'全新':1.15,'九成新':1,'八成新':0.8,'明显使用痕迹':0.55};
function marketRec(cat,cond,excludeOwner){
  const pool=state.products.filter(p=>!p.sold&&p.owner!==excludeOwner&&p.cond&&typeof p.price==='number'&&(CAT_MAP[p.cat]||p.cat)===cat);
  if(pool.length<3)return null;
  const tf=COND_FACTOR[cond]||1;
  const midOf=a=>a.length%2?a[(a.length-1)/2]:(a[a.length/2-1]+a[a.length/2])/2;
  const adj=pool.map(p=>p.price*(tf/(COND_FACTOR[p.cond]||1))).sort((a,b)=>a-b);
  const rough=midOf(adj);
  /* 剔除偏离中位数过大的离群样本，避免个别异常定价带偏推荐 */
  const core=adj.filter(x=>x>=rough*0.25&&x<=rough*1.75);
  const use=core.length>=3?core:adj;
  if(use.length<3)return null;
  const mid=midOf(use);
  const lo=use[Math.floor((use.length-1)*0.25)];
  const hi=use[Math.min(use.length-1,Math.ceil((use.length-1)*0.75))];
  return {mid:Math.round(mid),min:Math.round(lo),max:Math.round(hi),n:use.length};
}
let pubRecData=null;
function updatePubRec(){
  const cat=pubMajor();
  const box=$('#pubRec');
  if(!cat){box.style.display='none';pubRecData=null;return;}
  pubRecData=marketRec(cat,state.pubGrade,state.me&&state.me.name);
  box.style.display='flex';
  box.querySelector('.rb-main').innerHTML=pubRecData
    ?`闲鹅推荐价：<b>¥${pubRecData.mid}</b><span>闲鹅推荐价，仅校内行情参考</span>`
    :`暂无行情参考<span>同类在售样本不足，暂无法生成推荐价</span>`;
  $('#recFill').style.display=pubRecData?'':'none';
}
$('#recFill').addEventListener('click',()=>{
  if(!pubRecData)return;
  $('#pubPrice').value=pubRecData.mid;
  toast('已填入推荐价 ¥'+pubRecData.mid+'，可自由修改');
});

/* ---------- 商品详情 ---------- */
function curP(){return state.products.find(p=>p.id===state.currentProduct);}
/* 商品数据指标：浏览量 / 被收藏量（写入总线商品对象，全端同步） */
const viewMark={};
function bumpStat(p,key,delta){
  if(!p)return;
  p.stats=p.stats||{views:0,favs:0};
  p.stats[key]=Math.max(0,(p.stats[key]||0)+delta);
  pub(NS+'products/'+p.id,p,true);
}
function openDetail(id){
  state.currentProduct=id;
  if(state.me){state.history=[id,...state.history.filter(x=>x!==id)].slice(0,100);saveUserData();}
  /* 浏览量：30 秒内重复打开不重复计 */
  const p=curP();
  if(p&&(!viewMark[id]||Date.now()-viewMark[id]>30000)){viewMark[id]=Date.now();bumpStat(p,'views',1);}
  showView('detail');
}
function renderDetailOwnerState(){
  const p=curP();if(!p||p.owner===state.me?.name)return;
  const on=isOnline(p.owner);
  $('#dOwnerSub').innerHTML=`<span class="${on?'dot-on':'dot-off'}"></span> ${on?'在线 · 秒回消息':'离线 · 消息会保留'} · 东门驿站自提`;
}
function renderDetail(){
  const p=curP();if(!p)return;
  /* 媒体列表：图片 */
  const media=((p.imgs&&p.imgs.length)?p.imgs:(p.img?[p.img]:[])).map(s=>({t:'img',s}));
  $('#dEmoji').style.display=media.length?'none':'';
  $('#dEmoji').textContent=p.emoji||'📦';
  ['#dImg .d-carousel','#dImg .d-dots','#dImg .d-count','#dImg .d-arrow.left','#dImg .d-arrow.right','#dImg img'].forEach(sel=>{
    const el=$(sel);if(el)el.remove();
  });
  if(media.length){
    const car=document.createElement('div');
    car.className='d-carousel';
    car.innerHTML=media.map(m=>`<img src="${m.s}" class="viewerable" draggable="false">`).join('');
    $('#dImg').prepend(car);
    if(media.length>1){
      let idx=0;
      const cnt=document.createElement('div');
      cnt.className='d-count';cnt.textContent='1/'+media.length;
      $('#dImg').appendChild(cnt);
      const dots=document.createElement('div');
      dots.className='d-dots';
      dots.innerHTML=media.map((m,i)=>`<i class="${i===0?'on':''}"></i>`).join('');
      $('#dImg').appendChild(dots);
      /* 左右箭头：点按切换，配合手势滑动 */
      const go=n=>{
        idx=Math.max(0,Math.min(media.length-1,n));
        car.scrollTo({left:idx*car.clientWidth,behavior:'smooth'});
        cnt.textContent=(idx+1)+'/'+media.length;
        [...dots.children].forEach((d,i)=>d.classList.toggle('on',i===idx));
      };
      const al=document.createElement('div');
      al.className='d-arrow left';al.textContent='‹';
      al.addEventListener('click',e=>{e.stopPropagation();go(idx-1);});
      const ar=document.createElement('div');
      ar.className='d-arrow right';ar.textContent='›';
      ar.addEventListener('click',e=>{e.stopPropagation();go(idx+1);});
      $('#dImg').appendChild(al);
      $('#dImg').appendChild(ar);
      car.addEventListener('scroll',()=>{
        idx=Math.max(0,Math.min(media.length-1,Math.round(car.scrollLeft/Math.max(1,car.clientWidth))));
        cnt.textContent=(idx+1)+'/'+media.length;
        [...dots.children].forEach((d,i)=>d.classList.toggle('on',i===idx));
      },{passive:true});
    }
  }
  $('#dPrice').innerHTML=`<small>¥</small>${Number(p.price).toFixed(2)}`;
  $('#dTitle').textContent=p.name;
  $('#dMeta').innerHTML=`<span class="chip">${CAT_MAP[p.cat]||p.cat}${p.sub?' · '+p.sub:''}</span><span class="chip">${p.cond}</span><span class="chip orange">${p.trade||'线下面交'}</span>${p.sold||(p.stock!=null&&p.stock<=0)?'<span class="chip">已售出</span>':`<span class="chip">库存 ${p.stock!=null?p.stock:1} 件</span>`}`;
  $('#dAvatar').textContent=(p.owner||'?')[0];
  $('#dOwner').textContent=p.owner||'匿名用户';
  $('#dDesc').textContent=p.desc||'卖家很懒，没有写描述～';
  const tn=$('#dTradeNote');
  if(tn){
    const trade=p.trade||'线下面交';
    tn.innerHTML=`<b>交易方式</b> ${trade}${p.tradeNote?' · 卖家备注：'+p.tradeNote:''}`;
    tn.style.display='block';
  }
  $('#dViews').textContent='发布于 '+(p.ts?new Date(p.ts).toLocaleDateString('zh-CN'):'刚刚')
    +(p.stats?` · 👁 ${(p.stats.views||0)} 次浏览 · ❤ ${(p.stats.favs||0)} 人收藏`:' · 👁 1 次浏览 · ❤ 0 人收藏');
  $('#dCanCut').textContent='可小刀';
  $('#dCanCut').style.display=(p.cut||'接受小刀')==='不接受小刀'?'none':'';
  const mine=state.me&&p.owner===state.me.name;
  $('#dFav').style.display=mine?'none':'';
  const soldOut=p.sold||(p.stock!=null&&p.stock<=0);
  $('#dContactSeller').style.display=(mine||soldOut)?'none':'';
  $('#dBuy').style.display=(mine||soldOut)?'none':'';
  const rec=marketRec(CAT_MAP[p.cat]||p.cat,p.cond,p.owner);
  const rt=$('#dRec');
  if(!mine){
    rt.style.display='inline-flex';
    if(rec){rt.classList.remove('none');rt.innerHTML='🦢 闲鹅推荐价 <b>¥'+rec.mid+'</b>';rt.dataset.rec=JSON.stringify(rec);}
    else{rt.classList.add('none');rt.innerHTML='🦢 暂无行情参考';rt.dataset.rec='';}
  }else rt.style.display='none';
  let dk=$('#dDel');
  if(mine){
    if(!dk){dk=document.createElement('div');dk.className='btn btn-ghost';dk.id='dDel';$('#dBtns').appendChild(dk);dk.addEventListener('click',delistProduct);}
    dk.style.display='';dk.textContent=p.sold?'删除记录':'下架商品';
    let de=$('#dEdit');
    if(!de){de=document.createElement('div');de.className='btn btn-ghost';de.id='dEdit';de.textContent='编辑商品';$('#dBtns').appendChild(de);de.addEventListener('click',()=>{const pp=curP();if(pp)fillPublish(pp);});}
    de.style.display=p.sold?'none':'';
  }else{
    if(dk)dk.style.display='none';
    const de=$('#dEdit');if(de)de.style.display='none';
  }
  renderDetailOwnerState();
  updateFavBtn();
}
function updateFavBtn(){
  const faved=state.favs.has(state.currentProduct);
  $('#dFav').classList.toggle('faved',faved);
  $('#dFav span').textContent=faved?'已收藏':'收藏';
}
function delistProduct(){
  const p=curP();if(!p)return;
  if(pub(NS+'products/'+p.id,null,true)){
    state.products=state.products.filter(x=>x.id!==p.id);
    toast(p.sold?'已删除记录':'商品已下架');
    showView('home');
  }
}
$('#dFav').addEventListener('click',()=>{
  const id=state.currentProduct;
  const p=curP();
  if(state.favs.has(id)){state.favs.delete(id);toast('已取消收藏');if(p)bumpStat(p,'favs',-1);}
  else{state.favs.add(id);toast('已加入收藏 ❤️');if(p)bumpStat(p,'favs',1);}
  saveUserData();updateFavBtn();
});
$('#dContactSeller').addEventListener('click',()=>{
  const p=curP();if(!p)return;
  if(state.me&&p.owner!==state.me.name){state.chatProducts[p.owner]=p.id;saveUserData();}
  openChatWith(p.owner,p.id);
});
$('#dBuy').addEventListener('click',()=>{
  const p=curP();
  if(!p||!state.me||p.owner===state.me.name)return;
  placeOrder(p);
});
$('#dShare').addEventListener('click',()=>toast('链接已复制，快分享给同学吧'));
/* 闲鹅推荐价说明弹窗 */
$('#dRec').addEventListener('click',()=>{
  const raw=$('#dRec').dataset.rec;
  if(!raw){toast('同类在售不足，暂无行情参考');return;}
  const rec=JSON.parse(raw);
  $('#recBody').innerHTML=`
    <div class="rc-price"><small>¥</small>${rec.mid}</div>
    <div class="rc-range">
      <div class="rr"><span>行情低点</span><b>¥${rec.min}</b></div>
      <div class="rr"><span>行情高点</span><b>¥${rec.max}</b></div>
      <div class="rr"><span>同类在售</span><b>${rec.n} 件</b></div>
    </div>
    <div class="rc-note">🦢 推荐价基于校内市集当前同类闲置的售价，按成色折算后取中位数得出；价格区间为同类商品折算后的波动范围。仅供定价参考，实际成交以买卖双方协商为准，担保交易保障资金安全。</div>`;
  $('#recOverlay').classList.add('show');
});
$('#recClose').addEventListener('click',()=>$('#recOverlay').classList.remove('show'));
$('#recOverlay').addEventListener('click',e=>{if(e.target.id==='recOverlay')$('#recOverlay').classList.remove('show');});

/* ---------- 真人聊天 ---------- */
const pairId=(a,b)=>[a,b].sort().join('__');
/* 频道模型：每个商品/订单一个独立聊天频道，key=peer|pid；旧纯好友聊天 key=peer */
function threadKey(peer,pid){return pid?peer+'|'+pid:peer;}
function parseThread(k){
  if(!k)return {peer:'',pid:null};
  const i=k.indexOf('|');
  return i<0?{peer:k,pid:null}:{peer:k.slice(0,i),pid:k.slice(i+1)};
}
function ensureChatSub(){
  if(!state.me||!state.currentPeer||!mq)return;
  const t=NS+'chat/'+pairId(state.me.name,state.currentPeer)+'/+';
  if(chatSubTopic===t)return;
  if(chatSubTopic)mq.unsubscribe(chatSubTopic);
  mq.subscribe(t);chatSubTopic=t;
}
function openChatWith(peer,pid){
  if(!state.me)return;
  if(peer===state.me.name){toast('这是你自己发布的商品哦');return;}
  state.currentPeer=peer;
  state.currentThread=threadKey(peer,pid||null);
  /* 记录本次会话中我的角色，快捷语据此切换 */
  const o=state.orders.find(o=>(!pid||o.productId===pid)&&((o.seller===state.me.name&&o.buyer===peer)||(o.buyer===state.me.name&&o.seller===peer)));
  const rp=pid?state.products.find(x=>x.id===pid):null;
  const role=o?(o.seller===state.me.name?'seller':'buyer'):(rp?(rp.owner===state.me.name?'seller':'buyer'):null);
  if(role){
    state.peerRoles=state.peerRoles||{};
    if(state.peerRoles[peer]!==role){state.peerRoles[peer]=role;saveUserData();}
  }
  showView('chat');
}
/* ---------- 移除 CodeSandbox 预览注入的 Open Sandbox 悬浮按钮 ---------- */
function hideSandboxBadge(){
  const el=document.querySelector('iframe[id^="sb__open-sandbox"]');
  if(el){el.style.setProperty('display','none','important');el.style.pointerEvents='none';}
}
hideSandboxBadge();
setInterval(hideSandboxBadge,1500);
try{new MutationObserver(hideSandboxBadge).observe(document.body,{childList:true});}catch(e){}
/* ---------- 聊天表情包 ---------- */
const STICKERS=[
  {code:'stk#1',name:'收到',src:'img/stk1.jpg'},
  {code:'stk#2',name:'看看',src:'img/stk2.jpg'},
  {code:'stk#3',name:'出物啦',src:'img/stk3.jpg'},
  {code:'stk#4',name:'靠谱',src:'img/stk4.jpg'},
  {code:'stk#5',name:'等你消息',src:'img/stk5.jpg'},
];
const STK_MAP={};
STICKERS.forEach(s=>STK_MAP[s.code]=s);
$('#stkPanel').innerHTML=STICKERS.map(s=>`<div class="stk-item" data-stk="${s.code}" title="${s.name}"><img src="${s.src}" alt="${s.name}"></div>`).join('');
$('#stkBtn').addEventListener('click',()=>{
  const p=$('#stkPanel');
  p.classList.toggle('show');
  $('#stkBtn').classList.toggle('on',p.classList.contains('show'));
});
$('#stkPanel').addEventListener('click',e=>{
  const it=e.target.closest('[data-stk]');
  if(!it||!state.currentPeer)return;
  sendChat('',it.dataset.stk);
  $('#stkPanel').classList.remove('show');
  $('#stkBtn').classList.remove('on');
});
/* ---------- 买卖身份与快捷语 ---------- */
const QUICK_BUYER=['这个还在吗？','能便宜一点吗？','我想当面验货','什么时候方便面交？','可以送到楼下吗？'];
const QUICK_SELLER=['在的，随时可以看','已经是实价啦','支持当面验货','今晚就能送到楼下','还有其他想了解的？'];
function chatRole(){
  const peer=state.currentPeer;
  if(!peer||!state.me)return 'buyer';
  const th=parseThread(state.currentThread||'');
  /* 当前频道的商品归属优先（每个商品频道独立） */
  if(th.pid){
    const p=state.products.find(x=>x.id===th.pid);
    if(p)return p.owner===state.me.name?'seller':'buyer';
  }
  /* 有订单以订单为准 */
  const o=state.orders.find(o=>(o.seller===state.me.name&&o.buyer===peer)||(o.buyer===state.me.name&&o.seller===peer));
  if(o)return o.seller===state.me.name?'seller':'buyer';
  const pid=state.chatProducts[peer];
  const p2=pid?state.products.find(x=>x.id===pid):null;
  if(p2)return p2.owner===state.me.name?'seller':'buyer';
  const saved=state.peerRoles&&state.peerRoles[peer];
  return saved||'buyer';
}
function renderQuick(){
  const role=chatRole();
  const box=$('#quickRow');
  if(!box)return;
  const words=role==='seller'?QUICK_SELLER:QUICK_BUYER;
  const tip=role==='seller'?'卖家快捷语':'买家快捷语';
  box.innerHTML=`<span class="quick-tip">${tip}</span>`+words.map(t=>`<span class="quick">${t}</span>`).join('');
}
function renderChatHead(){
  const on=isOnline(state.currentPeer);
  $('#cPeer').textContent=state.currentPeer;
  $('#cPeerAva').textContent=(state.currentPeer||'?')[0];
  $('#cPeerSub').innerHTML=`<span class="${on?'dot-on':'dot-off'}"></span> ${on?'在线 · 消息实时送达':'离线 · 消息会保留'}`;
  renderChatProd();
}
/* 点击对方头像/昵称 → 他人主页 */
$('#cPeerBox').addEventListener('click',()=>{if(state.currentPeer)openUserPage(state.currentPeer);});
/* ---------- 他人个人主页 ---------- */
function openUserPage(name){
  if(!name)return;
  state.userPageWho=name;
  showView('userpage');
}
/* 在线数据摘要：上总线，供他人主页查看 */
function activitySummary(){
  const d=dailyAvgHours(),t=topPeriod(),r=avgReplyMs();
  const sellDone=state.orders.filter(o=>o.seller===state.me.name&&o.status===3).length;
  const buyDone=state.orders.filter(o=>o.buyer===state.me.name&&o.status===3).length;
  const sellAll=state.orders.filter(o=>o.seller===state.me.name).length;
  return {daily:d!=null?+d.toFixed(1):null,hours:t?[t[0],t[1]]:null,reply:r!=null?Math.round(r/1000):null,
    sell:sellDone,buy:buyDone,rate:sellAll?Math.round(sellDone/sellAll*100):98,ts:Date.now()};
}
let pubActTs=0;
function publishActivity(force){
  if(!state.me)return;
  const now=Date.now();
  if(!force&&now-pubActTs<120000)return;
  pubActTs=now;
  const rec=state.users[state.me.name];
  /* 必须已有账号记录（含 pass）才合并发布，避免覆盖账号数据 */
  if(!rec||!rec.pass)return;
  const next=Object.assign({},rec,{act:activitySummary(),ts:now});
  state.users[state.me.name]=next;
  pub(NS+'users/'+encodeURIComponent(state.me.name),next,true);
}
function renderUserPage(){
  const who=state.userPageWho;
  const u=who?state.users[who]:null;
  const isMe=who&&who===state.me?.name;
  $('#upAvatar').textContent=(who||'?')[0];
  $('#upName').textContent=who||'匿名用户';
  $('#upBio').textContent=(u&&u.bio)||'校园闲置用户 · 诚信交易，欢迎咨询～';
  const on=isOnline(who);
  $('#upOnlinePill').innerHTML=`<i class="${on?'dot-on':'dot-off'}"></i>${on?'在线':'离线'}`;
  const goods=state.products.filter(p=>p.owner===who);
  const onSale=goods.filter(p=>!p.sold&&(p.stock==null||p.stock>0));
  const act=(u&&u.act)||(isMe?activitySummary():null);
  const sellOrders=state.orders.filter(o=>o.seller===who);
  const localSell=sellOrders.filter(o=>o.status===3).length;
  const localBuy=state.orders.filter(o=>o.buyer===who&&o.status===3).length;
  const doneSell=act&&act.sell!=null?act.sell:localSell;
  const buyDone=act&&act.buy!=null?act.buy:localBuy;
  /* 好评率：有成交按完成率计算，无成交显示默认 */
  const rate=act&&act.rate!=null?act.rate:(sellOrders.length?Math.round(localSell/sellOrders.length*100):98);
  $('#upRatePill').textContent='好评率 '+rate+'%';
  $('#usSell').textContent=doneSell;
  $('#usBuy').textContent=buyDone;
  $('#usOnSale').textContent=onSale.length;
  const fmtDur=s=>s==null?'–':(s<60?s+' 秒':Math.round(s/60)+' 分钟');
  $('#upDaily').textContent=act&&act.daily!=null?act.daily.toFixed(1)+' 小时':'–';
  $('#upHours').textContent=act&&act.hours?act.hours[0]+'–'+(act.hours[1]+1)+' 点':'–';
  $('#upReply').textContent=act?fmtDur(act.reply):'–';
  $('#upCount').textContent=onSale.length;
  $('#upGoods').innerHTML=onSale.length?onSale.sort((a,b)=>(b.ts||0)-(a.ts||0)).map(goodsCard).join('')
    :`<div class="empty-tip">🧺 TA 暂时没有在售的闲置</div>`;
  if(isMe)publishActivity();
}
/* 聊天页顶部迷你商品卡：直达下单闭环 */
function renderChatProd(){
  const box=$('#chatProd');if(!box)return;
  const th=parseThread(state.currentThread||state.currentPeer||'');
  const peer=th.peer||state.currentPeer;
  let p=null,o=null;
  if(th.pid){
    /* 商品频道：商品卡与订单都按该商品精确匹配 */
    p=state.products.find(x=>x.id===th.pid)||null;
    o=(state.me?state.orders.find(x=>x.productId===th.pid&&((x.buyer===state.me.name&&x.seller===peer)||(x.seller===state.me.name&&x.buyer===peer))):null)||null;
    if(!p&&o)p=state.products.find(x=>x.id===o.productId)||null;
  }
  if(!p){
    const o2=(state.me&&peer)?state.orders.find(x=>(x.buyer===state.me.name&&x.seller===peer)||(x.seller===state.me.name&&x.buyer===peer)):null;
    o=o2||null;
    const cpid=state.chatProducts[peer];
    p=(cpid?state.products.find(x=>x.id===cpid):null)||(o2?state.products.find(x=>x.id===o2.productId):null);
  }
  if(!p){box.style.display='none';box.innerHTML='';return;}
  const iAmSeller=state.me&&p.owner===state.me.name;
  const hasOrder=!!o&&o.productId===p.id;
  const buyable=!iAmSeller&&!p.sold&&!hasOrder;
  /* 已下单：按钮变成查看订单进度（买卖双方都可以看） */
  const btn=hasOrder?'查看订单进度':iAmSeller?'等待买家下单':(p.sold?'已售出':'立即下单');
  box.style.display='flex';
  box.innerHTML=`
    <div class="cp-img">${p.img?`<img src="${p.img}">`:p.emoji||'📦'}</div>
    <div class="cp-info">
      <div class="cp-name">${p.name}</div>
      <div class="cp-price"><small>¥</small>${p.price}</div>
      <div class="cp-trade">${p.trade||'线下面交'}${p.tradeNote?' · '+p.tradeNote:''}${!iAmSeller&&!p.sold&&p.stock!=null&&p.stock>1?' · 剩 '+p.stock+' 件':''}</div>
    </div>
    <div class="cp-buy ${hasOrder||buyable?'':'off'}" id="cpBuy">${btn}</div>`;
}
$('#chatProd').addEventListener('click',e=>{
  const th=parseThread(state.currentThread||state.currentPeer||'');
  const peer=th.peer||state.currentPeer;
  const p=th.pid?state.products.find(x=>x.id===th.pid):null;
  if(!p){
    const o2=(state.me&&peer)?state.orders.find(x=>(x.buyer===state.me.name&&x.seller===peer)||(x.seller===state.me.name&&x.buyer===peer)):null;
    openDetail(o2?o2.productId:(state.chatProducts[peer]||''));
    return;
  }
  if(e.target.closest('#cpBuy')){
    const o=state.orders.find(x=>x.productId===p.id&&((x.buyer===state.me.name&&x.seller===peer)||(x.seller===state.me.name&&x.buyer===peer)));
    if(o){state.currentOrder=o.id;showView('order');return;}
    placeOrder(p);
    return;
  }
  openDetail(p.id);
});
/* 下单：详情页与聊天页共用 */
function placeOrder(p){
  if(!p||!state.me||p.owner===state.me.name||p.sold)return;
  const o={id:'o'+Date.now(),buyer:state.me.name,seller:p.owner,productId:p.id,status:0,station:state.station||'东门驿站',
    trade:p.trade||'线下面交',tradeNote:p.tradeNote||'',buyerNote:'',ts:Date.now()};
  if(pub(NS+'orders/'+o.id,o,true)){
    state.orders.unshift(o);state.currentOrder=o.id;
    /* 下单即建立该商品的独立聊天频道 */
    state.chatProducts[p.owner]=p.id;
    state.currentThread=threadKey(p.owner,p.id);
    /* 库存扣减：减到 0 自动下架，主页不再显示 */
    const pp=state.products.find(x=>x.id===p.id);
    if(pp){
      const st=pp.stock==null?1:pp.stock;
      if(st<=1){pp.stock=0;pp.sold=true;toast('下单成功，已通知卖家 🧾（最后一件，商品已自动下架）');}
      else{pp.stock=st-1;toast('下单成功，已通知卖家 🧾');}
      pub(NS+'products/'+pp.id,pp,true);
    }else toast('下单成功，已通知卖家 🧾');
    showView('order');
  }
}
/* 聊天时间格式化：今天 HH:MM / 昨天 HH:MM / M月D日 HH:MM */
function fmtChatTime(ts){
  const d=new Date(ts),now=new Date();
  const hm=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
  if(d.toDateString()===now.toDateString())return hm;
  const y=new Date(now);y.setDate(now.getDate()-1);
  if(d.toDateString()===y.toDateString())return '昨天 '+hm;
  if(d.getFullYear()===now.getFullYear())return (d.getMonth()+1)+'月'+d.getDate()+'日 '+hm;
  return d.getFullYear()+'年'+(d.getMonth()+1)+'月'+d.getDate()+'日 '+hm;
}
function renderChat(){
  if(!state.currentPeer)return;
  if(!state.currentThread)state.currentThread=state.currentPeer;
  renderChatHead();
  renderQuick();
  const area=$('#chatArea');
  const log=(state.chatLog[state.currentThread]||[]).filter(m=>m.text||m.img);
  if(state.unread[state.currentThread]){state.unread[state.currentThread]=0;updateUnread();saveUserData();}
  if(!log.length){area.innerHTML=`<div class="chat-empty">🙋 和 ${state.currentPeer} 打个招呼吧<br>对方上线后就能收到你的消息</div>`;return;}
  /* 微信式时间：与上一条间隔 >10 分钟才显示 */
  const GAP=10*60*1000;
  let prevTs=0;
  let lastMineIdx=-1;
  log.forEach((m,i)=>{if(m.from===state.me.name)lastMineIdx=i;});
  area.innerHTML=log.map((m,i)=>{
    const mine=m.from===state.me.name;
    const av=mine?`<div class="avatar me">${state.me.name[0]}</div>`:`<div class="avatar">${state.currentPeer[0]}</div>`;
    const stk=m.img&&m.img.indexOf('stk#')===0?STK_MAP[m.img]:null;
    const body=`<div class="bubble">${stk?`<img class="stk-msg" src="${stk.src}" alt="${stk.name}" style="margin-bottom:${m.text?'8px':'0'};">`:(m.img?`<img class="viewerable" src="${m.img}" style="width:150px;border-radius:10px;display:block;margin-bottom:${m.text?'8px':'0'};">`:'')}${m.text||''}</div>`;
    /* 只在我方最后一条消息下显示已读/未读 */
    const rd=mine&&i===lastMineIdx?`<div class="rd-state ${m.readAt?'read':''}">${m.readAt?'已读':'未读'}</div>`:'';
    let timeHtml='';
    if(!prevTs||(m.ts-prevTs)>GAP)timeHtml=`<div class="chat-time"><span>${fmtChatTime(m.ts)}</span></div>`;
    prevTs=m.ts;
    return timeHtml+`<div class="msg ${mine?'right':'left'}">${av}<div class="msg-col">${body}${rd}</div></div>`;
  }).join('');
  scrollChatBottom();
  markRead();
}
/* 定位到聊天最下方：渲染后 + 图片加载后再各校正一次 */
function scrollChatBottom(){
  const area=$('#chatArea');if(!area)return;
  requestAnimationFrame(()=>{area.scrollTop=area.scrollHeight;setTimeout(()=>{area.scrollTop=area.scrollHeight;},160);});
}
$('#chatArea').addEventListener('load',scrollChatBottom,true);
/* 把对方发来的未读消息标记为已读，并回执给发送方 */
function markRead(){
  const peer=state.currentPeer;
  if(!peer||!state.me)return;
  const log=state.chatLog[state.currentThread||peer]||[];
  let changed=false;
  log.forEach(m=>{
    if(m.to===state.me.name&&!m.readAt){
      m.readAt=Date.now();changed=true;
      const payload=JSON.stringify(m);
      const topic=NS+'chat/'+pairId(m.from,m.to)+'/'+m.ts;
      if(mq&&mq.connected){mq.publish(topic,payload,{qos:0,retain:true});mirrorPublish(topic,payload,true);}
      else if(outbox.length<300)outbox.push({topic,payload,retain:true});
    }
  });
  if(changed)saveSoon();
}
function sendChat(text,img){
  if((!text||!text.trim())&&!img)return;
  const msg={from:state.me.name,to:state.currentPeer,text:(text||'').trim(),img:img||null,
    pid:parseThread(state.currentThread||'').pid||null,ts:Date.now()};
  const log=state.chatLog[state.currentThread||state.currentPeer]=state.chatLog[state.currentThread||state.currentPeer]||[];
  log.push(msg);
  /* 统计回复速度：从收到对方消息到自己发出消息的间隔 */
  const a=state.activity;
  const lr=a.lastRecv[state.currentPeer];
  if(lr){
    const delta=Date.now()-lr;
    if(delta>0&&delta<6*3600*1000){a.replies.n++;a.replies.total+=delta;}
    delete a.lastRecv[state.currentPeer];
  }
  const topic=NS+'chat/'+pairId(state.me.name,state.currentPeer)+'/'+msg.ts;
  const payload=JSON.stringify(msg);
  if(mq&&mq.connected){mq.publish(topic,payload,{qos:0,retain:true});mirrorPublish(topic,payload,true);}
  else{if(outbox.length<300)outbox.push({topic,payload,retain:true});toast('网络未连接，消息已暂存，恢复后自动送达');}
  renderChat();
  saveUserData();
  scheduleArchive();
}
$('#chatSend').addEventListener('click',()=>{sendChat($('#chatInput').value);$('#chatInput').value='';});
$('#chatInput').addEventListener('keydown',e=>{if(e.key==='Enter'){sendChat(e.target.value);e.target.value='';}});
$('#quickRow').addEventListener('click',e=>{if(e.target.classList.contains('quick'))sendChat(e.target.textContent);});
$('#cGoOrder').addEventListener('click',()=>{
  const o=state.orders.find(o=>(o.seller===state.currentPeer||o.buyer===state.currentPeer));
  if(!o){toast('你和对方还没有订单');return;}
  state.currentOrder=o.id;showView('order');
});
function updateUnread(){
  const total=Object.values(state.unread).reduce((a,b)=>a+b,0);
  const b=$('#unreadBadge');
  b.style.display=total?'flex':'none';
  b.textContent=total>99?'99+':total;
}

/* ---------- 消息列表 ---------- */
function fmtTime(ts){
  const d=new Date(ts),n=new Date();
  const hm=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
  if(d.toDateString()===n.toDateString())return hm;
  return (d.getMonth()+1)+'/'+d.getDate()+' '+hm;
}
function peerProduct(peer){
  const o=state.orders.find(o=>(o.buyer===peer&&o.seller===state.me.name)||(o.seller===peer&&o.buyer===state.me.name));
  const pid=o?o.productId:state.chatProducts[peer];
  let p=pid&&state.products.find(x=>x.id===pid);
  if(!p)p=state.products.find(x=>x.owner===peer&&!x.sold);
  return p||null;
}
function renderMsgs(){
  if(!state.me)return;
  /* 每个频道（peer 或 peer|商品）一行；同一卖家不同商品各自独立 */
  const list=Object.entries(state.chatLog)
    .map(([key,log])=>{
      const th=parseThread(key);
      return {key,peer:th.peer,pid:th.pid,log:log.filter(m=>m.text||m.img)};
    })
    .filter(x=>x.log.length)
    .sort((a,b)=>b.log[b.log.length-1].ts-a.log[a.log.length-1].ts);
  $('#msgList').innerHTML=list.length?list.map(({key,peer,pid,log})=>{
    const last=log[log.length-1];
    const prevImg=last.img?(last.img.indexOf('stk#')===0?'[表情包] ':'[图片] '):'';
    const prev=(last.from===state.me.name?'我：':'')+prevImg+(last.text||'');
    /* 频道商品：pid 精确匹配，其次订单/最近聊天商品 */
    const o=state.orders.find(x=>(!pid||x.productId===pid)&&((x.buyer===state.me.name&&x.seller===peer)||(x.seller===state.me.name&&x.buyer===peer)));
    const usePid=pid||(o&&o.productId)||state.chatProducts[peer];
    const p=usePid?state.products.find(x=>x.id===usePid):null;
    const un=state.unread[key]||0;
    return `<div class="card msg-row" data-peer="${peer}" data-pid="${pid||''}">
      <div class="avatar">${peer[0]}</div>
      <div class="m-main">
        <div class="m-top"><b>${peer}</b><span class="m-time">${fmtTime(last.ts)}</span></div>
        <div class="m-prev">${prev}</div>
        ${p?`<div class="m-good"><div class="mg-img">${p.img?`<img src="${p.img}">`:p.emoji||'📦'}</div><span>${p.name}</span><b>${fmt(p.price)}</b></div>`:''}
      </div>
      ${un?`<span class="m-unread">${un>99?'99+':un}</span>`:''}
    </div>`;
  }).join(''):`<div class="chat-empty" style="margin-top:60px;">📭 还没有消息<br>去商品详情点「联系卖家」开始第一段对话吧</div>`;
}
$('#msgList').addEventListener('click',e=>{
  const r=e.target.closest('[data-peer]');
  if(r)openChatWith(r.dataset.peer,r.dataset.pid||null);
});

/* ---------- 个人中心 ---------- */
function renderProfile(){
  if(!state.me)return;
  const myPub=state.products.filter(p=>p.owner===state.me.name);
  const myOrders=state.orders.filter(o=>o.buyer===state.me.name||o.seller===state.me.name);
  $('#stPub').textContent=myPub.filter(p=>!p.sold).length;
  $('#stSold').textContent=myOrders.filter(o=>o.seller===state.me.name&&o.status===3).length;
  $('#stBought').textContent=myOrders.filter(o=>o.buyer===state.me.name).length;
  $('#ordBadge').textContent=myOrders.filter(o=>o.status<3).length+' 个进行中';
  const favHtml=[...state.favs].map(id=>{
    const p=state.products.find(x=>x.id===id);
    return p?`<div class="card sub-row" data-id="${p.id}">
      <div class="avatar">${p.owner[0]}</div>
      <div class="m-main">
        <div class="m-top"><b>${p.owner}</b><span class="m-time">${p.cond}</span></div>
        <div class="m-good"><div class="mg-img">${p.img?`<img src="${p.img}">`:p.emoji||'📦'}</div><span>${p.name}</span><b>${fmt(p.price)}</b></div>
      </div>
    </div>`:'';
  }).join('');
  $('#sub-fav').innerHTML=favHtml||'<div class="chat-empty" style="margin:6px 0;">❤️ 收藏夹空空的，去逛逛吧</div>';
  /* 在线数据由真实行为统计得出 */
  const da=dailyAvgHours();
  $('#moDaily').textContent=da?da.toFixed(1)+' 小时':'–';
  const tp=topPeriod();
  $('#moHours').textContent=tp?tp[0]+'–'+(tp[1]+1)+' 点':'–';
  const ar=avgReplyMs();
  $('#moReply').textContent=ar?(ar<60000?Math.max(1,Math.round(ar/1000))+' 秒':Math.round(ar/60000)+' 分钟'):'–';
  /* 在线数据同步到总线，供他人主页展示 */
  publishActivity();
}
/* ---------- 版本公告 ---------- */
const APP_VERSION='v5.9.7';
const CHANGELOG=[
  {v:'v5.9.7',d:'11-20',cur:true,t:'加载可靠性增强：mqtt 组件源加载失败时自动切换备用 CDN，避免一直卡在「正在连接市集」'},
  {v:'v5.9.6',d:'11-20',t:'移除视频上传功能，上传只支持图片（最多 4 张），历史商品中的视频不再展示'},
  {v:'v5.9.5',d:'11-20',t:'频道导航平铺到首页（闲鱼样式）：一行排序/筛选频道 + 一排图标分类频道，点右侧箭头打开全部频道弹窗'},
  {v:'v5.9.4',d:'11-20',t:'首页搜索框新增下拉筛选频道面板：推荐/最新发布/热门商品排序，支持面交/可议价筛选，11 个商品大类一键筛选；首页标题改为「闲鹅校园二手APP」'},
  {v:'v5.9.3',d:'11-20',t:'移除个人中心的「偏好档案」模块，页面更简洁'},
  {v:'v5.9.2',d:'11-20',t:'网络稳定性大修：超限大消息不再发给服务器（之前会被服务器踢掉连接导致反复掉线）；节点重连策略放缓'},
  {v:'v5.8',d:'11-20',t:'修复上传图片失效；订单详情图片缩小；全站图片点击看大图（双指缩放/双击放大）；广场帖子可发图片和表情包，评论也能发表情；我的点赞与我的收藏分开'},
  {v:'v5.7',d:'11-20',t:'聊天按商品分频道：每个订单一个独立聊天；聊天顶部商品卡与订单精确对应，已下单显示查看进度'},
  {v:'v5.6',d:'11-20',t:'商品可编辑（重新打开编辑页改图/价格/交易方式）；库存设置：下单自动减一、0 件自动下架；聊天页已下单显示查看订单进度'},
  {v:'v5.5',d:'11-20',t:'详情页单图不滑动、多图才可滑；消息列表页显示底部导航；进入聊天自动定位最新消息'},
  {v:'v5.4',d:'11-20',t:'聊天点头像进主页（好评率/卖出买入/在售/在线三指标）；消息已读回执；发布可选面交或送楼下并备注；买卖快捷语分开；修复发布页上传区'},
  {v:'v5.3',d:'11-20',t:'聊天页点击对方头像进个人主页；商品新增浏览量/收藏量；首页搜索直达独立搜索页：热门搜索+全新分类体系，支持关键词+分类组合筛选'},
  {v:'v5.2',d:'11-20',t:'聊天页直达下单（顶部商品卡+立即下单）；搜索历史记录；未传图发布按钮置灰；字号与对比度全面优化'},
  {v:'v5.1',d:'11-20',t:'搜索结果独立页面：输入关键词即切换，只显示搜索框与结果；删除全部演示商品，仅保留真实发布'},
  {v:'v5.0',d:'11-19',t:'全新橙色主题：顶部橙色色块、全站按钮统一橙色系；全面放宽内边距，按钮不再贴边'},
  {v:'v4.9',d:'11-19',t:'返回按钮全面升级为"回到上一步"；商品多图新增左右点按箭头'},
  {v:'v4.8',d:'11-19',t:'访客模式：打开即用，自动分配 1~10 号体验账号，无需注册登录'},
  {v:'v4.7',d:'11-19',t:'商品多图滑动浏览；买卖双方快捷语区分；聊天时间分隔（10 分钟规则）；全新闲鹅开屏图标'},
  {v:'v4.6',d:'11-19',t:'历史数据恢复：商品/聊天跨节点补齐，登录后自动再取一次历史消息'},
  {v:'v4.5',d:'11-19',t:'跨节点数据同步：所有数据镜像写入三个总线节点，历史数据不因连接节点切换而丢失'},
  {v:'v4.4',d:'11-18',t:'聊天新增闲鹅表情包（5 款）；移除遮挡按键的 Open Sandbox 悬浮按钮'},
  {v:'v4.3',d:'11-18',t:'连接提速：三个总线节点并行竞速，自动采用最快连上的节点'},
  {v:'v4.2',d:'11-18',t:'多总线节点自动切换：主节点连不上时自动启用备用节点，市集数据自动补种'},
  {v:'v4.1',d:'11-18',t:'连接稳定性优化：断线自动重连、消息暂存补发、登录等待更耐心'},
  {v:'v4.0',d:'11-18',t:'闲鹅广场上线：水聊发帖、点赞收藏评论；浏览记录永久保存（上限 100 条）'},
  {v:'v3.6',d:'11-17',t:'发布页新增 AI 生成描述、推荐价一键填入、议价设置（接受/不接受小刀）；我的发布与订单列表页'},
  {v:'v3.5',d:'11-17',t:'搜索一键清空；发布标签支持搜索自选；聊天记录永久保留；个人中心子列表卡片化'},
  {v:'v3.0',d:'11-16',t:'闲鹅推荐价：同类行情参考价，点击可查看价格区间说明'},
  {v:'v2.6',d:'11-16',t:'偏好档案可折叠；个人主页在线统计改为真实行为数据'},
  {v:'v2.5',d:'11-16',t:'消息中心：底部消息入口汇总全部对话，未读红点提醒'},
  {v:'v2.0',d:'11-15',t:'多用户在线版：账号登录注册、商品全端实时共享、真人聊天'},
  {v:'v1.0',d:'11-14',t:'首发演示版：浏览、下单、校内站点自提全流程'},
];
function renderChangelog(){
  $('#logList').innerHTML=`<div class="log-cur">当前版本 <b>${APP_VERSION}</b> · 已是最新 🦢</div>`
    +CHANGELOG.map(l=>`
    <div class="card log-item ${l.cur?'latest':''}">
      <div class="log-head"><span class="log-v">${l.v}</span>${l.cur?'<span class="log-now">当前版本</span>':''}<span class="log-date">${l.d} 更新</span></div>
      <div class="log-text">${l.t}</div>
    </div>`).join('');
}
$('#annBtn').addEventListener('click',()=>showView('changelog'));
/* ---------- 广场 ---------- */
/* 发帖媒体：图片 + 表情包 */
let postImgs=[],postStk=null;
function renderPostTools(){
  const g=$('#postGrid');
  let html=postImgs.map((src,i)=>`<div class="up-tile up-pic" data-pdel="${i}"><img src="${src}"><span class="del">×</span></div>`).join('');
  if(postImgs.length<3)html+=`<div class="up-tile up-add" id="postAddTile"><b>＋</b>发图片</div>`;
  if(postStk)html+=`<div class="up-tile up-pic" data-pstkdel><img src="${STK_MAP[postStk].src}"><span class="del">×</span></div>`;
  g.innerHTML=html;
}
$('#postStkRow').innerHTML=STICKERS.map(s=>`<div class="stk-item" data-poststk="${s.code}" title="${s.name}"><img src="${s.src}" alt="${s.name}"></div>`).join('');
$('#postStkBtn').addEventListener('click',()=>$('#postStkRow').classList.toggle('show'));
$('#postStkRow').addEventListener('click',e=>{
  const it=e.target.closest('[data-poststk]');
  if(it){postStk=it.dataset.poststk;$('#postStkRow').classList.remove('show');renderPostTools();}
});
$('#postGrid').addEventListener('click',e=>{
  const del=e.target.closest('[data-pdel]');
  if(del){postImgs.splice(+del.dataset.pdel,1);renderPostTools();return;}
  if(e.target.closest('[data-pstkdel]')){postStk=null;renderPostTools();return;}
  if(e.target.closest('#postAddTile'))$('#postFile').click();
});
$('#postAddImg').addEventListener('click',()=>$('#postFile').click());
$('#postFile').addEventListener('change',async e=>{
  const files=[...e.target.files];
  e.target.value='';
  const room=3-postImgs.length;
  if(!files.length||room<=0){if(room<=0)toast('最多发 3 张图片哦');return;}
  toast('处理图片中…');
  for(const f of files.slice(0,room))postImgs.push(await compressImg(f));
  renderPostTools();
});
function renderPostCard(p){
  const marks=state.postMarks[p.id]||{like:new Set(),fav:new Set()};
  const cmts=state.postCmts[p.id]||[];
  const meLiked=state.myLikes.has(p.id), meFaved=state.myFavs.has(p.id);
  return `<div class="card post-card" data-post="${p.id}">
    <div class="post-head">
      <div class="avatar">${p.author[0]}</div>
      <div style="flex:1;min-width:0;"><b>${p.author}</b><span>${fmtTime(p.ts)}</span></div>
    </div>
    <div class="post-body">${p.text}</div>
    ${p.stk?`<img class="post-stk" src="${STK_MAP[p.stk]?STK_MAP[p.stk].src:''}">`:''}
    ${p.imgs&&p.imgs.length?`<div class="post-imgs">${p.imgs.map(s=>`<img class="viewerable" src="${s}">`).join('')}</div>`:''}
    <div class="post-acts">
      <span class="pa ${meLiked?'on':''}" data-act="like">❤️ ${marks.like.size||''} 点赞</span>
      <span class="pa ${meFaved?'on':''}" data-act="fav">⭐ ${marks.fav.size||''} 收藏</span>
      <span class="pa" data-act="cmt">💬 ${cmts.length||''} 评论</span>
    </div>
    <div class="post-cmts">${cmts.map(c=>`<div class="pc-row"><b>${c.author}</b>${c.text||''}${c.stk&&STK_MAP[c.stk]?`<img class="viewerable" src="${STK_MAP[c.stk].src}">`:''}</div>`).join('')}</div>
    <div class="post-cmt-input"><div class="stk-btn pc-stk" data-cmtstk="${p.id}">😀</div><input placeholder="友善评论，让广场更有爱…" data-cmtinput="${p.id}"><div class="pc-send" data-cmtsend="${p.id}">发送</div></div>
  </div>`;
}
function renderPlaza(){
  $$('.plaza-tab').forEach(t=>t.classList.toggle('on',t.dataset.mode===state.plazaMode));
  const all=Object.values(state.posts).sort((a,b)=>(b.ts||0)-(a.ts||0));
  let posts=all;
  if(state.plazaMode==='likes')posts=all.filter(p=>state.myLikes.has(p.id));
  if(state.plazaMode==='favs')posts=all.filter(p=>state.myFavs.has(p.id));
  $('#plazaList').innerHTML=posts.length?posts.map(renderPostCard).join('')
    :`<div class="chat-empty" style="margin-top:40px;">${state.plazaMode==='likes'?'❤️ 还没有点赞的帖子<br>去「帖子」里逛逛，喜欢就点个赞吧':state.plazaMode==='favs'?'⭐ 还没有收藏的帖子<br>看到喜欢的帖子点「⭐ 收藏」就会出现在这里':'🦢 广场空空的，来发第一帖水聊一下吧'}</div>`;
}
$$('.plaza-tab').forEach(t=>t.addEventListener('click',()=>{state.plazaMode=t.dataset.mode;renderPlaza();}));
$('#plazaNewBtn').addEventListener('click',()=>{$('#postText').value='';postImgs=[];postStk=null;renderPostTools();$('#postOverlay').classList.add('show');});
$('#postClose').addEventListener('click',()=>$('#postOverlay').classList.remove('show'));
$('#postOverlay').addEventListener('click',e=>{if(e.target.id==='postOverlay')$('#postOverlay').classList.remove('show');});
$('#postSubmit').addEventListener('click',()=>{
  if(!state.me)return;
  const text=$('#postText').value.trim();
  if(!text&&!postImgs.length&&!postStk){toast('写点什么或发张图再发布吧～');return;}
  const p={id:'t'+Date.now()+Math.random().toString(36).slice(2,5),author:state.me.name,text,ts:Date.now()};
  if(postImgs.length)p.imgs=postImgs.slice();
  if(postStk)p.stk=postStk;
  if(JSON.stringify(p).length>700000){toast('图片太大，请换小一点的图');return;}
  if(pub(NS+'posts/'+p.id,p,true)){
    state.posts[p.id]=p;
    $('#postOverlay').classList.remove('show');
    postImgs=[];postStk=null;$('#postText').value='';
    renderPlaza();
    toast('已发布到广场 🦢');
  }
});
/* 评论表情包：每条评论可附带一个表情 */
let cmtStkSel={};
const cmtStkPanel=$('#cmtStkPanel');
cmtStkPanel.innerHTML=STICKERS.map(s=>`<div class="stk-item" data-cmtstkpick="${s.code}" title="${s.name}"><img src="${s.src}" alt="${s.name}"></div>`).join('');
cmtStkPanel.addEventListener('click',e=>{
  const it=e.target.closest('[data-cmtstkpick]');
  if(!it)return;
  cmtStkSel[cmtStkPanel.dataset.for]=it.dataset.cmtstkpick;
  cmtStkPanel.classList.remove('show');
  const btn=$(`[data-cmtstk="${cmtStkPanel.dataset.for}"]`);
  if(btn)btn.classList.add('on');
});
$('#plazaList').addEventListener('click',e=>{
  const stkBtn=e.target.closest('[data-cmtstk]');
  if(stkBtn){
    cmtStkPanel.dataset.for=stkBtn.dataset.cmtstk;
    cmtStkPanel.classList.add('show');
    return;
  }
  const send=e.target.closest('[data-cmtsend]');
  if(send){
    const pid=send.dataset.cmtsend;
    const input=$(`[data-cmtinput="${pid}"]`);
    const text=input.value.trim();
    const stk=cmtStkSel[pid]||null;
    if(!text&&!stk){toast('写点内容或选个表情再发送～');return;}
    if(!mq||!mq.connected){toast('网络未连接');return;}
    const c={author:state.me.name,text,stk,ts:Date.now()};
    mq.publish(NS+'postcmt/'+pid+'/'+c.ts,JSON.stringify(c),{qos:0,retain:true});
    mirrorPublish(NS+'postcmt/'+pid+'/'+c.ts,JSON.stringify(c),true);
    const arr=state.postCmts[pid]=state.postCmts[pid]||[];
    if(!arr.some(x=>x.ts===c.ts))arr.push(c);
    input.value='';
    delete cmtStkSel[pid];
    const btn=$(`[data-cmtstk="${pid}"]`);
    if(btn)btn.classList.remove('on');
    cmtStkPanel.classList.remove('show');
    renderPlaza();
    return;
  }
  const act=e.target.closest('[data-act]');
  if(!act)return;
  const card=act.closest('[data-post]');
  const pid=card.dataset.post;
  if(act.dataset.act==='cmt'){
    const input=$(`[data-cmtinput="${pid}"]`);
    if(input){input.focus();input.scrollIntoView({behavior:'smooth',block:'center'});}
    return;
  }
  const kind=act.dataset.act;
  const set=kind==='fav'?state.myFavs:state.myLikes;
  const on=!set.has(pid);
  if(on)set.add(pid);else set.delete(pid);
  if(mq&&mq.connected){const mt=NS+'postmark/'+pid+'/'+encodeURIComponent(state.me.name)+'_'+kind;const mp=JSON.stringify({on,ts:Date.now()});mq.publish(mt,mp,{qos:0,retain:true});mirrorPublish(mt,mp,true);}
  saveUserData();
  renderPlaza();
  toast(kind==='fav'?(on?'已收藏帖子 ⭐':'已取消收藏'):(on?'点赞成功 ❤️':'已取消点赞'));
});
/* ---------- 我的发布/订单列表页 ---------- */
/* ---------- 我的发布/订单列表页 ---------- */
const LIST_MODES={pub:'我的发布',sold:'卖出的订单',bought:'买入的订单',all:'我的订单',his:'浏览记录'};
function renderMyList(){
  if(!state.me)return;
  const m=state.listMode||'all';
  $('#myListTitle').textContent=LIST_MODES[m]||'列表';
  const stNames=['待卖家发货','待到站验货','验货中','已完成'];
  let cards=[];
  if(m==='his'){
    cards=state.history.map(id=>state.products.find(x=>x.id===id)).filter(Boolean)
      .map(p=>({click:`data-id="${p.id}"`,peer:p.owner,top:'浏览于 '+(p.ts?new Date(p.ts).toLocaleDateString('zh-CN'):'今天'),p}));
  }else if(m==='pub'){
    cards=state.products.filter(p=>p.owner===state.me.name).sort((a,b)=>(b.ts||0)-(a.ts||0))
      .map(p=>({click:`data-id="${p.id}"`,peer:state.me.name,top:p.sold?'已售出':'在售中',p}));
  }else{
    const orders=state.orders.filter(o=>m==='all'||(m==='sold'?o.seller===state.me.name:o.buyer===state.me.name)).sort((a,b)=>b.ts-a.ts);
    cards=orders.map(o=>{
      const isBuyer=o.buyer===state.me.name;
      return {click:`data-order="${o.id}"`,peer:isBuyer?o.seller:o.buyer,top:`${isBuyer?'我买':'我卖'} · ${stNames[o.status]||'已完成'}`,p:state.products.find(x=>x.id===o.productId)};
    });
  }
  $('#myListBody').innerHTML=cards.length?cards.map(c=>{
    /* 自己的发布：仅展示图片、价格、简介 + 浏览/收藏数据，不重复展示本人头像名字 */
    if(m==='pub'&&c.p){
      const s=c.p.stats||{views:0,favs:0};
      return `<div class="card pub-card" ${c.click}>
        <div class="pc-img">${c.p.img?`<img src="${c.p.img}">`:c.p.emoji||'📦'}${c.p.sold?'<span class="sold-mark">已售出</span>':''}</div>
        <div class="pc-body">
          <div class="pc-price"><small>¥</small>${c.p.price}</div>
          <div class="pc-desc">${c.p.desc||'卖家很懒，没有写描述～'}</div>
          <div class="pc-stats"><span>👁 ${s.views||0} 次浏览</span><span>❤ ${s.favs||0} 人收藏</span></div>
        </div>
      </div>`;
    }
    return `
    <div class="card sub-row" ${c.click}>
      <div class="avatar">${(c.peer||'?')[0]}</div>
      <div class="m-main">
        <div class="m-top"><b>${c.peer||'匿名用户'}</b><span class="m-time">${c.top}</span></div>
        <div class="m-good"><div class="mg-img">${c.p?`${c.p.img?`<img src="${c.p.img}">`:c.p.emoji||'📦'}`:'📦'}</div><span>${c.p?c.p.name:'商品已下架'}</span><b>${fmt(c.p?c.p.price:0)}</b></div>
      </div>
    </div>`;
  }).join(''):`<div class="chat-empty" style="margin-top:40px;">${m==='pub'?'📦 还没有发布闲置，点底部「＋」发布第一件':m==='his'?'👣 暂无浏览记录':'🧾 暂无相关订单'}</div>`;
}
$$('.stat-link').forEach(s=>s.addEventListener('click',()=>{
  state.listMode=s.dataset.list;showView('mylist');
}));
$('#goOrders').addEventListener('click',()=>{
  state.listMode='all';showView('mylist');
});
$('#goHistory').addEventListener('click',()=>{
  state.listMode='his';showView('mylist');
});
$('#myListBody').addEventListener('click',e=>{
  const el=e.target.closest('[data-order],[data-id]');if(!el)return;
  if(el.dataset.order){state.currentOrder=el.dataset.order;showView('order');}
  else openDetail(el.dataset.id);
});
$$('.me-item[data-sub]').forEach(it=>it.addEventListener('click',()=>{
  const wasOpen=it.classList.contains('open');
  $$('.me-item').forEach(x=>x.classList.remove('open'));
  if(!wasOpen)it.classList.add('open');
}));
$$('.sublist').forEach(list=>list.addEventListener('click',e=>{
  const el=e.target.closest('[data-order],[data-id]');if(!el)return;
  if(el.dataset.order){state.currentOrder=el.dataset.order;showView('order');}
  else openDetail(el.dataset.id);
}));
$('#goSupport').addEventListener('click',()=>showView('support'));
$('#editProfile').addEventListener('click',()=>toast('资料编辑功能开发中～'));
/* 偏好档案模块已按需求移除（有备份，需要时可恢复） */

/* ---------- 客服中心（机器人） ---------- */
const FAQ_ANS={
  '商品有问题怎么办？':'别担心～担保交易下你可以到站点验货时当场拒绝确认，交易自动取消、货款原路退回；已完成交易可在 48 小时内发起售后，上传照片凭证后客服会介入处理。',
  '卖家不发货怎么办？':'下单后 24 小时内卖家未发货，订单会自动提醒；超过 48 小时可点击「申请平台介入」，核实后货款将全额退回你的账户。',
  '如何申请退款？':'订单详情页底部点「申请退款」→ 选择原因 → 上传凭证。只要你未确认收货，货款都在平台担保中，退款秒到账。',
};
function renderSupport(){
  $('#csArea').innerHTML=state.csMsgs.map(m=>{
    const av=m.side==='left'?`<div class="avatar" style="background:linear-gradient(135deg,#9CBF9B,#7FA87E);">客</div>`:`<div class="avatar me">我</div>`;
    const body=`<div class="bubble">${m.text}</div>`;
    return `<div class="msg ${m.side}">${av}${body}</div>`;
  }).join('');
  const a=$('#csArea');a.scrollTop=a.scrollHeight;
}
function csReply(text){setTimeout(()=>{state.csMsgs.push({side:'left',text});if(state.view==='support')renderSupport();},900);}
function sendCS(text){
  if(!text.trim())return;
  state.csMsgs.push({side:'right',text});renderSupport();$('#csInput').value='';
  csReply(FAQ_ANS[text]||`收到啦～已为你创建工单 #${Math.floor(Math.random()*9000+1000)}，客服会在 24 小时内处理并回复。`);
}
$('#csSend').addEventListener('click',()=>sendCS($('#csInput').value));
$('#csInput').addEventListener('keydown',e=>{if(e.key==='Enter')sendCS(e.target.value);});
$$('.faq-card').forEach(c=>c.addEventListener('click',()=>sendCS(c.dataset.q)));
$('#csUpload').addEventListener('click',()=>{
  state.csMsgs.push({side:'right',text:'',img:'📄'});
  renderSupport();
  csReply('凭证已收到 📎 已附加到工单中，我们会尽快核实处理。');
});

/* ---------- 发布上传 ---------- */
const UP_MAX=4;
let pubImgs=[];
const AI_POOL=CATS.map(c=>c.major);
function resetPublish(){
  pubImgs=[];state.pubTags=new Set();state.pubGrade='九成新';state.pubCut='接受小刀';
  state.pubTrade='线下面交';state.pubTradeNote='';state.pubEditId=null;
  $('#pubPrice').value='';$('#pubDesc').value='';$('#tradeNote').value='';$('#pubStock').value='1';
  $('#pubTitle').textContent='发布闲置';
  const sb=$('#pubSubmit');if(sb)sb.textContent='发布闲置';
  $('#aiState').textContent='上传照片后自动识别';
  renderUpload();
}
/* 编辑模式：把已有商品内容填回发布页 */
function fillPublish(p){
  state.pubEditId=p.id;
  pubImgs=(p.imgs&&p.imgs.length)?p.imgs.slice():(p.img?[p.img]:[]);
  state.pubTags=new Set((p.tags&&p.tags.length)?p.tags.slice():[p.cat].concat(p.sub?[p.sub]:[]));
  state.pubGrade=p.cond||'九成新';
  state.pubCut=p.cut||'接受小刀';
  state.pubTrade=p.trade||'线下面交';
  state.pubTradeNote=p.tradeNote||'';
  $('#pubPrice').value=p.price;
  $('#pubDesc').value=(p.desc&&p.desc!=='卖家很懒，没有写描述～')?p.desc:'';
  $('#tradeNote').value=p.tradeNote||'';
  $('#pubStock').value=p.stock!=null?Math.max(1,p.stock):1;
  $('#pubTitle').textContent='编辑商品';
  const sb=$('#pubSubmit');if(sb)sb.textContent='保存修改';
  $('#aiState').textContent='已载入原商品信息，可修改后保存';
  showView('publish');
}
$('#cutRow').addEventListener('click',e=>{
  const c=e.target.closest('[data-cut]');if(!c)return;
  state.pubCut=c.dataset.cut;
  $$('#cutRow .cut-chip').forEach(x=>x.classList.toggle('on',x===c));
});
/* 交易方式：线下面交 / 送到楼下 */
function syncTradeUI(){
  $$('#tradeRow .cut-chip').forEach(x=>x.classList.toggle('on',x.dataset.trade===state.pubTrade));
  $('#tradeNote').placeholder=state.pubTrade==='送到楼下'
    ?'送楼下说明，如：只送到宿舍楼下（不进门）'
    :'希望在哪里面交，如：东门驿站门口';
}
$('#tradeRow').addEventListener('click',e=>{
  const c=e.target.closest('[data-trade]');if(!c)return;
  state.pubTrade=c.dataset.trade;
  syncTradeUI();
});
$('#tradeNote').addEventListener('input',e=>{state.pubTradeNote=e.target.value.trim();});
/* AI 生成物品描述 */
const DESC_LIB={
  '教材书籍':['{c}，{g}，内容完整无缺页。刚考完试整理出来出给需要的同学，复习直接上手。支持校内站点自提，到站现场验货后确认收货，双方都放心～','{c}{g}，当年一口气整理的，重点标注很全。现在用不上了低价出，接手就能直接用。校内面交，站点验货后确认～'],
  '电子数码配件':['{c}，{g}，功能一切正常。附赠原装配件，到手即用。可以约校内站点当面测试再确认，有问题随时沟通～','{c}{g}，自用闲置出，已清理干净。支持到站点现场试机，确认没问题再完成交易，欢迎砍价交流～'],
  '生活用品':['{c}，{g}，宿舍闲置出。日常使用频率不高，成色见图。东西不大好拿，约校内站点交接很方便，验货满意再确认～','{c}{g}，毕业清宿舍忍痛割爱。实物比照片更好，欢迎到站点当面看看，合适就带走～'],
  '服饰鞋包':['{c}，{g}，无破损无污渍，洗晒干净了才挂出来。尺码标准可到站点试穿确认，不合适不勉强，支持现场验货～','{c}{g}，买来穿得不多，现在断舍离。颜色实拍无滤镜，介意色差可约站点看实物，诚实交易～'],
  '文体用品':['{c}，{g}，保养得不错，正常使用无暗病。运动/学习好物低价转让，喜欢就别犹豫，约站点验货后成交～','{c}{g}，社团活动结束后闲置。成色见图，功能完好，欢迎到站点当面检查，合适再确认收货～'],
  '宿舍家具':['{c}，{g}，宿舍神器真实好用，因为要搬走才出。体积不大方便携带，约校内站点交接，现场验货确认～','{c}{g}，只用了几个月。安装简单即插即用，宿舍党刚需。到站点看货满意再确认，顺路自提更方便～'],
  '美妆杂物':['{c}，{g}，保质期都还很充裕，专柜购入有记录。肤质不合适才出，介意的话可以约站点当面确认批次和质地～','{c}{g}，囤多了用不完。保存条件良好，无过期无变质，图物一致。站点验货后确认收货，放心拍～'],
  '其他闲置':['{c}，{g}，闲置出回血。实物如图，功能完好，具体细节可以聊，支持校内站点验货后确认收货～','{c}{g}，放宿舍占地方，低价出给有缘人。有什么想了解的直接私信我，约站点当面看货最稳妥～'],
};
$('#aiDescBtn').addEventListener('click',()=>{
  const cat=pubMajor()||'其他闲置';
  const g={'全新':'全新未拆封','九成新':'九成新，几乎无使用痕迹','八成新':'八成新，有正常使用痕迹','明显使用痕迹':'有明显使用痕迹但功能完好'}[state.pubGrade]||state.pubGrade;
  const lib=DESC_LIB[cat]||DESC_LIB['其他闲置'];
  $('#pubDesc').value=lib[Math.floor(Math.random()*lib.length)].replace(/\{c\}/g,cat).replace(/\{g\}/g,g);
  toast('已生成描述，可自由修改 ✏️');
});
function renderUpload(){
  const g=$('#upGrid');
  let html=pubImgs.map((src,i)=>`<div class="up-tile up-pic" data-del="${i}"><img src="${src}"><span class="del">×</span></div>`).join('');
  if(pubImgs.length<UP_MAX){
    html+=`<div class="up-tile up-add" id="upAdd"><b>＋</b>照片</div>`;
    if(pubImgs.length===0)html+=`<div class="up-tile up-add" style="border-style:dashed;" data-cam><svg class="ic" width="22" height="22" viewBox="0 0 24 24"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg></div>`;
  }
  g.innerHTML=html;
  $('#aiTags').innerHTML=state.pubTags.size
    ?[...state.pubTags].map(t=>`<span class="tag on" data-rm="${t}">${t}<b style="font-weight:400;margin-left:4px;">✕</b></span>`).join('')
    :'<span style="font-size:11px;color:var(--text3);">AI 识别后自动生成标签，也可点下方按钮手动选择</span>';
  $$('#gradeRow .grade').forEach(x=>x.classList.toggle('on',x.dataset.g===state.pubGrade));
  syncTradeUI();
  /* 未上传图片时发布按钮置灰 + 提示 */
  const noImg=!pubImgs.length;
  $('#pubSubmit').classList.toggle('disabled',noImg);
  $('#pubImgHint').classList.toggle('show',noImg);
  updatePubRec();
}
$('#aiTags').addEventListener('click',e=>{
  const t=e.target.closest('[data-rm]');
  if(t){state.pubTags.delete(t.dataset.rm);renderUpload();}
});
/* 全部标签选择面板（带搜索） */
function pubMajor(){
  const tags=[...state.pubTags];
  const m=tags.find(t=>CATS.some(c=>c.major===t));
  if(m)return m;
  const s=tags.find(t=>CATS.some(c=>c.subs.includes(t)));
  return s?CATS.find(c=>c.subs.includes(s)).major:null;
}
function renderTagPanel(){
  const kw=($('#tagSearch').value||'').trim().toLowerCase();
  const secs=CATS.map(sec=>{
    const mHit=!kw||sec.major.toLowerCase().includes(kw);
    const subs=mHit?sec.subs:sec.subs.filter(s=>s.toLowerCase().includes(kw));
    if(!mHit&&!subs.length)return null;
    return {major:sec.major,subs,mOn:state.pubTags.has(sec.major)};
  }).filter(Boolean);
  $('#tagList').innerHTML=secs.length?secs.map(sec=>`
    <div class="cs-sec">
      <div class="cs-major"><span class="mchip ${sec.mOn?'on':''}" data-major="${sec.major}">${sec.major}</span></div>
      <div class="cs-subs">${sec.subs.map(s=>`<span class="schip ${state.pubTags.has(s)?'on':''}" data-tag="${s}">${s}</span>`).join('')}</div>
    </div>`).join(''):'<div class="chat-empty" style="margin-top:40px;">🔍 没有匹配的标签</div>';
  $('#tagCount').textContent=state.pubTags.size;
}
$('#tagPickBtn').addEventListener('click',()=>{renderTagPanel();$('#tagOverlay').classList.add('show');});
$('#tagSearch').addEventListener('input',renderTagPanel);
$('#tagClose').addEventListener('click',()=>$('#tagOverlay').classList.remove('show'));
$('#tagDone').addEventListener('click',()=>$('#tagOverlay').classList.remove('show'));
$('#tagClear').addEventListener('click',()=>{state.pubTags=new Set();renderTagPanel();renderUpload();toast('已清空全部标签');});
$('#tagList').addEventListener('click',e=>{
  const m=e.target.closest('[data-major]');
  if(m){
    const sec=CATS.find(x=>x.major===m.dataset.major);
    if(state.pubTags.has(sec.major)){state.pubTags.delete(sec.major);sec.subs.forEach(s=>state.pubTags.delete(s));}
    else state.pubTags.add(sec.major);
    renderTagPanel();renderUpload();return;
  }
  const s=e.target.closest('[data-tag]');
  if(s){
    const t=s.dataset.tag;
    if(state.pubTags.has(t))state.pubTags.delete(t);
    else{state.pubTags.add(t);const sec=CATS.find(x=>x.subs.includes(t));if(sec)state.pubTags.delete(sec.major);}
    renderTagPanel();renderUpload();
  }
});
$('#upGrid').addEventListener('click',e=>{
  const del=e.target.closest('[data-del]');
  if(del){pubImgs.splice(+del.dataset.del,1);renderUpload();return;}
  if(e.target.closest('#upAdd')||e.target.closest('[data-cam]'))$('#fileInput').click();
});
function compressImg(file){
  return new Promise(res=>{
    const img=new Image(),r=new FileReader();
    r.onload=e=>{
      img.onload=()=>{
        const max=720,sc=Math.min(1,max/Math.max(img.width,img.height));
        const cv=document.createElement('canvas');
        cv.width=Math.round(img.width*sc);cv.height=Math.round(img.height*sc);
        cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);
        res(cv.toDataURL('image/jpeg',0.62));
      };
      img.src=e.target.result;
    };
    r.readAsDataURL(file);
  });
}
$('#fileInput').addEventListener('change',async e=>{
  /* 必须先取文件再清 value，否则 FileList 会被清空 */
  const files=[...e.target.files].filter(f=>f.type.startsWith('image'));
  e.target.value='';
  if(!files.length)return;
  const room=UP_MAX-pubImgs.length;
  if(files.length>room){toast(`最多上传 ${UP_MAX} 张图片哦`);}
  if(room>0){
    toast('处理图片中…');
    for(const f of files.slice(0,room))pubImgs.push(await compressImg(f));
  }
  renderUpload();
  if(files.length&&room>0)aiRecognize();
});
function aiRecognize(){
  if(!pubImgs.length){toast('先上传照片才能识别哦');return;}
  $('#aiState').textContent='AI 正在识别…';
  setTimeout(()=>{
    state.pubTags=new Set([AI_POOL[Math.floor(Math.random()*4)],AI_POOL[Math.floor(Math.random()*AI_POOL.length)]]);
    $('#aiState').textContent='已自动生成商品标签';
    renderUpload();
    toast('AI 识别完成，已生成标签 ✨');
  },800);
}
$('#aiTags').addEventListener('click',e=>{
  const t=e.target.closest('.tag');if(!t)return;
  const name=t.dataset.tag;
  state.pubTags.has(name)?state.pubTags.delete(name):state.pubTags.add(name);
  renderUpload();
});
$('#aiRefresh').addEventListener('click',aiRecognize);
$('#gradeRow').addEventListener('click',e=>{
  const g=e.target.closest('.grade');if(!g)return;
  state.pubGrade=g.dataset.g;renderUpload();
});
$('#pubSubmit').addEventListener('click',()=>{
  if(!state.me){toast('请稍等，正在准备账号…');if(GUEST_MODE)autoGuest();else showView('login');return;}
  const price=parseFloat($('#pubPrice').value);
  if(!pubImgs.length){toast('至少上传一张照片哦 📷');return;}
  if(isNaN(price)||price<=0){toast('请填写正确的价格');$('#pubPrice').focus();return;}
  if(state.pubTags.size===0){toast('请选择至少一个商品标签');return;}
  const desc=$('#pubDesc').value.trim();
  const tags=[...state.pubTags];
  let cat=tags.find(t=>CATS.some(c=>c.major===t));
  const sub=tags.find(t=>CATS.some(c=>c.subs.includes(t)));
  if(!cat&&sub)cat=CATS.find(c=>c.subs.includes(sub)).major;
  cat=cat||'其他闲置';
  const stock=Math.max(1,Math.min(99,parseInt($('#pubStock').value)||1));
  const isEdit=!!state.pubEditId;
  /* 编辑模式：更新原商品，保留 id/owner/ts/统计 */
  if(isEdit){
    const old=state.products.find(x=>x.id===state.pubEditId);
    if(!old){toast('原商品已不存在');state.pubEditId=null;return;}
    const updated=Object.assign({},old,{
      name:desc?desc.slice(0,18):cat+' 好物转让',
      price,cond:state.pubGrade,cat,sub:sub||null,cut:state.pubCut,tags,
      desc:desc||'卖家很懒，没有写描述～',
      trade:state.pubTrade||'线下面交',
      tradeNote:$('#tradeNote').value.trim(),
      stock,
      img:pubImgs[0]||null,
      imgs:pubImgs.slice(),

      emoji:pubImgs[0]?null:'📦',
    });
    if(JSON.stringify(updated).length>PAYLOAD_MAX){toast('内容太大无法上传，请删掉几张图片');return;}
    if(pub(NS+'products/'+old.id,updated,true)){
      const i=state.products.findIndex(x=>x.id===old.id);
      if(i>=0)state.products[i]=updated;
      toast('修改已保存 ✅');
      state.pubEditId=null;
      navStack=navStack.filter(x=>x!=='publish');
      showView('detail',false);
    }
    return;
  }
  const p={
    id:'p'+Date.now()+Math.random().toString(36).slice(2,6),
    name:desc?desc.slice(0,18):cat+' 好物转让',
    price,cond:state.pubGrade,cat,sub:sub||null,cut:state.pubCut,tags,
    owner:state.me.name,
    desc:desc||'卖家很懒，没有写描述～',
    trade:state.pubTrade||'线下面交',
    tradeNote:$('#tradeNote').value.trim(),
    stock,
    img:pubImgs[0]||null,
    imgs:pubImgs.slice(),
    emoji:pubImgs[0]?null:'📦',
    ts:Date.now(),sold:false,stats:{views:0,favs:0},
  };
  if(JSON.stringify(p).length>PAYLOAD_MAX){toast('内容太大无法上传，请删掉几张图片');return;}
  if(pub(NS+'products/'+p.id,p,true)){
    state.products.unshift(p);
    toast('发布成功！已上架到共享市集 🎉');
    resetPublish();
    state.filter={kw:'',mine:false,tags:[],sort:'rec',face:false,barg:false};
    navStack=navStack.filter(x=>x!=='publish');
    showView('home',false);
  }
});

/* ---------- 订单状态 ---------- */
const STEP_TITLES=['已下单','卖家发货至站点','买家现场验货','交易完成'];
function curOrder(){return state.orders.find(o=>o.id===state.currentOrder);}
function setOrderStatus(o,status){
  o.status=status;
  if(pub(NS+'orders/'+o.id,o,true)){toast('订单状态已更新');renderOrder();renderProfile();}
}
function renderOrder(){
  const o=curOrder(),box=$('#orderScroll'),foot=$('#orderFoot');
  if(!o){
    box.innerHTML=`<div class="card order-head-card"><div class="oico">🧾</div>
      <div style="flex:1;"><div style="font-size:15px;font-weight:700;">暂无订单</div>
      <div style="font-size:11px;color:var(--text2);margin-top:3px;">去首页挑一件闲置，体验担保交易吧</div></div></div>
      <div class="order-tip">担保交易流程：已下单 → 卖家发货至站点 → 买家现场验货 → 交易完成。货款全程由平台担保，验货满意才付款。</div>`;
    foot.innerHTML=`<div class="btn btn-orange" id="goHome2">去逛逛</div>`;
    $('#goHome2').addEventListener('click',()=>showView('home'));
    return;
  }
  const p=state.products.find(x=>x.id===o.productId)||{name:'商品已下架',price:0,emoji:'📦',cond:''};
  const isBuyer=o.buyer===state.me?.name;
  const peer=isBuyer?o.seller:o.buyer;
  const head=`<div class="card order-head-card">
    <div class="oico">${o.status===3?'🎉':'🚚'}</div>
    <div style="flex:1;">
      <div style="font-size:15px;font-weight:800;color:${o.status===3?'#7FA87E':'#C96F2E'};">${o.status===3?'交易已完成':STEP_TITLES[o.status]}</div>
      <div style="font-size:11px;color:var(--text2);margin-top:3px;">${isBuyer?'我是买家 · 卖家 '+peer:'我是卖家 · 买家 '+peer} · ${o.station}</div>
    </div>
    <span class="chip ${o.status===3?'':'orange'}">${o.status===3?'已结算':'担保交易中'}</span>
  </div>
  <div class="card good-card" style="margin:0 16px;cursor:pointer;" data-pid="${p.id||''}">
    <div class="gimg">${p.img?`<img class="viewerable" src="${p.img}">`:p.emoji||'📦'}</div>
    <div style="flex:1;"><div style="font-size:13px;font-weight:600;">${p.name}</div>
    <div style="font-size:12px;color:var(--text2);margin-top:4px;">${fmt(p.price)} · ${p.cond}</div></div>
    <span style="font-size:11px;color:var(--text3);">›</span>
  </div>`;
  /* 交易方式 / 双方备注 */
  const trade=p.trade||'线下面交';
  const noteHint=trade==='送到楼下'?'填写你的楼栋与门牌，如：3 栋 402':'填写面交补充，如：周三下午在图书馆门口';
  const tradeCard=`<div class="card trade-card" style="margin:0 16px;">
    <div class="tc-row"><span class="tc-k">交易方式</span><span class="tc-v">${trade}</span></div>
    <div class="tc-row"><span class="tc-k">卖家备注</span><span class="tc-v">${p.tradeNote||'未填写'}</span></div>
    <div class="tc-row"><span class="tc-k">买家备注</span><span class="tc-v" id="buyerNoteView">${o.buyerNote||'未填写'}</span></div>
    ${isBuyer?`<div class="note-edit"><input id="buyerNoteInput" maxlength="40" placeholder="${noteHint}" value="${o.buyerNote||''}"><div class="note-save" id="buyerNoteSave">保存</div></div>`:''}
  </div>`;
  const subDesc=['买家完成支付，货款暂由平台担保','已寄出，正在前往 '+o.station,'到站后当面检查商品，确认无误再确认收货','确认收货后，货款已转给卖家'];
  const steps=STEP_TITLES.map((t,i)=>{
    const cls=i<o.status?'done':i===o.status?'now':'todo';
    const node=i<o.status?'✓':i===o.status?'●':(i+1);
    return `<div class="step ${cls}"><div class="snode">${node}</div><div class="sinfo"><b>${t}</b><span>${subDesc[i]}</span></div></div>`;
  }).join('');
  box.innerHTML=head+tradeCard+`<div class="card steps">${steps}</div>`
    +`<div class="order-tip">💡 小提示：${isBuyer?'请携带取件码 <b>8827</b> 在站点营业时间内前往验货，如有问题可当场发起退款。':'买家到站验货确认后，交易才会完成，请保持消息畅通。'}</div>`;
  const bs=$('#buyerNoteSave');
  if(bs)bs.addEventListener('click',()=>{
    const v=$('#buyerNoteInput').value.trim();
    o.buyerNote=v;
    pub(NS+'orders/'+o.id,o,true);
    const view=$('#buyerNoteView');if(view)view.textContent=v||'未填写';
    toast('备注已保存，卖家可以看到 ✅');
  });
  const chatBtn=`<div class="btn btn-ghost" id="oChat">联系${isBuyer?'卖家':'买家'}</div>`;
  let mainBtn='';
  if(isBuyer){
    mainBtn=o.status===0?`<div class="btn btn-orange" id="oNext">提醒发货</div>`
      :o.status===1?`<div class="btn btn-orange" id="oNext">前往验货</div>`
      :o.status===2?`<div class="btn btn-orange" id="oNext">确认收货</div>`
      :`<div class="btn btn-orange" id="oNext">评价本次交易</div>`;
  }else{
    mainBtn=o.status===0?`<div class="btn btn-orange" id="oNext">发货至站点</div>`
      :o.status===1?`<div class="btn btn-ghost" id="oNext">等待买家到站</div>`
      :o.status===2?`<div class="btn btn-ghost" id="oNext">等待买家验货</div>`
      :`<div class="btn btn-ghost" id="oNext">交易已完成</div>`;
  }
  foot.innerHTML=chatBtn+mainBtn;
  $('#oChat').addEventListener('click',()=>openChatWith(peer,o.productId));
  $('#oNext').addEventListener('click',()=>{
    if(!isBuyer){
      if(o.status===0)setOrderStatus(o,1);
      else if(o.status===1)toast('等待买家到 '+o.station+' 验货');
      else if(o.status===2)toast('等待买家现场验货确认');
      else toast('感谢你的支持 ✨');
      return;
    }
    if(o.status===0)toast('已提醒卖家发货 📮');
    else if(o.status===1)showView('station');
    else if(o.status===2)setOrderStatus(o,3);
    else toast('感谢你的评价，大学生活因你更美好 ✨');
  });
  const gc=box.querySelector('[data-pid]');
  if(gc&&p.id)gc.addEventListener('click',e=>{
    if(e.target.closest('img.viewerable'))return; /* 点图片放大，点其余区域进详情 */
    openDetail(p.id);
  });
}

/* ---------- 校内站点 ---------- */
state.station='东门驿站';
function renderStation(){
  const o=state.orders.find(x=>x.id===state.currentOrder&&x.status<3);
  $$('#stationList .station').forEach(s=>s.classList.toggle('on',s.dataset.name===state.station));
  const isSeller=o&&o.seller===state.me?.name;
  $('#stationTip').innerHTML=o
    ?`📦 订单 #${o.id.slice(-4)} 将送至 <b>${state.station}</b>，取件码 <b>8827</b>，${isSeller?'等待买家到场验货。':'验货完成后点击确认即可。'}`
    :`📦 暂无进行中订单，当前偏好站点：<b>${state.station}</b>。`;
  const btn=$('#stationBtn');
  if(isSeller){btn.textContent='等待买家到站';btn.onclick=()=>toast('买家到场验货后交易才会完成');}
  else if(o&&o.status===1){btn.textContent='确认到站';btn.onclick=()=>{setOrderStatus(o,2);showView('order');};}
  else if(o&&o.status===2){btn.textContent='验货完成，确认收货';btn.onclick=()=>{setOrderStatus(o,3);showView('order');};}
  else{btn.textContent='保存站点偏好';btn.onclick=()=>{toast('已保存站点偏好：'+state.station);showView('home');};}
}
$('#stationList').addEventListener('click',e=>{
  const s=e.target.closest('.station');if(!s)return;
  state.station=s.dataset.name;renderStation();
});

/* ---------- 图片大图查看器 ---------- */
let vScale=1,vTx=0,vTy=0,vPinch=null,vLastTap=0;
function viewerApply(){
  const im=$('#viewerImg');
  im.style.transform=`translate(${vTx}px,${vTy}px) scale(${vScale})`;
}
function openViewer(src){
  vScale=1;vTx=0;vTy=0;
  const im=$('#viewerImg');
  im.style.transform='none';
  im.src=src;
  $('#viewerOverlay').classList.add('show');
}
function closeViewer(){$('#viewerOverlay').classList.remove('show');}
$('#viewerClose').addEventListener('click',closeViewer);
$('#viewerOverlay').addEventListener('click',e=>{if(e.target.id==='viewerOverlay'||e.target.classList.contains('viewer-stage'))closeViewer();});
(function(){
  const stage=$('.viewer-stage');
  stage.addEventListener('touchstart',e=>{
    if(e.touches.length===2){
      const [a,b]=e.touches;
      vPinch={d:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),s:vScale};
    }else if(e.touches.length===1){
      const t=e.touches[0];
      vPinch={x:t.clientX,y:t.clientY,tx:vTx,ty:vTy,move:false};
    }
  },{passive:true});
  stage.addEventListener('touchmove',e=>{
    e.preventDefault();
    if(!vPinch)return;
    if(e.touches.length===2&&vPinch.s!=null){
      const [a,b]=e.touches;
      const d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
      vScale=Math.max(1,Math.min(5,vPinch.s*d/vPinch.d));
      viewerApply();
    }else if(e.touches.length===1&&vPinch.x!=null){
      const t=e.touches[0];
      vTx=vPinch.tx+(t.clientX-vPinch.x);
      vTy=vPinch.ty+(t.clientY-vPinch.y);
      if(Math.abs(t.clientX-vPinch.x)>6||Math.abs(t.clientY-vPinch.y)>6)vPinch.move=true;
      viewerApply();
    }
  },{passive:false});
  stage.addEventListener('touchend',e=>{
    if(vPinch&&vPinch.x!=null&&!vPinch.move&&e.touches.length===0){
      /* 单击图片：双击检测，非双击不做动作 */
      const now=Date.now();
      if(now-vLastTap<300){vScale=vScale>1?1:2.2;vTx=0;vTy=0;viewerApply();vLastTap=0;}
      else vLastTap=now;
    }
    if(e.touches.length===0)vPinch=null;
  });
  /* 桌面：滚轮缩放 + 双击 */
  stage.addEventListener('wheel',e=>{
    e.preventDefault();
    vScale=Math.max(1,Math.min(5,vScale*(e.deltaY<0?1.15:0.87)));
    if(vScale===1){vTx=0;vTy=0;}
    viewerApply();
  },{passive:false});
  stage.addEventListener('dblclick',()=>{vScale=vScale>1?1:2.2;vTx=0;vTy=0;viewerApply();});
})();
/* 需要放大的图片统一加 class="viewerable" */
document.addEventListener('click',e=>{
  const im=e.target.closest('img.viewerable');
  if(im&&im.src)openViewer(im.src);
});

/* ---------- 底部导航 ---------- */
$('#tabbar').addEventListener('click',e=>{
  const t=e.target.closest('[data-tab]');if(!t)return;
  const v=t.dataset.tab;
  $$('.tab').forEach(x=>x.classList.toggle('active',x===t));
  if(v==='publish')resetPublish();
  showView(v);
});

/* ---------- 启动 ---------- */
mqConnect();
showView('splash');
