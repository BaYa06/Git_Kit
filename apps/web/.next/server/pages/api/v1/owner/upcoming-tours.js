"use strict";(()=>{var e={};e.id=5359,e.ids=[5359],e.modules={9344:e=>{e.exports=require("jsonwebtoken")},145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},5900:e=>{e.exports=require("pg")},6835:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,r){return r in t?t[r]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,r)):"function"==typeof t&&"default"===r?t:void 0}}})},4652:(e,t,r)=>{r.r(t),r.d(t,{config:()=>p,default:()=>l,routeModule:()=>c});var s={};r.r(s),r.d(s,{default:()=>_});var o=r(9150),n=r(1631),i=r(6835),a=r(9344),u=r.n(a),d=r(5900);async function _(e,t){if("GET"!==e.method)return t.status(405).json({error:"Method not allowed"});let r=(e.headers.cookie||"").split("; ").find(e=>e.startsWith("gidkit_token="));if(!r)return t.status(401).json({error:"Unauthorized"});try{let s=decodeURIComponent(r.split("=")[1]),o=u().verify(s,process.env.JWT_SECRET||"dev_secret_change_me"),{companyId:n}=e.query||{};if(!n)return t.status(400).json({error:"companyId is required"});let i=new d.Pool({connectionString:process.env.DATABASE_URL}),a=await i.query("SELECT role FROM user_company_roles WHERE user_id = $1 AND company_id = $2 LIMIT 1",[o.sub,n]);if(!a.rows[0]||"owner"!==a.rows[0].role)return await i.end(),t.status(403).json({error:"Access denied"});let _=new Date;_.setHours(0,0,0,0);let l=new Date(_);l.setDate(l.getDate()+7);let p=_.toISOString().split("T")[0],c=l.toISOString().split("T")[0],A=await i.query(`
      SELECT
        t.id,
        t.name,
        t.start_date,
        TO_CHAR(t.start_date, 'YYYY-MM-DD') AS start_date_str,
        t.status,
        t.tourists_count,
        COALESCE(tc.total_components, 0) AS total_components,
        COALESCE(tc.filled_components, 0) AS filled_components,
        COALESCE(tc.require_guide, false) AS require_guide,
        COALESCE(tc.require_hotel, false) AS require_hotel,
        COALESCE(tc.require_driver, false) AS require_driver,
        COALESCE(tc.has_guide, false) AS has_guide,
        COALESCE(tc.has_hotel, false) AS has_hotel,
        COALESCE(tc.has_driver, false) AS has_driver,
        COALESCE(g.stats_signed, 0) AS signed_count,
        COALESCE(g.stats_paid, 0) AS paid_count,
        COALESCE(g.total_cost, 0) AS total_cost,
        COALESCE(g.total_prepay, 0) AS total_prepay
      FROM tours t
      LEFT JOIN LATERAL (
        SELECT
          COUNT(*) AS total_components,
          COUNT(*) FILTER (
            WHERE (guide_id IS NOT NULL OR hotel_id IS NOT NULL OR driver_id IS NOT NULL OR custom IS NOT NULL)
          ) AS filled_components,
          BOOL_OR(type = 'guide') AS require_guide,
          BOOL_OR(type = 'hotel') AS require_hotel,
          BOOL_OR(type = 'transport') AS require_driver,
          BOOL_OR(type = 'guide' AND (guide_id IS NOT NULL OR custom IS NOT NULL)) AS has_guide,
          BOOL_OR(type = 'hotel' AND (hotel_id IS NOT NULL OR custom IS NOT NULL)) AS has_hotel,
          BOOL_OR(type = 'transport' AND (driver_id IS NOT NULL OR custom IS NOT NULL)) AS has_driver
        FROM tour_components
        WHERE tour_id = t.id
      ) tc ON TRUE
      LEFT JOIN LATERAL (
        SELECT
          COUNT(*) AS stats_signed,
          COUNT(*) FILTER (WHERE is_paid = true) AS stats_paid,
          COALESCE(SUM(cost_cents), 0) AS total_cost,
          COALESCE(SUM(prepayment_cents), 0) AS total_prepay
        FROM tour_guests
        WHERE tour_id = t.id
      ) g ON TRUE
      WHERE t.company_id = $1
        AND t.start_date >= $2
        AND t.start_date <= $3
        AND t.status NOT IN ('canceled')
      ORDER BY t.start_date ASC
      LIMIT 50
      `,[n,p,c]);await i.end();let E=A.rows||[],O=_.getTime(),S=new Date(_);S.setDate(S.getDate()+1);let L=S.getTime(),g=E.map(e=>{let t=e.start_date_str||null,r=Math.max(e.total_components||0,1),s=e.filled_components||0,o=Math.round(s/r*100),n=[];e.require_guide&&!e.has_guide&&n.push("гид"),e.require_driver&&!e.has_driver&&n.push("транспорт"),e.require_hotel&&!e.has_hotel&&n.push("отель");let i=Number.isFinite(e.tourists_count)?e.tourists_count:null,a=Number(e.signed_count)||0,u=Number(e.total_cost)||0,d=Number(e.total_prepay)||0,_=e.paid_count>=a&&a>0,l=e.start_date?new Date(e.start_date):null;l?.setHours(0,0,0,0);let p=l?.getTime()||0,c="planned",A="Планово";return(p===O||p===L)&&n.length>0?(c="risk",A="Риск"):"active"===e.status||"confirmed"===e.status?(c="in_progress",A="В пути"):o>=100&&0===n.length?(c="ideal",A="Готов"):(c="planned",A="Планово"),{id:e.id,startDate:t,time:"—",destination:e.name||"Тур",pax:i?`${a}/${i}`:`${a}`,readiness:o,readinessWarning:"",missingComponents:n,payment:0===u?"unpaid":_||d>=u?"paid":d>0?"partial":"unpaid",status:c,statusLabel:A}});return t.status(200).json({trips:g})}catch(e){return console.error("Owner upcoming error:",e),t.status(500).json({error:"Internal server error"})}}let l=(0,i.l)(s,"default"),p=(0,i.l)(s,"config"),c=new o.PagesAPIRouteModule({definition:{kind:n.x.PAGES_API,page:"/api/v1/owner/upcoming-tours",pathname:"/api/v1/owner/upcoming-tours",bundlePath:"",filename:""},userland:s})},1631:(e,t)=>{var r;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return r}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(r||(r={}))},9150:(e,t,r)=>{e.exports=r(145)}};var t=require("../../../../webpack-api-runtime.js");t.C(e);var r=t(t.s=4652);module.exports=r})();