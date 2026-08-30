import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  BookOpen, 
  ChevronRight, 
  ChevronDown, 
  ChevronLeft,
  Play, 
  Pause,
  Search, 
  Settings, 
  Users, 
  Radio,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  HelpCircle,
  ArrowRight,
  ArrowUpDown,
  Copy,
  Check,
  CheckCheck,
  X as XIcon,
  Filter,
  Eye,
  FileText,
  Tag,
  Volume2,
  Volume1,
  Trash2,
  Download,
  ExternalLink,
  MessageSquare,
  SkipBack,
  SkipForward,
  Clock,
  Calendar,
  Sun,
  Moon
} from 'lucide-react';
import PageSpecificDocumentation from './PageSpecificDocumentation';

const InteractiveUserGuide = ({ isDarkMode }) => {
  const [searchParams] = useSearchParams();
  const pageParam = searchParams.get('page');
  const tabParam = searchParams.get('tab');
  const globalTabParam = searchParams.get('globalTab');

  // Initialize sections based on URL parameters
  const getInitialSections = () => {
    const baseSections = {
      gettingStarted: false,
      howItWorks: false,
      commonTasks: false,
      troubleshooting: false,
      quickReference: false,
      bestPractices: false,
      interfaceControls: false
    };

    // Show relevant sections based on page parameter
    if (pageParam === 'dashboard') {
      baseSections.gettingStarted = true;
      baseSections.interfaceControls = true;
      baseSections.commonTasks = true;
    } else if (pageParam === 'settings') {
      baseSections.interfaceControls = true;
      baseSections.commonTasks = true;
      baseSections.quickReference = true;
      
      // If specific tab is provided, we could show even more specific content
      if (tabParam === 'summary') {
        baseSections.quickReference = true;
      } else if (tabParam === 'recorders' || tabParam === 'channels-stations') {
        baseSections.commonTasks = true;
        baseSections.troubleshooting = true;
      } else if (tabParam === 'keywords-tags') {
        baseSections.commonTasks = true;
      }
    } else if (pageParam === 'users') {
      baseSections.commonTasks = true;
      baseSections.quickReference = true;
    } else if (pageParam === 'logs') {
      baseSections.troubleshooting = true;
      baseSections.quickReference = true;
    } else if (pageParam === 'reports') {
      baseSections.commonTasks = true;
      baseSections.quickReference = true;
    } else if (pageParam === 'player') {
      baseSections.interfaceControls = true;
    } else {
      // Default: show getting started
      baseSections.gettingStarted = true;
    }

    return baseSections;
  };

  const [expandedSections, setExpandedSections] = useState(getInitialSections);
  const [copiedText, setCopiedText] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Update sections when URL parameters change
  useEffect(() => {
    setExpandedSections(getInitialSections());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageParam, tabParam, globalTabParam]);

  // Highlight text function
  const highlightText = (text, query) => {
    if (!query || !text) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, idx) => 
      regex.test(part) ? (
        <mark key={idx} className={`${isDarkMode ? 'bg-yellow-600/30 text-yellow-200' : 'bg-yellow-200 text-yellow-900'} px-1 rounded`}>
          {part}
        </mark>
      ) : part
    );
  };

  // Check if content matches search query
  const matchesSearch = (text) => {
    if (!searchQuery || !text) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  // Auto-expand sections that have matches when searching
  useEffect(() => {
    if (searchQuery) {
      // Check each section for matches and expand if found
      const queryLower = searchQuery.toLowerCase();
      setExpandedSections({
        gettingStarted: 'getting started access dashboard log in check device verify channels'.includes(queryLower),
        howItWorks: 'how it works system flow recording process device listens upload transcription'.includes(queryLower),
        commonTasks: 'common tasks find recording monitor channel review activity configure keyword'.includes(queryLower),
        troubleshooting: 'troubleshooting no recordings transcribing device offline can\'t find'.includes(queryLower),
        quickReference: 'quick reference keyboard shortcuts action location'.includes(queryLower),
        bestPractices: 'best practices tips optimizing recording quality daily operations'.includes(queryLower),
        interfaceControls: 'interface controls buttons topbar sidebar message audio player filter view settings'.includes(queryLower)
      });
    }
  }, [searchQuery]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(id);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const SectionHeader = ({ title, icon: Icon, isExpanded, onClick, children }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 rounded-lg transition-all ${
        isDarkMode 
          ? 'bg-gray-700 hover:bg-gray-600 text-white' 
          : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
        <h3 className="text-lg font-semibold">{title}</h3>
        {children}
      </div>
      {isExpanded ? (
        <ChevronDown className="w-5 h-5" />
      ) : (
        <ChevronRight className="w-5 h-5" />
      )}
    </button>
  );

  const StepCard = ({ number, title, description, icon: Icon, code, children }) => {
    const titleMatches = matchesSearch(title);
    const descMatches = matchesSearch(description);
    const shouldShow = !searchQuery || titleMatches || descMatches;
    
    if (!shouldShow) return null;
    
    return (
      <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
            isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
          }`}>
            {number}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {Icon && <Icon className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />}
              <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {highlightText(title, searchQuery)}
              </h4>
            </div>
            <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {highlightText(description, searchQuery)}
            </p>
          {code && (
            <div className="relative group">
              <div className={`p-3 rounded-md font-mono text-xs overflow-x-auto ${
                isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-800'
              }`}>
                {code}
              </div>
              <button
                onClick={() => copyToClipboard(code, `code-${number}`)}
                className={`absolute top-2 right-2 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                  isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {copiedText === `code-${number}` ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
    );
  };

  const TaskCard = ({ title, description, steps, icon: Icon }) => {
    const titleMatches = matchesSearch(title);
    const descMatches = matchesSearch(description);
    const stepsMatch = steps.some(step => matchesSearch(step));
    const shouldShow = !searchQuery || titleMatches || descMatches || stepsMatch;
    
    if (!shouldShow) return null;
    
    return (
      <div className={`p-5 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-3 mb-3">
          {Icon && <Icon className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />}
          <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {highlightText(title, searchQuery)}
          </h4>
        </div>
        <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {highlightText(description, searchQuery)}
        </p>
        <ol className="space-y-2 ml-6">
          {steps.map((step, idx) => {
            const stepMatches = matchesSearch(step);
            if (searchQuery && !stepMatches) return null;
            return (
              <li key={idx} className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <span className="font-semibold">{idx + 1}.</span> {highlightText(step, searchQuery)}
              </li>
            );
          })}
        </ol>
      </div>
    );
  };

  const TroubleshootingCard = ({ problem, solutions, icon: Icon }) => {
    const problemMatches = matchesSearch(problem);
    const solutionsMatch = solutions.some(solution => matchesSearch(solution));
    const shouldShow = !searchQuery || problemMatches || solutionsMatch;
    
    if (!shouldShow) return null;
    
    return (
      <div className={`p-5 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-start gap-3">
          <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
          <div className="flex-1">
            <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {highlightText(problem, searchQuery)}
            </h4>
            <ul className="space-y-2">
              {solutions.map((solution, idx) => {
                const solutionMatches = matchesSearch(solution);
                if (searchQuery && !solutionMatches) return null;
                return (
                  <li key={idx} className={`text-sm flex items-start gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                    <span>{highlightText(solution, searchQuery)}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  // Get context message based on URL parameters
  const getContextMessage = () => {
    if (!pageParam) return null;

    const messages = {
      dashboard: 'Showing documentation relevant to the Dashboard page.',
      settings: tabParam 
        ? `Showing documentation relevant to Settings → ${tabParam.charAt(0).toUpperCase() + tabParam.slice(1).replace('-', ' ')}.`
        : 'Showing documentation relevant to the Settings page.',
      users: 'Showing documentation relevant to User Management.',
      logs: 'Showing documentation relevant to the Logs page.',
      reports: 'Showing documentation relevant to Reports.',
      profile: 'Showing documentation relevant to User Profile.',
      player: 'Showing documentation relevant to the Advanced Audio Player.',
      general: null
    };

    return messages[pageParam] || null;
  };

  const contextMessage = getContextMessage();

  // Determine if we should show page-specific documentation or general guide
  const showPageSpecificDocs = pageParam && pageParam !== 'general';

  return (
    <div className={`space-y-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
      {/* Context Banner */}
      {contextMessage && (
        <div className={`p-4 rounded-lg border mb-4 ${
          isDarkMode 
            ? 'bg-blue-900/20 border-blue-800/50 text-blue-200' 
            : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <div className="flex items-center gap-2">
            <HelpCircle className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <p className="text-sm font-medium">{contextMessage}</p>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className={`sticky top-0 z-10 p-4 rounded-lg border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'} mb-4 backdrop-blur-sm`}>
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder="Search documentation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-10 py-2 rounded-md border ${
              isDarkMode 
                ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500' 
                : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded ${
                isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'
              }`}
            >
              <XIcon className="w-4 h-4" />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Searching for: <span className="font-semibold">{searchQuery}</span>
          </p>
        )}
      </div>

      {/* Page-Specific Documentation */}
      {showPageSpecificDocs && (
        <div className="mb-6">
          <PageSpecificDocumentation
            page={pageParam}
            tab={tabParam}
            globalTab={globalTabParam}
            isDarkMode={isDarkMode}
            highlightText={highlightText}
            matchesSearch={matchesSearch}
            searchQuery={searchQuery}
          />
        </div>
      )}

      {/* Only show general guide sections if no page-specific docs or if explicitly showing general */}
      {(!showPageSpecificDocs || pageParam === 'general') && (
        <>
          {/* Getting Started */}
          <div>
        <SectionHeader
          title="Getting Started"
          icon={Play}
          isExpanded={expandedSections.gettingStarted}
          onClick={() => toggleSection('gettingStarted')}
        />
        {expandedSections.gettingStarted && (
          <div className="mt-4 space-y-4 p-4">
            <StepCard
              number="1"
              title="Access the Dashboard"
              description="Open your web browser and navigate to the Boondock Edge server URL"
              icon={BookOpen}
            >
              <div className={`mt-3 p-3 rounded-md ${isDarkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
                <p className={`text-xs ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                  💡 <strong>Tip:</strong> Bookmark the URL for quick access
                </p>
              </div>
            </StepCard>

            <StepCard
              number="2"
              title="Log In"
              description="Enter your username and password to access the system"
              icon={Users}
            />

            <StepCard
              number="3"
              title="Check Device Status"
              description="Look at the dashboard to see connected devices. Green = Online, Red = Needs Attention"
              icon={Radio}
            >
              <div className={`mt-3 p-3 rounded-md font-mono text-xs ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Device Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Device Offline</span>
                </div>
              </div>
            </StepCard>

            <StepCard
              number="4"
              title="Verify Channels"
              description="Go to Settings → Channels to ensure your audio channels are configured"
              icon={Settings}
            />
          </div>
        )}
      </div>

      {/* How It Works */}
      <div>
        <SectionHeader
          title="How It Works"
          icon={HelpCircle}
          isExpanded={expandedSections.howItWorks}
          onClick={() => toggleSection('howItWorks')}
        />
        {expandedSections.howItWorks && (
          <div className="mt-4 space-y-4 p-4">
            <div className={`p-5 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                System Flow Diagram
              </h4>
              <div className={`p-4 rounded-md font-mono text-xs ${isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
                <pre className="whitespace-pre-wrap">
{`┌─────────────────────────────────────┐
│   Boondock Edge Device              │
│   (Hardware Recorder)               │
│                                     │
│   • Listens for audio               │
│   • Detects audio threshold         │
│   • Records automatically           │
│   • Uploads to server               │
└──────────────┬──────────────────────┘
               │
               │ (WiFi/Network)
               │
               ▼
┌─────────────────────────────────────┐
│   Boondock Edge Server              │
│   (Web Application)                 │
│                                     │
│   • Receives recordings             │
│   • Transcribes audio               │
│   • Stores data                     │
│   • Provides dashboard              │
└─────────────────────────────────────┘`}
                </pre>
              </div>
            </div>

            <div className={`p-5 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Recording Process
              </h4>
              <div className="space-y-3">
                {[
                  { step: 'Device Listens', desc: 'Continuously monitors audio input' },
                  { step: 'Audio Detection', desc: 'When audio exceeds threshold, recording starts' },
                  { step: 'Recording', desc: 'Audio captured and stored locally' },
                  { step: 'Upload', desc: 'Recording automatically uploaded to server' },
                  { step: 'Transcription', desc: 'Server processes audio to create text' },
                  { step: 'Storage', desc: 'Recording and transcript stored in dashboard' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {idx + 1}
                    </div>
                    <div>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.step}</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Common Tasks */}
      <div>
        <SectionHeader
          title="Common Tasks"
          icon={CheckCircle}
          isExpanded={expandedSections.commonTasks}
          onClick={() => toggleSection('commonTasks')}
        />
        {expandedSections.commonTasks && (
          <div className="mt-4 space-y-4 p-4">
            <TaskCard
              title="Find a Specific Recording"
              description="Search through all recordings to find a specific conversation or event"
              icon={Search}
              steps={[
                'Go to the main dashboard',
                'Use the search bar at the top',
                'Enter keywords from the conversation',
                'Review the search results',
                'Click on a result to view details and play audio'
              ]}
            />

            <TaskCard
              title="Monitor a Specific Channel"
              description="Focus on recordings from a single audio source"
              icon={Radio}
              steps={[
                'In the sidebar, find the Channels section',
                'Click on the channel you want to monitor',
                'The dashboard will filter to show only that channel',
                'You\'ll see real-time updates for that channel'
              ]}
            />

            <TaskCard
              title="Review Today's Activity"
              description="View all recordings from the current day"
              icon={BookOpen}
              steps={[
                'On the dashboard, look at the date filter',
                'Select "Today" or click today\'s date',
                'Scroll through the messages list',
                'Use the search bar if you need to find something specific'
              ]}
            />

            <TaskCard
              title="Configure Keyword Alerts"
              description="Set up keywords to highlight important terms in transcripts"
              icon={Settings}
              steps={[
                'Go to Settings → Keywords',
                'Click "Add Keyword"',
                'Enter the keyword you want to monitor',
                'Save the keyword',
                'When this keyword appears, it will be highlighted'
              ]}
            />
          </div>
        )}
      </div>

      {/* Troubleshooting */}
      <div>
        <SectionHeader
          title="Troubleshooting"
          icon={AlertCircle}
          isExpanded={expandedSections.troubleshooting}
          onClick={() => toggleSection('troubleshooting')}
        />
        {expandedSections.troubleshooting && (
          <div className="mt-4 space-y-4 p-4">
            <TroubleshootingCard
              problem="No Recordings Appearing"
              solutions={[
                'Check device status in Settings → Summary',
                'Verify device is online (green indicator)',
                'Check channel configuration in Settings → Channels',
                'Adjust threshold settings if needed'
              ]}
            />

            <TroubleshootingCard
              problem="Recordings Not Transcribing"
              solutions={[
                'Check transcription settings in Settings → Summary',
                'Verify transcription services are enabled',
                'Check audio quality of recordings',
                'Wait a few minutes and refresh - processing may be queued'
              ]}
            />

            <TroubleshootingCard
              problem="Can't Find a Recording"
              solutions={[
                'Expand the date range in filters',
                'Clear channel filters',
                'Try different search terms',
                'Check if recording is still processing'
              ]}
            />

            <TroubleshootingCard
              problem="Device Shows Offline"
              solutions={[
                'Check physical device power and network cables',
                'Verify WiFi/network settings on device',
                'Restart the device if possible',
                'Contact administrator if issue persists'
              ]}
            />
          </div>
        )}
      </div>

      {/* Quick Reference */}
      <div>
        <SectionHeader
          title="Quick Reference"
          icon={BookOpen}
          isExpanded={expandedSections.quickReference}
          onClick={() => toggleSection('quickReference')}
        />
        {expandedSections.quickReference && (
          <div className="mt-4 p-4">
            <div className={`overflow-x-auto rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <table className="min-w-full">
                <thead>
                  <tr className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Action
                    </th>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Location
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {[
                    { action: 'View recordings', location: 'Main Dashboard' },
                    { action: 'Search recordings', location: 'Search bar (top of dashboard)' },
                    { action: 'Configure channels', location: 'Settings → Channels' },
                    { action: 'Manage users', location: 'Settings → Users' },
                    { action: 'View logs', location: 'Settings → Logs' },
                    { action: 'Check device status', location: 'Settings → Summary' },
                    { action: 'Set keywords', location: 'Settings → Keywords' },
                    { action: 'Change settings', location: 'Settings → Global Settings' }
                  ].map((row, idx) => (
                    <tr key={idx} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {row.action}
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {row.location}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={`mt-4 p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Keyboard Shortcuts
              </h4>
              <div className="space-y-2">
                {[
                  { key: 'Ctrl/Cmd + F', action: 'Focus search bar' },
                  { key: 'Esc', action: 'Close modals/dialogs' },
                  { key: 'Arrow Keys', action: 'Navigate through messages (when focused)' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <kbd className={`px-2 py-1 rounded text-xs font-mono ${
                      isDarkMode ? 'bg-gray-900 text-gray-300 border border-gray-700' : 'bg-gray-100 text-gray-800 border border-gray-300'
                    }`}>
                      {item.key}
                    </kbd>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {item.action}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interface Controls & Buttons */}
      <div>
        <SectionHeader
          title="Interface Controls & Buttons"
          icon={Settings}
          isExpanded={expandedSections.interfaceControls}
          onClick={() => toggleSection('interfaceControls')}
        />
        {expandedSections.interfaceControls && (
          <div className="mt-4 space-y-4 p-4">
            {/* Top Bar Controls */}
            <div className={`p-5 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h4 className={`font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <Settings className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                Top Bar Controls
              </h4>
              <div className="space-y-4">
                <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <CheckCheck className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div className="flex-1">
                      <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Select Messages Button</h5>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Toggles multi-select mode. When active, you can select multiple messages for batch operations like delete, download, or tag. Click again to exit select mode.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <FileText className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div className="flex-1">
                      <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Incident Reports Button</h5>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Opens the Incident Reports page where you can view, create, and manage incident reports based on recordings.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <Filter className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div className="flex-1">
                      <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Filter Button</h5>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Opens the filter panel to set custom date ranges, time ranges, and other filtering options. Use this to narrow down recordings by specific time periods.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <Eye className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div className="flex-1">
                      <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>View Settings Button</h5>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Opens view customization options. Toggle visibility of time, car/unit, channel, and person fields. Adjust timestamp display format and other view preferences.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <Settings className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div className="flex-1">
                      <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Settings Button</h5>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Opens the Settings page (admin only). Access system configuration, channel management, user management, keywords, and other administrative functions.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    {isDarkMode ? (
                      <Sun className={`w-5 h-5 mt-0.5 flex-shrink-0 text-yellow-400`} />
                    ) : (
                      <Moon className={`w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600`} />
                    )}
                    <div className="flex-1">
                      <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Theme Toggle Button</h5>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Switches between light and dark mode. Your preference is saved and will persist across sessions.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <Clock className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div className="flex-1">
                      <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>System Clock</h5>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Displays the current system time and timezone. Click to adjust system time (admin only). Shows timezone abbreviation below the time.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Controls */}
            <div className={`p-5 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h4 className={`font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <Radio className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                Sidebar Controls
              </h4>
              <div className="space-y-4">
                <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <Search className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div className="flex-1">
                      <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Search Bar</h5>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Search through all recordings by typing keywords, phrases, or any text from transcripts. Results update in real-time as you type.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <Radio className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div className="flex-1">
                      <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Channel Toggle</h5>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Click a channel name to toggle it on/off. Active channels show recordings, inactive channels are hidden. Each channel has a color indicator and message count.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <Settings className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div className="flex-1">
                      <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Channel Settings Icon</h5>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Click the settings icon next to a channel to configure its name, color, and other properties. Opens a modal with channel configuration options.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <Tag className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div className="flex-1">
                      <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Keyword Toggle</h5>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Click a keyword to highlight it in all recordings. Active keywords are highlighted in the transcript text. Shows count of occurrences next to each keyword.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <BookOpen className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div className="flex-1">
                      <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Documentation Button</h5>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Opens the user guide documentation in a new tab. Contains detailed instructions, troubleshooting, and reference information.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Message Card Controls */}
            <div className={`p-5 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h4 className={`font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <MessageSquare className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                Message Card Controls
              </h4>
              <div className="space-y-4">
                <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <Play className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div className="flex-1">
                      <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Play/Pause Audio Button</h5>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Click to play the audio recording. Click again to pause. The button changes to a pause icon when playing. Only one audio can play at a time.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <Volume2 className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div className="flex-1">
                      <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Expand Audio Player</h5>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Click the audio icon or waveform to expand the audio player. Shows playback controls, timeline, speed controls, and waveform visualization.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <Trash2 className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                    <div className="flex-1">
                      <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Delete Button</h5>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Permanently deletes the recording and transcript. Requires confirmation. Only available if you have delete permissions. Cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <Tag className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div className="flex-1">
                      <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Tag Button</h5>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Add or manage tags for the recording. Tags help categorize and organize recordings. Click to view existing tags or add new ones.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <FileText className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div className="flex-1">
                      <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Incident Report Button</h5>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Create an incident report from this recording. Opens a modal to fill in incident details, add notes, and save the report.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <Download className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div className="flex-1">
                      <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Download Button</h5>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Downloads the audio file to your computer. In multi-select mode, you can download multiple recordings as a ZIP file.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <ExternalLink className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div className="flex-1">
                      <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Advanced Player Button</h5>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Opens the advanced audio player in a new page with enhanced controls, waveform analysis, and playback features.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div className="flex-1">
                      <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Message Checkbox (Multi-Select Mode)</h5>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        In multi-select mode, checkboxes appear on messages. Select multiple messages to perform batch operations like delete, download, or tag.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Audio Player Controls */}
            <div className={`p-5 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h4 className={`font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <Volume2 className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                Audio Player Controls
              </h4>
              <div className="space-y-4">
                <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <Play className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div className="flex-1">
                      <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Play/Pause</h5>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Main playback control. Toggles between playing and pausing the audio.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <SkipBack className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div className="flex-1">
                      <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Skip Backward</h5>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Jumps backward by a set interval (typically 10 seconds). Useful for replaying missed audio.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <SkipForward className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div className="flex-1">
                      <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Skip Forward</h5>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Jumps forward by a set interval (typically 10 seconds). Useful for skipping ahead.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <ArrowUpDown className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div className="flex-1">
                      <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Playback Speed Control</h5>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Adjust playback speed (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x). Useful for faster review or detailed analysis.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <div className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'bg-blue-400' : 'bg-blue-600'} rounded`}></div>
                    <div className="flex-1">
                      <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Progress Timeline</h5>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Click anywhere on the timeline to jump to that position in the audio. Shows current time and total duration.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <Volume2 className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div className="flex-1">
                      <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Volume Control</h5>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Adjust audio volume using the volume slider. Mute/unmute with the volume icon.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter & View Controls */}
            <div className={`p-5 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h4 className={`font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <Filter className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                Filter & View Controls
              </h4>
              <div className="space-y-4">
                <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <Clock className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div className="flex-1">
                      <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Time Filter Dropdown</h5>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Quick time filters: All, Last 30 mins, Last 1 hour, Last 2 hours, Last 4 hours, Last 8 hours, Last 1 Day, Last 2 Days, Last Week. Select a preset to filter recordings.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <Calendar className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div className="flex-1">
                      <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Custom Date Range</h5>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        In the filter panel, set start and end dates to view recordings within a specific date range. Can also set custom time ranges.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <ArrowUpDown className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div className="flex-1">
                      <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Sort Order Toggle</h5>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Toggle between ascending (oldest first) and descending (newest first) sort order. Located in pagination footer or view settings.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <Eye className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div className="flex-1">
                      <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>View Toggles</h5>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        In View Settings: Toggle visibility of Time, Car/Unit, Channel, and Person fields. Show/hide full timestamps. Customize what information is displayed on each message card.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className={`p-5 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h4 className={`font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <ArrowRight className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                Pagination Controls
              </h4>
              <div className="space-y-4">
                <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <ChevronLeft className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div className="flex-1">
                      <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Previous Page</h5>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Navigate to the previous page of results. Disabled when on the first page.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <ChevronRight className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div className="flex-1">
                      <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Next Page</h5>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Navigate to the next page of results. Disabled when on the last page.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <div className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'bg-blue-400' : 'bg-blue-600'} rounded`}></div>
                    <div className="flex-1">
                      <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Records Per Page</h5>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Dropdown to select how many messages to display per page (10, 20, 50, 100). Your preference is saved.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <div className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'bg-blue-400' : 'bg-blue-600'} rounded`}></div>
                    <div className="flex-1">
                      <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Page Number Input</h5>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Type a page number to jump directly to that page. Shows current page and total pages.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Best Practices */}
      <div>
        <SectionHeader
          title="Best Practices & Tips"
          icon={Lightbulb}
          isExpanded={expandedSections.bestPractices}
          onClick={() => toggleSection('bestPractices')}
        />
        {expandedSections.bestPractices && (
          <div className="mt-4 space-y-4 p-4">
            <div className={`p-5 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h4 className={`font-semibold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <CheckCircle className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                Optimizing Recording Quality
              </h4>
              <ul className="space-y-2 ml-7">
                <li className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <strong>Set Appropriate Threshold:</strong> Too high may miss quiet audio, too low may record background noise
                </li>
                <li className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <strong>Monitor Channel Status:</strong> Regularly check that channels show as "Active"
                </li>
                <li className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <strong>Use Keywords Effectively:</strong> Add common terms you search for as keywords
                </li>
                <li className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <strong>Regular Maintenance:</strong> Check device status weekly and review system logs
                </li>
              </ul>
            </div>

            <div className={`p-5 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h4 className={`font-semibold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <Lightbulb className={`w-5 h-5 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                Daily Operations
              </h4>
              <ul className="space-y-2 ml-7">
                <li className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  ✅ Check the dashboard daily for new recordings
                </li>
                <li className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  ✅ Configure keywords for important terms
                </li>
                <li className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  ✅ Use date ranges to focus on specific time periods
                </li>
                <li className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  ✅ Name channels clearly for easy identification
                </li>
                <li className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  ✅ Only grant necessary access levels to users
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
};

export default InteractiveUserGuide;
