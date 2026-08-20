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
            courses = courseRepository.findByTenMonHocContainingIgnoreCase(keyword.trim(), pageable);
        }

        return courses.map(this::toDTO);
    }

    public CourseDTO getById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Khong tim thay mon hoc id = " + id));
        return toDTO(course);
    }

    public CourseDTO create(CourseDTO dto) {
        if (courseRepository.existsByTenMonHocIgnoreCase(dto.getTenMonHoc())) {
            throw new IllegalArgumentException("Ten mon hoc da ton tai");
        }
        Course course = new Course();
        course.setTenMonHoc(dto.getTenMonHoc());
        course.setSoTinChi(dto.getSoTinChi());
        course.setSoChoToiDa(dto.getSoChoToiDa());
        // Quy tắc: Khi tạo mới, số chỗ còn lại luôn bằng số chỗ tối đa
        course.setSoChoConLai(dto.getSoChoToiDa());
        return toDTO(courseRepository.save(course));
    }

    public CourseDTO update(Long id, CourseDTO dto) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Khong tim thay mon hoc id = " + id));
        course.setTenMonHoc(dto.getTenMonHoc());
        course.setSoTinChi(dto.getSoTinChi());
        course.setSoChoToiDa(dto.getSoChoToiDa());
        // Lưu ý: Không sửa trực tiếp soChoConLai qua API update thông thường
        return toDTO(courseRepository.save(course));
    }

    public void delete(Long id) {
        if (!courseRepository.existsById(id)) {
            throw new NoSuchElementException("Khong tim thay mon hoc id = " + id);
        }
        courseRepository.deleteById(id);
    }

    @Transactional
    public void reserveSeat(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Khong tim thay mon hoc id = " + id));

        if (course.getSoChoConLai() == null || course.getSoChoConLai() <= 0) {
            throw new IllegalStateException("Mon hoc da het cho");
        }

        course.setSoChoConLai(course.getSoChoConLai() - 1);
        courseRepository.save(course);
    }

    @Transactional
    public void releaseSeat(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Khong tim thay mon hoc id = " + id));

        int current = course.getSoChoConLai() == null ? 0 : course.getSoChoConLai();
        int max = course.getSoChoToiDa() == null ? current : course.getSoChoToiDa();

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
