package com.example.course.security;

import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

/**
 * Maps authenticated usernames to Student IDs they "own".
 * For now it's a simple in-memory map so we can enforce ownership.
 * Replace with DB lookup when you add real accounts.
 */
@Service
public class OwnershipService {

    // TEMP mapping: adjust IDs to match your seeded Student rows
    private final Map<String, Long> userToStudentId = Map.of(
        "student", 1L // "student" user controls Student#1
        // add more mappings if you create additional student users
    );

    /** Return the studentId for a username, or empty if the user isn't a student. */
    public Optional<Long> studentIdFor(String username) {
        return Optional.ofNullable(userToStudentId.get(username));
    }
}
