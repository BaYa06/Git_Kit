"use strict";(()=>{var e={};e.id=3075,e.ids=[3075],e.modules={9344:e=>{e.exports=require("jsonwebtoken")},145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},5900:e=>{e.exports=require("pg")},6835:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,n){return n in t?t[n]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,n)):"function"==typeof t&&"default"===n?t:void 0}}})},5627:(e,t,n)=>{n.r(t),n.d(t,{config:()=>_,default:()=>m,routeModule:()=>f});var a={};n.r(a),n.d(a,{default:()=>c});var r=n(9150),o=n(1631),i=n(6835),s=n(5900),u=n(9344),l=n.n(u);let d=new s.Pool({connectionString:process.env.DATABASE_URL}),p=process.env.JWT_SECRET||"dev_secret_change_me";async function c(e,t){let n;if("POST"!==e.method)return t.status(405).end();let a=function(e){let t=(e.headers.cookie||"").split("; ").find(e=>e.startsWith("gidkit_token="));return t?decodeURIComponent(t.split("=")[1]):null}(e);if(!a)return t.status(401).json({message:"Unauthenticated"});try{n=l().verify(a,p)}catch(e){return t.status(401).json({message:"Unauthenticated"})}let{template_id:r,company_id:o,name:i,status:s,start_date:u,end_date:c,components:m}=e.body||{};if(!r||!o||!i)return t.status(400).json({message:"template_id, company_id и name обязательны"});let _=await d.connect();try{await _.query("BEGIN");let e=await _.query(`
      SELECT 1
      FROM user_company_roles
      WHERE user_id = $1
        AND company_id = $2
        AND role IN ('owner','admin')
      LIMIT 1
    `,[n.sub,o]);if(0===e.rowCount)return await _.query("ROLLBACK"),t.status(403).json({message:"Нет прав редактировать шаблон в этой компании"});if(await _.query(`
      UPDATE tour_templates
      SET name = $1,
          status = $2,
          start_date = $3,
          end_date = $4,
          updated_at = now()
      WHERE id = $5 AND company_id = $6
    `,[i.trim(),s||"active",u||null,c||null,r,o]),await _.query("DELETE FROM tour_template_components WHERE template_id = $1",[r]),Array.isArray(m)&&m.length>0)for(let e=0;e<m.length;e++){let t=m[e];await _.query(`
          INSERT INTO tour_template_components (template_id, type, comment, position)
          VALUES ($1, $2, $3, $4)
        `,[r,t.type||"other",t.comment||"",t.position||e+1])}return await _.query("COMMIT"),t.status(200).json({ok:!0})}catch(e){return await _.query("ROLLBACK"),t.status(500).json({message:"DB error"})}finally{_.release()}}let m=(0,i.l)(a,"default"),_=(0,i.l)(a,"config"),f=new r.PagesAPIRouteModule({definition:{kind:o.x.PAGES_API,page:"/api/v1/company/templates/update",pathname:"/api/v1/company/templates/update",bundlePath:"",filename:""},userland:a})},1631:(e,t)=>{var n;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return n}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(n||(n={}))},9150:(e,t,n)=>{e.exports=n(145)}};var t=require("../../../../../webpack-api-runtime.js");t.C(e);var n=t(t.s=5627);module.exports=n})();