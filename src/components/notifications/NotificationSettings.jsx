import { useState } from 'react';
import { Settings, Bell, BellOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function NotificationSettings() {
  const [settings, setSettings] = useState({
    enableNotifications: true,
    enableSound: true,
    enableDesktop: true,
    appointmentNotifications: true,
    messageNotifications: true,
    fileNotifications: true,
    systemNotifications: true,
    notificationFrequency: 'immediate',
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleQuietHoursChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        [key]: value,
      },
    }));
  };

  const saveSettings = () => {
    // Here you would typically save to backend
    console.log('Saving notification settings:', settings);
    // For now, just save to localStorage
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Master Controls */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">General Settings</h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {settings.enableNotifications ? (
                <Bell className="h-4 w-4" />
              ) : (
                <BellOff className="h-4 w-4" />
              )}
              <Label htmlFor="enable-notifications">Enable Notifications</Label>
            </div>
            <Switch
              id="enable-notifications"
              checked={settings.enableNotifications}
              onCheckedChange={(checked) => handleSettingChange('enableNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {settings.enableSound ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
              <Label htmlFor="enable-sound">Sound Notifications</Label>
            </div>
            <Switch
              id="enable-sound"
              checked={settings.enableSound}
              onCheckedChange={(checked) => handleSettingChange('enableSound', checked)}
              disabled={!settings.enableNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="enable-desktop">Desktop Notifications</Label>
            <Switch
              id="enable-desktop"
              checked={settings.enableDesktop}
              onCheckedChange={(checked) => handleSettingChange('enableDesktop', checked)}
              disabled={!settings.enableNotifications}
            />
          </div>
        </div>

        {/* Notification Types */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notification Types</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="appointment-notifications">📅 Appointment Notifications</Label>
              <Switch
                id="appointment-notifications"
                checked={settings.appointmentNotifications}
                onCheckedChange={(checked) => handleSettingChange('appointmentNotifications', checked)}
                disabled={!settings.enableNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="message-notifications">💬 Message Notifications</Label>
              <Switch
                id="message-notifications"
                checked={settings.messageNotifications}
                onCheckedChange={(checked) => handleSettingChange('messageNotifications', checked)}
                disabled={!settings.enableNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="file-notifications">📎 File Share Notifications</Label>
              <Switch
                id="file-notifications"
                checked={settings.fileNotifications}
                onCheckedChange={(checked) => handleSettingChange('fileNotifications', checked)}
                disabled={!settings.enableNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="system-notifications">🔔 System Notifications</Label>
              <Switch
                id="system-notifications"
                checked={settings.systemNotifications}
                onCheckedChange={(checked) => handleSettingChange('systemNotifications', checked)}
                disabled={!settings.enableNotifications}
              />
            </div>
          </div>
        </div>

        {/* Frequency Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Frequency</h3>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="notification-frequency">Notification Frequency</Label>
            <Select
              value={settings.notificationFrequency}
              onValueChange={(value) => handleSettingChange('notificationFrequency', value)}
              disabled={!settings.enableNotifications}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="batched-5min">Every 5 minutes</SelectItem>
                <SelectItem value="batched-15min">Every 15 minutes</SelectItem>
                <SelectItem value="batched-1hour">Every hour</SelectItem>
                <SelectItem value="daily-digest">Daily digest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Quiet Hours</h3>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="quiet-hours">Enable Quiet Hours</Label>
            <Switch
              id="quiet-hours"
              checked={settings.quietHours.enabled}
              onCheckedChange={(checked) => handleQuietHoursChange('enabled', checked)}
              disabled={!settings.enableNotifications}
            />
          </div>

          {settings.quietHours.enabled && (
            <div className="grid grid-cols-2 gap-4 pl-4">
              <div>
                <Label htmlFor="quiet-start">Start Time</Label>
                <input
                  id="quiet-start"
                  type="time"
                  value={settings.quietHours.start}
                  onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <Label htmlFor="quiet-end">End Time</Label>
                <input
                  id="quiet-end"
                  type="time"
                  value={settings.quietHours.end}
                  onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t">
          <Button onClick={saveSettings} className="w-full">
            Save Notification Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}