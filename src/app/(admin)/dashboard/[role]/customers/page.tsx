import { UserTableWithBreadcrumb } from "@/components/customers/breadCrumbClient";

export default function CustomersPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold truncate">
            Customers List
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View all registered customers
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 sm:p-6 ">
          <UserTableWithBreadcrumb limit={5} />
        </div>
      </div>
    </div>
  );
}
