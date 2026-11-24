
package com.example.appointmentmanagement.Models.Services;

import com.example.appointmentmanagement.Models.Entities.Appointment;
import com.example.appointmentmanagement.Models.Repositories.AppointmentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;

    public AppointmentService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    // Lấy danh sách tất cả lịch hẹn
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    // Tìm lịch hẹn theo mã
    public Appointment getAppointmentById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn!"));
    }

    // Thêm lịch hẹn
    public Appointment addAppointment(Appointment appointment) {
        validateAppointment(appointment);

        if (isOverlapping(appointment, null)) {
            throw new RuntimeException("Lịch hẹn bị trùng thời gian!");
        }

        return appointmentRepository.save(appointment);
    }

    // Cập nhật lịch hẹn
    public Appointment updateAppointment(Long id, Appointment newAppointment) {
        Appointment oldAppointment = getAppointmentById(id);

        validateAppointment(newAppointment);

        if (isOverlapping(newAppointment, id)) {
            throw new RuntimeException("Lịch hẹn bị trùng thời gian!");
        }

        oldAppointment.setTitle(newAppointment.getTitle());
        oldAppointment.setStartTime(newAppointment.getStartTime());
        oldAppointment.setEndTime(newAppointment.getEndTime());
        oldAppointment.setLocation(newAppointment.getLocation());
        oldAppointment.setDescription(newAppointment.getDescription());

        return appointmentRepository.save(oldAppointment);
    }

    // Xóa lịch hẹn
    public void deleteAppointment(Long id) {
        Appointment appointment = getAppointmentById(id);
        appointmentRepository.delete(appointment);
    }

    // Tìm lịch hẹn theo ngày
    public List<Appointment> getAppointmentsByDate(
            LocalDateTime start, LocalDateTime end) {

        return appointmentRepository.findAll().stream()
                .filter(a -> !a.getStartTime().isAfter(end)
                        && !a.getEndTime().isBefore(start))
                .toList();
    }

    // Kiểm tra thông tin lịch hẹn
    private void validateAppointment(Appointment appointment) {

        if (appointment.getTitle() == null
                || appointment.getTitle().isBlank()) {
            throw new RuntimeException("Tiêu đề không được để trống!");
        }

        if (appointment.getStartTime() == null
                || appointment.getEndTime() == null) {
            throw new RuntimeException("Phải nhập thời gian bắt đầu và kết thúc!");
        }

        if (!appointment.getEndTime().isAfter(appointment.getStartTime())) {
            throw new RuntimeException("Thời gian kết thúc phải sau thời gian bắt đầu!");
        }
    }

    // Kiểm tra lịch hẹn bị trùng
    private boolean isOverlapping(Appointment appointment, Long excludeId) {

        List<Appointment> appointments = appointmentRepository.findAll();

        for (Appointment a : appointments) {

            if (excludeId != null && a.getId().equals(excludeId)) {
                continue;
            }

            boolean overlap =
                    appointment.getStartTime().isBefore(a.getEndTime())
                            && appointment.getEndTime().isAfter(a.getStartTime());

            if (overlap) {
                return true;
            }
        }

        return false;
    }
}
