
package com.example.appointmentmanagement.Controller;

import com.example.appointmentmanagement.Models.Entities.Appointment;
import com.example.appointmentmanagement.Models.Services.AppointmentService;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    // Hiển thị tất cả lịch hẹn
    @GetMapping
    public List<Appointment> getAllAppointments() {
        return appointmentService.getAllAppointments();
    }

    // Tìm lịch hẹn theo mã
    @GetMapping("/{id}")
    public Appointment getAppointmentById(@PathVariable Long id) {
        return appointmentService.getAppointmentById(id);
    }

    // Thêm lịch hẹn
    @PostMapping
    public Appointment addAppointment(@RequestBody Appointment appointment) {
        return appointmentService.addAppointment(appointment);
    }

    // Cập nhật lịch hẹn
    @PutMapping("/{id}")
    public Appointment updateAppointment(
            @PathVariable Long id,
            @RequestBody Appointment appointment) {

        return appointmentService.updateAppointment(id, appointment);
    }

    // Xóa lịch hẹn
    @DeleteMapping("/{id}")
    public String deleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);
        return "Xóa lịch hẹn thành công!";
    }

    // Tìm lịch hẹn theo ngày
    @GetMapping("/date/{date}")
    public List<Appointment> getAppointmentsByDate(@PathVariable String date) {

        LocalDate selectedDate = LocalDate.parse(date);

        return appointmentService.getAppointmentsByDate(
                selectedDate.atStartOfDay(),
                selectedDate.plusDays(1).atStartOfDay()
        );
    }
}
