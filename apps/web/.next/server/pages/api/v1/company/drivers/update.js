"use strict";(()=>{var e={};e.id=9765,e.ids=[9765],e.modules={9344:e=>{e.exports=require("jsonwebtoken")},145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},5900:e=>{e.exports=require("pg")},6835:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,n){return n in t?t[n]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,n)):"function"==typeof t&&"default"===n?t:void 0}}})},4888:(e,t,n)=>{n.r(t),n.d(t,{config:()=>_,default:()=>m,routeModule:()=>f});var r={};n.r(r),n.d(r,{default:()=>p});var a=n(9150),s=n(1631),o=n(6835),u=n(5900),i=n(9344),l=n.n(i);let d=new u.Pool({connectionString:process.env.DATABASE_URL}),c=process.env.JWT_SECRET||"dev_secret_change_me";async function p(e,t){let n;if("POST"!==e.method)return t.status(405).end();let r=function(e){let t=(e.headers.cookie||"").split("; ").find(e=>e.startsWith("gidkit_token="));return t?decodeURIComponent(t.split("=")[1]):null}(e);if(!r)return t.status(401).json({message:"Unauthenticated"});try{n=l().verify(r,c)}catch(e){return t.status(401).json({message:"Unauthenticated"})}let{id:a,company_id:s,full_name:o,phone:u,car_name:i,plate_number:p,seats:m,notes:_}=e.body||{};if(!a||!s||!o||!u||!i||!p||!m)return t.status(400).json({message:"id, company_id, full_name, phone, car_name, plate_number, seats обязательны"});let f=await d.connect();try{let e=await f.query(`
      SELECT 1
      FROM user_company_roles
      WHERE user_id = $1
        AND company_id = $2
        AND role IN ('owner','admin')
    `,[n.sub,s]);if(0===e.rowCount)return t.status(403).json({message:"Нет прав редактировать транспорт этой компании"});let r=parseInt(m,10),l=Number.isFinite(r)&&r>0?r:1,d=await f.query(`
      UPDATE drivers
      SET
        full_name   = $3,
        phone       = $4,
        car_name    = $5,
        plate_number= $6,
        seats       = $7,
        notes       = $8,
        updated_at  = now()
      WHERE id = $1
        AND company_id = $2
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
    `,[a,s,o,u,i,p,l,_||null]);if(0===d.rowCount)return t.status(404).json({message:"Транспорт не найден"});let c=d.rows[0];return t.status(200).json({driver:c})}catch(e){return console.error("update driver error:",e),t.status(500).json({message:"DB error",code:e.code||null,detail:e.detail||null,table:e.table||null,column:e.column||null})}finally{f.release()}}let m=(0,o.l)(r,"default"),_=(0,o.l)(r,"config"),f=new a.PagesAPIRouteModule({definition:{kind:s.x.PAGES_API,page:"/api/v1/company/drivers/update",pathname:"/api/v1/company/drivers/update",bundlePath:"",filename:""},userland:r})},1631:(e,t)=>{var n;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return n}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(n||(n={}))},9150:(e,t,n)=>{e.exports=n(145)}};var t=require("../../../../../webpack-api-runtime.js");t.C(e);var n=t(t.s=4888);module.exports=n})();