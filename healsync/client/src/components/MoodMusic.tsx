import { useState } from 'react'
import {
  ChevronDown, ChevronUp,
} from 'lucide-react'

interface Props {
  mood:     number
  compact?: boolean
}

// Real working Spotify playlist links
// These are public playlists that work
// without login for preview
const PLAYLISTS = {
  1: {
    label:       'Mood lifting music 🌈',
    description: 'Uplifting songs to feel better',
    spotifyUrl:  'https://open.spotify.com/playlist/37i9dQZF1DX3rxVfibe1L0',
    spotifyEmbed:'https://open.spotify.com/embed/playlist/37i9dQZF1DX3rxVfibe1L0?utm_source=generator&theme=0',
    youtubeSearch: 'https://www.youtube.com/results?search_query=mood+lifting+uplifting+playlist',
    color:       'bg-blue-50 dark:bg-blue-900/20',
    border:      'border-blue-200 dark:border-blue-800',
    textColor:   'text-blue-700 dark:text-blue-300',
    btnColor:    'bg-blue-500 hover:bg-blue-600',
    emoji:       '🌈',
  },
  2: {
    label:       'Gentle healing music 💙',
    description: 'Calm and soothing for difficult moments',
    spotifyUrl:  'https://open.spotify.com/playlist/37i9dQZF1DWXe9gFZP0gtP',
    spotifyEmbed:'https://open.spotify.com/embed/playlist/37i9dQZF1DWXe9gFZP0gtP?utm_source=generator&theme=0',
    youtubeSearch: 'https://www.youtube.com/results?search_query=calm+healing+music+playlist',
    color:       'bg-indigo-50 dark:bg-indigo-900/20',
    border:      'border-indigo-200 dark:border-indigo-800',
    textColor:   'text-indigo-700 dark:text-indigo-300',
    btnColor:    'bg-indigo-500 hover:bg-indigo-600',
    emoji:       '💙',
  },
  3: {
    label:       'Focus and flow 🎧',
    description: 'Lo-fi beats to stay calm and focused',
    spotifyUrl:  'https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn',
    spotifyEmbed:'https://open.spotify.com/embed/playlist/37i9dQZF1DWWQRwui0ExPn?utm_source=generator&theme=0',
    youtubeSearch: 'https://www.youtube.com/results?search_query=lofi+hip+hop+focus+playlist',
    color:       'bg-amber-50 dark:bg-amber-900/20',
    border:      'border-amber-200 dark:border-amber-800',
    textColor:   'text-amber-700 dark:text-amber-300',
    btnColor:    'bg-amber-500 hover:bg-amber-600',
    emoji:       '🎧',
  },
  4: {
    label:       'Good vibes only 😊',
    description: 'Happy music to match your mood',
    spotifyUrl:  'https://open.spotify.com/playlist/37i9dQZF1DX9XIFQuFvzM4',
    spotifyEmbed:'https://open.spotify.com/embed/playlist/37i9dQZF1DX9XIFQuFvzM4?utm_source=generator&theme=0',
    youtubeSearch: 'https://www.youtube.com/results?search_query=good+vibes+happy+music+playlist',
    color:       'bg-mint-50 dark:bg-mint-900/20',
    border:      'border-mint-200 dark:border-mint-800',
    textColor:   'text-mint-700 dark:text-mint-300',
    btnColor:    'bg-mint-500 hover:bg-mint-600',
    emoji:       '😊',
  },
  5: {
    label:       'Celebrate your day 🎉',
    description: 'Energetic music for when you feel great',
    spotifyUrl:  'https://open.spotify.com/playlist/37i9dQZF1DXdPec7aLTmlC',
    spotifyEmbed:'https://open.spotify.com/embed/playlist/37i9dQZF1DXdPec7aLTmlC?utm_source=generator&theme=0',
    youtubeSearch: 'https://www.youtube.com/results?search_query=party+celebrate+feel+good+playlist',
    color:       'bg-purple-50 dark:bg-purple-900/20',
    border:      'border-purple-200 dark:border-purple-800',
    textColor:   'text-purple-700 dark:text-purple-300',
    btnColor:    'bg-purple-500 hover:bg-purple-600',
    emoji:       '🎉',
  },
}

