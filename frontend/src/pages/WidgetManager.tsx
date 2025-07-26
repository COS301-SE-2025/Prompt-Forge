"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { X, Plus, Star, User, TrendingUp, Activity, Rocket, BarChart3 } from "lucide-react"

export interface Widget {
  id: string
  type: string
  title: string
  icon: React.ReactNode
  component: React.ReactNode
  isActive: boolean
  position: number
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
  },
  {
    id: "total-users",
    type: "stat",
    title: "Total Users",
    icon: <User size={20} color="#60A5FA" />,
  },
  {
    id: "average-rating",
    type: "stat",
    title: "Average Rating",
    icon: <Star size={20} color="#60A5FA" />,
  },
  {
    id: "monthly-usage",
    type: "stat",
    title: "Monthly Usage",
    icon: <TrendingUp size={20} color="#60A5FA" />,
  },
  {
    id: "top-prompts",
    type: "list",
    title: "Your Top Rated Prompts",
    icon: <Star size={24} color="#60A5FA" />,
  },
  {
    id: "recent-activity",
    type: "list",
    title: "Recent Activity",
    icon: <Activity size={24} color="#60A5FA" />,
  },
  {
    id: "analytics-chart",
    type: "chart",
    title: "Analytics Overview",
    icon: <BarChart3 size={24} color="#60A5FA" />,
  },
]

export default function WidgetManager({
  widgets,
  onUpdateWidgets,
  dashboardData,
  topUserPrompts = [],
  loadingTopUserPrompts = false,
}: WidgetManagerProps) {
  const [showAddWidget, setShowAddWidget] = useState(false)

  const addWidget = (widgetType: (typeof availableWidgets)[0]) => {
    const newWidget: Widget = {
      id: widgetType.id,
      type: widgetType.type,
      title: widgetType.title,
      icon: widgetType.icon,
      component: renderWidgetComponent(widgetType, dashboardData, topUserPrompts, loadingTopUserPrompts),
      isActive: true,
      position: widgets.length,
    }

    onUpdateWidgets([...widgets, newWidget])
    setShowAddWidget(false)
  }

  const removeWidget = (widgetId: string) => {
    const updatedWidgets = widgets.filter((w) => w.id !== widgetId)
    onUpdateWidgets(updatedWidgets)
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
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{data?.totalPrompts || 0}</p>
              <p className="text-sm text-muted-foreground">+12.5% from last month</p>
            </div>
            {widgetType.icon}
          </div>
        )
      case "total-users":
        return (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{data?.totalDownloads || 0}</p>
              <p className="text-sm text-muted-foreground">Active users</p>
            </div>
            {widgetType.icon}
          </div>
        )
      case "average-rating":
        return (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{data?.averageRating?.toFixed(1) || "0.0"}</p>
              <p className="text-sm text-muted-foreground">-2.1% from last month</p>
            </div>
            {widgetType.icon}
          </div>
        )
      case "monthly-usage":
        return (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{data?.monthlyUsage || 0}</p>
              <p className="text-sm text-muted-foreground">+8.2% from last month</p>
            </div>
            {widgetType.icon}
          </div>
        )
      case "top-prompts":
        return (
          <div>
            <div className="mb-2 flex justify-between items-center w-full">
              <p className="text-sm h-fit font-semibold">Your Top Rated Prompts</p>
              {widgetType.icon}
            </div>
            <div className="items-center text-xs">
              {loading ? (
                <div className="text-muted-foreground">Loading top rankings...</div>
              ) : topPrompts.length === 0 ? (
                <div className="text-muted-foreground">No top prompts found.</div>
              ) : (
                topPrompts.map((tp) => (
                  <div key={tp.id} className="flex justify-between items-center py-1">
                    <span className="font-medium truncate">{tp.title}</span>
                    <span className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      {tp.avgRating?.toFixed(1)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )
      case "recent-activity":
        return (
          <div>
            <div className="mb-2 flex justify-between items-center w-full">
              <p className="text-sm h-fit font-semibold">Recent Activity</p>
              {widgetType.icon}
            </div>
            <div className="items-center text-xs space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="h-3 w-3 text-white" />
                </div>
                <div className="flex-1">
                  <span className="font-medium">Boityyyyy</span>
                  <span className="text-muted-foreground"> followed you</span>
                  <div className="text-muted-foreground">1.5h</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Star className="h-3 w-3 text-white" />
                </div>
                <div className="flex-1">
                  <span className="font-medium">NavD</span>
                  <span className="text-muted-foreground"> rated your prompt</span>
                  <div className="text-muted-foreground">5h</div>
                </div>
              </div>
            </div>
          </div>
        )
      case "analytics-chart":
        return (
          <div>
            <div className="mb-2 flex justify-between items-center w-full">
              <p className="text-sm h-fit font-semibold">Analytics Overview</p>
              {widgetType.icon}
            </div>
            <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Chart visualization coming soon</p>
            </div>
          </div>
        )
      default:
        return <div>Widget content</div>
    }
  }

  const activeWidgets = widgets.filter((w) => w.isActive)
  const inactiveWidgets = availableWidgets.filter((aw) => !widgets.some((w) => w.id === aw.id && w.isActive))

  return (
    <div className="space-y-6">
      {/* Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {activeWidgets.map((widget) => (
          <Card key={widget.id} className="p-4 relative group">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeWidget(widget.id)}
            >
              <X className="h-4 w-4" />
            </Button>
            {renderWidgetComponent(
              availableWidgets.find((aw) => aw.id === widget.id)!,
              dashboardData,
              topUserPrompts,
              loadingTopUserPrompts,
            )}
          </Card>
        ))}

        {/* Add Widget Button */}
        <Card
          className="p-4 border-dashed border-2 hover:border-[#3ebb9e] transition-colors cursor-pointer"
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
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">Add Widget</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowAddWidget(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inactiveWidgets.map((widget) => (
                  <Card
                    key={widget.id}
                    className="p-4 hover:shadow-md transition-shadow cursor-pointer hover:border-[#3ebb9e]"
                    onClick={() => addWidget(widget)}
                  >
                    <div className="flex items-center space-x-3">
                      {widget.icon}
                      <div>
                        <h3 className="font-medium text-foreground">{widget.title}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{widget.type} widget</p>
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
    </div>
  )
}
