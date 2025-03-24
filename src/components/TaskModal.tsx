import React from "react";
import { createTask, updateTask } from "../features/tasks/tasksSlice";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { closeTaskModal } from "../features/ui/uiSlice";
import { X, ChevronDown, ChevronUp } from "lucide-react";

const TaskModal = () => {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [status, setStatus] = React.useState("not started");
  const [priority, setPriority] = React.useState("none");

  const [isAnimating, setIsAnimating] = React.useState(false);

  const [customFields, setCustomFields] = React.useState<
    Record<string, string>
  >({});

  const [showCustomFields, setShowCustomFields] = React.useState(false);
  const [newFieldName, setNewFieldName] = React.useState("");
  const [newFieldValue, setNewFieldValue] = React.useState("");

  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isTaskModelOpen);
  const editingTaskId = useAppSelector((state) => state.ui.isEditingTaskId);
  const tasks = useAppSelector((state) => state.tasks.items);

  React.useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const taskToEdit = editingTaskId
    ? tasks.find((task) => task.id === editingTaskId)
    : null;

  React.useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        setPriority(taskToEdit.priority);
        setDescription(taskToEdit.description);
        setStatus(taskToEdit.status);
        setTitle(taskToEdit.title);
        setCustomFields(taskToEdit.customFields as Record<string, string>);
        setShowCustomFields(Object.keys(taskToEdit.customFields).length > 0);
      } else {
        setTitle("");
        setDescription("");
        setStatus("not started");
        setPriority("none");
        setCustomFields({});
        setShowCustomFields(false);
      }
    }
  }, [isOpen, taskToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskToEdit && editingTaskId) {
      dispatch(
        updateTask({
          id: editingTaskId,
          updatedTask: { title, description, status, priority },
        })
      );
    } else {
      dispatch(
        createTask({ title, description, status, priority, customFields })
      );
    }
    closeModal();
  };
  const closeModal = () => {
    dispatch(closeTaskModal());
    setIsAnimating(false);
  };

  function toggleCustomeFields() {
    setShowCustomFields(!showCustomFields);
  }
  // Add a custom field
  const handleAddCustomField = () => {
    if (newFieldName.trim() && newFieldValue.trim()) {
      setCustomFields((prev) => ({
        ...prev,
        [newFieldName.trim()]: newFieldValue.trim(),
      }));
      setNewFieldName("");
      setNewFieldValue("");
    }
  };

  function handleRemoveCustomField(fieldName: string) {
    setCustomFields((prev) => {
      const updated = { ...prev };
      delete updated[fieldName];
      return updated;
    });
  }

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 ">
      <div
        className={`absolute bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-lg shadow-xl transform transition-all duration-500  ${
          isAnimating
            ? "translate-y-0 opacity-100 delay-200 ease-out"
            : "translate-y-full opacity-0 ease-in duration-200 delay-0"
        }`}
      >
        <div className="p-6 ">
          <div className="flex justify-between items-center mb-6 ">
            <h1 className="text-2xl font-semibold text-gray-800">
              {editingTaskId ? "Edit Task" : "Create Task"}
            </h1>

            <button
              onClick={closeModal}
              className="text-gray-100 hover:text-gray-400 transition-colors absolute top-0 right-0 transform translate-x-full px-2 cursor-pointer grid place-content-center border-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-900 mb-1"
              >
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter task title"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-900 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-900 mb-1"
                >
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full text-md px-3 py-2 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all status">All status</option>
                  <option value="not started">Not Started</option>
                  <option value="in progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="priority"
                  className="block text-sm font-medium text-gray-900 mb-1"
                >
                  Priority
                </label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 text-md py-2 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="none">None</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="border overflow-hidden rounded-md border-gray-400">
              <button
                type="button"
                className="flex justify-between items-center w-full px-4 py-2 border-gray-400 focus:outline-none"
                onClick={toggleCustomeFields}
              >
                <span className="font-medium text-gray-900">
                  Custom Fields{" "}
                  {Object.keys(customFields).length > 0 &&
                    `(${Object.keys(customFields).length})`}
                </span>
                <span>
                  {showCustomFields ? (
                    <ChevronDown size={20} className="text-gray-900" />
                  ) : (
                    <ChevronUp size={20} className="text-gray-900" />
                  )}
                </span>
              </button>
              {showCustomFields && (
                <div className="p-4 flex flex-col gap-4 border-t border-gray-400">
                  {Object.entries(customFields).length > 0 && (
                    <div className="">
                      {Object.entries(customFields).map(([name, value]) => (
                        <div
                          key={name}
                          className="flex justify-between items-center py-2 bg-gray-100 rounded-sm  border-b last:border-b-0 border-gray-400"
                        >
                          <div className="flex flex-col overflow-hidden">
                            <span className="font-medium text-sm text-gray-800">
                              {name}
                            </span>
                            <span className="text-gray-600 truncate">
                              {value}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomField(name)}
                            className="text-red-500 hover:text-red-400 text-md px-2 py-1 flex-shrink-0 cursor-pointer"
                          >
                            <X />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="w-full ">
                    <label
                      htmlFor="fieldName"
                      className="block text-sm font-medium text-gray-900 mb-1"
                    >
                      Field Name
                    </label>
                    <input
                      id="fieldName"
                      type="text"
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter task title"
                    />
                  </div>
                  <div className="w-full">
                    <label
                      htmlFor="fieldValue"
                      className="block text-sm font-medium text-gray-900 mb-1"
                    >
                      Field Value
                    </label>
                    <input
                      id="fieldValue"
                      type="text"
                      value={newFieldValue}
                      onChange={(e) => setNewFieldValue(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter task title"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCustomField}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Add Field
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6 ">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {editingTaskId ? "Save Changes" : "Create Task"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
