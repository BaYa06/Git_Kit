"use strict";(()=>{var e={};e.id=1804,e.ids=[1804],e.modules={9344:e=>{e.exports=require("jsonwebtoken")},145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},5900:e=>{e.exports=require("pg")},6835:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,n){return n in t?t[n]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,n)):"function"==typeof t&&"default"===n?t:void 0}}})},781:(e,t,n)=>{n.r(t),n.d(t,{config:()=>_,default:()=>m,routeModule:()=>f});var r={};n.r(r),n.d(r,{default:()=>l});var a=n(9150),s=n(1631),o=n(6835),i=n(5900),u=n(9344),d=n.n(u);let c=new i.Pool({connectionString:process.env.DATABASE_URL}),p=process.env.JWT_SECRET||"dev_secret_change_me";async function l(e,t){let n;if("GET"!==e.method)return t.status(405).end();let r=function(e){let t=(e.headers.cookie||"").split("; ").find(e=>e.startsWith("gidkit_token="));return t?decodeURIComponent(t.split("=")[1]):null}(e);if(!r)return t.status(401).json({message:"Unauthenticated"});try{n=d().verify(r,p)}catch(e){return t.status(401).json({message:"Unauthenticated"})}let{id:a}=e.query;if(!a)return t.status(400).json({message:"id обязателен"});let s=await c.connect();try{let e=await s.query(`
      SELECT id, company_id, name, status, start_date, end_date
      FROM tour_templates
      WHERE id = $1
    `,[a]);if(0===e.rowCount)return t.status(404).json({message:"Шаблон не найден"});let r=e.rows[0],o=await s.query(`
      SELECT 1
      FROM user_company_roles
      WHERE user_id = $1
        AND company_id = $2
      LIMIT 1
    `,[n.sub,r.company_id]);if(0===o.rowCount)return t.status(403).json({message:"Нет доступа к этому шаблону"});let i=await s.query(`
      SELECT id, type, comment, position
      FROM tour_template_components
      WHERE template_id = $1
      ORDER BY position ASC
    `,[a]),u={id:r.id,company_id:r.company_id,name:r.name,status:r.status,start_date:r.start_date,end_date:r.end_date,components:i.rows};return t.status(200).json({template:u})}catch(e){return t.status(500).json({message:"DB error"})}finally{s.release()}}let m=(0,o.l)(r,"default"),_=(0,o.l)(r,"config"),f=new a.PagesAPIRouteModule({definition:{kind:s.x.PAGES_API,page:"/api/v1/company/templates/[id]",pathname:"/api/v1/company/templates/[id]",bundlePath:"",filename:""},userland:r})},1631:(e,t)=>{var n;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return n}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(n||(n={}))},9150:(e,t,n)=>{e.exports=n(145)}};var t=require("../../../../../webpack-api-runtime.js");t.C(e);var n=t(t.s=781);module.exports=n})();