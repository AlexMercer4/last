import { Card, CardContent } from '@/components/ui/card';

export default function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  borderColor, 
  iconBgColor 
}) {
  return (
    <Card className={`border-l-4 ${borderColor} hover:shadow-lg transition-shadow duration-200`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              {title}
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {value}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {subtitle}
            </p>
          </div>
          <div className={`${iconBgColor} p-3 rounded-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}