"use strict";exports.id=7684,exports.ids=[7684],exports.modules={7684:(t,e,i)=>{i.d(e,{checkTourRisks:()=>o});let r=null,a={criticalHoursBefore:24,warningHoursBefore:48,maxDebtPercent:20,minDepositPercent:30,minTouristsFillPercent:80,maxGuideTours7Days:4,maxComplaintHours:48},n=null;async function s(t){return n||(n=new Set((await t.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public'
  `)).rows.map(t=>t.table_name)))}async function o(t,e=null){let a=await (function(){if(!r){let{Pool:t}=i(5900);r=new t({connectionString:process.env.DATABASE_URL})}return r})().connect();try{await a.query("BEGIN");let i=await s(a),r=await u(a,t);if(!r)throw Error(`Tour ${t} not found`);if(r._tables=i,e&&r.company_id!==e)throw Error("Access denied");let o=[];async function n(t,e){try{await a.query(`SAVEPOINT ${t}`);let i=await e();return await a.query(`RELEASE SAVEPOINT ${t}`),i}catch(e){return console.warn(`[Risks] ${t} check failed:`,e.message),await a.query(`ROLLBACK TO SAVEPOINT ${t}`),[]}}return o.push(...await n("prep",()=>_(a,r))),o.push(...await n("conflicts",()=>d(a,r))),o.push(...await n("tourists",()=>c(a,r))),o.push(...await n("finance",()=>l(a,r))),o.push(...await n("quality",()=>p(a,r))),await y(a,t,o),await a.query("COMMIT"),o}catch(t){throw await a.query("ROLLBACK"),t}finally{a.release()}}async function u(t,e){return(await t.query(`
    SELECT 
      t.*,
      EXTRACT(EPOCH FROM (t.start_date - NOW())) / 3600 AS hours_to_departure
    FROM tours t
    WHERE t.id = $1
  `,[e])).rows[0]||null}async function _(t,e){let i=[],r=e.hours_to_departure,n=e._tables||new Set;return!e.main_guide_id&&r<a.criticalHoursBefore&&i.push({risk_type:"missing_guide",severity:r<12?"critical":"warning",title:"Не назначен гид",description:`Тур начинается через ${Math.round(r)} часов, но гид не назначен`,due_at:e.start_date,metadata:{hours_to_departure:Math.round(r),tour_name:e.name}}),n.has("tour_vehicles")&&r<a.criticalHoursBefore&&0===parseInt((await t.query(`
      SELECT COUNT(*) as count FROM tour_vehicles WHERE tour_id = $1
    `,[e.id])).rows[0].count)&&i.push({risk_type:"missing_vehicle",severity:r<12?"critical":"warning",title:"Не назначен транспорт",description:`Выезд через ${Math.round(r)} часов, транспорт не указан`,due_at:e.start_date,metadata:{hours_to_departure:Math.round(r)}}),"overnight"===e.tour_type&&!e.hotel_id&&r<a.warningHoursBefore&&i.push({risk_type:"missing_hotel",severity:"critical",title:"Не указан отель для тура с проживанием",description:"Тур типа overnight, но отель не назначен",due_at:e.start_date,metadata:{tour_type:e.tour_type}}),i}async function d(t,e){let i=[];if(e.main_guide_id){let r=await t.query(`
      SELECT t.id, t.name
      FROM tours t
      WHERE t.main_guide_id = $1
        AND t.id != $2
        AND t.status NOT IN ('cancelled', 'completed')
        AND (
          (t.start_date, t.end_date) OVERLAPS ($3, $4)
        )
      LIMIT 1
    `,[e.main_guide_id,e.id,e.start_date,e.end_date]);if(r.rows.length>0){let t=r.rows[0];i.push({risk_type:"guide_conflict",severity:"critical",title:"Гид занят в другом туре",description:`Гид уже назначен на тур "${t.name}" в это же время`,related_entity_type:"guide",related_entity_id:e.main_guide_id,due_at:e.start_date,metadata:{conflicting_tour_id:t.id,conflicting_tour_name:t.name}})}}if(e.main_guide_id){let r=parseInt((await t.query(`
      SELECT COUNT(*) as count
      FROM tours
      WHERE main_guide_id = $1
        AND start_date >= NOW() - INTERVAL '7 days'
        AND status NOT IN ('cancelled')
    `,[e.main_guide_id])).rows[0].count);r>a.maxGuideTours7Days&&i.push({risk_type:"guide_overload",severity:"attention",title:"Высокая нагрузка на гида",description:`Гид ведёт ${r} туров за последние 7 дней`,related_entity_type:"guide",related_entity_id:e.main_guide_id,metadata:{tours_last_7_days:r,max_recommended:a.maxGuideTours7Days}})}return i}async function c(t,e){let i=[],r=parseInt((await t.query(`
    SELECT COUNT(*) as filled_count
    FROM tour_guests
    WHERE tour_id = $1
  `,[e.id])).rows[0].filled_count),n=e.tourists_count||0;if(n>0){let t=r/n*100;t<a.minTouristsFillPercent&&e.hours_to_departure<a.warningHoursBefore&&i.push({risk_type:"tourists_incomplete",severity:t<50?"warning":"attention",title:"Список туристов неполный",description:`Заполнено ${r} из ${n} ожидаемых туристов (${Math.round(t)}%)`,due_at:e.start_date,metadata:{tourists_filled:r,tourists_expected:n,completion_percent:Math.round(t),min_required_percent:a.minTouristsFillPercent}})}let s=parseInt((await t.query(`
    SELECT COUNT(*) as count
    FROM tour_guests
    WHERE tour_id = $1
      AND (full_name IS NULL OR full_name = '' OR phone IS NULL OR phone = '')
  `,[e.id])).rows[0].count);return s>0&&e.hours_to_departure<a.criticalHoursBefore&&i.push({risk_type:"tourists_missing_data",severity:"warning",title:`У ${s} туристов не хватает данных`,description:"Пустые обязательные поля: ФИО или телефон",due_at:e.start_date,metadata:{total_invalid:s}}),i}async function l(t,e){let i=[],r=(await t.query(`
    SELECT 
      COALESCE(SUM(cost_cents), 0) as total_price_cents,
      COALESCE(SUM(prepayment_cents), 0) as deposit_cents,
      COALESCE(SUM(CASE WHEN is_paid THEN 0 ELSE (cost_cents - prepayment_cents) END), 0) as debt_cents
    FROM tour_guests
    WHERE tour_id = $1
  `,[e.id])).rows[0],n=r.total_price_cents/100,s=r.deposit_cents/100,o=r.debt_cents/100;if(0===n)return i;let u=s/n*100,_=o/n*100;return o>0&&_>a.maxDebtPercent&&e.hours_to_departure<a.criticalHoursBefore&&i.push({risk_type:"high_debt_before_tour",severity:"critical",title:`Большая задолженность за ${Math.round(e.hours_to_departure)} часов до выезда`,description:`Долг ${o.toLocaleString()}₽ (${Math.round(_)}% от стоимости тура)`,due_at:e.start_date,metadata:{due_amount:o,total_price:n,debt_percent:Math.round(_),max_allowed_percent:a.maxDebtPercent,hours_to_departure:Math.round(e.hours_to_departure)}}),u<a.minDepositPercent&&e.hours_to_departure<a.warningHoursBefore&&i.push({risk_type:"low_deposit",severity:"warning",title:"Низкая предоплата",description:`Получено ${Math.round(u)}% вместо минимум ${a.minDepositPercent}%`,due_at:e.start_date,metadata:{deposit_received:s,total_price:n,deposit_percent:Math.round(u),min_required_percent:a.minDepositPercent}}),i}async function p(t,e){let i=[];if((e._tables||new Set).has("complaints")){let r=await t.query(`
      SELECT id, created_at, description
      FROM complaints
      WHERE tour_id = $1
        AND status = 'open'
        AND created_at < NOW() - INTERVAL '${a.maxComplaintHours} hours'
      LIMIT 1
    `,[e.id]);if(r.rows.length>0){let t=r.rows[0],e=Math.round((Date.now()-new Date(t.created_at))/36e5);i.push({risk_type:"unresolved_complaint",severity:"warning",title:`Жалоба не рассмотрена ${e} часов`,description:t.description||"Жалоба от туриста",related_entity_type:"complaint",related_entity_id:t.id,metadata:{hours_open:e,max_allowed_hours:a.maxComplaintHours}})}}return i}async function y(t,e,i){for(let r of(await t.query(`
    UPDATE tour_risks
    SET status = 'resolved', resolved_at = NOW()
    WHERE tour_id = $1 AND status = 'open'
  `,[e]),i))await t.query(`
      INSERT INTO tour_risks (
        tour_id, risk_type, severity, title, description,
        related_entity_type, related_entity_id, due_at, metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `,[e,r.risk_type,r.severity,r.title,r.description||null,r.related_entity_type||null,r.related_entity_id||null,r.due_at||null,JSON.stringify(r.metadata||{})])}}};