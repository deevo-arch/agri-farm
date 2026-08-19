package com.livestock.trace.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.livestock.trace.common.exception.ErrorResponse;
import com.livestock.trace.security.JwtAuthenticationFilter;
import com.livestock.trace.security.JwtService;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtService jwtService;
    private final ObjectMapper objectMapper;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${app.cors.allowed-origins}") String allowedOrigins) {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(
                        auth ->
                                auth.requestMatchers("/api/auth/**")
                                        .permitAll()
                                        .requestMatchers("/api/public/**")
                                        .permitAll()
                                        .requestMatchers(HttpMethod.POST, "/api/users")
                                        .hasRole("ADMIN")
                                        .requestMatchers(HttpMethod.GET, "/api/users")
                                        .hasRole("ADMIN")
                                        .requestMatchers(HttpMethod.PUT, "/api/users/*")
                                        .hasRole("ADMIN")
                                        .requestMatchers(
                                                HttpMethod.POST,
                                                "/api/farms",
                                                "/api/livestock",
                                                "/api/milk-batches",
                                                "/api/vet-visits")
                                        .hasAnyRole("FARMER", "ADMIN")
                                        .requestMatchers(HttpMethod.POST, "/api/milk-batches/*/qr")
                                        .hasAnyRole("FARMER", "ADMIN")
                                        .requestMatchers(HttpMethod.PATCH, "/api/farms/*", "/api/livestock/*")
                                        .hasAnyRole("FARMER", "ADMIN")
                                        .requestMatchers(HttpMethod.PUT, "/api/vet-visits/*")
                                        .hasAnyRole("FARMER", "ADMIN")
                                        .requestMatchers(HttpMethod.GET, "/api/vet-visits/pending")
                                        .hasAnyRole("VET", "ADMIN")
                                        .requestMatchers(
                                                HttpMethod.POST,
                                                "/api/vet-visits/*/accept",
                                                "/api/vet-visits/*/reject",
                                                "/api/vet-visits/*/complete",
                                                "/api/vaccinations",
                                                "/api/medications")
                                        .hasAnyRole("VET", "ADMIN")
                                        .anyRequest()
                                        .authenticated())
                .exceptionHandling(
                        eh ->
                                eh.authenticationEntryPoint(
                                                (request, response, authException) ->
                                                        writeError(
                                                                response,
                                                                HttpStatus.UNAUTHORIZED,
                                                                "UNAUTHORIZED",
                                                                "Authentication is required to access this resource."))
                                        .accessDeniedHandler(
                                                (request, response, accessDeniedException) ->
                                                        writeError(
                                                                response,
                                                                HttpStatus.FORBIDDEN,
                                                                "FORBIDDEN",
                                                                "You do not have permission to perform this action.")))
                .addFilterBefore(
                        new JwtAuthenticationFilter(jwtService), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    private void writeError(HttpServletResponse response, HttpStatus status, String error, String message)
            throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response
                .getWriter()
                .write(
                        objectMapper.writeValueAsString(
                                new ErrorResponse(LocalDateTime.now(), status.value(), error, message)));
    }
}
