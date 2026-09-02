package com.example.registrationservice.service;

import com.example.registrationservice.client.CourseClient;
import com.example.registrationservice.dto.RegistrationRequestDTO;
import com.example.registrationservice.entity.Registration;
import com.example.registrationservice.repository.RegistrationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class RegistrationService {

    private static final String DA_DANG_KY = "DA_DANG_KY";
    private static final String DA_HUY = "DA_HUY";

    private final RegistrationRepository registrationRepository;
    private final CourseClient courseClient;

    @Transactional
    public Registration register(RegistrationRequestDTO dto) {
        if (registrationRepository.existsByStudentIdAndCourseIdAndTrangThai(
                dto.getStudentId(), dto.getCourseId(), DA_DANG_KY)) {
            throw new IllegalStateException("Sinh viên đã đăng ký môn học này rồi");
        }

        courseClient.reserveSeat(dto.getCourseId());

        Registration registration = new Registration();
        registration.setStudentId(dto.getStudentId());
        registration.setCourseId(dto.getCourseId());
        registration.setTrangThai(DA_DANG_KY);
        registration.setNgayDangKy(LocalDateTime.now());

        return registrationRepository.save(registration);
    }

    @Transactional
    public void cancel(Long id) {
        Registration registration = registrationRepository.findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "Không tìm thấy đăng ký id = " + id
                        )
                );

        if (DA_HUY.equals(registration.getTrangThai())) {
            throw new IllegalStateException(
                    "Đăng ký này đã được hủy trước đó"
            );
        }

        courseClient.releaseSeat(registration.getCourseId());

        registration.setTrangThai(DA_HUY);
        registrationRepository.save(registration);
    }

    public List<Registration> getAll() {
        return registrationRepository.findAll();
    }

    public List<Registration> getByStudentId(Long studentId) {
        return registrationRepository.findByStudentId(studentId);
    }

    public List<Registration> getMyRegistrations(Long studentId) {
        return registrationRepository.findByStudentId(studentId);
    }
}