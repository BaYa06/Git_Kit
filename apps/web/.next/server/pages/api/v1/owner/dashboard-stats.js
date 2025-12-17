"use strict";(()=>{var t={};t.id=7795,t.ids=[7795],t.modules={9344:t=>{t.exports=require("jsonwebtoken")},145:t=>{t.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},5900:t=>{t.exports=require("pg")},6835:(t,e)=>{Object.defineProperty(e,"l",{enumerable:!0,get:function(){return function t(e,a){return a in e?e[a]:"then"in e&&"function"==typeof e.then?e.then(e=>t(e,a)):"function"==typeof e&&"default"===a?e:void 0}}})},6620:(t,e,a)=>{a.r(e),a.d(e,{config:()=>E,default:()=>c,routeModule:()=>g});var r={};a.r(r),a.d(r,{default:()=>l});var s=a(9150),n=a(1631),o=a(6835),u=a(9344),d=a.n(u),i=a(5900);async function l(t,e){if("GET"!==t.method)return e.status(405).json({error:"Method not allowed"});let a=(t.headers.cookie||"").split("; ").find(t=>t.startsWith("gidkit_token="));if(!a)return e.status(401).json({error:"Unauthorized"});try{let r,s;let n=decodeURIComponent(a.split("=")[1]),o=d().verify(n,process.env.JWT_SECRET||"dev_secret_change_me"),{companyId:u,period:l="today"}=t.query;if(!u)return e.status(400).json({error:"companyId is required"});let c=new i.Pool({connectionString:process.env.DATABASE_URL}),E=await c.query("SELECT role FROM user_company_roles WHERE user_id = $1 AND company_id = $2",[o.sub,u]);if(!E.rows[0]||"owner"!==E.rows[0].role)return await c.end(),e.status(403).json({error:"Access denied"});let g=new Date;switch(g.setHours(0,0,0,0),l){case"today":default:r=g,(s=new Date(g)).setHours(23,59,59,999);break;case"7days":(r=new Date(g)).setDate(r.getDate()-6),(s=new Date(g)).setHours(23,59,59,999);break;case"30days":(r=new Date(g)).setDate(r.getDate()-29),(s=new Date(g)).setHours(23,59,59,999);break;case"6months":(r=new Date(g)).setMonth(r.getMonth()-6),(s=new Date(g)).setHours(23,59,59,999);break;case"year":(r=new Date(g)).setFullYear(r.getFullYear()-1),(s=new Date(g)).setHours(23,59,59,999)}let _=t=>{let e=t.getFullYear(),a=String(t.getMonth()+1).padStart(2,"0"),r=String(t.getDate()).padStart(2,"0");return`${e}-${a}-${r}`},N=_(r),p=_(s),D=Math.ceil((s-r)/864e5)+1,A=new Date(r);A.setDate(A.getDate()-D);let f=new Date(r);f.setDate(f.getDate()-1);let S=_(A),O=_(f),[y,$,w,T,C,h,m,R,I,v]=await Promise.all([c.query(`SELECT COUNT(*) as count 
         FROM tours 
         WHERE company_id = $1 
           AND start_date >= $2 
           AND start_date <= $3
           AND status NOT IN ('draft', 'canceled')`,[u,N,p]),c.query(`SELECT COUNT(*) as count 
         FROM tours 
         WHERE company_id = $1 
           AND start_date >= $2 
           AND start_date <= $3
           AND status NOT IN ('draft', 'canceled')`,[u,S,O]),c.query(`SELECT COUNT(tg.id) as count 
         FROM tour_guests tg
         JOIN tours t ON tg.tour_id = t.id
         WHERE t.company_id = $1 
           AND t.start_date >= $2 
           AND t.start_date <= $3
           AND t.status NOT IN ('draft', 'canceled')`,[u,N,p]),c.query(`SELECT COUNT(tg.id) as count 
         FROM tour_guests tg
         JOIN tours t ON tg.tour_id = t.id
         WHERE t.company_id = $1 
           AND t.start_date >= $2 
           AND t.start_date <= $3
           AND t.status NOT IN ('draft', 'canceled')`,[u,S,O]),c.query(`SELECT COALESCE(SUM(
            CASE
              WHEN tg.is_paid = true THEN GREATEST(tg.cost_cents, tg.prepayment_cents)
              ELSE COALESCE(tg.prepayment_cents, 0)
            END
          ), 0) AS total
         FROM tour_guests tg
         JOIN tours t ON tg.tour_id = t.id
         WHERE t.company_id = $1 
           AND t.start_date >= $2 
           AND t.start_date <= $3
           AND t.status NOT IN ('draft', 'canceled')`,[u,N,p]),c.query(`SELECT COALESCE(SUM(
            CASE
              WHEN tg.is_paid = true THEN GREATEST(tg.cost_cents, tg.prepayment_cents)
              ELSE COALESCE(tg.prepayment_cents, 0)
            END
          ), 0) AS total
         FROM tour_guests tg
         JOIN tours t ON tg.tour_id = t.id
         WHERE t.company_id = $1 
           AND t.start_date >= $2 
           AND t.start_date <= $3
           AND t.status NOT IN ('draft', 'canceled')`,[u,S,O]),c.query(`SELECT COALESCE(SUM(GREATEST(tg.cost_cents - COALESCE(tg.prepayment_cents, 0), 0)), 0) as debt
         FROM tour_guests tg
         JOIN tours t ON tg.tour_id = t.id
         WHERE t.company_id = $1 
           AND tg.is_paid = false
           AND t.status NOT IN ('draft', 'canceled')`,[u]),c.query(`SELECT 
           COALESCE(AVG(tf.rating_tour), 0) as avg_rating,
           COUNT(tf.rating_tour) as count
         FROM tour_feedbacks tf
         JOIN tour_feedback_links tfl ON tf.feedback_link_id = tfl.id
         JOIN tours t ON tfl.tour_id = t.id
      WHERE tfl.company_id = $1 
        AND t.start_date >= $2 
        AND t.start_date <= $3
        AND tf.rating_tour IS NOT NULL`,[u,N,p]),c.query(`SELECT 
           COALESCE(AVG(tf.rating_tour), 0) as avg_rating,
           COUNT(tf.rating_tour) as count
         FROM tour_feedbacks tf
         JOIN tour_feedback_links tfl ON tf.feedback_link_id = tfl.id
         JOIN tours t ON tfl.tour_id = t.id
      WHERE tfl.company_id = $1 
        AND t.start_date >= $2 
        AND t.start_date <= $3
        AND tf.rating_tour IS NOT NULL`,[u,S,O]),c.query(`SELECT
         t.start_date::date AS day,
         COALESCE(SUM(
           CASE
             WHEN tg.is_paid = true THEN GREATEST(tg.cost_cents, tg.prepayment_cents)
             ELSE COALESCE(tg.prepayment_cents, 0)
           END
         ), 0) AS total_cents
       FROM tours t
       JOIN tour_guests tg ON tg.tour_id = t.id
       WHERE t.company_id = $1
         AND t.start_date >= $2
         AND t.start_date <= $3
         AND t.status NOT IN ('draft', 'canceled')
       GROUP BY day
       ORDER BY day ASC`,[u,N,p])]);await c.end();let L=parseInt(y.rows[0]?.count||0),M=parseInt($.rows[0]?.count||0),b=parseInt(w.rows[0]?.count||0),H=parseInt(T.rows[0]?.count||0),P=parseInt(C.rows[0]?.total||0)/100,F=parseInt(h.rows[0]?.total||0)/100,k=parseInt(m.rows[0]?.debt||0)/100,x=v.rows||[],U=parseFloat(R.rows[0]?.avg_rating||0),q=parseInt(R.rows[0]?.count||0),W=parseFloat(I.rows[0]?.avg_rating||0),G=t=>t>=1e6?(t/1e6).toFixed(2)+"M":t>=1e3?(t/1e3).toFixed(0)+"K":t.toString(),j=(t,e)=>{if(0===e)return t>0?"+100%":"0%";let a=((t-e)/e*100).toFixed(0);return a>=0?`+${a}%`:`${a}%`},J=(t,e)=>t>e?"up":t<e?"down":"neutral",Y=0===k?{text:"Нет",trend:"up"}:0===P||k/P>.3?{text:"Высокая",trend:"warning"}:k/P>.15?{text:"Средняя",trend:"neutral"}:{text:"Низкая",trend:"up"},B=x.reduce((t,e)=>(t[e.day instanceof Date?_(e.day):String(e.day).slice(0,10)]=(e.total_cents||0)/100,t),{}),V=[];if("6months"===l||"year"===l){let t="year"===l?12:6,e=["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"];for(let a=t-1;a>=0;a--){let t=new Date(g);t.setMonth(t.getMonth()-a);let r=t.getFullYear(),s=t.getMonth(),n=0,o=new Date(r,s+1,0).getDate();for(let t=1;t<=o;t++){let e=`${r}-${String(s+1).padStart(2,"0")}-${String(t).padStart(2,"0")}`;n+=B[e]||0}V.push({date:`${r}-${String(s+1).padStart(2,"0")}`,label:e[s],value:Math.round(n),type:"month"})}}else if("30days"===l){let t=new Date(r);t.setHours(0,0,0,0);let e=new Date(s);e.setHours(0,0,0,0);let a=0,n=0,o=new Date(t);for(;t<=e;){let r=_(t);if(a+=B[r]||0,n++,7===n||t.getTime()===e.getTime()){let e=new Date(t),r=o.getDate(),s=e.getDate(),u=o.toLocaleDateString("ru-RU",{month:"short"}),d=e.toLocaleDateString("ru-RU",{month:"short"});V.push({date:_(o),label:u===d?`${r}-${s} ${u}`:`${r} ${u} - ${s} ${d}`,value:Math.round(a),type:"week"}),a=0,n=0,(o=new Date(t)).setDate(o.getDate()+1)}t.setDate(t.getDate()+1)}}else{let t=new Date(r);t.setHours(0,0,0,0);let e=new Date(s);for(e.setHours(0,0,0,0);t<=e;){let e=_(t);V.push({date:e,value:B[e]||0,type:"day"}),t.setDate(t.getDate()+1)}}let z={tours:{value:L.toString(),change:`${((t,e)=>{let a=t-e;return a>=0?`+${a}`:`${a}`})(L,M)} vs пред.`,trend:J(L,M)},tourists:{value:b.toString(),change:j(b,H),trend:J(b,H)},revenue:{value:G(P),change:j(P,F),trend:J(P,F)},margin:{value:"0%",change:"-",trend:"neutral"},debt:{value:G(k),change:Y.text,trend:Y.trend},nps:{value:U>0?U.toFixed(1):"—",valueSuffix:"/5",rating:U,count:q,change:q>0?W>0?`${U>=W?"+":""}${(U-W).toFixed(1)} vs пред.`:`${q} отзывов`:"Нет отзывов",trend:U>=4?"up":U>=3?"neutral":U>0?"down":"neutral",isRating:!0},period:{start:N,end:p,label:l},revenueSeries:V};return e.status(200).json(z)}catch(t){return console.error("Dashboard stats error:",t),e.status(500).json({error:"Internal server error"})}}let c=(0,o.l)(r,"default"),E=(0,o.l)(r,"config"),g=new s.PagesAPIRouteModule({definition:{kind:n.x.PAGES_API,page:"/api/v1/owner/dashboard-stats",pathname:"/api/v1/owner/dashboard-stats",bundlePath:"",filename:""},userland:r})},1631:(t,e)=>{var a;Object.defineProperty(e,"x",{enumerable:!0,get:function(){return a}}),function(t){t.PAGES="PAGES",t.PAGES_API="PAGES_API",t.APP_PAGE="APP_PAGE",t.APP_ROUTE="APP_ROUTE"}(a||(a={}))},9150:(t,e,a)=>{t.exports=a(145)}};var e=require("../../../../webpack-api-runtime.js");e.C(t);var a=e(e.s=6620);module.exports=a})();