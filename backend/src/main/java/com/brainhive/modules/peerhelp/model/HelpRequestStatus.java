package com.brainhive.modules.peerhelp.model;

/**
 * Enum representing the workflow status of a help request.
 * Workflow: PENDING -> APPROVED -> COMPLETED -> RATED
 */
public enum HelpRequestStatus {
    PENDING,    // Initial state when student creates request
    APPROVED,   // Tutor has accepted the request
    COMPLETED,  // Session has been completed
    RATED,      // Student has rated the session
    CANCELLED   // Request was cancelled
}
