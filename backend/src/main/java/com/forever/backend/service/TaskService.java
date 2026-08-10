package com.forever.backend.service;

import com.forever.backend.dto.TaskRequest;
import com.forever.backend.dto.TaskResponse;
import com.forever.backend.entity.Task;
import com.forever.backend.entity.User;
import com.forever.backend.repository.TaskRepository;
import com.forever.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskService(
            TaskRepository taskRepository,
            UserRepository userRepository) {

        this.taskRepository=taskRepository;
        this.userRepository=userRepository;
    }

    public TaskResponse createTask(
            TaskRequest request,
            String email) {

        User user=userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Task task=new Task();

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDueDate(request.getDueDate());
        task.setUser(user);

        Task savedTask=taskRepository.save(task);

        return TaskResponse.from(savedTask);
    }

    public List<TaskResponse> getMyTasks(String email) {

        User user=userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return taskRepository.findByUser(user)
                .stream()
                .map(TaskResponse::from)
                .toList();
    }

    public TaskResponse toggleTask(
            Long id,
            String email) {

        User user=userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Task task=taskRepository
                .findByIdAndUser(id,user)
                .orElseThrow(() ->
                        new RuntimeException("Task not found"));

        task.setCompleted(!task.isCompleted());

        Task updatedTask=taskRepository.save(task);

        return TaskResponse.from(updatedTask);
    }

    public void deleteTask(
            Long id,
            String email) {

        User user=userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Task task=taskRepository
                .findByIdAndUser(id,user)
                .orElseThrow(() ->
                        new RuntimeException("Task not found"));

        taskRepository.delete(task);
    }
}