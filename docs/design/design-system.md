# SafeBrowser Design System

## 🎨 Design Philosophy

SafeBrowser follows a **Web3-native design approach** that combines the familiarity of traditional browsers with the innovation of decentralized applications. Our design system prioritizes:

- **Security First**: Clear visual indicators for safe/unsafe actions
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Optimized for fast loading and smooth interactions
- **Web3 Integration**: Seamless wallet and dApp interactions

## 🎯 Design Principles

### 1. **Trust & Security**
- Clear visual hierarchy for security-critical actions
- Consistent color coding for transaction states
- Prominent wallet connection indicators
- Transparent AI provider status

### 2. **Simplicity & Clarity**
- Minimal cognitive load for complex Web3 operations
- Progressive disclosure of advanced features
- Clear navigation patterns
- Intuitive iconography

### 3. **Web3 Native**
- Wallet-first design approach
- Chain-agnostic interface
- Real-time blockchain data visualization
- dApp-centric user flows

## 🎨 Color Palette

### **Primary Colors**
```css
:root {
  /* Primary Blue - Trust, Technology */
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-200: #bfdbfe;
  --primary-300: #93c5fd;
  --primary-400: #60a5fa;
  --primary-500: #3b82f6;  /* Main brand color */
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  --primary-800: #1e40af;
  --primary-900: #1e3a8a;

  /* Secondary Gray - Neutral, Professional */
  --secondary-50: #f8fafc;
  --secondary-100: #f1f5f9;
  --secondary-200: #e2e8f0;
  --secondary-300: #cbd5e1;
  --secondary-400: #94a3b8;
  --secondary-500: #64748b;
  --secondary-600: #475569;
  --secondary-700: #334155;
  --secondary-800: #1e293b;
  --secondary-900: #0f172a;

  /* Accent Green - Success, Growth */
  --accent-50: #f0fdf4;
  --accent-100: #dcfce7;
  --accent-200: #bbf7d0;
  --accent-300: #86efac;
  --accent-400: #4ade80;
  --accent-500: #22c55e;
  --accent-600: #16a34a;
  --accent-700: #15803d;
  --accent-800: #166534;
  --accent-900: #14532d;
}
```

### **Semantic Colors**
```css
:root {
  /* Success - Transactions, Confirmations */
  --success-50: #f0fdf4;
  --success-500: #22c55e;
  --success-600: #16a34a;

  /* Warning - Pending, Caution */
  --warning-50: #fffbeb;
  --warning-500: #f59e0b;
  --warning-600: #d97706;

  /* Error - Failures, Rejections */
  --error-50: #fef2f2;
  --error-500: #ef4444;
  --error-600: #dc2626;

  /* Info - Notifications, Tips */
  --info-50: #eff6ff;
  --info-500: #3b82f6;
  --info-600: #2563eb;
}
```

### **Web3 Specific Colors**
```css
:root {
  /* Ethereum */
  --ethereum: #627eea;
  
  /* Polygon */
  --polygon: #8247e5;
  
  /* BSC */
  --bsc: #f0b90b;
  
  /* Arbitrum */
  --arbitrum: #28a0f0;
  
  /* Optimism */
  --optimism: #ff0420;
  
  /* Wallet Colors */
  --metamask: #f6851b;
  --coinbase: #0052ff;
  --walletconnect: #3b99fc;
}
```

## 📝 Typography

### **Font Stack**
```css
:root {
  /* Primary Font - Inter (Modern, Readable) */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  
  /* Monospace Font - JetBrains Mono (Code, Addresses) */
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

### **Type Scale**
```css
:root {
  /* Headings */
  --text-4xl: 2.25rem;    /* 36px - Page titles */
  --text-3xl: 1.875rem;   /* 30px - Section headers */
  --text-2xl: 1.5rem;     /* 24px - Card titles */
  --text-xl: 1.25rem;     /* 20px - Subsection headers */
  --text-lg: 1.125rem;    /* 18px - Large body text */
  
  /* Body Text */
  --text-base: 1rem;      /* 16px - Default body */
  --text-sm: 0.875rem;    /* 14px - Small text */
  --text-xs: 0.75rem;     /* 12px - Captions, labels */
  
  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
}
```

## 🎭 Component Design Patterns

### **1. Cards**
```css
.card {
  @apply bg-white rounded-lg border border-secondary-200 shadow-sm;
  @apply hover:shadow-md transition-shadow duration-200;
}

.card-header {
  @apply px-6 py-4 border-b border-secondary-200;
}

.card-content {
  @apply px-6 py-4;
}

