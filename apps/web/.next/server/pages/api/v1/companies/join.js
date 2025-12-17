"use strict";(()=>{var e={};e.id=9786,e.ids=[9786],e.modules={9344:e=>{e.exports=require("jsonwebtoken")},145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},5900:e=>{e.exports=require("pg")},7618:e=>{e.exports=import("bcryptjs")},6835:(e,n)=>{Object.defineProperty(n,"l",{enumerable:!0,get:function(){return function e(n,a){return a in n?n[a]:"then"in n&&"function"==typeof n.then?n.then(n=>e(n,a)):"function"==typeof n&&"default"===a?n:void 0}}})},3645:(e,n,a)=>{a.a(e,async(e,t)=>{try{a.r(n),a.d(n,{config:()=>l,default:()=>c,routeModule:()=>m});var i=a(9150),s=a(1631),o=a(6835),r=a(7443),u=e([r]);r=(u.then?(await u)():u)[0];let c=(0,o.l)(r,"default"),l=(0,o.l)(r,"config"),m=new i.PagesAPIRouteModule({definition:{kind:s.x.PAGES_API,page:"/api/v1/companies/join",pathname:"/api/v1/companies/join",bundlePath:"",filename:""},userland:r});t()}catch(e){t(e)}})},7443:(e,n,a)=>{a.a(e,async(e,t)=>{try{a.r(n),a.d(n,{default:()=>c});var i=a(5900),s=a(9344),o=a.n(s),r=a(7618),u=e([r]);r=(u.then?(await u)():u)[0];let l=new i.Pool({connectionString:process.env.DATABASE_URL}),m=process.env.JWT_SECRET||"dev_secret_change_me";async function c(e,n){let a;if("POST"!==e.method)return n.setHeader("Allow",["POST"]),n.status(405).json({message:"Method not allowed"});let t=function(e){let n=(e.headers.cookie||"").split("; ").find(e=>e.startsWith("gidkit_token="));return n?decodeURIComponent(n.split("=")[1]):null}(e);if(!t)return n.status(401).json({message:"Не авторизован"});try{a=o().verify(t,m)}catch(e){return n.status(401).json({message:"Не авторизован"})}let{login:i,password:s}=e.body||{};if(!i||!s)return n.status(400).json({message:"Нужно указать логин и пароль"});let u=await l.connect();try{await u.query("BEGIN");let{rows:e}=await u.query(`SELECT ci.*, c.name AS company_name, c.logo_url
       FROM company_invites ci
       JOIN companies c ON c.id = ci.company_id
       WHERE ci.login = $1
         AND (ci.is_used IS NOT TRUE)
       ORDER BY ci.created_at DESC
       LIMIT 1`,[i]);if(!e[0])return await u.query("ROLLBACK"),n.status(404).json({message:"Такой пользователь не найден"});let t=e[0];if(!await r.default.compare(s,t.password_hash))return await u.query("ROLLBACK"),n.status(401).json({message:"Такой пользователь не найден"});let{rows:o}=await u.query(`SELECT column_name
       FROM information_schema.columns
       WHERE table_name = 'user_company_roles'`),c=o.map(e=>e.column_name),l=c.includes("role"),m=c.includes("invited_by"),_=c.includes("invited_at"),{rows:d}=await u.query(`SELECT id, role
       FROM user_company_roles
       WHERE user_id = $1 AND company_id = $2
       LIMIT 1`,[a.sub,t.company_id]);if(d[0])l&&await u.query(`UPDATE user_company_roles
         SET role = $3
         WHERE user_id = $1 AND company_id = $2`,[a.sub,t.company_id,t.role]);else{let e=["user_id","company_id"],n=[a.sub,t.company_id],i=["$1","$2"],s=3;l&&(e.push("role"),n.push(t.role),i.push(`$${s++}`)),m&&(e.push("invited_by"),n.push(t.created_by||null),i.push(`$${s++}`)),_&&(e.push("invited_at"),n.push(new Date),i.push(`$${s++}`));let o=`
        INSERT INTO user_company_roles (${e.join(", ")})
        VALUES (${i.join(", ")})
      `;await u.query(o,n)}if("guide"===t.role){let{rows:e}=await u.query(`SELECT id FROM guides WHERE company_id = $1 AND email = (
            SELECT email FROM users WHERE id = $2 LIMIT 1
         ) LIMIT 1`,[t.company_id,a.sub]);if(!e[0]){let{rows:e}=await u.query("SELECT first_name, last_name, email, phone FROM users WHERE id = $1 LIMIT 1",[a.sub]),n=e[0]||{},i=[n.first_name,n.last_name].filter(Boolean).join(" ")||n.email||"Гид";await u.query(`
          INSERT INTO guides (company_id, full_name, phone, email, is_active, notes, languages)
          VALUES ($1, $2, $3, $4, true, $5, $6)
          `,[t.company_id,i,n.phone||null,n.email||null,"Добавлен через приглашение",["Русский","Кыргызский"]])}}let p=(await u.query(`SELECT column_name
       FROM information_schema.columns
       WHERE table_name = 'company_invites' AND column_name = 'is_used'`)).rowCount>0,E=(await u.query(`SELECT column_name
       FROM information_schema.columns
       WHERE table_name = 'company_invites' AND column_name = 'used_by'`)).rowCount>0,y=(await u.query(`SELECT column_name
       FROM information_schema.columns
       WHERE table_name = 'company_invites' AND column_name = 'used_at'`)).rowCount>0,h=[],f=[],w=1;if(p&&(h.push(`is_used = $${w++}`),f.push(!0)),E&&(h.push(`used_by = $${w++}`),f.push(a.sub)),y&&(h.push(`used_at = $${w++}`),f.push(new Date)),h.length>0){f.push(t.id);let e=`
        UPDATE company_invites
        SET ${h.join(", ")}
        WHERE id = $${f.length}
      `;await u.query(e,f)}let{rows:R}=await u.query(`SELECT c.id, c.name, c.logo_url
       FROM companies c
       JOIN user_company_roles ucr ON ucr.company_id = c.id
       WHERE ucr.user_id = $1
       ORDER BY c.name ASC`,[a.sub]);return await u.query("COMMIT"),n.status(200).json({ok:!0,companies:R,joined_company_id:t.company_id})}catch(e){return await u.query("ROLLBACK"),n.status(500).json({message:"Ошибка сервера"})}finally{u.release()}}t()}catch(e){t(e)}})},1631:(e,n)=>{var a;Object.defineProperty(n,"x",{enumerable:!0,get:function(){return a}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(a||(a={}))},9150:(e,n,a)=>{e.exports=a(145)}};var n=require("../../../../webpack-api-runtime.js");n.C(e);var a=n(n.s=3645);module.exports=a})();