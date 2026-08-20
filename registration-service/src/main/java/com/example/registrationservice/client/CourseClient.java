package com.example.registrationservice.client;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class CourseClient {

    private final RestTemplate restTemplate;

    @Value("${course-service.base-url}")
    private String courseServiceBaseUrl;

    public void reserveSeat(Long courseId) {
        String url = courseServiceBaseUrl + "/internal/courses/" + courseId + "/reserve-seat";
        try {
            restTemplate.exchange(url, HttpMethod.PATCH, null, Void.class);
        } catch (HttpClientErrorException.Conflict e) {
            throw new IllegalStateException("Môn học đã hết chỗ");
        } catch (HttpClientErrorException.NotFound e) {
            throw new IllegalStateException("Môn học không tồn tại");
        } catch (HttpServerErrorException | ResourceAccessException e) {
            throw new IllegalStateException("Không thể kết nối tới course-service, vui lòng thử lại sau");
        }
    }

    public void releaseSeat(Long courseId) {
        String url = courseServiceBaseUrl + "/internal/courses/" + courseId + "/release-seat";
        try {
            restTemplate.exchange(url, HttpMethod.PATCH, null, Void.class);
        } catch (HttpClientErrorException.NotFound e) {
            throw new IllegalStateException("Môn học không tồn tại");
        } catch (HttpServerErrorException | ResourceAccessException e) {
            throw new IllegalStateException("Không thể kết nối tới course-service, vui lòng thử lại sau");
        }
    }
}