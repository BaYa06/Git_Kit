"use strict";(()=>{var e={};e.id=3444,e.ids=[3444],e.modules={9344:e=>{e.exports=require("jsonwebtoken")},145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},5900:e=>{e.exports=require("pg")},6835:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,r){return r in t?t[r]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,r)):"function"==typeof t&&"default"===r?t:void 0}}})},6169:(e,t,r)=>{r.r(t),r.d(t,{config:()=>m,default:()=>c,routeModule:()=>f});var n={};r.r(n),r.d(n,{default:()=>_});var s=r(9150),i=r(1631),a=r(6835),u=r(5900),o=r(9344),p=r.n(o);let l=new u.Pool({connectionString:process.env.DATABASE_URL}),d=process.env.JWT_SECRET||"dev_secret_change_me";async function _(e,t){let r;if("GET"!==e.method)return t.status(405).end();let n=function(e){let t=(e.headers.cookie||"").split("; ").find(e=>e.startsWith("gidkit_token="));return t?decodeURIComponent(t.split("=")[1]):null}(e);if(!n)return t.status(401).json({message:"Unauthenticated"});try{r=p().verify(n,d)}catch(e){return t.status(401).json({message:"Unauthenticated"})}let{tour_id:s}=e.query||{};if(!s)return t.status(400).json({message:"tour_id обязателен"});let i=await l.connect();try{let e=await i.query("SELECT company_id FROM tours WHERE id = $1 LIMIT 1",[s]);if(0===e.rowCount)return t.status(404).json({message:"Тур не найден"});let{company_id:n}=e.rows[0],a=await i.query(`
      SELECT 1
      FROM user_company_roles
      WHERE user_id = $1 AND company_id = $2
      LIMIT 1
    `,[r.sub,n]);if(0===a.rowCount)return t.status(403).json({message:"Нет доступа к этому туру"});let u=((await i.query(`
      SELECT
        id,
        primary_id,
        is_primary,
        group_label,
        full_name,
        phone,
        cost_cents,
        prepayment_cents,
        is_paid,
        paid_at
      FROM tour_guests
      WHERE tour_id = $1
      ORDER BY is_primary DESC, created_at ASC
    `,[s])).rows||[]).map(e=>({id:e.id,primary_id:e.primary_id,is_primary:e.is_primary,group_label:e.group_label||null,full_name:e.full_name||"",phone:e.phone||"",cost_cents:Number.isFinite(e.cost_cents)?e.cost_cents:0,prepayment_cents:Number.isFinite(e.prepayment_cents)?e.prepayment_cents:0,is_paid:!!e.is_paid,paid_at:e.paid_at||null}));return t.status(200).json({guests:u})}catch(e){return t.status(500).json({message:"DB error"})}finally{i.release()}}let c=(0,a.l)(n,"default"),m=(0,a.l)(n,"config"),f=new s.PagesAPIRouteModule({definition:{kind:i.x.PAGES_API,page:"/api/v1/tours/guests/list",pathname:"/api/v1/tours/guests/list",bundlePath:"",filename:""},userland:n})},1631:(e,t)=>{var r;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return r}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(r||(r={}))},9150:(e,t,r)=>{e.exports=r(145)}};var t=require("../../../../../webpack-api-runtime.js");t.C(e);var r=t(t.s=6169);module.exports=r})();