import Header from "./components/Header";
import Table from "./components/Table";
import TaskModal from "./components/TaskModal";
function App() {
  return (
    <div className="min-h-screen bg-gray-100 ">
      <Header />
      <main className="max-w-full p-4 sm:px-6 lg:px-8">
        <Table />
      </main>
      <div>
        <TaskModal />
      </div>
    </div>
  );
}
export default App;
