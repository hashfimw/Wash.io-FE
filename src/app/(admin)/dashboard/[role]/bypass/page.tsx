"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { BypassRequest } from "@/types/bypass";
import { useBypassRequest } from "@/hooks/api/bypassrequest/useBypass";
import { SearchBar } from "@/components/bypass/handlebypass/bypassreq-filter";
import { EmptyState } from "@/components/bypass/handlebypass/emptyState";
import { BypassRequestsTable } from "@/components/bypass/handlebypass/bypassReqTable";
import { useBreadcrumb } from "@/context/BreadcrumbContext";

export default function BypassRequestsPage() {
  const params = useParams();
  const role = params.role as string;
  const { getBypassRequests, error: apiError } = useBypassRequest();
  const [bypassRequests, setBypassRequests] = useState<BypassRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<BypassRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { setBreadcrumbItems } = useBreadcrumb();
  const { toast } = useToast();

  useEffect(() => {
    const roleName = role === "super-admin" ? "Super Admin" : "Outlet Admin";
    setBreadcrumbItems([{ label: roleName, href: `/dashboard/${role}` }, { label: "Bypass Requests" }]);
  }, [role, setBreadcrumbItems]);

  useEffect(() => {
    const fetchBypassRequests = async () => {
      try {
        setIsLoading(true);
        const result = await getBypassRequests();
        setBypassRequests(result.bypassRequests || []);
        setFilteredRequests(result.bypassRequests || []);
      } catch (err) {
        console.error("Error fetching bypass requests:", err);
        setError("Failed to load bypass requests. Please try again.");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load bypass requests. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBypassRequests();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredRequests(bypassRequests);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = bypassRequests.filter(
        (request) =>
          request.id.toString().includes(lowerQuery) ||
          request.order.id.toString().includes(lowerQuery) ||
          request.worker?.user.fullName.toLowerCase().includes(lowerQuery) ||
          request.worker?.outlet.outletName.toLowerCase().includes(lowerQuery)
      );
      setFilteredRequests(filtered);
    }
  }, [searchQuery, bypassRequests]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Bypass Requests</h1>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || apiError) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || apiError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Bypass Requests</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bypass Requests List</CardTitle>
          <CardDescription>Manage bypass requests from workers in the laundry process</CardDescription>
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <EmptyState searchQuery={searchQuery} />
          ) : (
            <BypassRequestsTable requests={filteredRequests} role={role} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
