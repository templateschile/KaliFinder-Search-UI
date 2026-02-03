import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export const LanguageSelector: React.FC = () => {
  const { supportedLanguages, currentLanguage, changeLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
          />
        </svg>
        {supportedLanguages[currentLanguage]}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(supportedLanguages).map(([code, name]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => changeLanguage(code as keyof typeof supportedLanguages)}
            className={currentLanguage === code ? 'bg-purple-50 text-purple-700' : ''}
          >
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
