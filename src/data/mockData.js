export const specialties = [
  { id: 'cardiology',     name: 'Tim mạch',        icon: '❤️',  desc: 'Chẩn đoán & điều trị các bệnh lý tim mạch' },
  { id: 'neurology',      name: 'Thần kinh',        icon: '🧠',  desc: 'Đau đầu, mất ngủ, rối loạn thần kinh' },
  { id: 'orthopedics',    name: 'Cơ xương khớp',    icon: '🦴',  desc: 'Điều trị đau lưng, khớp, cột sống' },
  { id: 'pediatrics',     name: 'Nhi khoa',         icon: '👶',  desc: 'Chăm sóc sức khỏe toàn diện cho trẻ' },
  { id: 'dermatology',    name: 'Da liễu',          icon: '🩺',  desc: 'Điều trị mụn, viêm da, các bệnh da liễu' },
  { id: 'ophthalmology',  name: 'Mắt',              icon: '👁️',  desc: 'Khám & điều trị các bệnh về mắt' },
  { id: 'gastro',         name: 'Tiêu hóa',         icon: '🫁',  desc: 'Dạ dày, đại tràng, gan mật' },
  { id: 'ent',            name: 'Tai Mũi Họng',     icon: '👂',  desc: 'Viêm xoang, viêm họng, ù tai' },
];

// Ảnh bác sĩ: người Á Đông mặc áo blouse trắng, nguồn Unsplash (CC0 / miễn phí thương mại)
export const doctors = [
  {
    id: 1,
    name: 'PGS.TS. Nguyễn Văn An',
    specialtyId: 'cardiology',
    specialty: 'Tim mạch',
    degree: 'Phó Giáo sư - Tiến sĩ',
    hospital: 'Nguyên Trưởng khoa Tim mạch BV Bạch Mai',
    experience: 20,
    rating: 4.9,
    reviewCount: 248,
    price: 350000,
    // Bác sĩ nam trung niên, áo blouse trắng
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=500&fit=crop&crop=faces,top',
    tags: ['Tim mạch can thiệp', 'Siêu âm tim', 'Tăng huyết áp'],
  },
  {
    id: 2,
    name: 'TS.BS. Trần Thị Bình',
    specialtyId: 'neurology',
    specialty: 'Thần kinh',
    degree: 'Tiến sĩ - Bác sĩ',
    hospital: 'Nguyên Phó khoa Thần kinh BV Việt Đức',
    experience: 15,
    rating: 4.8,
    reviewCount: 195,
    price: 300000,
    // Bác sĩ nữ, áo blouse trắng
    avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=500&fit=crop&crop=faces,top',
    tags: ['Đau đầu mãn tính', 'Đột quỵ', 'Parkinson'],
  },
  {
    id: 3,
    name: 'GS.TS. Lê Minh Châu',
    specialtyId: 'orthopedics',
    specialty: 'Cơ xương khớp',
    degree: 'Giáo sư - Tiến sĩ',
    hospital: 'Nguyên Giám đốc BV 108',
    experience: 25,
    rating: 4.9,
    reviewCount: 312,
    price: 400000,
    // Bác sĩ nam lớn tuổi, chuyên nghiệp
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=500&fit=crop&crop=faces,top',
    tags: ['Thay khớp háng', 'Cột sống', 'Chấn thương thể thao'],
  },
  {
    id: 4,
    name: 'ThS.BS. Phạm Thị Dung',
    specialtyId: 'pediatrics',
    specialty: 'Nhi khoa',
    degree: 'Thạc sĩ - Bác sĩ',
    hospital: 'BV Nhi Trung Ương',
    experience: 10,
    rating: 4.7,
    reviewCount: 180,
    price: 250000,
    // Bác sĩ nữ trẻ, thân thiện
    avatar: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=500&fit=crop&crop=faces,top',
    tags: ['Sơ sinh', 'Dinh dưỡng trẻ em', 'Hô hấp nhi'],
  },
  {
    id: 5,
    name: 'BS.CKI. Hoàng Văn Em',
    specialtyId: 'dermatology',
    specialty: 'Da liễu',
    degree: 'Bác sĩ Chuyên khoa I',
    hospital: 'BV Da liễu Trung Ương',
    experience: 12,
    rating: 4.6,
    reviewCount: 140,
    price: 220000,
    // Bác sĩ nam, áo blouse
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=500&fit=crop&crop=faces,top',
    tags: ['Mụn trứng cá', 'Viêm da cơ địa', 'Nấm da'],
  },
  {
    id: 6,
    name: 'TS.BS. Vũ Thị Phương',
    specialtyId: 'ophthalmology',
    specialty: 'Mắt',
    degree: 'Tiến sĩ - Bác sĩ',
    hospital: 'BV Mắt Trung Ương',
    experience: 14,
    rating: 4.8,
    reviewCount: 210,
    price: 280000,
    // Bác sĩ nữ chuyên nghiệp
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=500&fit=crop&crop=faces,top',
    tags: ['Đục thủy tinh thể', 'Glaucoma', 'Khúc xạ'],
  },
];

