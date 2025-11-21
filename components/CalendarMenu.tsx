
import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Download } from 'lucide-react';

interface CalendarMenuProps {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  buttonClass?: string;
  iconClass?: string;
}

export const CalendarMenu: React.FC<CalendarMenuProps> = ({ 
  title, 
  description, 
  startDate, 
  endDate, 
  location = '',
  buttonClass = "text-gray-400 hover:text-indigo-400 p-1 rounded-md hover:bg-indigo-900/20",
  iconClass = "w-4 h-4"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatISO = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");

  const generateUrls = () => {
    const start = formatISO(startDate);
    const end = formatISO(endDate);
    const text = encodeURIComponent(title);
    const details = encodeURIComponent(description);
    const loc = encodeURIComponent(location);

    return {
      google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&dates=${start}/${end}&location=${loc}`,
      outlook: `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}&subject=${text}&body=${details}&location=${loc}`,
      yahoo: `https://calendar.yahoo.com/?v=60&view=d&type=20&title=${text}&st=${start}&et=${end}&desc=${details}&in_loc=${loc}`,
    };
  };

  const handleDownloadICS = () => {
    // Basic iCal format
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
URL:${document.location.href}
DTSTART:${formatISO(startDate)}
DTEND:${formatISO(endDate)}
SUMMARY:${title}
DESCRIPTION:${description.replace(/\n/g, '\\n')}
LOCATION:${location}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsOpen(false);
  };

  const openUrl = (url: string) => {
    window.open(url, '_blank');
    setIsOpen(false);
  };

  const urls = generateUrls();

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClass}
        title="Add to Calendar"
      >
        <Calendar className={iconClass} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-gray-900 border-2 border-black shadow-[4px_4px_0px_0px_#000] z-50 animate-fade-in-up origin-top-right">
          <div className="px-4 py-3 bg-white border-b-2 border-black text-xs font-black text-black uppercase tracking-wider">
            Sync Event
          </div>
          <div className="p-1">
            <button
              onClick={() => openUrl(urls.google)}
              className="flex items-center w-full px-4 py-2 text-xs font-bold font-mono uppercase text-gray-300 hover:bg-indigo-600 hover:text-white transition-colors border border-transparent hover:border-black"
            >
              Google Calendar
            </button>
            <button
              onClick={() => openUrl(urls.outlook)}
              className="flex items-center w-full px-4 py-2 text-xs font-bold font-mono uppercase text-gray-300 hover:bg-blue-600 hover:text-white transition-colors border border-transparent hover:border-black"
            >
              Outlook
            </button>
            <button
              onClick={() => openUrl(urls.yahoo)}
              className="flex items-center w-full px-4 py-2 text-xs font-bold font-mono uppercase text-gray-300 hover:bg-purple-600 hover:text-white transition-colors border border-transparent hover:border-black"
            >
              Yahoo
            </button>
            <div className="h-px bg-gray-700 my-1 mx-2"></div>
            <button
              onClick={handleDownloadICS}
              className="flex items-center w-full px-4 py-2 text-xs font-bold font-mono uppercase text-gray-300 hover:bg-gray-700 hover:text-white transition-colors border border-transparent hover:border-black"
            >
              <Download className="w-3 h-3 mr-2" />
              Download .ICS
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
