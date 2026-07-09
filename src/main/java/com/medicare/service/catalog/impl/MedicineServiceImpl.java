package com.medicare.service.catalog.impl;

import com.medicare.dto.request.MedicineRequestDTO;
import com.medicare.dto.response.MedicineResponseDTO;
import com.medicare.entity.Medicine;
import com.medicare.exception.CustomException;
import com.medicare.mapper.CatalogMapper;
import com.medicare.repository.MedicineRepository;
import com.medicare.repository.PrescriptionDetailRepository;
import com.medicare.service.catalog.MedicineService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
public class MedicineServiceImpl implements MedicineService {

    private final MedicineRepository medicineRepository;
    private final CatalogMapper catalogMapper;
    private final PrescriptionDetailRepository prescriptionDetailRepository;

    @Override
    public Page<MedicineResponseDTO> getAllMedicines(String keyword, Pageable pageable) {
        return medicineRepository.findAllWithFilter(keyword, pageable)
                .map(catalogMapper::toMedicineResponseDTO);
    }

    @Override
    @Transactional
    public Medicine createMedicine(Medicine medicine) {
        return medicineRepository.save(medicine);
    }

    @Override
    @Transactional
    public void deleteMedicine(Integer id) {
        if (!medicineRepository.existsById(id)) {
            throw new CustomException("Thuốc không tồn tại trên hệ thống để xóa.", HttpStatus.NOT_FOUND);
        }

        // Kiểm tra xem thuốc đã được kê vào bất kỳ Đơn thuốc nào chưa
        if (prescriptionDetailRepository.existsByMedicine_Id(id)) {
            throw new CustomException("Không thể xóa: Thuốc này đã được kê trong đơn thuốc của bệnh nhân. Để bảo toàn lịch sử y tế, bạn không thể xóa dữ liệu này.", HttpStatus.BAD_REQUEST);
        }
        medicineRepository.deleteById(id);
    }

    @Override
    @Transactional
    public MedicineResponseDTO updateMedicine(Integer id, MedicineRequestDTO request){
        Medicine medicine= medicineRepository.findById(id)
                .orElseThrow(() -> new CustomException("Không tồn tại thuốc", HttpStatus.NOT_FOUND));
        if(request.getName() != null){
            medicine.setName(request.getName());
        }
        if(request.getUnit() !=null){
            medicine.setUnit(request.getUnit());
        }
        if(request.getUsageInstructions() !=null){
            medicine.setUsageInstructions(request.getUsageInstructions());
        }
        Medicine savedMedicine= medicineRepository.save(medicine);

        return catalogMapper.toMedicineResponseDTO(savedMedicine);
    }
}