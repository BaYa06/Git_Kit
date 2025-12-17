"use strict";(()=>{var e={};e.id=4291,e.ids=[4291],e.modules={9344:e=>{e.exports=require("jsonwebtoken")},145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},5900:e=>{e.exports=require("pg")},6835:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,n){return n in t?t[n]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,n)):"function"==typeof t&&"default"===n?t:void 0}}})},2241:(e,t,n)=>{n.r(t),n.d(t,{config:()=>E,default:()=>m,routeModule:()=>p});var r={};n.r(r),n.d(r,{default:()=>_});var i=n(9150),a=n(1631),o=n(6835),u=n(5900),s=n(9344),d=n.n(s);let l=new u.Pool({connectionString:process.env.DATABASE_URL}),c=process.env.JWT_SECRET||"dev_secret_change_me";async function f(e,t,n){let r=(await e.query("SELECT email, phone FROM users WHERE id = $1 LIMIT 1",[t])).rows[0];if(!r)return null;let i=await e.query(`
      SELECT id
      FROM guides
      WHERE company_id = $1
        AND (
          (email IS NOT NULL AND email = $2)
          OR (phone IS NOT NULL AND phone = $3)
        )
      LIMIT 1
    `,[n,r.email||null,r.phone||null]);return i.rows[0]?.id||null}async function _(e,t){let n;if("GET"!==e.method)return t.status(405).end();let{tour_id:r}=e.query||{};if(!r)return t.status(400).json({message:"tour_id обязателен"});let i=function(e){let t=(e.headers.cookie||"").split("; ").find(e=>e.startsWith("gidkit_token="));return t?decodeURIComponent(t.split("=")[1]):null}(e);if(!i)return t.status(401).json({message:"Unauthenticated"});try{n=d().verify(i,c)}catch(e){return t.status(401).json({message:"Unauthenticated"})}let a=await l.connect();try{let e=(await a.query("SELECT id, company_id, main_guide_id FROM tours WHERE id = $1 LIMIT 1",[r])).rows[0];if(!e)return t.status(404).json({message:"Тур не найден"});let i=await a.query(`
        SELECT role
        FROM user_company_roles
        WHERE user_id = $1 AND company_id = $2 AND role IN ('guide','admin','owner','manager','coordinator')
        LIMIT 1
      `,[n.sub,e.company_id]);if(0===i.rowCount)return t.status(403).json({message:"Нет доступа"});let o=await f(a,n.sub,e.company_id);if("guide"===i.rows[0].role){let e=await a.query(`
          SELECT 1
          FROM tours t
          LEFT JOIN tour_components tc
            ON tc.tour_id = t.id AND tc.type = 'guide' AND tc.guide_id IS NOT NULL
          WHERE t.id = $1 AND (t.main_guide_id = $2 OR tc.guide_id = $2)
          LIMIT 1
        `,[r,o||null]);if(0===e.rowCount)return t.status(403).json({message:"Вы не привязаны к этому туру"})}let u=await a.query(`
        SELECT
          f.id,
          f.tourist_name,
          f.rating_guide,
          f.rating_transport,
          f.rating_tour,
          f.guide_comment,
          f.driver_comment,
          f.tour_comment,
          f.created_at
        FROM tour_feedbacks f
        JOIN tour_feedback_links l ON l.id = f.feedback_link_id
        WHERE l.tour_id = $1
        ORDER BY f.created_at DESC
      `,[r]);return t.status(200).json({items:u.rows||[]})}catch(e){return t.status(500).json({message:"DB error"})}finally{a.release()}}let m=(0,o.l)(r,"default"),E=(0,o.l)(r,"config"),p=new i.PagesAPIRouteModule({definition:{kind:a.x.PAGES_API,page:"/api/v1/feedback/list",pathname:"/api/v1/feedback/list",bundlePath:"",filename:""},userland:r})},1631:(e,t)=>{var n;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return n}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(n||(n={}))},9150:(e,t,n)=>{e.exports=n(145)}};var t=require("../../../../webpack-api-runtime.js");t.C(e);var n=t(t.s=2241);module.exports=n})();