import { 
  BarChart3, 
  Trophy, 
  Medal, 
  Award,
  Plus,
  Search,
  Filter,
  Download,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react'
import { useState, useMemo } from 'react'

const Results = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [competitionFilter, setCompetitionFilter] = useState('all')
  const competitions = [
    {
      id: 1,
      name: 'Coding Challenge',
      category: 'Programming',
      participants: 120,
      status: 'completed',
      date: '2024-12-16',
      winners: [
        { position: 1, name: 'Arjun Kumar', college: 'Tech Campus University', score: 95 },
        { position: 2, name: 'Priya Sharma', college: 'Innovation Institute', score: 92 },
        { position: 3, name: 'Rahul Patel', college: 'Digital University', score: 89 }
      ]
    },
    {
      id: 2,
      name: 'AI Innovation Contest',
      category: 'Artificial Intelligence',
      participants: 85,
      status: 'ongoing',
      date: '2024-12-17',
      winners: []
    },
    {
      id: 3,
      name: 'Web Development Sprint',
      category: 'Web Technology',
      participants: 95,
      status: 'upcoming',
      date: '2024-12-19',
      winners: []
    }
  ]

  const leaderboard = [
    { rank: 1, name: 'Tech Campus University', points: 285, events: 8, gold: 3, silver: 2, bronze: 3 },
    { rank: 2, name: 'Innovation Institute', points: 240, events: 7, gold: 2, silver: 3, bronze: 2 },
    { rank: 3, name: 'Digital University', points: 215, events: 6, gold: 2, silver: 1, bronze: 3 },
    { rank: 4, name: 'Future Tech College', points: 180, events: 5, gold: 1, silver: 2, bronze: 2 },
    { rank: 5, name: 'Cyber Institute', points: 165, events: 5, gold: 1, silver: 1, bronze: 3 }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'ongoing':
        return 'bg-yellow-100 text-yellow-800'
      case 'upcoming':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getMedalIcon = (position) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-orange-600" />
      default:
        return <span className="text-gray-500 font-bold">{position}</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Results & Analytics</h1>
          <p className="text-gray-600 mt-1">Competition results and performance analytics</p>
        </div>
        <div className="flex space-x-2">
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Download className="h-4 w-4" />
            <span>Export Results</span>
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Add Result</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Participants</p>
              <p className="text-2xl font-bold text-gray-900">1,247</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Award className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Winners</p>
              <p className="text-2xl font-bold text-gray-900">36</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Score</p>
              <p className="text-2xl font-bold text-gray-900">78.5</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Competition Results */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Competition Results</h2>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search competitions..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Filter className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {competitions.map((competition) => (
              <div key={competition.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{competition.name}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-500">{competition.category}</span>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(competition.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-3 w-3 mr-1" />
                        {competition.participants} participants
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(competition.status)}`}>
                    {competition.status}
                  </span>
                </div>
                
                {competition.winners.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 mb-2">Winners</h4>
                    {competition.winners.map((winner, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getMedalIcon(winner.position)}
                          <div>
                            <p className="font-medium text-gray-900">{winner.name}</p>
                            <p className="text-sm text-gray-500">{winner.college}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{winner.score}%</p>
                          <p className="text-sm text-gray-500">Score</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    {competition.status === 'upcoming' ? 'Competition not started' : 'Results pending'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* College Leaderboard */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">College Leaderboard</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {leaderboard.map((college) => (
                <div key={college.rank} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0">
                    {college.rank <= 3 ? (
                      getMedalIcon(college.rank)
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-600">{college.rank}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">{college.name}</h4>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-xs text-gray-500">{college.points} pts</span>
                      <div className="flex space-x-1">
                        <span className="w-4 h-4 bg-yellow-400 rounded-full text-xs flex items-center justify-center text-white font-bold">
                          {college.gold}
                        </span>
                        <span className="w-4 h-4 bg-gray-400 rounded-full text-xs flex items-center justify-center text-white font-bold">
                          {college.silver}
                        </span>
                        <span className="w-4 h-4 bg-orange-600 rounded-full text-xs flex items-center justify-center text-white font-bold">
                          {college.bronze}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Results