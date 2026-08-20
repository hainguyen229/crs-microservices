package com.example.registrationservice.controller;

import com.example.registrationservice.dto.RegistrationRequestDTO;
import com.example.registrationservice.entity.Registration;
import com.example.registrationservice.service.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/registrations")
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;

    // API lấy tất cả đăng ký
    @GetMapping
    public List<Registration> getAll() {
        return registrationService.getAll();
    }

    // API lấy theo studentId
    @GetMapping("/student/{studentId}")
    public List<Registration> getByStudentId(@PathVariable Long studentId) {
        return registrationService.getByStudentId(studentId);
    }

    // Đăng ký môn học
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Registration register(@Valid @RequestBody RegistrationRequestDTO dto) {
        return registrationService.register(dto);
    }

    // Hủy đăng ký
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public void cancel(@PathVariable Long id) {
        registrationService.cancel(id);
    }
}