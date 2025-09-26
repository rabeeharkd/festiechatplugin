import { 
  Users, 
  Calendar, 
  Trophy, 
  GraduationCap, 
  TrendingUp, 
  Star,
  Award,
  Target,
  MessageSquare
} from 'lucide-react'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const stats = [
    {
      icon: Calendar,
      label: 'Total Events',
      value: '50+',
      description: 'Exciting Activities',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      icon: Trophy,
      label: 'Competitions',
      value: '20+',
      description: 'Skill Challenges',
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      icon: GraduationCap,
      label: 'Workshops',
      value: '15+',
      description: 'Learning Sessions',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      icon: Award,
      label: 'Prize Pool',
      value: '₹5L+',
      description: 'Total Rewards',
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    }
  ]

  const recentActivities = [
    { action: 'New participant registered', name: 'Arjun Kumar', time: '2 mins ago', type: 'registration' },
    { action: 'Competition result uploaded', name: 'Coding Challenge', time: '15 mins ago', type: 'result' },
    { action: 'Workshop scheduled', name: 'AI & Machine Learning', time: '1 hour ago', type: 'workshop' },
    { action: 'Gallery updated', name: 'Cultural Night Photos', time: '3 hours ago', type: 'gallery' },
    { action: 'New event created', name: 'Tech Expo', time: '5 hours ago', type: 'event' }
  ]

  const upcomingEvents = [
    { name: 'Opening Ceremony', date: 'Dec 15, 2024', time: '10:00 AM', status: 'upcoming' },
    { name: 'Coding Competition', date: 'Dec 16, 2024', time: '2:00 PM', status: 'upcoming' },
    { name: 'AI Workshop', date: 'Dec 17, 2024', time: '11:00 AM', status: 'scheduled' },
    { name: 'Cultural Night', date: 'Dec 18, 2024', time: '7:00 PM', status: 'upcoming' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Welcome to NeuroFest 2024 Admin Panel</p>
        </div>
        <div className="flex items-center justify-center sm:justify-start space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full w-fit">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Live Festival</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className={`${stat.bgColor} p-2 md:p-3 rounded-lg`}>
                  <Icon className={`h-5 w-5 md:h-6 md:w-6 ${stat.textColor}`} />
                </div>
                <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
              </div>
              <div className="mt-3 md:mt-4">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-xs md:text-sm text-gray-600 mt-1">{stat.label}</p>
                <p className="text-xs text-gray-500 mt-1 hidden sm:block">{stat.description}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
          </div>
          <div className="p-4 md:p-6">
            <div className="space-y-3 md:space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 md:space-x-4 p-2 md:p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{activity.action}</p>
                    <p className="text-xs text-gray-600 truncate">{activity.name}</p>
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
          </div>
          <div className="p-4 md:p-6">
            <div className="space-y-3 md:space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="border-l-4 border-purple-500 pl-3 md:pl-4">
                  <h4 className="font-medium text-gray-900 text-sm md:text-base">{event.name}</h4>
                  <p className="text-xs md:text-sm text-gray-600">{event.date}</p>
                  <p className="text-xs text-gray-500">{event.time}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                    event.status === 'upcoming' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {event.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          <Link 
            to="/participants"
            className="flex flex-col items-center p-3 md:p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-colors group"
          >
            <Users className="h-6 w-6 md:h-8 md:w-8 text-gray-400 group-hover:text-purple-500 mb-2" />
            <span className="text-xs md:text-sm font-medium text-gray-600 group-hover:text-purple-600 text-center">Add Participant</span>
          </Link>
          <Link 
            to="/events"
            className="flex flex-col items-center p-3 md:p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-colors group"
          >
            <Calendar className="h-6 w-6 md:h-8 md:w-8 text-gray-400 group-hover:text-purple-500 mb-2" />
            <span className="text-xs md:text-sm font-medium text-gray-600 group-hover:text-purple-600 text-center">Schedule Event</span>
          </Link>
          <Link 
            to="/competitions"
            className="flex flex-col items-center p-3 md:p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-colors group"
          >
            <Trophy className="h-6 w-6 md:h-8 md:w-8 text-gray-400 group-hover:text-purple-500 mb-2" />
            <span className="text-xs md:text-sm font-medium text-gray-600 group-hover:text-purple-600 text-center">Create Competition</span>
          </Link>
          <Link 
            to="/messages"
            className="flex flex-col items-center p-3 md:p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-colors group"
          >
            <MessageSquare className="h-6 w-6 md:h-8 md:w-8 text-gray-400 group-hover:text-purple-500 mb-2" />
            <span className="text-xs md:text-sm font-medium text-gray-600 group-hover:text-purple-600 text-center">Team Messages</span>
          </Link>
          <Link 
            to="/results"
            className="flex flex-col items-center p-3 md:p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-colors group"
          >
            <Star className="h-6 w-6 md:h-8 md:w-8 text-gray-400 group-hover:text-purple-500 mb-2" />
            <span className="text-xs md:text-sm font-medium text-gray-600 group-hover:text-purple-600 text-center">Upload Results</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard