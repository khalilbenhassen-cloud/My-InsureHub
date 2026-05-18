import { useState } from 'react';

interface LanguageToggleProps {
  onLanguageChange: (language: string) => void;
  initialLanguage?: string;
}

export function LanguageToggle({ onLanguageChange, initialLanguage = 'English' }: LanguageToggleProps) {
  const [language, setLanguage] = useState<string>(initialLanguage);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    onLanguageChange(lang);
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-400">Language:</span>
      <div className="flex items-center space-x-1">
        <button
          onClick={() => handleLanguageChange('English')}
          className={`px-3 py-1 rounded text-sm font-medium ${
            language === 'English'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          English
        </button>
        <button
          onClick={() => handleLanguageChange('French')}
          className={`px-3 py-1 rounded text-sm font-medium ${
            language === 'French'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Français
        </button>
      </div>
    </div>
  );
}