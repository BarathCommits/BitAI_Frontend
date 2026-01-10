/**
 * TypeScript interfaces for SDK data
 */

export interface SDKLanguage {
  id: string;
  name: string;
  icon: string;
  official: boolean;
  tier: number;
  popularity: number;
  rating: number;
  bestFor: string[];
  install: {
    command: string;
    package: string;
    manager: string;
  };
  quickStart: {
    import: string;
    initialize: string;
    example: string;
  };
  features: string[];
  docs: {
    quickStart: string;
    apiReference: string;
    examples: string;
    github: string;
  };
  codeExamples: Array<{
    title: string;
    code: string;
  }>;
}

export interface SDKData {
  version: string;
  lastUpdated: string;
  languages: SDKLanguage[];
}




