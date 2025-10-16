import React from 'react'
import { useQuery, gql } from '@apollo/client'
import { LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts'

const TOTALS_BY_MONTH = gql`query TotalsByMonth($month:String!){ totalsByMonth(month:$month) }`
const TOTALS_BY_CATEGORY = gql`query TotalsByCategory($month:String){ totalsByCategory(month:$month){ category total } }`
const BUDGETS_PROGRESS = gql`query BudgetsProgress($month:String){ budgetsProgress(month:$month){ id month category limit spent percentUsed } }`

const COLORS = ['#8884d8','#82ca9d','#ffc658','#ff7f50','#87cefa','#da70d6']

export default function Dashboard(){
  const { data: dTotals, loading: l1 } = useQuery(TOTALS_BY_MONTH, { variables: { month: new Date().toISOString().slice(0,7) } })
  const { data: dCat, loading: l2 } = useQuery(TOTALS_BY_CATEGORY, { variables: { month: new Date().toISOString().slice(0,7) } })
  const { data: dBud, loading: l3 } = useQuery(BUDGETS_PROGRESS, { variables: { month: new Date().toISOString().slice(0,7) } })

  const totals = dTotals ? [{ name: 'This Month', value: dTotals.totalsByMonth }] : []
  const cat = dCat ? dCat.totalsByCategory.map(c=>({ name:c.category, value:c.total })) : []
  const budgets = dBud ? dBud.budgetsProgress : []

  return (
    <div>
      <h2>Dashboard</h2>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
        <div style={{background:'#fff',padding:12,borderRadius:8}}>
          <h3>Monthly Net</h3>
          {l1? <p>Loading...</p> : <p>${totals[0]?.value ?? 0}</p>}
        </div>
        <div style={{background:'#fff',padding:12,borderRadius:8}}>
          <h3>By Category</h3>
          {l2? <p>Loading...</p> : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={cat} dataKey="value" nameKey="name" outerRadius={80} label>
                  {cat.map((entry, i) => <Cell key={`c-${i}`} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <h3 style={{marginTop:20}}>Budgets</h3>
      <div style={{display:'grid',gap:12}}>
        {l3 && <p>Loading budgets...</p>}
        {budgets.map(b=> (
          <div key={b.id} style={{background:'#fff',padding:12,borderRadius:8}}>
            <div style={{display:'flex',justifyContent:'space-between'}}>
              <div>{b.category} — {b.month}</div>
              <div>${b.spent} / ${b.limit} ({Math.round(b.percentUsed*100)}%)</div>
            </div>
            <div style={{height:10,background:'#eee',borderRadius:6,marginTop:8}}>
              <div style={{width:`${Math.round(b.percentUsed*100)}%`,height:10,background:b.percentUsed>1?'#ff6b6b':'#60a5fa',borderRadius:6}} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
