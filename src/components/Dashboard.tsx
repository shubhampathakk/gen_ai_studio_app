import React from 'react';
import { motion } from 'framer-motion';
import { GraphData } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Database, FileCode, CheckCircle, AlertCircle } from 'lucide-react';

interface DashboardProps {
  data: GraphData | null;
}

export function Dashboard({ data }: DashboardProps) {
  if (!data) return null;

  const totalNodes = data.nodes.length;
  const totalEdges = data.edges.length;
  const deployedNodes = data.nodes.filter(n => n.deployment_status === 'DEPLOYED').length;
  const pendingNodes = totalNodes - deployedNodes;

  const typeDistribution = data.nodes.reduce((acc, node) => {
    acc[node.type] = (acc[node.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(typeDistribution).map(([name, value]) => ({ name, value }));
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  const stats = [
    { label: 'Total Objects', value: totalNodes, icon: Database, color: 'bg-blue-500' },
    { label: 'Connections', value: totalEdges, icon: FileCode, color: 'bg-purple-500' },
    { label: 'Migrated', value: deployedNodes, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Pending', value: pendingNodes, icon: AlertCircle, color: 'bg-amber-500' },
  ];

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4"
          >
            <div className={`p-3 rounded-lg ${stat.color} text-white`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 h-96">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col"
        >
          <h3 className="text-lg font-semibold mb-4 text-slate-700">Object Type Distribution</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4 flex-wrap">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span>{entry.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col"
        >
          <h3 className="text-lg font-semibold mb-4 text-slate-700">Migration Progress</h3>
          <div className="flex-1 flex items-center justify-center">
             <div className="text-center">
                <div className="text-5xl font-bold text-slate-800 mb-2">
                  {Math.round((deployedNodes / totalNodes) * 100)}%
                </div>
                <p className="text-slate-500">Completion Rate</p>
                <div className="w-64 h-4 bg-slate-100 rounded-full mt-4 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(deployedNodes / totalNodes) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-green-500"
                  />
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
