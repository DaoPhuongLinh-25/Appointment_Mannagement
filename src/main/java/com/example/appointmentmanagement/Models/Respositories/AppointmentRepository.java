
package com.example.appointmentmanagement.Models.Repositories;

import com.example.appointmentmanagement.Models.Entities.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AppointmentRepository
        extends JpaRepository<Appointment, Long> {

}
