import { useState } from 'react'
import { 
  Play, 
  Pause, 
  Download, 
  Reply, 
  Forward, 
  Copy, 
  Edit3, 
  Trash2, 
  Heart, 
  ThumbsUp, 
  Laugh,
  Check,
  CheckCheck,
  MapPin,
  File
} from 'lucide-react'

const MessageBubble = ({ 
  message, 
  isOwn, 
  isGroup, 
  onReact, 
  onReply, 
  onForward, 
  onEdit, 
  onDelete,
  getStatusIcon,
  playingVoice,
  setPlayingVoice 
}) => {
  const [showReactions, setShowReactions] = useState(false)
  const [showContextMenu, setShowContextMenu] = useState(false)

  const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '🔥']

  const renderMessageContent = () => {
    switch (message.type) {
      case 'text':
        return <p className="text-sm">{message.content}</p>

      case 'image':
        return (
          <div className="space-y-2">
            {message.content && <p className="text-sm">{message.content}</p>}
            <img 
              src={message.imageUrl} 
              alt="Shared image" 
              className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.imageUrl, '_blank')}
            />
          </div>
        )

      case 'voice':
        return (
          <div className="flex items-center space-x-3 bg-gray-100 rounded-lg p-3 min-w-[200px]">
            <button
              onClick={() => setPlayingVoice(playingVoice === message.id ? null : message.id)}
              className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
            >
              {playingVoice === message.id ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <div className="h-8 bg-purple-200 rounded flex items-center px-3">
                  <div className="flex space-x-1">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 bg-purple-600 rounded-full transition-all duration-300 ${
                          playingVoice === message.id ? 'animate-pulse' : ''
                        }`}
                        style={{ height: `${Math.random() * 16 + 8}px` }}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-gray-600">{message.voiceDuration}</span>
              </div>
            </div>
          </div>
        )

      case 'file':
        return (
          <div className="flex items-center space-x-3 bg-gray-100 rounded-lg p-3 min-w-[250px]">
            <div className="p-2 bg-blue-500 text-white rounded-lg">
              <File className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{message.fileName}</p>
              <p className="text-xs text-gray-600">{message.fileSize}</p>
            </div>
            <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>
        )

      case 'location':
        return (
          <div className="space-y-2">
            {message.content && <p className="text-sm">{message.content}</p>}
            <div className="bg-gray-100 rounded-lg p-3 min-w-[200px]">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium">Location</span>
              </div>
              <p className="text-sm text-gray-600">{message.locationName}</p>
              <div className="h-20 bg-gray-300 rounded mt-2 flex items-center justify-center">
                <span className="text-xs text-gray-500">Map Preview</span>
              </div>
            </div>
          </div>
        )

      default:
        return <p className="text-sm">{message.content}</p>
    }
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group relative`}>
      <div className="max-w-xs lg:max-w-md">
        {/* Reply indicator */}
        {message.replyTo && (
          <div className={`text-xs mb-1 px-3 py-1 rounded-lg ${
            isOwn ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
          }`}>
            <Reply className="w-3 h-3 inline mr-1" />
            Replying to message
          </div>
        )}

        {/* Message bubble */}
        <div 
          className={`px-4 py-2 rounded-2xl relative ${
            isOwn
              ? 'bg-purple-600 text-white'
              : 'bg-white border border-gray-200 text-gray-900'
          }`}
          onContextMenu={(e) => {
            e.preventDefault()
            setShowContextMenu(true)
          }}
        >
          {/* Forwarded indicator */}
          {message.isForwarded && (
            <p className="text-xs opacity-75 mb-1">
              <Forward className="w-3 h-3 inline mr-1" />
              Forwarded
            </p>
          )}

          {/* Sender name for group chats */}
          {!isOwn && isGroup && (
            <p className="text-xs font-medium text-purple-600 mb-1">{message.sender}</p>
          )}

          {/* Message content */}
          {renderMessageContent()}

          {/* Message reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {message.reactions.map((reaction, index) => (
                <button
                  key={index}
                  onClick={() => onReact(message.id, reaction.emoji)}
                  className={`px-2 py-1 rounded-full text-xs flex items-center space-x-1 transition-colors ${
                    reaction.users.includes('You')
                      ? 'bg-purple-100 text-purple-700 border border-purple-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{reaction.emoji}</span>
                  <span>{reaction.count}</span>
                </button>
              ))}
            </div>
          )}

          {/* Message footer */}
          <div className={`flex items-center justify-end space-x-1 mt-1 ${
            isOwn ? 'text-purple-200' : 'text-gray-500'
          }`}>
            <span className="text-xs">{message.timestamp}</span>
            {message.isEdited && <span className="text-xs opacity-75">edited</span>}
            {isOwn && getStatusIcon(message.status)}
          </div>
        </div>

        {/* Quick reaction bar */}
        <div className={`${showReactions ? 'flex' : 'hidden'} group-hover:flex items-center space-x-1 mt-1 ${
          isOwn ? 'justify-end' : 'justify-start'
        }`}>
          {quickReactions.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onReact(message.id, emoji)
                setShowReactions(false)
              }}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <span className="text-sm">{emoji}</span>
            </button>
          ))}
          <button
            onClick={() => onReply(message)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Reply className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Context menu */}
        {showContextMenu && (
          <div className="absolute top-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10 min-w-[150px]">
            <button
              onClick={() => {
                onReply(message)
                setShowContextMenu(false)
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
            >
              <Reply className="w-4 h-4" />
              <span>Reply</span>
            </button>
            <button
              onClick={() => {
                onForward(message.id)
                setShowContextMenu(false)
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
            >
              <Forward className="w-4 h-4" />
              <span>Forward</span>
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(message.content)
                setShowContextMenu(false)
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
            >
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </button>
            {isOwn && (
              <>
                <button
                  onClick={() => {
                    onEdit(message.id, message.content)
                    setShowContextMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    onDelete(message.id)
                    setShowContextMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2 text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Click outside to close context menu */}
      {showContextMenu && (
        <div 
          className="fixed inset-0 z-5"
          onClick={() => setShowContextMenu(false)}
        />
      )}
    </div>
  )
}

export default MessageBubble