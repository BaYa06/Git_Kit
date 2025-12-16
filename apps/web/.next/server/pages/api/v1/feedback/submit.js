"use strict";(()=>{var e={};e.id=8279,e.ids=[8279],e.modules={145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},5900:e=>{e.exports=require("pg")},6835:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,n){return n in t?t[n]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,n)):"function"==typeof t&&"default"===n?t:void 0}}})},4361:(e,t,n)=>{n.r(t),n.d(t,{config:()=>d,default:()=>l,routeModule:()=>c});var r={};n.r(r),n.d(r,{default:()=>o});var i=n(9150),a=n(1631),u=n(6835);let s=new(n(5900)).Pool({connectionString:process.env.DATABASE_URL});async function o(e,t){if("POST"!==e.method)return t.status(405).end();let{token:n,tourist_name:r,rating_guide:i,rating_transport:a,rating_tour:u,guide_comment:o,driver_comment:l,tour_comment:d}=e.body||{};if(!n)return t.status(400).json({message:"token обязателен"});let c=await s.connect();try{let e=await c.query(`
        SELECT id, is_active, expires_at
        FROM tour_feedback_links
        WHERE token = $1
        LIMIT 1
      `,[n]);if(0===e.rowCount)return t.status(404).json({message:"Ссылка не найдена"});let s=e.rows[0],f=s.expires_at&&new Date(s.expires_at)<new Date;if(!s.is_active||f)return t.status(410).json({message:"Ссылка неактивна"});return await c.query(`
        INSERT INTO tour_feedbacks (
          feedback_link_id,
          tourist_name,
          rating_guide,
          rating_transport,
          rating_tour,
          guide_comment,
          driver_comment,
          tour_comment
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      `,[s.id,r||null,i||null,a||null,u||null,o||null,l||null,d||null]),t.status(200).json({success:!0})}catch(e){return t.status(500).json({message:"DB error"})}finally{c.release()}}let l=(0,u.l)(r,"default"),d=(0,u.l)(r,"config"),c=new i.PagesAPIRouteModule({definition:{kind:a.x.PAGES_API,page:"/api/v1/feedback/submit",pathname:"/api/v1/feedback/submit",bundlePath:"",filename:""},userland:r})},1631:(e,t)=>{var n;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return n}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(n||(n={}))},9150:(e,t,n)=>{e.exports=n(145)}};var t=require("../../../../webpack-api-runtime.js");t.C(e);var n=t(t.s=4361);module.exports=n})();