import { generateId } from '../utils/helpers.js';

// User types that auto-get admin role
export const ADMIN_POSITIONS = ['Cán bộ', 'Trưởng Ban', 'Trưởng phòng', 'Giám đốc'];
export const MEMBER_POSITIONS = ['Trưởng Ban', 'Giám đốc', 'Trưởng phòng', 'Cán bộ', 'Thực tập sinh', 'Cộng tác viên'];

export function getSampleData() {
    const tags = [
        { id: 'TAG_DESIGN1234', name: 'Design', color: '#E774BB' },
        { id: 'TAG_CONTENT123', name: 'Content', color: '#579DFF' },
        { id: 'TAG_OPERATE123', name: 'Operate', color: '#4BCE97' },
        { id: 'TAG_BOOKING123', name: 'Booking', color: '#F5CD47' },
        { id: 'TAG_EMAIL12345', name: 'Email', color: '#F87168' },
        { id: 'TAG_TECH123456', name: 'Tech', color: '#9F8FEF' }
    ];

    const projects = [];

    const members = [
        {
            "id": "MEM001",
            "fullName": "Phạm Tuyết Hạnh Hà",
            "phone": "0915378070",
            "emailFE": "hapth@fe.edu.vn",
            "emailFPT": "hapth@fpt.edu.vn",
            "gmail": "",
            "location": "Hà Nội",
            "position": "Trưởng Ban",
            "school": "Đại học FPT Hà Nội",
            "generation": "",
            "cccd": "",
            "mst": "",
            "dob": "1984-10-29",
            "startDate": "2021-04-01",
            "isAdmin": true
        },
        {
            "id": "MEM002",
            "fullName": "Đỗ Hữu Phát",
            "phone": "0348669124",
            "emailFE": "phatdh4@fe.edu.vn",
            "emailFPT": "phatdh4@fpt.edu.vn",
            "gmail": "dhphat12@gmail.com",
            "location": "TP.HCM",
            "position": "Trưởng Phòng STND",
            "school": "Đại học FPT TP.HCM",
            "generation": "K12",
            "cccd": "331803885",
            "mst": "8659877982",
            "dob": "1998-12-09",
            "startDate": "2021-06-02",
            "isAdmin": true
        },
        {
            "id": "MEM003",
            "fullName": "Nguyễn Thị Yến Linh",
            "phone": "0966315435",
            "emailFE": "linhnty11@fe.edu.vn",
            "emailFPT": "linhnty11@fe.edu.vn",
            "gmail": "",
            "location": "TP.HCM",
            "position": "Cán bộ - Nhân viên",
            "school": "Đại học FPT TP.HCM",
            "generation": "K14",
            "cccd": "27300003394",
            "mst": "8600494436",
            "dob": "2000-07-18",
            "startDate": "2021-06-03"
        },
        {
            "id": "MEM004",
            "fullName": "Nguyễn Thảo Minh Hiền",
            "phone": "0934612956",
            "emailFE": "hienntm11@fe.edu.vn",
            "emailFPT": "hienntm11@fpt.edu.vn",
            "gmail": "minhhienguyenthao@gmail.com",
            "location": "Hà Nội",
            "position": "Cán bộ - Nhân viên",
            "school": "Đại học FPT Hà Nội",
            "generation": "K16",
            "cccd": "001302001158",
            "mst": "",
            "dob": "2002-04-20",
            "startDate": "2024-11-04"
        },
        {
            "id": "MEM005",
            "fullName": "Lê Việt Long",
            "phone": "0969238966",
            "emailFE": "longlv27@fe.edu.vn",
            "emailFPT": "",
            "gmail": "",
            "location": "Hà Nội",
            "position": "Cán bộ - Nhân viên",
            "school": "Đại học FPT Hà Nội",
            "generation": "",
            "cccd": "1097003967",
            "mst": "",
            "dob": "1997-02-02",
            "startDate": "2022-06-18"
        },
        {
            "id": "MEM006",
            "fullName": "Đỗ Thị Mỹ Trang",
            "phone": "0375156543",
            "emailFE": "trangdtm11@fe.edu.vn",
            "emailFPT": "trangdtmss150466@fpt.edu.vn",
            "gmail": "",
            "location": "TP.HCM",
            "position": "Cán bộ - Nhân viên",
            "school": "Đại học FPT TP.HCM",
            "generation": "K15",
            "cccd": "86301003289",
            "mst": "8667177134",
            "dob": "2001-08-22",
            "startDate": "2021-06-03"
        },
        {
            "id": "MEM007",
            "fullName": "Trần Thiên Quý",
            "phone": "0335657532",
            "emailFE": "quytt16@fe.edu.vn",
            "emailFPT": "quytt16@fe.edu.vn",
            "gmail": "tranthienquy98@gmail.com",
            "location": "TP.HCM",
            "position": "Cán bộ - Nhân viên",
            "school": "Đại học FPT TP.HCM",
            "generation": "K12",
            "cccd": "804098008844",
            "mst": "8695391524",
            "dob": "1998-11-08",
            "startDate": "2022-10-01"
        },
        {
            "id": "MEM008",
            "fullName": "Vũ Thị Thảo Dương",
            "phone": "0359406301",
            "emailFE": "duongvtt12@fe.edu.vn",
            "emailFPT": "",
            "gmail": "thaoduong250203@gmail.com",
            "location": "Hà Nội",
            "position": "Cán bộ - Nhân viên",
            "school": "Đại học FPT Hà Nội",
            "generation": "",
            "cccd": "",
            "mst": "",
            "dob": "2003-02-25",
            "startDate": ""
        },
        {
            "id": "MEM009",
            "fullName": "Nguyễn Bạch Ngọc",
            "phone": "0819668083",
            "emailFE": "ngocnb42@fe.edu.vn",
            "emailFPT": "ngocnb42@fpt.edu.vn",
            "gmail": "bachhngocc@gmail.com",
            "location": "Hà Nội",
            "position": "Cán bộ - Nhân viên",
            "school": "Đại học FPT Hà Nội",
            "generation": "",
            "cccd": "010301007613",
            "mst": "",
            "dob": "2001-04-26",
            "startDate": ""
        },
        {
            "id": "MEM010",
            "fullName": "Hồ Vân Khanh",
            "phone": "0935451169",
            "emailFE": "khanhhvds170474@fpt.edu.vn",
            "emailFPT": "",
            "gmail": "",
            "location": "Hà Nội",
            "position": "Cán bộ - Nhân viên",
            "school": "Đại học FPT Đà Nẵng",
            "generation": "K17",
            "cccd": "48203008206",
            "mst": "8653027883",
            "dob": "",
            "startDate": "2022-03-30"
        },
        {
            "id": "MEM011",
            "fullName": "Trần Đức Nam",
            "phone": "0962573983",
            "emailFE": "namtrd26@fe.edu.vn",
            "emailFPT": "",
            "gmail": "namtranduc267@gmail.com",
            "location": "Hà Nội",
            "position": "Cán bộ - Nhân viên",
            "school": "Đại học FPT Hà Nội",
            "generation": "",
            "cccd": "",
            "mst": "",
            "dob": "1998-07-26",
            "startDate": ""
        },
        {
            "id": "MEM012",
            "fullName": "Lê Thị Hồng",
            "phone": "0375521959",
            "emailFE": "honglt56@fe.edu.vn",
            "emailFPT": "honglt56@fpt.edu.vn",
            "gmail": "lehong95ctxh@gmail.com",
            "location": "Hà Nội",
            "position": "Cán bộ - Nhân viên",
            "school": "Đại học FPT Hà Nội",
            "generation": "",
            "cccd": "034195002838",
            "mst": "8570746997",
            "dob": "1995-12-28",
            "startDate": ""
        },
        {
            "id": "MEM013",
            "fullName": "Lê Ngọc Tuấn",
            "phone": "",
            "emailFE": "",
            "emailFPT": "",
            "gmail": "",
            "location": "",
            "position": "Giám đốc CN",
            "school": "",
            "generation": "",
            "cccd": "",
            "mst": "",
            "dob": "",
            "startDate": "",
            "isAdmin": true
        }
    ];

    const tasks = [];
    const dataItems = [];

    return { projects, members, tasks, dataItems, tags };
}
