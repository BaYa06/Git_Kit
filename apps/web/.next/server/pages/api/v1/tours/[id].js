"use strict";(()=>{var t={};t.id=726,t.ids=[726],t.modules={9344:t=>{t.exports=require("jsonwebtoken")},145:t=>{t.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},5900:t=>{t.exports=require("pg")},6835:(t,e)=>{Object.defineProperty(e,"l",{enumerable:!0,get:function(){return function t(e,r){return r in e?e[r]:"then"in e&&"function"==typeof e.then?e.then(e=>t(e,r)):"function"==typeof e&&"default"===r?e:void 0}}})},4359:(t,e,r)=>{r.r(e),r.d(e,{config:()=>f,default:()=>g,routeModule:()=>y});var n={};r.r(n),r.d(n,{default:()=>_});var s=r(9150),o=r(1631),a=r(6835),i=r(5900),u=r(9344),d=r.n(u);let c=new i.Pool({connectionString:process.env.DATABASE_URL}),l=process.env.JWT_SECRET||"dev_secret_change_me",m=t=>{if(!t)return null;let e=t instanceof Date?t:new Date(t),r=e.getFullYear(),n=String(e.getMonth()+1).padStart(2,"0"),s=String(e.getDate()).padStart(2,"0");return`${r}-${n}-${s}`};async function _(t,e){let r;let n=function(t){let e=(t.headers.cookie||"").split("; ").find(t=>t.startsWith("gidkit_token="));return e?decodeURIComponent(e.split("=")[1]):null}(t);if(!n)return e.status(401).json({message:"Unauthenticated"});try{r=d().verify(n,l)}catch(t){return e.status(401).json({message:"Unauthenticated"})}let s=t.query.id;return s?"GET"===t.method?E(t,e,r,s):"PUT"===t.method?handlePut(t,e,r,s):"DELETE"===t.method?p(t,e,r,s):e.status(405).end():e.status(400).json({message:"id обязателен"})}async function E(t,e,r,n){let s=await c.connect();try{let t=await s.query(`
      SELECT
        t.id,
        t.company_id,
        t.template_id,
        t.name,
        t.status,
        t.start_date,
        t.end_date,
        t.tourists_count,
        COALESCE(tg.total_guests, 0) AS tourists_signed,
        t.coordinator_id,
        t.main_guide_id,
        t.created_at
      FROM tours t
      LEFT JOIN LATERAL (
        SELECT COUNT(*) AS total_guests
        FROM tour_guests tg
        WHERE tg.tour_id = t.id
      ) tg ON TRUE
      WHERE t.id = $1
      LIMIT 1
    `,[n]);if(0===t.rowCount)return e.status(404).json({message:"Тур не найден"});let o=t.rows[0],a=await s.query(`
      SELECT role
      FROM user_company_roles
      WHERE user_id = $1 AND company_id = $2
      LIMIT 1
    `,[r.sub,o.company_id]);if(0===a.rowCount)return e.status(403).json({message:"Нет доступа к этому туру"});let i=await s.query(`
      SELECT id, type, mode, comment, guide_id, hotel_id, driver_id, custom
      FROM tour_components
      WHERE tour_id = $1
      ORDER BY created_at ASC, id ASC
    `,[n]),u={...o,start_date:m(o.start_date),end_date:m(o.end_date),components:(i.rows||[]).map(t=>({id:t.id,type:t.type,mode:t.mode,comment:t.comment||"",selectedId:"guide"===t.type?t.guide_id||"":"hotel"===t.type?t.hotel_id||"":t.driver_id||"",custom:t.custom||{}})),tourists_signed:Number(o.tourists_signed)||0};return e.status(200).json({tour:u})}catch(t){return e.status(500).json({message:"DB error"})}finally{s.release()}}async function p(t,e,r,n){let s=await c.connect();try{let t=await s.query("SELECT company_id FROM tours WHERE id = $1 LIMIT 1",[n]);if(0===t.rowCount)return e.status(404).json({message:"Тур не найден"});let o=t.rows[0],a=await s.query("SELECT role FROM user_company_roles WHERE user_id = $1 AND company_id = $2 LIMIT 1",[r.sub,o.company_id]);if(0===a.rowCount)return e.status(403).json({message:"Нет доступа к этому туру"});let i=a.rows[0].role;if("admin"!==i&&"owner"!==i)return e.status(403).json({message:"Недостаточно прав для удаления тура"});return await s.query("DELETE FROM tours WHERE id = $1",[n]),e.status(200).json({message:"Тур успешно удалён"})}catch(t){return e.status(500).json({message:"DB error"})}finally{s.release()}}let g=(0,a.l)(n,"default"),f=(0,a.l)(n,"config"),y=new s.PagesAPIRouteModule({definition:{kind:o.x.PAGES_API,page:"/api/v1/tours/[id]",pathname:"/api/v1/tours/[id]",bundlePath:"",filename:""},userland:n})},1631:(t,e)=>{var r;Object.defineProperty(e,"x",{enumerable:!0,get:function(){return r}}),function(t){t.PAGES="PAGES",t.PAGES_API="PAGES_API",t.APP_PAGE="APP_PAGE",t.APP_ROUTE="APP_ROUTE"}(r||(r={}))},9150:(t,e,r)=>{t.exports=r(145)}};var e=require("../../../../webpack-api-runtime.js");e.C(t);var r=e(e.s=4359);module.exports=r})();