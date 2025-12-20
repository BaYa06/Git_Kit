"use strict";(()=>{var e={};e.id=2266,e.ids=[2266],e.modules={9344:e=>{e.exports=require("jsonwebtoken")},145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},5900:e=>{e.exports=require("pg")},6835:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,n){return n in t?t[n]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,n)):"function"==typeof t&&"default"===n?t:void 0}}})},5973:(e,t,n)=>{n.r(t),n.d(t,{config:()=>_,default:()=>p,routeModule:()=>f});var a={};n.r(a),n.d(a,{default:()=>m});var r=n(9150),i=n(1631),s=n(6835),o=n(5900),u=n(9344),d=n.n(u);let l=new o.Pool({connectionString:process.env.DATABASE_URL}),c=process.env.JWT_SECRET||"dev_secret_change_me";async function m(e,t){let n;if("GET"!==e.method)return t.status(405).end();let a=function(e){let t=(e.headers.cookie||"").split("; ").find(e=>e.startsWith("gidkit_token="));return t?decodeURIComponent(t.split("=")[1]):null}(e);if(!a)return t.status(401).json({message:"Unauthenticated"});try{n=d().verify(a,c)}catch(e){return t.status(401).json({message:"Unauthenticated"})}let{company_id:r}=e.query;if(!r)return t.status(400).json({message:"company_id обязателен"});let i=await l.connect();try{let e=await i.query(`
      SELECT 1
      FROM user_company_roles
      WHERE user_id = $1
        AND company_id = $2
        AND role IN ('owner','admin')
      LIMIT 1
    `,[n.sub,r]);if(0===e.rowCount)return t.status(403).json({message:"Нет прав смотреть шаблоны этой компании"});let a=(await i.query(`
      SELECT id, company_id, name, status, start_date, end_date, created_at
      FROM tour_templates
      WHERE company_id = $1
      ORDER BY created_at DESC
    `,[r])).rows,s={};if(a.length>0){let e=a.map(e=>e.id);for(let t of(await i.query(`
        SELECT template_id, COUNT(*)::int AS count
        FROM tour_template_components
        WHERE template_id = ANY($1::uuid[])
        GROUP BY template_id
      `,[e])).rows)s[t.template_id]=t.count}let o=a.map(e=>{let t=0,n=0;if(e.start_date&&e.end_date){let a=new Date(e.start_date),r=new Date(e.end_date).getTime()-a.getTime();if(!Number.isNaN(r)&&r>=0){let e=Math.round(r/864e5);t=e+1,n=e}}let a=s[e.id]||0;return{id:e.id,company_id:e.company_id,name:e.name,status:e.status,start_date:e.start_date,end_date:e.end_date,days:t,nights:n,segments:a}});return t.status(200).json({templates:o})}catch(e){return t.status(500).json({message:"DB error",code:e.code||null,detail:e.detail||null,table:e.table||null,column:e.column||null})}finally{i.release()}}let p=(0,s.l)(a,"default"),_=(0,s.l)(a,"config"),f=new r.PagesAPIRouteModule({definition:{kind:i.x.PAGES_API,page:"/api/v1/company/templates/list",pathname:"/api/v1/company/templates/list",bundlePath:"",filename:""},userland:a})},1631:(e,t)=>{var n;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return n}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(n||(n={}))},9150:(e,t,n)=>{e.exports=n(145)}};var t=require("../../../../../webpack-api-runtime.js");t.C(e);var n=t(t.s=5973);module.exports=n})();