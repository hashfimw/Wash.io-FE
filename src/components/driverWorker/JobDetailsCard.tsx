import { GetJobByIdResponse, UpdateLaundryJobInputBody } from "@/types/driverWorker";
import { format } from "date-fns";
import { ListCollapse, ListTodo } from "lucide-react";

interface JobDetailsCardProps {
  role: "driver" | "worker";
  job: GetJobByIdResponse;
  isTakeLaundryJob: boolean;
  isValid: boolean;
  isPending: boolean;
  inputBody: UpdateLaundryJobInputBody[];
  errors: string[];
  handleQtyChange: (orderItemId: number, newQty: number) => void;
}

export default function JobDetailsCard({
  role,
  job,
  isTakeLaundryJob,
  isValid,
  inputBody,
  errors,
  handleQtyChange,
  isPending,
}: JobDetailsCardProps) {
  const isNotPending = !!(isTakeLaundryJob && !isPending);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3 text-sidebar-foreground">
        <ListTodo />
        <h2 className="text-lg font-semibold">Job status</h2>
      </div>
      <div
        className={`${
          role === "driver" ? "bg-putbir/75" : "bg-orange-50/75"
        } space-y-3 sm:px-4 sm:py-6 rounded-md shadow-inner px-2 py-4 text-sm sm:text-base`}
      >
        <p>
          <span className="text-muted-foreground">
            {role === "driver" ? "• Transport type " : "• Station "}
          </span>
          <span
            className={`font-medium text-white text-xs sm:text-sm saturate-[.8] rounded-full py-0.5 px-3 ${
              role === "driver" ? "bg-birtu" : "bg-oren"
            }`}
          >
            {role === "driver"
              ? job.transportType!.toLowerCase().replace(/(?: |\b)(\w)/g, function (key) {
                  return key.toUpperCase();
                })
              : job.station!.toLowerCase().replace(/(?: |\b)(\w)/g, function (key) {
                  return key.toUpperCase();
                })}
          </span>
        </p>
        {!job.employeeId && (
          <p>
            <span className="text-muted-foreground">• Job status </span>
            <span className="font-medium text-white text-xs sm:text-sm saturate-[.8] rounded-full py-0.5 px-3 bg-yellow-600">
              {role === "driver" ? "Waiting for Driver" : "Waiting for Worker"}
            </span>
          </p>
        )}
        {job.employeeId && (
          <p>
            <span className="text-muted-foreground">• Job status </span>
            <span
              className={`font-medium text-white text-xs sm:text-sm saturate-[.8] rounded-full py-0.5 px-3 ${
                job.isCompleted ? "bg-lime-600" : "bg-yellow-600"
              }`}
            >
              {job.isCompleted ? "Completed" : "In Progress"}
            </span>
          </p>
        )}
        <p>
          <span className="text-muted-foreground">• Order Status </span>
          <span className="font-medium text-white text-xs sm:text-sm saturate-[.8] rounded-full py-0.5 px-3 bg-black">
            {job.orderStatus
              .toLowerCase()
              .replace(/_/g, " ")
              .replace(/(?: |\b)(\w)/g, function (key) {
                return key.toUpperCase();
              })}
          </span>
        </p>
        <p>
          <span className="text-muted-foreground">• Handled by </span>
          <span className="font-medium">{job.employeeName ? job.employeeName : "-"}</span>
        </p>
        <p>
          <span className="text-muted-foreground">• Issued at </span>
          <span className="font-medium">{format(job.createdAt, "PPPp")}</span>
        </p>
        <p>
          <span className="text-muted-foreground">• Last updated at </span>
          <span className="font-medium">{format(job.updatedAt, "PPPp")}</span>
        </p>
      </div>
      <div className="flex items-center gap-3 mt-3 text-sidebar-foreground">
        <ListCollapse />
        <h2 className="text-lg font-semibold">Job details</h2>
      </div>
      <div
        className={`${
          role === "driver" ? "bg-putbir/75" : "bg-orange-50/75"
        } space-y-3 sm:px-4 sm:py-6 rounded-md shadow-inner px-2 py-4 text-sm sm:text-base`}
      >
        {role === "driver" ? (
          <>
            <p>
              <span className="text-muted-foreground">• Ordered by </span>
              <span className="font-medium">{job.customerName ? job.customerName : "-"}</span>
            </p>
            <p>
              <span className="text-muted-foreground">• Distance </span>
              <span className="font-medium">{job.distance + " km"}</span>
            </p>
            {job.address && (
              <p>
                <span className="text-muted-foreground">• Address line: </span>
                <span className="font-medium">
                  {job.address.addressLine}, {job.address.province}, {job.address.regency},{" "}
                  {job.address.district}, {job.address.village}
                </span>
              </p>
            )}
          </>
        ) : (
          <>
            <p>
              <span className="text-muted-foreground">• Ordered by </span>
              <span className="font-medium">{job.customerName ? job.customerName : "-"}</span>
            </p>
            <p>
              <span className="text-muted-foreground">• Weight </span>
              <span className="font-medium">{job.laundryWeight + " kg"}</span>
            </p>
            <p>
              <span className="text-muted-foreground">• Bypass status </span>
              {!job.isByPassRequested ? (
                <span className="font-medium text-white text-xs sm:text-sm saturate-[.8] rounded-full py-0.5 px-3 bg-lime-600">
                  No bypass
                </span>
              ) : job.isByPassRequested && !job.byPassStatus ? (
                <span className="font-medium text-white text-xs sm:text-sm saturate-[.8] rounded-full py-0.5 px-3 bg-yellow-600">
                  Pending
                </span>
              ) : job.byPassStatus && job.byPassStatus === "ACCEPTED" ? (
                <span className="font-medium text-white text-xs sm:text-sm saturate-[.8] rounded-full py-0.5 px-3 bg-lime-600">
                  Accepted
                </span>
              ) : (
                <span className="font-medium text-white text-xs sm:text-sm saturate-[.8] rounded-full py-0.5 px-3 bg-rose-600">
                  Rejected
                </span>
              )}
            </p>
            {job.byPassNote && (
              <p>
                <span className="text-muted-foreground">• Bypass note </span>
                <span className="font-medium">{job.byPassNote}</span>
              </p>
            )}
            <div className="max-w-screen-sm mx-auto pt-4">
              <div className={`rounded-md border overflow-hidden`}>
                <table className={`w-full max-w-screen-sm text-sm sm:text-base`}>
                  <thead>
                    <tr className="h-10 text-center font-medium text-sidebar-foreground bg-oren/30">
                      <td className="w-20">Num</td>
                      <td>Item name</td>
                      <td className="w-20">Qty</td>
                      {isNotPending && <td className="w-20">Input</td>}
                    </tr>
                  </thead>
                  <tbody>
                    {inputBody.map((item, idx) => (
                      <tr
                        className="text-center font-medium h-9 odd:bg-muted even:bg-amber-100/50 hover:brightness-105 transition"
                        key={idx}
                      >
                        <td>{idx + 1}</td>
                        <td>{job.orderItem![idx].orderItemName}</td>
                        <td>{job.orderItem![idx].qty}</td>
                        {isNotPending && (
                          <td className="place-content-center">
                            <input
                              type="number"
                              min="0"
                              value={item.qty ?? 0}
                              onChange={(e) =>
                                handleQtyChange(item.orderItemId, parseInt(e.target.value) || 0)
                              }
                              required
                              className="w-16 shadow-none text-sm sm:text-base p-1 rounded-sm border"
                            />
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {isNotPending && (
                  <>
                    {errors.length > 0 && (
                      <div className="px-4 py-2 bg-red-100 text-red-700 border-t-0 text-sm">
                        <p className="font-semibold">Validation Error(s):</p>
                        <ul className="list-disc ml-5">
                          {errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {isValid && (
                      <div className="px-4 py-2 bg-green-100 text-green-700 border-t-0 text-sm">
                        All items match the expected quantities!
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
