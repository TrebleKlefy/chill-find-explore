
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MapPin, MessageSquare, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const AdminStats = () => {
  const stats = [
    {
      title: "Total Users",
      value: "2,847",
      change: "+12%",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Active Places",
      value: "1,234",
      change: "+8%",
      icon: MapPin,
      color: "text-green-600"
    },
    {
      title: "Posts Created",
      value: "5,632",
      change: "+23%",
      icon: MessageSquare,
      color: "text-purple-600"
    },
    {
      title: "Engagement Rate",
      value: "84.3%",
      change: "+5%",
      icon: TrendingUp,
      color: "text-orange-600"
    }
  ];

  const chartData = [
    { month: 'Jan', users: 400, posts: 240 },
    { month: 'Feb', users: 300, posts: 139 },
    { month: 'Mar', users: 200, posts: 980 },
    { month: 'Apr', users: 278, posts: 390 },
    { month: 'May', users: 189, posts: 480 },
    { month: 'Jun', users: 239, posts: 380 },
  ];

  const pieData = [
    { name: 'Restaurants', value: 400, color: '#8884d8' },
    { name: 'Cafes', value: 300, color: '#82ca9d' },
    { name: 'Bars', value: 200, color: '#ffc658' },
    { name: 'Others', value: 100, color: '#ff7300' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <IconComponent className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{stat.change}</span> from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Monthly user registration and post creation</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#8884d8" />
                <Bar dataKey="posts" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Place Categories</CardTitle>
            <CardDescription>Distribution of place types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest user actions and system events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { time: '2 minutes ago', action: 'New user registered', user: 'john.doe@email.com' },
              { time: '5 minutes ago', action: 'Place added', user: 'Cozy Coffee Shop' },
              { time: '12 minutes ago', action: 'Post created', user: 'Amazing dinner experience!' },
              { time: '1 hour ago', action: 'User reported content', user: 'Report #1234' },
              { time: '2 hours ago', action: 'System backup completed', user: 'System' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.user}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { AdminStats };
