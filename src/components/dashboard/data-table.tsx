'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Column<T> {
  key: keyof T | string
  header: string
  render?: (item: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  title: string
  columns: Column<T>[]
  data: T[]
  onView?: (item: T) => void
  onEdit?: (item: T) => void
  className?: string
}

export function DataTable<T extends { id: string }>({
  title,
  columns,
  data,
  onView,
  onEdit,
  className,
}: DataTableProps<T>) {
  return (
    <Card className={cn('col-span-2', className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{title}</CardTitle>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={String(column.key)} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
              {(onView || onEdit) && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                {columns.map((column) => (
                  <TableCell key={String(column.key)} className={column.className}>
                    {column.render
                      ? column.render(item)
                      : String((item as Record<string, unknown>)[column.key as string] ?? '')}
                  </TableCell>
                ))}
                {(onView || onEdit) && (
                  <TableCell>
                    <div className="flex gap-2">
                      {onView && (
                        <Button variant="ghost" size="sm" onClick={() => onView(item)}>
                          View
                        </Button>
                      )}
                      {onEdit && (
                        <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
                          Edit
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
