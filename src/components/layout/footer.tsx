import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-gray-50 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            © 2024 Oogiri App. All rights reserved.
          </div>
          <div className="flex gap-4 text-sm">
            <Link 
              href="/terms" 
              className="text-gray-600 hover:text-gray-900 transition-colors underline"
            >
              利用規約
            </Link>
            <span className="text-gray-400">|</span>
            <Link 
              href="/privacy" 
              className="text-gray-600 hover:text-gray-900 transition-colors underline"
            >
              プライバシーポリシー
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}