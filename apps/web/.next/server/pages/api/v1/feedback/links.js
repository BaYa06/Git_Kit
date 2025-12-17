"use strict";(()=>{var e={};e.id=1823,e.ids=[1823],e.modules={9344:e=>{e.exports=require("jsonwebtoken")},145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},5900:e=>{e.exports=require("pg")},6113:e=>{e.exports=require("crypto")},6835:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,n){return n in t?t[n]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,n)):"function"==typeof t&&"default"===n?t:void 0}}})},3272:(e,t,n)=>{n.r(t),n.d(t,{config:()=>g,default:()=>m,routeModule:()=>k});var i={};n.r(i),n.d(i,{default:()=>f});var r=n(9150),s=n(1631),a=n(6835),o=n(5900),u=n(9344),d=n.n(u),l=n(6113);let c=new o.Pool({connectionString:process.env.DATABASE_URL}),_=process.env.JWT_SECRET||"dev_secret_change_me",E=e=>"https://git-kit-web.vercel.app";async function p(e,t,n){let i=(await e.query("SELECT email, phone FROM users WHERE id = $1 LIMIT 1",[t])).rows[0];if(!i)return null;let r=await e.query(`
      SELECT id
      FROM guides
      WHERE company_id = $1
        AND (
          (email IS NOT NULL AND email = $2)
          OR (phone IS NOT NULL AND phone = $3)
        )
      LIMIT 1
    `,[n,i.email||null,i.phone||null]);return r.rows[0]?.id||null}async function f(e,t){let n;if("POST"!==e.method&&"GET"!==e.method)return t.status(405).end();let i=function(e){let t=(e.headers.cookie||"").split("; ").find(e=>e.startsWith("gidkit_token="));return t?decodeURIComponent(t.split("=")[1]):null}(e);if(!i)return t.status(401).json({message:"Unauthenticated"});try{n=d().verify(i,_)}catch(e){return t.status(401).json({message:"Unauthenticated"})}let r=await c.connect();try{if("GET"===e.method){let{token:n}=e.query||{};if(!n)return t.status(400).json({message:"token обязателен"});let i=await r.query(`
          SELECT id, tour_id, company_id, guide_id, driver_id, hotel_id, token, is_active, expires_at
          FROM tour_feedback_links
          WHERE token = $1
          LIMIT 1
        `,[n]);if(0===i.rowCount)return t.status(404).json({message:"Ссылка не найдена"});let s=i.rows[0],a=s.expires_at&&new Date(s.expires_at)<new Date;if(!s.is_active||a)return t.status(410).json({message:"Ссылка неактивна"});let o=E(e),u=`${o}/feedback/${s.token}`;return t.status(200).json({link:{...s,url:u}})}let{tour_id:i}=e.body||{};if(!i)return t.status(400).json({message:"tour_id обязателен"});let s=(await r.query("SELECT company_id, main_guide_id FROM tours WHERE id = $1 LIMIT 1",[i])).rows[0];if(!s)return t.status(404).json({message:"Тур не найден"});let a=s.company_id,o=await r.query(`
        SELECT role FROM user_company_roles
        WHERE user_id = $1 AND company_id = $2 AND role = 'guide'
        LIMIT 1
      `,[n.sub,a]);if(0===o.rowCount)return t.status(403).json({message:"Нет доступа"});let u=await p(r,n.sub,a);if(!u)return t.status(403).json({message:"Вы не назначены гидом"});let d=await r.query(`
        SELECT 1
        FROM tours t
        LEFT JOIN tour_components tc
          ON tc.tour_id = t.id AND tc.type = 'guide' AND tc.guide_id IS NOT NULL
        WHERE t.id = $1 AND (
          t.main_guide_id = $2 OR tc.guide_id = $2
        )
        LIMIT 1
      `,[i,u]);if(0===d.rowCount)return t.status(403).json({message:"Вы не привязаны к этому туру"});let c=await r.query(`
        SELECT id, token
        FROM tour_feedback_links
        WHERE tour_id = $1 AND is_active = true
        ORDER BY created_at DESC
        LIMIT 1
      `,[i]),_=c.rows[0]?.token||null,f=c.rows[0]?.id||null;_?f&&await r.query(`
          UPDATE tour_feedback_links
          SET guide_id = COALESCE(guide_id, $2)
          WHERE id = $1
        `,[f,u]):(_=(0,l.randomUUID)(),await r.query(`
          INSERT INTO tour_feedback_links (tour_id, company_id, guide_id, token, is_active, created_at)
          VALUES ($1, $2, $3, $4, true, now())
        `,[i,a,u,_]));let m=E(e),g=`${m}/feedback/${_}`;return t.status(200).json({token:_,url:g})}catch(e){return t.status(500).json({message:"DB error"})}finally{r.release()}}let m=(0,a.l)(i,"default"),g=(0,a.l)(i,"config"),k=new r.PagesAPIRouteModule({definition:{kind:s.x.PAGES_API,page:"/api/v1/feedback/links",pathname:"/api/v1/feedback/links",bundlePath:"",filename:""},userland:i})},1631:(e,t)=>{var n;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return n}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(n||(n={}))},9150:(e,t,n)=>{e.exports=n(145)}};var t=require("../../../../webpack-api-runtime.js");t.C(e);var n=t(t.s=3272);module.exports=n})();