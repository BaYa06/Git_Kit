"use strict";(()=>{var t={};t.id=8630,t.ids=[8630],t.modules={9344:t=>{t.exports=require("jsonwebtoken")},145:t=>{t.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},5900:t=>{t.exports=require("pg")},6835:(t,e)=>{Object.defineProperty(e,"l",{enumerable:!0,get:function(){return function t(e,n){return n in e?e[n]:"then"in e&&"function"==typeof e.then?e.then(e=>t(e,n)):"function"==typeof e&&"default"===n?e:void 0}}})},794:(t,e,n)=>{n.r(e),n.d(e,{config:()=>g,default:()=>m,routeModule:()=>p});var s={};n.r(s),n.d(s,{default:()=>l});var a=n(9150),r=n(1631),o=n(6835),i=n(5900),u=n(9344),d=n.n(u);let c=new i.Pool({connectionString:process.env.DATABASE_URL}),_=process.env.JWT_SECRET||"dev_secret_change_me",E=t=>{if(!t)return null;let e=t instanceof Date?t:new Date(t),n=e.getFullYear(),s=String(e.getMonth()+1).padStart(2,"0"),a=String(e.getDate()).padStart(2,"0");return`${n}-${s}-${a}`};async function l(t,e){let n;if("GET"!==t.method)return e.status(405).end();let s=function(t){let e=(t.headers.cookie||"").split("; ").find(t=>t.startsWith("gidkit_token="));return e?decodeURIComponent(e.split("=")[1]):null}(t);if(!s)return e.status(401).json({message:"Unauthenticated"});try{n=d().verify(s,_)}catch(t){return e.status(401).json({message:"Unauthenticated"})}let{company_id:a}=t.query||{};if(!a)return e.status(400).json({message:"company_id обязателен"});let r=await c.connect();try{let t=await r.query(`
      SELECT role
      FROM user_company_roles
      WHERE user_id = $1 AND company_id = $2
      LIMIT 1
    `,[n.sub,a]);if(0===t.rowCount)return e.status(403).json({message:"Нет доступа к этой компании"});let s=((await r.query(`
      SELECT
        t.id,
        t.name,
        t.status,
        t.start_date,
        t.end_date,
        t.tourists_count,
        COALESCE(tg.total_guests, 0) AS tourists_signed,
        t.created_at,
        g.full_name AS main_guide_name,
        gc.guide_names,
        COALESCE(tc_meta.total_components, 0) AS total_components,
        COALESCE(tc_meta.filled_components, 0) AS filled_components,
        CASE
          WHEN COALESCE(tc_meta.total_components, 0) = 0 THEN 'planned'
          WHEN COALESCE(tc_meta.filled_components, 0) = COALESCE(tc_meta.total_components, 0)
            THEN 'confirmed'
          ELSE 'planned'
        END AS computed_status
      FROM tours t
      LEFT JOIN guides g ON g.id = t.main_guide_id
      LEFT JOIN LATERAL (
        SELECT array_agg(g2.full_name ORDER BY g2.full_name) AS guide_names
        FROM tour_components tc
        JOIN guides g2 ON g2.id = tc.guide_id
        WHERE tc.tour_id = t.id
          AND tc.type = 'guide'
          AND tc.guide_id IS NOT NULL
      ) gc ON TRUE
      LEFT JOIN LATERAL (
        SELECT COUNT(*) AS total_guests
        FROM tour_guests tg
        WHERE tg.tour_id = t.id
      ) tg ON TRUE
      LEFT JOIN LATERAL (
        SELECT
          COUNT(*) AS total_components,
          COUNT(*) FILTER (
            WHERE tc.guide_id IS NOT NULL
               OR tc.hotel_id IS NOT NULL
               OR tc.driver_id IS NOT NULL
               OR tc.custom IS NOT NULL
          ) AS filled_components
        FROM tour_components tc
        WHERE tc.tour_id = t.id
      ) tc_meta ON TRUE
      WHERE t.company_id = $1
      ORDER BY t.start_date DESC NULLS LAST, t.created_at DESC
    `,[a])).rows||[]).map(t=>({...t,start_date:E(t.start_date),end_date:E(t.end_date),tourists_count:t.tourists_count,tourists_signed:Number(t.tourists_signed)||0,guide_names:Array.isArray(t.guide_names)?t.guide_names:[],status:t.computed_status||("confirmed"===t.status||"active"===t.status?"confirmed":"planned")}))||[];return e.status(200).json({tours:s})}catch(t){return e.status(500).json({message:"DB error"})}finally{r.release()}}let m=(0,o.l)(s,"default"),g=(0,o.l)(s,"config"),p=new a.PagesAPIRouteModule({definition:{kind:r.x.PAGES_API,page:"/api/v1/tours/list",pathname:"/api/v1/tours/list",bundlePath:"",filename:""},userland:s})},1631:(t,e)=>{var n;Object.defineProperty(e,"x",{enumerable:!0,get:function(){return n}}),function(t){t.PAGES="PAGES",t.PAGES_API="PAGES_API",t.APP_PAGE="APP_PAGE",t.APP_ROUTE="APP_ROUTE"}(n||(n={}))},9150:(t,e,n)=>{t.exports=n(145)}};var e=require("../../../../webpack-api-runtime.js");e.C(t);var n=e(e.s=794);module.exports=n})();