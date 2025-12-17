"use strict";(()=>{var e={};e.id=5589,e.ids=[5589],e.modules={9344:e=>{e.exports=require("jsonwebtoken")},145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},5900:e=>{e.exports=require("pg")},6835:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,n){return n in t?t[n]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,n)):"function"==typeof t&&"default"===n?t:void 0}}})},5669:(e,t,n)=>{n.r(t),n.d(t,{config:()=>A,default:()=>p,routeModule:()=>g});var r={};n.r(r),n.d(r,{default:()=>m});var a=n(9150),u=n(1631),i=n(6835),l=n(5900),s=n(9344),o=n.n(s);let E=new l.Pool({connectionString:process.env.DATABASE_URL}),d=process.env.JWT_SECRET||"dev_secret_change_me",c=["Кыргызский","Русский","Английский"];async function f(e,t,n){let r=(await e.query("SELECT email, phone FROM users WHERE id = $1 LIMIT 1",[t])).rows[0];if(!r)return null;let a=await e.query(`
      SELECT id
      FROM guides
      WHERE company_id = $1
        AND (
          (email IS NOT NULL AND email = $2)
          OR (phone IS NOT NULL AND phone = $3)
        )
      LIMIT 1
    `,[n,r.email||null,r.phone||null]);return a.rows[0]?.id||null}async function m(e,t){let n;if("PUT"!==e.method)return t.status(405).end();let r=function(e){let t=(e.headers.cookie||"").split("; ").find(e=>e.startsWith("gidkit_token="));return t?decodeURIComponent(t.split("=")[1]):null}(e);if(!r)return t.status(401).json({message:"Unauthenticated"});try{n=o().verify(r,d)}catch(e){return t.status(401).json({message:"Unauthenticated"})}let{company_id:a,first_name:u,last_name:i,email:l,phone:s,languages:m}=e.body||{};if(!a)return t.status(400).json({message:"company_id обязателен"});let p=function(e){if(!Array.isArray(e))return[];let t=[];return e.forEach(e=>{if(!e||"string"!=typeof e)return;let n=e.trim();!(!c.includes(n)||t.includes(n))&&(t.length>=3||t.push(n))}),t}(m);if(m&&0===p.length)return t.status(400).json({message:"Выберите до трёх языков из списка"});let A=await E.connect();try{let e=await A.query(`
        SELECT role FROM user_company_roles
        WHERE user_id = $1 AND company_id = $2 AND role = 'guide'
        LIMIT 1
      `,[n.sub,a]);if(0===e.rowCount)return t.status(403).json({message:"Нет доступа"});let r=await f(A,n.sub,a);if(!r)return t.status(404).json({message:"Гид не найден"});if(l&&(await A.query("SELECT 1 FROM users WHERE email = $1 AND id <> $2 LIMIT 1",[l,n.sub])).rowCount>0)return t.status(409).json({message:"Этот email уже занят"});await A.query("BEGIN"),await A.query(`
        UPDATE users
           SET first_name = COALESCE($1, first_name),
               last_name  = COALESCE($2, last_name),
               email      = COALESCE($3, email),
               phone      = COALESCE($4, phone)
         WHERE id = $5
      `,[u??null,i??null,l??null,s??null,n.sub]);let o=[u,i].filter(Boolean).join(" ").trim();return await A.query(`
        UPDATE guides
           SET full_name = COALESCE($1, full_name),
               email     = COALESCE($2, email),
               phone     = COALESCE($3, phone),
               languages = CASE WHEN $4::text[] IS NOT NULL THEN $4 ELSE languages END
         WHERE id = $5 AND company_id = $6
      `,[o||null,l??null,s??null,p.length?p:null,r,a]),await A.query("COMMIT"),t.status(200).json({ok:!0,guide:{id:r,full_name:o||null,email:l||null,phone:s||null,languages:p.length?p:null}})}catch(e){return await A.query("ROLLBACK").catch(()=>{}),t.status(500).json({message:"Server error"})}finally{A.release()}}let p=(0,i.l)(r,"default"),A=(0,i.l)(r,"config"),g=new a.PagesAPIRouteModule({definition:{kind:u.x.PAGES_API,page:"/api/v1/guides/profile",pathname:"/api/v1/guides/profile",bundlePath:"",filename:""},userland:r})},1631:(e,t)=>{var n;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return n}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(n||(n={}))},9150:(e,t,n)=>{e.exports=n(145)}};var t=require("../../../../webpack-api-runtime.js");t.C(e);var n=t(t.s=5669);module.exports=n})();