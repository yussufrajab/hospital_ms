'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

interface RecentActivity {
  id: string
  title: string
  description: string
  time: string
  type?: 'info' | 'success' | 'warning' | 'error'
}

interface RecentActivityProps {
  title: string
  activities: RecentActivity[]
  className?: string
}

export function RecentActivity({
  title,
  activities,
  className,
}: RecentActivityProps) {
  const typeColors = {
    info: 'bg-blue-100 text-blue-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
  }

  return (
    <Card className={cn('col-span-2', className)}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 rounded-lg border p-3"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{activity.title}</p>
                    {activity.type && (
                      <Badge
                        variant="secondary"
                        className={cn('text-xs', typeColors[activity.type])}
                      >
                        {activity.type}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