export const articles = [
  {
    id: 1,
    title: '5 dấu hiệu cảnh báo bệnh tim mạch bạn không nên bỏ qua',
    category: 'Tim mạch',
    categoryColor: 'bg-red-100 text-red-600',
    excerpt: 'Bệnh tim mạch là nguyên nhân tử vong hàng đầu tại Việt Nam. Nhận biết sớm các triệu chứng giúp tăng cơ hội điều trị thành công lên đến 90%.',
    date: '15/05/2026',
    readTime: '5 phút',
    image: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=600&h=350&fit=crop',
    author: 'PGS.TS. Nguyễn Văn An',
  },
  {
    id: 2,
    title: 'Chế độ dinh dưỡng cho trẻ dưới 3 tuổi: Những điều cha mẹ cần biết',
    category: 'Nhi khoa',
    categoryColor: 'bg-yellow-100 text-yellow-700',
    excerpt: 'Giai đoạn 1000 ngày đầu đời là nền tảng quyết định sức khỏe và trí tuệ của trẻ. Chế độ dinh dưỡng đúng cách giúp trẻ phát triển toàn diện.',
    date: '10/05/2026',
    readTime: '7 phút',
    image: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=600&h=350&fit=crop',
    author: 'ThS.BS. Phạm Thị Dung',
  },
  {
    id: 3,
    title: 'Đau lưng mãn tính: Nguyên nhân và phương pháp điều trị hiệu quả',
    category: 'Cơ xương khớp',
    categoryColor: 'bg-blue-100 text-blue-600',
    excerpt: 'Hơn 80% người trưởng thành từng bị đau lưng ít nhất một lần trong đời. Hiểu đúng nguyên nhân giúp lựa chọn phương pháp điều trị phù hợp.',
    date: '05/05/2026',
    readTime: '6 phút',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=350&fit=crop',
    author: 'GS.TS. Lê Minh Châu',
  },
];

export const stats = [
  { value: '15+', label: 'Năm kinh nghiệm' },
  { value: '50+', label: 'Bác sĩ chuyên khoa' },
  { value: '30.000+', label: 'Bệnh nhân tin tưởng' },
  { value: '98%', label: 'Hài lòng dịch vụ' },
];

// Avatar bệnh nhân: người Việt Nam / Á Đông, nguồn Unsplash (CC0)
export const testimonials = [
  {
    id: 1,
    name: 'Chị Nguyễn Thị Lan',
    age: 42,
    content: 'Phòng khám rất chuyên nghiệp, bác sĩ tận tâm và giải thích rõ ràng. Đặt lịch online rất tiện, không phải chờ đợi lâu như bệnh viện công.',
    rating: 5,
    // Phụ nữ Á Đông trung niên, thân thiện
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=120&h=120&fit=crop&crop=faces',
    specialty: 'Tim mạch',
  },
  {
    id: 2,
    name: 'Anh Trần Văn Hùng',
    age: 35,
    content: 'Mình đưa con đến khám nhi, bác sĩ rất nhẹ nhàng với trẻ nhỏ. Cơ sở vật chất sạch sẽ, hiện đại. Sẽ tiếp tục quay lại.',
    rating: 5,
    // Nam giới Á Đông trẻ tuổi
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop&crop=faces',
    specialty: 'Nhi khoa',
  },
  {
    id: 3,
    name: 'Bà Lê Thị Mai',
    age: 58,
    content: 'Sau nhiều năm đau khớp gối, được bác sĩ Châu tư vấn và điều trị, giờ đi lại bình thường rồi. Cảm ơn đội ngũ phòng khám rất nhiều.',
    rating: 5,
    // Phụ nữ Á Đông lớn tuổi, hiền hậu
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&h=120&fit=crop&crop=faces',
    specialty: 'Cơ xương khớp',
  },
];
