package com.medicare.repository;

import com.medicare.entity.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.List;

@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, Integer> {
    List<TimeSlot> findByStatusTrue(); // Lấy các khung giờ khám đang hoạt động

    // Lấy danh sách khung giờ sắp xếp tăng dần theo thời gian bắt đầu
    List<TimeSlot> findAllByOrderByStartTimeAsc();

    //Kiểm tra khung giờ đó đã có VÀ trạng thái là 1 (đã đặt) chưa?
    boolean existsByStartTime(LocalTime startTime);
}