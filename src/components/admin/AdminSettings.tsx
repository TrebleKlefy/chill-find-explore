
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Save, Shield, Mail, Database, Globe, Bell } from 'lucide-react';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: 'Place Discovery',
    siteDescription: 'Discover amazing places around you',
    allowUserRegistration: true,
    requireEmailVerification: true,
    moderateContent: true,
    enableNotifications: true,
    maintenanceMode: false,
    maxFileSize: '10',
    allowedFileTypes: 'jpg,png,gif',
    smtpHost: 'smtp.example.com',
    smtpPort: '587',
    smtpUsername: '',
    smtpPassword: '',
    backupFrequency: 'daily',
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    console.log('Saving settings:', settings);
    // Here you would typically send the settings to your backend
  };

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            General Settings
          </CardTitle>
          <CardDescription>Basic site configuration and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => handleSettingChange('siteName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Input
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow User Registration</Label>
                <p className="text-sm text-muted-foreground">Enable new users to create accounts</p>
              </div>
              <Switch
                checked={settings.allowUserRegistration}
                onCheckedChange={(checked) => handleSettingChange('allowUserRegistration', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Email Verification</Label>
                <p className="text-sm text-muted-foreground">Users must verify their email before accessing the site</p>
              </div>
              <Switch
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) => handleSettingChange('requireEmailVerification', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Temporarily disable the site for maintenance</p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Moderation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Content Moderation
          </CardTitle>
          <CardDescription>Configure content review and file upload settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Moderate Content</Label>
              <p className="text-sm text-muted-foreground">Review posts before they are published</p>
            </div>
            <Switch
              checked={settings.moderateContent}
              onCheckedChange={(checked) => handleSettingChange('moderateContent', checked)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
              <Input
                id="maxFileSize"
                value={settings.maxFileSize}
                onChange={(e) => handleSettingChange('maxFileSize', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
              <Input
                id="allowedFileTypes"
                value={settings.allowedFileTypes}
                onChange={(e) => handleSettingChange('allowedFileTypes', e.target.value)}
                placeholder="jpg,png,gif"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Settings
          </CardTitle>
          <CardDescription>Configure SMTP settings for email notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-0.5">
              <Label>Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">Send email notifications to users</p>
            </div>
            <Switch
              checked={settings.enableNotifications}
              onCheckedChange={(checked) => handleSettingChange('enableNotifications', checked)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtpHost">SMTP Host</Label>
              <Input
                id="smtpHost"
                value={settings.smtpHost}
                onChange={(e) => handleSettingChange('smtpHost', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPort">SMTP Port</Label>
              <Input
                id="smtpPort"
                value={settings.smtpPort}
                onChange={(e) => handleSettingChange('smtpPort', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpUsername">SMTP Username</Label>
              <Input
                id="smtpUsername"
                value={settings.smtpUsername}
                onChange={(e) => handleSettingChange('smtpUsername', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPassword">SMTP Password</Label>
              <Input
                id="smtpPassword"
                type="password"
                value={settings.smtpPassword}
                onChange={(e) => handleSettingChange('smtpPassword', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Settings
          </CardTitle>
          <CardDescription>Database backup and system maintenance options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="backupFrequency">Backup Frequency</Label>
            <select 
              className="w-full p-2 border border-input rounded-md bg-background"
              value={settings.backupFrequency}
              onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline">
              <Database className="mr-2 h-4 w-4" />
              Backup Now
            </Button>
            <Button variant="outline">
              <Database className="mr-2 h-4 w-4" />
              Restore Backup
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="min-w-32">
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export { AdminSettings };