export default function MoodMusic(
  { mood, compact = false }: Props
) {
  const [isExpanded, setIsExpanded] =
    useState(!compact)
  const [embedLoaded, setEmbedLoaded] =
    useState(false)
  const [showEmbed, setShowEmbed] =
    useState(false)

  const clampedMood = Math.max(
    1, Math.min(5, Math.round(mood || 3))
  ) as 1|2|3|4|5

  const playlist = PLAYLISTS[clampedMood]
  if (!playlist) return null

  return (
    <div className={`
      rounded-2xl border overflow-hidden
      transition-all duration-200
      ${playlist.color} ${playlist.border}
    `}>

      {/* ── HEADER ── */}
      <button
        onClick={() =>
          setIsExpanded(e => !e)}
        className="w-full flex items-center
          justify-between p-4 text-left">

        <div className="flex items-center
          gap-3">
          <div className={`
            w-10 h-10 rounded-xl
            flex items-center justify-center
            text-xl ${playlist.btnColor}
          `}>
            {playlist.emoji}
          </div>
          <div>
            <p className={`text-sm font-medium
              ${playlist.textColor}`}>
              {playlist.label}
            </p>
            <p className="text-xs text-gray-500
              dark:text-gray-400 mt-0.5">
              {playlist.description}
            </p>
          </div>
        </div>

        <div className={`shrink-0
          ${playlist.textColor}`}>
          {isExpanded
            ? <ChevronUp size={16} />
            : <ChevronDown size={16} />}
        </div>
      </button>

      {/* ── EXPANDED CONTENT ── */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">

          {/* Spotify embed */}
          {showEmbed ? (
            <div className="rounded-xl
              overflow-hidden relative">
              {!embedLoaded && (
                <div className="absolute inset-0
                  flex items-center justify-center
                  bg-gray-100 dark:bg-gray-800
                  rounded-xl z-10">
                  <div className="flex flex-col
                    items-center gap-2">
                    <div className="w-6 h-6
                      border-2 border-green-500
                      border-t-transparent
                      rounded-full animate-spin"/>
                    <p className="text-xs
                      text-gray-500
                      dark:text-gray-400">
                      Loading Spotify...
                    </p>
                  </div>
                </div>
              )}
              <iframe
                src={playlist.spotifyEmbed}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay;
                  clipboard-write;
                  encrypted-media;
                  fullscreen;
                  picture-in-picture"
                loading="lazy"
                onLoad={() =>
                  setEmbedLoaded(true)}
                title="Spotify playlist"
                className="rounded-xl"
              />
            </div>
          ) : (
            /* Load embed button */
            <button
              onClick={() => setShowEmbed(true)}
              className={`
                w-full flex items-center
                justify-center gap-2.5
                py-3 rounded-xl text-sm
                font-medium text-white
                transition-all
                active:scale-[0.98]
                ${playlist.btnColor}
              `}>
              <svg width="20" height="20"
                viewBox="0 0 24 24"
                fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              Open in Spotify
            </button>
          )}

          {/* Action buttons row */}
          <div className="grid grid-cols-2
            gap-2">

            {/* Open Spotify */}
            <a
              href={playlist.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center
                justify-center gap-1.5
                py-2.5 rounded-xl text-xs
                font-medium text-white
                bg-green-500 hover:bg-green-600
                transition-colors">
              <svg width="14" height="14"
                viewBox="0 0 24 24"
                fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              Spotify
            </a>

            {/* YouTube search */}
            <a
              href={playlist.youtubeSearch}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center
                justify-center gap-1.5
                py-2.5 rounded-xl text-xs
                font-medium text-white
                bg-red-500 hover:bg-red-600
                transition-colors">
              <svg width="14" height="14"
                viewBox="0 0 24 24"
                fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              YouTube
            </a>

          </div>

          <p className="text-xs text-center
            text-gray-400 dark:text-gray-500">
            🎵 Music personalised to your
            mood today
          </p>

        </div>
      )}
    </div>
  )
}
