"use strict";(()=>{var e={};e.id=7445,e.ids=[7445],e.modules={9344:e=>{e.exports=require("jsonwebtoken")},145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},5900:e=>{e.exports=require("pg")},6835:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,a){return a in t?t[a]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,a)):"function"==typeof t&&"default"===a?t:void 0}}})},2457:(e,t,a)=>{a.r(t),a.d(t,{config:()=>_,default:()=>c,routeModule:()=>y});var n={};a.r(n),a.d(n,{default:()=>l});var r=a(9150),s=a(1631),o=a(6835),i=a(5900),d=a(9344),u=a.n(d);let m=new i.Pool({connectionString:process.env.DATABASE_URL}),p=process.env.JWT_SECRET||"dev_secret_change_me";async function l(e,t){let a;if("POST"!==e.method)return t.status(405).end();let n=function(e){let t=(e.headers.cookie||"").split("; ").find(e=>e.startsWith("gidkit_token="));return t?decodeURIComponent(t.split("=")[1]):null}(e);if(!n)return t.status(401).json({message:"Unauthenticated"});try{a=u().verify(n,p)}catch(e){return t.status(401).json({message:"Unauthenticated"})}let{template_id:r,company_id:s}=e.body||{};if(!r||!s)return t.status(400).json({message:"template_id и company_id обязательны"});let o=await m.connect();try{await o.query("BEGIN");let e=await o.query(`
      SELECT 1
      FROM user_company_roles
      WHERE user_id = $1
        AND company_id = $2
        AND role IN ('owner','admin')
      LIMIT 1
    `,[a.sub,s]);if(0===e.rowCount)return await o.query("ROLLBACK"),t.status(403).json({message:"Нет прав копировать шаблоны в этой компании"});let n=await o.query(`
      SELECT id, company_id, name, status, start_date, end_date
      FROM tour_templates
      WHERE id = $1 AND company_id = $2
    `,[r,s]);if(0===n.rowCount)return await o.query("ROLLBACK"),t.status(404).json({message:"Шаблон не найден"});let i=n.rows[0],d=i.name.length>80?i.name.slice(0,80)+" (копия)":i.name+" (копия)",u=(await o.query(`
      INSERT INTO tour_templates (company_id, name, status, start_date, end_date, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, company_id, name, status, start_date, end_date, created_at
    `,[i.company_id,d,i.status,i.start_date,i.end_date,a.sub])).rows[0],m=await o.query(`
      SELECT type, comment, position
      FROM tour_template_components
      WHERE template_id = $1
      ORDER BY position ASC
    `,[r]);for(let e of m.rows)await o.query(`
        INSERT INTO tour_template_components (template_id, type, comment, position)
        VALUES ($1, $2, $3, $4)
      `,[u.id,e.type,e.comment,e.position]);await o.query("COMMIT");let p=0,l=0;if(u.start_date&&u.end_date){let e=new Date(u.start_date),t=new Date(u.end_date).getTime()-e.getTime();if(!Number.isNaN(t)&&t>=0){let e=Math.round(t/864e5);p=e+1,l=e}}let c=m.rows.length||0;return t.status(201).json({template:{id:u.id,company_id:u.company_id,name:u.name,status:u.status,start_date:u.start_date,end_date:u.end_date,days:p,nights:l,segments:c}})}catch(e){return await o.query("ROLLBACK"),t.status(500).json({message:"DB error"})}finally{o.release()}}let c=(0,o.l)(n,"default"),_=(0,o.l)(n,"config"),y=new r.PagesAPIRouteModule({definition:{kind:s.x.PAGES_API,page:"/api/v1/company/templates/copy",pathname:"/api/v1/company/templates/copy",bundlePath:"",filename:""},userland:n})},1631:(e,t)=>{var a;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return a}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(a||(a={}))},9150:(e,t,a)=>{e.exports=a(145)}};var t=require("../../../../../webpack-api-runtime.js");t.C(e);var a=t(t.s=2457);module.exports=a})();