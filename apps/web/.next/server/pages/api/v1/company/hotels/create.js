"use strict";(()=>{var e={};e.id=4583,e.ids=[4583],e.modules={9344:e=>{e.exports=require("jsonwebtoken")},145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},5900:e=>{e.exports=require("pg")},6835:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,n){return n in t?t[n]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,n)):"function"==typeof t&&"default"===n?t:void 0}}})},6900:(e,t,n)=>{n.r(t),n.d(t,{config:()=>f,default:()=>p,routeModule:()=>_});var r={};n.r(r),n.d(r,{default:()=>m});var a=n(9150),o=n(1631),s=n(6835),i=n(5900),u=n(9344),l=n.n(u);let c=new i.Pool({connectionString:process.env.DATABASE_URL}),d=process.env.JWT_SECRET||"dev_secret_change_me";async function m(e,t){let n;if("POST"!==e.method)return t.status(405).end();let r=function(e){let t=(e.headers.cookie||"").split("; ").find(e=>e.startsWith("gidkit_token="));return t?decodeURIComponent(t.split("=")[1]):null}(e);if(!r)return t.status(401).json({message:"Unauthenticated"});try{n=l().verify(r,d)}catch(e){return t.status(401).json({message:"Unauthenticated"})}let{company_id:a,name:o,stars:s,phone:i,meal_plan:u,address:m,checkin_from:p,checkout_until:f}=e.body||{};if(!a||!o)return t.status(400).json({message:"company_id и name обязательны"});let _=await c.connect();try{let e=await _.query(`
      SELECT 1
      FROM user_company_roles
      WHERE user_id = $1
        AND company_id = $2
        AND role IN ('owner','admin')
    `,[n.sub,a]);if(0===e.rowCount)return t.status(403).json({message:"Нет прав добавлять отели в эту компанию"});let r=parseInt(s,10),l=Number.isFinite(r)&&r>0?Math.min(Math.max(r,1),5):3,c=(await _.query(`
      INSERT INTO hotels (
        company_id,
        name,
        stars,
        phone,
        meal_plan,
        address,
        checkin_from,
        checkout_until
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7::time, $8::time)
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
    `,[a,o,l,i||null,u||null,m||null,p||"14:00",f||"12:00"])).rows[0];return t.status(201).json({hotel:c})}catch(e){return console.error("create hotel error:",e),t.status(500).json({message:"DB error",code:e.code||null,detail:e.detail||null,table:e.table||null,column:e.column||null})}finally{_.release()}}let p=(0,s.l)(r,"default"),f=(0,s.l)(r,"config"),_=new a.PagesAPIRouteModule({definition:{kind:o.x.PAGES_API,page:"/api/v1/company/hotels/create",pathname:"/api/v1/company/hotels/create",bundlePath:"",filename:""},userland:r})},1631:(e,t)=>{var n;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return n}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(n||(n={}))},9150:(e,t,n)=>{e.exports=n(145)}};var t=require("../../../../../webpack-api-runtime.js");t.C(e);var n=t(t.s=6900);module.exports=n})();