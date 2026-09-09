import fs from 'fs';

const rawCsv = `id,fullName,mssv,phone,emailFE,emailFPT,gmail,location,position,school,generation,cccd,mst,dob,startDate,isAdmin,accessHistory,avatar,note,createdAt,isMaster,tags,projectRoles,facebook,tiktok,bankName,bankAccount,bankAccountName,bankBranch,status
ADMIN_394,Cóc Admin,,,,,cocsaigon.website@gmail.com,,Admin website,,,,,,,TRUE,"[""2026-08-18""]",,,8/18/26 21:41,FALSE,[],{},,,,,,,active
MEM002,Đỗ Hữu Phát,,348669124,phatdh4@fe.edu.vn,phatdh4@fpt.edu.vn,dhphat12@gmail.com,TP.HCM,Trưởng Phòng STND,,K12,331803885,8659877982,12/9/1998,6/2/2021,TRUE,"[""2026-08-17"", ""2026-08-18""]",,,8/18/26 21:20,FALSE,[],{},,,,,,,active
MEM014,Nguyen Phuong,,392097582,,,ppp33623@gmail.com,TP.HCM,Chủ nhiệm,,,,,,,FALSE,"[""2026-08-17"", ""2026-08-18""]",,,8/18/26 21:47,FALSE,[],"{""msysppwsdynjspp1b"": ""Sub""}",,,,,,,active
CSG08004,Châu Hoàng Gia Bảo,SB61341,833322153,,,BaoCHG@fe.edu.vn,CSG - HCM CAMPUS,Mentor IC - PDP,,K12,352452097,,31/03/1998,6/10/2016,FALSE,,,,,,,,https://www.facebook.com/DigitalMKT.Pun,,,,,,
CSG08001,Đỗ Hữu Phát,SE62856,335657532,,,phatdh4@fe.edu.vn,CSG - HCM CAMPUS,Mentor CLB,,K12,331803885,,9/12/1998,13/10/2016,FALSE,,,,,,,,https://www.facebook.com/thienquy.tran.3,,,,,,
CSG11088,Nguyễn Khắc Trung Nguyên,SE150207,983941396,,,nguyennktse150207@fpt.edu.vn,CSG - HCM CAMPUS,,,K15,225828167,,26/11/2001,16/11/2019,FALSE,,,,,,,,https://www.facebook.com/Aquoc.2k2,,,,,,
CSG11089,Nguyễn Ngọc Thanh Thảo,SS150404,905144699,,,thaonnt.work@gmail.com,CSG - HCM CAMPUS,,,K15,79301013335,,14/06/2001,16/11/2019,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100006790396578,,,,,,
CSG11102,Thập Bình Phương,SS150076,354019580,,,phuongtbdigital@gmail.com,CSG - HCM CAMPUS,Mentor HR,,K15,264538206,,9/7/2001,16/11/2019,FALSE,,,,,,,,https://www.facebook.com/EricPhannn,,,,,,
CSG11053,Trần Thiên Quý,SE63199,901325178,,,quytt16@fe.edu.vn,CSG - HCM CAMPUS,Mentor Event,,,334968569,,8/11/1998,16/11/2019,FALSE,,,,,,,,https://www.facebook.com/tiencuong.nguyen.773124,,,,,,
CSG12231,Hoàng Đình Anh Quốc,SE161320,817818898,,,anhquoc2906@gmail.com,CSG - HCM CAMPUS,Mentor Website,,K16,79202006608,,29/06/2002,11/11/2020,FALSE,,,,,,,,https://www.facebook.com/NhanNguyen.15,,,,,,
CSG12175,Võ Như Ngọc,SS160061,976830313,,,ngocvnss160061@fpt.edu.vn,CSG - HCM CAMPUS,Mentor CLB,,K16,187968777,,24/10/2002,11/11/2020,FALSE,,,,,,,,https://www.facebook.com/nhumai.134,,,,,,
CSG13249,Phan Văn Hào,SE160884,971400801,,,haopvse160884@fpt.edu.vn,CSG - HCM CAMPUS,Mentor Video,,K16,206337969,,20/05/2002,18/05/2021,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100015769203550,,,,,,
CSG13301,Nguyễn Tiến Cường,SE171224,569097382,,,cuongntse171224@fpt.edu.vn,CSG - HCM CAMPUS,Leader Planing,,K17,87203000053,,9/9/2003,25/10/2021,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100010238734466,,,,,,
CSG13318,Nguyễn Hoàng Nhân,SE171176,936075209,,,nhannhse171176@fpt.edu.vn,CSG - HCM CAMPUS,,,K17,77203006272,,20/03/2003,25/10/2021,FALSE,,,,,,,,https://www.facebook.com/thanh.tai.39566,,,,,,
CSG13319,Đào Như Mai,SS171099,949711501,,,maidnss171099@fpt.edu.vn,CSG - HCM CAMPUS,Mentor Photo,,K17,51303013522,,13/04/2003,25/10/2021,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100012460920546,,,,,,
CSG13339,Nguyễn Trần Hồng Phúc,SE171795,582106273,,,phucnthse171795@fpt.edu.vn,CSG - HCM CAMPUS,,,K17,79303001910,,29/04/2003,25/10/2021,FALSE,,,,,,,,https://www.facebook.com/TuanKeith.DH/,,,,,,
CSG13361,Nguyễn Đình Khánh Đoan,21DH700408,963922640,,,kdoan944@gmail.com,CSG - HCM CAMPUS,Mentor Content,,,79303019052,,3/3/2003,25/10/2021,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100022018689723,,,,,,
CSG13368,Lại Thành Tài,SS170385,377324703,,,thanhtailai2003@gmail.com,CSG - HCM CAMPUS,Mentor HR,,K17,7920304612,,16/03/2003,25/10/2021,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100071312027885,,,,,,
CSG13388,Nguyễn Ngọc Cát Tường,SS171033,902422924,,,nnct6628@gmail.com,CSG - HCM CAMPUS,VHD HR,,K17,272959468,,10/5/2003,25/10/2021,FALSE,,,,,,,,https://www.facebook.com/sieucasi,,,,,,
CSG13399,Đặng Hoàng Tuấn Kiệt,SE171962,946420600,,,tuankietdanghoang@gmail.com,CSG - HCM CAMPUS,,,K17,312556882,,6/10/2003,17/01/2022,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100082758854637,,,,,,
CSG13400,Trần Thị Trang Nhung,PK03562,922024177,,,trannhung123567@gmail.com,CSG - HCM CAMPUS,,,,66303005095,,24/01/2003,17/01/2022,FALSE,,,,,,,,https://www.facebook.com/Hot.Potato.1707?mibextid=LQQJ4d,,,,,,
CSG13401,Nguyễn Nhân Kiệt,SE173108,708861820,,,kietnnse173108@fpt.edu.vn,CSG - HCM CAMPUS,Leader Video,,K17,52203000388,,26/11/2003,17/01/2022,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100015751711128&mibextid=LQQJ4d,,,,,,
CSG13426,Lê Nguyễn Đăng Khoa,SE172734,936616938,,,KhoaLNDSE172734@fpt.edu.vn,CSG - HCM CAMPUS,,,K17,72203001010,,19/11/2003,13/04/2022,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100070847229057,,,,,,
CSG14453,Lê Quốc Anh,SS180612,392097582,,,anhlqss180612@fpt.edu.vn,CSG - HCM CAMPUS,,,K18,54204006302,,1/5/2004,11/12/2022,FALSE,,,,,,,,https://www.facebook.com/iamdupu231,,,,,,
CSG14455,Bùi Nguyễn Quỳnh Mai,SE182565,913115573,,,buinguyenquynhmai.2004@gmail.com,CSG - HCM CAMPUS,Mentor Design,,K18,79304010817,,17/07/2004,11/12/2022,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100037565921181&mibextid=LQQJ4d,,,,,,
CSG14456,Đặng Ngọc Anh Thư,SS180808,523368350,,,danganhthu2804@gmail.com,CSG - HCM CAMPUS,Leader Website,,K18,79304015946,,2/8/2004,11/12/2022,FALSE,,,,,,,,https://www.facebook.com/PeterNguyen1707,,,,,,
CSG14459,Nguyễn Thái Bảo,SE161155,934051263,,,nguyenthaibao726@gmail.com,CSG - HCM CAMPUS,,,K16,79202017330,,30/06/2002,11/12/2022,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100025563003470&mibextid=ZbWKwL,,,,,,
CSG14460,Nguyễn Hoàng Đức Phương,SE182276,937089817,,,phuongnhdse182276@fpt.edu.vn,CSG - HCM CAMPUS,VP HR,,K18,75204002729,,23/01/2004,11/12/2022,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100053599747738,,,,,,
CSG14461,Trần Khang Nhật Linh,SE184823,817220679,,,nhatlinh15573@gmail.com,CSG - HCM CAMPUS,Leader Accouting,,K18,79304010308,,4/11/2004,11/12/2022,FALSE,,,,,,,,https://www.facebook.com/nhd.ttla,,,,,,
CSG14466,Nguyễn Hoàng Minh,SE183472,783439588,,,MinhNHSE183472@fpt.edu.vn,CSG - HCM CAMPUS,,,K18,79204005402,,17/07/2004,11/12/2022,FALSE,,,,,,,,https://www.facebook.com/winniethepoh.TR?mibextid=ZbWKwL,,,,,,
CSG14467,Huỳnh Ngọc Minh Thư,SS181035,824264220,,,thuhnmss181035@fpt.edu.vn,CSG - HCM CAMPUS,,,K18,79304013757,,7/2/2004,11/12/2022,FALSE,,,,,,,,https://www.facebook.com/takhanhvy271203,,,,,,
CSG14468,Nguyễn Mỹ Ngọc,SS180812,902256272,,,ngocnmss180812@fpt.edu.vn,CSG - HCM CAMPUS,Mentor Media,,K18,74304000247,,10/2/2004,11/12/2022,FALSE,,,,,,,,https://www.facebook.com/r4dishhh,,,,,,
CSG14472,Đỗ Hoàng Tỷ Phú,SE173569,911611933,,,phudhtse173569@fpt.edu.vn,CSG - HCM CAMPUS,,,K17,82203000989,,18/11/2003,11/12/2022,FALSE,,,,,,,,https://www.facebook.com/100014662429007/,,,,,,
CSG14484,Nguyễn Ngọc Minh Trí,SE182325,886380067,,,minhtri.tphcm.2612@gmail.com,CSG - HCM CAMPUS,,,K18,96204000113,,26/12/2004,11/12/2022,FALSE,,,,,,,,https://www.facebook.com/MinhSKD.29042004,,,,,,
CSG14503,Tạ Khánh Vy,SS180582,329329161,,,vytkss180582@fpt.edu.vn,CSG - HCM CAMPUS,,,K18,64304012858,,27/12/2003,11/12/2022,FALSE,,,,,,,,https://www.facebook.com/tfatneee,,,,,,
CSG14508,Nguyễn Nhật Huy,SE183280,703318824,,,huynnse183280@fpt.edu.vn,CSG - HCM CAMPUS,,,K18,79204022646,,21/10/2004,11/12/2022,FALSE,,,,,,,,https://www.facebook.com/NguyenThanhHongNgan0402/,,,,,,
CSG14511,Trần Quang Huy,SE182122,338803121,,,huytqse182122@fpt.edu.vn,CSG - HCM CAMPUS,,,K18,92204003623,,19/12/2004,11/12/2022,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100058988295599&mibextid=LQQJ4d,,,,,,
CSG14522,Nguyễn Gia Minh,SS180795,839221741,,,minhngss180795@fpt.edu.vn,CSG - HCM CAMPUS,,,K18,79204032476,,29/04/2004,11/12/2022,FALSE,,,,,,,,https://www.facebook.com/nhi.phamtuyet.12327,,,,,,
CSG14537,Lê Đình Tấn Phát,SE184497,903666252,,,phatldtse184497@fpt.edu.vn,CSG - HCM CAMPUS,,,K18,52204000102,,22/07/2004,11/12/2022,FALSE,,,,,,,,https://www.facebook.com/tlian.cre/,,,,,,
CSG14538,Nguyễn Thanh Hồng Ngân,SS180172,905607272,,,ngannthss180172@fpt.edu.vn,CSG - HCM CAMPUS,,,K18,68303010857,,4/2/2003,11/12/2022,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100013641937296&mibextid=LQQJ4d,,,,,,
CSG14540,Bùi Hoàng Tú,SE185048,924700498,,,tubui7185@gmail.com,CSG - HCM CAMPUS,,,K18,75204002925,,1/1/2004,11/12/2022,FALSE,,,,,,,,https://www.facebook.com/TiexTie04,,,,,,
CSG14547,Phạm Thị Tuyết Nhi,SS180126,793786945,,,nhiphamngoc160504@gmail.com,CSG - HCM CAMPUS,President,,K18,68304008076,,16/05/2004,11/12/2022,FALSE,,,,,,,,https://www.facebook.com/nhatminh.truongnguyen.1,,,,,,
CSG14552,Nguyễn Huỳnh Thanh Liêm,SE184918,903399461,,,liemnhtse184918@fpt.edu.vn,CSG - HCM CAMPUS,,,K18,79204003037,,1/2/2004,11/12/2022,FALSE,,,,,,,,https://www.facebook.com/HezrtHeartfilia/,,,,,,
CSG14563,Đặng Minh Đức,SS170362,916345452,,,hanhndmss180820@fpt.edu.vn,CSG - HCM CAMPUS,Mentor Event,,K17,77203007161,,8/8/2003,11/12/2022,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100043971618093&mibextid=LQQJ4d,,,,,,
CSG14566,Lê Thanh Tiến,SS181441,356868499,,,lethanhtien591@gmail.com,CSG - HCM CAMPUS,,,K18,79204035393,,2/7/2004,11/12/2022,FALSE,,,,,,,,https://www.facebook.com/vmtrung20?mibextid=LQQJ4d,,,,,,
CSG14569,Trương Nguyễn Nhật Minh,SS181229,888789001,,,minhtnnss181229@fpt.edu.vn,CSG - HCM CAMPUS,,,K18,74204002486,,18/10/2004,11/12/2022,FALSE,,,,,,,,https://www.facebook.com/mikenguyen.ntm,,,,,,
CSG14577,Nguyễn Song Châu Thịnh,SE173464,902792025,,,thinh0608bn@gmail.com,CSG - HCM CAMPUS,,,K17,79203011021,,6/8/2003,11/12/2022,FALSE,,,,,,,,https://www.facebook.com/minh.anh.Luftmensch?mibextid=ZbWKwL,,,,,,
CSG15001,Lê Nhật Minh,SE191127,349372424,,,minhledfg358@gmail.com,CSG - CT CAMPUS,,,K19,68205010402,,9/9/2005,8/12/2023,FALSE,,,,,,,,https://www.facebook.com/baolong.duong.5648?mibextid=LQQJ4d,,,,,,
CSG15003,Võ Minh Trung,SE196241,911887141,,,vmtrung20.ltv@gmail.com,CSG - HCM CAMPUS,VP Event,,K19,52205015755,,20/12/2005,8/12/2023,FALSE,,,,,,,,https://www.facebook.com/lqkoi29,,,,,,
CSG15006,Nguyễn Thế Minh,SE196686,969439953,,,nguyenminh110505@gmail.com,CSG - OUTSIDER,,,K19,56205010709,,11/5/2005,8/12/2023,FALSE,,,,,,,,https://www.facebook.com/minhthu.le2601?mibextid=LQQJ4d,,,,,,
CSG15011,Phan Huỳnh Minh Anh,SE194726,975830473,,,Minhanh11082005@gmail.com,CSG - HCM CAMPUS,,,K19,79305008325,,11/8/2005,8/12/2023,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100014956187467&mibextid=ZbWKwL,,,,,,
CSG15013,Dương Bảo Long,CS190052,981689028,,,longdb.cs190052@gmail.com,CSG - HCM CAMPUS,,,K19,89205003246,,4/11/2005,8/12/2023,FALSE,,,,,,,,https://www.facebook.com/manh.nguyen.120301?mibextid=LQQJ4d,,,,,,
CSG15016,Lê Quốc Khánh,SE193989,917181612,,,lqkhanh292005@gmail.com,CSG - HCM CAMPUS,Mentor team Event,,K19,80205010814,,2/9/2005,8/12/2023,FALSE,,,,,,,,https://www.facebook.com/dec6teen?mibextid=LQQJ4d,,,,,,
CSG15022,Lê Minh Thư,60305000074,869764555,,,minhthu.le2601@gmail.com,CSG - HCM CAMPUS,,,K30,60305000074,,26/01/2005,8/12/2023,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100079337028655&mibextid=ZbWKwL,,,,,,
CSG15023,Trịnh Yến Phương,SS193628,826380143,,,trinhyenphuong321@gmail.com,CSG - HCM CAMPUS,Mentor Media,,K19,75305020470,,5/12/2005,8/12/2023,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100071342507663,,,,,,
CSG15024,Nguyễn Đăng Mạnh,SS194455,388059038,,,dangmanh123003@gmail.com,CSG - HCM CAMPUS,Leader Photo,,K19,79201018240,,12/3/2001,8/12/2023,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100053984692205&mibextid=ZbWKwL,,,,,,
CSG15025,Nguyễn Phước Thanh Tâm,SS192669,937140131,,,nguyenphuocthtam@gmail.com,CSG - HCM CAMPUS,Mentor ER,,K19,79305018975,,16/12/2005,8/12/2023,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100070491811938&mibextid=LQQJ4d,,,,,,
CSG15029,Lâm Quang Hưng,SS196557,966153166,,,quanghunglam1208@gmail.com,CSG - HCM CAMPUS,,,K19,56205008811,,12/8/2005,8/12/2023,FALSE,,,,,,,,https://www.facebook.com/thaovy2505?mibextid=ZbWKwL,,,,,,
CSG15032,Lê Cao Đăng Minh,SE183386,397494679,,,lecaodangminh@gmail.com,CSG - HCM CAMPUS,,,K18,51204000049,,30/04/2004,8/12/2023,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100038786051175&locale=vi_VN,,,,,,
CSG15033,Nguyễn Huy Hoàng,SS196580,927617149,,,huyhoangfu1@gmail.com,CSG - HCM CAMPUS,,,K19,64205010934,,1/1/2005,8/12/2023,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100049391242002&mibextid=LQQJ4d,,,,,,
CSG15035,Tạ Ngọc Thanh Thanh,SE192229,395539233,,,tathanh742@gmail.com,CSG - HCM CAMPUS,,,K19,79305001582,,16/02/2005,8/12/2023,FALSE,,,,,,,,https://www.facebook.com/vi.trieu.7771586?mibextid=ZbWKwL,,,,,,
CSG15040,Nguyễn Lê Thảo Vy,SS193038,857038468,,,nguyenlethaovy2505@gmail.com,CSG - HCM CAMPUS,,,K19,79305001113,,25/05/2005,8/12/2023,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100038818374068&mibextid=LQQJ4d,,,,,,
CSG15044,Phạm Ngọc Bảo Trâm,SE193678,909718889,,,phamngocbaotram0000@gmail.com,CSG - HCM CAMPUS,,,K19,77305005088,,7/4/2005,8/12/2023,FALSE,,,,,,,,https://www.facebook.com/tunthetyro,,,,,,
CSG15048,Nguyễn Thế Hiển,SS190197,764236995,,,nguyenthehien28062005@gmail.com,CSG - OUTSIDER,,,K19,89205018453,,28/06/2005,8/12/2023,FALSE,,,,,,,,https://www.facebook.com/doannaaa,,,,,,
CSG15049,Lê Triệu Vi,SS190257,797389371,,,letrieuvi09@gmail.com,CSG - HCM CAMPUS,,,K19,89305011163,,9/3/2005,8/12/2023,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100027012432481&mibextid=tzlV2A,,,,,,
CSG15058,Trần Quốc Hiệp,SE183503,917788277,,,hieptqse183503@fpt.edu.vn,CSG - HCM CAMPUS,,,K18,68204013932,,16/10/2004,8/12/2023,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100090241009632,,,,,,
CSG15065,Huỳnh Bá Trung,SE190750,899412105,,,tunthetyro@gmail.com,CSG - HCM CAMPUS,,,K19,83205001355,,20/08/2005,8/12/2023,FALSE,,,,,,,,https://www.facebook.com/l.tuonggvi?mibextid=LQQJ4d,,,,,,
CSG15067,Đoàn Thị Lê Na,42304004419,372187432,,,nadg2501@gmail.com,CSG - HCM CAMPUS,,,K30,42304004419,,25/06/2004,8/12/2023,FALSE,,,,,,,,https://www.facebook.com/share/1FUVpwDFYG/?mibextid=wwXIfr,,,,,,
CSG15068,Nguyễn Bảo Ngọc,SE171101,939643769,,,ngocnbse171101@fpt.edu.vn,CSG - HCM CAMPUS,,,K17,77303001046,,15/09/2003,8/12/2023,FALSE,,,,,,,,https://www.facebook.com/sybaoduy.ng?mibextid=LQQJ4d,,,,,,
CSG15070,Nguyễn Hùng Hiếu,SS180903,938017481,,,hieunhss180903@fpt.edu.vn,CSG - HCM CAMPUS,VP MeloCee,,K18,74204001249,,8/9/2004,8/12/2023,FALSE,,,,,,,,https://www.facebook.com/share/1Yg9n8x2KK/?mibextid=wwXIfr,,,,,,
CSG15071,Lưu Phạm Tường Vi,SS192721,914951212,,,tuongvi21052005@gmail.com,CSG - HCM CAMPUS,,,K19,38305000086,,21/05/2005,8/12/2023,FALSE,,,,,,,,https://www.facebook.com/nhitue.29?mibextid=LQQJ4d,,,,,,
CSG15072,Trần Quốc Thái,SE192786,911164466,,,tqt12342018s@gmail.com,CSG - HCM CAMPUS,,,K19,80205002191,,18/05/2005,8/12/2023,FALSE,,,,,,,,https://www.facebook.com/minhdung.tran.73307634?mibextid=ZbWKwL,,,,,,
CSG15074,Ngô Sỹ Bảo Duy,SE192371,966217475,,,Bdbdh3208@gmail.com,CSG - HCM CAMPUS,,,K19,40205002770,,14/09/2005,8/12/2023,FALSE,,,,,,,,https://www.facebook.com/giangyeumykhanh?mibextid=hrBMPu,,,,,,
CSG15083,Vũ Nguyễn Đoan Nguyên,SS193976,704876786,,,vunguyendoanguyen@gmail.com,CSG - HCM CAMPUS,VHD Event,,K19,30305000199,,24/10/2005,8/12/2023,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100030765212353&mibextid=ZbWKwL,,,,,,
CSG15094,Lê Tuệ Nhi,SS190741,393795642,,,tuenhile34@gmail.com,CSG - HCM CAMPUS,,,K19,66305015650,,29/10/2005,8/12/2023,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100037031931125&mibextid=ZbWKwL,,,,,,
CSG15102,Trần Minh Dũng,SS181435,869035948,,,dungtmss181435@fpt.edu.vn,CSG - HCM CAMPUS,,,K18,79204017733,,21/03/2004,8/12/2023,FALSE,,,,,,,,https://www.facebook.com/nbt068,,,,,,
CSG15106,Trần Trà Giang,SS180038,934994910,,,giangttss180038@fpt.edu.vn,CSG - HCM CAMPUS,,,K18,68304002496,,16/05/2004,8/12/2023,FALSE,,,,,,,,https://www.facebook.com/giahan280105?mibextid=ZbWKwL,,,,,,
CSG15108,Phùng Tuấn Minh,SE194082,886193978,,,phungtuanminh17@gmail.com,CSG - HCM CAMPUS,,,K19,75205002995,,18/11/2005,8/12/2023,FALSE,,,,,,,,https://www.facebook.com/nganha.phan.37017?mibextid=LQQJ4d,,,,,,
CSG15111,Phạm Hữu Đạt,SE193873,339247422,,,phamdatt311@gmail.com,CSG - HCM CAMPUS,,,K19,58205006497,,31/10/2005,8/12/2023,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100022775586631&mibextid=ZbWKwL,,,,,,
CSG15118,Nguyễn Bảo Thy,SE180741,925453575,,,thynbse180741@fpt.edu.vn,CSG - HCM CAMPUS,,,K18,36304007652,,27/11/2004,8/12/2023,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100038785538544,,,,,,
CSG15124,Trần Ngô Gia Hân,SS196248,384862759,,,tranngogiahan01@gmail.com,CSG - HCM CAMPUS,,,K19,46305010699,,28/01/2005,8/12/2023,FALSE,,,,,,,,https://www.facebook.com/lt.but,,,,,,
CSG15127,Phan Ngân Hà,SS196281,339099077,,,nganha070605@gmail.com,CSG - HCM CAMPUS,,,K19,44305005438,,7/6/2005,8/12/2023,FALSE,,,,,,,,https://www.facebook.com/KhangAnh.4925?mibextid=ZbWKwL,,,,,,
CSG15128,Đặng Nguyễn Hoàng Yến,SS192380,911307879,,,yen649292@gmail.com,CSG - HCM CAMPUS,,,K19,79305024618,,30/08/2005,8/12/2023,FALSE,,,,,,,,https://www.facebook.com/LaSolV0,,,,,,
CSG15131,Trần Quang Thuận,SE182998,859075020,,,ThuanTQSE182998@fpt.edu.vn,CSG - HCM CAMPUS,,,K18,79204005273,,30/04/2004,8/12/2023,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100061671910871,,,,,,
CSG15138,Phạm Thế Anh,SE196852,973252579,,,mr28042005@gmail.com,CSG - HCM CAMPUS,,,K19,36205002341,,28/04/2005,12/5/2024,FALSE,,,,,,,,https://www.facebook.com/bng.216/,,,,,,
CSG15139,Lê Nguyễn Anh Khang,SE192089,337684208,,,Anhkhang4925@gmail.com,CSG - HCM CAMPUS,,,K19,79205045530,,4/9/2005,12/5/2024,FALSE,,,,,,,,https://www.facebook.com/ngnangdangkhoa,,,,,,
CSG15140,Võ Lâm Sơn,SE170119,344879768,,,sonvlse170119@fpt.edu.vn,CSG - HCM CAMPUS,,,K17,66203000276,,11/9/2003,12/5/2024,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100032754761623,,,,,,
CSG15141,Nguyễn Ngọc Phương Uyên,SE182058,944715758,,,uyennnpse182058@fpt.edu.vn,CSG - HCM CAMPUS,,,K18,352716851,,11/10/2004,12/5/2024,FALSE,,,,,,,,https://www.facebook.com/Demcember.04.Mean?mibextid=LQQJ4d,,,,,,
CSG15142,Nguyễn Cao Bảo Ngọc,SS196283,934926835,,,celinenc21@gmail.com,CSG - HCM CAMPUS,,,K19,45003962,,21/06/2005,12/5/2024,FALSE,,,,,,,,https://www.facebook.com/minhh.le.0934?mibextid=LQQJ4d,,,,,,
CSG15143,Nguyễn Năng Đăng Khoa,SE193915,764056614,,,ngnangdangkhoa@gmail.com,CSG - HCM CAMPUS,,,K19,79205016589,,8/9/2005,12/5/2024,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100014049125081&mibextid=LQQJ4d,,,,,,
CSG15145,Phạm Quốc Minh,SS194362,835149938,,,quocminhvt0501@gmail.com,CSG - HCM CAMPUS,,,K19,38204001018,,5/1/2004,12/5/2024,FALSE,,,,,,,,https://www.facebook.com/minhletan13102006?mibextid=ZbWKwL,,,,,,
CSG15149,Nguyễn Hồ Thành Nghĩa,SS180867,919006314,,,Nghianhtss180867@fpt.edu.vn,CSG - HCM CAMPUS,,,K18,64204008259,,4/12/2004,24/09/2024,FALSE,,,,,,,,https://www.facebook.com/theauraisanh,,,,,,
CSG15152,Lê Quang Nhật Minh,SS200035,782863390,,,lequangnhatminh1111@gmail.com,CSG - HCM CAMPUS,,,K20,48206002559,,4/3/2006,21/10/2024,FALSE,,,,,,,,https://www.facebook.com/share/1HW5xXcMpw/?mibextid=LQQJ4d,,,,,,
CSG15153,Huỳnh Thảo Duyên,SS201061,383721264,,,thaoduyen3006@gmail.com,CSG - HCM CAMPUS,,,K20,54306006906,,30/06/2006,21/10/2024,FALSE,,,,,,,,https://www.facebook.com/share/1Dcme69SZK/?mibextid=LQQJ4d,,,,,,
CSG15154,Lê Tấn Minh,SS200025,869925462,,,emaildisappeared@gmail.com,CSG - HCM CAMPUS,,,K20,45206000240,,13/10/2006,21/10/2024,FALSE,,,,,,,,https://www.facebook.com/lengg262/,,,,,,
CSG15155,Phạm Ngọc Tú Anh,SS201627,328148084,,,tuanh16122006@gmail.com,CSG - HCM CAMPUS,,,K20,83306007600,,16/12/2006,21/10/2024,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=61555763116731,,,,,,
CSG15158,Lương Huỳnh Nhân Đức Tài,SE190328,942825625,,,senpatai1234@gmail.com,CSG - HCM CAMPUS,,,K19,87205017963,,15/11/2005,21/10/2024,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100026669049235,,,,,,
CSG15159,Võ Thanh Trúc,SS203166,911675342,,,chucchuc1358@gmail.com,CSG - HCM CAMPUS,,,K20,75306013662,,8/8/2006,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100066865058883&mibextid=ZbWKwL,,,,,,
CSG15160,Nguyễn Thị Lan Anh,SE200005,372723051,,,ntla2k6@gmail.com,CSG - HCM CAMPUS,,,K20,44306001200,,26/02/2006,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/share/15L9zFyGCk/?mibextid=LQQJ4d,,,,,,
CSG15161,Nguyễn Mẫn Tuấn Anh,SE201163,359551025,,,nguyenmantuananh2006@gmail.com,CSG - HCM CAMPUS,VHD Media,,K20,64206002155,,19/11/2006,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/hieu.thao.2208?mibextid=LQQJ4d&mibextid=LQQJ4d,,,,,,
CSG15162,Trần Thị Tâm,SS200101,977523103,,,trantamss200101@gmail.com,CSG - HCM CAMPUS,Leader Content,,K20,49306008851,,22/11/2006,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/hokhanhngan.06/,,,,,,
CSG15163,Đỗ Thị Hồng Thắm,SS200488,919373174,,,orangee601@gmail.com,CSG - HCM CAMPUS,,,K20,94306000950,,12/4/2006,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/share/15YBdx4DU9/?mibextid=LQQJ4d,,,,,,
CSG15167,Hà Việt Dũng,SS205295,902117081,,,hadung7682@gmail.com,CSG - HCM CAMPUS,,,K20,34206008065,,31/10/2006,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/share/gDUqpx947MveTzrq/?mibextid=LQQJ4d,,,,,,
CSG15169,Trần Hiếu Thảo,SS201117,854550206,,,hieuthao2826@gmail.com,CSG - HCM CAMPUS,,,K20,54306008827,,22/08/2006,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/share/18LwtJughr/?mibextid=LQQJ4d,,,,,,
CSG15170,Hồ Khánh Ngân,SS204265,374073609,,,tiffanyho120706@gmail.com,CSG - HCM CAMPUS,VP ER,,K20,79306004071,,12/7/2006,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/share/15gTtStB1A/?mibextid=LQQJ4d,,,,,,
CSG15174,Đoàn Quỳnh Như,SS204182,862021341,,,dqn15206@gmail.com,CSG - HCM CAMPUS,,,K20,75306004452,,15/02/2006,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/share/1Dzh7fLDff/?mibextid=LQQJ4d,,,,,,
CSG15175,Lê Trần Gia Bảo,SE204403,965090531,,,giabap16082006@gmail.com,CSG - HCM CAMPUS,,,K20,79206043191,,16/08/2006,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100025989157910&sk=about,,,,,,
CSG15176,Nguyễn Trần Quỳnh Nghi,SS201112,908609133,,,nguyentranquynhnghi2006@gmail.com,CSG - HCM CAMPUS,,,K20,79306044380,,21/02/2006,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/hades.missuki?mibextid=ZbWKwL,,,,,,
CSG15177,Lê Thành Đạt,SS203875,387295944,,,lethanhdat13426@gmail.com,CSG - HCM CAMPUS,Leader Event,,K20,74206003108,,13/04/2006,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/share/U9rJMhtHoLrCw3Mg/,,,,,,
CSG15178,Võ Quốc Thành,SS201773,934824392,,,whaleruby144@gmail.com,CSG - HCM CAMPUS,,,K20,60206004946,,16/09/2006,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100059712764679&mibextid=ZbWKwL,,,,,,
CSG15179,Nguyễn Phương Thảo,SS203154,393369388,,,balblabla090524@gmail.com,CSG - HCM CAMPUS,,,K20,1304041804,,9/5/2004,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/share/15MeNkmAKE/?mibextid=LQQJ4d,,,,,,
CSG15180,Võ Hà Khánh Duy,SE203010,934906265,,,vohakhanhduy19062005@gmail.com,CSG - HCM CAMPUS,,,K20,80205004566,,19/06/2005,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/NhatCVO,,,,,,
CSG15183,Đạo Lương Hoàng Vũ,SE201815,934338467,,,vuh595377@gmail.com,CSG - HCM CAMPUS,,,K20,58206000846,,22/05/2006,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100043046761431&mibextid=ZbWKwL,,,,,,
CSG15185,Nguyễn Thị Thảo Nhi,SS200095,917584082,,,Nhithao10012013@gmail.com,CSG - HCM CAMPUS,,,K20,49306001115,,10/8/2006,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/ramboz2n,,,,,,
CSG15186,Nguyễn Thị Ngọc Diễm,SS200016,335271419,,,vohakhanhduy19062005@gmail.com,CSG - HCM CAMPUS,,,K20,49306010530,,17/01/2006,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/nthanhsonn.sonn?mibextid=ZbWKwLhttps://www.facebook.com/nthanhsonn.sonn?mibextid=ZbWKwL,,,,,,
CSG15187,Võ Thanh Nhật,SS200054,933646697,,,tnhattt5936@gmail.com,CSG - HCM CAMPUS,,,K20,49206007454,,3/6/2006,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100036945440016&mibextid=ZbWKwL,,,,,,
CSG15188,Trần Hữu Bằng,SS203615,767957401,,,tranhuubang02092006@gmail.com,CSG - HCM CAMPUS,,,K20,792060634788,,2/9/2006,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/lpnhuan/,,,,,,
CSG15189,Nguyễn Quang Thái,SE205147,931173982,,,nguyenthaiabc1@gmail.com,CSG - HCM CAMPUS,,,K20,87206009481,,26/03/2006,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/nmthuuuw.thuwu?mibextid=ZbWKwL,,,,,,
CSG15193,Nguyễn Thanh Sơn,SS203614,961876068,,,nguyenthanhsonn006@gmail.com,CSG - HCM CAMPUS,,,K20,49206005430,,19/08/2006,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/tinn.lehoang,,,,,,
CSG15195,Trương Nhật Nam,SE205213,931413466,,,namnhattruong412@gmail.com,CSG - HCM CAMPUS,,,K20,77306002473,,4/12/2006,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/hienhuy.hienhuy.18/,,,,,,
CSG15196,Lương Phạm Như An,SS204978,981362340,,,luongphamnhuan181@gmail.com,CSG - HCM CAMPUS,,,K20,77306009631,,18/11/2006,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/share/HHwqqLEvXMnzYREX/?mibextid=LQQJ4d,,,,,,
CSG15197,Nguyễn Minh Thư,SS203356,819598640,,,nmthuuuw@gmail.com,CSG - HCM CAMPUS,,,K20,79306040632,,7/5/2006,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100035474942548&mibextid=ZbWKwL,,,,,,
CSG15198,Võ Duy Tiến,SS205276,823355739,,,voduytyen@gmail.com,CSG - HCM CAMPUS,,,K20,80206000883,,13/09/2006,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/thvland.180206,,,,,,
CSG15202,Vũ Ngọc Hiển,SE192123,389414659,,,hynxnieh0919@gmail.com,CSG - HCM CAMPUS,,,K19,79205017696,,30/09/2005,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100025583282209,,,,,,
CSG15204,Nguyễn Thị Huyền Trâm,SS190927,812357676,,,huyentramnguyen0610@gmail.com,CSG - HCM CAMPUS,,,K19,70305005101,,6/10/2005,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/phuongthao.buithi.756?mibextid=LQQJ4d,,,,,,
CSG15205,Nguyễn Ngọc Hoàng Châu,SS201114,976709468,,,chau040106@gmail.com,CSG - HCM CAMPUS,,,K20,56306008208,,4/1/2006,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/callmebrianqn/,,,,,,
CSG15206,Đặng Võ Thanh Hiếu,SE201011,335123001,,,vohius.06@gmail.com,OTHER,,,K20,54206009381,,18/02/2006,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100022627332624,,,,,,
CSG15210,Nguyễn Thị Thanh Diệu,SS200995,932499575,,,dieuntt1402@gmail.com,CSG - HCM CAMPUS,,,K20,64306000667,,14/02/2006,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/noirtran1310,,,,,,
CSG15211,Bùi Thị Phương Thảo,SS200100,906159010,,,Galaxy30.5.2005@gmail.com,CSG - HCM CAMPUS,,,K20,46305004504,,30/05/2005,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=100057108313423,,,,,,
CSG15214,Lê Bảo Châu,SS201055,939083247,,,baochaulb0601@gmail.com,CSG - HCM CAMPUS,,,K20,64206011439,,6/1/2006,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/share/1BkC1zZVHu/,,,,,,
CSG15215,Lê Thùy Linh,38304018707,774576945,,,le387610@gmail.com,CSG - HCM CAMPUS,,,,38304018707,,15/08/2004,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/share/1F1rvtLxar/?mibextid=LQQJ4d,,,,,,
CSG15216,Trần Hưng Phú,SS201445,902202953,,,Tranhungphu06s@gmail.com,CSG - HCM CAMPUS,,,K20,66206006910,,13/10/2006,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/share/15HdR6W9H1/?mibextid=LQQJ4d,,,,,,
CSG15217,Vũ Mai Anh,Ss200919,967528124,,,vumaianh0211@gmail.com,CSG - HCM CAMPUS,,,K20,36306006698,,2/11/2006,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/wayn1e,,,,,,
CSG15218,Cao Thế Hào,SE200788,339018182,,,thehaotracu@gmail.com,CSG - HCM CAMPUS,,,K20,84206008123,,21/06/2006,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/share/14s6m4rRqd/?mibextid=kFxxJD,,,,,,
CSG15222,Đặng Nguyệt Nhi,SS201065,378201613,,,Nguyetnhi1410dang@gmail.com,CSG - HCM CAMPUS,,,K20,52306009053,,14/10/2006,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/share/17edrENiWg/?mibextid=LQQJ4d,,,,,,
CSG15223,Dương Hữu Nghĩa,SS204284,769129019,,,tan01693436536@gmail.com,CSG - HCM CAMPUS,,,K20,77206008463,,8/11/2006,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/nojamvic/,,,,,,
CSG15224,Nguyễn Nhật Quang,SS200661,915138890,,,waynenguyn@gmail.com,CSG - HCM CAMPUS,,,K20,38206032996,,8/11/2006,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/share/15gMCANFua/?mibextid=wwXIfr,,,,,,
CSG15225,Lê Thành An,SS201658,794511303,,,thanhanle1109@gmail.com,CSG - HCM CAMPUS,,,K20,68206011180,,11/9/2006,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/share/1Ci1iawY6t/?mibextid=wwXIfr,,,,,,
CSG15227,Phan Nguyễn Khiết Trân,SS201489,866815099,,,Khiettran136@gmail.com,CSG - HCM CAMPUS,,,K20,68306003402,,13/06/2006,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/share/1FuSMgtns7/?mibextid=wwXIfr,,,,,,
CSG15229,Nguyễn Bùi Khải Hoàn,SS194350,392144600,,,khaihoansmia@gmail.com,CSG - HCM CAMPUS,,,K19,79305041132,,17/01/2005,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/tbuii23.09,,,,,,
CSG15233,Dương Anh Minh,SS201100,799417406,,,duongaminh27@gmail.com,CSG - HCM CAMPUS,VHD Event,,K20,52206009202,,27/07/2006,7/12/2024,FALSE,,,,,,,,https://www.facebook.com/dungz.le.121,,,,,,
CSG15236,Trương Đức Huy,SE210895,345456845,,,truongduchuy80@gmail.com,CSG - HCM CAMPUS,,,K21,72207008855,,4/5/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/1Bua2BTDyk/?mibextid=wwXIfr,,,,,,
CSG15237,Đinh Văn Dũng,SS210008,984499545,,,dinh63962@gmail.com,CSG - HCM CAMPUS,,,K21,37207008440,,27/12/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/1G1tAQUVhp/?mibextid=wwXIfr,,,,,,
CSG15239,Bùi Lê Thiên Thanh,SS210002,984980036,,,thanhlebui2309@gmail.com,CSG - HCM CAMPUS,,,K21,74306001712,,23/09/2006,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/1DPFSEoPiy/?mibextid=wwXIfr,,,,,,
CSG15240,Lê Anh Dũng,SE201177,907000664,,,dungzle0308@gmail.com,CSG - HCM CAMPUS,,,K20,52206011671,,3/8/2006,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/1BoyLwCSmF/?mibextid=wwXIfr,,,,,,
CSG15241,Đỗ Hoàn Thiện,SS210590,356416860,,,dohoanthiencv54@gmail.com,CSG - HCM CAMPUS,,,K21,79307040613,,5/4/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/14QvBkyT2Ew/?mibextid=wwXIfr,,,,,,
CSG15242,Vũ Anh Đức,SS210566,983743062,,,vanquy3114@gmail.com,CSG - HCM CAMPUS,,,K21,38207000098,,5/2/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/15LTbxGjAuj/?mibextid=wwXIfr,,,,,,
CSG15243,Mai Tuyết Ngọc,SE210787,344326109,,,maituyetngoc123@gmail.com,CSG - HCM CAMPUS,,,K21,64307012796,,23/06/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/1FWu3nWuhC/?mibextid=wwXIfr,,,,,,
CSG15244,Lê Hoàng Khiêm,SE211671,386845578,,,lehoangkhiem007@gmail.com,CSG - HCM CAMPUS,,,K21,79207034419,,12/11/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/1Cvb5MR4ZS/?mibextid=wwXIfr,,,,,,
CSG15245,Huỳnh Quốc Bảo,SE182586,859179979,,,quocb2538@gmail.com,CSG - HCM CAMPUS,,,K18,79204027570,,11/11/2004,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/mai.truong.giang.266798,,,,,,
CSG15246,Trần Như Gia Huy,SE210232,784804333,,,trannhugiahuy1234@gmail.com,CSG - HCM CAMPUS,,,K21,68207004512,,18/05/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/17Nh19AKoW/?mibextid=wwXIfr,,,,,,
CSG15247,Huỳnh Trung Tú,SS210321,903071854,,,huynhtrungtu2007@gmail.com,CSG - HCM CAMPUS,,,K21,52207013054,,7/1/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/17etdVvo8U/?mibextid=wwXIfr,,,,,,
CSG15248,Nguyễn Gia Nguyên,SE210691,378980575,,,nguyen18652@gmail.com,CSG - HCM CAMPUS,,,K21,79207012506,,7/5/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/1Ghp3H8zJj/?mibextid=wwXIfr,,,,,,
CSG15249,Mai Trường Giang,SS210058,979896730,,,maitruonggiang25022007@gmail.com,CSG - HCM CAMPUS,,,K21,66207016609,,25/02/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/1GQKAmLGqJ/,,,,,,
CSG15250,Hồ Thị Quỳnh Thy,SS210509,914371669,,,htqt163@gmail.com,CSG - HCM CAMPUS,,,K21,70307000091,,16/03/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/nguyen.nguyen.8594/,,,,,,
CSG15251,Hoàng khánh long,SS210181,862940975,,,hoangkhanhlong13112007@gmail.com,CSG - HCM CAMPUS,,,K21,79207021969,,13/11/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/1Bads153pL/?mibextid=wwXIfr,,,,,,
CSG15252,Lâm Hồng Hiếu,SE211810,837211007,,,hieuuhongg@gmail.com,CSG - HCM CAMPUS,,,K21,89207021009,,2/3/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/1aKFdq8tcx/?mibextid=wwXIfr,,,,,,
CSG15253,Hoàng Quỳnh Anh,Ss210572,704557223,,,quynhanhfairytail@gmail.com,CSG - HCM CAMPUS,,,K21,75307002028,,7/4/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/profile.php?id=61574800784819&mibextid=wwXIfr&rdid=lovC20HylJTbaxwR&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F17SeW8vdvr%2F%3Fmibextid%3DwwXIfr,,,,,,
CSG15255,Nguyễn Nguyễn,SE190335,798362247,,,nguyennguyenlqdtpcl@gmail.com,CSG - HCM CAMPUS,,,K19,87205015490,,8/4/2005,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/19mKgdPg44/,,,,,,
CSG15256,Phùng Nguyễn Phương Thảo,SS192877,348016252,,,hariesthaophung283@gmail.com,CSG - HCM CAMPUS,,,K19,1305014369,,28/03/2005,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/tran.duy.anh.459154,,,,,,
CSG15257,Phạm Nguyễn Hồng Phúc,SS210506,981161671,,,phucpham2348@gmail.com,CSG - HCM CAMPUS,,,K21,45307008405,,21/10/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/17F2mTALGJ/?mibextid=wwXIfr,,,,,,
CSG15258,Trần Nam Phương Vy,SS210171,978280880,,,vytran.051207@gmail.com,CSG - HCM CAMPUS,,,K21,75307012699,,5/12/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/1JsohCmPsj/,,,,,,
CSG15259,Trần Thị Hồng Ánh,SS210055,918070140,,,trananh28110725@gmail.com,CSG - HCM CAMPUS,,,K21,68307003466,,17/01/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/1Aig9PCuRp/?mibextid=wwXIfr,,,,,,
CSG15260,Trần Duy Anh,SE190675,899444953,,,duyanht876@gmail.com,CSG - HCM CAMPUS,,,K19,70205005462,,15/10/2005,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/1BUr5rkJoT/,,,,,,
CSG15261,Nguyễn Tuấn Thành,SS210167,794599623,,,tuanthanh011207@gmail.com,CSG - HCM CAMPUS,,,K21,79207035937,,1/12/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/19oTY6N1VC/?mibextid=wwXIfr,,,,,,
CSG15262,Trần Anh Quân,SE205161,838375166,,,anhquan6603@gmail.com,CSG - HCM CAMPUS,,,K20,79206004053,,22/04/2006,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/19rHktioaG/?mibextid=wwXIfr,,,,,,
CSG15263,Đặng Ngọc Ánh,SS200590,869144807,,,daganh06@gmail.com,CSG - HCM CAMPUS,,,K20,89306006594,,16/02/2006,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/nguyen.huyhieu.336?locale=vi_VN,,,,,,
CSG15264,Phạm Thanh Thiên Tuyền,Se211793,931892301,,,thientuyenvbc@gmail.com,CSG - HCM CAMPUS,,,K21,75207017526,,19/11/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/1ADStCYTJF/?mibextid=wwXIfr,,,,,,
CSG15265,Hồ Minh Huy,SE210455,943977897,,,h2huy000@gmail.com,CSG - HCM CAMPUS,,,K21,56207010923,,30/12/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/ng.trongtai06,,,,,,
CSG15266,Nguyễn Thị Bích My,ss210093,844662066,,,my894701@gmail.com,OTHER,,,K21,,,18/08/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/1CwJTfzkN9/?mibextid=wwXIfr,,,,,,
CSG15267,Nguyễn Huy Hiệu,SE212021,388112341,,,nguyenhuyhieu3003@gmail.com,OTHER,,,K21,,,30/03/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/nguyen.quynh.mai.111050?mibextid=wwXIfr&mibextid=wwXIfr,,,,,,
CSG15268,Nguyễn Tường Anh,SS210134,886724718,,,tuongganhh0210@gmail.com,CSG - HCM CAMPUS,,,K21,79307036320,,2/10/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/1K4os2bEN1/?mibextid=wwXIfr,,,,,,
CSG15270,Nguyễn Trọng Tài,SE211965,374668247,,,trtainguyen2306@gmail.com,CSG - HCM CAMPUS,,,K21,60206002843,,20/03/2006,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/1a61qvf9na/,,,,,,
CSG15271,Phạm Thị Mỹ Linh,PS48255,345693664,,,mylinhvyhoa@gmail.com,CSG - HCM CAMPUS,,,,60306010173,,28/08/2006,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/1aGTALbnNh/?mibextid=wwXIfr,,,,,,
CSG15272,Nguyễn Quỳnh Mai,D25DS095,388559729,,,nguyenquynhmai263@gmail.com,CSG - HCM CAMPUS,,,,44307008602,,26/03/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/1BqXJ84rmd/?mibextid=wwXIfr,,,,,,
CSG15273,Trần Nguyễn Quế Linh,SS210635,782267843,,,trannguyenquelinh@gmail.com,CSG - HCM CAMPUS,,,K21,92307008107,,28/08/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/le.quynh.huong.600808?locale=vi_VN,,,,,,
CSG15274,Hoàng Thị Thanh Hà,SS210088,961188455,,,thanhhahoang09112007@gmail.com,CSG - HCM CAMPUS,,,K21,77307002365,,9/11/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/17dfTcq2Pt/?mibextid=wwXIfr,,,,,,
CSG15275,Ngô Minh Tiến Đạt,SE210616,948526674,,,ngo68456@gmail.com,OTHER,,,K21,,,15/10/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/1bBFjmp53T/?mibextid=wwXIfr,,,,,,
CSG15276,Nguyễn Thái Toàn,SE211402,907587594,,,thaitoan1152000@gmail.com,CSG - HCM CAMPUS,,,K21,86207009861,,11/5/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/17pndr6Heh/,,,,,,
CSG15277,Lê Quỳnh Hương,SS210351,393410318,,,lqhuong0816@gmail.com,CSG - HCM CAMPUS,,,K21,79307039195,,8/4/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/1BobVt2FW3/?mibextid=wwXIfr,,,,,,
CSG15278,Phạm Quỳnh Anh,SS204430,793476949,,,anniedayna927.official@gmail.com,CSG - HCM CAMPUS,,,K20,79306006487,,27/09/2006,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/1AV3bhCFhh/?mibextid=wwXIfr,,,,,,
CSG15279,Nguyễn Ngọc Vy,DH09251669,931045110,,,xingmicute@gmail.com,CSG - HCM CAMPUS,,,,89307000275,,12/1/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/tram.bui.597697,,,,,,
CSG15280,Phạm Huỳnh Anh,SS210197,989644455,,,huynhanh100507@gmail.com,CSG - HCM CAMPUS,,,K21,,,10/5/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/btrtrw/,,,,,,
CSG15281,Hồ Thanh Trọng,SE211305,359387806,,,trongho2k7@gmail.com,CSG - HCM CAMPUS,,,K21,51207011080,,20/02/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/17Qg1LuK9M/?mibextid=wwXIfr,,,,,,
CSG15282,Dương Cát Tiên,SS181410,845466986,,,tiendcss181410@fpt.edu.vn,CSG - HCM CAMPUS,,,K18,79304031319,,7/4/2004,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/15MxJTV8bMb/?mibextid=wwXIfr,,,,,,
CSG15283,Bùi Trần Ngọc Trâm,SS210187,333489175,,,ngoctramnt1608@gmail.com,CSG - HCM CAMPUS,,,K21,79307037156,,16/08/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/le.hai.ang.75659,,,,,,
CSG15284,Trương Nguyễn Bảo Trân,SS210179,913343449,,,baotran090607@gmail.com,CSG - HCM CAMPUS,,,K21,64307005839,,9/6/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/quynh.huong.898964,,,,,,
CSG15285,Nguyễn Võ Nhật Minh,SS210182,971170272,,,nguyennmin722@gmail.com,CSG - HCM CAMPUS,,,K21,79307031313,,26/12/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/1KfuvkaTnH/?mibextid=wwXIfr,,,,,,
CSG15286,Đoàn Trung Hiếu,SE200063,336882802,,,doanhieu107206@gmail.com,CSG - HCM CAMPUS,,,K20,44206000277,,10/7/2006,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/YBaoV07?mibextid=ZbWKwL,,,,,,
CSG15287,Lê Hải Đăng,SS210553,867139892,,,led71984@gmail.com,CSG - HCM CAMPUS,,,K21,79207000065,,26/01/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/1PXd8muAMK/?mibextid=wwXIfr,,,,,,
CSG15288,Nguyễn Quỳnh Hương,SS210537,866742376,,,huongnqss210537@gmail.com,CSG - HCM CAMPUS,,,K21,74307001060,,16/08/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/1HLX3cmBca/?mibextid=wwXIfr,,,,,,
CSG15289,Võ Hoàng Kim Ngân,SS204527,867991424,,,vohoangkimngan782006@gmail.com,CSG - HCM CAMPUS,,,K20,75306005243,,7/8/2006,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/16HvTmXmFr/?mibextid=wwXIfr,,,,,,
CSG15290,Hồ Vũ Bảo,SS210158,854630072,,,baoygaming07@gmail.com,CSG - HCM CAMPUS,,,K21,60207000819,,8/2/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/1BYXbc3msY/?mibextid=wwXIfr,,,,,,
CSG15291,Phạm Thanh Thảo,SS210582,968852779,,,thanhthao020507@gmail.com,CSG - HCM CAMPUS,,,K21,77307006115,,2/5/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/1AXpiFknBn/?mibextid=wwXIfr,,,,,,
CSG15293,Lương Hà Minh Anh,SS210292,914354737,,,luongminhanh1211@gmail.com,CSG - HCM CAMPUS,,,K21,68307009893,,12/11/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/1BbY9XdcPm/?mibextid=wwXIfr,,,,,,
CSG15294,Đỗ Phương Thảo,SS210395,917444638,,,dophuongthao.020907@gmail.com,CSG - HCM CAMPUS,,,K21,72307008112,,2/9/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/phucdatbriannguyen/,,,,,,
CSG15295,Ngô Thị Ý Nhi,SS210001,978506367,,,thiynhingo@gmail.com,CSG - HCM CAMPUS,,,K21,31307013604,,9/8/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/ynhixinhh,,,,,,
CSG15296,Nguyễn Mai Ngọc Vy,SS210274,961731975,,,ngocvysoc1509@gmail.com,CSG - HCM CAMPUS,,,K21,68307005528,,15/09/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/1ErWKTXcGo/?mibextid=wwXIfr,,,,,,
CSG15297,Võ Thuỵ Phương Hà,SS210638,948470962,,,phuonghavo8@gmail.com,CSG - HCM CAMPUS,,,K21,79307032980,,5/5/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/evnsc.knna,,,,,,
CSG15298,Nguyễn Phúc Đạt,SS203668,344836064,,,phucdatnguyen.261@gmail.com,CSG - HCM CAMPUS,,,K20,89206010297,,26/01/2006,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/1CaexPFRkx/?mibextid=wwXIfr,,,,,,
CSG15299,Hoàng Thị Yến Nhi,SS210140,944209506,,,nhi300107@gmail.com,CSG - HCM CAMPUS,,,K21,1307000038,,30/01/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/le.truong.339583/,,,,,,
CSG15300,Phạm Hải Yến,SS204475,961229450,,,haiin260606@gmail.com,CSG - HCM CAMPUS,,,K20,75306017295,,26/06/2006,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/1FLWsKddXy/?mibextid=wwXIfr,,,,,,
CSG15301,Tạ Anh Đức,SE201404,345583750,,,taanhduc15126@gmail.com,CSG - HCM CAMPUS,,,K20,68206006633,,15/01/2006,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/1CvTqiurDQ/?mibextid=wwXIfr,,,,,,
CSG15302,Nguyễn Thị Hà Ân,SS210025,799968296,,,nguyenthihaan4@gmail.com,CSG - HCM CAMPUS,,,K21,51307011533,,3/3/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/1FJKZwTms7/?mibextid=wwXIfr,,,,,,
CSG15303,Lê Huỳnh Trường,SS210062,857503331,,,truongtd324@gmail.com,CSG - HCM CAMPUS,,,K21,79207040909,,12/9/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/thien.an.143753,,,,,,
CSG15304,Võ Vy Thanh,SS210529,398360130,,,thanhvovy56@gmail.com,CSG - HCM CAMPUS,,,K21,77307006680,,27/05/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/Vaie1510,,,,,,
CSG15305,Trần Ngọc Hân Du,SS203164,364043671,,,tnhandu@gmail.com,CSG - HCM CAMPUS,,,K20,79306014538,,3/10/2006,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/17nmRaFnjN/,,,,,,
CSG15306,Phạm Nguyễn Bảo Ngọc,SS210450,358175571,,,baongoc.2007dt@gmail.com,CSG - HCM CAMPUS,,,K21,74307000814,,31/03/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/tbraknugo41/,,,,,,
CSG15307,Nguyễn Phúc Thiên Ân,SE210038,,,,thienan.260504@gmail.com,CSG - HCM CAMPUS,,,K21,75204003683,,26/05/2004,9/12/2025,FALSE,,,,,,,,,,,,,,
CSG15309,Nguyễn Ái Tường Vân,SS210226,913888567,,,nguynaituongvan1510@gmail.com,CSG - HCM CAMPUS,,,K21,79307020071,,15/10/2007,9/12/2025,FALSE,,,,,,,,https://www.facebook.com/share/1G77H2zJBY/?mibextid=wwXIfr,,,,,,
CSG15310,Nguyễn Thị Thu Trang,SS210269,,,,trang181807@gmail.com,CSG - HCM CAMPUS,,,K21,,,1/8/2007,16/12/2025,FALSE,,,,,,,,,,,,,,
CSG15311,Lê Ngọc Trang,SS210434,,,,lngoctrang52@gmail.com,CSG - HCM CAMPUS,,,K21,,,28/01/2007,16/12/2025,FALSE,,,,,,,,,,,,,,
CSG15312,Dương Trí Dũng,SE201475,,,,dungduog0@gmail.com,CSG - HCM CAMPUS,,,K20,,,,16/12/2025,FALSE,,,,,,,,,,,,,,
CSG15313,Nguyễn Minh Tuấn,SS210479,,,,nmtuan.ceo@gmail.com,CSG - HCM CAMPUS,,,K21,,,18/09/2007,16/12/2025,FALSE,,,,,,,,,,,,,,`;

