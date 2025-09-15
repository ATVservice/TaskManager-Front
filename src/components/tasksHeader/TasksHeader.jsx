import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, RotateCcw } from 'lucide-react';

const TasksHeader = ({ activeTab, setActiveTab, onCreate, onResetFilters }) => {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="today">להיום</TabsTrigger>
          <TabsTrigger value="future">עתידיות</TabsTrigger>
          <TabsTrigger value="recurring">קבועות</TabsTrigger>
          <TabsTrigger value="completed">בוצעו</TabsTrigger>
          <TabsTrigger value="cancelled">בוטלו</TabsTrigger>
          <TabsTrigger value="drawer">מגירה</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onResetFilters}>
          <RotateCcw className="w-4 h-4 ml-2" />
          איפוס סינון
        </Button>
        <Button onClick={onCreate}>
          <Plus className="w-4 h-4 ml-2" />
          משימה חדשה
        </Button>
      </div>
    </div>
  );
};

export default TasksHeader;
