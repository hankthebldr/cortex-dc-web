'use client';

import { useEffect, useState } from 'react';
import { getClients, isUsingEmulators } from '../src/lib/firebase/client';
import { observeAuthUser, type AuthUser } from '../src/lib/firebase/auth';

export default function HomePage() {
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Initialize Firebase
      const { app } = getClients();
      setFirebaseReady(true);
      console.log('🔥 Firebase initialized successfully');
      
      // Listen to auth changes
      const unsubscribe = observeAuthUser((authUser) => {
        setUser(authUser);
        console.log('👤 Auth user:', authUser);
      });
      
      return unsubscribe;
    } catch (err) {
      console.error('❌ Firebase initialization error:', err);
      setError(err instanceof Error ? err.message : 'Firebase initialization failed');
    }
  }, []);

  const usingEmulators = isUsingEmulators();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50" data-testid="homepage-root">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Cortex DC Web
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Domain Consultant Platform - Accelerate Deal Cycles
              </p>
            </div>
            <div className="flex gap-3">
              <span 
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  usingEmulators 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}
                data-testid="firebase-status-badge"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {usingEmulators ? 'Emulator Running' : 'Production Mode'}
              </span>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Get Started
              </button>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div 
            className={`bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 ${
              firebaseReady ? 'border-l-green-500' : 'border-l-red-500'
            }`}
            data-testid="firebase-status-card"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Firebase Status</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="firebase-status-text">
                    {error ? 'Error' : firebaseReady ? 'Ready' : 'Loading'}
                  </p>
                  <p className={`text-xs ${
                    error ? 'text-red-600' : 
                    usingEmulators ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {error ? error : usingEmulators ? 'Emulators active' : 'Production mode'}
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-orange-500">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Services</p>
                  <p className="text-2xl font-bold text-gray-900">8</p>
                  <p className="text-xs text-orange-600">Available</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-green-500">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Components</p>
                  <p className="text-2xl font-bold text-gray-900">Built</p>
                  <p className="text-xs text-green-600">UI System Ready</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-purple-500">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Database</p>
                  <p className="text-2xl font-bold text-gray-900">Ready</p>
                  <p className="text-xs text-purple-600">Schema deployed</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Development Instructions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Development Environment Ready
          </h2>
          <p className="text-gray-600 mb-6">
            Your Firebase emulator environment is running. You can now edit static content, 
            modify the database schema, and test Firebase Functions locally.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">🎨 Static Content</h4>
              <p className="text-sm text-gray-600 mb-2">
                Edit files in <code className="bg-white px-2 py-1 rounded text-xs font-mono">apps/web/app/</code>
              </p>
              <p className="text-xs text-gray-500">Changes auto-reload</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">🗄️ Database</h4>
              <p className="text-sm text-gray-600 mb-2">
                Firestore data persists locally
              </p>
              <p className="text-xs text-gray-500">View in Emulator UI</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">⚡ Functions</h4>
              <p className="text-sm text-gray-600 mb-2">
                Cloud Functions run locally
              </p>
              <p className="text-xs text-gray-500">Auto-restart on changes</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">🚀 Ready to develop!</h4>
            <div className="text-sm text-blue-800 space-y-2">
              <p>• Web app running on <strong>localhost:3000</strong></p>
              <p>• Firebase Emulator UI on <strong>localhost:4040</strong></p>
              <p>• All services available for local development</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
