package vn.edu.crs.course_service.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.crs.course_service.entity.Course;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    // Tạo một danh sách tạm (Mockup) để test
    private final List<Course> mockCourses = new ArrayList<>();

    public CourseController() {
        // Dữ liệu mẫu ban đầu
        mockCourses.add(new Course(1L, "Kiến trúc Microservices", 3, 40, 15));
        mockCourses.add(new Course(2L, "Lập trình Web Nâng cao", 3, 50, 5));
    }

    // 1. API lấy danh sách học phần (GET /api/courses)
    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(mockCourses);
    }

    // 2. API kiểm tra service hoạt động (GET /api/courses/ping)
    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("Course Service đang hoạt động tốt tại cổng 8082!");
    }
}