function parseCsvLine(line) {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
            if (inQuotes && line[i + 1] === '"') {
                cur += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (c === ',' && !inQuotes) {
            result.push(cur.trim());
            cur = '';
        } else {
            cur += c;
        }
    }
    result.push(cur.trim());
    return result;
}

function parseDate(dStr) {
    if (!dStr) return null;
    dStr = dStr.trim();
    if (!dStr) return null;
    
    const slashParts = dStr.split('/');
    if (slashParts.length === 3) {
        let day = parseInt(slashParts[0], 10);
        let month = parseInt(slashParts[1], 10);
        let year = parseInt(slashParts[2], 10);
        if (year < 100) year += 2000;
        const mm = month < 10 ? '0' + month : '' + month;
        const dd = day < 10 ? '0' + day : '' + day;
        return `${year}-${mm}-${dd}`;
    }
    
    if (/^\d{4}-\d{2}-\d{2}$/.test(dStr)) return dStr;
    return dStr;
}

function formatPhone(p) {
    if (!p) return null;
    p = p.trim().replace(/\s+/g, '');
    if (!p) return null;
    if (/^\d{9}$/.test(p)) {
        return '0' + p;
    }
    return p;
}

function formatCccd(c) {
    if (!c) return null;
    c = c.trim();
    if (!c) return null;
    if (/^\d{11}$/.test(c)) {
        return '0' + c;
    }
    return c;
}

