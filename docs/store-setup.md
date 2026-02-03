# Store Setup Service Documentation

## Overview

The Store Setup Service automatically fetches store configuration from `/wp-json/kalifinder/v1/store-setup` on the same site where the widget is running. This allows the widget to automatically use the store's configured language and other settings.

## How It Works

1. **Automatic Detection**: When the widget initializes, it fetches the store setup data from the same domain
2. **Language Priority**:
   - First priority: Explicit language passed to `init()` function
   - Second priority: Language from store setup API
   - Fallback: English (`'en'`)
3. **Caching**: Results are cached for 5 minutes to improve performance

## JSON File Structure

Create a file at `wp-content/uploads/kalifinder/store-setup-data.json`:

```json
{
  "success": true,
  "data": {
    "language": "es", // Required: Store language code (e.g., "en", "es", "fr")
    "currency": "EUR", // Optional: Store currency code
    "storeName": "Mi Tienda", // Optional: Store name
    "locale": "es-ES", // Optional: Store locale for formatting
    "timezone": "Europe/Madrid" // Optional: Store timezone
  }
}
```

## Usage Examples

### Basic Usage (Automatic Language Detection)

```javascript
window.KalifinderSearch.init({
  storeUrl: 'https://mystore.com',
  // Language will be automatically fetched from store-setup-data.json
});
```

### Override Store Language

```javascript
window.KalifinderSearch.init({
  storeUrl: 'https://mystore.com',
  language: 'en', // This overrides the store language
});
```

## Error Handling

- If the JSON file doesn't exist or fails to load, the widget falls back to:
  - Language: `'en'` (English)
  - Currency: Determined from product data or defaults to '€'
- Errors are logged to console in debug mode
- The widget continues to function normally

## Caching Behavior

- Store setup data is cached in localStorage for 5 minutes
- Cache key: `kalifinder-store-setup`
- Automatic cache refresh after timeout

## Development Testing

For local development, you can create test files:

```javascript
// In your local development server
// Create: public/wp-content/uploads/kalifinder/store-setup-data.json
{
  "success": true,
  "data": {
    "language": "es",
    "currency": "EUR"
  }
}
```

## Supported Language Codes

- `"en"` - English
- `"es"` - Spanish
- Add more languages by extending the locale files in `src/locales/`

## File Locations

- **Service**: `src/services/store-setup.service.ts`
- **Types**: `src/types/store-setup.types.ts`
- **Integration**: `src/embed/bootstrap.tsx`
