"use strict";(()=>{var e={};e.id=2091,e.ids=[2091],e.modules={9344:e=>{e.exports=require("jsonwebtoken")},145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},5900:e=>{e.exports=require("pg")},6835:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,n){return n in t?t[n]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,n)):"function"==typeof t&&"default"===n?t:void 0}}})},4490:(e,t,n)=>{n.r(t),n.d(t,{config:()=>m,default:()=>f,routeModule:()=>y});var r={};n.r(r),n.d(r,{default:()=>c});var s=n(9150),a=n(1631),i=n(6835),u=n(5900),o=n(9344),l=n.n(o);let d=new u.Pool({connectionString:process.env.DATABASE_URL}),p=process.env.JWT_SECRET||"dev_secret_change_me",_=e=>{let t=Number.parseInt(e,10);return Number.isFinite(t)?t:0};async function c(e,t){let n;if("POST"!==e.method)return t.status(405).end();let r=function(e){let t=(e.headers.cookie||"").split("; ").find(e=>e.startsWith("gidkit_token="));return t?decodeURIComponent(t.split("=")[1]):null}(e);if(!r)return t.status(401).json({message:"Unauthenticated"});try{n=l().verify(r,p)}catch(e){return t.status(401).json({message:"Unauthenticated"})}let{tour_id:s,guests:a}=e.body||{};if(!s||!Array.isArray(a))return t.status(400).json({message:"tour_id и guests обязательны (guests — массив)"});let i=await d.connect();try{let e=await i.query("SELECT company_id FROM tours WHERE id = $1 LIMIT 1",[s]);if(0===e.rowCount)return t.status(404).json({message:"Тур не найден"});let{company_id:r}=e.rows[0],u=await i.query(`
      SELECT 1
      FROM user_company_roles
      WHERE user_id = $1
        AND company_id = $2
        AND role IN ('owner','admin')
      LIMIT 1
    `,[n.sub,r]);if(0===u.rowCount)return t.status(403).json({message:"Нет прав редактировать туристов этого тура"});await i.query("BEGIN"),await i.query("DELETE FROM tour_guests WHERE tour_id = $1",[s]);let o=a.filter(e=>!e?.is_extra),l=a.filter(e=>e?.is_extra),d=new Map;for(let e of o){if(!e||!e.full_name)continue;let t=_(e.cost_cents),n=_(e.prepayment_cents),r=!!e.is_paid,a=(await i.query(`
        INSERT INTO tour_guests (
          tour_id, primary_id, is_primary, group_label, full_name, phone,
          cost_cents, prepayment_cents, is_paid, paid_at
        )
        VALUES ($1, NULL, true, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `,[s,e.group_label||null,e.full_name,e.phone||null,t,n,r,r?new Date:null])).rows[0].id;d.set(e.temp_id||e.id||a,a)}for(let e of l){let t=e.base_temp_id||e.base_id||e.primary_id,n=d.get(t);if(!n)continue;let r=_(e.cost_cents),a=_(e.prepayment_cents),u=!!e.is_paid;await i.query(`
        INSERT INTO tour_guests (
          tour_id, primary_id, is_primary, group_label, full_name, phone,
          cost_cents, prepayment_cents, is_paid, paid_at
        )
        VALUES ($1, $2, false, $3, $4, $5, $6, $7, $8, $9)
      `,[s,n,e.group_label||null,e.full_name||"",e.phone||null,r,a,u,u?new Date:null])}return await i.query("COMMIT"),t.status(200).json({ok:!0})}catch(e){return await i.query("ROLLBACK"),t.status(500).json({message:"DB error",code:e.code||null,detail:e.detail||null,table:e.table||null,column:e.column||null})}finally{i.release()}}let f=(0,i.l)(r,"default"),m=(0,i.l)(r,"config"),y=new s.PagesAPIRouteModule({definition:{kind:a.x.PAGES_API,page:"/api/v1/tours/guests/save",pathname:"/api/v1/tours/guests/save",bundlePath:"",filename:""},userland:r})},1631:(e,t)=>{var n;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return n}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(n||(n={}))},9150:(e,t,n)=>{e.exports=n(145)}};var t=require("../../../../../webpack-api-runtime.js");t.C(e);var n=t(t.s=4490);module.exports=n})();