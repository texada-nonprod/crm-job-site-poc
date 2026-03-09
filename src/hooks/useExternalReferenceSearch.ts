import { useState, useEffect, useRef } from 'react';

export interface ExternalReferenceResult {
  source: string;
  name: string;
  url: string;
}

// Mock dataset simulating API responses from Dodge Data & Analytics and IIR PEC Reports
const MOCK_EXTERNAL_REFERENCES: ExternalReferenceResult[] = [
  { source: 'Dodge Data & Analytics', name: "St. Mary's Hospital West Wing Expansion", url: 'https://www.construction.com/projects/5001010/st-marys-hospital-west-wing-expansion' },
  { source: 'Dodge Data & Analytics', name: "St. Mary's Medical Center South Tower Renovation", url: 'https://www.construction.com/projects/5001011/st-marys-south-tower' },
  { source: 'Dodge Data & Analytics', name: 'Riverfront Stadium Renovation Phase 2', url: 'https://www.construction.com/projects/5001020/riverfront-stadium-renovation' },
  { source: 'Dodge Data & Analytics', name: 'Chicago Midway Terminal Expansion', url: 'https://www.construction.com/projects/5001030/midway-terminal' },
  { source: 'Dodge Data & Analytics', name: 'Lake Shore Drive Bridge Reconstruction', url: 'https://www.construction.com/projects/5001040/lsd-bridge' },
  { source: 'Dodge Data & Analytics', name: 'Northwestern University Research Complex', url: 'https://www.construction.com/projects/5001050/northwestern-research' },
  { source: 'Dodge Data & Analytics', name: 'I-55 Highway Resurfacing Project', url: 'https://www.construction.com/projects/5001060/i55-resurfacing' },
  { source: 'IIR PEC Reports', name: 'St. Mary\'s Medical Center - Cardiology Wing', url: 'https://pecreports.com/projects/IIR-8821-stmarys-cardio' },
  { source: 'IIR PEC Reports', name: 'Chicago Public Schools - Lincoln Elementary Renovation', url: 'https://pecreports.com/projects/IIR-8822-cps-lincoln' },
  { source: 'IIR PEC Reports', name: 'Riverfront Mixed-Use Development', url: 'https://pecreports.com/projects/IIR-8823-riverfront-mixed' },
  { source: 'IIR PEC Reports', name: 'O\'Hare International Airport Terminal 5 Modernization', url: 'https://pecreports.com/projects/IIR-8824-ohare-t5' },
  { source: 'IIR PEC Reports', name: 'Illinois Tollway I-294 Central Tri-State Reconstruction', url: 'https://pecreports.com/projects/IIR-8825-tollway-294' },
  { source: 'IIR PEC Reports', name: 'Navy Pier East End Redevelopment', url: 'https://pecreports.com/projects/IIR-8826-navy-pier' },
  { source: 'IIR PEC Reports', name: 'University of Illinois Medical District Expansion', url: 'https://pecreports.com/projects/IIR-8827-uic-medical' },
];

export const useExternalReferenceSearch = (query: string) => {
  const [results, setResults] = useState<ExternalReferenceResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Don't search if query is too short
    if (query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    // Show loading immediately
    setIsLoading(true);

    // Debounce: wait 300ms after user stops typing
    timeoutRef.current = setTimeout(() => {
      // Simulate API call with 400ms delay
      setTimeout(() => {
        const lowerQuery = query.toLowerCase();
        const filtered = MOCK_EXTERNAL_REFERENCES.filter(ref =>
          ref.name.toLowerCase().includes(lowerQuery) ||
          ref.source.toLowerCase().includes(lowerQuery)
        );
        setResults(filtered);
        setIsLoading(false);
      }, 400);
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query]);

  return { results, isLoading };
};
