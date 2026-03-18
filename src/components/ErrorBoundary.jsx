import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('App error:', error, info);

    // 👇 redirect cứng
    if (window.location.pathname !== '/') {
      window.location.replace('/');
    }
  }

  render() {
    if (this.state.hasError) {
      // nếu đang ở trang chủ thì hiển thị lỗi
      if (window.location.pathname === '/') {
        return (
          <div className='p-5 text-center'>
            <h1 className='text-lg font-bold'>Có lỗi xảy ra 😢</h1>
            <p>Vui lòng reload lại trang</p>
          </div>
        );
      }

      return null; // không render gì (đã redirect)
    }

    return this.props.children;
  }
}
