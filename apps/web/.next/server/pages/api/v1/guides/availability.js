"use strict";(()=>{var e={};e.id=9738,e.ids=[9738],e.modules={9344:e=>{e.exports=require("jsonwebtoken")},145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},5900:e=>{e.exports=require("pg")},6835:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,a){return a in t?t[a]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,a)):"function"==typeof t&&"default"===a?t:void 0}}})},7629:(e,t,a)=>{a.r(t),a.d(t,{config:()=>y,default:()=>g,routeModule:()=>_});var s={};a.r(s),a.d(s,{default:()=>p});var n=a(9150),i=a(1631),r=a(6835),u=a(5900),o=a(9344),l=a.n(o);let d=new u.Pool({connectionString:process.env.DATABASE_URL}),c=process.env.JWT_SECRET||"dev_secret_change_me",E=new Set(["free","busy","none"]);function f(e){if(!e)return null;let t=new Date(e);return Number.isNaN(t.getTime())?null:t.toISOString().slice(0,10)}async function m(e,t,a){let s=(await e.query("SELECT email, phone FROM users WHERE id = $1 LIMIT 1",[t])).rows[0];if(!s)return null;let n=await e.query(`
      SELECT id
      FROM guides
      WHERE company_id = $1
        AND (
          (email IS NOT NULL AND email = $2)
          OR (phone IS NOT NULL AND phone = $3)
        )
      LIMIT 1
    `,[a,s.email||null,s.phone||null]);return n.rows[0]?.id||null}async function p(e,t){let a;let s=function(e){let t=(e.headers.cookie||"").split("; ").find(e=>e.startsWith("gidkit_token="));return t?decodeURIComponent(t.split("=")[1]):null}(e);if(!s)return t.status(401).json({message:"Unauthenticated"});try{a=l().verify(s,c)}catch(e){return t.status(401).json({message:"Unauthenticated"})}let n=await d.connect();try{if("GET"===e.method){let{company_id:s,from:i,to:r}=e.query||{};if(!s||!i||!r)return t.status(400).json({message:"company_id, from, to обязательны"});let u=f(i),o=f(r);if(!u||!o)return t.status(400).json({message:"Некорректные даты"});let l=await n.query(`
          SELECT role FROM user_company_roles
          WHERE user_id = $1 AND company_id = $2 AND role = 'guide'
          LIMIT 1
        `,[a.sub,s]);if(0===l.rowCount)return t.status(403).json({message:"Нет доступа"});let d=await m(n,a.sub,s);if(!d)return t.status(404).json({message:"Гид не найден"});let c=await n.query(`
          SELECT date, status
          FROM guide_availability
          WHERE company_id = $1
            AND guide_id = $2
            AND date BETWEEN $3 AND $4
          ORDER BY date
        `,[s,d,u,o]);return t.status(200).json({items:c.rows.map(e=>({date:e.date.toISOString().slice(0,10),status:e.status}))})}if("PUT"===e.method){let{company_id:s,items:i}=e.body||{};if(!s||!Array.isArray(i))return t.status(400).json({message:"company_id и items обязательны"});if(i.length>200)return t.status(400).json({message:"Слишком много записей за раз"});let r=await n.query(`
          SELECT role FROM user_company_roles
          WHERE user_id = $1 AND company_id = $2 AND role = 'guide'
          LIMIT 1
        `,[a.sub,s]);if(0===r.rowCount)return t.status(403).json({message:"Нет доступа"});let u=await m(n,a.sub,s);if(!u)return t.status(404).json({message:"Гид не найден"});let o=[];for(let e of i){if(!e||!e.date||!E.has(e.status))continue;let t=f(e.date);t&&o.push({date:t,status:e.status})}if(0===o.length)return t.status(400).json({message:"Нет валидных записей"});for(let e of(await n.query("BEGIN"),o))"none"===e.status?await n.query(`
              DELETE FROM guide_availability
              WHERE guide_id = $1 AND company_id = $2 AND date = $3
            `,[u,s,e.date]):await n.query(`
              INSERT INTO guide_availability (guide_id, company_id, date, status)
              VALUES ($1, $2, $3, $4)
              ON CONFLICT (guide_id, company_id, date)
              DO UPDATE SET status = EXCLUDED.status, updated_at = now()
            `,[u,s,e.date,e.status]);return await n.query("COMMIT"),t.status(200).json({ok:!0,updated:o.length})}return t.status(405).end()}catch(e){return await n.query("ROLLBACK").catch(()=>{}),t.status(500).json({message:"DB error"})}finally{n.release()}}let g=(0,r.l)(s,"default"),y=(0,r.l)(s,"config"),_=new n.PagesAPIRouteModule({definition:{kind:i.x.PAGES_API,page:"/api/v1/guides/availability",pathname:"/api/v1/guides/availability",bundlePath:"",filename:""},userland:s})},1631:(e,t)=>{var a;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return a}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(a||(a={}))},9150:(e,t,a)=>{e.exports=a(145)}};var t=require("../../../../webpack-api-runtime.js");t.C(e);var a=t(t.s=7629);module.exports=a})();