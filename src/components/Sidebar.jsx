import { Link, useLocation } from 'react-router-dom'
import { useSidebar } from '../contexts/SidebarContext'
import { 
  LayoutDashboard, 
  Calendar, 
  Trophy, 
  GraduationCap, 
  Users, 
  Images, 
  BarChart3,
  Menu,
  X,
  Sparkles,
  MessageSquare,
  MoreVertical
} from 'lucide-react'

const Sidebar = () => {
  const { isOpen, setIsOpen } = useSidebar()
  const location = useLocation()

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Calendar, label: 'Events & Schedule', path: '/events' },
    { icon: Trophy, label: 'Competitions', path: '/competitions' },
    { icon: GraduationCap, label: 'Workshops', path: '/workshops' },
    { icon: Users, label: 'Participants', path: '/participants' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
    { icon: Images, label: 'Gallery', path: '/gallery' },
    { icon: BarChart3, label: 'Results', path: '/results' },
  ]

  const isActive = (path) => {
    return location.pathname === path
  }

return (
    <div className={`fixed transition-all duration-300 z-50 bg-purple-900 text-white h-full left-0 top-0 flex flex-col
      ${isOpen ? 'w-64' : 'w-16'}`}>
        
        {/* Header */}
        <div className="p-4 border-b border-purple-800">
            <div className="flex items-center justify-between">
                {isOpen && (
                    <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 bg-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-bold">F</span>
                        </div>
                        <span className="text-xl font-bold">Festie</span>
                    </div>
                )}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 rounded-lg hover:bg-purple-800 transition-colors"
                >
                    {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>
        </div>

        {/* Navigation */}
        <nav className="mt-8 flex-1 overflow-y-auto">
            <ul className={`space-y-2 ${isOpen ? 'px-4' : 'px-2'}`}>
                {menuItems.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.path)
                    
                    return (
                        <li key={item.path}>
                            <Link
                                to={item.path}
                                className={`flex items-center ${isOpen ? 'space-x-2 md:space-x-3 px-2 md:px-3' : 'justify-center px-1 md:px-2'} 
                                py-2 md:py-3 rounded-lg transition-colors group text-sm md:text-base ${
                                    active 
                                        ? 'bg-purple-700 text-white' 
                                        : 'text-purple-300 hover:bg-purple-800 hover:text-white'
                                }`}
                                title={!isOpen ? item.label : ''}
                            >
                                <Icon className={`${isOpen ? 'h-4 w-4 md:h-5 md:w-5' : 'h-4 w-4 md:h-5 md:w-5'} 
                                ${active ? 'text-white' : 'text-purple-400 group-hover:text-white'} flex-shrink-0`} />
                                {isOpen && (
                                    <span className="font-medium text-xs md:text-sm truncate">{item.label}</span>
                                )}
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </nav>

        {/* Footer */}
        {isOpen && (
            <div className="p-3 md:p-4 border-t border-purple-800">
                <div className="bg-purple-800 rounded-lg p-2 md:p-3">
                    <h4 className="font-semibold text-xs md:text-sm mb-1 md:mb-2 truncate">NeuroFest 2024</h4>
                    <p className="text-xs text-purple-300 leading-relaxed line-clamp-2">
                        Innovation meets creativity at the most anticipated tech festival.
                    </p>
                </div>
            </div>
        )}
    </div>
)
}

export default Sidebar