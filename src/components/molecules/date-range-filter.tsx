"use client";

import { useState } from "react";
import { Calendar, X } from "lucide-react";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/dialog";
import { Input } from "@/components/atoms/input";
import { cn } from "@/lib/utils";

type DateRange = {
  startDate: Date | null;
  endDate: Date | null;
};

export function DateRangeFilter({
  onDateRangeChange,
  className,
}: {
  onDateRangeChange: (range: DateRange) => void;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [startMonth, setStartMonth] = useState<string>("");
  const [startYear, setStartYear] = useState<string>("");
  const [endMonth, setEndMonth] = useState<string>("");
  const [endYear, setEndYear] = useState<string>("");

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const applyFilter = () => {
    if (startMonth && startYear && endMonth && endYear) {
      const start = new Date(
        parseInt(startYear),
        parseInt(startMonth) - 1,
        1,
      );
      const end = new Date(
        parseInt(endYear),
        parseInt(endMonth),
        0,
        23,
        59,
        59,
      );
      onDateRangeChange({ startDate: start, endDate: end });
      setIsOpen(false);
    }
  };

  const clearFilter = () => {
    setStartMonth("");
    setStartYear("");
    setEndMonth("");
    setEndYear("");
    onDateRangeChange({ startDate: null, endDate: null });
    setIsOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className={cn("gap-2", className)}
      >
        <Calendar className="size-4" />
        Filter by Date
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Filter by Date Range</DialogTitle>
            <DialogDescription>
              Select a month range to filter transactions
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-6">
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Start Period
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-muted-foreground">Month</label>
                    <select
                      value={startMonth}
                      onChange={(e) => setStartMonth(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                    >
                      <option value="">Select month</option>
                      {months.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-muted-foreground">Year</label>
                    <select
                      value={startYear}
                      onChange={(e) => setStartYear(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                    >
                      <option value="">Select year</option>
                      {years.map((year) => (
                        <option key={year} value={year.toString()}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  End Period
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-muted-foreground">Month</label>
                    <select
                      value={endMonth}
                      onChange={(e) => setEndMonth(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                    >
                      <option value="">Select month</option>
                      {months.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-muted-foreground">Year</label>
                    <select
                      value={endYear}
                      onChange={(e) => setEndYear(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                    >
                      <option value="">Select year</option>
                      {years.map((year) => (
                        <option key={year} value={year.toString()}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={clearFilter}
              className="gap-2"
            >
              <X className="size-4" />
              Clear
            </Button>
            <Button
              type="button"
              onClick={applyFilter}
              disabled={
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                startMonth === "" || startYear === "" || endMonth === "" || endYear === ""
              }
            >
              Apply Filter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

