import React from "react";
import { useState, useEffect } from "react";
import { Table, Button, Container } from "react-bootstrap";
import "./EmployeeTasks.css";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:3000");

const EmployeeTasks = ({ employeeId }) => {
  const [tasks, setTasks] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!employeeId) {
      console.error("Employee ID is undefined");
      return;
    }

    console.log("Fetching tasks for employeeId:", employeeId);

    // Fetch tasks assigned to logged-in employee
    axios
      .get(`${apiUrl}/tasks/employee/${employeeId}`, {
        withCredentials: true,
      })
      .then((res) => {
        console.log("API Response:", res.data); // Log full API response
        if (res.data.success) {
          console.log("Setting tasks state:", res.data.tasks);
          setTasks(res.data.tasks);
        } else {
          console.error("Failed to fetch tasks:", res.data.message);
        }
      })
      .catch((err) => console.error("Error fetching tasks:", err));
  }, [employeeId]);

  // Listen for real-time task updates
  useEffect(() => {
    socket.on("taskUpdated", (updatedTask) => {
      console.log("Task updated:", updatedTask);
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.task_id === updatedTask.task_id ? updatedTask : task
        )
      );
    });

    socket.on("taskAssigned", (newTask) => {
      console.log("New task assigned:", newTask);
      setTasks((prevTasks) => [...prevTasks, newTask]);
    });

    socket.on("taskDeleted", (deletedTask) => {
      console.log("Task deleted:", deletedTask);
      setTasks((prevTasks) =>
        prevTasks.filter((task) => task.task_id !== deletedTask.taskId)
      );
    });

    return () => {
      socket.off("taskUpdated");
      socket.off("taskAssigned");
      socket.off("taskDeleted");
    };
  }, []);

  // Function to update task status
  const handleTaskStatusChange = (taskId, status) => {
    axios
      .put(
        `${apiUrl}/taskstatus/${taskId}`,
        { status },
        { withCredentials: true }
      )
      .then((res) => {
        if (res.data.success) {
          console.log(`Task status changed to ${status}:`, res.data.task);
          // Update the state immediately to reflect the change
          setTasks((prevTasks) =>
            prevTasks.map((task) =>
              task.task_id === taskId ? { ...task, status } : task
            )
          );
          socket.emit("updateTask", res.data.task); // Notify real-time change
        } else {
          console.error("Failed to update task:", res.data.message);
        }
      })
      .catch((err) => console.error("Error updating task:", err));
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-3 justify-center text-center">Your Assigned Tasks</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Task</th>
            <th>Project</th>
            <th>Deadline</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {tasks.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">
                No tasks assigned yet.
              </td>
            </tr>
          ) : (
            tasks.map((task) => (
              <tr key={task.task_id}>
                <td>{task.description}</td>
                <td>{task.project_title || "N/A"}</td>
                <td>
                  {task.deadline
                    ? new Date(task.deadline).toLocaleString()
                    : "N/A"}
                </td>
                <td>{task.status}</td>
                <td>
                  {task.status !== "completed" && (
                    <>
                      {task.status !== "in_progress" && (
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() =>
                            handleTaskStatusChange(task.task_id, "in_progress")
                          }
                          className="me-2 mb-2"
                        >
                          Mark In Progress
                        </Button>
                      )}
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() =>
                          handleTaskStatusChange(task.task_id, "completed")
                        }
                        className="mb-2"
                      >
                        Mark Completed
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default EmployeeTasks;
