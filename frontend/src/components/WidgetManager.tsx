"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import {
  X,
  Plus,
  Star,
  User,
  TrendingUp,
  Activity,
  Rocket,
  BarChart3,
  Calendar,
  PieChart,
  LineChart,
} from "lucide-react"
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
  LineChart as ReLineChart,
  Line,
} from "recharts"

export type WidgetSize = "small" | "medium" | "large" | "extra-large"

export interface Widget {
  id: string
  type: string
  title: string
  icon: React.ReactNode
  component: React.ReactNode
  isActive: boolean
  position: number
  size: WidgetSize
  minSize?: WidgetSize
}

interface WidgetManagerProps {
  widgets: Widget[]
  onUpdateWidgets: (widgets: Widget[]) => void
  dashboardData?: any
  topUserPrompts?: any[]
  loadingTopUserPrompts?: boolean
}

const availableWidgets = [
  {
    id: "total-prompts",
    type: "stat",
    title: "Total Prompts",
    icon: <Rocket size={20} color="#60A5FA" />,
    size: "small" as WidgetSize,
    minSize: "small" as WidgetSize,
  },
  {
    id: "total-users",
    type: "stat",
    title: "Total Users",
    icon: <User size={20} color="#60A5FA" />,
    size: "small" as WidgetSize,
    minSize: "small" as WidgetSize,
  },
  {
    id: "average-rating",
    type: "stat",
    title: "Average Rating",
    icon: <Star size={20} color="#60A5FA" />,
    size: "small" as WidgetSize,
    minSize: "small" as WidgetSize,
  },
  {
    id: "monthly-usage",
    type: "stat",
    title: "Monthly Usage",
    icon: <TrendingUp size={20} color="#60A5FA" />,
    size: "small" as WidgetSize,
    minSize: "small" as WidgetSize,
  },
  {
    id: "top-prompts",
    type: "list",
    title: "Your Top Rated Prompts",
    icon: <Star size={24} color="#60A5FA" />,
    size: "medium" as WidgetSize,
    minSize: "medium" as WidgetSize,
  },
  {
    id: "recent-activity",
    type: "list",
    title: "Recent Activity",
    icon: <Activity size={24} color="#60A5FA" />,
    size: "medium" as WidgetSize,
    minSize: "medium" as WidgetSize,
  },
  {
    id: "analytics-chart",
    type: "chart",
    title: "Analytics Overview",
    icon: <BarChart3 size={24} color="#60A5FA" />,
    size: "large" as WidgetSize,
    minSize: "large" as WidgetSize,
  },
  {
    id: "performance-chart",
    type: "chart",
    title: "Performance Metrics",
    icon: <LineChart size={24} color="#60A5FA" />,
    size: "large" as WidgetSize,
    minSize: "large" as WidgetSize,
  },
  {
    id: "category-breakdown",
    type: "chart",
    title: "Category Breakdown",
    icon: <PieChart size={24} color="#60A5FA" />,
    size: "medium" as WidgetSize,
    minSize: "medium" as WidgetSize,
  },
  {
    id: "calendar-view",
    type: "calendar",
    title: "Activity Calendar",
    icon: <Calendar size={24} color="#60A5FA" />,
    size: "extra-large" as WidgetSize,
    minSize: "large" as WidgetSize,
  },
]

const sizeClasses = {
  small: "col-span-1 row-span-1",
  medium: "col-span-2 row-span-1",
  large: "col-span-2 row-span-2",
  "extra-large": "col-span-3 row-span-2",
}

const sizeLabels = {
  small: "Small (1x1)",
  medium: "Medium (2x1)",
  large: "Large (2x2)",
  "extra-large": "Extra Large (3x2)",
}

const chartColors = ["#3ebb9e", "#4079ff", "#fbbf24", "#ef4444", "#a78bfa", "#34d399"]

