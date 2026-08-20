package com.example.registrationservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {
        // Dùng JdkClientHttpRequestFactory để hỗ trợ PATCH
        return new RestTemplate(new JdkClientHttpRequestFactory());
    }
}