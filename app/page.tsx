import { TodoList } from "@/components/todo-list";
import { TodaysTasks } from "@/components/todays-tasks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Task Management</h1>

        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="today">Today&apos;s Tasks</TabsTrigger>
            <TabsTrigger value="all">All Todos</TabsTrigger>
          </TabsList>
          <TabsContent value="today">
            <TodaysTasks />
          </TabsContent>
          <TabsContent value="all">
            <TodoList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
