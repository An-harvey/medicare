/**
 * ErrorBoundary — Bắt lỗi runtime, hiển thị fallback thay vì trang trắng
 * Bọc toàn bộ app và từng dashboard page để tránh crash
 */
import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Có lỗi xảy ra</h2>
            <p className="text-sm text-gray-500 mb-2 font-mono bg-gray-50 rounded-lg p-3 text-left break-all">
              {this.state.error?.message || 'Lỗi không xác định'}
            </p>
            <div className="flex gap-3 mt-5 justify-center">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700"
              >
                Thử lại
              </button>
              <a
                href="/"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50"
              >
                Về trang chủ
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