.card-footer {
  @apply px-6 py-4 border-t border-secondary-200 bg-secondary-50;
}
```

### **2. Buttons**
```css
.btn {
  @apply inline-flex items-center justify-center rounded-md font-medium;
  @apply transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-primary {
  @apply bg-primary-600 text-white hover:bg-primary-700;
  @apply focus:ring-primary-500;
}

.btn-secondary {
  @apply bg-secondary-100 text-secondary-900 hover:bg-secondary-200;
  @apply focus:ring-secondary-500;
}

.btn-outline {
  @apply border border-secondary-300 bg-transparent hover:bg-secondary-50;
  @apply focus:ring-secondary-500;
}

.btn-ghost {
  @apply hover:bg-secondary-100 hover:text-secondary-900;
  @apply focus:ring-secondary-500;
}
```

### **3. Form Elements**
```css
.input {
  @apply w-full px-3 py-2 border border-secondary-300 rounded-md;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent;
  @apply disabled:bg-secondary-50 disabled:cursor-not-allowed;
}

.textarea {
  @apply w-full px-3 py-2 border border-secondary-300 rounded-md resize-none;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent;
}

.select {
  @apply w-full px-3 py-2 border border-secondary-300 rounded-md;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent;
}
```

## 🎨 Web3 Specific Components

### **1. Wallet Connection States**
```css
.wallet-connected {
  @apply bg-success-50 border border-success-200 text-success-800;
}

.wallet-disconnected {
  @apply bg-secondary-50 border border-secondary-200 text-secondary-600;
}

.wallet-pending {
  @apply bg-warning-50 border border-warning-200 text-warning-800;
}

.wallet-error {
  @apply bg-error-50 border border-error-200 text-error-800;
}
```

### **2. Transaction States**
```css
.tx-pending {
  @apply bg-warning-50 text-warning-800;
}

.tx-confirmed {
  @apply bg-success-50 text-success-800;
}

.tx-failed {
  @apply bg-error-50 text-error-800;
}
```

### **3. Chain Indicators**
```css
.chain-ethereum {
  @apply bg-ethereum text-white;
}

.chain-polygon {
  @apply bg-polygon text-white;
}

.chain-bsc {
  @apply bg-bsc text-black;
}
```

## 📱 Responsive Design

### **Breakpoints**
```css
:root {
  --breakpoint-sm: 640px;   /* Mobile landscape */
  --breakpoint-md: 768px;   /* Tablet */
  --breakpoint-lg: 1024px;  /* Desktop */
  --breakpoint-xl: 1280px;  /* Large desktop */
  --breakpoint-2xl: 1536px; /* Extra large */
}
```

### **Grid System**
```css
.container {
  @apply mx-auto px-4;
  max-width: 1280px;
}

.grid {
  @apply grid gap-4;
}

.grid-cols-1 { @apply grid-cols-1; }
.grid-cols-2 { @apply grid-cols-2; }
.grid-cols-3 { @apply grid-cols-3; }
.grid-cols-4 { @apply grid-cols-4; }

@media (min-width: 768px) {
  .md\:grid-cols-2 { @apply grid-cols-2; }
  .md\:grid-cols-3 { @apply grid-cols-3; }
  .md\:grid-cols-4 { @apply grid-cols-4; }
}
```

## 🎭 Animation & Transitions

### **Transition Classes**
```css
.transition-fast {
  @apply transition-all duration-150 ease-in-out;
}

.transition-normal {
  @apply transition-all duration-300 ease-in-out;
}

.transition-slow {
  @apply transition-all duration-500 ease-in-out;
}
```

### **Hover Effects**
```css
.hover-lift {
  @apply hover:-translate-y-1 hover:shadow-lg transition-all duration-200;
}

.hover-glow {
  @apply hover:shadow-glow transition-shadow duration-200;
}

.hover-scale {
  @apply hover:scale-105 transition-transform duration-200;
}
```

## 🔍 Accessibility

### **Focus States**
```css
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
}

.focus-ring-inset {
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset;
}
```

### **Screen Reader Support**
```css
.sr-only {
  @apply absolute w-px h-px p-0 -m-px overflow-hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

## 🎨 Icon System

### **Icon Sizes**
```css
.icon-xs { @apply w-3 h-3; }   /* 12px */
.icon-sm { @apply w-4 h-4; }   /* 16px */
.icon-md { @apply w-5 h-5; }   /* 20px */
.icon-lg { @apply w-6 h-6; }   /* 24px */
.icon-xl { @apply w-8 h-8; }   /* 32px */
.icon-2xl { @apply w-12 h-12; } /* 48px */
```

### **Icon Colors**
```css
.icon-primary { @apply text-primary-600; }
.icon-secondary { @apply text-secondary-600; }
.icon-success { @apply text-success-600; }
.icon-warning { @apply text-warning-600; }
.icon-error { @apply text-error-600; }
```

## 🎯 Component Variants

### **Size Variants**
```css
.size-sm {
  @apply px-3 py-1.5 text-sm;
}

.size-md {
  @apply px-4 py-2 text-base;
}

.size-lg {
  @apply px-6 py-3 text-lg;
}
```

### **Variant Combinations**
```css
.btn-primary-sm {
  @apply btn btn-primary size-sm;
}

.btn-secondary-lg {
  @apply btn btn-secondary size-lg;
}

.card-elevated {
  @apply card shadow-lg hover:shadow-xl;
}

.card-flat {
  @apply card shadow-none border-2;
}
```

This design system provides a comprehensive foundation for building the SafeBrowser UI with consistent, accessible, and Web3-native design patterns.
