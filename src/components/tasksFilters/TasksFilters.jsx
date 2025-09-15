import React from 'react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import DatePicker from '@/components/common/DatePicker';

const TasksFilters = ({ filters, updateFilter }) => {
  return (
    <div className="flex flex-wrap gap-3 items-center p-4 bg-white shadow rounded-xl">
      <Input
        value={filters.search}
        onChange={(e) => updateFilter('search', e.target.value)}
        placeholder="חיפוש חכם"
      />
      <Select
        value={filters.status}
        onChange={(e) => updateFilter('status', e.target.value)}
      >
        <option value="">סטטוס</option>
        <option value="open">פתוח</option>
        <option value="closed">סגור</option>
      </Select>
      {/* אפשר להמשיך עם שאר הסינונים פה */}
      <DatePicker
        label="מתאריך"
        value={filters.dateFrom}
        onChange={(date) => updateFilter('dateFrom', date)}
      />
      <DatePicker
        label="עד תאריך"
        value={filters.dateTo}
        onChange={(date) => updateFilter('dateTo', date)}
      />
    </div>
  );
};

export default TasksFilters;
