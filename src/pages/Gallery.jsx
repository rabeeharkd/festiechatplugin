import { 
  Images, 
  Plus, 
  Search, 
  Filter,
  Download,
  Eye,
  Heart,
  Share2,
  Calendar,
  Camera
} from 'lucide-react'
import { useState, useMemo } from 'react'

const Gallery = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const images = [
    {
      id: 1,
      title: 'Opening Ceremony 2023',
      category: 'ceremony',
      date: '2023-12-15',
      photographer: 'Event Team',
      likes: 45,
      views: 320,
      url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
      description: 'Grand opening ceremony with keynote speakers'
    },
    {
      id: 2,
      title: 'Coding Competition',
      category: 'competition',
      date: '2023-12-16',
      photographer: 'Tech Team',
      likes: 32,
      views: 245,
      url: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=300&fit=crop',
      description: 'Intense coding challenge moments'
    },
    {
      id: 3,
      title: 'AI Workshop Session',
      category: 'workshop',
      date: '2023-12-17',
      photographer: 'Academic Team',
      likes: 28,
      views: 189,
      url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=300&fit=crop',
      description: 'Hands-on AI learning session'
    },
    {
      id: 4,
      title: 'Tech Expo',
      category: 'expo',
      date: '2023-12-17',
      photographer: 'Media Team',
      likes: 56,
      views: 412,
      url: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=400&h=300&fit=crop',
      description: 'Innovation showcase and demonstrations'
    },
    {
      id: 5,
      title: 'Cultural Night',
      category: 'cultural',
      date: '2023-12-18',
      photographer: 'Cultural Team',
      likes: 89,
      views: 567,
      url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop',
      description: 'Musical performances and cultural celebration'
    },
    {
      id: 6,
      title: 'Networking Event',
      category: 'networking',
      date: '2023-12-19',
      photographer: 'Event Team',
      likes: 41,
      views: 298,
      url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=300&fit=crop',
      description: 'Professional networking and collaboration'
    }
  ]

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
      case 'networking':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gallery</h1>
          <p className="text-gray-600 mt-1">Festival memories and event highlights</p>
        </div>
        <div className="flex space-x-2">
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Download className="h-4 w-4" />
            <span>Download All</span>
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Upload Photos</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Images className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Photos</p>
              <p className="text-2xl font-bold text-gray-900">1,247</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Eye className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">32.5K</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Heart className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Likes</p>
              <p className="text-2xl font-bold text-gray-900">5.8K</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Camera className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Albums</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
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
              placeholder="Search photos..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
              <option>All Categories</option>
              <option>Ceremony</option>
              <option>Competition</option>
              <option>Workshop</option>
              <option>Expo</option>
              <option>Cultural</option>
              <option>Networking</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
              <option>Latest First</option>
              <option>Most Liked</option>
              <option>Most Viewed</option>
            </select>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {images.map((image) => (
          <div key={image.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
            {/* Image */}
            <div className="relative overflow-hidden">
              <img 
                src={image.url} 
                alt={image.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
                  <button className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
                    <Eye className="h-4 w-4 text-gray-700" />
                  </button>
                  <button className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
                    <Download className="h-4 w-4 text-gray-700" />
                  </button>
                  <button className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
                    <Share2 className="h-4 w-4 text-gray-700" />
                  </button>
                </div>
              </div>
              <div className="absolute top-2 left-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(image.category)}`}>
                  {image.category}
                </span>
              </div>
            </div>

            {/* Image Info */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{image.title}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{image.description}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{new Date(image.date).toLocaleDateString()}</span>
                </div>
                <span>By {image.photographer}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-1" />
                    <span>{image.likes}</span>
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    <span>{image.views}</span>
                  </div>
                </div>
                <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg transition-colors">
          Load More Photos
        </button>
      </div>
    </div>
  )
}

export default Gallery