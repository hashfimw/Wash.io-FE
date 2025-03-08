"use client";

import React, { useState, useEffect } from 'react';
import { useOrders } from '@/hooks/api/request-order/usePublicOrders';
import { formatDate } from '@/utils/formatters';
import Link from 'next/link';
import { 
  Search, 
  Calendar, 
  MapPin, 
  Box, 
  CreditCard, 
  Clock, 
  ExternalLink 
} from "lucide-react";

// Define the Order type if not already imported
interface OrderItem {
  id: number;
  orderItemName: string;
  qty?: number;
}

interface Order {
  id: number;
  createdAt: string;
  orderStatus: string;
  isPaid: boolean;
  outlet?: {
    outletName: string;
  };
  customerAddress?: {
    addressLine: string;
  };
  OrderItem?: OrderItem[] ;
}

const OrderList: React.FC = () => {
  const { orders = [], loading, error, getAllOrders } = useOrders();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  // Fix: specify the type as Order[]
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const itemsPerPage = 5;

  // Rest of your component...

  useEffect(() => {
    getAllOrders();
  }, [getAllOrders]);

  // Filter orders based on search query
  useEffect(() => {
    if (!orders.length) return;
    
    const filtered = orders.filter(order => {
      const searchLower = searchQuery.toLowerCase();
      return (
        order.id.toString().includes(searchLower) ||
        (order.outlet?.outletName || '').toLowerCase().includes(searchLower) ||
        order.orderStatus.toLowerCase().includes(searchLower) ||
        (order.customerAddress?.addressLine || '').toLowerCase().includes(searchLower) ||
        order.OrderItem?.some(item => 
          item.orderItemName.toLowerCase().includes(searchLower)
        )
      );
    });
    
    setFilteredOrders(filtered);
  }, [orders, searchQuery]);

  // Implement debounce for search
  useEffect(() => {
    const timer = setTimeout(() => {
      // This will trigger the filter useEffect
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  // Get status style based on order status
  const getStatusStyle = (status: any) => {
    switch(status.toLowerCase()) {
      case 'pending':
      case 'waiting_confirmation':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <section className="bg-gradient-to-b from-[#E7FAFE] to-white p-4 sm:p-6 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6 sm:mb-8 mt-20">
          Your <span className="text-orange-500">Laundry</span> Orders
        </h2>
        
        {/* Search Bar */}
        <div className="relative max-w-md mx-auto mb-6 sm:mb-8">
          <div className="flex items-center border-2 border-gray-300 rounded-full bg-white overflow-hidden pl-3 sm:pl-4 pr-2 py-1.5 sm:py-2">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-1 sm:mr-2" />
            <input
              type="text"
              placeholder="Search orders by ID, outlet, or status..."
              className="w-full text-sm sm:text-base outline-none bg-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">Loading your orders...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 text-red-500 p-3 sm:p-4 rounded-lg text-center text-sm sm:text-base">
            <p>{error}</p>
            <button 
              className="mt-2 text-xs sm:text-sm underline"
              onClick={() => getAllOrders()}
            >
              Try again
            </button>
          </div>
        )}

        {/* No Orders State */}
        {!loading && !error && filteredOrders.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Box className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-700">No Orders Found</h3>
            <p className="text-gray-500 mt-1">
              {searchQuery ? "No orders match your search criteria." : "You haven't placed any orders yet."}
            </p>
            <Link href="/services" className="mt-4 inline-block px-4 py-2 bg-orange-500 text-white rounded-md text-sm">
              Browse Services
            </Link>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && filteredOrders.length > 0 && (
          <div className="space-y-4 sm:space-y-6">
            {currentItems.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 transition-all hover:shadow-lg">
                <div className="p-4 sm:p-5">
                  {/* Header with Order # and Status */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="font-bold text-base sm:text-lg">WASH-{order.id}</span>
                      <span className={`ml-3 px-2 py-1 rounded-full text-xs ${getStatusStyle(order.orderStatus)}`}>
                        {order.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-center text-sm text-gray-500">
                      {/* <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 text-gray-400"/> */}
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 text-gray-400" />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                  
                  {/* Order Details */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      {/* Outlet Info */}
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 mr-2 text-orange-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">{order.outlet?.outletName || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{order.customerAddress?.addressLine || 'Address not available'}</p>
                        </div>
                      </div>
                      
                      {/* Payment Status */}
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2 text-orange-500" />
                        <div className="flex items-center">
                          <span className="text-sm mr-2">Payment:</span>
                          {order.isPaid ? (
                            <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                              Paid
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                              Payment Required
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Order Items */}
                    <div>
                      {order.OrderItem && order.OrderItem.length > 0 ? (
                        <div>
                          <div className="flex items-center mb-1.5">
                            <Box className="w-4 h-4 mr-2 text-orange-500" />
                            <p className="text-sm font-medium">Order Items:</p>
                          </div>
                          <ul className="pl-6 text-sm space-y-1">
                            {order.OrderItem.slice(0, 3).map(item => (
                              <li key={item.id} className="flex justify-between">
                                <span>{item.orderItemName}</span>
                                {item.qty && <span className="text-gray-500">x{item.qty}</span>}
                              </li>
                            ))}
                            {order.OrderItem.length > 3 && (
                              <li className="text-xs text-orange-500">
                                +{order.OrderItem.length - 3} more items
                              </li>
                            )}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No items in this order</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="mt-4 pt-3 border-t flex justify-end space-x-2 sm:space-x-3">
                    <Link 
                      href={`/orders/${order.id}`} 
                      className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md flex items-center transition-colors"
                    >
                      View Details
                      <ExternalLink className="w-3 h-3 ml-1.5" />
                    </Link>
                    {!order.isPaid && (
                      <Link 
                        href={`/orders/${order.id}/payment`} 
                        className="px-3 py-1.5 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors"
                      >
                        Pay Now
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Pagination */}
            {filteredOrders.length > itemsPerPage && (
              <div className="flex justify-center items-center space-x-2 mt-6">
                <button
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-700 hover:bg-gray-800 text-white text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <div className="text-sm sm:text-base px-2">
                  Page {currentPage} of {Math.ceil(filteredOrders.length / itemsPerPage)}
                </div>
                <button
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={indexOfLastItem >= filteredOrders.length}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default OrderList;