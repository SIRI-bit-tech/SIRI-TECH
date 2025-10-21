import { Suspense } from 'react'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import GlassmorphismCard from '@/components/glassmorphism/GlassmorphismCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { 
  FolderOpen, 
  MessageSquare, 
  Eye, 
  Users,
  TrendingUp,
  Calendar
} from 'lucide-react'
import { prisma } from '@/lib/prisma'

async function getDashboardStats() {
  try {
    const [
      totalProjects,
      publishedProjects,
      totalMessages,
      unreadMessages,
      totalPageViews,
      totalSessions,
      recentMessages,
      recentProjects
    ] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: 'PUBLISHED' } }),
      prisma.contact.count(),
      prisma.contact.count({ where: { status: 'NEW' } }),
      prisma.pageView.count(),
      prisma.session.count(),
      prisma.contact.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          subject: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.project.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          updatedAt: true,
        },
      }),
    ])

    return {
      totalProjects,
      publishedProjects,
      totalMessages,
      unreadMessages,
      totalPageViews,
      totalSessions,
      recentMessages,
      recentProjects,
    }
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error)
    return {
      totalProjects: 0,
      publishedProjects: 0,
      totalMessages: 0,
      unreadMessages: 0,
      totalPageViews: 0,
      totalSessions: 0,
      recentMessages: [],
      recentProjects: [],
    }
  }
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description,
  trend 
}: {
  title: string
  value: number | string
  icon: any
  description?: string
  trend?: string
}) {
  return (
    <GlassmorphismCard className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {description && (
            <p className="text-slate-300 text-sm mt-1">{description}</p>
          )}
        </div>
        <div className="p-3 bg-purple-600/20 rounded-lg">
          <Icon size={24} className="text-purple-400" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <TrendingUp size={16} className="text-green-400 mr-1" />
          <span className="text-green-400">{trend}</span>
        </div>
      )}
    </GlassmorphismCard>
  )
}

function RecentActivity({ 
  messages, 
  projects 
}: { 
  messages: any[]
  projects: any[]
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Messages */}
      <GlassmorphismCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Messages</h3>
          <MessageSquare size={20} className="text-purple-400" />
        </div>
        <div className="space-y-3">
          {messages.length > 0 ? (
            messages.map((message) => (
              <div key={message.id} className="flex items-start space-x-3 p-3 bg-slate-800/30 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-white font-medium truncate">{message.name}</p>
                    {message.status === 'NEW' && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm truncate">{message.subject || 'No subject'}</p>
                  <p className="text-slate-500 text-xs">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-center py-4">No messages yet</p>
          )}
        </div>
      </GlassmorphismCard>

      {/* Recent Projects */}
      <GlassmorphismCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Projects</h3>
          <FolderOpen size={20} className="text-purple-400" />
        </div>
        <div className="space-y-3">
          {projects.length > 0 ? (
            projects.map((project) => (
              <div key={project.id} className="flex items-start space-x-3 p-3 bg-slate-800/30 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-white font-medium truncate">{project.title}</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      project.status === 'PUBLISHED' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs">
                    Updated {new Date(project.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-center py-4">No projects yet</p>
          )}
        </div>
      </GlassmorphismCard>
    </div>
  )
}

async function DashboardContent() {
  const stats = await getDashboardStats()

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Welcome to your portfolio admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Projects"
          value={stats.totalProjects}
          icon={FolderOpen}
          description={`${stats.publishedProjects} published`}
        />
        <StatCard
          title="Messages"
          value={stats.totalMessages}
          icon={MessageSquare}
          description={`${stats.unreadMessages} unread`}
        />
        <StatCard
          title="Page Views"
          value={stats.totalPageViews.toLocaleString()}
          icon={Eye}
          description="All time"
        />
        <StatCard
          title="Visitors"
          value={stats.totalSessions.toLocaleString()}
          icon={Users}
          description="Unique sessions"
        />
      </div>

      {/* Recent Activity */}
      <RecentActivity 
        messages={stats.recentMessages} 
        projects={stats.recentProjects} 
      />

      {/* Quick Actions */}
      <GlassmorphismCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/projects"
            className="flex items-center p-4 bg-slate-800/30 rounded-lg hover:bg-slate-700/30 transition-colors"
          >
            <FolderOpen size={20} className="text-purple-400 mr-3" />
            <span className="text-white">Manage Projects</span>
          </a>
          <a
            href="/admin/messages"
            className="flex items-center p-4 bg-slate-800/30 rounded-lg hover:bg-slate-700/30 transition-colors"
          >
            <MessageSquare size={20} className="text-purple-400 mr-3" />
            <span className="text-white">View Messages</span>
          </a>
          <a
            href="/admin/analytics"
            className="flex items-center p-4 bg-slate-800/30 rounded-lg hover:bg-slate-700/30 transition-colors"
          >
            <TrendingUp size={20} className="text-purple-400 mr-3" />
            <span className="text-white">View Analytics</span>
          </a>
        </div>
      </GlassmorphismCard>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      }>
        <DashboardContent />
      </Suspense>
    </AdminLayout>
  )
}