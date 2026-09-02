package vn.edu.crs.course_service.service;

import vn.edu.crs.course_service.dto.CourseDTO;
import vn.edu.crs.course_service.entity.Course;
import vn.edu.crs.course_service.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;

    public Page<CourseDTO> getAll(String keyword, Pageable pageable) {
        Page<Course> courses;

        if (keyword == null || keyword.isBlank()) {
            courses = courseRepository.findAll(pageable);
        } else {
            courses = courseRepository.findByTenMonHocContainingIgnoreCase(
                    keyword.trim(),
                    pageable
            );
        }

        return courses.map(this::toDTO);
    }

    public CourseDTO getById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "Khong tim thay mon hoc id = " + id
                        )
                );

        return toDTO(course);
    }

    public CourseDTO create(CourseDTO dto) {

        if (courseRepository.existsByTenMonHocIgnoreCase(dto.getTenMonHoc())) {
            throw new IllegalArgumentException(
                    "Ten mon hoc da ton tai"
            );
        }

        Course course = new Course();

        course.setTenMonHoc(dto.getTenMonHoc());
        course.setSoTinChi(dto.getSoTinChi());
        course.setSoChoToiDa(dto.getSoChoToiDa());

        // Khi tạo mới:
        // số chỗ còn lại = số chỗ tối đa
        course.setSoChoConLai(dto.getSoChoToiDa());

        return toDTO(courseRepository.save(course));
    }

    public CourseDTO update(Long id, CourseDTO dto) {

        Course course = courseRepository.findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "Khong tim thay mon hoc id = " + id
                        )
                );

        course.setTenMonHoc(dto.getTenMonHoc());
        course.setSoTinChi(dto.getSoTinChi());

        /*
         * Ví dụ:
         *
         * Hiện tại:
         * soChoToiDa = 40
         * soChoConLai = 38
         *
         * => đã có 2 sinh viên đăng ký.
         *
         * Nếu ADMIN đổi số chỗ tối đa thành 50
         * => số chỗ còn lại phải là 48.
         */

        int oldMax = course.getSoChoToiDa() == null
                ? 0
                : course.getSoChoToiDa();

        int oldRemaining = course.getSoChoConLai() == null
                ? 0
                : course.getSoChoConLai();

        int registered = oldMax - oldRemaining;

        // Phòng trường hợp dữ liệu cũ đang sai
        if (registered < 0) {
            registered = 0;
        }

        int newMax = dto.getSoChoToiDa();

        // Không cho số chỗ tối đa nhỏ hơn
        // số sinh viên hiện đang đăng ký
        if (newMax < registered) {
            throw new IllegalArgumentException(
                    "So cho toi da khong duoc nho hon so sinh vien da dang ky"
            );
        }

        course.setSoChoToiDa(newMax);

        // Tính lại số chỗ còn lại
        course.setSoChoConLai(newMax - registered);

        return toDTO(courseRepository.save(course));
    }

    public void delete(Long id) {

        if (!courseRepository.existsById(id)) {
            throw new NoSuchElementException(
                    "Khong tim thay mon hoc id = " + id
            );
        }

        courseRepository.deleteById(id);
    }

    @Transactional
    public void reserveSeat(Long id) {

        Course course = courseRepository.findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "Khong tim thay mon hoc id = " + id
                        )
                );

        if (course.getSoChoConLai() == null
                || course.getSoChoConLai() <= 0) {

            throw new IllegalStateException(
                    "Mon hoc da het cho"
            );
        }

        course.setSoChoConLai(
                course.getSoChoConLai() - 1
        );

        courseRepository.save(course);
    }

    @Transactional
    public void releaseSeat(Long id) {

        Course course = courseRepository.findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "Khong tim thay mon hoc id = " + id
                        )
                );

        int current = course.getSoChoConLai() == null
                ? 0
                : course.getSoChoConLai();

        int max = course.getSoChoToiDa() == null
                ? current
                : course.getSoChoToiDa();

        // Không cho số chỗ còn lại vượt quá số chỗ tối đa
        if (current < max) {

            course.setSoChoConLai(current + 1);

            courseRepository.save(course);
        }
    }

    private CourseDTO toDTO(Course course) {

        return new CourseDTO(
                course.getId(),
                course.getTenMonHoc(),
                course.getSoTinChi(),
                course.getSoChoToiDa(),
                course.getSoChoConLai()
        );
    }
}