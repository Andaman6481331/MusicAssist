# Theme System Documentation

## Overview
The application now has a dynamic color theme system that allows users to switch between 6 different color themes. The theme is persisted in localStorage so it persists across browser sessions.

## Available Themes

1. **Ocean Blue** (Default)
   - Primary: #1a58b0
   - Secondary: #1da1f2
   - Accent: #4489f9

2. **Sunset Orange**
   - Primary: #d97706
   - Secondary: #f97316
   - Accent: #fb923c

3. **Midnight Purple**
   - Primary: #7c3aed
   - Secondary: #a78bfa
   - Accent: #c084fc

4. **Forest Green**
   - Primary: #059669
   - Secondary: #10b981
   - Accent: #34d399

5. **Rose Pink**
   - Primary: #e11d48
   - Secondary: #f43f5e
   - Accent: #fb7185

6. **Deep Teal**
   - Primary: #0d9488
   - Secondary: #14b8a6
   - Accent: #2dd4bf

## How It Works

### Architecture
1. **ThemeContext.tsx** - Provides the theme context and manages theme state
2. **ThemeToggle.tsx** - UI component for theme selection in the navbar
3. **ThemeToggle.css** - Styling for the theme toggle button and popup
4. **based.css** - Updated to use CSS custom properties (variables) for colors

### CSS Variables
The application uses CSS custom properties defined in `:root` selector:
- `--primary-color` - Main brand color
- `--secondary-color` - Secondary accent color
- `--accent-color` - Call-to-action and highlight color
- `--gradient-1` - Dark gradient stop
- `--gradient-2` - Medium gradient stop
- `--dark-color` - Dark background color

### How to Add a New Theme
1. Edit `ThemeContext.tsx`
2. Add a new entry to the `themes` object:
```typescript
  myNewTheme: {
    name: 'My Theme Name',
    primary: '#color1',
    secondary: '#color2',
    accent: '#color3',
    gradient1: '#darkColor',
    gradient2: '#mediumColor',
    dark: '#darkestColor',
  }
```

### How Themes Are Applied
1. User clicks the 🎨 palette button in the navigation bar
2. A popup appears showing all 6 theme options
3. User selects a theme
4. `setTheme()` is called which:
   - Updates the theme context state
   - Sets CSS variables on the document root
   - Saves the selection to localStorage
5. All elements using `var(--primary-color)` etc. automatically update

### Using the Theme in Components
To use the theme in custom components:
```typescript
import { useTheme } from '../ThemeContext';

const MyComponent = () => {
  const { theme, themeName, setTheme } = useTheme();
  
  // Access theme colors
  console.log(theme.primary);
  console.log(theme.accent);
  
  return <div style={{ backgroundColor: theme.primary }}>...</div>;
};
```

### CSS Variables in Stylesheets
Use CSS variables in any stylesheet:
```css
.my-element {
  background: linear-gradient(135deg, var(--gradient-1), var(--primary-color));
  color: white;
  border: 2px solid var(--accent-color);
}
```

## Browser Compatibility
- Modern browsers support CSS custom properties
- localStorage is used for persistence
- Fallback to default (Ocean Blue) if localStorage is unavailable

## Files Modified
- `App.tsx` - Wrapped with ThemeProvider and added ThemeToggle
- `App.css` - Updated navbar to use CSS variables
- `based.css` - Added CSS variables and updated all color references
- `ThemeContext.tsx` - New file (theme state management)
- `component/ThemeToggle.tsx` - New file (UI component)
- `component/ThemeToggle.css` - New file (styling)
