import { useAppSelector } from "./app/hooks";
import Header from "./components/Header";
import Table from "./components/views/Table";
import TaskModal from "./components/TaskModal";
import KanbanView from "./components/views/KanbanView";
function App() {
  const viewMode = useAppSelector((state) => state.ui.viewMode);

  return (
    <div className="min-h-screen bg-gray-100 ">
      <Header />
      <main>
        <div className="max-w-full mx-auto py-4 px-4 sm:px-6 lg:px-8 ">
          {viewMode === "list" ? <Table /> : <KanbanView />}
        </div>
      </main>

      <TaskModal />
    </div>
  );
}
export default App;
