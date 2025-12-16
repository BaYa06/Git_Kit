"use strict";(()=>{var e={};e.id=3300,e.ids=[3300],e.modules={9344:e=>{e.exports=require("jsonwebtoken")},145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},5900:e=>{e.exports=require("pg")},6835:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,n){return n in t?t[n]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,n)):"function"==typeof t&&"default"===n?t:void 0}}})},8912:(e,t,n)=>{n.r(t),n.d(t,{config:()=>f,default:()=>y,routeModule:()=>g});var r={};n.r(r),n.d(r,{default:()=>_});var a=n(9150),i=n(1631),u=n(6835),s=n(5900),o=n(9344),d=n.n(o);let l=new s.Pool({connectionString:process.env.DATABASE_URL}),c=process.env.JWT_SECRET||"dev_secret_change_me",m=e=>{if(!e)return null;let t=e instanceof Date?e:new Date(e),n=t.getFullYear(),r=String(t.getMonth()+1).padStart(2,"0"),a=String(t.getDate()).padStart(2,"0");return`${n}-${r}-${a}`},p=e=>{if(!e||!e.type)return!1;let t=!!e.selectedId,n="custom"===e.mode&&e.custom&&Object.keys(e.custom||{}).length>0;return t||n},E=(e=[])=>{let t=(e||[]).filter(e=>e&&e.type);return 0===t.length?"planned":t.every(p)?"confirmed":"planned"};async function _(e,t){let n;if("POST"!==e.method)return t.status(405).end();let r=function(e){let t=(e.headers.cookie||"").split("; ").find(e=>e.startsWith("gidkit_token="));return t?decodeURIComponent(t.split("=")[1]):null}(e);if(!r)return t.status(401).json({message:"Unauthenticated"});try{n=d().verify(r,c)}catch(e){return t.status(401).json({message:"Unauthenticated"})}let{tour_id:a,name:i,start_date:u,end_date:s,tourists_count:o,components:p}=e.body||{};if(!a||!i)return t.status(400).json({message:"tour_id и name обязательны"});let _=await l.connect();try{await _.query("BEGIN");let e=await _.query("SELECT id, company_id, main_guide_id FROM tours WHERE id = $1 LIMIT 1",[a]);if(0===e.rowCount)return await _.query("ROLLBACK"),t.status(404).json({message:"Тур не найден"});let r=e.rows[0].company_id;e.rows[0].main_guide_id;let d=await _.query(`
      SELECT 1
      FROM user_company_roles
      WHERE user_id = $1
        AND company_id = $2
        AND role IN ('owner','admin')
      LIMIT 1
    `,[n.sub,r]);if(0===d.rowCount){let e=(await _.query("SELECT email, phone FROM users WHERE id = $1 LIMIT 1",[n.sub])).rows[0]||{},i=await _.query(`
        SELECT id
        FROM guides
        WHERE company_id = $1
          AND (
            (email IS NOT NULL AND email = $2)
            OR (phone IS NOT NULL AND phone = $3)
          )
        LIMIT 1
        `,[r,e.email||null,e.phone||null]),u=i.rows[0]?.id||null;if(!u)return await _.query("ROLLBACK"),t.status(403).json({message:"Нет прав редактировать тур"});let s=await _.query(`
        SELECT 1
        FROM tours t
        WHERE t.id = $1
          AND t.company_id = $2
          AND (
            t.main_guide_id = $3
            OR EXISTS (
              SELECT 1 FROM tour_components tc
              WHERE tc.tour_id = t.id
                AND tc.type = 'guide'
                AND tc.guide_id = $3
            )
          )
        LIMIT 1
        `,[a,r,u]);if(0===s.rowCount)return await _.query("ROLLBACK"),t.status(403).json({message:"Нет прав редактировать тур"})}let l=Number.isFinite(parseInt(o,10))?parseInt(o,10):null,c=E(p),y=await _.query(`
      UPDATE tours
      SET
        name = $2,
        start_date = $3,
        end_date = $4,
        tourists_count = $5,
        status = $6
      WHERE id = $1
      RETURNING id, company_id, template_id, name, status, start_date, end_date, tourists_count, created_at
    `,[a,i.trim(),u||null,s||null,l,c]);if(await _.query("DELETE FROM tour_components WHERE tour_id = $1",[a]),Array.isArray(p)&&p.length>0)for(let e=0;e<p.length;e++){let n=p[e];if(!n||!n.type)continue;let i="custom"===n.mode?"custom":"base",u="guide"===n.type&&n.selectedId?n.selectedId:null,s="hotel"===n.type&&n.selectedId?n.selectedId:null,o="transport"===n.type&&n.selectedId?n.selectedId:null,d="custom"===i?n.custom||{}:null;if("guide"===n.type&&u){let e=await _.query("SELECT 1 FROM guides WHERE id = $1 AND company_id = $2 LIMIT 1",[u,r]);if(0===e.rowCount)return await _.query("ROLLBACK"),t.status(400).json({message:"Гид не найден в базе компании",detail:`guide_id=${u}`})}await _.query(`
          INSERT INTO tour_components (tour_id, type, mode, comment, guide_id, hotel_id, driver_id, custom)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,[a,n.type,i,n.comment||"",u,s,o,d?JSON.stringify(d):null])}await _.query("COMMIT");let f=y.rows[0];return t.status(200).json({tour:{...f,start_date:m(f.start_date),end_date:m(f.end_date)}})}catch(e){return await _.query("ROLLBACK"),t.status(500).json({message:"DB error",code:e.code||null,detail:e.detail||null,table:e.table||null,column:e.column||null})}finally{_.release()}}let y=(0,u.l)(r,"default"),f=(0,u.l)(r,"config"),g=new a.PagesAPIRouteModule({definition:{kind:i.x.PAGES_API,page:"/api/v1/tours/update",pathname:"/api/v1/tours/update",bundlePath:"",filename:""},userland:r})},1631:(e,t)=>{var n;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return n}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(n||(n={}))},9150:(e,t,n)=>{e.exports=n(145)}};var t=require("../../../../webpack-api-runtime.js");t.C(e);var n=t(t.s=8912);module.exports=n})();