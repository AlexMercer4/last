import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function AppointmentFilters({
  filters,
  onFiltersChange,
  userRole,
}) {
  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "scheduled", label: "Scheduled" },
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "counseling", label: "General Counseling" },
    { value: "academic", label: "Academic Guidance" },
    { value: "career", label: "Career Counseling" },
    { value: "personal", label: "Personal Issues" },
  ];

  const counselorOptions = [
    { value: "all", label: "All Counselors" },
    { value: "1", label: "Dr. Sarah Ahmed" },
    { value: "2", label: "Prof. Ahmad Hassan" },
    { value: "3", label: "Dr. Fatima Sheikh" },
  ];

  const updateFilter = (key, value) => {
    if (value === "all" || value === "") {
      const newFilters = { ...filters };
      delete newFilters[key];
      onFiltersChange(newFilters);
    } else {
      onFiltersChange({
        ...filters,
        [key]: value,
      });
    }
  };

  const updateDateRange = (type, value) => {
    const currentRange = filters.dateRange || { start: "", end: "" };
    const newRange = { ...currentRange, [type]: value };

    if (!newRange.start && !newRange.end) {
      const newFilters = { ...filters };
      delete newFilters.dateRange;
      onFiltersChange(newFilters);
    } else {
      onFiltersChange({
        ...filters,
        dateRange: newRange,
      });
    }
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-lg border">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
            {hasActiveFilters && (
              <span className="bg-[#0056b3] text-white text-xs rounded-full px-2 py-1">
                {Object.keys(filters).length}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filters</h4>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-red-600 hover:text-red-700"
                >
                  Clear All
                </Button>
              )}
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) => updateFilter("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={filters.type || "all"}
                onValueChange={(value) => updateFilter("type", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Counselor Filter (only for students and chairperson) */}
            {userRole !== "counselor" && (
              <div className="space-y-2">
                <Label>Counselor</Label>
                <Select
                  value={filters.counselor || "all"}
                  onValueChange={(value) => updateFilter("counselor", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {counselorOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Date Range Filter */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-gray-500">From</Label>
                  <Input
                    type="date"
                    value={filters.dateRange?.start || ""}
                    onChange={(e) => updateDateRange("start", e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">To</Label>
                  <Input
                    type="date"
                    value={filters.dateRange?.end || ""}
                    onChange={(e) => updateDateRange("end", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.status && (
            <div className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">
              <span>Status: {filters.status}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-blue-200"
                onClick={() => updateFilter("status", "all")}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          {filters.type && (
            <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm">
              <span>Type: {filters.type}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-green-200"
                onClick={() => updateFilter("type", "all")}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          {filters.counselor && (
            <div className="flex items-center space-x-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-sm">
              <span>
                Counselor:{" "}
                {
                  counselorOptions.find((c) => c.value === filters.counselor)
                    ?.label
                }
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-purple-200"
                onClick={() => updateFilter("counselor", "all")}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
