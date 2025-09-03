package com.example.course.controller;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import com.example.course.security.OwnershipService;
import jakarta.annotation.security.PermitAll;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final OwnershipService ownership;

    public AuthController(OwnershipService ownership) {
        this.ownership = ownership;
    }

    /** Public health check to confirm /api/auth/** is reachable without credentials. */
    @PermitAll
    @GetMapping("/ping")
    public Map<String, Object> ping() {
        return Map.of("ok", true);
    }

    /**
     * Identity helper. Public so the frontend can probe the session.
     * If no/basic credentials are provided, returns null username and empty roles.
     */
    @PermitAll
    @GetMapping("/whoami")
    public Map<String, Object> whoami(Authentication auth) {
        String username = (auth != null ? auth.getName() : null);

        List<String> roles = (auth != null)
                ? auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList()
                : Collections.emptyList();

        Long studentId = (username != null)
                ? ownership.studentIdFor(username).orElse(null)
                : null;

        return Map.of(
                "username", username,
                "roles", roles,
                "studentId", studentId
        );
    }

    /**
     * Forces the browser to drop cached Basic-Auth credentials.
     * We intentionally return 401 with a new realm.
     */
    @PermitAll
    @GetMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .header(HttpHeaders.WWW_AUTHENTICATE, "Basic realm=\"LoggedOut\"")
                .build();
    }
}
