import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Plus,
  Filter,
  Search,
  Edit,
  Trash2
} from 'lucide-react'
import { useState, useMemo } from 'react'

const Events = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const events = [
    {
      id: 1,
      title: 'Opening Ceremony',
      date: '2024-12-15',
      time: '10:00 AM',
      venue: 'Main Auditorium',
      participants: 500,
      status: 'upcoming',
      category: 'ceremony',
      description: 'Grand opening ceremony with keynote speakers and cultural performances'
    },
    {
      id: 2,
      title: 'Coding Competition',
      date: '2024-12-16',
      time: '2:00 PM',
      venue: 'Computer Lab A',
      participants: 120,
      status: 'upcoming',
      category: 'competition',
      description: 'Algorithmic programming challenge with multiple rounds'
    },
    {
      id: 3,
      title: 'AI & Machine Learning Workshop',
      date: '2024-12-17',
      time: '11:00 AM',
      venue: 'Conference Hall B',
      participants: 80,
      status: 'scheduled',
      category: 'workshop',
      description: 'Hands-on workshop on modern AI and ML techniques'
    },
    {
      id: 4,
      title: 'Tech Expo',
      date: '2024-12-17',
      time: '3:00 PM',
      venue: 'Exhibition Ground',
      participants: 300,
      status: 'upcoming',
      category: 'expo',
      description: 'Showcase of innovative technology projects and startups'
    },
    {
      id: 5,
      title: 'Cultural Night',
      date: '2024-12-18',
      time: '7:00 PM',
      venue: 'Open Amphitheater',
      participants: 600,
      status: 'upcoming',
      category: 'cultural',
      description: 'Evening of music, dance, and cultural performances'
    },
    {
      id: 6,
      title: 'Hackathon Finals',
      date: '2024-12-19',
      time: '9:00 AM',
      venue: 'Innovation Lab',
      participants: 60,
      status: 'scheduled',
      category: 'competition',
      description: '24-hour hackathon finale with industry mentors'
    }
  ]

  // Filter and search logic
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.venue.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter
      const matchesStatus = statusFilter === 'all' || event.status === statusFilter
      
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [searchTerm, categoryFilter, statusFilter])

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800'
      case 'scheduled':
        return 'bg-green-100 text-green-800'
      case 'ongoing':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'ceremony':
        return 'bg-purple-100 text-purple-800'
      case 'competition':
        return 'bg-red-100 text-red-800'
      case 'workshop':
        return 'bg-orange-100 text-orange-800'
      case 'expo':
        return 'bg-indigo-100 text-indigo-800'
      case 'cultural':
        return 'bg-pink-100 text-pink-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Events & Schedule</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage all festival events and schedules</p>
        </div>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors w-fit">
          <Plus className="h-4 w-4" />
          <span>Add Event</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">All Categories</option>
              <option value="ceremony">Ceremony</option>
              <option value="competition">Competition</option>
              <option value="workshop">Workshop</option>
              <option value="expo">Expo</option>
              <option value="cultural">Cultural</option>
            </select>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="scheduled">Scheduled</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
          <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-4 md:p-6">
              {/* Event Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">{event.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                      {event.category}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-1 md:space-x-2 ml-2">
                  <button className="p-1.5 md:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Edit className="h-3 w-3 md:h-4 md:w-4" />
                  </button>
                  <button className="p-1.5 md:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                  </button>
                </div>
              </div>

              {/* Event Details */}
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center text-xs md:text-sm text-gray-600">
                  <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{new Date(event.date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div className="flex items-center text-xs md:text-sm text-gray-600">
                  <Clock className="h-3 w-3 md:h-4 md:w-4 mr-2 flex-shrink-0" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center text-xs md:text-sm text-gray-600">
                  <MapPin className="h-3 w-3 md:h-4 md:w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{event.venue}</span>
                </div>
                <div className="flex items-center text-xs md:text-sm text-gray-600">
                  <Users className="h-3 w-3 md:h-4 md:w-4 mr-2 flex-shrink-0" />
                  <span>{event.participants} participants</span>
                </div>
              </div>

              {/* Event Description */}
              <p className="text-xs md:text-sm text-gray-600 mt-3 md:mt-4 line-clamp-2">{event.description}</p>

              {/* Action Button */}
              <button className="w-full mt-3 md:mt-4 bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                View Details
              </button>
            </div>
          </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Search className="h-8 w-8 md:h-12 md:w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-sm text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Calendar View Toggle */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Calendar View</h3>
            <p className="text-gray-600 mt-1 text-sm">View events in a calendar format for better scheduling overview</p>
          </div>
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors w-fit">
            Switch to Calendar
          </button>
        </div>
      </div>
    </div>
  )
}

export default Events