package vn.edu.crs.course_service.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.crs.course_service.service.CourseService;

@RestController
@RequestMapping("/internal/courses")
@RequiredArgsConstructor
public class InternalCourseController {

    private final CourseService courseService;

    @PatchMapping("/{id}/reserve-seat")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reserveSeat(@PathVariable Long id) {
        courseService.reserveSeat(id);
    }

    @PatchMapping("/{id}/release-seat")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void releaseSeat(@PathVariable Long id) {
        courseService.releaseSeat(id);
    }
}
