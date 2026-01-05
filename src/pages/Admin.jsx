import { useState, useEffect } from "react"
import { useScrollReveal } from "../hooks/useScrollReveal"
import LoadingSpinner from "../components/LoadingSpinner"
import Skeleton from "../components/Skeleton"

export default function Admin() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [loadingStats, setLoadingStats] = useState(false)
  const [updatingOrder, setUpdatingOrder] = useState(null)
  const [error, setError] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [filterStatus, setFilterStatus] = useState("all")

  const [sectionRef, isSectionVisible] = useScrollReveal({ threshold: 0.1 })

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // URL encode the password to handle special characters
      const encodedPassword = encodeURIComponent(password)
      const response = await fetch(`${API_URL}/api/admin/orders?password=${encodedPassword}`)
      if (response.ok) {
        const data = await response.json()
        setIsAuthenticated(true)
        setOrders(data.orders)
        fetchStats()
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Invalid password' }))
        setError(errorData.error || 'Invalid password. Please try again.')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Failed to connect to server. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
    setLoadingOrders(true)
    try {
      const url = filterStatus === 'all' 
        ? `${API_URL}/api/admin/orders`
        : `${API_URL}/api/admin/orders?status=${filterStatus}`
      
      const response = await fetch(url, {
        headers: {
          'x-admin-password': password
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoadingOrders(false)
    }
  }

  const fetchStats = async () => {
    setLoadingStats(true)
    try {
      const response = await fetch(`${API_URL}/api/admin/stats`, {
        headers: {
          'x-admin-password': password
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus, trackingNumber = null) => {
    setUpdatingOrder(orderId)
    try {
      const response = await fetch(`${API_URL}/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password
        },
        body: JSON.stringify({ status: newStatus, trackingNumber })
      })

      if (response.ok) {
        fetchOrders()
        fetchStats()
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus })
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    } finally {
      setUpdatingOrder(null)
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    // If marking as shipped, prompt for tracking number
    if (newStatus === 'shipped') {
      const trackingNumber = prompt('Enter tracking number (optional):')
      await updateOrderStatus(orderId, newStatus, trackingNumber || null)
    } else {
      await updateOrderStatus(orderId, newStatus)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders()
      const interval = setInterval(fetchOrders, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, filterStatus])

  if (!isAuthenticated) {
    return (
      <section className="py-20 px-5 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Admin Login</h1>
            <p className="text-gray-600 mb-6 text-center">Enter password to access order management</p>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Enter admin password"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <LoadingSpinner size="sm" color="black" text="Logging in..." />
                ) : (
                  'Login'
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section ref={sectionRef} className="py-12 px-5 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
              <p className="text-gray-600">View and manage customer orders</p>
            </div>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Statistics */}
          {loadingStats ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-4">
                  <Skeleton type="text" width="80px" height="14px" className="mb-1" />
                  <Skeleton type="text" width="60px" height="28px" />
                </div>
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Processing</p>
                <p className="text-2xl font-bold text-blue-700">{stats.processing}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Shipped</p>
                <p className="text-2xl font-bold text-purple-700">{stats.shipped}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-green-700">${stats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {loadingOrders ? (
            <div className="p-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton type="text" width="120px" height="16px" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <Skeleton type="text" width="100px" height="16px" />
                            <Skeleton type="text" width="150px" height="14px" />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton type="text" width="60px" height="16px" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton type="text" width="80px" height="16px" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton type="button" width="80px" height="24px" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton type="text" width="100px" height="16px" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton type="button" width="60px" height="20px" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600 text-lg">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{order.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{order.customer?.name}</p>
                          <p className="text-gray-500">{order.customer?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {order.items?.length || 0} item(s)
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">${order.total?.toFixed(2)} {order.currency}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-amber-600 hover:text-amber-800 font-medium mr-4"
                        >
                          View
                        </button>
                        <div className="relative">
                          {updatingOrder === order.id && (
                            <div className="absolute -left-6 top-1/2 -translate-y-1/2">
                              <LoadingSpinner size="sm" color="amber" />
                            </div>
                          )}
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            disabled={updatingOrder === order.id}
                            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
                          >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
            <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Order Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Order ID</p>
                      <p className="font-medium text-gray-900">{selectedOrder.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        selectedOrder.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        selectedOrder.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                        selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-medium text-gray-900">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Status</p>
                      <p className="font-medium text-gray-900 capitalize">{selectedOrder.paymentStatus}</p>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium text-gray-900">{selectedOrder.customer?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{selectedOrder.customer?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">{selectedOrder.customer?.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Shipping Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium text-gray-900 mb-2">{selectedOrder.shipping?.name}</p>
                    {selectedOrder.shipping?.address && (
                      <div className="text-sm text-gray-600">
                        <p>{selectedOrder.shipping.address.line1}</p>
                        {selectedOrder.shipping.address.line2 && <p>{selectedOrder.shipping.address.line2}</p>}
                        <p>{selectedOrder.shipping.address.city}, {selectedOrder.shipping.address.state} {selectedOrder.shipping.address.postal_code}</p>
                        <p>{selectedOrder.shipping.address.country}</p>
                      </div>
                    )}
                    <p className="text-sm text-gray-600 mt-2">Method: {selectedOrder.shipping?.method}</p>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-gray-900">${item.total.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900">${selectedOrder.subtotal?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-gray-900">${selectedOrder.shippingCost?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="text-gray-900">${selectedOrder.tax?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">${selectedOrder.total?.toFixed(2)} {selectedOrder.currency}</span>
                    </div>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Notes</h3>
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

