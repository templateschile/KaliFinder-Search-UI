import WidgetEmbed from './components/WidgetEmbed';
import WidgetTrigger from './components/WidgetTrigger';
import { LanguageProvider } from './contexts/LanguageContext';

export default function App() {
  // For dev/testing: show embedded widget pattern with trigger button
  const handleTriggerClick = () => {
    // Dispatch the kalifinder:open event to open the widget
    const event = new CustomEvent('kalifinder:open', { detail: { query: '' } });
    window.dispatchEvent(event);
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Development hint banner */}
        <div className="fixed top-0 right-0 left-0 z-50 bg-blue-600 px-4 py-2 text-center text-sm text-white">
          🧪 <strong>Development Mode</strong> - Click the search icon in the top-right to test the
          widget
        </div>

        {/* Search trigger button */}
        <div className="fixed top-16 right-8 z-40">
          <WidgetTrigger onClick={handleTriggerClick} storeUrl="https://localhost:8080" />
        </div>

        {/* Widget embed (opens when triggered) */}
        <WidgetEmbed storeUrl="https://localhost:8080" />

        {/* Demo content to test widget overlay */}
        <div className="mx-auto max-w-4xl px-8 pt-24">
          <h1 className="mb-4 text-3xl font-bold">KaliFinder Search Widget - Local Testing</h1>
          <p className="mb-4 text-gray-600">
            This is a development environment to test the embeddable search widget.
          </p>
          <div className="mb-4 rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-xl font-semibold">How to Test:</h2>
            <ol className="list-inside list-decimal space-y-2 text-gray-700">
              <li>Click the search icon in the top-right corner</li>
              <li>The search widget modal will open</li>
              <li>Type to search for products</li>
              <li>Test filters, autocomplete, and product cards</li>
              <li>Click outside the modal or the X button to close</li>
            </ol>
          </div>
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Make sure your backend API is running at{' '}
              <code className="rounded bg-yellow-100 px-2 py-1">
                {import.meta.env.VITE_BACKEND_URL || 'https://api.kalifinder.com'}
              </code>
            </p>
          </div>
        </div>
      </div>
    </LanguageProvider>
  );
}
