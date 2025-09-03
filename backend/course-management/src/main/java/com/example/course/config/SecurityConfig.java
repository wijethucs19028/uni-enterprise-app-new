package com.example.course.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity(jsr250Enabled = true) // enables @PermitAll
public class SecurityConfig {

    @Value("${app.cors.allowed-origins:http://localhost:5173}")
    private String allowedOrigins;

    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder encoder) {
        var admin = User.withUsername("admin")
                .password(encoder.encode("admin123"))
                .roles("ADMIN")
                .build();
        var student = User.withUsername("student")
                .password(encoder.encode("student123"))
                .roles("STUDENT")
                .build();
        var lecturer = User.withUsername("lecturer")
                .password(encoder.encode("lecturer123"))
                .roles("LECTURER")
                .build();
        return new InMemoryUserDetailsManager(admin, student, lecturer);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .httpBasic(Customizer.withDefaults())
            .exceptionHandling(ex -> ex.authenticationEntryPoint((req, res, e) -> {
                res.addHeader("WWW-Authenticate", "Basic realm=\"U-CMS\"");
                res.sendError(401);
            }))
            .authorizeHttpRequests(auth -> auth
                // Preflight + public identity/logout endpoints FIRST
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/auth/logout").permitAll()
                .requestMatchers("/api/auth/**").permitAll()

                // Courses: read any role; write admin
                .requestMatchers(HttpMethod.GET, "/api/courses/**")
                    .hasAnyRole("ADMIN","STUDENT","LECTURER")
                .requestMatchers(HttpMethod.POST, "/api/courses/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT,  "/api/courses/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE,"/api/courses/**").hasRole("ADMIN")

                // Registrations
                .requestMatchers("/api/registrations/my").hasRole("STUDENT")
                .requestMatchers("/api/registrations/**")
                    .hasAnyRole("ADMIN","STUDENT","LECTURER")

                // Students API (admin only)
                .requestMatchers("/api/students/**").hasRole("ADMIN")

                // Everything else denied
                .anyRequest().denyAll()
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(List.of(allowedOrigins));
        cfg.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
