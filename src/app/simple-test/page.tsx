export default function SimpleTestPage() {
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-blue-900 mb-4">
          🧪 SIMPLE TEST PAGE
        </h1>
        <p className="text-gray-700 mb-4">
          This is a basic page to test if the application loads without any database calls.
        </p>
        <div className="space-y-2">
          <p><strong>Status:</strong> ✅ Page Loading Works</p>
          <p><strong>Time:</strong> {new Date().toLocaleString()}</p>
        </div>
        <div className="mt-6 space-y-2">
          <a 
            href="/api/simple-test" 
            className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            target="_blank"
          >
            🔗 Test Simple API
          </a>
          <a 
            href="/health-check" 
            className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            🏥 Full Health Check
          </a>
          <a 
            href="/signin" 
            className="block w-full text-center px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            🔐 Try Login Page
          </a>
        </div>
      </div>
    </div>
  );
}