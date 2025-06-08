
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const AdminAnalytics = () => {
  const dailyActiveUsers = [
    { date: '2024-06-01', users: 1200 },
    { date: '2024-06-02', users: 1350 },
    { date: '2024-06-03', users: 1100 },
    { date: '2024-06-04', users: 1400 },
    { date: '2024-06-05', users: 1600 },
    { date: '2024-06-06', users: 1550 },
    { date: '2024-06-07', users: 1700 },
    { date: '2024-06-08', users: 1650 },
  ];

  const contentEngagement = [
    { category: 'Restaurants', views: 4000, likes: 2400, shares: 1200 },
    { category: 'Cafes', views: 3000, likes: 1398, shares: 800 },
    { category: 'Bars', views: 2000, likes: 9800, shares: 600 },
    { category: 'Parks', views: 2780, likes: 3908, shares: 1000 },
    { category: 'Museums', views: 1890, likes: 4800, shares: 950 },
  ];

  const userGrowth = [
    { month: 'Jan', newUsers: 400, totalUsers: 2400 },
    { month: 'Feb', newUsers: 300, totalUsers: 2700 },
    { month: 'Mar', newUsers: 500, totalUsers: 3200 },
    { month: 'Apr', newUsers: 280, totalUsers: 3480 },
    { month: 'May', newUsers: 450, totalUsers: 3930 },
    { month: 'Jun', newUsers: 390, totalUsers: 4320 },
  ];

  return (
    <div className="space-y-6">
      {/* Daily Active Users */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Active Users</CardTitle>
          <CardDescription>User activity over the past week</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyActiveUsers}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="users" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Content Engagement */}
      <Card>
        <CardHeader>
          <CardTitle>Content Engagement by Category</CardTitle>
          <CardDescription>Views, likes, and shares across different place categories</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={contentEngagement}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="views" fill="#8884d8" />
              <Bar dataKey="likes" fill="#82ca9d" />
              <Bar dataKey="shares" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* User Growth */}
      <Card>
        <CardHeader>
          <CardTitle>User Growth Trend</CardTitle>
          <CardDescription>New user registrations and total user count over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="newUsers" stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey="totalUsers" stroke="#82ca9d" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Avg. Session Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8m 32s</div>
            <p className="text-sm text-muted-foreground mt-2">+12% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bounce Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24.5%</div>
            <p className="text-sm text-muted-foreground mt-2">-3% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Page Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">127,543</div>
            <p className="text-sm text-muted-foreground mt-2">+8% from last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Top Locations by User Activity</CardTitle>
          <CardDescription>Most active geographic regions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { location: 'New York, NY', users: 1250, percentage: 28 },
              { location: 'Los Angeles, CA', users: 980, percentage: 22 },
              { location: 'Chicago, IL', users: 756, percentage: 17 },
              { location: 'Houston, TX', users: 643, percentage: 14 },
              { location: 'Phoenix, AZ', users: 532, percentage: 12 },
            ].map((location, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium">{location.location}</div>
                  <div className="text-sm text-muted-foreground">{location.users} users</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${location.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8">{location.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { AdminAnalytics };
