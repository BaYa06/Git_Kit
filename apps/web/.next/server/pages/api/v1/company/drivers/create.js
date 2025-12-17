"use strict";(()=>{var e={};e.id=4761,e.ids=[4761],e.modules={9344:e=>{e.exports=require("jsonwebtoken")},145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},5900:e=>{e.exports=require("pg")},6835:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,n){return n in t?t[n]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,n)):"function"==typeof t&&"default"===n?t:void 0}}})},9139:(e,t,n)=>{n.r(t),n.d(t,{config:()=>_,default:()=>m,routeModule:()=>f});var r={};n.r(r),n.d(r,{default:()=>p});var a=n(9150),s=n(1631),o=n(6835),i=n(5900),u=n(9344),l=n.n(u);let c=new i.Pool({connectionString:process.env.DATABASE_URL}),d=process.env.JWT_SECRET||"dev_secret_change_me";async function p(e,t){let n;if("POST"!==e.method)return t.status(405).end();let r=function(e){let t=(e.headers.cookie||"").split("; ").find(e=>e.startsWith("gidkit_token="));return t?decodeURIComponent(t.split("=")[1]):null}(e);if(!r)return t.status(401).json({message:"Unauthenticated"});try{n=l().verify(r,d)}catch(e){return t.status(401).json({message:"Unauthenticated"})}let{company_id:a,full_name:s,phone:o,car_name:i,plate_number:u,seats:p,notes:m}=e.body||{};if(!a||!s||!o||!i||!u||!p)return t.status(400).json({message:"company_id, full_name, phone, car_name, plate_number, seats обязательны"});let _=await c.connect();try{let e=await _.query(`
      SELECT 1
      FROM user_company_roles
      WHERE user_id = $1
        AND company_id = $2
        AND role IN ('owner','admin')
    `,[n.sub,a]);if(0===e.rowCount)return t.status(403).json({message:"Нет прав добавлять транспорт в эту компанию"});let r=parseInt(p,10),l=Number.isFinite(r)&&r>0?r:1,c=(await _.query(`
      INSERT INTO drivers (
        company_id,
        full_name,
        phone,
        car_name,
        plate_number,
        seats,
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id,
        company_id,
        full_name,
        phone,
        car_name,
        plate_number,
        seats,
        is_active,
        notes,
        created_at,
        updated_at
    `,[a,s,o,i,u,l,m||null])).rows[0];return t.status(201).json({driver:c})}catch(e){return console.error("create driver error:",e),t.status(500).json({message:"DB error",code:e.code||null,detail:e.detail||null,table:e.table||null,column:e.column||null})}finally{_.release()}}let m=(0,o.l)(r,"default"),_=(0,o.l)(r,"config"),f=new a.PagesAPIRouteModule({definition:{kind:s.x.PAGES_API,page:"/api/v1/company/drivers/create",pathname:"/api/v1/company/drivers/create",bundlePath:"",filename:""},userland:r})},1631:(e,t)=>{var n;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return n}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(n||(n={}))},9150:(e,t,n)=>{e.exports=n(145)}};var t=require("../../../../../webpack-api-runtime.js");t.C(e);var n=t(t.s=9139);module.exports=n})();