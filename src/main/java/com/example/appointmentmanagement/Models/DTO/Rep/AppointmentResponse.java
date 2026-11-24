
package com.example.appointmentmanagement.Models.DTO.Rep;

import java.time.LocalDateTime;

public class AppointmentResponse {

    private Long id;

    private String title;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private String location;

    private String description;

    public AppointmentResponse() {
    }

    public AppointmentResponse(Long id, String title,
                               LocalDateTime startTime,
                               LocalDateTime endTime,
                               String location,
                               String description) {
        this.id = id;
        this.title = title;
        this.startTime = startTime;
        this.endTime = endTime;
        this.location = location;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public String getLocation() {
        return location;
    }

    public String getDescription() {
        return description;
    }
}