const lines = rawCsv.trim().split('\n').map(l => l.trim()).filter(Boolean);
const headers = parseCsvLine(lines[0]);

const rows = [];
for (let i = 1; i < lines.length; i++) {
    const vals = parseCsvLine(lines[i]);
    const obj = {};
    headers.forEach((h, idx) => {
        obj[h] = vals[idx] !== undefined ? vals[idx] : '';
    });
    rows.push(obj);
}

const sqlStatements = [];
sqlStatements.push(`-- ==============================================================================`);
sqlStatements.push(`-- Script Import Danh Sách Thành Viên Vào Bảng public.members`);
sqlStatements.push(`-- Tổng số: ${rows.length} thành viên`);
sqlStatements.push(`-- ==============================================================================\n`);

sqlStatements.push(`-- Bổ sung cột mssv và note nếu chưa có`);
sqlStatements.push(`ALTER TABLE public.members ADD COLUMN IF NOT EXISTS mssv TEXT;`);
sqlStatements.push(`ALTER TABLE public.members ADD COLUMN IF NOT EXISTS note TEXT;\n`);

const insertValues = [];

for (const r of rows) {
    const id = r.id;
    const fullName = r.fullName;
    const mssv = r.mssv || null;
    const phone = formatPhone(r.phone);
    const emailFE = r.emailFE || null;
    const emailFPT = r.emailFPT || null;
    const gmail = r.gmail || null;
    const location = r.location || null;
    const position = r.position || null;
    const school = r.school || null;
    const generation = r.generation || null;
    const cccd = formatCccd(r.cccd);
    const mst = r.mst || null;
    const dob = parseDate(r.dob);
    const startDate = parseDate(r.startDate);
    const isAdmin = r.isAdmin?.toUpperCase() === 'TRUE';
    const isMaster = r.isMaster?.toUpperCase() === 'TRUE';
    const avatar = r.avatar || null;
    const note = r.note || null;
    const status = r.status || 'active';
    
    let accessHistory = '[]';
    if (r.accessHistory) {
        try {
            JSON.parse(r.accessHistory);
            accessHistory = r.accessHistory;
        } catch(e) {
            accessHistory = '[]';
        }
    }

    let tags = '[]';
    if (r.tags) {
        try {
            JSON.parse(r.tags);
            tags = r.tags;
        } catch(e) {
            tags = '[]';
        }
    }

    let projectRoles = '{}';
    if (r.projectRoles) {
        try {
            JSON.parse(r.projectRoles);
            projectRoles = r.projectRoles;
        } catch(e) {
            projectRoles = '{}';
        }
    }

    const facebook = r.facebook || null;
    const tiktok = r.tiktok || null;
    const bankName = r.bankName || null;
    const bankAccount = r.bankAccount || null;
    const bankAccountName = r.bankAccountName || null;
    const bankBranch = r.bankBranch || null;

    const escapeSql = (str) => {
        if (str === null || str === undefined) return 'NULL';
        return "'" + String(str).replace(/'/g, "''") + "'";
    };

    const valStr = `(
    ${escapeSql(id)},
    ${escapeSql(fullName)},
    ${escapeSql(mssv)},
    ${escapeSql(phone)},
    ${escapeSql(emailFE)},
    ${escapeSql(emailFPT)},
    ${escapeSql(gmail)},
    ${escapeSql(location)},
    ${escapeSql(position)},
    ${escapeSql(school)},
    ${escapeSql(generation)},
    ${escapeSql(cccd)},
    ${escapeSql(mst)},
    ${escapeSql(dob)},
    ${escapeSql(startDate)},
    ${isAdmin},
    ${isMaster},
    ${escapeSql(avatar)},
    ${escapeSql(note)},
    ${escapeSql(accessHistory)}::jsonb,
    ${escapeSql(tags)}::jsonb,
    ${escapeSql(projectRoles)}::jsonb,
    ${escapeSql(facebook)},
    ${escapeSql(tiktok)},
    ${escapeSql(bankName)},
    ${escapeSql(bankAccount)},
    ${escapeSql(bankAccountName)},
    ${escapeSql(bankBranch)},
    ${escapeSql(status)}
)`;
    insertValues.push(valStr);
}

const fullSql = `${sqlStatements.join('\n')}
INSERT INTO public.members (
    id,
    "fullName",
    mssv,
    phone,
    "emailFE",
    "emailFPT",
    gmail,
    location,
    position,
    school,
    generation,
    cccd,
    mst,
    dob,
    "startDate",
    "isAdmin",
    "isMaster",
    avatar,
    note,
    "accessHistory",
    tags,
    "projectRoles",
    facebook,
    tiktok,
    "bankName",
    "bankAccount",
    "bankAccountName",
    "bankBranch",
    status
)
VALUES
${insertValues.join(',\n')}
ON CONFLICT (id) DO UPDATE SET
    "fullName" = EXCLUDED."fullName",
    mssv = COALESCE(EXCLUDED.mssv, members.mssv),
    phone = COALESCE(EXCLUDED.phone, members.phone),
    "emailFE" = COALESCE(EXCLUDED."emailFE", members."emailFE"),
    "emailFPT" = COALESCE(EXCLUDED."emailFPT", members."emailFPT"),
    gmail = COALESCE(EXCLUDED.gmail, members.gmail),
    location = COALESCE(EXCLUDED.location, members.location),
    position = COALESCE(EXCLUDED.position, members.position),
    school = COALESCE(EXCLUDED.school, members.school),
    generation = COALESCE(EXCLUDED.generation, members.generation),
    cccd = COALESCE(EXCLUDED.cccd, members.cccd),
    mst = COALESCE(EXCLUDED.mst, members.mst),
    dob = COALESCE(EXCLUDED.dob, members.dob),
    "startDate" = COALESCE(EXCLUDED."startDate", members."startDate"),
    "isAdmin" = EXCLUDED."isAdmin",
    "isMaster" = EXCLUDED."isMaster",
    avatar = COALESCE(EXCLUDED.avatar, members.avatar),
    note = COALESCE(EXCLUDED.note, members.note),
    "accessHistory" = EXCLUDED."accessHistory",
    tags = EXCLUDED.tags,
    "projectRoles" = EXCLUDED."projectRoles",
    facebook = COALESCE(EXCLUDED.facebook, members.facebook),
    tiktok = COALESCE(EXCLUDED.tiktok, members.tiktok),
    "bankName" = COALESCE(EXCLUDED."bankName", members."bankName"),
    "bankAccount" = COALESCE(EXCLUDED."bankAccount", members."bankAccount"),
    "bankAccountName" = COALESCE(EXCLUDED."bankAccountName", members."bankAccountName"),
    "bankBranch" = COALESCE(EXCLUDED."bankBranch", members."bankBranch"),
    status = EXCLUDED.status;
`;

fs.writeFileSync('d:/PC/csg-tool/import_members.sql', fullSql, 'utf8');
console.log('Successfully generated import_members.sql');
