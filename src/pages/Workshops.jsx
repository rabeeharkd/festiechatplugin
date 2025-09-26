import { 
  GraduationCap, 
  Users, 
  Clock, 
  Calendar,
  Plus,
  Search,
  BookOpen,
  Monitor,
  Brain
} from 'lucide-react'
import { useState, useMemo } from 'react'

const Workshops = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const workshops = [
    {
      id: 1,
      title: 'AI & Machine Learning Fundamentals',
      instructor: 'Dr. Sarah Johnson',
      duration: '3 hours',
      participants: 80,
      maxCapacity: 100,
      date: '2024-12-17',
      time: '11:00 AM',
      status: 'upcoming',
      category: 'AI/ML',
      level: 'Beginner',
      description: 'Introduction to AI concepts and hands-on ML implementation'
    },
    {
      id: 2,
      title: 'Advanced React Development',
      instructor: 'John Smith',
      duration: '4 hours',
      participants: 65,
      maxCapacity: 75,
      date: '2024-12-18',
      time: '2:00 PM',
      status: 'upcoming',
      category: 'Web Dev',
      level: 'Intermediate',
      description: 'Deep dive into React hooks, context, and performance optimization'
    },
    {
      id: 3,
      title: 'Blockchain Development Workshop',
      instructor: 'Alex Chen',
      duration: '5 hours',
      participants: 45,
      maxCapacity: 50,
      date: '2024-12-19',
      time: '10:00 AM',
      status: 'registration',
      category: 'Blockchain',
      level: 'Advanced',
      description: 'Smart contract development and DApp creation'
    },
    {
      id: 4,
      title: 'Data Science with Python',
      instructor: 'Maria Garcia',
      duration: '6 hours',
      participants: 90,
      maxCapacity: 120,
      date: '2024-12-20',
      time: '9:00 AM',
      status: 'upcoming',
      category: 'Data Science',
      level: 'Intermediate',
      description: 'Data analysis, visualization, and machine learning with Python'
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800'
      case 'ongoing':
        return 'bg-green-100 text-green-800'
      case 'registration':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-100 text-green-800'
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'Advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workshops</h1>
          <p className="text-gray-600 mt-1">Manage learning sessions and skill development workshops</p>
        </div>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <Plus className="h-4 w-4" />
          <span>Add Workshop</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <GraduationCap className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Workshops</p>
              <p className="text-2xl font-bold text-gray-900">15+</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Participants</p>
              <p className="text-2xl font-bold text-gray-900">280</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900">72</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Brain className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search workshops..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
              <option>All Categories</option>
              <option>AI/ML</option>
              <option>Web Dev</option>
              <option>Data Science</option>
              <option>Blockchain</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
              <option>All Levels</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Workshops Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {workshops.map((workshop) => (
          <div key={workshop.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Workshop Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{workshop.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workshop.status)}`}>
                      {workshop.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(workshop.level)}`}>
                      {workshop.level}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {workshop.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Workshop Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span>Instructor: {workshop.instructor}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{new Date(workshop.date).toLocaleDateString()} at {workshop.time}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Duration: {workshop.duration}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{workshop.participants}/{workshop.maxCapacity} participants</span>
                </div>
              </div>

              {/* Capacity Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Capacity</span>
                  <span>{Math.round((workshop.participants / workshop.maxCapacity) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${(workshop.participants / workshop.maxCapacity) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4">{workshop.description}</p>

              {/* Actions */}
              <div className="flex space-x-2">
                <button className="flex-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium py-2 px-4 rounded-lg transition-colors">
                  View Details
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Workshops