export default function WidgetManager({
  widgets,
  onUpdateWidgets,
  dashboardData,
  topUserPrompts = [],
  loadingTopUserPrompts = false,
}: WidgetManagerProps) {
  const [showAddWidget, setShowAddWidget] = useState(false)
  const [showResizeWidget, setShowResizeWidget] = useState<string | null>(null)

  const addWidget = (widgetType: (typeof availableWidgets)[0]) => {
    const newWidget: Widget = {
      id: widgetType.id,
      type: widgetType.type,
      title: widgetType.title,
      icon: widgetType.icon,
      component: renderWidgetComponent(widgetType, dashboardData, topUserPrompts, loadingTopUserPrompts),
      isActive: true,
      position: widgets.length,
      size: widgetType.size,
      minSize: widgetType.minSize,
    }

    onUpdateWidgets([...widgets, newWidget])
    setShowAddWidget(false)
  }

  const removeWidget = (widgetId: string) => {
    const updatedWidgets = widgets.filter((w) => w.id !== widgetId)
    onUpdateWidgets(updatedWidgets)
  }

  const resizeWidget = (widgetId: string, newSize: WidgetSize) => {
    const updatedWidgets = widgets.map((w) => (w.id === widgetId ? { ...w, size: newSize } : w))
    onUpdateWidgets(updatedWidgets)
    setShowResizeWidget(null)
  }

  const renderWidgetComponent = (
    widgetType: (typeof availableWidgets)[0],
    data: any,
    topPrompts: any[],
    loading: boolean,
  ) => {
    switch (widgetType.id) {
      case "total-prompts":
        return (
          <div className="flex items-center justify-between h-full">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Prompts</p>
              <p className="text-2xl font-bold">{data?.totalPrompts || 0}</p>
              <p className="text-sm text-muted-foreground">+12.5% from last month</p>
            </div>
            {widgetType.icon}
          </div>
        )
      case "total-users":
        return (
          <div className="flex items-center justify-between h-full">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Users</p>
              <p className="text-2xl font-bold">{data?.totalDownloads || 0}</p>
              <p className="text-sm text-muted-foreground">Active users</p>
            </div>
            {widgetType.icon}
          </div>
        )
      case "average-rating":
        return (
          <div className="flex items-center justify-between h-full">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Average Rating</p>
              <p className="text-2xl font-bold">{data?.averageRating?.toFixed(1) || "0.0"}</p>
              <p className="text-sm text-muted-foreground">-2.1% from last month</p>
            </div>
            {widgetType.icon}
          </div>
        )
      case "monthly-usage":
        return (
          <div className="flex items-center justify-between h-full">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Monthly Usage</p>
              <p className="text-2xl font-bold">{data?.monthlyUsage || 0}</p>
              <p className="text-sm text-muted-foreground">+8.2% from last month</p>
            </div>
            {widgetType.icon}
          </div>
        )
      case "top-prompts":
        return (
          <div className="h-full flex flex-col">
            <div className="mb-3 flex justify-between items-center">
              <p className="text-sm font-semibold">Your Top Rated Prompts</p>
              {widgetType.icon}
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-2 text-xs">
                {loading ? (
                  <div className="text-muted-foreground">Loading top rankings...</div>
                ) : topPrompts.length === 0 ? (
                  <div className="text-muted-foreground">No top prompts found.</div>
                ) : (
                  topPrompts.map((tp) => (
                    <div key={tp.id} className="flex justify-between items-center py-1 px-2 bg-muted/50 rounded">
                      <span className="font-medium truncate flex-1 mr-2">{tp.title}</span>
                      <span className="flex items-center flex-shrink-0">
                        <Star className="h-3 w-3 text-yellow-400 mr-1" />
                        {tp.avgRating?.toFixed(1)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )
      case "recent-activity":
        return (
          <div className="h-full flex flex-col">
            <div className="mb-3 flex justify-between items-center">
              <p className="text-sm font-semibold">Recent Activity</p>
              {widgetType.icon}
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-3 text-xs">
                <div className="flex items-center space-x-2 p-2 bg-muted/50 rounded">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-3 w-3 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1">
                      <span className="font-medium">Boityyyyy</span>
                      <span className="text-muted-foreground">followed you</span>
                    </div>
                    <div className="text-muted-foreground">1.5h</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-muted/50 rounded">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="h-3 w-3 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1">
                      <span className="font-medium">NavD</span>
                      <span className="text-muted-foreground">rated your prompt</span>
                    </div>
                    <div className="text-muted-foreground">5h</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case "analytics-chart": {
        // Mock data for bar chart
        const analyticsData = [
          { month: "Jan", usage: 40 },
          { month: "Feb", usage: 60 },
          { month: "Mar", usage: 30 },
          { month: "Apr", usage: 80 },
          { month: "May", usage: 55 },
          { month: "Jun", usage: 70 },
        ]
        return (
          <div className="h-full flex flex-col">
            <div className="mb-3 flex justify-between items-center">
              <p className="text-sm font-semibold">Analytics Overview</p>
              {widgetType.icon}
            </div>
            {/* Shift chart left using justify-start */}
            <div className="flex-1 bg-gradient-to-br from-[#f8fafc] via-[#e0f2fe] to-[#c7d2fe] rounded-lg flex items-center justify-start shadow-2xl pl-8">
              <ResponsiveContainer width="95%" height={220}>
                <ReBarChart data={analyticsData}>
                  <XAxis dataKey="month" stroke="#4079ff" />
                  <YAxis stroke="#3ebb9e" />
                  <Tooltip
                    wrapperStyle={{ backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 2px 8px #3ebb9e22" }}
                    labelStyle={{ color: "#4079ff" }}
                    itemStyle={{ color: "#3ebb9e" }}
                  />
                  <Bar dataKey="usage" radius={[8, 8, 0, 0]}>
                    {analyticsData.map((entry, idx) => (
                      <Cell key={`cell-bar-${idx}`} fill={chartColors[idx % chartColors.length]} />
                    ))}
                  </Bar>
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )
      }
      case "performance-chart": {
        // Mock data for line chart
        const performanceData = [
          { month: "Jan", score: 70 },
          { month: "Feb", score: 80 },
          { month: "Mar", score: 65 },
          { month: "Apr", score: 90 },
          { month: "May", score: 85 },
          { month: "Jun", score: 95 },
        ]
        return (
          <div className="h-full flex flex-col">
            <div className="mb-3 flex justify-between items-center">
              <p className="text-sm font-semibold">Performance Metrics</p>
              {widgetType.icon}
            </div>
            {/* Shift chart left using justify-start */}
            <div className="flex-1 bg-gradient-to-br from-[#f8fafc] via-[#e0f2fe] to-[#c7d2fe] rounded-lg flex items-center justify-start shadow-2xl">
              <ResponsiveContainer width="95%" height={220}>
                <ReLineChart data={performanceData}>
                  <XAxis dataKey="month" stroke="#4079ff" />
                  <YAxis stroke="#3ebb9e" />
                  <Tooltip
                    wrapperStyle={{ backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 2px 8px #3ebb9e22" }}
                    labelStyle={{ color: "#4079ff" }}
                    itemStyle={{ color: "#3ebb9e" }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#3ebb9e" strokeWidth={3} dot={{ r: 5, fill: "#4079ff" }} />
                </ReLineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )
      }
      case "category-breakdown": {
        // Mock data for pie chart
        const pieData = [
          { name: "Writing", value: 8 },
          { name: "Marketing", value: 5 },
          { name: "Development", value: 3 },
          { name: "Design", value: 2 },
          { name: "SEO", value: 1 },
          { name: "Content", value: 4 },
        ]
        return (
          <div className="h-full flex flex-col">
            <div className="mb-3 flex justify-between items-center">
              <p className="text-sm font-semibold">Category Breakdown</p>
              {widgetType.icon}
            </div>
            {/* Updated gradient for a more pleasing look */}
            <div className="flex-1 bg-gradient-to-br from-[#f8fafc] via-[#e0f2fe] to-[#c7d2fe] rounded-lg flex items-center justify-center shadow-2xl">
              <ResponsiveContainer width="100%" height={240}>
                <RePieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={chartColors[idx % chartColors.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )
      }
      case "calendar-view":
        return (
          <div className="h-full flex flex-col">
            <div className="mb-3 flex justify-between items-center">
              <p className="text-sm font-semibold">Activity Calendar</p>
              {widgetType.icon}
            </div>
            <div className="flex-1 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Calendar className="h-16 w-16 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Activity heatmap</p>
                <p className="text-xs text-muted-foreground">coming soon</p>
              </div>
            </div>
          </div>
        )
      default:
        return <div className="h-full flex items-center justify-center">Widget content</div>
    }
  }

  const activeWidgets = widgets.filter((w) => w.isActive)
  const inactiveWidgets = availableWidgets.filter((aw) => !widgets.some((w) => w.id === aw.id && w.isActive))

  const canResize = (widget: Widget) => {
    const availableSizes: WidgetSize[] = ["small", "medium", "large", "extra-large"]
    const widgetConfig = availableWidgets.find((aw) => aw.id === widget.id)
    const minSizeIndex = availableSizes.indexOf(widgetConfig?.minSize || "small")
    return availableSizes.slice(minSizeIndex)
  }

  return (
    <div className="space-y-6">
      {/* Dynamic Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr">
        {activeWidgets.map((widget) => (
          <Card key={widget.id} className={`p-4 relative group min-h-[120px] ${sizeClasses[widget.size]}`}>
            <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {canResize(widget).length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setShowResizeWidget(widget.id)}
                  title="Resize widget"
                >
                  <BarChart3 className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => removeWidget(widget.id)}
                title="Remove widget"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="h-full">
              {renderWidgetComponent(
                availableWidgets.find((aw) => aw.id === widget.id)!,
                dashboardData,
                topUserPrompts,
                loadingTopUserPrompts,
              )}
            </div>
          </Card>
        ))}

        {/* Add Widget Button */}
        <Card
          className="p-4 border-dashed border-2 hover:border-[#3ebb9e] transition-colors cursor-pointer min-h-[120px] col-span-1 row-span-1"
          onClick={() => setShowAddWidget(true)}
        >
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground hover:text-[#3ebb9e] transition-colors">
            <Plus className="h-8 w-8 mb-2" />
            <p className="text-sm">Add Widget</p>
          </div>
        </Card>
      </div>

      {/* Add Widget Modal */}
      {showAddWidget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">Add Widget</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowAddWidget(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inactiveWidgets.map((widget) => (
                  <Card
                    key={widget.id}
                    className="p-4 hover:shadow-md transition-shadow cursor-pointer hover:border-[#3ebb9e]"
                    onClick={() => addWidget(widget)}
                  >
                    <div className="flex items-start space-x-3">
                      {widget.icon}
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{widget.title}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{widget.type} widget</p>
                        <p className="text-xs text-muted-foreground mt-1">Size: {sizeLabels[widget.size]}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {inactiveWidgets.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">All available widgets are already added to your dashboard.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Resize Widget Modal */}
      {showResizeWidget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Resize Widget</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowResizeWidget(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                {canResize(widgets.find((w) => w.id === showResizeWidget)!).map((size) => (
                  <Button
                    key={size}
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => resizeWidget(showResizeWidget, size)}
                  >
                    {sizeLabels[size]}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
