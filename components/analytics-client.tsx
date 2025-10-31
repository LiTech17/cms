// /components/analytics-client.tsx

'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Users, FileText, Eye } from 'lucide-react';

interface AnalyticsData {
  totalVisits: number;
  pageVisits: Record<string, number>;
  visitsByDate: Array<{ date: string; visits: number }>;
  topPages: Array<{ path: string; visits: number }>;
}

interface AnalyticsClientProps {
  initialData: AnalyticsData;
}

const AnalyticsClient: React.FC<AnalyticsClientProps> = ({ initialData }) => {
  // Prepare data for charts
  const pageVisitsData = Object.entries(initialData.pageVisits).map(([path, visits]) => ({
    name: path === '/' ? 'Home' : path.replace('/', '').charAt(0).toUpperCase() + path.replace('/', '').slice(1),
    visits,
  }));

  const visitsByDateData = initialData.visitsByDate.slice(-30); // Last 30 days

  // If no data, show placeholder
  if (initialData.totalVisits === 0 && visitsByDateData.length === 0) {
    return (
      <div className="py-12">
        <div className="text-center py-16">
          <Eye className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">No Analytics Data Yet</h2>
          <p className="text-muted-foreground">
            Analytics will appear here once visitors start using the site.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 py-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">
          Site Analytics
        </h1>
        <p className="text-muted-foreground">
          Track visitor statistics and page performance
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Visits</p>
              <p className="text-3xl font-bold text-foreground">{initialData.totalVisits.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <FileText className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pages Tracked</p>
              <p className="text-3xl font-bold text-foreground">{Object.keys(initialData.pageVisits).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Daily Visits</p>
              <p className="text-3xl font-bold text-foreground">
                {visitsByDateData.length > 0
                  ? Math.round(visitsByDateData.reduce((sum, d) => sum + d.visits, 0) / visitsByDateData.length)
                  : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Page Visits Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-border">
        <h2 className="text-2xl font-bold text-foreground mb-6">Page Visits</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={pageVisitsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="visits" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Visits Over Time Chart */}
      {visitsByDateData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-border">
          <h2 className="text-2xl font-bold text-foreground mb-6">Visits Over Time (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={visitsByDateData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString();
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="visits" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Pages List */}
      {initialData.topPages && initialData.topPages.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-border">
          <h2 className="text-2xl font-bold text-foreground mb-6">Top Pages</h2>
          <div className="space-y-3">
            {initialData.topPages.map((page, index) => (
              <div
                key={page.path}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {index + 1}
                  </div>
                  <span className="font-medium text-foreground">{page.path}</span>
                </div>
                <span className="text-muted-foreground font-semibold">{page.visits.toLocaleString()} visits</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsClient;

