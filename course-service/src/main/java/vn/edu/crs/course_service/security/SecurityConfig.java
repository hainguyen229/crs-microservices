package vn.edu.crs.course_service.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // API nội bộ giữa các service
                        .requestMatchers(
                                "/internal/courses/**"
                        ).permitAll()

                        // GET courses: không cần đăng nhập
                        .requestMatchers(
                                HttpMethod.GET,
                                "/courses/**"
                        ).permitAll()

                        // POST: chỉ ADMIN
                        .requestMatchers(
                                HttpMethod.POST,
                                "/courses/**"
                        ).hasRole("ADMIN")

                        // PUT: chỉ ADMIN
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/courses/**"
                        ).hasRole("ADMIN")

                        // DELETE: chỉ ADMIN
                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/courses/**"
                        ).hasRole("ADMIN")

                        .anyRequest().authenticated()
                )

                .addFilterBefore(
                        jwtAuthFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}