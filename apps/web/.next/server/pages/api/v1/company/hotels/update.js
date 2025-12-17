"use strict";(()=>{var e={};e.id=4738,e.ids=[4738],e.modules={9344:e=>{e.exports=require("jsonwebtoken")},145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},5900:e=>{e.exports=require("pg")},6835:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,n){return n in t?t[n]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,n)):"function"==typeof t&&"default"===n?t:void 0}}})},2446:(e,t,n)=>{n.r(t),n.d(t,{config:()=>f,default:()=>p,routeModule:()=>P});var r={};n.r(r),n.d(r,{default:()=>m});var a=n(9150),o=n(1631),s=n(6835),i=n(5900),u=n(9344),l=n.n(u);let d=new i.Pool({connectionString:process.env.DATABASE_URL}),c=process.env.JWT_SECRET||"dev_secret_change_me";async function m(e,t){let n;if("POST"!==e.method)return t.status(405).end();let r=function(e){let t=(e.headers.cookie||"").split("; ").find(e=>e.startsWith("gidkit_token="));return t?decodeURIComponent(t.split("=")[1]):null}(e);if(!r)return t.status(401).json({message:"Unauthenticated"});try{n=l().verify(r,c)}catch(e){return t.status(401).json({message:"Unauthenticated"})}let{id:a,company_id:o,name:s,stars:i,phone:u,meal_plan:m,address:p,checkin_from:f,checkout_until:P}=e.body||{};if(!a||!o||!s)return t.status(400).json({message:"id, company_id и name обязательны"});let _=await d.connect();try{let e=await _.query(`
      SELECT 1
      FROM user_company_roles
      WHERE user_id = $1
        AND company_id = $2
        AND role IN ('owner','admin')
    `,[n.sub,o]);if(0===e.rowCount)return t.status(403).json({message:"Нет прав редактировать отели этой компании"});let r=parseInt(i,10),l=Number.isFinite(r)&&r>0?Math.min(Math.max(r,1),5):3,d=await _.query(`
      UPDATE hotels
      SET
        name = $3,
        stars = $4,
        phone = $5,
        meal_plan = $6,
        address = $7,
        checkin_from = $8::time,
        checkout_until = $9::time
      WHERE id = $1
        AND company_id = $2
      RETURNING
        id,
        company_id,
        name,
        stars,
        phone,
        meal_plan,
        address,
        checkin_from,
        checkout_until
    `,[a,o,s,l,u||null,m||null,p||null,f||"14:00",P||"12:00"]);if(0===d.rowCount)return t.status(404).json({message:"Отель не найден"});let c=d.rows[0];return t.status(200).json({hotel:c})}catch(e){return console.error("update hotel error:",e),t.status(500).json({message:"DB error",code:e.code||null,detail:e.detail||null,table:e.table||null,column:e.column||null})}finally{_.release()}}let p=(0,s.l)(r,"default"),f=(0,s.l)(r,"config"),P=new a.PagesAPIRouteModule({definition:{kind:o.x.PAGES_API,page:"/api/v1/company/hotels/update",pathname:"/api/v1/company/hotels/update",bundlePath:"",filename:""},userland:r})},1631:(e,t)=>{var n;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return n}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(n||(n={}))},9150:(e,t,n)=>{e.exports=n(145)}};var t=require("../../../../../webpack-api-runtime.js");t.C(e);var n=t(t.s=2446);module.exports=n})();